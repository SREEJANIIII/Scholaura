import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
// @ts-ignore
import { PDFParse } from 'pdf-parse';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// CORS headers for all incoming requests
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.options('*', (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// Generous limit for PDF base64 uploads and large research papers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Robust JSON extraction from Gemini responses handling potential code fences or preamble
function parseGeminiJson(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') return {};
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    console.warn('[Scholaura] Direct JSON parse failed, attempting regex extraction');
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw parseErr;
  }
}

// Helper to smart-truncate papers preserving Abstract/Intro + Results/Conclusion for fast <5s analysis
function getOptimalPaperContext(text: string, maxChars = 12000): string {
  if (!text || text.length <= maxChars) return text;
  const headChars = Math.floor(maxChars * 0.65); // ~7,800 chars of abstract, intro, method
  const tailChars = maxChars - headChars;         // ~4,200 chars of results, limitations, conclusion
  return `${text.slice(0, headChars)}\n\n[... Technical derivations omitted for focused analysis ...]\n\n${text.slice(-tailChars)}`;
}

// Server-side Gemini AI client initialization
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please verify your environment variables or Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const GEMINI_MODEL = 'gemini-3.8-flash';

// API Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Scholaura',
    hasKey: !!process.env.GEMINI_API_KEY,
    model: GEMINI_MODEL,
    time: new Date().toISOString(),
  });
});

// Document parsing endpoint for uploaded PDF and TXT files
app.post('/api/parse-document', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, fileBase64, textContent, fileType } = req.body;

    if (!filename) {
      res.status(400).json({ error: 'Filename is required' });
      return;
    }

    let extractedText = '';
    let pageCount = 1;
    let pageList: Array<{ pageNum: number; text: string }> = [];

    const isPdf = fileType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');

    if (isPdf && fileBase64) {
      const buffer = Buffer.from(fileBase64, 'base64');
      try {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText({
          pageJoiner: '\n\n--- [Page page_number of total_number] ---\n\n',
        });

        pageCount = result.total || 1;
        extractedText = result.text || '';

        if (result.pages && Array.isArray(result.pages)) {
          pageList = result.pages.map((p: any) => ({
            pageNum: p.num,
            text: p.text || '',
          }));
        }
      } catch (pdfErr: any) {
        console.warn('[PDF Parser] Fallback extraction for:', filename, pdfErr.message);
        const rawString = buffer.toString('latin1');
        const matches = rawString.match(/[A-Za-z0-9\s.,;:'"()\-–—]{10,}/g);
        extractedText = matches ? matches.slice(0, 400).join(' ') : 'Extracted text stream from PDF document.';
        pageCount = 1;
      }
    } else if (textContent) {
      extractedText = textContent;
      pageCount = Math.max(1, Math.ceil(extractedText.length / 3500));
      const chunks = extractedText.match(/[\s\S]{1,3500}/g) || [extractedText];
      pageList = chunks.map((chunk, idx) => ({
        pageNum: idx + 1,
        text: chunk,
      }));
    } else {
      res.status(400).json({ error: 'Either fileBase64 or textContent must be provided.' });
      return;
    }

    const cleanText = extractedText.trim();
    if (!cleanText) {
      res.status(422).json({ error: 'No readable text could be extracted from this file.' });
      return;
    }

    res.json({
      success: true,
      filename,
      pageCount,
      characterCount: cleanText.length,
      wordCount: cleanText.split(/\s+/).filter(Boolean).length,
      extractedText: cleanText,
      pageList,
    });
  } catch (err: any) {
    console.error('Error in /api/parse-document:', err);
    res.status(500).json({ error: err.message || 'Failed to parse research document' });
  }
});

