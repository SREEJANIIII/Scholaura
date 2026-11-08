# Scholaura – AI Research Paper Agent
> *"Research smarter. Discover deeper."*

Scholaura is an intelligent academic research assistant designed to empower researchers, scholars, graduate students, and engineers to understand, analyze, compare, and synthesize scientific literature with grounded citations and zero hallucination.

---

## Key Capabilities

1. **Research Topic Explorer**
   - Enter any research question, frontier topic, or dissertation proposal.
   - Generates targeted research hypotheses categorized by difficulty (Foundational, Advanced, Frontier).
   - Formulates academic Boolean queries optimized for Google Scholar, arXiv, ACM Digital Library, and IEEE Xplore.
   - Outlines a structured 4-phase research exploration roadmap with concrete milestones and timelines.
   - Recommends benchmark datasets and top-tier publication venues.

2. **Research Paper Analyzer**
   - Upload PDF or TXT research manuscripts (or select from landmark benchmark papers).
   - Extracts structured scholarly insights using few-shot prompt formulation:
     - **Abstract & Executive Summary**
     - **Core Problem, Hypothesis & Target Application**
     - **Methodology & Architecture Details** (Math formulation, parameters, hardware setup)
     - **Quantitative Findings Table** (Reported scores vs baseline/SOTA systems)
     - **Limitations & Threats to Validity** (Categorized by severity)
     - **Unaddressed Research Gaps & Actionable Future Directions**
   - Export analysis reports as Markdown or download `.md` files.

3. **Multi-Paper Comparative Matrix**
   - Select 2 or more research papers across your corpus.
   - Generates a side-by-side comparative matrix table comparing:
     - Research Objectives
     - Methodological & Algorithmic Approaches
     - Benchmark Datasets & Sample Sizes
     - Key Empirical Findings
     - Core Limitations
     - Unaddressed Research Gaps
   - Synthesizes consensus points, methodological debates, trade-offs, and cross-corpus opportunities.

4. **Literature Review Generator**
   - Synthesizes your uploaded paper corpus into a publication-grade literature review.
   - Supports **Thematic**, **Methodological**, and **Chronological** synthesis styles.
   - Maps overarching thematic clusters with inline paper citations `[Paper Title]`.
   - Formulates a rigorous future research agenda with testable academic hypotheses.

5. **Grounded Research Q&A**
   - Ask complex technical or empirical questions across your paper collection.
   - Strictly grounded in the provided document texts—never invents findings, metrics, or citations.
   - Provides exact paper names and page references (e.g., `[Attention Is All You Need, p. 4]`).
   - Offers suggested follow-up queries and direct quote verification.

6. **Document & Corpus Library**
   - Drag-and-drop support for PDF (`.pdf`) and Plain Text (`.txt`) research papers.
   - Server-side PDF extraction with page indexing (`--- [Page X of Y] ---`).
   - Integrated full-text inspector for examining document contents.
   - Pre-loaded landmark papers (*Attention Is All You Need*, *ResNet*, *BERT*, *LoRA*).

---

## Technical Architecture

- **Frontend**: React 19 SPA, Tailwind CSS v4, Lucide icons, Plus Jakarta Sans & JetBrains Mono typography.
- **Backend**: Node.js & Express server with integrated Vite middleware.
- **AI Reasoning**: Google Gemini API (`gemini-3.8-flash`) with server-side SDK execution and `ThinkingLevel.LOW` for fast, evidence-grounded responses.
- **Document Engine**: Server-side `pdf-parse` with structured page marker joiners.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```
