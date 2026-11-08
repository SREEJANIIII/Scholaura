export interface ResearchPaper {
  id: string;
  title: string;
  filename: string;
  authors: string[];
  year: number;
  venue: string;
  doi: string;
  pageCount: number;
  wordCount: number;
  abstract: string;
  content: string;
  tags: string[];
  sampleQueries: string[];
  isSample?: boolean;
  uploadedAt: string;
}

export const SAMPLE_PAPERS: ResearchPaper[] = [
  {
    id: 'paper-attention-2017',
    title: 'Attention Is All You Need',
    filename: 'vaswani2017_attention.pdf',
    authors: [
      'Ashish Vaswani',
      'Noam Shazeer',
      'Niki Parmar',
      'Jakob Uszkoreit',
      'Llion Jones',
      'Aidan N. Gomez',
      'Łukasz Kaiser',
      'Illia Polosukhin',
    ],
    year: 2017,
    venue: 'Advances in Neural Information Processing Systems (NeurIPS 2017)',
    doi: '10.48550/arXiv.1706.03762',
    pageCount: 11,
    wordCount: 5420,
    tags: ['Transformers', 'Self-Attention', 'NLP', 'Sequence Transduction', 'Machine Translation'],
    uploadedAt: '2026-10-15T09:30:00.000Z',
    isSample: true,
    sampleQueries: [
      'What BLEU scores were achieved on the WMT 2014 English-to-German and English-to-French tasks?',
      'How does scaled dot-product attention compute weights and why is the scaling factor sqrt(d_k) necessary?',
      'What are the computational complexity advantages of self-attention over recurrent and convolutional layers?',
      'How are positional encodings constructed using sinusoidal functions?',
    ],
    abstract:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs.',
    content: `Attention Is All You Need
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin
Google Brain / Google Research / University of Toronto

--- [Page 1 of 11] ---
1 Introduction
Recurrent neural networks, long short-term memory (LSTM) and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Numerous efforts have since continued to push the boundaries of recurrent language models and encoder-decoder architectures. Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has achieved significant improvements in computational efficiency through factorization tricks and conditional computation, while also improving model performance in case of the latter. However, the fundamental constraint of sequential computation remains.
Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences. In all but a few cases, however, such attention mechanisms are used in conjunction with a recurrent network.
In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.

--- [Page 2 of 11] ---
2 Background
The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S, all of which use convolutional neural networks as basic building blocks, computing hidden representations in parallel for all input and output positions. In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions. In the Transformer this is reduced to a constant number of operations O(1), albeit at the cost of reduced effective resolution due to averaging attention-weighted positions, an effect we counteract with Multi-Head Attention as described in Section 3.2.
Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence. Self-attention has been used successfully in a variety of tasks including reading comprehension, abstractive summarization, textual entailment and learning task-independent sentence representations.
End-to-end memory networks are based on a recurrent attention mechanism instead of sequence-aligned recurrence and have been shown to perform well on simple-language question answering and language modeling tasks.
To the best of our knowledge, however, the Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution.

--- [Page 3 of 11] ---
3 Model Architecture
Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations (x_1, ..., x_n) to a sequence of continuous representations z = (z_1, ..., z_n). Given z, the decoder then generates an output sequence (y_1, ..., y_m) of symbols one element at a time. At each step the model is auto-regressive, consuming the previously generated symbols as additional input when generating the next.
The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder, shown in the left and right halves of Figure 1, respectively.
3.1 Encoder and Decoder Stacks
Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization. That is, the output of each sub-layer is LayerNorm(x + Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer itself. To facilitate these residual connections, all sub-layers in the model, as well as the embedding layers, produce outputs of dimension d_model = 512.
Decoder: The decoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. Similar to the encoder, we employ residual connections around each of the sub-layers, followed by layer normalization. We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking, combined with fact that the output embeddings are offset by one position, ensures that the predictions for position i can depend only on the known outputs at positions less than i.

--- [Page 4 of 11] ---
3.2 Attention
An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.
Scaled Dot-Product Attention:
We call our particular attention "Scaled Dot-Product Attention". The input consists of queries and keys of dimension d_k, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to obtain the weights on the values.
In practice, we compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed into matrices K and V. We compute the matrix of outputs as:
Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
The two most commonly used attention functions are additive attention and dot-product (multi-plicative) attention. Dot-product attention is identical to our algorithm, except for the scaling factor of 1 / sqrt(d_k). Additive attention computes the compatibility function using a feed-forward network with a single hidden layer. While the two are similar in theoretical complexity, dot-product attention is much faster and more space-efficient in practice, since it can be implemented using highly optimized matrix multiplication code.
While for small values of d_k the two mechanisms perform similarly, additive attention outperforms dot product attention without scaling for larger values of d_k. We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. To counteract this effect, we scale the dot products by 1 / sqrt(d_k).

--- [Page 5 of 11] ---
Multi-Head Attention:
Instead of performing a single attention function with d_model-dimensional queries, keys and values, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively. On each of these projected versions of queries, keys and values we then perform the attention function in parallel, yielding d_v-dimensional output values. These are concatenated and once again projected, resulting in the final values.
Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W^O
where head_i = Attention(Q * W_i^Q, K * W_i^K, V * W_i^V)
Where the projections are parameter matrices W_i^Q in R^{d_model x d_k}, W_i^K in R^{d_model x d_k}, W_i^V in R^{d_model x d_v} and W^O in R^{h*d_v x d_model}.
In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64. Due to the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality.

--- [Page 6 of 11] ---
3.3 Position-wise Feed-Forward Networks
In addition to attention sub-layers, each of the layers in our encoder and decoder contains a fully connected feed-forward network, which is applied to each position separately and identically. This consists of two linear transformations with a ReLU activation in between:
FFN(x) = max(0, x * W_1 + b_1) * W_2 + b_2
While the linear transformations are the same across different positions, they use different parameters from layer to layer. Another way of describing this is as two convolutions with kernel size 1. The dimensionality of input and output is d_model = 512, and the inner-layer has dimensionality d_ff = 2048.
3.4 Embeddings and Softmax
Similarly to other sequence transduction models, we use learned embeddings to convert the input tokens and output tokens to vectors of dimension d_model. We also use the usual learned linear transformation and softmax function to convert the decoder output to predicted next-token probabilities. In our model, we share the same weight matrix between the two embedding layers and the pre-softmax linear transformation, similar to Press and Wolf (2016). In the embedding layers, we multiply those weights by sqrt(d_model).
3.5 Positional Encoding
Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add "positional encodings" to the input embeddings at the bottoms of the encoder and decoder stacks. The positional encodings have the same dimension d_model as the embeddings, so that the two can be summed. There are many choices of positional encodings, learned and fixed.
In this work, we use sine and cosine functions of different frequencies:
PE_{(pos, 2i)} = sin(pos / 10000^{2i / d_model})
PE_{(pos, 2i+1)} = cos(pos / 10000^{2i / d_model})
where pos is the position and i is the dimension.

--- [Page 7 of 11] ---
4 Why Self-Attention
In this section we compare various aspects of self-attention layers to the recurrent and convolutional layers commonly used for mapping one variable-length sequence of symbol representations (x_1, ..., x_n) to another sequence of equal length (z_1, ..., z_n).
As motivating our choice of self-attention we consider three desiderata:
1. Total computational complexity per layer: Self-attention layer connects all positions with a constant number of sequentially executed operations, whereas a recurrent layer requires O(n) sequential operations. In terms of computational complexity, self-attention layers are faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d, which is most often the case with sentence representations used in state-of-the-art models in machine translations (such as word-piece representations).
2. Amount of computation that can be parallelized: Measured by the minimum number of sequential operations required.
3. Path length between long-range dependencies in the network: Learning long-range dependencies is a key challenge in sequence transduction. One key factor affecting the ability to learn such dependencies is the length of the paths forward and backward signals have to traverse in the network. The shorter these paths between any combination of positions in the input and output sequences, the easier it is to learn long-range dependencies. Hence we also compare the maximum path length between any two input and output positions in networks composed of the different layer types.
As noted in Table 1:
- Self-Attention: Complexity per Layer O(n^2 * d), Sequential Operations O(1), Maximum Path Length O(1).
- Recurrent: Complexity per Layer O(n * d^2), Sequential Operations O(n), Maximum Path Length O(n).
- Convolutional: Complexity per Layer O(k * n * d^2), Sequential Operations O(1), Maximum Path Length O(log_k(n)).
- Self-Attention (restricted): Complexity per Layer O(r * n * d), Sequential Operations O(1), Maximum Path Length O(n / r).

--- [Page 8 of 11] ---
5 Training
This section describes the training regime for our models.
5.1 Training Data and Batching
We trained on the standard WMT 2014 English-German dataset consisting of about 4.5 million sentence pairs. Sentences were encoded using byte-pair encoding, which has a shared source-target vocabulary of about 37000 tokens. For English-French, we used the significantly larger WMT 2014 English-French dataset consisting of 36 million sentence pairs and split tokens into a 32000 word-piece vocabulary. Sentence pairs were batched together by approximate sequence length. Each training batch contained a set of sentence pairs containing approximately 25000 source tokens and 25000 target tokens.
5.2 Hardware and Schedule
We trained our models on one machine with 8 NVIDIA P100 GPUs. For our base models using the hyperparameters described throughout the paper, each training step took about 0.4 seconds. We trained the base models for a total of 100,000 steps or 12 hours. For our big models, step time was 1.0 seconds. The big models were trained for 300,000 steps (3.5 days).
5.3 Optimizer
We used the Adam optimizer with beta_1 = 0.9, beta_2 = 0.98 and epsilon = 10^-9. We varied the learning rate over the course of training, according to the formula:
lrate = d_model^{-0.5} * min(step_num^{-0.5}, step_num * warmup_steps^{-1.5})
This corresponds to increasing the learning rate linearly for the first warmup_steps training steps, and decreasing it thereafter proportionally to the inverse square root of the step number. We used warmup_steps = 4000.
5.4 Regularization
Residual Dropout: We apply dropout to the output of each sub-layer, before it is added to the sub-layer input and normalized. In addition, we apply dropout to the sums of the embeddings and the positional encodings in both the encoder and decoder stacks. For the base model, we use a rate of P_drop = 0.1.
Label Smoothing: During training, we employed label smoothing of value epsilon_ls = 0.1. This hurts perplexity, as the model learns to be more unsure, but improves accuracy and BLEU score.

--- [Page 9 of 11] ---
6 Results
6.1 Machine Translation
On the WMT 2014 English-to-German translation task, the big transformer model (Transformer (big) in Table 2) outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4. The configuration of this model is listed in the bottom line of Table 3. Training took 3.5 days on 8 P100 GPUs. Even our base model surpasses all previously published models and ensembles, at a fraction of the training cost.
On the WMT 2014 English-to-French translation task, our big model achieves a BLEU score of 41.0, outperforming all of the previously published single models, at less than 1/4 the training cost of the previous state-of-the-art model. The Transformer (big) model trained for English-to-French used dropout rate P_drop = 0.1, rather than 0.3.
With checkpoint averaging over the last 20 checkpoints, the single model reaches 41.8 BLEU.

--- [Page 10 of 11] ---
6.2 Model Variations
To evaluate the importance of different components of the Transformer, we varied our base model in different ways, measuring changes in performance on English-to-German translation on the development set, newstest2013. We used beam search as described in the previous section, but no checkpoint averaging.
In Table 3 rows (A), we vary the number of attention heads and the attention key and value dimensions, keeping the amount of computation constant. While single-head attention is 0.9 BLEU worse than the best setting, quality also drops with too many heads (e.g. h = 16 or 32).
In Table 3 rows (B), we observe that reducing the attention key size d_k hurts model quality. This suggests that determining compatibility is not easy and that a more sophisticated compatibility function than dot product may be beneficial. We further observe in rows (C) and (D) that, as expected, bigger models are better, and dropout is very helpful in avoiding over-fitting.

--- [Page 11 of 11] ---
7 Conclusion
In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-head self-attention.
For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieve a new state of the art. In the former task our best model out-performs even all previously reported ensembles.
We are excited about the future of attention-based models and plan to apply them to other tasks. We plan to extend the Transformer to problems involving input and output modalities other than text and to investigate local, restricted attention mechanisms to efficiently handle large inputs and outputs such as images, audio and video. Making generation less sequential is another research goal of ours.`,
  },
  {
    id: 'paper-resnet-2016',
    title: 'Deep Residual Learning for Image Recognition',
    filename: 'he2016_resnet.pdf',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    year: 2016,
    venue: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2016 - Best Paper Award)',
    doi: '10.1109/CVPR.2016.90',
    pageCount: 12,
    wordCount: 6100,
    tags: ['Computer Vision', 'Residual Networks', 'Deep Learning', 'Convolutional Networks', 'ImageNet'],
    uploadedAt: '2026-10-18T14:15:00.000Z',
    isSample: true,
    sampleQueries: [
      'What degradation problem does ResNet solve and how is it distinct from vanishing gradients?',
      'How does the identity mapping formulation F(x) + x work mathematically?',
      'What was ResNet-152 top-5 error rate on the ImageNet test set compared to VGG and GoogLeNet?',
      'Why is the bottleneck design with 1x1 convolutions essential for deeper ResNets (ResNet-50/101/152)?',
    ],
    abstract:
      'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers—8x deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won the 1st place on the ILSVRC 2015 classification task. We also present analysis on CIFAR-10 with 100 and 1000 layers. Deep representations are of central importance for many visual recognition tasks. Solely due to our extremely deep representations, we obtain a 28% relative improvement on the COCO object detection dataset.',
    content: `Deep Residual Learning for Image Recognition
Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
Microsoft Research

--- [Page 1 of 12] ---
1 Introduction
Deep convolutional neural networks have led to a series of breakthroughs for image classification. Deep networks naturally integrate low/mid/high-level features and classifiers in an end-to-end multi-layer fashion, and the "levels" of features can be enriched by the number of stacked layers (depth). Recent evidence reveals that network depth is of crucial importance, and the leading results on the challenging ImageNet dataset all exploit "very deep" models, with a depth of sixteen to thirty. Many other non-trivial visual recognition tasks have also greatly benefited from very deep models.
Driven by the significance of depth, a question arises: Is learning better networks as easy as stacking more layers? An obstacle to answering this question was the notorious problem of vanishing/exploding gradients, which hamper convergence from the beginning. This problem, however, has been largely addressed by normalized initialization and intermediate normalization layers (Batch Normalization), which enable networks with tens of layers to start converging for stochastic gradient descent (SGD) with backpropagation.
When deeper networks are able to start converging, a degradation problem has been exposed: with the network depth increasing, accuracy gets saturated (which might be unsurprising) and then degrades rapidly. Unexpectedly, such degradation is not caused by overfitting, and adding more layers to a suitably deep model leads to higher training error, as reported in our experiments.

--- [Page 2 of 12] ---
The degradation (of training accuracy) indicates that not all systems are similarly easy to optimize. Let us consider a shallower architecture and its deeper counterpart that adds more layers onto it. There exists a solution by construction to the deeper model: the added layers are identity mapping, and the other layers are copied from the learned shallower model. The existence of this constructed solution indicates that a deeper model should produce no higher training error than its shallower counterpart. But experiments show that our current solvers are unable to find solutions that are comparably good or better than the constructed solution (or unable to do so in feasible time).
In this paper, we address the degradation problem by introducing a deep residual learning framework. Instead of hoping each few stacked layers directly fit a desired underlying mapping, we explicitly let these layers fit a residual mapping. Formally, denoting the desired underlying mapping as H(x), we let the stacked nonlinear layers fit another mapping of F(x) := H(x) - x. The original mapping is recast into F(x) + x. We hypothesize that it is easier to optimize the residual mapping than to optimize the original, unreferenced mapping. To the extreme, if an identity mapping were optimal, it would be easier to push the residual to zero than to fit an identity mapping by a stack of nonlinear layers.
The formulation of F(x) + x can be realized by feedforward neural networks with "shortcut connections". Shortcut connections are those skipping one or more layers. In our case, the shortcut connections simply perform identity mapping, and their outputs are added to the outputs of the stacked layers. Identity shortcut connections add neither extra parameter nor computation complexity. The entire network can still be trained end-to-end by SGD with backpropagation, and can be easily implemented using common libraries without modifying the solvers.

--- [Page 3 of 12] ---
2 Related Work
Residual Representations: In image processing, residual vectors are widely used for encoding dictionaries and VLAD representations. In partial differential equations (PDEs), multigrid methods solve sub-problems at multiple scales where each scale solves a residual equation. These methods show that reformulating the problem around residuals speeds up convergence dramatically.
Shortcut Connections: Practices and theories that lead to shortcut connections have been studied for a long time. Early practices of training multi-layer perceptrons (MLP) added a linear layer connected from the network input to the output. A few intermediate layers were directly connected to auxiliary classifiers for addressing vanishing/exploding gradients (GoogLeNet). Concurrently with our work, "highway networks" present shortcut connections with gating functions. These gates are data-dependent and have parameters, whereas our identity shortcuts are parameter-free and never closed.

--- [Page 4 of 12] ---
3 Deep Residual Learning
3.1 Residual Learning
Let us consider H(x) as an underlying mapping to be fit by a few stacked layers (not necessarily the entire net), with x denoting the inputs to the first of these layers. If one hypothesizes that multiple nonlinear layers can asymptotically approximate complicated functions, it is equivalent to hypothesize that they can asymptotically approximate the residual functions, i.e., H(x) - x (assuming the input and output are of the same dimensions). So rather than expect stacked layers to approximate H(x), we explicitly let these layers approximate a residual function F(x) := H(x) - x. The original function thus becomes F(x) + x. Although both forms should be able to asymptotically approximate the desired functions, the ease of learning may be different.
This formulation is motivated by the counter-intuitive phenomena about the degradation problem (Figure 1). If the added layers can be constructed as identity mappings, a deeper model should have training error no greater than its shallower counterpart. The degradation problem suggests that the solvers may have difficulties in approximating identity mappings by multiple nonlinear layers. With the residual learning reformulation, if identity mappings are optimal, the solvers may simply drive the weights of the multiple nonlinear layers toward zero to approach identity mappings.
In real cases, it is unlikely that identity mappings are optimal, but our reformulation may help to precondition the problem. If the optimal function is closer to an identity mapping than to a zero mapping, it should be easier for the solver to find the perturbations with reference to an identity mapping, than to learn the function as a new one. We show by experiments that the learned residual functions in general have small responses, suggesting that identity mappings provide reasonable preconditioning.

--- [Page 5 of 12] ---
3.2 Identity Mapping by Shortcuts
We adopt residual learning to every few stacked layers. A building block is computed as:
y = F(x, {W_i}) + x
Here x and y are the input and output vectors of the layers considered. The function F(x, {W_i}) represents the residual mapping to be learned. For the example of two layers, F = W_2 * sigma(W_1 * x) in which sigma denotes ReLU and biases are omitted for simplifying notations. The operation F + x is performed by a shortcut connection and element-wise addition. We adopt the second nonlinearity after the addition (i.e., sigma(y)).
The shortcut connections in Eqn.(1) introduce neither extra parameter nor computation complexity. This is not only attractive in practice but also important in our comparisons between plain and residual networks. We can fairly compare plain/residual networks that simultaneously have the same number of parameters, depth, width, and computational cost (except for the negligible element-wise addition).
The dimensions of x and F must be equal in Eqn.(1). If this is not the case (e.g., when changing the input/output channels), we can perform a linear projection W_s by the shortcut connections to match the dimensions:
y = F(x, {W_i}) + W_s * x
We can also use a square matrix W_s in Eqn.(1). But we will show by experiments that the identity mapping is sufficient for addressing the degradation problem and is economical, and thus W_s is only used when matching dimensions.

--- [Page 6 of 12] ---
3.3 Network Architectures
We have tested various plain/residual nets, and have observed consistent phenomena. To provide instances for discussion, we describe two models for ImageNet:
Plain Network: Our plain baselines are mainly inspired by the philosophy of VGG nets. The convolutional layers mostly have 3x3 filters and follow two simple design rules: (i) for the same output feature map size, the layers have the same number of filters; and (ii) if the feature map size is halved, the number of filters is doubled so as to preserve the time complexity per layer. We perform downsampling directly by convolutional layers that have a stride of 2. The network ends with a global average pooling layer and a 1000-way fully-connected layer with softmax. The total number of weighted layers is 34.
Residual Network: Based on the above plain network, we insert shortcut connections which turn the network into its counterpart residual version. The identity shortcuts can be directly used when the input and output are of the same dimensions. When the dimensions increase (dashed shortcuts in Figure 3), we consider two options: (A) The shortcut still performs identity mapping, with extra zero entries padded for increasing dimensions. This option introduces no extra parameter; (B) The projection shortcut in Eqn.(2) is used to match dimensions (done by 1x1 convolutions). For both options, when the shortcuts go across feature maps of two sizes, they are performed with a stride of 2.

--- [Page 7 of 12] ---
3.4 Implementation
Our implementation for ImageNet follows the practice in [Krizhevsky et al., 2012; Simonyan & Zisserman, 2014]. The image is resized with its shorter side randomly sampled in [256, 480] for scale augmentation. A 224x224 crop is randomly sampled from an image or its horizontal flip, with the per-pixel mean subtracted. The standard color augmentation in [Krizhevsky et al., 2012] is used. We adopt batch normalization (BN) right after each convolution and before activation. We initialize the weights as in [He et al., 2015] and train all plain/residual nets from scratch. We use SGD with a mini-batch size of 256. The learning rate starts from 0.1 and is divided by 10 when the error plateaus, and the models are trained for up to 60 * 10^4 iterations. We use a weight decay of 0.0001 and a momentum of 0.9. We do not use dropout.

--- [Page 8 of 12] ---
Deeper Bottleneck Architectures:
Next we describe our deeper nets for ImageNet. Because of concerns on the training time that we can afford, we modify the building block as a bottleneck design. For each residual function F, we use a stack of 3 layers instead of 2. The three layers are 1x1, 3x3, and 1x1 convolutions, where the 1x1 layers are responsible for reducing and then increasing (restoring) dimensions, leaving the 3x3 layer a bottleneck with smaller input/output dimensions.
For example, a block with input 256 uses 1x1 conv to project to 64 channels, 3x3 conv with 64 channels, and 1x1 conv to project back to 256 channels. The parameter-free identity shortcuts are particularly important for the bottleneck architecture. If the identity shortcut in Eqn.(1) is replaced with projection, one can show that the time complexity and model size are doubled, as the shortcut is connected to the two high-dimensional ends. So identity shortcuts lead to more efficient models for the bottleneck designs.
Using this bottleneck design, we construct ResNet-50, ResNet-101, and ResNet-152. Remarkably, ResNet-152 has lower FLOPs (11.3 billion) than VGG-16/19 (15.3/19.6 billion FLOPs) while having 8x deeper layers!

--- [Page 9 of 12] ---
4 Experiments
4.1 ImageNet Classification
We evaluate our method on the 1000-class ImageNet 2012 classification dataset. The models are trained on the 1.28 million training images, and evaluated on the 50k validation images. We also obtain a final result on the 100k test images.
Plain Networks: We first evaluate 18-layer and 34-layer plain nets. The 34-layer plain net has higher validation error (28.54% top-1) than the 18-layer plain net (27.94% top-1). Comparing training errors, the 34-layer plain net has higher training error throughout the entire training procedure, even though the solution space of the 18-layer plain network is a subspace of that of the 34-layer one. This demonstrates the degradation problem.
ResNets: Next we evaluate 18-layer and 34-layer ResNets. The baseline architectures are the same as the plain nets, expect that a shortcut connection is added to each pair of 3x3 filters. In the first comparison, we use identity shortcuts for all shortcuts and zero-padding for increasing dimensions (option A), so they have no extra parameters compared to the plain counterparts.
We observe that:
1. The 34-layer ResNet is better than the 18-layer ResNet (by 2.8%), and has much lower training error. This indicates that the degradation problem is well addressed in this setting, and we manage to obtain accuracy gains from increased depth.
2. Compared to its plain counterpart, the 34-layer ResNet reduces the top-1 error by 3.5%, resulting from the successfully reduced training error. This comparison verifies the effectiveness of residual learning on extremely deep systems.

--- [Page 10 of 12] ---
Deeper ResNet-50, 101, 152:
We replace each 2-layer block in the 34-layer net with this 3-layer bottleneck block, resulting in a 50-layer ResNet (ResNet-50). We use option B for increasing dimensions. The 50/101/152-layer ResNets are more accurate than the 34-layer one by a considerable margin. We do not observe the degradation problem at significant depths and thus observe significant accuracy gains from increased depth.
Comparisons with State-of-the-Art Methods:
In Table 4, we compare with the previous best single-model results:
- VGG-16: 28.07% top-1, 9.33% top-5
- GoogLeNet: - top-1, 9.15% top-5
- PReLU-net: 24.27% top-1, 7.38% top-5
- ResNet-34 (A): 25.03% top-1, 7.76% top-5
- ResNet-34 (B): 24.52% top-1, 7.46% top-5
- ResNet-50: 22.85% top-1, 6.71% top-5
- ResNet-101: 21.75% top-1, 6.05% top-5
- ResNet-152: 21.43% top-1, 5.71% top-5 (single model test error)
Combining an ensemble of six models of different depths (only two ResNet-152s were used at the time of submission), we achieve 3.57% top-5 error on the ImageNet test set. This won 1st place in the ILSVRC 2015 competition.

--- [Page 11 of 12] ---
4.2 CIFAR-10 and Analysis
We conducted more studies on the CIFAR-10 dataset, which consists of 50k training images and 10k testing images in 10 classes. We trained plain and residual nets with depth varying from 20 to 110 layers.
Analysis of Layer Responses:
We compute the standard deviation of layer activations. The responses of ResNets are generally smaller than their plain counterparts. These results support our basic motivation: residual functions might be closer to zero than non-residual functions.
Exploring Over 1000 Layers:
We also explored an aggressively deep model of 1202 layers. It achieved 7.93% error on CIFAR-10. Although it trained successfully without optimization difficulties, its test result was slightly worse than the 110-layer model (6.43%), likely due to overfitting on this small dataset.

--- [Page 12 of 12] ---
5 Conclusion
We presented deep residual learning for training extremely deep neural networks. Residual shortcut connections allow gradients to flow directly through identity paths, effectively resolving the degradation problem. This allowed us to train models up to 152 layers on ImageNet and over 1000 layers on CIFAR-10 with remarkable convergence speed and superior generalization. The representations learned transferred exceptionally well to object detection on MS COCO (+28% relative mAP gain), establishing residual learning as a fundamental building block of modern deep vision systems.`,
  },
  {
    id: 'paper-bert-2018',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    filename: 'devlin2018_bert.pdf',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    year: 2018,
    venue: 'Conference of the North American Chapter of the Association for Computational Linguistics (NAACL-HLT 2019)',
    doi: '10.48550/arXiv.1810.04805',
    pageCount: 16,
    wordCount: 7200,
    tags: ['NLP', 'Pre-training', 'Bidirectional Transformers', 'GLUE Benchmark', 'Language Models'],
    uploadedAt: '2026-10-22T11:00:00.000Z',
    isSample: true,
    sampleQueries: [
      'What are the two pre-training objectives used in BERT and how does the 80/10/10 masking strategy work?',
      'How does BERT achieve true bidirectional representation compared to OpenAI GPT and ELMo?',
      'What score did BERT_LARGE achieve on the GLUE benchmark and SQuAD 1.1 F1?',
      'What is the computational overhead and limitation of BERT pretraining and fine-tuning?',
    ],
    abstract:
      'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. BERT is conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5% (7.7% point absolute improvement), MultiNLI accuracy to 86.7% (4.6% absolute improvement) and SQuAD v1.1 question answering Test F1 to 93.2 (1.5 point absolute improvement).',
    content: `BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova
Google AI Language

--- [Page 1 of 16] ---
1 Introduction
Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include low-level tasks such as natural language inference and paraphrasing, which aim to predict the relationships between sentences by analyzing them holistically, as well as token-level tasks such as named entity recognition and question answering, where models are required to produce fine-grained output at the token level.
There are two existing strategies for applying pre-trained language representations to downstream tasks: feature-based and fine-tuning. The feature-based approach, such as ELMo (Peters et al., 2018a), uses task-specific architectures that include the pre-trained representations as additional features. The fine-tuning approach, such as the Generative Pre-trained Transformer (OpenAI GPT) (Radford et al., 2018), introduces minimal task-specific parameters, and is trained on the downstream tasks by simply fine-tuning all pretrained parameters.
We argue that current techniques severely restrict the power of the pre-trained representations. The major limitation is that standard language models are unidirectional, and this limits the choice of architectures that can be used during pre-training. For example, in OpenAI GPT, the authors use a left-to-right architecture, where every token can only attend to previous tokens in the self-attention layers of the Transformer. Such restrictions are sub-optimal for sentence-level tasks, and could be very harmful when applying fine-tuning based approaches to token-level tasks such as question answering, where it is crucial to incorporate context from both directions.

--- [Page 2 of 16] ---
In this paper, we improve the fine-tuning based approaches by proposing BERT: Bidirectional Encoder Representations from Transformers. BERT alleviates the previously mentioned unidirectionality constraint by using a "masked language model" (MLM) pre-training objective, inspired by the Cloze task (Taylor, 1953). The masked language model randomly masks some of the tokens from the input, and the objective is to predict the original vocabulary id of the masked word based only on its context. Unlike left-to-right language model pre-training, the MLM objective enables the representation to fuse the left and the right context, which allows us to pre-train a deep bidirectional Transformer. In addition to the masked language model, we also use a "next sentence prediction" (NSP) task that jointly pre-trains text-pair representations.
The contributions of our paper are as follows:
- We demonstrate the importance of bidirectional pre-training for language representations. Unlike Radford et al. (2018), which uses unidirectional Transformers for pre-training, and Peters et al. (2018a), which uses independently trained left-to-right and right-to-left LSTMs, BERT uses a masked language model to enable pre-trained deep bidirectional representations.
- We show that pre-trained representations reduce the need for many heavily-engineered task-specific architectures. BERT is the first fine-tuning based representation model that achieves state-of-the-art performance on a large suite of sentence-level and token-level tasks, outperforming many systems with task-specific architectures.
- BERT advances the state of the art for eleven NLP tasks.

--- [Page 3 of 16] ---
2 BERT Architecture and Pre-training
There are two steps in our framework: pre-training and fine-tuning. During pre-training, the model is trained on unlabeled data over different pre-training tasks. For fine-tuning, the BERT model is first initialized with the pre-trained parameters, and all of the parameters are fine-tuned using labeled data from the downstream tasks. Each downstream task has separate fine-tuned models, even though they are initialized with the same pre-trained parameters.
Model Architecture:
BERT's model architecture is a multi-layer bidirectional Transformer encoder based on the original implementation described in Vaswani et al. (2017). We denote the number of layers (i.e., Transformer blocks) as L, the hidden size as H, and the number of self-attention heads as A.
We primarily report results on two model sizes:
- BERT_BASE: L=12, H=768, A=12, Total Parameters=110M
- BERT_LARGE: L=24, H=1024, A=16, Total Parameters=340M
BERT_BASE was chosen to have the identical model size as OpenAI GPT for comparison purposes.

--- [Page 4 of 16] ---
Input/Output Representations:
To make BERT handle a variety of downstream tasks, our input representation is able to unambiguously represent both a single sentence and a pair of sentences (e.g., <Question, Answer>) in one token sequence. Throughout this work, a "sentence" can be an arbitrary span of contiguous text, rather than an actual linguistic sentence. A "sequence" refers to the input token sequence to BERT, which may be a single sentence or two sentences packed together.
We use WordPiece embeddings (Wu et al., 2016) with a 30,000 token vocabulary. The first token of every sequence is always a special classification token ([CLS]). The final hidden state corresponding to this token is used as the aggregate sequence representation for classification tasks. Sentence pairs are packed together into a single sequence. We differentiate the sentences in two ways: first, we separate them with a special token ([SEP]); second, we add a learned embedding to every token indicating whether it belongs to sentence A or sentence B.
For a given token, its input representation is constructed by summing the corresponding token, segment, and position embeddings.

--- [Page 5 of 16] ---
Task #1: Masked LM (MLM)
Intuitively, it is reasonable to believe that a deep bidirectional model is strictly more powerful than either a left-to-right model or the shallow concatenation of a left-to-right and a right-to-left model. Unfortunately, standard conditional language models can only be trained left-to-right or right-to-left, since bidirectional conditioning would allow each word to indirectly "see itself", and the model could trivially predict the target word in a multi-layered context.
In order to train a deep bidirectional representation, we simply mask some percentage of the input tokens at random, and then predict those masked tokens. We refer to this procedure as a "masked LM" (MLM). In this case, the final hidden vectors corresponding to the mask tokens are fed into an output softmax over the vocabulary, as in a standard LM. In all of our experiments, we mask 15% of all WordPiece tokens in each sequence at random.
Although this allows us to obtain a bidirectional pre-trained model, a downside is that we are creating a mismatch between pre-training and fine-tuning, since the [MASK] token does not appear during fine-tuning. To mitigate this, we do not always replace "masked" words with the actual [MASK] token. The training data generator chooses 15% of the token positions at random for prediction. If the i-th token is chosen, we replace the i-th token with:
(1) the [MASK] token 80% of the time,
(2) a random token 10% of the time, and
(3) the unchanged i-th token 10% of the time.

--- [Page 6 of 16] ---
Task #2: Next Sentence Prediction (NSP)
Many important downstream tasks such as Question Answering (QA) and Natural Language Inference (NLI) are based on understanding the relationship between two sentences, which is not directly captured by language modeling. In order to train a model that understands sentence relationships, we pre-train for a binarized next sentence prediction task that can be trivially generated from any monolingual corpus.
Specifically, when choosing the sentences A and B for each pre-training example, 50% of the time B is the actual next sentence that follows A (labeled as IsNext), and 50% of the time it is a random sentence from the corpus (labeled as NotNext). Despite its simplicity, we demonstrate that pre-training towards this task is highly beneficial to both QA and NLI.

--- [Page 7 of 16] ---
Pre-training Data:
The pre-training procedure largely follows the existing literature on language model pre-training. For the pre-training corpus we use the BooksCorpus (800M words) (Zhu et al., 2015) and English Wikipedia (2,500M words). For Wikipedia we extract only the text passages and ignore lists, tables, and headers. It is critical to use a document-level corpus rather than a shuffled sentence-level corpus like the Billion Word Benchmark in order to extract long contiguous sequences.

--- [Page 8 of 16] ---
3 Experiments and Results
We evaluate BERT on 11 NLP tasks.
3.1 GLUE (General Language Understanding Evaluation)
The General Language Understanding Evaluation (GLUE) benchmark (Wang et al., 2018) is a collection of diverse natural language understanding tasks.
Results:
- Pre-OpenAI SOTA: 74.0
- OpenAI GPT: 75.1 (GLUE score)
- BERT_BASE: 79.6
- BERT_LARGE: 80.5 (average score across all tasks)
BERT_LARGE achieves state of the art on all 9 GLUE tasks, outperforming OpenAI GPT by 5.4% absolute margin. Specifically, on MNLI it achieves 86.7% accuracy, on QQP 72.1% F1, and on SST-2 94.9% accuracy.

--- [Page 9 of 16] ---
3.2 SQuAD v1.1
The Stanford Question Answering Dataset (SQuAD v1.1) is a collection of 100k crowd-sourced question/answer pairs. Given a question and a passage from Wikipedia containing the answer, the task is to predict the answer text span in the passage.
Results:
- Top Leaderboard Ensemble: 91.6 F1
- Human Performance: 91.2 F1
- BERT_BASE: 88.5 F1
- BERT_LARGE: 93.2 F1 (Ensemble reaches 93.2, single model 92.8)
BERT_LARGE single model outperforms the best existing ensemble systems by 1.5 F1, and achieves super-human performance.

--- [Page 10 of 16] ---
4 Ablation Studies
4.1 Effect of Pre-training Tasks
We demonstrate the importance of the deep bidirectionality and the NSP task by comparing BERT_BASE with:
1. No NSP: A model trained with MLM without the next sentence prediction task.
2. LTR & No NSP: A left-to-right (unidirectional) model trained without NSP, similar to OpenAI GPT.
Removing NSP significantly hurts performance on QNLI, MNLI, and SQuAD 1.1 (dropping 1.0-2.0 points).
The LTR model performs much worse than the bidirectional model across all tasks, dropping by 10 points on SQuAD (77.8 vs 88.5 F1).
4.2 Effect of Model Size
We demonstrate that scaling to extreme model size (BERT_LARGE with 340M params) leads to substantial improvements even on small datasets (such as MRPC with only 3,600 labeled training examples), provided that the model has been sufficiently pre-trained.

--- [Page 11 of 16] ---
5 Limitations and Conclusion
While BERT establishes new state-of-the-art results across eleven tasks, several limitations exist:
1. Pretrain-finetune discrepancy: The [MASK] token never appears during downstream task fine-tuning.
2. Quadratic computational complexity: Like the Transformer encoder, self-attention scales quadratically O(n^2) with sequence length, which limits sequence lengths in practical pre-training to 512 tokens.
3. Compute resources: Pretraining BERT_LARGE required 64 Cloud TPU chips for 4 days.
In conclusion, deep bidirectional pre-training is fundamentally more powerful than unidirectional or shallow concatenated models, changing the standard paradigm in natural language processing toward generalized pre-trained representations fine-tuned on target tasks.`,
  },
  {
    id: 'paper-lora-2021',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    filename: 'hu2021_lora.pdf',
    authors: [
      'Edward J. Hu',
      'Yelong Shen',
      'Phillip Wallis',
      'Zeyuan Allen-Zhu',
      'Yuanzhi Li',
      'Shean Wang',
      'Lu Wang',
      'Weizhu Chen',
    ],
    year: 2021,
    venue: 'International Conference on Learning Representations (ICLR 2022)',
    doi: '10.48550/arXiv.2106.09685',
    pageCount: 14,
    wordCount: 6850,
    tags: ['PEFT', 'Large Language Models', 'Low-Rank Adaptation', 'Parameter Efficiency', 'Fine-Tuning'],
    uploadedAt: '2026-10-25T16:45:00.000Z',
    isSample: true,
    sampleQueries: [
      'How does Low-Rank Adaptation mathematically freeze W_0 and inject low-rank matrices B and A?',
      'How much does LoRA reduce trainable parameter count and GPU memory compared to full fine-tuning on GPT-3 175B?',
      'Why does LoRA introduce zero additional inference latency during deployment?',
      'What rank r values (e.g., r=1, 2, 4, 8) were shown to be sufficient to match full parameter fine-tuning?',
    ],
    abstract:
      'An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning, which retrains all model parameters, becomes less feasible. Using GPT-3 175B as an example—deploying independent instances of fine-tuned models, each with 175B parameters, is prohibitive. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks. Compared to fine-tuning GPT-3 175B with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times. LoRA performs on-par or better than fine-tuning in model quality on RoBERTa, DeBERTa, GPT-2, and GPT-3, despite having fewer trainable parameters, a higher training throughput, and, unlike adapters, no additional inference latency.',
    content: `LoRA: Low-Rank Adaptation of Large Language Models
Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen
Microsoft Corporation

--- [Page 1 of 14] ---
1 Introduction
Many applications in natural language processing rely on adapting one large, pre-trained language model to multiple downstream tasks. In this paradigm, adaptation is done via fine-tuning, which updates all the parameters of the pre-trained model. The major downside of full fine-tuning is that the new model contains as many parameters as the original model. As larger models are trained every few months, this quickly turns into a operational handicap. For example, GPT-3 175B requires gigabytes of disk space and dozens of GPUs just to store and serve each fine-tuned task checkpoint.
To address this, many researchers have sought to learn only a small number of parameters for downstream tasks. Existing techniques often introduce adapter layers or optimize some form of the input prefix. However, both strategies often introduce severe limitations:
1. Adapter layers introduce inference latency: By inserting small neural network layers sequentially in each Transformer block, hardware parallelization is disrupted, adding noticeable latency (up to 20-30% on small batch sizes).
2. Prefix tuning is difficult to optimize and reduces sequence length: Prompt tuning reserves sequence length that could otherwise be used for context.

--- [Page 2 of 14] ---
We take inspiration from Li et al. (2018a) and Aghajanyan et al. (2020) which show that the learned over-parametrized models in fact reside on a low intrinsic dimension. We hypothesize that the change in weights during model adaptation also has a low "intrinsic rank".
We propose Low-Rank Adaptation (LoRA). LoRA allows us to train some dense layers in a neural network indirectly by optimizing rank decomposition matrices of the dense layers' change during adaptation, while keeping the pre-trained weights frozen.
Taking GPT-3 175B as an extreme example, LoRA can reduce the number of trainable parameters by a factor of 10,000 and GPU memory consumption by 3x compared to full fine-tuning, while matching or exceeding the downstream performance of full fine-tuning.
Crucially, LoRA does not introduce any additional inference latency: when deployed in production, the learned matrix Delta W can be directly added back to the frozen weights W_0: W = W_0 + B * A.

--- [Page 3 of 14] ---
2 Problem Formulation
Let P_{Phi}(y | x) be a pre-trained autoregressive or bidirectional language model parameterized by Phi. During full fine-tuning, the model is initialized to pre-trained weights Phi_0 and updated to Phi_0 + Delta Phi by repeatedly following the gradient to maximize the conditional language modeling objective. One major drawback of full fine-tuning is that for each downstream task, we learn a different set of parameters Delta Phi whose dimension equals |Phi_0|.
In this paper, we adopt a parameter-efficient approach where the task-specific parameter increment Delta Phi = Delta Phi(Theta) is further encoded by a much smaller-sized set of parameters Theta with |Theta| << |Phi_0|. The task of finding Delta Phi thus becomes optimizing over Theta.
If Phi_0 is GPT-3 175B, |Phi_0| is 175 billion. With LoRA, |Theta| can be as small as 0.01% of |Phi_0|.

--- [Page 4 of 14] ---
3 Aren't Existing Solutions Good Enough?
The problem of efficient adaptation is by no means new. Since the inception of transfer learning in NLP, dozens of works have sought to make parameter adaptation more efficient:
- Series Adapters (Houlsby et al., 2019): Insert two adapter layers per Transformer block. While parameter-efficient, they increase sequential FLOPs and inference latency by 16% to 30% on modern GPU architectures.
- Parallel Adapters (He et al., 2021): Run adapter layers in parallel with attention, but still require storing extra parameters in memory during inference.
- Prefix Tuning (Li & Liang, 2021): Prepend virtual continuous prompt vectors to keys and values. This reduces the maximum sequence length available for actual input tokens and is sensitive to learning rate and initialization.

--- [Page 5 of 14] ---
4 Our Method: LoRA
4.1 Low-Rank Parameterized Update Matrices
A neural network contains many dense layers which perform matrix multiplication. The weight matrices in these layers typically have full rank. When adapting to a specific task, Aghajanyan et al. (2020) shows that the pre-trained language models have a low "intrinsic dimension" and can still learn efficiently despite a random projection to a smaller subspace.
Inspired by this, we hypothesize that the updates to the weights also have a low "intrinsic rank" during adaptation. For a pre-trained weight matrix W_0 in R^{d x k}, we constrain its update by representing the latter with a low-rank decomposition:
W_0 + Delta W = W_0 + B * A
where B in R^{d x r}, A in R^{r x k}, and the rank r << min(d, k).
During training, W_0 is frozen and does not receive gradient updates, while A and B contain trainable parameters. Note that both W_0 and Delta W = B * A are multiplied with the same input x:
h = W_0 * x + Delta W * x = W_0 * x + (B * A) * x
We use a random Gaussian initialization for A and zero for B, so Delta W = B * A is zero at the beginning of training. We then scale Delta W * x by alpha / r, where alpha is a constant in r. When optimizing with Adam, tuning alpha is roughly the same as tuning the learning rate if the initialization is scaled appropriately.

--- [Page 6 of 14] ---
4.2 Applying LoRA to Transformers
In principle, we can apply LoRA to any subset of weight matrices in a neural network. In the Transformer architecture, there are four weight matrices in the self-attention module (W_q, W_k, W_v, W_o) and two in the MLP module. In this paper, we focus on adapting only the attention weights for simplicity and parameter efficiency, and freeze the MLP modules.
Advantages of LoRA:
1. No Inference Latency: In production deployment, we can explicitly compute and store W = W_0 + B * A. When switching to another downstream task, we can recover W_0 by subtracting B * A and adding the new task's B' * A', an operation that takes milliseconds.
2. Memory and Storage Savings: For GPT-3 175B, we reduce VRAM footprint during training from 1.2 TB to 350 GB (when storing Adam optimizer states). Checkpoint sizes shrink from 350 GB to 35 MB per task!
3. High Training Throughput: Because we do not calculate gradients for the vast majority of parameters, training throughput increases by 25%.

--- [Page 7 of 14] ---
5 Empirical Evaluation
We evaluate LoRA on RoBERTa, DeBERTa, GPT-2, and GPT-3 175B across standard benchmarks: GLUE, E2E NLG Challenge, and WebNLG.
5.1 Baselines
We compare LoRA with:
- Full Fine-Tuning (FT)
- Bias-only tuning (BitFit)
- Prefix-embedding tuning (Pre-Embed)
- Prefix-layer tuning (Pre-Layer)
- Series Adapter (Houlsby et al.)

--- [Page 8 of 14] ---
5.2 GPT-3 175B Results
On GPT-3 175B, LoRA matches or exceeds full fine-tuning across all evaluated datasets:
- WikiSQL (Accuracy): Full FT = 73.8%, LoRA = 74.0%
- MultiNLI (Match Accuracy): Full FT = 89.5%, LoRA = 91.7%
- SAMSum (ROUGE-1 / ROUGE-2 / ROUGE-L): Full FT = 52.0 / 26.5 / 47.9, LoRA = 53.8 / 29.8 / 49.2
Trainable Parameters:
- Full Fine-Tuning: 175,255.8 Million parameters (100%)
- LoRA (r=4, applying to W_q, W_v): 4.7 Million parameters (0.0027% of total parameters!)

--- [Page 9 of 14] ---
6 Understanding the Low-Rank Weights
6.1 Which weight matrices in Transformer should we adapt?
We observe that adapting both W_q and W_v yields the best performance across tasks, while adapting only W_q or only W_k is sub-optimal.
6.2 What is the optimal rank r?
Surprisingly, an extremely small rank r (such as r=1, 2, or 4) is sufficient to achieve competitive performance. Increasing rank to r=64 does not meaningfully improve accuracy, confirming our hypothesis that the intrinsic rank of the adaptation matrix Delta W is indeed very small.
Subspace Similarity:
Grassmann distance and canonical correlation analysis show that the top singular vectors of Delta W across different ranks r share high overlap, explaining why small ranks suffice.

--- [Page 10 of 14] ---
7 Limitations and Conclusion
While LoRA provides tremendous computational and operational benefits, it has limitations:
1. Batching different tasks: It is not straightforward to batch inputs of different downstream tasks together in a single forward pass if each task requires different merged weights, though dynamic routing can alleviate this.
2. Cross-domain generalization: When adapting across radically different modalities or languages, the low-rank assumption might require higher ranks.
Conclusion:
LoRA provides an effective, parameter-efficient fine-tuning mechanism that decouples task adaptation from the enormous storage and compute footprint of foundation models, with zero inference latency.`,
  },
];