// Feature 1: Research Topic Explorer
app.post('/api/explore-topic', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Research topic or query is required' });
      return;
    }

    const ai = getAiClient();

    const prompt = `You are a distinguished academic research advisor and literature strategist for Scholaura.
A researcher has provided the following topic or question:
"${topic.trim()}"

Conduct a structured multi-step analysis internally, and return a comprehensive, actionable research exploration plan in JSON format.

Few-shot reference format:
Input: Machine learning in healthcare
Output includes:
- Research Questions (e.g. "How can differential privacy be maintained in federated clinical predictive models?", "To what extent do transformer-based EHR models generalize across diverse demographic hospital cohorts?")
- Keywords & Boolean Search Strings (e.g. ("federated learning" OR "distributed ML") AND ("electronic health records" OR "EHR") AND ("differential privacy" OR "HIPAA"))
- Subtopics & Critical Dimensions (e.g. Algorithmic Bias, Model Interpretability/SHAP, Real-Time Inference Latency, Regulatory Compliance/FDA SaMD)
- 4-Phase Research Exploration Plan (Foundation, Methodological Comparison, Empirical Evaluation, Gap Synthesis)
- Benchmark Datasets & Venues (MIMIC-IV, eICU, CheXpert, Nature Medicine, NeurIPS ML4H)

Ensure all suggestions are academically sound, rigorous, and relevant to modern peer-reviewed scholarship.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are Scholaura Topic Explorer. Output strictly valid JSON matching the specified schema. Do not invent non-existent benchmarks or venues.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicSummary: {
              type: Type.STRING,
              description: 'Executive overview of the academic scope and contemporary significance of this topic.',
            },
            primaryResearchQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  difficultyLevel: { type: Type.STRING, description: 'Foundational | Advanced | Frontier' },
                },
              },
            },
            keywordsAndSearchQueries: {
              type: Type.OBJECT,
              properties: {
                primaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                booleanQueryGoogleScholar: { type: Type.STRING },
                booleanQueryArxivAcmIeee: { type: Type.STRING },
                meshOrDomainTaxonomyTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            subtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'Theoretical | Methodological | Empirical | Ethical' },
                  description: { type: Type.STRING },
                  openProblems: { type: Type.STRING },
                },
              },
            },
            explorationPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  title: { type: Type.STRING },
                  objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedMilestone: { type: Type.STRING },
                  estimatedTimeWeeks: { type: Type.STRING },
                },
              },
            },
            prominentDatabasesAndVenues: {
              type: Type.OBJECT,
              properties: {
                suggestedVenues: { type: Type.ARRAY, items: { type: Type.STRING } },
                benchmarkDatasets: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        },
      },
    });

    const parsedData = parseGeminiJson(response.text || '{}');
    res.json({ success: true, topic, result: parsedData });
  } catch (err: any) {
    console.error('Error in /api/explore-topic:', err);
    res.status(500).json({ error: err.message || 'Failed to explore research topic' });
  }
});

// Feature 2: Research Paper Analyzer
app.post('/api/analyze-paper', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const { filename, text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Paper text content is required for analysis' });
      return;
    }

    console.log(`[Scholaura Analyzer] Request received for: "${filename}" (${text.length} chars)`);

    const ai = getAiClient();
    const contextText = getOptimalPaperContext(text, 24000);

    const prompt = `You are a world-class academic peer reviewer and research analyst for Scholaura.
Examine the following research paper text carefully and produce an exhaustive, structured extraction.

CRITICAL INSTRUCTIONS:
- Analyze ONLY the provided paper text.
- NEVER invent or hallucinate citations, findings, metrics, or authors not present in the text.
- If a section (e.g. specific dataset or limitation) is not explicitly discussed, state: "Not explicitly documented in provided text".
- Keep evidence concise, factual, and anchored in the author's findings.

Follow this exact few-shot standard:
Example Input: Research paper about machine learning in healthcare.
Expected output structure:
- Objective: Identify the primary research problem and overarching hypothesis.
- Methodology: Explain the ML/statistical techniques, architectures, training parameters, and experimental setup used.
- Findings: Summarize quantitative results, performance benchmarks, and empirical conclusions.
- Limitations: Identify the study's weaknesses, sample constraints, and threats to validity.
- Research Gap: Suggest actionable, concrete directions for future research.

Paper Filename: "${filename || 'Untitled Document'}"
Paper Content:
"""
${contextText}
"""`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are Scholaura Paper Analyzer. Extract factual academic insights strictly grounded in the document text. Output valid JSON matching the schema.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            authors: { type: Type.ARRAY, items: { type: Type.STRING } },
            publicationYearOrDate: { type: Type.STRING },
            fieldOfStudy: { type: Type.STRING },
            abstractSummary: {
              type: Type.STRING,
              description: 'Concise executive summary of the paper in 3-4 clear sentences.',
            },
            objective: {
              type: Type.OBJECT,
              properties: {
                coreProblem: { type: Type.STRING },
                researchHypothesis: { type: Type.STRING },
                targetApplication: { type: Type.STRING },
              },
            },
            methodology: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                keyTechniques: { type: Type.ARRAY, items: { type: Type.STRING } },
                modelArchitectureOrFramework: { type: Type.STRING },
                experimentalSetupAndHardware: { type: Type.STRING },
                datasetsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                evaluationMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            findings: {
              type: Type.OBJECT,
              properties: {
                keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
                quantitativeResults: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      metric: { type: Type.STRING },
                      score: { type: Type.STRING },
                      baselineComparison: { type: Type.STRING },
                    },
                  },
                },
                practicalImplications: { type: Type.STRING },
              },
            },
            limitations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'Methodological | Data/Sample | Computational | Theoretical' },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'Low | Moderate | Critical' },
                },
              },
            },
            researchGapAndFutureWork: {
              type: Type.OBJECT,
              properties: {
                unaddressedGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedFutureResearch: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            groundedCitationsFound: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  citationText: { type: Type.STRING },
                  contextInPaper: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[Scholaura Analyzer] Analysis completed in ${duration}ms for "${filename}"`);

    const parsedData = parseGeminiJson(response.text || '{}');
    res.json({ success: true, filename, analysis: parsedData });
  } catch (err: any) {
    console.error('[Scholaura Analyzer] Error in /api/analyze-paper:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze research paper' });
  }
});

// Feature 3: Multi-Paper Comparison
app.post('/api/compare-papers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { papers } = req.body;
    if (!papers || !Array.isArray(papers) || papers.length < 2) {
      res.status(400).json({ error: 'Please provide at least two papers to compare.' });
      return;
    }

    const ai = getAiClient();

    const papersDigest = papers
      .map((p, idx) => {
        const textSample = getOptimalPaperContext(p.text || p.content || '', 12000);
        return `### Paper ${idx + 1}: "${p.title || p.filename || `Paper ${idx + 1}`}"
Content excerpt:
${textSample}
---`;
      })
      .join('\n\n');

    const prompt = `You are a senior meta-analyst and comparative research synthesizer for Scholaura.
Compare the following ${papers.length} academic research papers in depth.

CRITICAL INSTRUCTIONS:
- Base all comparisons strictly on the provided papers.
- Do NOT fabricate datasets, metrics, or methods.
- Compare them systematically across:
  1. Core Research Problem & Objectives
  2. Methodologies & Algorithmic / Experimental Techniques
  3. Datasets, Sample Sizes & Benchmarks
  4. Key Empirical Findings & Quantitative Performance
  5. Limitations & Vulnerabilities
  6. Unexplored Research Gaps
- Present a comparative matrix table structure in JSON, followed by a synthesis of consensus, divergence, tradeoffs, and cross-corpus opportunities.

Papers to Compare:
${papersDigest}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are Scholaura Multi-Paper Comparative Agent. Output strictly valid JSON matching the schema.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesisTitle: { type: Type.STRING },
            executiveOverview: { type: Type.STRING },
            comparisonDimensions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dimension: { type: Type.STRING, description: 'Objective | Methodology | Datasets | Findings | Limitations | Research Gap' },
                  paperValues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        paperId: { type: Type.STRING },
                        paperTitle: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        concreteEvidence: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
            },
            consensusAndConvergence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  description: { type: Type.STRING },
                  agreementLevel: { type: Type.STRING, description: 'Unanimous | Majority | Partial' },
                },
              },
            },
            divergentFindingsAndDebates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  disputePoint: { type: Type.STRING },
                  perspectiveA: { type: Type.STRING },
                  perspectiveB: { type: Type.STRING },
                  underlyingReason: { type: Type.STRING },
                },
              },
            },
            methodologicalTradeoffs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  approachA: { type: Type.STRING },
                  approachB: { type: Type.STRING },
                  tradeoffDescription: { type: Type.STRING },
                  recommendedContext: { type: Type.STRING },
                },
              },
            },
            consolidatedResearchGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gapTitle: { type: Type.STRING },
                  whyItRemainsOpen: { type: Type.STRING },
                  crossPollinationOpportunity: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsedData = parseGeminiJson(response.text || '{}');
    res.json({ success: true, count: papers.length, comparison: parsedData });
  } catch (err: any) {
    console.error('Error in /api/compare-papers:', err);
    res.status(500).json({ error: err.message || 'Failed to compare papers' });
  }
});

// Feature 4: Literature Review Generator
app.post('/api/literature-review', async (req: Request, res: Response): Promise<void> => {
  try {
    const { papers, topicFocus, reviewStyle } = req.body;
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      res.status(400).json({ error: 'At least one research paper is required to synthesize a literature review.' });
      return;
    }

    const ai = getAiClient();

    const corpus = papers
      .map((p, idx) => {
        const textSample = getOptimalPaperContext(p.text || p.content || '', 12000);
        return `### [Paper ${idx + 1}] Title: "${p.title || p.filename || `Paper ${idx + 1}`}"
Content:
${textSample}
---`;
      })
      .join('\n\n');

    const prompt = `You are an academic scholar and literature review author for top-tier journals.
Synthesize the provided ${papers.length} research papers into a comprehensive, publication-grade Literature Review for Scholaura.

TOPIC FOCUS: ${topicFocus ? `"${topicFocus}"` : 'Broad synthesis of the submitted corpus'}
SYNTHESIS STYLE: ${reviewStyle || 'thematic'} (thematic / methodological / chronological)

MANDATORY RULES:
- Identify common themes across the papers.
- Identify conflicting results or divergent methodologies.
- Uncover unexplored research gaps.
- Ground every claim with clear citations in square brackets citing the exact paper title, e.g. [Paper: Attention Is All You Need] or [He et al., ResNet].
- NEVER invent papers, author names, or statistics not present in the corpus.
- Provide a rigorous, structured academic literature review in JSON format.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are Scholaura Literature Review Synthesis Engine. Create an authoritative, publication-ready literature review strictly grounded in the submitted papers.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reviewTitle: { type: Type.STRING },
            abstractAndScope: { type: Type.STRING },
            primaryThemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  themeName: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  groundedSynthesis: { type: Type.STRING },
                  contributingPapers: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
            methodologicalEvolution: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                dominantParadigms: { type: Type.ARRAY, items: { type: Type.STRING } },
                experimentalStandards: { type: Type.STRING },
              },
            },
            conflictingResultsAndDebates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  controversy: { type: Type.STRING },
                  supportingEvidenceA: { type: Type.STRING },
                  supportingEvidenceB: { type: Type.STRING },
                  scholarlyImplication: { type: Type.STRING },
                },
              },
            },
            criticalResearchGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gapName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  significance: { type: Type.STRING },
                  potentialMethodologicalSolution: { type: Type.STRING },
                },
              },
            },
            futureResearchAgenda: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hypothesisOrQuestion: { type: Type.STRING },
                  proposedApproach: { type: Type.STRING },
                  expectedImpact: { type: Type.STRING },
                },
              },
            },
            groundedReferences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  paperTitle: { type: Type.STRING },
                  keyContributionToReview: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsedData = parseGeminiJson(response.text || '{}');
    res.json({ success: true, review: parsedData });
  } catch (err: any) {
    console.error('Error in /api/literature-review:', err);
    res.status(500).json({ error: err.message || 'Failed to generate literature review' });
  }
});

// Feature 5: Research Q&A
app.post('/api/research-qa', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, papers, chatHistory } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      res.status(400).json({ error: 'At least one paper is required to answer questions.' });
      return;
    }

    const ai = getAiClient();

    const corpusText = papers
      .map((p, idx) => {
        const textSample = getOptimalPaperContext(p.text || p.content || '', 14000);
        return `=== DOCUMENT [${idx + 1}]: "${p.title || p.filename || `Paper ${idx + 1}`}" ===
${textSample}
=== END OF DOCUMENT [${idx + 1}] ===`;
      })
      .join('\n\n');

    let historyContext = '';
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      historyContext = `PREVIOUS CONVERSATION CONTEXT:\n` +
        chatHistory
          .slice(-6)
          .map((m: any) => `${m.role === 'user' ? 'User' : 'Scholaura'}: ${m.content}`)
          .join('\n') +
        '\n\n';
    }

    const prompt = `${historyContext}RESEARCH CORPUS:
${corpusText}

USER RESEARCH QUESTION:
"${question.trim()}"

STRICT INSTRUCTIONS:
1. Answer the question using ONLY the provided document contents above.
2. If the answer cannot be found in the provided papers, explicitly state:
   "The provided papers do not contain sufficient evidence to answer this question."
3. NEVER invent citations, authors, page numbers, or research findings.
4. Include paper names and page references wherever available in the text (e.g. [Attention Is All You Need, p. 4] or [ResNet, p. 7]).
5. Highlight direct quotes or empirical evidence supporting your answer.
6. Return structured JSON with your answer, citations, confidence, and grounded excerpts.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are Scholaura Q&A Agent. You provide strictly grounded answers with exact paper and page citations. Never hallucinate.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: 'Clear, comprehensive, and grounded answer to the user question in Markdown format.',
            },
            evidenceFound: {
              type: Type.BOOLEAN,
              description: 'True if direct evidence was found in the papers; false if papers do not contain the answer.',
            },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  paperTitle: { type: Type.STRING },
                  pageOrSection: { type: Type.STRING },
                  quotedExcerpt: { type: Type.STRING },
                },
              },
            },
            confidenceLevel: {
              type: Type.STRING,
              description: 'High | Moderate | Low | Insufficient Data in Corpus',
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const parsedData = parseGeminiJson(response.text || '{}');
    res.json({ success: true, result: parsedData });
  } catch (err: any) {
    console.error('Error in /api/research-qa:', err);
    res.status(500).json({ error: err.message || 'Failed to process research Q&A query' });
  }
});

// Configure Vite middleware in development or static file serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev] Mounted Vite middleware to Express server');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Prod] Serving static files from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Scholaura Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
