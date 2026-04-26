import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Brain, Network, Layers, Binary, Compass, Target, Sparkles, Sigma, FlaskConical,
  Activity, Gauge, GitBranch, TreePine, Users, Boxes, Shuffle, Eye, EyeOff,
  Zap, Cpu, Database, Image as ImageIcon, MessageSquare, Bot, Telescope,
  Play, Pause, RotateCcw, ChevronDown, ChevronRight, Plus, Minus,
  HelpCircle, Lightbulb, Link2, ArrowRight, ArrowDown, Dices, Scale, TrendingUp,
  CircleDot, BookOpen, Map as MapIcon, Component, Wand2, Flame, Droplet, Feather,
  Waves, Wind, Timer, Workflow, Cloud, Orbit, Rows3, Columns3, LineChart, ScatterChart,
  BarChart3, Route, Gem, Infinity as InfinityIcon, Hexagon, PenLine, Ruler,
} from 'lucide-react';

/* ============================================================================
   Machine Learning — an interactive overview from basics to cutting edge
   Single-file React component. Dark. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives (KaTeX with a semantic ML color palette) ---------------
// NOTE: inside macro bodies, '#' must be doubled to '##' to escape it.
const KATEX_MACROS = {
  '\\x':   '\\textcolor{##7dd3fc}{#1}',   // inputs — sky
  '\\y':   '\\textcolor{##f9a8d4}{#1}',   // targets / labels — pink
  '\\w':   '\\textcolor{##c4b5fd}{#1}',   // weights / params — violet
  '\\loss':'\\textcolor{##fca5a5}{#1}',   // loss — rose
  '\\hp':  '\\textcolor{##fcd34d}{#1}',   // hyperparams — amber
  '\\gd':  '\\textcolor{##6ee7b7}{#1}',   // gradients / updates — emerald
  '\\mo':  '\\textcolor{##f0abfc}{#1}',   // model output / prediction — fuchsia
  '\\E':   '\\mathbb{E}',
};

const renderTex = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, {
      displayMode, throwOnError: false, output: 'html', strict: 'ignore', macros: KATEX_MACROS,
    });
  } catch (e) {
    return `<span style="color:#f87171">${tex}</span>`;
  }
};

const Eq = ({ children }) => {
  const html = useMemo(() => renderTex(String(children), false), [children]);
  return <span className="eq-inline" dangerouslySetInnerHTML={{ __html: html }} />;
};

const KeyEq = ({ children, note }) => {
  const html = useMemo(() => renderTex(String(children), true), [children]);
  return (
    <div className="my-5 flex flex-col items-center gap-2">
      <div className="max-w-full overflow-x-auto text-sky-100 bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-fuchsia-500/10 px-6 py-4 rounded-xl border border-sky-400/20 shadow-lg shadow-sky-500/5">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {note && <div className="text-xs text-neutral-500 text-center max-w-md">{note}</div>}
    </div>
  );
};

const Block = ({ children }) => {
  const html = useMemo(() => renderTex(String(children), true), [children]);
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 overflow-x-auto text-neutral-100">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

// --- card primitives --------------------------------------------------------

const accentMap = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  pink:    { text: 'text-pink-400',    border: 'border-pink-400/20',    from: 'from-pink-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, children }) => {
  const a = accentMap[accent];
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm p-6 md:p-8 shadow-xl shadow-black/30 overflow-hidden scroll-mt-24"
    >
      <div className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${a.from} to-transparent blur-2xl opacity-60`} />
      <div className="relative flex items-start gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 bg-white/5 border ${a.border}`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
            {index != null && <span>{String(index).padStart(2, '0')}</span>}
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-neutral-50">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      <div className="relative mt-5 text-neutral-200 text-[15px] leading-relaxed space-y-4">{children}</div>
    </motion.section>
  );
};

const Button = ({ children, onClick, icon: Icon, variant = 'primary', disabled, active }) => {
  const base = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-sky-500/15 border-sky-400/30 hover:bg-sky-500/25 text-sky-100',
    ghost:   'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-200',
    violet:  'bg-violet-500/15 border-violet-400/30 hover:bg-violet-500/25 text-violet-100',
    emerald: 'bg-emerald-500/10 border-emerald-400/20 hover:bg-emerald-500/20 text-emerald-100',
    rose:    'bg-rose-500/10 border-rose-400/20 hover:bg-rose-500/20 text-rose-200',
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${active ? 'ring-1 ring-white/30' : ''}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Tab = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${active ? 'bg-sky-500/15 border-sky-400/30 text-sky-100' : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}>
    {children}
  </button>
);

const Deeper = ({ children }) => (
  <div className="relative mt-6 pt-5 border-t border-white/10">
    <div className="absolute -top-[11px] left-0 flex items-center gap-2 bg-neutral-900/80 pr-2">
      <FlaskConical className="w-3.5 h-3.5 text-violet-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">deeper</span>
    </div>
    <div className="text-sm text-neutral-300 leading-relaxed space-y-3">{children}</div>
  </div>
);

const Slider = ({ label, value, onChange, min, max, step, fmt, accent = 'sky' }) => {
  const accentClass = { sky: 'accent-sky-400', violet: 'accent-violet-400', amber: 'accent-amber-400', emerald: 'accent-emerald-400', fuchsia: 'accent-fuchsia-400', rose: 'accent-rose-400' }[accent];
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-neutral-400 text-xs w-24 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className={`flex-1 ${accentClass}`} />
      <span className="text-neutral-300 text-xs w-14 text-right font-mono">{fmt ? fmt(value) : value}</span>
    </label>
  );
};

const Chip = ({ children, color = 'sky' }) => {
  const map = {
    sky: 'bg-sky-500/10 text-sky-300 border-sky-400/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-400/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-400/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-400/20',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/20',
    pink: 'bg-pink-500/10 text-pink-300 border-pink-400/20',
    orange: 'bg-orange-500/10 text-orange-300 border-orange-400/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
    neutral: 'bg-white/5 text-neutral-300 border-white/10',
  };
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${map[color]}`}>{children}</span>;
};

const PlayCtl = ({ playing, onToggle, onReset, speed, setSpeed }) => (
  <div className="flex items-center gap-3 flex-wrap">
    <Button icon={playing ? Pause : Play} onClick={onToggle} variant="ghost">{playing ? 'pause' : 'play'}</Button>
    <Button icon={RotateCcw} onClick={onReset} variant="ghost">reset</Button>
    <div className="flex items-center gap-2 ml-auto text-xs text-neutral-400">
      <Gauge className="w-3.5 h-3.5" />
      <input type="range" min="0.25" max="3" step="0.05" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-24 accent-fuchsia-400" />
      <span className="w-10 text-right font-mono text-neutral-300">{speed.toFixed(2)}×</span>
    </div>
  </div>
);

// --- Floating tooltip (portaled, edge-flipping) -----------------------------

const FloatingTip = ({ hover, render, width = 300 }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!hover) { setPos(null); return; }
    const el = ref.current;
    const measuredW = el ? el.offsetWidth : width;
    const measuredH = el ? el.offsetHeight : 80;
    const vw = window.innerWidth, vh = window.innerHeight;
    const margin = 10, gap = 14;
    const x = hover.mx ?? 0, y = hover.my ?? 0;
    let left = x + gap;
    if (left + measuredW > vw - margin) left = x - measuredW - gap;
    left = Math.max(margin, Math.min(left, vw - measuredW - margin));
    let top = y - 12;
    if (top + measuredH > vh - margin) top = y - measuredH - gap;
    top = Math.max(margin, Math.min(top, vh - measuredH - margin));
    setPos({ left, top });
  }, [hover, width]);

  if (!hover || typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={ref}
      className="pointer-events-none fixed z-[100] rounded-lg bg-neutral-950/95 border border-white/15 px-3 py-2 text-xs shadow-2xl backdrop-blur-sm"
      style={{
        left: pos?.left ?? -9999,
        top: pos?.top ?? -9999,
        maxWidth: width,
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      {render(hover)}
    </div>,
    document.body
  );
};

// --- Glossary + Term (hover-to-define) --------------------------------------

const GLOSS = {
  'supervised learning': 'Learning a function from labeled (input, target) pairs. The model sees both the question and the answer during training.',
  'unsupervised learning': 'Finding structure in unlabeled data — clusters, factors, density — without any target column.',
  'self-supervised': 'Training on unlabeled data by inventing labels from the data itself (e.g. predict the next token, unmask pixels). Fuel of modern foundation models.',
  'reinforcement learning': 'Learning by acting in an environment and maximizing a reward signal. Covered in depth in the RL explainer.',
  'loss function': 'A scalar number measuring how wrong the model is on one example. Training minimizes its average across the dataset.',
  'gradient descent': 'Follow the negative gradient of the loss w.r.t. the parameters to reduce it. The workhorse optimizer of modern ML.',
  'stochastic gradient descent': 'Gradient descent using a random minibatch per step instead of the whole dataset. Faster, and the noise acts as a regularizer.',
  'backpropagation': 'Reverse-mode automatic differentiation of a computation graph — efficient gradient of the loss w.r.t. every parameter in a neural net.',
  'overfitting': 'The model memorizes training data and generalizes poorly. Low training loss, high test loss.',
  'underfitting': 'The model is too weak / too constrained to capture the pattern. High loss on both train and test.',
  'bias-variance': 'Error ≈ bias² (how far the model class is from the truth on average) + variance (how much its fit wobbles with the sample) + irreducible noise.',
  'regularization': 'Any mechanism that constrains the model to prevent overfitting — weight decay, dropout, early stopping, data augmentation, etc.',
  'L1': 'Penalty proportional to Σ|wᵢ|. Pushes weights to exactly zero, producing sparse models. Also called Lasso.',
  'L2': 'Penalty proportional to Σwᵢ². Shrinks weights smoothly toward zero. Also called Ridge / weight decay.',
  'cross-validation': 'Rotate which slice of the data is held out to get a more stable estimate of out-of-sample error. k-fold is standard.',
  'feature engineering': 'Hand-designing input columns (ratios, log transforms, interactions, domain flags) so a simple model can fit them. Deep learning automates this.',
  'embedding': 'A learned dense vector that represents a discrete thing (word, user, item, image). Similar things end up geometrically close.',
  'convolution': 'Sliding a small filter across an input and taking local dot products. Exploits the fact that images are translation-equivariant.',
  'attention': 'A layer where every position looks at every other position and combines them by learned relevance weights. Core of the Transformer.',
  'softmax': 'Turns a vector of real numbers into a probability distribution by exponentiating and normalizing.',
  'logit': 'The pre-softmax score. The bigger the gap to other logits, the more confident the prediction.',
  'latent': 'An internal variable that the model infers but you never directly observe. E.g. the hidden code in an autoencoder, the noise schedule in a diffusion model.',
  'ensemble': 'A committee of models whose predictions are combined (average, vote, stack). Usually beats any single member.',
  'bagging': 'Train many models on bootstrap samples of the data and average. Reduces variance. Random Forests are bagged decision trees.',
  'boosting': 'Fit a sequence of small models, each correcting the errors of the previous. Reduces bias. XGBoost is the canonical example.',
  'scaling laws': 'Empirical curves showing that test loss falls as a smooth power law in model size, data, and compute — predictable enough to bet billions on.',
  'pretraining': 'The large self-supervised phase where a model learns general statistics of its input distribution (e.g. next-token prediction on web-scale text).',
  'fine-tuning': 'Continue training a pretrained model on a narrower dataset to specialize it (instruction-following, domain knowledge, style).',
  'RLHF': 'Reinforcement Learning from Human Feedback — fine-tune a policy against a reward model trained on human preference comparisons.',
  'DPO': 'Direct Preference Optimization — a 2023 alternative to RLHF that skips the explicit reward model and optimizes the same objective in closed form.',
  'transformer': 'The 2017 architecture built from stacked self-attention + MLP blocks. Underlies essentially every modern foundation model.',
  'MoE': 'Mixture of Experts — replace one big MLP with many smaller ones, routing each token to a few. More parameters at similar FLOPs per token.',
  'SSM': 'State-Space Model — a linear recurrence parameterized to be long-range-friendly. Mamba is the breakout architecture.',
  'diffusion': 'A generative model that learns to denoise random noise into a sample by reversing a gradual noising process.',
  'CLIP': 'Contrastive Language–Image Pretraining — jointly embed images and text captions so semantically matching pairs land close together.',
  'VLM': 'Vision-Language Model — a transformer that takes interleaved text + images as input. GPT-4V, Gemini, Claude 3+ are VLMs.',
  'chain-of-thought': 'Prompting (or training) a model to produce intermediate reasoning tokens before the final answer. Often dramatically lifts accuracy on hard tasks.',
  'test-time compute': 'Spending more compute at inference — longer chains, tree search, multiple samples + verifier — rather than at training. o1/o3-style.',
  'agent': 'A model that takes actions — calling tools, writing files, browsing — iteratively, often inside a loop with feedback, to accomplish a multi-step goal.',
  'MLP': 'Multi-Layer Perceptron — a stack of fully-connected layers with nonlinearities. The basic "neural network".',
  'activation function': 'A nonlinearity applied elementwise after a linear layer. Without it, stacked linear layers collapse to a single linear map.',
  'ReLU': 'Rectified Linear Unit — max(0, x). The default nonlinearity since 2012. Cheap, sparse, non-saturating on the positive side.',
  'vanishing gradient': 'When gradients shrink exponentially back through many layers, the earliest layers barely learn. A core problem RNNs and deep nets faced.',
  'batch normalization': 'Normalize activations across a minibatch so each layer sees a more stable distribution. Lets you train deeper with higher learning rates.',
  'dropout': 'Randomly zero a fraction of activations during training. Forces the network to build redundant, distributed representations.',
  'momentum': 'Accumulate a running average of past gradients and use that as the update direction. Damps oscillation across narrow valleys.',
  'Adam': 'An adaptive-learning-rate optimizer that tracks running first and second moments of the gradient. The de-facto default for deep nets.',
  'kernel trick': 'Work in a (possibly infinite-dim) feature space by only ever computing pairwise inner products through a kernel function K(x, x\').',
  'RBF kernel': 'Gaussian kernel K(x, x\') = exp(-γ‖x−x\'‖²). Default nonlinear kernel for SVMs and kernel ridge.',
  'margin': 'The distance from the decision boundary to the closest data point. SVMs maximize it.',
  'support vector': 'A training point that lies on, inside, or violates the margin — the only ones that define an SVM\'s boundary. The rest can be thrown away.',
  'entropy': 'Average surprise of a distribution, Σ −p log p. Maxed at the uniform distribution; zero at a point mass.',
  'information gain': 'The drop in entropy from splitting a tree node on a feature. Trees greedily pick the split that maximizes it.',
  'Gini impurity': 'Alternative to entropy: 1 − Σpᵢ². Cheaper to compute; ranks splits nearly identically in practice.',
  'bootstrap': 'Sampling with replacement from the dataset. Each sample has the same size; about 63% of distinct rows appear, the rest are OOB (out of bag).',
  'EM': 'Expectation-Maximization — alternate soft-assigning points to latent variables (E) and re-fitting parameters (M). Underlies GMMs, HMMs, many LDAs.',
  'MLE': 'Maximum Likelihood Estimation — pick the parameters that make the observed data most probable.',
  'MAP': 'Maximum a Posteriori — MLE plus a prior. Equivalent to MLE with a regularizer derived from the prior.',
  'SGD': 'Stochastic Gradient Descent.',
  'epoch': 'One full pass through the training dataset. "10 epochs" = the model saw every example 10 times.',
  'minibatch': 'A small subset of the data (e.g. 32, 128, 1M tokens) used for one gradient step.',
  'learning rate': 'The scalar step size in gradient descent. Too big: divergence; too small: glacial training. The single most tuned hyperparameter.',
  'ROC-AUC': 'Area under the ROC curve — probability a random positive scores higher than a random negative. Threshold-independent classifier quality.',
  'tokens': 'The discrete units a language model sees. Typically subword pieces: "tokenization" ≈ 3–4 tokens.',
  'logits': 'Pre-softmax scores of a classifier or language model.',
  'KV cache': 'Stored keys and values from past tokens in a transformer, so generation doesn\'t recompute attention over the whole history each step.',
  'tokenizer': 'The map from raw bytes to token IDs. Usually byte-pair encoding or SentencePiece. Subtle but load-bearing.',
  'prompt': 'The text (and optionally images / tools) you condition a language model on at inference.',
  'RNN': 'Recurrent Neural Network — processes a sequence one step at a time, carrying a hidden state. Dominated NLP before transformers.',
  'LSTM': 'Long Short-Term Memory — a gated RNN cell (1997) designed to ease vanishing gradients. The pre-transformer NLP workhorse.',
  'GRU': 'Gated Recurrent Unit — a lighter-weight LSTM variant (2014). Two gates instead of three.',
  'CNN': 'Convolutional Neural Network — alternating convolutional + pooling layers. Dominated vision from AlexNet (2012) to ViT (2020).',
  'ViT': 'Vision Transformer — split an image into patches, treat patches as tokens, run a transformer. Beats CNNs at scale.',
  'UNet': 'A CNN with symmetric encoder/decoder and skip connections. The standard denoising backbone in diffusion models.',
  'flow matching': 'A generative framework (2023) that trains a vector field to transport noise to data. A cleaner cousin of diffusion; now common in image/video models.',
  'tabular': 'Structured rows-and-columns data (SQL tables, CSVs). Gradient-boosted trees remain SOTA here despite deep learning\'s success elsewhere.',
  'feature map': 'The multi-channel output of a convolutional layer. Each channel corresponds to a learned detector.',
  'receptive field': 'The region of the input that a given unit in a deep net can see. Grows with depth and with pooling/stride.',
  'skip connection': 'An identity shortcut around a block (ResNet, UNet). Lets gradients flow and makes very deep nets trainable.',
  'residual': 'The value learned by a skip-connection block — the "correction" added to the identity path. Hence "ResNet".',
  'transformer block': 'One layer of: self-attention → residual + layernorm → MLP → residual + layernorm. Stacked 12–120+ deep in modern models.',
  'layernorm': 'Normalize activations per-token across features. Stabilizes very deep transformers; cheaper and more parallel than batchnorm at sequence scale.',
  'positional encoding': 'How a transformer learns token order — added to embeddings (sinusoidal, learned, RoPE). Without it the model is permutation-invariant.',
  'RoPE': 'Rotary Position Embedding — rotate query/key vectors by position-dependent angles. The dominant PE in modern LLMs.',
  'foundation model': 'A single model pretrained once at scale and adapted to many downstream tasks.',
  'in-context learning': 'A pretrained LLM solving a new task from a few examples in the prompt — no weight update. Surprised everyone in 2020.',
  'emergence': 'Capabilities that appear abruptly as a model scales (arithmetic, multi-step reasoning). Contested; likely an artifact of non-linear metrics, but the scaling is real.',
  'tool use': 'Letting a model call external APIs (search, code runners, DBs) during inference to offload facts and computation from its weights.',
  'MCP': 'Model Context Protocol — an open spec for how tools, data sources, and models plug into each other. The USB-C of agents.',
  'classifier': 'A model whose output is a class label (spam / not spam, digit 0–9). Distinct from a regressor, whose output is continuous.',
  'regressor': 'A model whose output is a real number.',
  'decision boundary': 'The surface in input space where a classifier switches from predicting one class to another.',
  'hyperparameter': 'A knob set before training starts (learning rate, number of trees, regularization strength). Tuned on validation data, not learned by gradient descent.',
  'validation set': 'A held-out slice of the data used to tune hyperparameters and pick the best model. Distinct from the test set, which is touched once at the end.',
  'PCA': 'Principal Component Analysis — orthogonal axes that capture maximum variance. The simplest and most-abused dimensionality reduction.',
  't-SNE': 't-Distributed Stochastic Neighbor Embedding — preserves local neighborhoods at the cost of global geometry. Pretty; easily overinterpreted.',
  'UMAP': 'Uniform Manifold Approximation and Projection — like t-SNE but faster, preserves some global structure, now the default 2D embedding plot.',
  'k-means': 'Alternate assigning each point to the nearest centroid (E step) and recomputing centroids (M step). Minimizes within-cluster squared distance.',
  'DBSCAN': 'Density-Based Spatial Clustering — grows clusters from core points with ≥ MinPts neighbors inside ε. No preset k; handles noise and weird shapes.',
  'GMM': 'Gaussian Mixture Model — fit K Gaussians to the data by EM. Soft clustering + density estimate in one model.',
  'HMM': 'Hidden Markov Model — a sequence model where each step has a latent state that evolves via a Markov chain and emits an observation. Pre-deep-learning speech and bio workhorse.',
  'logistic regression': 'Linear model whose output is squashed through a sigmoid and interpreted as P(class=1). The simplest classifier that still works.',
  'Naive Bayes': 'Assume all features are conditionally independent given the class. Absurd assumption; works shockingly well for text.',
  'k-NN': 'k-Nearest Neighbors — no training phase; at prediction time, look up the k closest training points and vote.',
  'XGBoost': 'Extreme Gradient Boosting (2014) — a highly optimized gradient-boosted-tree library. Still the default starting point for tabular Kaggle.',
  'LightGBM': 'Microsoft\'s gradient-boosted-tree library. Faster than XGBoost on large datasets via histogram-based splits and leaf-wise growth.',
  'CatBoost': 'Yandex\'s gradient-boosted-tree library. Strong out-of-the-box on categorical features via ordered target encoding.',
  'AdaBoost': 'The 1997 boosting algorithm. Reweight misclassified examples each round and fit a weak learner on the reweighted set.',
  'random forest': 'Bagged decision trees with extra randomness: each split only considers a random subset of features. Strong, cheap, hard to mess up.',
};

const Term = ({ children, def }) => {
  const [hover, setHover] = useState(null);
  const key = typeof children === 'string' ? children : '';
  const definition = def ?? GLOSS[key] ?? GLOSS[key.toLowerCase()];
  if (!definition) return <span>{children}</span>;
  return (
    <>
      <span
        className="underline decoration-dotted decoration-violet-300/60 underline-offset-[3px] cursor-help"
        onMouseEnter={(e) => setHover({ mx: e.clientX, my: e.clientY })}
        onMouseMove={(e) => setHover({ mx: e.clientX, my: e.clientY })}
        onMouseLeave={() => setHover(null)}
      >
        {children}
      </span>
      <FloatingTip
        hover={hover}
        width={320}
        render={() => (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-violet-300 font-mono">{key}</div>
            <div className="text-neutral-200 leading-snug">{definition}</div>
          </div>
        )}
      />
    </>
  );
};

// --- Pedagogy primitives ----------------------------------------------------

const MinSchema = ({ children }) => (
  <div className="rounded-lg bg-sky-500/[0.06] border border-sky-400/20 px-4 py-2.5 text-[13px] text-sky-100/90 flex items-start gap-2.5">
    <CircleDot className="w-4 h-4 mt-0.5 shrink-0 text-sky-300" />
    <div><span className="uppercase text-[10px] tracking-widest text-sky-300 mr-2 font-mono">core</span>{children}</div>
  </div>
);

const WhenItMatters = ({ children }) => (
  <div className="rounded-lg bg-amber-500/[0.06] border border-amber-400/20 px-4 py-2.5 text-[13px] text-amber-100/90 flex items-start gap-2.5">
    <Target className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" />
    <div><span className="uppercase text-[10px] tracking-widest text-amber-300 mr-2 font-mono">when it matters</span>{children}</div>
  </div>
);

const Misconception = ({ think, actually }) => (
  <div className="rounded-lg bg-rose-500/[0.05] border border-rose-400/20 px-4 py-3 text-sm">
    <div className="flex items-start gap-2.5">
      <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-rose-300" />
      <div className="space-y-1.5">
        <div><span className="uppercase text-[10px] tracking-widest text-rose-300 mr-2 font-mono">common belief</span><span className="text-rose-100/90">{think}</span></div>
        <div><span className="uppercase text-[10px] tracking-widest text-emerald-300 mr-2 font-mono">actually</span><span className="text-neutral-200">{actually}</span></div>
      </div>
    </div>
  </div>
);

const QA = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(o => !o)} className="w-full text-left rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-2.5 transition-colors">
      <div className="flex items-start gap-2.5">
        <HelpCircle className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${open ? 'text-emerald-300' : 'text-neutral-400'}`} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] text-neutral-100">{q}</div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <div className="pt-1.5 mt-1.5 border-t border-white/10 text-sm text-neutral-300">{a}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </button>
  );
};

const Predict = ({ prompt, children }) => {
  const [shown, setShown] = useState(false);
  return (
    <div className="rounded-lg bg-violet-500/[0.06] border border-violet-400/20 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <Telescope className="w-4 h-4 mt-0.5 shrink-0 text-violet-300" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-violet-300 font-mono mb-1">predict first</div>
          <div className="text-[13px] text-violet-100/90">{prompt}</div>
          {!shown ? (
            <button onClick={() => setShown(true)} className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-violet-500/15 border border-violet-400/30 text-violet-100">
              reveal <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-neutral-200">{children}</motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const CrossLink = ({ label, to, note }) => (
  <a href={to} className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-md bg-sky-500/10 border border-sky-400/20 text-sky-200 hover:bg-sky-500/20 transition-colors">
    <Link2 className="w-3 h-3" /> {label}
    {note && <span className="text-neutral-400 font-sans normal-case ml-1 text-[10px]">{note}</span>}
  </a>
);

// --- hero + nav -------------------------------------------------------------

const DotField = () => {
  const dots = useMemo(() => Array.from({ length: 44 }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.6 + 0.4, d: Math.random() * 5 + 4, dy: Math.random() * 8 + 4,
  })), []);
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="mlDotGlow">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="1" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((d) => (
        <motion.circle key={d.id} cx={d.x} cy={d.y} r={d.r} fill="url(#mlDotGlow)"
          initial={{ opacity: 0.2 }}
          animate={{ cy: [d.y, (d.y + d.dy) % 100, d.y], opacity: [0.15, 0.75, 0.15] }}
          transition={{ duration: d.d, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-sky-500/5 to-transparent" />
    <DotField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-200/80 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-400/20">
          <Brain className="w-3.5 h-3.5" /> an interactive overview
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-violet-100 to-sky-200 bg-clip-text text-transparent">
          Machine Learning
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          From least-squares in 1805 to trillion-parameter transformers that write code — the whole arc of how machines learn from data, visualized one card at a time.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">x inputs</span>
          <span className="text-pink-300">y targets</span>
          <span className="text-violet-300">w params</span>
          <span className="text-rose-300">ℒ loss</span>
          <span className="text-emerald-300">∇ gradient</span>
          <span className="text-fuchsia-300">ŷ prediction</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const ACTS = [
  { id: 'act-1', label: 'Foundations' },
  { id: 'act-2', label: 'Classical supervised' },
  { id: 'act-3', label: 'Classical unsupervised' },
  { id: 'act-4', label: 'Deep learning' },
  { id: 'act-5', label: 'Modern & frontier' },
  { id: 'act-6', label: 'Next trails' },
];

const SectionNav = () => {
  const [active, setActive] = useState('act-1');
  useEffect(() => {
    const onScroll = () => {
      let current = ACTS[0].id;
      for (const a of ACTS) {
        const el = document.getElementById(a.id);
        if (el && el.getBoundingClientRect().top - 100 <= 0) current = a.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <nav className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-20">
        <ul className="space-y-1.5 text-xs">
          {ACTS.map((a, i) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className={`group flex items-center gap-2 py-1 pl-3 pr-3 rounded-lg border transition-colors ${active === a.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                <span className="font-mono tabular-nums text-[10px] opacity-60">0{i + 1}</span>
                <span className="tracking-wide">{a.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="lg:hidden sticky top-0 z-20 backdrop-blur-md bg-neutral-950/70 border-b border-white/10 overflow-x-auto">
        <ul className="flex gap-1 px-3 py-2 text-[11px] whitespace-nowrap">
          {ACTS.map((a, i) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className={`block px-3 py-1.5 rounded-md border ${active === a.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">0{i + 1}</span>{a.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

const ActHeader = ({ id, n, title, blurb }) => (
  <div id={id} className="scroll-mt-24 flex flex-col items-start gap-2 pt-4 pb-2">
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-violet-300/80 font-mono">
      <span>act {n}</span>
      <span className="h-px w-10 bg-violet-400/30" />
    </div>
    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-50">{title}</h2>
    {blurb && <p className="text-neutral-400 max-w-2xl">{blurb}</p>}
  </div>
);

/* =============================================================================
   ACT 1 — FOUNDATIONS
   ============================================================================= */

// --- 1. taxonomy ------------------------------------------------------------

const TAXA = [
  {
    id: 'sup', title: 'Supervised', color: 'sky', icon: Target,
    blurb: 'Learn y ≈ f(x) from labeled pairs. Regression (y real), classification (y class).',
    examples: ['spam filter', 'house-price regression', 'image classifier', 'credit scoring'],
    formula: '\\x{x} \\mapsto \\y{y}',
  },
  {
    id: 'unsup', title: 'Unsupervised', color: 'emerald', icon: Boxes,
    blurb: 'No labels. Find structure: clusters, factors, density, anomalies.',
    examples: ['customer segmentation', 'PCA on genes', 'anomaly detection', 'topic modeling'],
    formula: '\\x{x} \\mapsto \\text{structure}(\\x{x})',
  },
  {
    id: 'ssl', title: 'Self-supervised', color: 'violet', icon: Sparkles,
    blurb: 'No human labels — invent them from the data itself. Fuel of foundation models.',
    examples: ['next-token prediction', 'masked autoencoding', 'contrastive image-text (CLIP)'],
    formula: '\\x{x_{\\text{part}}} \\mapsto \\x{x_{\\text{rest}}}',
  },
  {
    id: 'rl', title: 'Reinforcement', color: 'amber', icon: Bot,
    blurb: 'Learn a policy by acting and receiving reward. Explored in depth in the RL explainer.',
    examples: ['AlphaGo', 'robotic control', 'RLHF for LLMs', 'recommendation'],
    formula: '\\w{\\pi}: s \\mapsto a, \\text{ maximize } \\hp{\\mathbb{E}[\\sum r]}',
  },
];

const TaxonomyCard = () => {
  const [sel, setSel] = useState('sup');
  const t = TAXA.find(x => x.id === sel);
  return (
    <Card id="c-taxonomy" icon={MapIcon} title="The four flavors of learning" subtitle="What the model gets to see during training — the single biggest axis across ML." accent="sky" index={1}>
      <MinSchema>ML = learn a function from data. What kind of data (labeled? rewarded? unlabeled?) determines which flavor you're doing.</MinSchema>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {TAXA.map(x => {
          const I = x.icon;
          return (
            <button key={x.id} onClick={() => setSel(x.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${sel === x.id ? `bg-${x.color}-500/15 border-${x.color}-400/40` : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}>
              <I className={`w-4 h-4 text-${x.color}-300 mb-2`} />
              <div className="text-sm text-neutral-100 font-medium">{x.title}</div>
              <div className="text-[11px] text-neutral-500 mt-1 leading-snug">{x.blurb.split('.')[0]}.</div>
            </button>
          );
        })}
      </div>
      <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-neutral-400">
          <span className={`text-${t.color}-300`}>{t.title.toLowerCase()}</span>
          <span>·</span>
          <Eq>{t.formula}</Eq>
        </div>
        <div className="text-sm text-neutral-200">{t.blurb}</div>
        <div className="flex flex-wrap gap-1.5">
          {t.examples.map(e => <Chip key={e} color={t.color}>{e}</Chip>)}
        </div>
      </motion.div>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="Is a language model supervised or self-supervised?"
          a="Self-supervised during pretraining — the label 'next token' is just the next piece of the same text. After SFT/RLHF it blends in supervised and RL signals." />
        <QA q="Semi-supervised learning?"
          a="A mix: small labeled set + large unlabeled set. Common in medical imaging. Modern form: pretrain self-supervised on the unlabeled pool, fine-tune on the labels." />
      </div>
      <Deeper>
        <p>The boundaries blur once you look closely. <Term>RLHF</Term> is RL with a reward model trained from supervised preference pairs. <Term>CLIP</Term> is self-supervised (caption ↔ image) but the objective is a contrastive classification. "Supervised learning" as a category is really a question about <em>where the training signal comes from</em>, not the model's architecture.</p>
        <p><strong>Why it still matters in 2026:</strong> picking a flavor is picking what's cheap. Labels are expensive; raw data is nearly free. The last 15 years of ML progress is mostly a story of moving as much learning as possible off the labeled budget and onto self-supervised pretraining, then adding a small supervised / RL cherry on top.</p>
      </Deeper>
    </Card>
  );
};

// --- 2. core loop (gradient descent) ---------------------------------------

const GradientDescentDemo = () => {
  // loss(w) = (w-1)^2 * 0.5 + 0.3*sin(3w)+0.3
  const loss = (w) => 0.5 * (w - 1) ** 2 + 0.3 * Math.sin(3 * w) + 0.35;
  const grad = (w) => (w - 1) + 0.9 * Math.cos(3 * w);
  const [lr, setLr] = useState(0.15);
  const [w, setW] = useState(-2.3);
  const [trail, setTrail] = useState([-2.3]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setW(prev => {
        const next = prev - lr * grad(prev);
        setTrail(t => [...t.slice(-60), next]);
        return next;
      });
    }, 400 / speed);
    return () => clearInterval(id);
  }, [playing, speed, lr]);

  const reset = () => { setW(-2.3); setTrail([-2.3]); setPlaying(false); };

  const W = 620, H = 220;
  const xMin = -3, xMax = 4, yMin = 0, yMax = 4;
  const xs = Array.from({ length: 200 }, (_, i) => xMin + (xMax - xMin) * i / 199);
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;
  const path = xs.map(x => `${sx(x)},${sy(loss(x))}`).join(' ');

  return (
    <Card id="c-gd" icon={Sigma} title="The core loop: predict → loss → gradient → update" subtitle="Nearly every modern ML algorithm, in four steps." accent="violet" index={2}>
      <MinSchema>Every training step: compute a prediction, compare to the target via a <Term>loss function</Term>, take its gradient w.r.t. the parameters, nudge the parameters against the gradient.</MinSchema>
      <KeyEq note="One step of gradient descent — learning rate α controls step size.">{'\\w{w_{t+1}} = \\w{w_t} - \\hp{\\alpha}\\, \\gd{\\nabla_w \\loss{\\mathcal{L}}(\\w{w_t})}'}</KeyEq>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono">
          <span>loss(w) — drag the walker or press play</span>
          <span>w = <span className="text-violet-200">{w.toFixed(3)}</span> · ℒ = <span className="text-rose-200">{loss(w).toFixed(3)}</span></span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const vx = xMin + ((e.clientX - r.left) / r.width) * (xMax - xMin);
          setW(vx); setTrail([vx]); setPlaying(false);
        }}>
          <defs>
            <linearGradient id="gdLoss" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fca5a5" stopOpacity="0.4" />
              <stop offset="1" stopColor="#fca5a5" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polyline points={`${path} ${sx(xMax)},${H} ${sx(xMin)},${H}`} fill="url(#gdLoss)" stroke="none" />
          <polyline points={path} fill="none" stroke="#fca5a5" strokeWidth="1.5" opacity="0.9" />
          {trail.map((t, i) => (
            <circle key={i} cx={sx(t)} cy={sy(loss(t))} r={i === trail.length - 1 ? 5 : 2} fill="#c4b5fd" opacity={0.25 + 0.75 * (i / trail.length)} />
          ))}
          {/* gradient arrow at w */}
          <line x1={sx(w)} y1={sy(loss(w))} x2={sx(w - 0.6 * Math.sign(grad(w)))} y2={sy(loss(w))} stroke="#6ee7b7" strokeWidth="2" markerEnd="url(#arrGd)" />
          <defs>
            <marker id="arrGd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill="#6ee7b7" />
            </marker>
          </defs>
          <text x={sx(w) + 10} y={sy(loss(w)) - 8} fill="#c4b5fd" fontSize="11" fontFamily="monospace">w</text>
        </svg>
        <div className="grid sm:grid-cols-2 gap-3">
          <Slider label="learning rate α" value={lr} onChange={setLr} min={0.01} max={0.6} step={0.01} accent="amber" fmt={v => v.toFixed(2)} />
          <PlayCtl playing={playing} onToggle={() => setPlaying(p => !p)} onReset={reset} speed={speed} setSpeed={setSpeed} />
        </div>
        <div className="text-[11px] text-neutral-500">Crank α up: watch it jump past the minimum and oscillate or diverge. Crank it down: convergence is smooth but glacial. This trade-off is the entire job of an optimizer.</div>
      </div>
      <Predict prompt="If you double the learning rate, what happens to the number of steps to converge?">
        Not half — there's a sweet spot. Below it, steps × α is roughly constant (so doubling α halves steps). Above it, you overshoot and either oscillate or diverge, and step count <em>increases</em>. Modern optimizers like <Term>Adam</Term> adapt α per-parameter to sidestep this.
      </Predict>
      <div className="grid sm:grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-sky-300 font-mono uppercase text-[10px] tracking-widest mb-1">full-batch GD</div>
          <div className="text-neutral-300">Gradient over the whole dataset. Stable but one step requires a full pass. Almost never used at scale.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-violet-300 font-mono uppercase text-[10px] tracking-widest mb-1"><Term>SGD</Term></div>
          <div className="text-neutral-300">Pick one example per step. Noisy, but cheap — and the noise helps escape saddle points and shallow minima.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-emerald-300 font-mono uppercase text-[10px] tracking-widest mb-1">minibatch SGD</div>
          <div className="text-neutral-300">Pick 32–1M examples per step. The universal default: good gradient estimate + GPU-friendly.</div>
        </div>
      </div>
      <Misconception think="The loss surface of a neural net is full of bad local minima that trap SGD." actually="In high dimensions, nearly all critical points are saddle points, not minima; and the minima you do find have very similar loss. This was a major 2014–2016 result and part of why deep learning works at all." />
      <Deeper>
        <p><strong>Why the gradient, specifically?</strong> It's the direction of steepest local increase in ℒ, so the negative gradient is the direction of steepest local decrease. First-order methods (gradient only) are the sweet spot: cheap to compute via <Term>backpropagation</Term>, and "good enough" in the giant parameter spaces of modern models. Second-order methods (use the Hessian) are more accurate per step but cost O(n²) memory and O(n³) to invert — a non-starter at billion-parameter scale.</p>
        <p><strong>Modern optimizers all add two ideas to the basic update:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><Term>Momentum</Term>: accumulate past gradients so consistent directions build speed, zig-zag noise cancels. Fixes SGD's oscillation in narrow valleys.</li>
          <li>Per-parameter adaptive scaling: divide by a running estimate of the gradient's magnitude (RMSProp, <Term>Adam</Term>, AdamW). Rare, small-magnitude gradients (e.g. for an embedding of a rare token) get scaled up.</li>
        </ul>
        <p><strong>Trade-off:</strong> Adam-family optimizers converge faster in wall clock and "just work" out of the box, but plain SGD + momentum still generalizes slightly better on image classification. Rule of thumb: Adam / AdamW for transformers and big NLP, SGD+momentum for ResNets/ImageNet, both for everything else.</p>
      </Deeper>
    </Card>
  );
};

// --- 3. bias / variance -----------------------------------------------------

const BiasVarianceDemo = () => {
  const [degree, setDegree] = useState(3);
  const [seed, setSeed] = useState(7);
  // generate "true" function and noisy sample
  const trueF = (x) => Math.sin(1.4 * x) + 0.3 * x;
  const rand = useMemo(() => {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }, [seed]);
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 18; i++) {
      const x = -2.2 + 4.4 * (i / 17);
      arr.push({ x, y: trueF(x) + (rand() - 0.5) * 0.6 });
    }
    return arr;
  }, [seed, rand]);

  // polyfit least squares
  const fit = useMemo(() => {
    const n = pts.length, d = degree;
    // build X matrix
    const X = pts.map(p => Array.from({ length: d + 1 }, (_, j) => Math.pow(p.x, j)));
    const y = pts.map(p => p.y);
    // normal equation: (XᵀX) w = Xᵀy
    const XtX = Array.from({ length: d + 1 }, () => Array(d + 1).fill(0));
    const Xty = Array(d + 1).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j <= d; j++) {
      Xty[j] += X[i][j] * y[i];
      for (let k = 0; k <= d; k++) XtX[j][k] += X[i][j] * X[i][k];
    }
    // gaussian elimination
    const A = XtX.map((r, i) => [...r, Xty[i]]);
    const m = d + 1;
    for (let i = 0; i < m; i++) {
      let piv = i;
      for (let k = i + 1; k < m; k++) if (Math.abs(A[k][i]) > Math.abs(A[piv][i])) piv = k;
      [A[i], A[piv]] = [A[piv], A[i]];
      const pv = A[i][i] || 1e-9;
      for (let k = i; k <= m; k++) A[i][k] /= pv;
      for (let r = 0; r < m; r++) if (r !== i) {
        const f = A[r][i];
        for (let k = i; k <= m; k++) A[r][k] -= f * A[i][k];
      }
    }
    return A.map(r => r[m]);
  }, [pts, degree]);

  const predict = (x) => fit.reduce((s, w, j) => s + w * Math.pow(x, j), 0);
  const trainMSE = useMemo(() => pts.reduce((s, p) => s + (predict(p.x) - p.y) ** 2, 0) / pts.length, [pts, fit]);
  // test MSE on many fresh noiseless samples
  const testMSE = useMemo(() => {
    let s = 0, n = 80;
    for (let i = 0; i < n; i++) {
      const x = -2.2 + 4.4 * (i / (n - 1));
      s += (predict(x) - trueF(x)) ** 2;
    }
    return s / n;
  }, [fit]);

  const W = 520, H = 220;
  const xMin = -2.5, xMax = 2.5, yMin = -3, yMax = 3.5;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;
  const truePath = Array.from({ length: 200 }, (_, i) => { const x = xMin + (xMax - xMin) * i / 199; return `${sx(x)},${sy(trueF(x))}`; }).join(' ');
  const fitPath = Array.from({ length: 200 }, (_, i) => { const x = xMin + (xMax - xMin) * i / 199; return `${sx(x)},${sy(predict(x))}`; }).join(' ');

  let regime = 'good fit';
  let regimeColor = 'text-emerald-300';
  if (degree <= 1) { regime = 'underfit (high bias)'; regimeColor = 'text-amber-300'; }
  if (degree >= 9) { regime = 'overfit (high variance)'; regimeColor = 'text-rose-300'; }

  return (
    <Card id="c-biasvar" icon={Scale} title="Bias, variance, and the U-shape of test error" subtitle="Why more complex models aren't always better." accent="amber" index={3}>
      <MinSchema>Test error ≈ bias² + variance + noise. You want the model flexible enough to fit the truth, not so flexible that it fits the noise.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono flex-wrap">
          <span>polynomial degree {degree} · <span className={regimeColor}>{regime}</span></span>
          <span>train MSE = <span className="text-sky-200">{trainMSE.toFixed(2)}</span> · test MSE = <span className="text-rose-200">{testMSE.toFixed(2)}</span></span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <polyline points={truePath} fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
          <polyline points={fitPath} fill="none" stroke="#c4b5fd" strokeWidth="2" />
          {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.2} fill="#7dd3fc" />)}
        </svg>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-emerald-300" /> true function</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-violet-300" /> fitted polynomial</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 bg-sky-300 rounded-full" /> noisy training samples</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Slider label="degree" value={degree} onChange={(v) => setDegree(Math.round(v))} min={1} max={14} step={1} accent="violet" />
          <div className="flex items-center gap-2">
            <Button icon={Shuffle} variant="ghost" onClick={() => setSeed(s => s + 1)}>new sample</Button>
            <span className="text-[11px] text-neutral-500">same true function, new noise draw</span>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-amber-500/[0.06] border border-amber-400/20 p-3">
          <div className="text-amber-300 font-mono uppercase text-[10px] tracking-widest mb-1">underfit · low degree</div>
          <div className="text-neutral-200">Model class too rigid. Both train and test error high. Fix: more features, more capacity, less regularization.</div>
        </div>
        <div className="rounded-lg bg-emerald-500/[0.06] border border-emerald-400/20 p-3">
          <div className="text-emerald-300 font-mono uppercase text-[10px] tracking-widest mb-1">sweet spot</div>
          <div className="text-neutral-200">Train error low, test error low. Usually found by cross-validation over a regularization or capacity knob.</div>
        </div>
        <div className="rounded-lg bg-rose-500/[0.06] border border-rose-400/20 p-3">
          <div className="text-rose-300 font-mono uppercase text-[10px] tracking-widest mb-1">overfit · high degree</div>
          <div className="text-neutral-200">Train error near zero, test error blows up. Fix: more data, regularization, early stopping, simpler class.</div>
        </div>
      </div>
      <Misconception
        think="Bigger models always overfit more."
        actually="In the classical regime, yes. But at very large scale (modern deep learning), test error re-descends past the interpolation threshold — the 'double descent' curve. You can sometimes fix overfitting by making the model bigger, not smaller." />
      <Deeper>
        <p><strong>The decomposition.</strong> For a regressor f̂ trained on a random dataset, at a fixed test point x*:</p>
        <Block>{'\\E[(\\mo{\\hat f}(x^*) - \\y{y^*})^2] = \\underbrace{(\\E[\\mo{\\hat f}(x^*)] - \\y{f(x^*)})^2}_{\\text{bias}^2} + \\underbrace{\\E[(\\mo{\\hat f}(x^*) - \\E[\\mo{\\hat f}(x^*)])^2]}_{\\text{variance}} + \\underbrace{\\sigma^2}_{\\text{noise}}'}</Block>
        <p>Bias shrinks as model class expands; variance grows; noise is irreducible. The optimum is where their sum is minimized.</p>
        <p><strong>Why it matters in practice:</strong> diagnosing high bias vs. high variance changes what you do next. High bias → try a bigger model, fewer constraints, better features. High variance → more data, more regularization, simpler model, or ensembling. The <Term>cross-validation</Term> curve (train vs. val loss across capacity) tells you which side you're on.</p>
        <p><strong>Double descent</strong> (Belkin et al., 2019) showed that past the point where the model can perfectly memorize the training set, test error can start dropping again. Modern LLMs live well into this second-descent regime: billions of parameters, trained to near-zero training loss, yet generalizing.</p>
      </Deeper>
    </Card>
  );
};

/* =============================================================================
   ACT 2 — CLASSICAL SUPERVISED
   ============================================================================= */

// --- 4. linear & logistic regression ----------------------------------------

const LinearRegressionDemo = () => {
  const [pts, setPts] = useState(() => [
    { x: 1, y: 1.2 }, { x: 2, y: 1.9 }, { x: 3, y: 2.4 }, { x: 4, y: 3.7 },
    { x: 5, y: 4.1 }, { x: 6, y: 4.8 }, { x: 7, y: 6.1 }, { x: 8, y: 6.3 },
  ]);
  const [mode, setMode] = useState('reg'); // reg | cls
  // regression fit
  const fit = useMemo(() => {
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p.x, 0) / n;
    const my = pts.reduce((s, p) => s + p.y, 0) / n;
    const num = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
    const den = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
    const slope = num / (den || 1);
    const inter = my - slope * mx;
    const mse = pts.reduce((s, p) => s + (slope * p.x + inter - p.y) ** 2, 0) / n;
    return { slope, inter, mse };
  }, [pts]);

  // classification: pts where y > 3.5 are class 1
  const clsPts = useMemo(() => pts.map(p => ({ x: p.x, label: p.y > 3.5 ? 1 : 0 })), [pts]);
  // simple logistic fit via gradient descent
  const logistic = useMemo(() => {
    let a = 0, b = 0;
    const sig = (z) => 1 / (1 + Math.exp(-z));
    for (let i = 0; i < 600; i++) {
      let da = 0, db = 0;
      for (const p of clsPts) {
        const z = a * p.x + b;
        const pr = sig(z);
        da += (pr - p.label) * p.x;
        db += (pr - p.label);
      }
      a -= 0.05 * da / clsPts.length;
      b -= 0.05 * db / clsPts.length;
    }
    return { a, b };
  }, [clsPts]);

  const W = 560, H = 230;
  const xMin = 0, xMax = 9, yMin = 0, yMax = 8;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

  const [drag, setDrag] = useState(null);
  const onDown = (i) => (e) => { e.stopPropagation(); setDrag(i); };
  const onMove = (e) => {
    if (drag == null) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(xMin, Math.min(xMax, xMin + ((e.clientX - r.left) / r.width) * (xMax - xMin)));
    const y = Math.max(yMin, Math.min(yMax, yMax - ((e.clientY - r.top) / r.height) * (yMax - yMin)));
    setPts(p => p.map((q, j) => j === drag ? { x, y } : q));
  };
  const onUp = () => setDrag(null);

  const sigPath = Array.from({ length: 200 }, (_, i) => {
    const x = xMin + (xMax - xMin) * i / 199;
    const p = 1 / (1 + Math.exp(-(logistic.a * x + logistic.b)));
    return `${sx(x)},${sy(yMin + (yMax - yMin) * p / 1.2)}`;
  }).join(' ');
  const decisionX = -logistic.b / (logistic.a || 1e-9);

  return (
    <Card id="c-linreg" icon={LineChart} title="Linear & logistic regression" subtitle="The two oldest models still in daily production use." accent="sky" index={4}>
      <MinSchema>Linear regression fits <Eq>{'\\mo{\\hat y} = \\w{w} \\x{x} + \\w{b}'}</Eq> by minimizing squared error. Logistic regression fits the same linear form but passes it through a sigmoid so output is a probability.</MinSchema>
      <div className="flex items-center gap-2 flex-wrap">
        <Tab active={mode === 'reg'} onClick={() => setMode('reg')}>Regression</Tab>
        <Tab active={mode === 'cls'} onClick={() => setMode('cls')}>Logistic classification</Tab>
        <span className="ml-auto text-[11px] text-neutral-500">drag any point</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          {/* axes */}
          <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="#ffffff14" />
          <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="#ffffff14" />
          {mode === 'reg' && (
            <>
              {/* regression line + residuals */}
              {pts.map((p, i) => (
                <line key={`r${i}`} x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(fit.slope * p.x + fit.inter)} stroke="#fca5a5" strokeWidth="1" opacity="0.7" />
              ))}
              <line x1={sx(xMin)} y1={sy(fit.slope * xMin + fit.inter)} x2={sx(xMax)} y2={sy(fit.slope * xMax + fit.inter)} stroke="#c4b5fd" strokeWidth="2" />
              {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={5} fill="#7dd3fc" stroke="#0369a1" strokeWidth="1.5" onPointerDown={onDown(i)} style={{ cursor: 'grab' }} />)}
            </>
          )}
          {mode === 'cls' && (
            <>
              <polyline points={sigPath} fill="none" stroke="#c4b5fd" strokeWidth="2" />
              {decisionX > xMin && decisionX < xMax && (
                <line x1={sx(decisionX)} y1={0} x2={sx(decisionX)} y2={H} stroke="#f0abfc" strokeWidth="1.5" strokeDasharray="4 3" />
              )}
              {clsPts.map((p, i) => (
                <circle key={i} cx={sx(p.x)} cy={sy(p.label ? yMax * 0.95 : yMin + (yMax - yMin) * 0.05)}
                  r={5} fill={p.label ? '#f9a8d4' : '#7dd3fc'} stroke="#18181b" strokeWidth="1.5"
                  onPointerDown={onDown(i)} style={{ cursor: 'grab' }} />
              ))}
            </>
          )}
        </svg>
        <div className="mt-2 text-[11px] text-neutral-400 font-mono flex flex-wrap gap-x-5 gap-y-1">
          {mode === 'reg' ? (
            <>
              <span>slope w = <span className="text-violet-200">{fit.slope.toFixed(2)}</span></span>
              <span>intercept b = <span className="text-violet-200">{fit.inter.toFixed(2)}</span></span>
              <span>MSE = <span className="text-rose-200">{fit.mse.toFixed(2)}</span></span>
            </>
          ) : (
            <>
              <span>a = <span className="text-violet-200">{logistic.a.toFixed(2)}</span></span>
              <span>b = <span className="text-violet-200">{logistic.b.toFixed(2)}</span></span>
              <span>decision x ≈ <span className="text-fuchsia-200">{decisionX.toFixed(2)}</span></span>
            </>
          )}
        </div>
      </div>
      <Worked>
        <div className="font-mono text-[11px] uppercase tracking-widest text-emerald-300 mb-1">worked example</div>
        <p>Say you have one feature: square-footage <Eq>{'\\x{x}'}</Eq>. The closed-form OLS fit solves</p>
        <Block>{'\\w{w} = \\frac{\\sum(\\x{x_i}-\\bar{\\x{x}})(\\y{y_i}-\\bar{\\y{y}})}{\\sum(\\x{x_i}-\\bar{\\x{x}})^2},\\quad \\w{b} = \\bar{\\y{y}} - \\w{w}\\bar{\\x{x}}'}</Block>
        <p>No iteration needed. In d features it generalizes to <Eq>{'\\w{\\mathbf{w}} = (\\mathbf{X}^\\top \\mathbf{X})^{-1}\\mathbf{X}^\\top \\y{\\mathbf{y}}'}</Eq> — one matrix inverse and you're done. This is why linear regression is still the first thing you try: if it works, you're done in 10 ms.</p>
      </Worked>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="Why squared error instead of absolute error?"
          a={<>Analytically nice (convex, differentiable, closed-form). Statistically: squared error is the <Term>MLE</Term> assuming Gaussian noise. Use absolute (L1) error when you care about outliers or the noise is heavy-tailed.</>} />
        <QA q="Why a sigmoid for classification?"
          a={<>It's the canonical link for a Bernoulli target under MLE. The coefficients become interpretable as log-odds: <Eq>{'\\w{w_j}'}</Eq> = the log-odds increase per unit <Eq>{'\\x{x_j}'}</Eq>, holding others fixed.</>} />
      </div>
      <Deeper>
        <p><strong>Why these are still used.</strong> In insurance, credit scoring, and clinical trials, <Term>logistic regression</Term> is the default — not because it's most accurate, but because each coefficient is interpretable as a log-odds-ratio, and regulators can read the model. A boosted tree ensemble might have 1% higher AUC and zero chance of passing the model-risk-management review.</p>
        <p><strong>Trade-offs.</strong> Linear models are high-bias (they can only draw straight hyperplanes) and very low-variance (they don't flail around with more data). So they shine when: (a) you have few examples, (b) signal is roughly linear after transformation, (c) interpretability is mandatory. They fail when the relationship is curved or interactions are strong — that's what trees, kernels, and neural nets exist for.</p>
      </Deeper>
    </Card>
  );
};

const Worked = ({ children }) => (
  <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-400/20 px-4 py-3 text-sm text-neutral-200 space-y-2">
    {children}
  </div>
);

// --- 5. regularization ------------------------------------------------------

const RegularizationDemo = () => {
  // 8 "true" coefficients — only 3 nonzero
  const trueW = useMemo(() => [1.8, 0, -1.2, 0, 0.9, 0, 0, 0], []);
  const [lambda, setLambda] = useState(0.0);
  const [mode, setMode] = useState('ridge'); // ridge | lasso

  // synthesize noisy observations: X is 40×8 standard normal-ish
  const { X, y } = useMemo(() => {
    let s = 42;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return (s / 233280) * 2 - 1; };
    const Xm = [];
    const ym = [];
    for (let i = 0; i < 40; i++) {
      const row = Array.from({ length: 8 }, () => rnd() * 1.6);
      Xm.push(row);
      const yi = row.reduce((s, v, j) => s + v * trueW[j], 0) + rnd() * 0.6;
      ym.push(yi);
    }
    return { X: Xm, y: ym };
  }, [trueW]);

  // fit via coordinate descent — fast, sufficient for demo
  const w = useMemo(() => {
    const d = 8, n = X.length;
    const wEst = Array(d).fill(0);
    // precompute column squared-norms
    const colSq = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j] * r[j], 0));
    const soft = (z, g) => Math.sign(z) * Math.max(0, Math.abs(z) - g);
    for (let iter = 0; iter < 200; iter++) {
      for (let j = 0; j < d; j++) {
        let r = 0;
        for (let i = 0; i < n; i++) {
          let pred = 0;
          for (let k = 0; k < d; k++) if (k !== j) pred += X[i][k] * wEst[k];
          r += X[i][j] * (y[i] - pred);
        }
        if (mode === 'lasso') {
          wEst[j] = soft(r, lambda * n / 2) / (colSq[j] + 1e-9);
        } else {
          wEst[j] = r / (colSq[j] + lambda * n + 1e-9);
        }
      }
    }
    return wEst;
  }, [X, y, lambda, mode]);

  const W = 520, H = 170;
  const barW = W / 16;
  const maxAbs = 2.2;
  const sy = (v) => H / 2 - (v / maxAbs) * (H / 2 - 10);

  return (
    <Card id="c-reg" icon={Feather} title="Regularization: Ridge, Lasso, Elastic Net" subtitle="How to bend a model toward simpler by adding a penalty on the weights." accent="violet" index={5}>
      <MinSchema>Minimize (loss + λ · complexity). <Term>L2</Term> (Ridge) shrinks all weights smoothly. <Term>L1</Term> (Lasso) shrinks and <em>zeros out</em> weights — automatic feature selection. Elastic Net blends both.</MinSchema>
      <KeyEq>{'\\w{\\hat w} = \\arg\\min_{\\w{w}} \\;\\loss{\\|X\\w{w} - \\y{y}\\|^2} + \\hp{\\lambda}\\,\\Omega(\\w{w})'}</KeyEq>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Tab active={mode === 'ridge'} onClick={() => setMode('ridge')}>Ridge (L2)</Tab>
          <Tab active={mode === 'lasso'} onClick={() => setMode('lasso')}>Lasso (L1)</Tab>
          <span className="ml-auto text-[11px] text-neutral-500">{mode === 'ridge' ? 'Ω(w) = ½‖w‖²' : 'Ω(w) = ‖w‖₁'}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#ffffff22" />
          {trueW.map((tw, i) => {
            const x0 = (i + 0.5) * (W / 8) - barW;
            return (
              <g key={i}>
                {/* true weight (ghost) */}
                <rect x={x0 - 2} y={tw >= 0 ? sy(tw) : H / 2} width={barW} height={Math.abs(tw) * (H / 2 - 10) / maxAbs}
                  fill="#ffffff22" />
                {/* estimated weight */}
                <rect x={x0 + barW / 2 + 2} y={w[i] >= 0 ? sy(w[i]) : H / 2} width={barW}
                  height={Math.abs(w[i]) * (H / 2 - 10) / maxAbs}
                  fill={Math.abs(w[i]) < 1e-3 ? '#6ee7b7' : '#c4b5fd'} />
                <text x={(i + 0.5) * (W / 8)} y={H - 4} fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle">w{i + 1}</text>
              </g>
            );
          })}
        </svg>
        <div className="text-[11px] text-neutral-500">
          <span className="inline-block w-3 h-3 bg-white/20 align-middle mr-1" /> true coefficient
          <span className="inline-block w-3 h-3 bg-violet-300 align-middle ml-4 mr-1" /> fitted coefficient
          {mode === 'lasso' && <><span className="inline-block w-3 h-3 bg-emerald-300 align-middle ml-4 mr-1" />exact zero (Lasso sparsity)</>}
        </div>
        <Slider label={`λ (${mode})`} value={lambda} onChange={setLambda} min={0} max={mode === 'lasso' ? 0.6 : 6} step={0.01} accent="violet" fmt={v => v.toFixed(2)} />
        <div className="text-[11px] text-neutral-500">As λ grows: Ridge smoothly pulls every weight toward 0. Lasso pulls them toward 0 too — but once a weight is small, the L1 penalty drives it to <em>exactly</em> 0 and it stays there.</div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-sky-300 font-mono uppercase text-[10px] tracking-widest mb-1">Ridge · L2</div>
          <div className="text-neutral-300">Smooth shrinkage. Handles correlated features well (spreads weight across them). Closed-form: <Eq>{'\\w{\\hat w} = (X^\\top X + \\hp{\\lambda} I)^{-1}X^\\top \\y{y}'}</Eq>.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-emerald-300 font-mono uppercase text-[10px] tracking-widest mb-1">Lasso · L1</div>
          <div className="text-neutral-300">Sparsity. Automatic feature selection — some weights land on exactly zero. Picks one of a correlated pair almost arbitrarily.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-violet-300 font-mono uppercase text-[10px] tracking-widest mb-1">Elastic Net</div>
          <div className="text-neutral-300">α·L1 + (1−α)·L2. Sparsity of Lasso, stability of Ridge on correlated features. Default in glmnet.</div>
        </div>
      </div>
      <Misconception
        think="Regularization is just a technicality for dealing with ill-conditioned matrices."
        actually={<>It's the Bayesian prior in disguise. Ridge = Gaussian prior on weights; Lasso = Laplace prior. You're trading raw fit for a principled preference for simpler explanations — the formalization of Occam's razor.</>} />
      <Deeper>
        <p><strong>Why L1 produces zeros but L2 doesn't — the geometry.</strong> Both methods minimize squared loss on a constraint set. The L2 constraint is a ball (‖w‖₂ ≤ c); the L1 constraint is a diamond (‖w‖₁ ≤ c). The elliptical contours of the squared loss hit the L2 ball generically on its smooth surface, where no coordinate is zero. The L1 diamond has <em>corners on the axes</em>, which is exactly where one or more coordinates are zero — and those corners are the most likely points of contact. Sparsity is a geometric consequence, not an iterative trick.</p>
        <p><strong>Modern practice.</strong> In deep learning, "weight decay" is L2 regularization applied per-step in the optimizer. <Term>dropout</Term>, <Term>batch normalization</Term>, data augmentation, and early stopping are all regularizers too — they reduce variance by injecting noise or shortening training. You rarely use L1 in a neural net; you use L2 plus the whole regularizer zoo.</p>
        <p><strong>Trade-off:</strong> regularization always trades a little bias for a lot less variance. The right λ is the one where validation error bottoms out — found by grid search / k-fold CV. Don't pick λ by eyeballing the training loss: by construction, training loss prefers λ = 0.</p>
      </Deeper>
    </Card>
  );
};

// --- 6. k-NN & Naive Bayes --------------------------------------------------

const KNNDemo = () => {
  // generate 2 class blobs
  const pts = useMemo(() => {
    let s = 11;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return (s / 233280); };
    const arr = [];
    for (let i = 0; i < 18; i++) arr.push({ x: 1.5 + rnd() * 2.5, y: 1.5 + rnd() * 2.5, c: 0 });
    for (let i = 0; i < 18; i++) arr.push({ x: 4 + rnd() * 3, y: 3.5 + rnd() * 3, c: 1 });
    return arr;
  }, []);
  const [k, setK] = useState(5);
  const [probe, setProbe] = useState({ x: 3.5, y: 3 });
  const W = 400, H = 240;
  const xMin = 0, xMax = 8, yMin = 0, yMax = 7;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

  const neighbors = useMemo(() => {
    return [...pts].map(p => ({ ...p, d: Math.hypot(p.x - probe.x, p.y - probe.y) })).sort((a, b) => a.d - b.d).slice(0, k);
  }, [pts, probe, k]);
  const vote = neighbors.reduce((s, p) => s + (p.c ? 1 : -1), 0);
  const cls = vote > 0 ? 1 : 0;
  const conf = Math.abs(vote) / k;

  return (
    <Card id="c-knn" icon={Users} title="k-Nearest Neighbors & Naive Bayes" subtitle="Two of the oldest classifiers — still uncanny defaults for fast prototypes." accent="emerald" index={6}>
      <MinSchema>k-NN: no training — at predict time, look at the k closest training points and vote. Naive Bayes: assume features are conditionally independent given the class and apply Bayes' rule.</MinSchema>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">k-NN · click anywhere to probe</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto"
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = xMin + ((e.clientX - r.left) / r.width) * (xMax - xMin);
              const y = yMax - ((e.clientY - r.top) / r.height) * (yMax - yMin);
              setProbe({ x, y });
            }}>
            {/* edges to neighbors */}
            {neighbors.map((n, i) => (
              <line key={`e${i}`} x1={sx(probe.x)} y1={sy(probe.y)} x2={sx(n.x)} y2={sy(n.y)} stroke={n.c ? '#f9a8d4' : '#7dd3fc'} strokeWidth="1" opacity="0.7" />
            ))}
            {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={p.c ? '#f9a8d4' : '#7dd3fc'} opacity="0.9" />)}
            {/* probe */}
            <circle cx={sx(probe.x)} cy={sy(probe.y)} r={7} fill={cls ? '#f0abfc' : '#38bdf8'} stroke="#fff" strokeWidth="1.5" />
          </svg>
          <Slider label="k" value={k} onChange={v => setK(Math.round(v))} min={1} max={15} step={1} accent="emerald" />
          <div className="text-[11px] font-mono text-neutral-300">predicted class: <span className={cls ? 'text-pink-300' : 'text-sky-300'}>{cls === 1 ? 'pink' : 'blue'}</span> · confidence {(conf * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2 text-[13px]">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">Naive Bayes · "spam" example</div>
          <div className="text-neutral-300"><Eq>{'P(\\y{\\mathrm{spam}}\\mid \\x{\\mathrm{words}}) \\propto P(\\y{\\mathrm{spam}}) \\prod_i P(\\x{w_i}\\mid \\y{\\mathrm{spam}})'}</Eq></div>
          <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-neutral-300">
            <div className="text-neutral-500">word</div>
            <div className="text-rose-300">P(w | spam)</div>
            <div className="text-sky-300">P(w | ham)</div>
            {[['free', 0.09, 0.01], ['meeting', 0.002, 0.04], ['viagra', 0.03, 0.0001], ['lunch', 0.001, 0.03], ['click', 0.06, 0.008]].map(([w, ps, ph]) => (
              <React.Fragment key={w}>
                <div>{w}</div>
                <div className="text-rose-200">{ps.toFixed(4)}</div>
                <div className="text-sky-200">{ph.toFixed(4)}</div>
              </React.Fragment>
            ))}
          </div>
          <div className="text-[11px] text-neutral-400">"<em>free viagra click</em>" ⇒ 0.09·0.03·0.06 = <span className="text-rose-200 font-mono">1.6e-4</span> vs ham <span className="text-sky-200 font-mono">8.0e-10</span> → <span className="text-rose-300 font-mono">SPAM</span>, ratio ~200,000×.</div>
          <div className="text-[11px] text-neutral-500 pt-1 border-t border-white/10">The independence assumption is obviously wrong — "free" and "viagra" co-occur — yet the classifier works because we only need the <em>ranking</em> of probabilities to be right, not their absolute values.</div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="What happens as k → 1?"
          a="Zero training error (each point is its own nearest neighbor) and high variance — a wiggly decision boundary that will change if you delete one point. Classic overfitting. Large k oversmooths: in the limit k = n, every query returns the majority class." />
        <QA q="Why is Naive Bayes 'naive' but still popular?"
          a="The conditional-independence assumption is nearly always false. But NB only needs the ranking of class probabilities to be correct, not their magnitudes. Training and inference are O(d) and it doesn't care about high-dim feature spaces — which is why it dominated spam filtering for a decade and still shines as a fast baseline." />
      </div>
      <Deeper>
        <p><strong>k-NN's honest trade-off:</strong> zero training time, painful inference (O(n) distance comparisons per query, or O(log n) with a k-d tree in low dim). It's memory-hungry — you keep all the data. And it suffers the "curse of dimensionality": in 1000 dimensions, all points are roughly equidistant, so "nearest" loses meaning. Modern vector search (FAISS, HNSW) is essentially industrial-scale k-NN over learned embeddings.</p>
        <p><strong>Naive Bayes families:</strong> Gaussian NB (continuous features), Multinomial NB (word counts — classic for text), Bernoulli NB (binary features). Add-one (Laplace) smoothing is essential — without it, any unseen word makes the whole product zero.</p>
        <p><strong>When to use them in 2026:</strong> NB for high-dim sparse text as a baseline before you invest in a transformer. k-NN on top of learned embeddings for retrieval-augmented generation, few-shot classification, image deduplication. They're rarely SOTA, but they're always fast to try — and sometimes the baseline is what you ship.</p>
      </Deeper>
    </Card>
  );
};

// --- 7. decision trees ------------------------------------------------------

const DecisionTreeDemo = () => {
  // 2D data with non-linear boundary
  const data = useMemo(() => {
    let s = 3;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const arr = [];
    for (let i = 0; i < 80; i++) {
      const x = rnd() * 10;
      const y = rnd() * 10;
      // class = XOR-like with some noise
      const c = ((x > 5) !== (y > 5)) ? 1 : 0;
      arr.push({ x, y, c: rnd() < 0.08 ? 1 - c : c });
    }
    return arr;
  }, []);

  const [depth, setDepth] = useState(4);

  // greedy tree with Gini
  const fit = useMemo(() => {
    const gini = (labels) => {
      if (labels.length === 0) return 0;
      const p = labels.filter(c => c === 1).length / labels.length;
      return 1 - p * p - (1 - p) * (1 - p);
    };
    const bestSplit = (subset) => {
      let best = null;
      for (const axis of ['x', 'y']) {
        const vals = [...new Set(subset.map(p => p[axis]))].sort((a, b) => a - b);
        for (let i = 0; i < vals.length - 1; i++) {
          const t = (vals[i] + vals[i + 1]) / 2;
          const left = subset.filter(p => p[axis] < t);
          const right = subset.filter(p => p[axis] >= t);
          if (!left.length || !right.length) continue;
          const g = (left.length * gini(left.map(p => p.c)) + right.length * gini(right.map(p => p.c))) / subset.length;
          if (!best || g < best.gini) best = { axis, t, gini: g, leftCount: left.length, rightCount: right.length };
        }
      }
      return best;
    };
    const splits = [];
    const buildTree = (subset, lo, hi, d) => {
      if (d >= depth || subset.length < 4) return;
      const g = gini(subset.map(p => p.c));
      if (g < 0.05) return;
      const split = bestSplit(subset);
      if (!split) return;
      splits.push({ ...split, lo, hi, depth: d });
      const leftBox = { ...hi };
      const rightBox = { ...lo };
      if (split.axis === 'x') { leftBox.x = split.t; rightBox.x = split.t; }
      else { leftBox.y = split.t; rightBox.y = split.t; }
      buildTree(subset.filter(p => p[split.axis] < split.t), lo, leftBox, d + 1);
      buildTree(subset.filter(p => p[split.axis] >= split.t), rightBox, hi, d + 1);
    };
    buildTree(data, { x: 0, y: 0 }, { x: 10, y: 10 }, 0);
    return splits;
  }, [data, depth]);

  const W = 420, H = 260;
  const sx = (v) => (v / 10) * W;
  const sy = (v) => H - (v / 10) * H;

  return (
    <Card id="c-trees" icon={TreePine} title="Decision trees" subtitle="Recursive axis-aligned partitions — interpretable, non-linear, and the base learner of everything that beats them." accent="emerald" index={7}>
      <MinSchema>Greedily split the feature space on whichever (feature, threshold) most reduces impurity (<Term>Gini impurity</Term> or <Term>entropy</Term>). Recurse until small/pure. Predict via the leaf's majority class.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* split lines */}
          {fit.map((s, i) => s.axis === 'x' ? (
            <line key={i} x1={sx(s.t)} y1={sy(s.hi.y)} x2={sx(s.t)} y2={sy(s.lo.y)} stroke="#c4b5fd" strokeWidth={3 - s.depth * 0.4} opacity={0.8 - s.depth * 0.1} />
          ) : (
            <line key={i} x1={sx(s.lo.x)} y1={sy(s.t)} x2={sx(s.hi.x)} y2={sy(s.t)} stroke="#c4b5fd" strokeWidth={3 - s.depth * 0.4} opacity={0.8 - s.depth * 0.1} />
          ))}
          {data.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={p.c ? '#f9a8d4' : '#7dd3fc'} opacity="0.9" />)}
        </svg>
        <Slider label="max depth" value={depth} onChange={v => setDepth(Math.round(v))} min={1} max={8} step={1} accent="emerald" />
        <div className="text-[11px] text-neutral-500">depth 1 = one split = two rectangles. depth 4 = up to 16 leaves = fine-grained boundary. Push depth higher and the tree starts carving out single points — overfitting.</div>
      </div>
      <Worked>
        <div className="font-mono text-[11px] uppercase tracking-widest text-emerald-300 mb-1">splitting criterion</div>
        <p>At each node with labels <Eq>{'\\y{y_1, \\dots, y_n}'}</Eq>, pick the (feature <Eq>{'\\x{j}'}</Eq>, threshold <Eq>{'t'}</Eq>) that maximizes:</p>
        <Block>{'\\text{info gain} = G(\\text{parent}) - \\frac{n_L}{n}G(\\text{left}) - \\frac{n_R}{n}G(\\text{right})'}</Block>
        <p>where <Eq>{'G'}</Eq> is Gini (<Eq>{'1 - \\sum p_k^2'}</Eq>) or entropy (<Eq>{'- \\sum p_k \\log p_k'}</Eq>). Both rank splits nearly identically; Gini is cheaper. The greedy choice is myopic — it can miss splits that look bad now but enable much better ones one level down.</p>
      </Worked>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="Why axis-aligned splits?"
          a="Because you can evaluate every candidate threshold in O(n log n) per feature, total O(d · n log n) per node. Oblique splits (diagonal lines) would be more expressive but each split becomes an optimization problem — usually not worth it when you can just stack axis-aligned splits (or ensemble).">
        </QA>
        <QA q="Why do single trees overfit badly?"
          a="Two reasons. First, the greedy split is unstable — swap a few training rows and the entire top-level split can change, cascading into a very different tree. Second, left unchecked, a tree will keep splitting until each leaf has one point (zero training error, catastrophic variance). Ensembles — bagging, boosting — fix both." />
      </div>
      <Deeper>
        <p><strong>Two knobs that actually matter:</strong> max depth (or min samples per leaf) to control variance, and cost-complexity pruning (<Eq>{'\\hp{\\alpha}'}</Eq>) which retroactively snips back low-gain branches. Modern libraries (scikit-learn, XGBoost) expose a dozen knobs; in practice the first two do most of the work.</p>
        <p><strong>What trees get right.</strong> They handle mixed types (continuous + categorical) without preprocessing. They are invariant to monotone transforms of features (log, sqrt — irrelevant). They are completely interpretable up to ~depth 5. They naturally handle missing values (send to majority child, or learn a surrogate split). On <Term>tabular</Term> data, boosted trees still routinely beat neural networks as of 2026.</p>
        <p><strong>What they get wrong.</strong> They cannot model linear relationships efficiently (a line becomes a staircase). They are piecewise constant — poor at smooth extrapolation. They have high variance as a single estimator, which is why nobody ships a lone tree — you ship a forest or a boosted ensemble.</p>
      </Deeper>
    </Card>
  );
};

// --- 8. ensembles -----------------------------------------------------------

const EnsembleDemo = () => {
  const [mode, setMode] = useState('bag'); // bag | boost
  const [n, setN] = useState(8);
  // 1D regression target: a sine wave with noise
  const trueF = (x) => Math.sin(1.6 * x) + 0.2 * x;
  const data = useMemo(() => {
    let s = 17;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: 30 }, () => {
      const x = rnd() * 5;
      return { x, y: trueF(x) + (rnd() - 0.5) * 0.7 };
    });
  }, []);

  // bagging: fit n decision stumps on bootstrap samples, average predictions
  const bagModels = useMemo(() => {
    const models = [];
    let s = 99;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < n; i++) {
      // bootstrap sample
      const sample = Array.from({ length: data.length }, () => data[Math.floor(rnd() * data.length)]);
      // fit piecewise-constant tree with 4 splits
      const xs = [...sample].sort((a, b) => a.x - b.x);
      const splits = [1, 2, 3, 4].map(k => xs[Math.floor((k / 5) * xs.length)].x);
      const regions = [-Infinity, ...splits, Infinity];
      const means = [];
      for (let r = 0; r < regions.length - 1; r++) {
        const bucket = sample.filter(p => p.x >= regions[r] && p.x < regions[r + 1]);
        means.push(bucket.length ? bucket.reduce((s, p) => s + p.y, 0) / bucket.length : 0);
      }
      models.push({ regions, means });
    }
    return models;
  }, [data, n]);

  const predictBag = (x) => bagModels.reduce((s, m) => {
    const r = m.regions.findIndex(v => v > x) - 1;
    return s + m.means[Math.max(0, r)];
  }, 0) / bagModels.length;

  // boosting: fit sequential shallow stumps on residuals (gradient boosting)
  const boostModels = useMemo(() => {
    const models = [];
    let residuals = data.map(d => d.y);
    const lr = 0.35;
    for (let i = 0; i < n; i++) {
      // find single best split
      const sorted = data.map((d, j) => ({ ...d, r: residuals[j] })).sort((a, b) => a.x - b.x);
      let best = null;
      for (let k = 1; k < sorted.length - 1; k++) {
        const t = (sorted[k - 1].x + sorted[k].x) / 2;
        const left = sorted.slice(0, k);
        const right = sorted.slice(k);
        const ml = left.reduce((s, p) => s + p.r, 0) / left.length;
        const mr = right.reduce((s, p) => s + p.r, 0) / right.length;
        const err = left.reduce((s, p) => s + (p.r - ml) ** 2, 0) + right.reduce((s, p) => s + (p.r - mr) ** 2, 0);
        if (!best || err < best.err) best = { t, ml, mr, err };
      }
      models.push({ t: best.t, ml: best.ml * lr, mr: best.mr * lr });
      residuals = data.map((d, j) => {
        const add = d.x < best.t ? best.ml : best.mr;
        return residuals[j] - add * lr;
      });
    }
    return models;
  }, [data, n]);
  const predictBoost = (x) => boostModels.reduce((s, m) => s + (x < m.t ? m.ml : m.mr), 0);

  const W = 520, H = 220;
  const xMin = 0, xMax = 5, yMin = -1.8, yMax = 2.5;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;
  const predict = mode === 'bag' ? predictBag : predictBoost;
  const curvePts = Array.from({ length: 200 }, (_, i) => { const x = xMin + (xMax - xMin) * i / 199; return `${sx(x)},${sy(predict(x))}`; }).join(' ');
  const truePts = Array.from({ length: 200 }, (_, i) => { const x = xMin + (xMax - xMin) * i / 199; return `${sx(x)},${sy(trueF(x))}`; }).join(' ');

  return (
    <Card id="c-ensemble" icon={Boxes} title="Ensembles: Bagging, Boosting, Stacking" subtitle="Build a committee of weak learners. Bias down (boost) or variance down (bag)." accent="amber" index={8}>
      <MinSchema><Term>Bagging</Term> = many independent models on resampled data, averaged. Lowers variance. <Term>Boosting</Term> = sequential models each fitting the previous one's residuals. Lowers bias. <Term>random forest</Term> bags decorrelated trees; <Term>XGBoost</Term> boosts them.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Tab active={mode === 'bag'} onClick={() => setMode('bag')}>Bagging (Random Forest)</Tab>
          <Tab active={mode === 'boost'} onClick={() => setMode('boost')}>Boosting (XGBoost-style)</Tab>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <polyline points={truePts} fill="none" stroke="#6ee7b7" strokeDasharray="3 3" strokeWidth="1.5" opacity="0.7" />
          {mode === 'bag' && bagModels.map((m, i) => (
            <polyline key={i} points={Array.from({ length: 80 }, (_, j) => {
              const x = xMin + (xMax - xMin) * j / 79;
              const r = m.regions.findIndex(v => v > x) - 1;
              return `${sx(x)},${sy(m.means[Math.max(0, r)])}`;
            }).join(' ')} fill="none" stroke="#fca5a5" strokeWidth="0.8" opacity="0.35" />
          ))}
          <polyline points={curvePts} fill="none" stroke="#c4b5fd" strokeWidth="2.5" />
          {data.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill="#7dd3fc" opacity="0.85" />)}
        </svg>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-emerald-300" /> true function</span>
          {mode === 'bag' && <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-rose-300 opacity-50" /> individual trees</span>}
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-[2px] bg-violet-300" /> ensemble average</span>
        </div>
        <Slider label="ensemble size" value={n} onChange={v => setN(Math.round(v))} min={1} max={30} step={1} accent="amber" />
        <div className="text-[11px] text-neutral-500">Bagging: each tree is noisy on its own; averaging cancels the noise. Boosting: each tree is deliberately tiny; stacking them lets error shrink monotonically.</div>
      </div>
      <div className="grid md:grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-emerald-300 font-mono uppercase text-[10px] tracking-widest mb-1">Random Forest</div>
          <div className="text-neutral-300">Bag of trees + per-split feature subsampling. Hard to mess up. Sensible defaults, cheap to parallelize, one of the best "just try this" models on tabular data.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-amber-300 font-mono uppercase text-[10px] tracking-widest mb-1">XGBoost / LightGBM / CatBoost</div>
          <div className="text-neutral-300">Gradient boosting on trees, highly optimized. Still SOTA on tabular Kaggle and enterprise ML. Key trick: each tree is a second-order Newton step on the loss.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-violet-300 font-mono uppercase text-[10px] tracking-widest mb-1">Stacking</div>
          <div className="text-neutral-300">Train several heterogeneous models; feed their predictions as features into a meta-learner. Usually adds 0.5–2% on Kaggle; a maintenance nightmare in production.</div>
        </div>
      </div>
      <Misconception
        think="Deep learning replaced gradient-boosted trees."
        actually="Not on tabular data. As of 2026, XGBoost/LightGBM/CatBoost are still the default starting point — and often the endpoint — for rows-and-columns ML. Transformers for tabular (TabPFN, FT-Transformer) exist and are closing the gap, but boosted trees remain the baseline to beat." />
      <Deeper>
        <p><strong>The math trick in gradient boosting.</strong> Start with a constant predictor <Eq>{'\\mo{F_0(x)} = \\bar{\\y{y}}'}</Eq>. At round m, fit a tree <Eq>{'h_m'}</Eq> to the negative gradient of the loss w.r.t. the current predictions (for squared loss, this is just the residuals), then update <Eq>{'\\mo{F_m(x)} = \\mo{F_{m-1}(x)} + \\hp{\\eta}\\, h_m(x)'}</Eq>. That's it. XGBoost adds a second-order term, regularization on tree complexity, histogram-based split finding, and heavy engineering — but the skeleton is five lines.</p>
        <p><strong>Why bagging helps:</strong> if individual trees have variance <Eq>{'\\sigma^2'}</Eq> and correlation <Eq>{'\\rho'}</Eq>, the average of M of them has variance <Eq>{'\\rho \\sigma^2 + (1-\\rho)\\sigma^2/M'}</Eq>. Random Forest's per-split feature subsampling lowers <Eq>{'\\rho'}</Eq>, which is the term that doesn't vanish with more trees — the whole reason the trick works.</p>
      </Deeper>
    </Card>
  );
};

// --- 9. SVMs ----------------------------------------------------------------

const SVMDemo = () => {
  const [kernel, setKernel] = useState('linear');
  const [C, setC] = useState(1);
  const [gamma, setGamma] = useState(1);

  const data = useMemo(() => {
    let s = 5;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const arr = [];
    if (kernel === 'linear') {
      for (let i = 0; i < 20; i++) arr.push({ x: 1 + rnd() * 2.5, y: 1 + rnd() * 2.5, c: 0 });
      for (let i = 0; i < 20; i++) arr.push({ x: 3.5 + rnd() * 2.5, y: 3.5 + rnd() * 2.5, c: 1 });
    } else {
      // concentric-ish circles
      for (let i = 0; i < 30; i++) {
        const a = rnd() * Math.PI * 2;
        const r = 1 + rnd() * 0.5;
        arr.push({ x: 4 + r * Math.cos(a), y: 3.5 + r * Math.sin(a), c: 0 });
      }
      for (let i = 0; i < 30; i++) {
        const a = rnd() * Math.PI * 2;
        const r = 2.5 + rnd() * 0.6;
        arr.push({ x: 4 + r * Math.cos(a), y: 3.5 + r * Math.sin(a), c: 1 });
      }
    }
    return arr;
  }, [kernel]);

  // Very simplified SVM — for linear, solve by logistic-like gradient on hinge loss; for RBF, fit dual with kernel.
  const model = useMemo(() => {
    if (kernel === 'linear') {
      let w1 = 0, w2 = 0, b = 0;
      const lr = 0.02;
      for (let iter = 0; iter < 400; iter++) {
        for (const p of data) {
          const y = p.c === 1 ? 1 : -1;
          const margin = y * (w1 * p.x + w2 * p.y + b);
          if (margin < 1) {
            w1 += lr * (y * p.x - w1 / (C * data.length));
            w2 += lr * (y * p.y - w2 / (C * data.length));
            b += lr * y;
          } else {
            w1 -= lr * (w1 / (C * data.length));
            w2 -= lr * (w2 / (C * data.length));
          }
        }
      }
      return { kind: 'linear', w1, w2, b };
    }
    return { kind: 'rbf', data };
  }, [data, kernel, C]);

  const decide = useCallback((x, y) => {
    if (model.kind === 'linear') return model.w1 * x + model.w2 * y + model.b;
    // RBF: sum of y_i * exp(-gamma * ||x - xi||^2)
    return data.reduce((s, p) => s + (p.c === 1 ? 1 : -1) * Math.exp(-gamma * ((p.x - x) ** 2 + (p.y - y) ** 2)), 0);
  }, [model, data, gamma]);

  const W = 420, H = 260;
  const xMin = 0, xMax = 8, yMin = 0, yMax = 7;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

  // compute decision field
  const grid = useMemo(() => {
    const Nx = 48, Ny = 32;
    const cells = [];
    for (let j = 0; j < Ny; j++) for (let i = 0; i < Nx; i++) {
      const gx = xMin + (xMax - xMin) * (i + 0.5) / Nx;
      const gy = yMin + (yMax - yMin) * (j + 0.5) / Ny;
      cells.push({ i, j, v: decide(gx, gy) });
    }
    return { Nx, Ny, cells };
  }, [decide]);

  return (
    <Card id="c-svm" icon={Ruler} title="Support Vector Machines & the kernel trick" subtitle="Find the widest possible street between the classes. Curve it with kernels." accent="fuchsia" index={9}>
      <MinSchema>Linear SVM maximizes the <Term>margin</Term> between classes — the distance to the nearest training points (the <Term>support vector</Term>s). The <Term>kernel trick</Term> lets you do the same in a higher-dimensional space without ever computing the coordinates.</MinSchema>
      <KeyEq>{'\\min_{\\w{w},\\w{b}} \\tfrac{1}{2}\\|\\w{w}\\|^2 + \\hp{C}\\sum_i \\max(0, 1 - \\y{y_i}(\\w{w}^\\top \\phi(\\x{x_i}) + \\w{b}))'}</KeyEq>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Tab active={kernel === 'linear'} onClick={() => setKernel('linear')}>Linear</Tab>
          <Tab active={kernel === 'rbf'} onClick={() => setKernel('rbf')}>RBF kernel</Tab>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* decision field as colored cells */}
          {grid.cells.map((c, idx) => {
            const fill = c.v > 0 ? `rgba(249,168,212,${Math.min(0.45, Math.abs(c.v) * 0.08)})` : `rgba(125,211,252,${Math.min(0.45, Math.abs(c.v) * 0.08)})`;
            const w = W / grid.Nx, h = H / grid.Ny;
            return <rect key={idx} x={c.i * w} y={H - (c.j + 1) * h} width={w} height={h} fill={fill} />;
          })}
          {/* decision boundary via contour at 0 (approximated) */}
          {model.kind === 'linear' && (() => {
            // plot line w1 x + w2 y + b = 0 in [xMin,xMax]
            const w1 = model.w1, w2 = model.w2, b = model.b;
            if (Math.abs(w2) < 1e-6) return null;
            const y1 = (-b - w1 * xMin) / w2;
            const y2 = (-b - w1 * xMax) / w2;
            const m1 = (-b - w1 * xMin + 1) / w2;
            const m2 = (-b - w1 * xMax + 1) / w2;
            const n1 = (-b - w1 * xMin - 1) / w2;
            const n2 = (-b - w1 * xMax - 1) / w2;
            return (
              <>
                <line x1={sx(xMin)} y1={sy(m1)} x2={sx(xMax)} y2={sy(m2)} stroke="#f0abfc" strokeDasharray="4 3" strokeWidth="1" />
                <line x1={sx(xMin)} y1={sy(n1)} x2={sx(xMax)} y2={sy(n2)} stroke="#f0abfc" strokeDasharray="4 3" strokeWidth="1" />
                <line x1={sx(xMin)} y1={sy(y1)} x2={sx(xMax)} y2={sy(y2)} stroke="#f0abfc" strokeWidth="2" />
              </>
            );
          })()}
          {data.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={p.c ? '#f9a8d4' : '#7dd3fc'} stroke="#18181b" strokeWidth="1" />)}
        </svg>
        <Slider label="C (slack)" value={C} onChange={setC} min={0.1} max={10} step={0.1} accent="fuchsia" fmt={v => v.toFixed(1)} />
        {kernel === 'rbf' && <Slider label="γ (RBF width)" value={gamma} onChange={setGamma} min={0.1} max={4} step={0.05} accent="violet" fmt={v => v.toFixed(2)} />}
        <div className="text-[11px] text-neutral-500">Low C: wide margin, more slack (mistakes allowed). High C: narrow margin, fewer mistakes — toward overfitting. γ controls how local the RBF "bumps" are.</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="What's 'the kernel trick,' exactly?"
          a={<>The SVM optimization only touches data through inner products <Eq>{'\\x{x}_i^\\top \\x{x}_j'}</Eq>. Replace them with a kernel <Eq>{'K(\\x{x_i}, \\x{x_j}) = \\phi(\\x{x_i})^\\top \\phi(\\x{x_j})'}</Eq> and you've implicitly moved to the feature space <Eq>{'\\phi'}</Eq> — which can be infinite-dimensional (<Term>RBF kernel</Term>) — without ever computing <Eq>{'\\phi'}</Eq>. Free non-linearity.</>} />
        <QA q="Why did SVMs fall out of fashion?"
          a="Three reasons. (1) They don't scale: kernel SVMs are O(n²–n³) in training data — painful past ~100k rows. (2) Neural nets learn their own feature maps and don't need a hand-picked kernel. (3) Gradient-boosted trees quietly match them on tabular without the kernel tuning. They still shine for small, clean problems and have beautiful theory." />
      </div>
      <Deeper>
        <p><strong>The margin as regularizer.</strong> Minimizing <Eq>{'\\|\\w{w}\\|^2'}</Eq> maximizes the distance from the hyperplane to the closest point, which is <Eq>{'1/\\|\\w{w}\\|'}</Eq>. Structural risk minimization (Vapnik) shows that wider margins give tighter generalization bounds — the theoretical reason to prefer them.</p>
        <p><strong>Popular kernels:</strong> Linear <Eq>{'K = x^\\top y'}</Eq>. Polynomial <Eq>{'K = (x^\\top y + c)^d'}</Eq>. RBF <Eq>{'K = \\exp(-\\hp{\\gamma}\\|x-y\\|^2)'}</Eq> (the default non-linear). String kernels for sequences. Graph kernels for molecules. Once you have a positive-definite kernel, you have an SVM, kernel ridge, Gaussian processes, and kernel PCA for free.</p>
      </Deeper>
    </Card>
  );
};

// --- 10. clustering ---------------------------------------------------------

const ClusteringDemo = () => {
  const [algo, setAlgo] = useState('kmeans');
  const [k, setK] = useState(3);
  const [step, setStep] = useState(0);
  const data = useMemo(() => {
    let s = 7;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const centers = [[2, 2], [6, 2], [4, 5], [1.5, 5.5], [7, 5.5]];
    const arr = [];
    for (const c of centers) {
      for (let i = 0; i < 16; i++) arr.push({ x: c[0] + (rnd() - 0.5) * 1.6, y: c[1] + (rnd() - 0.5) * 1.4 });
    }
    return arr;
  }, []);

  // run k-means iterations
  const kmeans = useMemo(() => {
    let centroids = Array.from({ length: k }, (_, i) => ({ x: 1 + i * 1.5, y: 1.5 + (i % 2) * 2 }));
    const history = [{ centroids: [...centroids.map(c => ({ ...c }))], assign: data.map(() => -1) }];
    for (let iter = 0; iter < 12; iter++) {
      const assign = data.map(p => {
        let best = 0, bd = Infinity;
        centroids.forEach((c, j) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; best = j; } });
        return best;
      });
      const newCentroids = centroids.map((_, j) => {
        const bucket = data.filter((_, i) => assign[i] === j);
        if (!bucket.length) return centroids[j];
        return { x: bucket.reduce((s, p) => s + p.x, 0) / bucket.length, y: bucket.reduce((s, p) => s + p.y, 0) / bucket.length };
      });
      history.push({ centroids: newCentroids.map(c => ({ ...c })), assign });
      if (newCentroids.every((c, j) => Math.hypot(c.x - centroids[j].x, c.y - centroids[j].y) < 0.001)) break;
      centroids = newCentroids;
    }
    return history;
  }, [data, k]);

  const cur = kmeans[Math.min(step, kmeans.length - 1)];
  const W = 440, H = 260;
  const xMin = 0, xMax = 9, yMin = 0, yMax = 7;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;
  const colors = ['#7dd3fc', '#f9a8d4', '#6ee7b7', '#fcd34d', '#f0abfc'];

  return (
    <Card id="c-cluster" icon={Hexagon} title="Clustering: k-means, hierarchical, DBSCAN, GMM" subtitle="Finding groups without labels — the oldest unsupervised task." accent="cyan" index={10}>
      <MinSchema><Term>k-means</Term> alternates: (E) assign each point to the nearest centroid, (M) re-compute centroids as the mean of their points. Minimizes within-cluster squared distance. Converges in ~10 steps, usually to a local minimum.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Tab active={algo === 'kmeans'} onClick={() => setAlgo('kmeans')}>k-means</Tab>
          <Tab active={algo === 'dbscan'} onClick={() => { setAlgo('dbscan'); }}>DBSCAN concept</Tab>
          <Tab active={algo === 'gmm'} onClick={() => { setAlgo('gmm'); }}>GMM concept</Tab>
        </div>
        {algo === 'kmeans' && (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              {data.map((p, i) => {
                const a = cur.assign[i];
                return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={a === -1 ? '#525252' : colors[a % colors.length]} opacity="0.9" />;
              })}
              {cur.centroids.map((c, j) => (
                <g key={j}>
                  <circle cx={sx(c.x)} cy={sy(c.y)} r={9} fill="none" stroke={colors[j % colors.length]} strokeWidth="2" />
                  <circle cx={sx(c.x)} cy={sy(c.y)} r={3} fill={colors[j % colors.length]} />
                </g>
              ))}
            </svg>
            <div className="flex items-center gap-2 flex-wrap">
              <Button icon={Play} variant="ghost" onClick={() => setStep(s => Math.min(s + 1, kmeans.length - 1))}>step</Button>
              <Button icon={RotateCcw} variant="ghost" onClick={() => setStep(0)}>reset</Button>
              <span className="text-[11px] text-neutral-500">iter {Math.min(step, kmeans.length - 1)} / {kmeans.length - 1}</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] text-neutral-500">k</span>
                <input type="range" min="2" max="5" step="1" value={k} onChange={e => { setK(parseInt(e.target.value)); setStep(0); }} className="accent-cyan-400 w-24" />
                <span className="text-[11px] text-cyan-200 font-mono w-4">{k}</span>
              </div>
            </div>
          </>
        )}
        {algo === 'dbscan' && (
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-300">density-based</div>
            <p><Term>DBSCAN</Term> has no preset k. Two parameters: <Eq>{'\\hp{\\epsilon}'}</Eq> (radius) and <Eq>{'\\hp{\\mathrm{minPts}}}'}</Eq> (density threshold).</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              <li><strong>Core points:</strong> have ≥ minPts neighbors within ε.</li>
              <li><strong>Density-reachable:</strong> two core points in the same ε-neighborhood fuse into one cluster.</li>
              <li><strong>Noise:</strong> points that aren't core and aren't reachable from a core are discarded.</li>
            </ul>
            <p className="text-neutral-400">Result: arbitrarily-shaped clusters, automatic outlier labels, and no k to tune. The price: picking ε is harder than it looks, and DBSCAN struggles with clusters of very different densities.</p>
          </div>
        )}
        {algo === 'gmm' && (
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-300">probabilistic</div>
            <p><Term>GMM</Term> models the data as a mixture of K Gaussians: <Eq>{'p(\\x{x}) = \\sum_k \\pi_k \\mathcal{N}(\\x{x}; \\mu_k, \\Sigma_k)'}</Eq>. Fit by <Term>EM</Term>:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>E step:</strong> soft-assign each point <Eq>{'\\x{x_i}'}</Eq> to cluster k with probability <Eq>{'\\gamma_{ik}'}</Eq>.</li>
              <li><strong>M step:</strong> re-fit <Eq>{'\\mu_k, \\Sigma_k, \\pi_k'}</Eq> from those soft assignments.</li>
            </ul>
            <p className="text-neutral-400">k-means is the <em>degenerate</em> case of GMM where all covariances are <Eq>{'\\sigma^2 I'}</Eq> and we take the hard max instead of soft assignments. GMM gives you the density too — so you can do anomaly detection and generate samples from it.</p>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="How do you pick k in k-means?"
          a={<>Run for several k, plot within-cluster sum-of-squares vs k — "elbow" method. Or use silhouette score (trades tightness vs. separation). Or pick k by a model-selection criterion on a GMM fit (BIC). None of these is magic; usually domain knowledge + a couple of them triangulate.</>} />
        <QA q="What's hierarchical clustering good for?"
          a="Agglomerative clustering builds a dendrogram: start with every point its own cluster, repeatedly merge the two closest clusters. You get a full tree of cluster structure at every granularity at once — perfect for exploring taxonomy. Cost is O(n²–n³), so it's mostly for small datasets." />
      </div>
      <Deeper>
        <p><strong>Why k-means keeps winning</strong> despite its simplicity and known failure modes (assumes round, equal-sized clusters; picks k before running; sensitive to init). It's O(n · k · d · iter), vectorizes beautifully, parallelizes across cores and machines, and needs only the data and the distance function. For <em>quantizing</em> large data (audio codes, image palettes, vector database shards) it is still unbeatable. k-means++ initialization (Arthur/Vassilvitskii 2007) fixed most of the init-sensitivity problem.</p>
        <p><strong>Practical triage:</strong> round-ish clusters, similar sizes → k-means. Arbitrary shapes, density-varying → DBSCAN or HDBSCAN. Need density estimate or soft assignments → GMM. Need hierarchy at every scale → agglomerative. Need to cluster 10^9 vectors from an embedding model → k-means on GPU, always.</p>
      </Deeper>
    </Card>
  );
};

// --- 11. dim reduction ------------------------------------------------------

const DimReductionDemo = () => {
  // 2D data with strong correlation (a "stretched" cloud)
  const [angle, setAngle] = useState(25);
  const pts = useMemo(() => {
    let s = 29;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const u = (rnd() - 0.5) * 4;
      const v = (rnd() - 0.5) * 0.8;
      const rad = angle * Math.PI / 180;
      arr.push({ x: u * Math.cos(rad) - v * Math.sin(rad) + 4, y: u * Math.sin(rad) + v * Math.cos(rad) + 3.5 });
    }
    return arr;
  }, [angle]);

  // PCA by eigen-decomp of covariance
  const pca = useMemo(() => {
    const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    let cxx = 0, cyy = 0, cxy = 0;
    for (const p of pts) { cxx += (p.x - mx) ** 2; cyy += (p.y - my) ** 2; cxy += (p.x - mx) * (p.y - my); }
    cxx /= pts.length; cyy /= pts.length; cxy /= pts.length;
    const trace = cxx + cyy, det = cxx * cyy - cxy * cxy;
    const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));
    const l1 = trace / 2 + disc, l2 = trace / 2 - disc;
    // eigenvector for l1: [cxy, l1 - cxx]
    const v1 = [cxy, l1 - cxx];
    const n1 = Math.hypot(v1[0], v1[1]) || 1;
    const e1 = [v1[0] / n1, v1[1] / n1];
    const e2 = [-e1[1], e1[0]];
    return { mx, my, e1, e2, l1, l2 };
  }, [pts]);

  const W = 420, H = 240;
  const xMin = 0, xMax = 8, yMin = 0, yMax = 7;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

  const frac1 = pca.l1 / (pca.l1 + pca.l2);

  return (
    <Card id="c-dim" icon={Compass} title="Dimensionality reduction: PCA, t-SNE, UMAP" subtitle="Squash d features into 2 or 3 without losing the story." accent="violet" index={11}>
      <MinSchema><Term>PCA</Term> finds orthogonal axes of maximum variance — a linear map from d-D to k-D that preserves as much spread as possible. <Term>t-SNE</Term> and <Term>UMAP</Term> are nonlinear successors that preserve <em>neighborhoods</em> at the cost of global geometry.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill="#7dd3fc" opacity="0.9" />)}
          {/* PC1 */}
          <line x1={sx(pca.mx - pca.e1[0] * 3)} y1={sy(pca.my - pca.e1[1] * 3)}
            x2={sx(pca.mx + pca.e1[0] * 3)} y2={sy(pca.my + pca.e1[1] * 3)}
            stroke="#c4b5fd" strokeWidth="2" />
          <text x={sx(pca.mx + pca.e1[0] * 3.1)} y={sy(pca.my + pca.e1[1] * 3.1) - 4} fill="#c4b5fd" fontSize="11" fontFamily="monospace">PC1 · {Math.round(frac1 * 100)}%</text>
          {/* PC2 */}
          <line x1={sx(pca.mx - pca.e2[0] * Math.sqrt(pca.l2 / pca.l1) * 3)} y1={sy(pca.my - pca.e2[1] * Math.sqrt(pca.l2 / pca.l1) * 3)}
            x2={sx(pca.mx + pca.e2[0] * Math.sqrt(pca.l2 / pca.l1) * 3)} y2={sy(pca.my + pca.e2[1] * Math.sqrt(pca.l2 / pca.l1) * 3)}
            stroke="#f0abfc" strokeWidth="2" />
          <text x={sx(pca.mx + pca.e2[0] * 1.6)} y={sy(pca.my + pca.e2[1] * 1.6)} fill="#f0abfc" fontSize="11" fontFamily="monospace">PC2 · {Math.round((1 - frac1) * 100)}%</text>
        </svg>
        <Slider label="rotate data" value={angle} onChange={setAngle} min={-90} max={90} step={1} accent="violet" fmt={v => `${v.toFixed(0)}°`} />
        <div className="text-[11px] text-neutral-500">PC1 rotates with the data — it always tracks the direction of greatest variance. Projecting onto PC1 alone keeps {Math.round(frac1 * 100)}% of the variance of this 2-D cloud. In high dimensions the first 2–10 PCs often capture 80%+ of everything, which is what makes PCA useful for visualization.</div>
      </div>
      <div className="grid md:grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-sky-300 font-mono uppercase text-[10px] tracking-widest mb-1">PCA · linear</div>
          <div className="text-neutral-300">Orthogonal, rotation-invariant, closed-form from the SVD of the centered data matrix. Deterministic, fast (O(min(nd², n²d))), preserves Euclidean distances. Blind to nonlinear structure.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-rose-300 font-mono uppercase text-[10px] tracking-widest mb-1">t-SNE · local</div>
          <div className="text-neutral-300">Preserves local neighborhoods via a KL divergence between pairwise similarities. Great for pretty cluster plots. <em>Distances between clusters are meaningless.</em> Slow (O(n²)) until you use Barnes-Hut.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-fuchsia-300 font-mono uppercase text-[10px] tracking-widest mb-1">UMAP · topological</div>
          <div className="text-neutral-300">Based on Riemannian geometry + fuzzy simplicial sets. Faster than t-SNE, preserves more global structure. The default 2D embedding plot as of 2026.</div>
        </div>
      </div>
      <Misconception
        think="'PC1 is the most important feature.'"
        actually="PC1 is the direction of most variance — which is often, but not always, the most <em>predictive</em> direction. Supervised dimensionality reduction (LDA, partial least squares, UMAP with labels) picks axes that carry class signal rather than raw variance." />
      <Deeper>
        <p><strong>The SVD view of PCA.</strong> Center the data matrix <Eq>{'X \\in \\mathbb{R}^{n \\times d}'}</Eq>, compute <Eq>{'X = U\\Sigma V^\\top'}</Eq>. The top-k right-singular-vectors (columns of <Eq>{'V'}</Eq>) are the k principal components; the singular values squared are the explained variances. This is why PCA is so well-conditioned: you're just truncating an SVD.</p>
        <p><strong>Why t-SNE and UMAP look so dramatic.</strong> They distort distances on purpose. t-SNE squashes high-dim neighborhoods into t-distributed low-dim neighborhoods, which has heavy tails — so well-separated clusters get pushed <em>further</em> apart than they are in the original space. UMAP does similar shaping via fuzzy set membership. The result is visually striking, but reading "these clusters are 3× further apart than those" off the plot is a common mistake.</p>
      </Deeper>
    </Card>
  );
};

// --- 12. MLP + backprop -----------------------------------------------------

const MLPDemo = () => {
  // small fixed architecture: 2 - 4 - 4 - 1
  const layers = [2, 4, 4, 1];
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT(x => (x + 1) % 60), 80 / speed);
    return () => clearInterval(id);
  }, [playing, speed]);

  // compute neuron positions
  const W = 540, H = 220;
  const cols = layers.length;
  const colX = (i) => 60 + (i / (cols - 1)) * (W - 120);
  const nodeY = (c, i) => {
    const n = layers[c];
    return H / 2 + (i - (n - 1) / 2) * 32;
  };

  const phase = Math.floor(t / 15); // 0=forward, 1=loss, 2=backward, 3=update
  const forwardProg = phase === 0 ? (t % 15) / 14 : 1;
  const backwardProg = phase === 2 ? (t % 15) / 14 : (phase > 2 ? 1 : 0);

  return (
    <Card id="c-mlp" icon={Network} title="Multi-Layer Perceptrons & backpropagation" subtitle="Stack linear layers and nonlinearities. Train with chain-rule everywhere." accent="sky" index={12}>
      <MinSchema>An <Term>MLP</Term> is a stack of alternating linear maps and <Term>activation function</Term>s. <Term>Backpropagation</Term> is just the chain rule run backward through the computation graph — it delivers <Eq>{'\\gd{\\partial \\loss{\\mathcal{L}}/\\partial \\w{w}}'}</Eq> for every weight in one forward + one backward pass.</MinSchema>
      <KeyEq>{'\\mo{h^{(\\ell+1)}} = \\sigma(\\w{W^{(\\ell)}}\\mo{h^{(\\ell)}} + \\w{b^{(\\ell)}})'}</KeyEq>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* edges */}
          {layers.slice(0, -1).map((n1, c) => (
            Array.from({ length: n1 }).map((_, i) => (
              Array.from({ length: layers[c + 1] }).map((_, j) => {
                const x1 = colX(c), y1 = nodeY(c, i), x2 = colX(c + 1), y2 = nodeY(c + 1, j);
                const col = phase === 0 || phase === 1
                  ? (c < forwardProg * (cols - 1) ? '#7dd3fc' : '#ffffff15')
                  : phase === 2
                    ? ((cols - 2 - c) < backwardProg * (cols - 1) ? '#6ee7b7' : '#ffffff10')
                    : '#c4b5fd55';
                return <line key={`${c}-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="1" />;
              })
            ))
          ))}
          {/* nodes */}
          {layers.map((n, c) => Array.from({ length: n }).map((_, i) => {
            const cx = colX(c), cy = nodeY(c, i);
            let fill = '#27272a';
            if (phase === 0) fill = c <= forwardProg * (cols - 1) ? '#38bdf8' : '#27272a';
            else if (phase === 1) fill = c === cols - 1 ? '#fca5a5' : '#38bdf8';
            else if (phase === 2) fill = c >= cols - 1 - backwardProg * (cols - 1) ? '#6ee7b7' : '#38bdf8';
            else fill = '#c4b5fd';
            return <circle key={`${c}-${i}`} cx={cx} cy={cy} r={9} fill={fill} stroke="#ffffff25" strokeWidth="1" />;
          }))}
          {/* labels */}
          <text x={colX(0)} y={H - 8} textAnchor="middle" fill="#a1a1aa" fontSize="11" fontFamily="monospace">x input</text>
          {layers.slice(1, -1).map((_, i) => (
            <text key={i} x={colX(i + 1)} y={H - 8} textAnchor="middle" fill="#a1a1aa" fontSize="11" fontFamily="monospace">hidden</text>
          ))}
          <text x={colX(cols - 1)} y={H - 8} textAnchor="middle" fill="#a1a1aa" fontSize="11" fontFamily="monospace">ŷ output</text>
          <text x={W / 2} y={18} textAnchor="middle" fill={['#7dd3fc', '#fca5a5', '#6ee7b7', '#c4b5fd'][phase]} fontSize="12" fontFamily="monospace">
            {['1. forward pass', '2. compute loss', '3. backward pass', '4. update weights'][phase]}
          </text>
        </svg>
        <PlayCtl playing={playing} onToggle={() => setPlaying(p => !p)} onReset={() => { setT(0); setPlaying(false); }} speed={speed} setSpeed={setSpeed} />
      </div>
      <Worked>
        <div className="font-mono text-[11px] uppercase tracking-widest text-emerald-300 mb-1">why the chain rule suffices</div>
        <p>For a composition <Eq>{'\\mo{\\hat y} = f_L(f_{L-1}(\\dots f_1(\\x{x})))'}</Eq>, the gradient of the loss w.r.t. any intermediate parameter <Eq>{'\\w{w^{(\\ell)}}'}</Eq> is</p>
        <Block>{'\\gd{\\frac{\\partial \\loss{\\mathcal{L}}}{\\partial \\w{w^{(\\ell)}}}} = \\gd{\\frac{\\partial \\loss{\\mathcal{L}}}{\\partial \\mo{\\hat y}}} \\cdot \\frac{\\partial \\mo{\\hat y}}{\\partial f_L} \\cdots \\frac{\\partial f_{\\ell+1}}{\\partial f_\\ell} \\cdot \\frac{\\partial f_\\ell}{\\partial \\w{w^{(\\ell)}}}'}</Block>
        <p>Each local derivative is cheap. Multiplying right-to-left (reverse-mode AD) gives all gradients in O(one forward pass) of memory and compute. This insight (Werbos 1974 → Rumelhart/Hinton/Williams 1986) is the <em>only</em> reason deep networks are tractable.</p>
      </Worked>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="Why do we need a nonlinearity?"
          a={<>A stack of linear layers is a single linear layer: <Eq>{'W_3(W_2 W_1 x) = (W_3 W_2 W_1) x'}</Eq>. Without a <Term>ReLU</Term> / tanh / GeLU between them, depth gives you nothing. The nonlinearity is where expressiveness comes from.</>} />
        <QA q="Why was deep learning stuck until ~2012?"
          a={<>Three blockers: (1) <Term>vanishing gradient</Term>s — sigmoid/tanh saturate, killing backprop signal through many layers. (2) Not enough labeled data. (3) Not enough compute. ReLU (2011), ImageNet (2009), and GPUs (CUDA 2007+) relaxed all three by ~2012, which is when AlexNet happened.</>} />
      </div>
      <Deeper>
        <p><strong>The universal approximation theorem</strong> (Cybenko 1989, Hornik 1991): an MLP with one hidden layer of sufficient width can approximate any continuous function on a bounded domain. In practice, width grows exponentially with the function's complexity — so the theorem is reassuring but not prescriptive. Depth is what actually unlocks efficient representation, as ResNets and later transformers made emphatically clear.</p>
        <p><strong>Breakthroughs that fixed vanishing gradients:</strong> ReLU (no saturation on the positive side), skip connections / ResNets (gradient highways), careful initialization (He, Xavier), and normalization layers (<Term>batch normalization</Term>, <Term>layernorm</Term>). Each of these alone shifted what was trainable by orders of magnitude.</p>
        <p><strong>What an MLP actually is, philosophically.</strong> It's a learned <em>feature extractor</em> (all but the last layer) plus a linear classifier on top. Everything interesting about deep learning is about what feature extractor shape makes sense for the data: convolutions for images, attention for sequences, graph message passing for graphs, etc.</p>
      </Deeper>
    </Card>
  );
};

// --- 13. CNNs ---------------------------------------------------------------

const CNNDemo = () => {
  // 8x8 grayscale "image" with a diagonal edge
  const img = useMemo(() => {
    const m = [];
    for (let y = 0; y < 8; y++) { const row = []; for (let x = 0; x < 8; x++) row.push(x > y ? 0.9 : 0.15); m.push(row); }
    return m;
  }, []);
  const kernels = {
    edge: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    blur: [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]],
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
  };
  const [kernel, setKernel] = useState('edge');
  const [pos, setPos] = useState({ r: 0, c: 0 });
  useEffect(() => {
    const id = setInterval(() => setPos(p => {
      let c = p.c + 1, r = p.r;
      if (c > 5) { c = 0; r = r + 1; if (r > 5) r = 0; }
      return { r, c };
    }), 260);
    return () => clearInterval(id);
  }, []);
  const K = kernels[kernel];
  const outMap = useMemo(() => {
    const out = [];
    for (let y = 0; y < 6; y++) {
      const row = [];
      for (let x = 0; x < 6; x++) {
        let s = 0;
        for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) s += K[j][i] * img[y + j][x + i];
        row.push(s);
      }
      out.push(row);
    }
    return out;
  }, [img, K]);

  const cell = 22;
  const shade = (v) => {
    const g = Math.max(0, Math.min(1, 0.5 + v / 2));
    return `rgb(${Math.round(g * 220)},${Math.round(g * 220)},${Math.round(g * 240)})`;
  };

  return (
    <Card id="c-cnn" icon={ImageIcon} title="Convolutional Neural Networks" subtitle="The architecture that ran computer vision for a decade." accent="rose" index={13}>
      <MinSchema>A <Term>convolution</Term> slides a small learned filter across the image, producing a <Term>feature map</Term> that highlights wherever that pattern occurs. Stack these with pooling and you get translation-invariant, hierarchical visual detectors.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {Object.keys(kernels).map(k => <Tab key={k} active={kernel === k} onClick={() => setKernel(k)}>{k}</Tab>)}
        </div>
        <div className="flex items-start justify-around gap-4 flex-wrap">
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">input · 8×8</div>
            <svg width={cell * 8 + 4} height={cell * 8 + 4}>
              {img.map((row, y) => row.map((v, x) => (
                <rect key={`${y}-${x}`} x={x * cell + 2} y={y * cell + 2} width={cell - 1} height={cell - 1} fill={shade(v)} />
              )))}
              {/* filter overlay */}
              <rect x={pos.c * cell + 1} y={pos.r * cell + 1} width={3 * cell + 1} height={3 * cell + 1} fill="none" stroke="#c4b5fd" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">kernel · 3×3</div>
            <svg width={cell * 3 + 4} height={cell * 3 + 4}>
              {K.map((row, y) => row.map((v, x) => (
                <g key={`${y}-${x}`}>
                  <rect x={x * cell + 2} y={y * cell + 2} width={cell - 1} height={cell - 1} fill={v > 0 ? '#7dd3fc55' : v < 0 ? '#f9a8d455' : '#27272a'} stroke="#ffffff22" />
                  <text x={x * cell + cell / 2 + 2} y={y * cell + cell / 2 + 6} fontSize="10" fontFamily="monospace" fill="#fff" textAnchor="middle">{v.toFixed(1)}</text>
                </g>
              )))}
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">feature map · 6×6</div>
            <svg width={cell * 6 + 4} height={cell * 6 + 4}>
              {outMap.map((row, y) => row.map((v, x) => (
                <rect key={`${y}-${x}`} x={x * cell + 2} y={y * cell + 2} width={cell - 1} height={cell - 1}
                  fill={v > 0 ? `rgba(125,211,252,${Math.min(1, Math.abs(v) * 0.8)})` : `rgba(249,168,212,${Math.min(1, Math.abs(v) * 0.8)})`} />
              )))}
              <rect x={pos.c * cell + 1} y={pos.r * cell + 1} width={cell + 1} height={cell + 1} fill="none" stroke="#c4b5fd" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="text-[11px] text-neutral-500">The filter slides across the image; each placement produces one pixel of the feature map. Edge filter lights up at the diagonal, blur softens, sharpen boosts high-frequency detail.</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="What's pooling for?"
          a="Pooling (typically max or average over 2×2 windows) halves spatial resolution while doubling channel count. Two effects: translation invariance (a cat shifted 3 pixels still pools the same), and computational efficiency (a 64-layer net on raw 1024×1024 pixels would be unworkable). Modern nets increasingly skip pooling in favor of strided convolutions." />
        <QA q="Are CNNs obsolete now that Vision Transformers exist?"
          a="Not quite. ViTs win at very large scale and with huge pretraining data. CNNs (ConvNeXt, EfficientNet) are still competitive at small/medium scale and more parameter-efficient. Most production vision systems in 2026 are hybrids or ConvNeXt-family." />
      </div>
      <Deeper>
        <p><strong>Two priors that make CNNs work.</strong> (1) <em>Locality</em> — nearby pixels are more informative about each other than far pixels. Convolution's receptive field encodes this directly. (2) <em>Translation equivariance</em> — a cat is still a cat if you shift it. Weight sharing across spatial positions is the mathematical form of that belief. Giving up these priors (→ ViT) costs data and parameters but buys flexibility for non-natural images (satellite, medical with different structure).</p>
        <p><strong>The AlexNet moment (2012).</strong> Krizhevsky, Sutskever, Hinton trained an 8-layer CNN on ImageNet on two GTX 580 GPUs. It halved the SOTA error rate. Previous best used SIFT features + SVM — hand-engineered. AlexNet learned all its features from pixels. Modern ML starts here. ResNet (2015), BatchNorm (2015), Inception (2014), EfficientNet (2019) are refinements of the same basic recipe.</p>
        <p><strong>Why vision was first.</strong> The translation-equivariance prior gives CNNs an enormous inductive bias that makes them data-efficient. Language had no such clean prior — which is why NLP had to wait for transformers and web-scale data.</p>
      </Deeper>
    </Card>
  );
};

// --- 14. RNN/LSTM -----------------------------------------------------------

const RNNDemo = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep(s => (s + 1) % 8), 500);
    return () => clearInterval(id);
  }, [playing]);
  const W = 540, H = 180;
  const words = ['The', 'cat', 'that', 'chased', 'the', 'mouse', 'was', 'black.'];
  const cellW = W / words.length;

  return (
    <Card id="c-rnn" icon={Waves} title="RNNs, LSTMs, and the vanishing gradient" subtitle="Sequence models before transformers — and why they lost." accent="amber" index={14}>
      <MinSchema>An <Term>RNN</Term> processes a sequence one step at a time, carrying a hidden state <Eq>{'\\mo{h_t}'}</Eq> forward: <Eq>{'\\mo{h_t} = \\sigma(\\w{W_h}\\mo{h_{t-1}} + \\w{W_x}\\x{x_t})'}</Eq>. Gradients flowing back through many steps multiplicatively shrink — the <Term>vanishing gradient</Term> problem.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* hidden-state cells */}
          {words.map((w, i) => (
            <g key={i}>
              <rect x={i * cellW + 8} y={H / 2 - 16} width={cellW - 16} height={32} rx={4}
                fill={i <= step ? '#c4b5fd' : '#27272a'} opacity={i <= step ? 0.6 : 0.5} stroke="#ffffff22" />
              <text x={i * cellW + cellW / 2} y={H / 2 + 4} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#fff">h{i + 1}</text>
              {i < words.length - 1 && (
                <line x1={(i + 1) * cellW - 8} y1={H / 2} x2={(i + 1) * cellW + 8} y2={H / 2} stroke="#c4b5fd" strokeWidth="1.5" />
              )}
              {/* inputs */}
              <text x={i * cellW + cellW / 2} y={H / 2 + 48} textAnchor="middle" fontSize="11" fill="#7dd3fc">{w}</text>
              <line x1={i * cellW + cellW / 2} y1={H / 2 + 38} x2={i * cellW + cellW / 2} y2={H / 2 + 18} stroke="#7dd3fc" strokeWidth="1" />
            </g>
          ))}
          {/* gradient flow backward: fading */}
          {Array.from({ length: step }).map((_, i) => {
            const idx = step - 1 - i;
            const opacity = Math.pow(0.55, i);
            return (
              <g key={i}>
                <path d={`M ${(idx + 1) * cellW - 8} ${H / 2 - 20} Q ${(idx + 0.5) * cellW} ${20} ${idx * cellW + 8} ${H / 2 - 20}`}
                  fill="none" stroke="#fca5a5" strokeWidth="1.5" opacity={opacity} markerEnd="url(#arrRnn)" />
              </g>
            );
          })}
          <defs>
            <marker id="arrRnn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill="#fca5a5" />
            </marker>
          </defs>
          <text x={10} y={24} fill="#fca5a5" fontSize="11" fontFamily="monospace">∇ gradient flows ← (fades with distance)</text>
        </svg>
        <div className="flex items-center gap-2 flex-wrap">
          <Button icon={playing ? Pause : Play} variant="ghost" onClick={() => setPlaying(p => !p)}>{playing ? 'pause' : 'play'}</Button>
          <Button icon={RotateCcw} variant="ghost" onClick={() => setStep(0)}>reset</Button>
          <span className="text-[11px] text-neutral-500">step {step + 1} / {words.length}</span>
        </div>
        <div className="text-[11px] text-neutral-500">By the time the gradient tries to tell "black" that it should depend on "cat" (8 steps back), its signal has been multiplied by 8 small numbers — barely any signal left. <Term>LSTM</Term> (1997) and <Term>GRU</Term> (2014) fix this partially with gated skip connections. Transformers fix it by abandoning recurrence entirely.</div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-sky-300 font-mono uppercase text-[10px] tracking-widest mb-1">vanilla RNN</div>
          <div className="text-neutral-300">One hidden state, shared weights across time. Can't remember past ~10 steps in practice due to vanishing gradients.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-emerald-300 font-mono uppercase text-[10px] tracking-widest mb-1">LSTM</div>
          <div className="text-neutral-300">Three learned gates (input/forget/output) + a cell state with a <em>linear</em> self-connection. Lets information persist for 100+ steps. NLP workhorse 2014–2018.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-violet-300 font-mono uppercase text-[10px] tracking-widest mb-1">GRU</div>
          <div className="text-neutral-300">Two gates instead of three. Slightly fewer params, often the same accuracy as LSTM. Popular replacement 2015–2018.</div>
        </div>
      </div>
      <Misconception
        think="Transformers killed RNNs because transformers are smarter."
        actually="They killed them because they're embarrassingly parallel. An RNN has to process tokens sequentially — step n depends on step n−1. A transformer attends to all positions in parallel, which is orders of magnitude faster on a GPU. At sequence length 2k, both can theoretically model it; the transformer just trains 100× faster. Scale won." />
      <Deeper>
        <p><strong>LSTM's key trick</strong> is the cell state: a vector that travels through time with only <em>additive</em> updates (gated by element-wise multiplications). Because there's no repeated matrix multiplication in its path, gradients flowing through the cell state don't shrink geometrically — they can propagate hundreds of steps.</p>
        <p><strong>Why transformers replaced them so fast</strong> (2017 paper → 2019 BERT → 2020 GPT-3 → total dominance). (1) Parallelism on GPUs. (2) Attention is a better prior for language than "hidden state summary" — every token can look at every other directly. (3) Scaling: transformers keep improving past where RNNs plateau, which is the part that turned out to matter. <Term>SSM</Term>s like Mamba (2023) are the modern attempt to recover RNN-style linear cost at sequence length while keeping transformer-like quality — a story not yet finished.</p>
      </Deeper>
    </Card>
  );
};

// --- 15. attention / transformer --------------------------------------------

const AttentionDemo = () => {
  const sentence = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  // hand-crafted attention pattern so "sat" attends to "cat" heavily, etc.
  const weights = useMemo(() => sentence.map((q, i) => sentence.map((k, j) => {
    let w = 0.1;
    if (i === 0) w = [1, 0.05, 0.05, 0.05, 0.05, 0.05][j];  // The: diffuse
    if (i === 1) w = [0.05, 1, 0.1, 0.1, 0.05, 0.1][j];     // cat: self
    if (i === 2) w = [0.1, 0.8, 1, 0.3, 0.05, 0.2][j];      // sat: sat ← cat
    if (i === 3) w = [0.05, 0.1, 0.4, 1, 0.1, 0.6][j];      // on: attends sat, mat
    if (i === 4) w = [0.6, 0.1, 0.05, 0.1, 1, 0.4][j];      // the: copies from "The"
    if (i === 5) w = [0.1, 0.3, 0.2, 0.7, 0.3, 1][j];       // mat: attends on
    return w;
  })), [sentence]);
  // softmax
  const normalized = weights.map(r => {
    const exp = r.map(v => Math.exp(v * 3));
    const s = exp.reduce((a, b) => a + b, 0);
    return exp.map(v => v / s);
  });

  const [query, setQuery] = useState(2);

  const cell = 52;
  return (
    <Card id="c-attn" icon={Orbit} title="Attention and the Transformer block" subtitle="The layer that ate deep learning." accent="violet" index={15}>
      <MinSchema>Every token becomes a query, key, and value vector. <Term>Attention</Term> computes the <em>relevance</em> of every key to your query (dot product, softmax) and takes a weighted average of the values. Every position talks to every other position in one layer.</MinSchema>
      <KeyEq>{'\\mathrm{Attn}(Q, K, V) = \\mathrm{softmax}\\!\\left(\\frac{Q K^\\top}{\\sqrt{d_k}}\\right) V'}</KeyEq>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-400">
          <span>click a word to make it the query</span>
        </div>
        <svg viewBox={`0 0 ${cell * sentence.length + 60} ${cell * sentence.length + 60}`} className="w-full h-auto select-none">
          {/* column keys */}
          {sentence.map((w, j) => (
            <text key={j} x={60 + j * cell + cell / 2} y={20} textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">{w}</text>
          ))}
          {/* heatmap */}
          {normalized.map((row, i) => row.map((v, j) => (
            <rect key={`${i}-${j}`} x={60 + j * cell + 2} y={30 + i * cell + 2} width={cell - 4} height={cell - 4}
              fill={`rgba(196,181,253,${Math.min(1, v * 2.5)})`}
              stroke={i === query ? '#c4b5fd' : 'transparent'} strokeWidth={i === query ? 2 : 0}
              onClick={() => setQuery(i)} style={{ cursor: 'pointer' }} />
          )))}
          {/* row labels */}
          {sentence.map((w, i) => (
            <text key={i} x={52} y={30 + i * cell + cell / 2 + 4} textAnchor="end" fill={i === query ? '#c4b5fd' : '#a1a1aa'} fontSize="12" fontFamily="monospace" onClick={() => setQuery(i)} style={{ cursor: 'pointer' }}>{w}</text>
          ))}
        </svg>
        <div className="text-[11px] text-neutral-400 font-mono">query: <span className="text-violet-200">"{sentence[query]}"</span> attends mostly to: {normalized[query].map((v, j) => ({ w: sentence[j], v })).sort((a, b) => b.v - a.v).slice(0, 3).map(x => `"${x.w}" (${(x.v * 100).toFixed(0)}%)`).join(' · ')}</div>
      </div>
      <Worked>
        <div className="font-mono text-[11px] uppercase tracking-widest text-emerald-300 mb-1">one transformer block</div>
        <p>For a sequence of embeddings <Eq>{'\\mo{H} \\in \\mathbb{R}^{n \\times d}'}</Eq>:</p>
        <Block>{`\\begin{aligned}Q &= \\mo{H}\\w{W_Q},\\ K = \\mo{H}\\w{W_K},\\ V = \\mo{H}\\w{W_V} \\\\ \\mo{H}^{\\prime} &= \\mathrm{LN}(\\mo{H} + \\mathrm{MultiHeadAttn}(Q, K, V)) \\\\ \\mo{H}^{\\prime\\prime} &= \\mathrm{LN}(\\mo{H}^{\\prime} + \\mathrm{MLP}(\\mo{H}^{\\prime}))\\end{aligned}`}</Block>
        <p>Stack 12–120 of these. Add <Term>RoPE</Term> or sinusoidal position embeddings and a tokenizer. That's the entire architecture behind GPT, Claude, Llama, and every other 2026 frontier model.</p>
      </Worked>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="Why multi-head attention?"
          a={<>A single attention head can only focus on one type of relationship at a time. Multi-head splits Q, K, V into H independent subspaces and runs H attention computations in parallel — one head might track syntax, another coreference, another topic. The final output concatenates all heads. 8–128 heads is typical.</>} />
        <QA q="Why do transformers scale so well?"
          a={<>(1) Embarrassingly parallel at training — every token in a sequence computed simultaneously. (2) Uniform architecture — no special cases to tune. (3) The <Term>scaling laws</Term>: doubling compute reliably lowers loss in a power law. This predictability is what turned the transformer from an academic curiosity into a $1T industry.</>} />
      </div>
      <Deeper>
        <p><strong>Why the division by <Eq>{'\\sqrt{d_k}'}</Eq></strong>: for large <Eq>{'d_k'}</Eq>, dot products of random vectors have variance proportional to <Eq>{'d_k'}</Eq>. Unscaled logits would be enormous and softmax would collapse to a one-hot, zeroing most gradients. The scaling keeps logit variance O(1).</p>
        <p><strong>Computational cost:</strong> attention is O(n²·d) in sequence length n. At 2k context it's fine; at 1M context it's catastrophic. All the recent long-context work — FlashAttention-2/3 (memory-efficient tiling), linear/local/sparse attention, State-Space Models (Mamba) — attacks this quadratic term.</p>
        <p><strong>Why it "ate deep learning."</strong> The transformer is essentially a single universal architecture for any set of tokens with an interaction structure. Images → patches → ViT. Audio → spectrogram patches. Video → spatiotemporal patches. Protein → amino acid tokens → ESM. Code → BPE tokens → CodeLlama. Before 2017, each modality had its own architecture. Now there's one.</p>
      </Deeper>
    </Card>
  );
};

// --- 16. LLM recipe & scaling laws -----------------------------------------

const LLMRecipeDemo = () => {
  const [stage, setStage] = useState(0);
  const stages = [
    { name: 'Pretrain', icon: Database, color: 'sky', desc: 'Next-token prediction on ~10T tokens of web/code/books. 10^25+ FLOPs. Produces a raw "base model" that knows a lot and refuses nothing.' },
    { name: 'Supervised fine-tune (SFT)', icon: PenLine, color: 'emerald', desc: 'Continue training on ~1M high-quality (instruction, response) pairs written by humans. Teaches the model to follow directions instead of just continuing text.' },
    { name: 'RLHF / DPO', icon: Scale, color: 'violet', desc: 'Train a reward model from human preference pairs (A or B?). Optimize the policy against that reward with PPO (RLHF) or directly via a closed-form loss (DPO). Improves helpfulness, harmlessness, honesty.' },
    { name: 'Reasoning RL (o1/o3-style)', icon: Workflow, color: 'fuchsia', desc: 'More RL, this time on problems with verifiable answers (math, code). Model learns to generate long chain-of-thought before answering. Dramatic gains on hard reasoning.' },
  ];

  // Scaling law plot: L = a N^-alpha + b (schematic)
  const W = 440, H = 210;
  const AX_Y = H - 50; // x-axis line y
  const PAD_L = 50, PAD_R = 40;
  const logN = Array.from({ length: 60 }, (_, i) => 6 + (i / 59) * 5); // 1M to 100B params
  const lossChinchilla = (n) => 0.28 * Math.pow(10, -0.07 * (n - 6)) + 1.7;
  const sx = (lN) => ((lN - 6) / 5) * (W - PAD_L - PAD_R) + PAD_L;
  const sy = (l) => AX_Y - ((l - 1.6) / 1.5) * (AX_Y - 20);
  const scalePath = logN.map(lN => `${sx(lN)},${sy(lossChinchilla(lN))}`).join(' ');

  return (
    <Card id="c-llm" icon={Bot} title="Scaling laws and the LLM recipe" subtitle="Pretrain, fine-tune, align. Predict the loss, and the capabilities that come with it." accent="sky" index={16}>
      <MinSchema>A modern frontier LLM is built in four stages: massive self-supervised <Term>pretraining</Term>, instruction <Term>fine-tuning</Term>, preference optimization (<Term>RLHF</Term>/<Term>DPO</Term>), and reasoning RL. Each stage is cheaper than the last but has outsize effect on usability.</MinSchema>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex items-stretch gap-2 flex-wrap">
          {stages.map((s, i) => {
            const I = s.icon;
            return (
              <button key={i} onClick={() => setStage(i)}
                className={`flex-1 min-w-[110px] text-left rounded-lg border p-2.5 transition-colors ${stage === i ? `bg-${s.color}-500/15 border-${s.color}-400/40` : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}>
                <I className={`w-4 h-4 text-${s.color}-300 mb-1.5`} />
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">stage {i + 1}</div>
                <div className="text-[12px] text-neutral-100 leading-tight">{s.name}</div>
              </button>
            );
          })}
        </div>
        <motion.div key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-white/[0.03] border border-white/10 p-3 text-sm text-neutral-200">
          {stages[stage].desc}
        </motion.div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono"><TrendingUp className="w-3.5 h-3.5 text-emerald-300" /> scaling law · test loss ≈ a·N^−α + b</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* axes */}
          <line x1={PAD_L} y1={AX_Y} x2={W - PAD_R + 10} y2={AX_Y} stroke="#ffffff22" />
          <line x1={PAD_L} y1={10} x2={PAD_L} y2={AX_Y} stroke="#ffffff22" />
          {/* ticks */}
          {[6, 7, 8, 9, 10, 11].map(lN => (
            <g key={lN}>
              <line x1={sx(lN)} y1={AX_Y} x2={sx(lN)} y2={AX_Y + 4} stroke="#ffffff33" />
              <text x={sx(lN)} y={AX_Y + 14} fill="#71717a" fontSize="9" fontFamily="monospace" textAnchor="middle">10^{lN}</text>
            </g>
          ))}
          <polyline points={scalePath} fill="none" stroke="#6ee7b7" strokeWidth="2" />
          {/* reference points — alternate label offset to avoid vertical stacking on the line */}
          {[
            { n: 8.1, name: 'GPT-2', dy: -10 },
            { n: 9.2, name: 'GPT-3', dy: -10 },
            { n: 10.2, name: 'GPT-4-ish', dy: -10 },
            { n: 11, name: 'frontier', dy: 14 },
          ].map(pt => {
            const cx = sx(pt.n);
            const cy = sy(lossChinchilla(pt.n));
            // clamp label x so it doesn't go past the right edge
            const maxX = W - 4;
            const minX = PAD_L + 4;
            const lx = Math.min(maxX, Math.max(minX, cx));
            const anchor = cx > W - PAD_R - 10 ? 'end' : (cx < PAD_L + 20 ? 'start' : 'middle');
            return (
              <g key={pt.name}>
                <circle cx={cx} cy={cy} r={3.5} fill="#c4b5fd" />
                <text x={lx} y={cy + pt.dy} textAnchor={anchor} fill="#c4b5fd" fontSize="9" fontFamily="monospace">{pt.name}</text>
              </g>
            );
          })}
          <text x={8} y={sy(1.7)} fill="#71717a" fontSize="10" fontFamily="monospace">loss</text>
          <text x={PAD_L + (W - PAD_L - PAD_R) / 2} y={H - 6} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">parameters (log)</text>
        </svg>
        <div className="text-[11px] text-neutral-500">Kaplan et al. (2020) and Chinchilla (Hoffmann 2022) showed test loss falls as a power law in compute, parameters, and data. The curve is remarkably smooth — you can fit small models and extrapolate big ones before you build them. Chinchilla's key correction: for a fixed compute budget, you want ~20 tokens per parameter (GPT-3 was under-trained).</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <QA q="How much does each stage cost?"
          a="Pretraining: 10^25–10^26 FLOPs, tens-to-hundreds of millions of dollars of GPU-time. SFT: typically <1% of pretrain compute, but the data is expensive ($10–100 per labeled example). RLHF: ~1–5% of pretrain compute, plus a (cheaper) reward model. Reasoning RL: growing fast — some frontier labs reportedly use more compute here than pretraining." />
        <QA q="Where do emergent capabilities come from?"
          a={<>A contested topic. Some tasks show step-function jumps in accuracy as scale increases ("<Term>emergence</Term>"). Recent work (Schaeffer et al. 2023) argues these often go away under smooth metrics — they're artifacts of binary success measures, not genuine phase transitions. But the <em>overall</em> trend of capability with scale is real: predictable loss → hard-to-predict capabilities on downstream tasks.</>} />
      </div>
      <Misconception
        think="The model 'learns' during RLHF the way it does during pretraining."
        actually="RLHF barely changes the weights — typically <0.1% of the parameters move meaningfully. It reshapes <em>which</em> behaviors the model preferentially outputs from its existing distribution. You can think of pretraining as 'installing knowledge and skills' and RLHF as 'putting good manners on top'. The knowledge was already there." />
      <Deeper>
        <p><strong>DPO vs RLHF.</strong> Classical RLHF trains a reward model, then runs PPO to optimize the policy against it — two stages, one unstable. DPO (Rafailov et al. 2023) observed that under mild assumptions the optimal policy has a closed-form relationship to preference data, so you can skip the reward model and directly optimize a simple cross-entropy-like loss on preference pairs. Simpler, more stable, comparable quality. Most open models ship with DPO-family methods (IPO, KTO, SimPO) in 2026.</p>
        <p><strong>The compute-vs-data budget (Chinchilla).</strong> For compute budget C, loss is minimized when parameters N and tokens D are both scaled as ~C^½ — not "make the model bigger," but "make it bigger <em>and</em> train it longer in lockstep." GPT-3 (175B params, 300B tokens) was undertrained; Llama 3 8B (15T tokens) is a Chinchilla-optimal small model. The cost-optimal model for inference is often <em>smaller</em> than the loss-optimal one — hence the rise of 7–70B "workhorse" models.</p>
        <p><strong>Test-time compute.</strong> The o1/o3/R1 line of models (2024–2026) reallocates compute from training to inference: generate long <Term>chain-of-thought</Term> reasoning, branch, verify, sometimes tree-search. Dramatic gains on math and code. Implication: scaling laws now have <em>two</em> knobs, and the right mix depends on the task.</p>
      </Deeper>
    </Card>
  );
};

// --- 17. diffusion ----------------------------------------------------------

const DiffusionDemo = () => {
  const [t, setT] = useState(20);
  const N = 28, M = 28;
  // target "image": circle
  const target = useMemo(() => {
    const arr = [];
    for (let y = 0; y < M; y++) { const row = []; for (let x = 0; x < N; x++) {
      const dx = x - N / 2, dy = y - M / 2;
      const r = Math.hypot(dx, dy);
      row.push(r < 9 ? 1 : 0);
    } arr.push(row); } return arr;
  }, []);
  // noise seeded
  const noise = useMemo(() => {
    let s = 71;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 * 2 - 1; };
    return Array.from({ length: M }, () => Array.from({ length: N }, () => rnd()));
  }, []);
  // interpolate
  const img = useMemo(() => {
    const alpha = t / 20; // 0 = pure noise, 1 = pure data
    return target.map((row, y) => row.map((v, x) => alpha * v + (1 - alpha) * (0.5 + 0.5 * noise[y][x])));
  }, [target, noise, t]);

  const cell = 8;
  return (
    <Card id="c-diffusion" icon={Sparkles} title="Diffusion models: noise → image" subtitle="Learn to reverse a gradual noising process. Generate by unrolling the reverse." accent="fuchsia" index={17}>
      <MinSchema>Forward: progressively add Gaussian noise to a real image until it's pure noise. Learn a network <Eq>{'\\mo{\\epsilon_\\theta(x_t, t)}'}</Eq> that predicts that noise. Sampling: start from noise, iteratively subtract the predicted noise — you unroll the reverse trajectory.</MinSchema>
      <KeyEq>{'\\loss{\\mathcal{L}} = \\mathbb{E}_{\\x{x_0}, \\epsilon, t}\\!\\left[\\|\\epsilon - \\mo{\\epsilon_\\theta(\\x{x_t}, t)}\\|^2\\right]'}</KeyEq>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <div className="flex justify-center">
          <svg width={N * cell + 4} height={M * cell + 4}>
            {img.map((row, y) => row.map((v, x) => {
              const g = Math.round(Math.max(0, Math.min(1, v)) * 240);
              return <rect key={`${y}-${x}`} x={x * cell + 2} y={y * cell + 2} width={cell} height={cell}
                fill={`rgb(${Math.round(g * 0.95)},${Math.round(g * 0.85)},${g})`} />;
            }))}
          </svg>
        </div>
        <Slider label="denoising step" value={t} onChange={v => setT(Math.round(v))} min={0} max={20} step={1} accent="fuchsia" fmt={v => `${v}/20`} />
        <div className="text-[11px] text-neutral-500">At t=20: the "image" (a circle) is clearly visible. At t=0: pure noise. A real diffusion model learns a neural function that, at every t, predicts how to remove a little noise — and sampling is 20–1000 iterations of that.</div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-fuchsia-300 font-mono uppercase text-[10px] tracking-widest mb-1">Why it works</div>
          <div className="text-neutral-300">Generating data in one shot is hard; predicting a <em>small</em> denoising step is easy. Compose many easy steps — get a hard one-shot sampler for free.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-sky-300 font-mono uppercase text-[10px] tracking-widest mb-1">Backbone</div>
          <div className="text-neutral-300">Usually a <Term>UNet</Term> (for pixels) or a Diffusion Transformer / DiT (used in Sora, SD3). Latent diffusion operates in a VAE's latent space for efficiency.</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-violet-300 font-mono uppercase text-[10px] tracking-widest mb-1">Conditioning</div>
          <div className="text-neutral-300">Text → image via cross-attention from a frozen text encoder (T5, CLIP). Classifier-free guidance amplifies the conditioning signal — essential for prompt adherence.</div>
        </div>
      </div>
      <QA q="Diffusion vs GANs vs autoregressive image models — which wins?"
        a="Diffusion (and its cousin flow matching) dominates image/video as of 2026 — more stable training than GANs, better fidelity and controllability than autoregressive. Autoregressive (VAR, GPT-style image models) is making a comeback for tight latency. For audio: diffusion + autoregressive hybrids." />
      <Deeper>
        <p><strong>The math.</strong> Forward process defines <Eq>{'q(\\x{x_t} \\mid \\x{x_0}) = \\mathcal{N}(\\sqrt{\\bar\\alpha_t}\\x{x_0}, (1-\\bar\\alpha_t)I)'}</Eq> — a Gaussian that gets wider and wider. With enough steps, <Eq>{'q(\\x{x_T})'}</Eq> is indistinguishable from standard noise. Reversing it (Sohl-Dickstein 2015, Ho et al. 2020) means learning <Eq>{'p_\\theta(\\x{x_{t-1}} \\mid \\x{x_t})'}</Eq> — which the DDPM paper showed reduces to predicting the <em>noise</em> added at each step. Training is embarrassingly simple: sample a random t, add noise, ask the net to predict it.</p>
        <p><strong>Flow matching</strong> (Lipman et al. 2023) reframes this as learning a time-dependent vector field that transports a simple prior (Gaussian) to the data distribution. Cleaner math, similar results, fewer sampling steps. Stable Diffusion 3, Flux, Sora, and most 2025+ image/video models use flow matching or rectified flow in practice.</p>
        <p><strong>Why <Term>UNet</Term>?</strong> Denoising at step t needs both global structure (what's the image?) and local detail (where are the edges?). UNet's encoder-decoder with skip connections gives you exactly that — downsample to capture semantics, upsample for detail, skip for precise localization. Modern image models are switching to DiTs (transformers on latent patches) as scale increases.</p>
      </Deeper>
    </Card>
  );
};

// --- 18. multimodal ---------------------------------------------------------

const MultimodalDemo = () => {
  // 2D embedding space with paired images & captions landing near each other
  const pairs = [
    { t: '"a dog"', i: 'dog', x: 2.5, y: 2.5 },
    { t: '"a cat"', i: 'cat', x: 6, y: 2 },
    { t: '"a car"', i: 'car', x: 3, y: 5.2 },
    { t: '"a tree"', i: 'tree', x: 6.5, y: 5.5 },
  ];
  const [hover, setHover] = useState(null);
  const W = 400, H = 240;
  const xMin = 0, xMax = 9, yMin = 0, yMax = 7;
  const sx = (v) => ((v - xMin) / (xMax - xMin)) * W;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

  return (
    <Card id="c-mm" icon={ImageIcon} title="Multimodal: CLIP and Vision-Language Models" subtitle="Put images and text into the same embedding space." accent="cyan" index={18}>
      <MinSchema><Term>CLIP</Term> (2021) trains an image encoder and a text encoder jointly with a contrastive loss — <em>matching</em> image–caption pairs pulled together, non-matching pushed apart. Result: a shared space where you can compare any image to any text by dot product.</MinSchema>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">joint embedding space</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {pairs.map((p, i) => (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <circle cx={sx(p.x)} cy={sy(p.y)} r={26} fill="#ffffff08" stroke={hover === i ? '#7dd3fc' : '#ffffff22'} strokeWidth={hover === i ? 2 : 1} />
                {/* image glyph */}
                <text x={sx(p.x) - 8} y={sy(p.y) + 5} fill="#fca5a5" fontSize="18" textAnchor="middle">▣</text>
                {/* text glyph */}
                <text x={sx(p.x) + 16} y={sy(p.y) + 5} fill="#7dd3fc" fontSize="11" fontFamily="monospace">{p.t}</text>
              </g>
            ))}
            <text x={10} y={18} fill="#71717a" fontSize="10" fontFamily="monospace">hover a pair</text>
          </svg>
          <div className="text-[11px] text-neutral-500">Contrastive pretraining pulls each image and its caption to the same point. At inference: "caption this image" = find the nearest text embedding; "search images by query" = find the nearest image embedding.</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">what this unlocked</div>
          <div className="space-y-2 text-neutral-300 text-[13px]">
            <div className="flex gap-2"><Chip color="sky">retrieval</Chip><span>Google Lens, image search, deduplication on embedding space.</span></div>
            <div className="flex gap-2"><Chip color="violet">zero-shot classification</Chip><span>"Is this a ___?" by comparing an image embedding against a list of text embeddings.</span></div>
            <div className="flex gap-2"><Chip color="fuchsia">guidance</Chip><span>Text-conditioned image generation — CLIP was the backbone of Stable Diffusion's text adherence.</span></div>
            <div className="flex gap-2"><Chip color="emerald">VLM encoder</Chip><span>Modern <Term>VLM</Term>s (Claude, GPT-4o, Gemini, LLaVA) use CLIP-style vision encoders bolted onto an LLM via cross-attention or input projections.</span></div>
          </div>
        </div>
      </div>
      <QA q="How do VLMs actually 'see'?"
        a="A typical 2026 VLM: input image → ViT encoder → a sequence of ~256 image tokens in the LLM's embedding space → interleaved with the user's text tokens → run through the transformer. The image is just more tokens. Fine-tuning on instruction + image+text datasets teaches the LLM to attend appropriately." />
      <Deeper>
        <p><strong>The contrastive loss (InfoNCE / CLIP loss):</strong> for a batch of N paired (image, text) samples, compute the N×N similarity matrix, and apply softmax cross-entropy against the identity — each image should be most similar to its own caption, each caption to its own image. Works because any other pair in the batch is a useful negative for free. Quality scales with batch size — CLIP used batches of 32k.</p>
        <p><strong>From CLIP to native multimodal (2023→26).</strong> Early systems bolted CLIP onto an LLM via a projection layer (Flamingo, LLaVA). Newer systems (GPT-4o, Gemini 2.5, Claude 4) train multimodally from the start — text, image, audio tokens in the same transformer, with modality-specific tokenizers. Result: smoother reasoning across modalities (the model can think in pictures, not just about them).</p>
      </Deeper>
    </Card>
  );
};

// --- 19. frontier -----------------------------------------------------------

const FrontierDemo = () => {
  const topics = [
    {
      name: 'Mixture of Experts', icon: Boxes, color: 'violet',
      gist: 'Replace one big MLP with many small ones; route each token to 1–4 "experts." More parameters at the same FLOPs per token.',
      reality: 'Most frontier open models (Mixtral, DeepSeek-V3, Grok, Llama-4) are sparse MoEs. Training requires careful load balancing; inference requires expert-parallel infrastructure.',
    },
    {
      name: 'State-Space Models · Mamba', icon: Waves, color: 'sky',
      gist: 'A linear recurrence parameterized to track long-range dependencies. O(n) in sequence length instead of attention\'s O(n²).',
      reality: 'Mamba (Gu & Dao 2023) and successors (Mamba-2, Jamba) are gaining ground on long-context and on-device settings. Hybrid models (transformer + Mamba blocks) are the current sweet spot.',
    },
    {
      name: 'Reasoning & test-time compute', icon: Workflow, color: 'fuchsia',
      gist: 'Train the model to think out loud before answering, using RL on verifiable problems (math, code). At inference, scale thinking tokens.',
      reality: 'o1/o3, DeepSeek-R1, Gemini 2.0 Thinking, Claude 4 Extended Thinking. Beats bigger non-reasoning models on competition math. Expensive at inference (often 50–500× the tokens).',
    },
    {
      name: 'Agents & tool use', icon: Bot, color: 'emerald',
      gist: 'Let the model call external tools (search, code runner, file I/O, browser) in a loop. The model is no longer one shot — it\'s a policy.',
      reality: 'Claude Computer Use, OpenAI o1-pro agents, Devin, Cursor/Claude Code. The frontier: long-horizon autonomy, reliable tool composition, and standardized tool interfaces (<Term>MCP</Term>).',
    },
    {
      name: 'Flow matching & video', icon: Feather, color: 'pink',
      gist: 'A cleaner re-formulation of diffusion as learning a vector field. Common substrate for image/video/audio generation.',
      reality: 'Stable Diffusion 3, Flux, Sora, Veo. Video adds a temporal axis and enormous compute requirements; current state is ~20s coherent clips with high fidelity.',
    },
    {
      name: 'Tabular foundation models', icon: Rows3, color: 'amber',
      gist: 'Pretrained in-context-learning models for tabular data (TabPFN). One forward pass solves your tabular problem, no per-dataset training.',
      reality: 'Closing the gap with XGBoost on many benchmarks; still limited in scale and feature count, but the direction is clear: foundation models are eating tabular next.',
    },
  ];

  return (
    <Card id="c-frontier" icon={Flame} title="Frontier: what's moving right now" subtitle="Six directions shaping ML in 2026." accent="rose" index={19}>
      <MinSchema>Past the transformer, the research-to-product pipeline is fastest in: sparsity (MoE), linear-time sequence models (SSMs), reasoning/test-time compute, agents, flow-matching video, and foundation models for the domains deep learning hadn't conquered (tabular, graphs, biology).</MinSchema>
      <div className="grid md:grid-cols-2 gap-3">
        {topics.map((t) => {
          const I = t.icon;
          return (
            <div key={t.name} className={`rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2`}>
              <div className="flex items-center gap-2">
                <I className={`w-4 h-4 text-${t.color}-300`} />
                <div className="text-sm text-neutral-100 font-medium">{t.name}</div>
              </div>
              <div className="text-[13px] text-neutral-300">{t.gist}</div>
              <div className="text-[12px] text-neutral-500">{t.reality}</div>
            </div>
          );
        })}
      </div>
      <Deeper>
        <p><strong>Where compute is going.</strong> Five years ago, nearly all training compute was dense transformer pretraining. In 2026 it's split: pretraining (still the largest line item), post-training/RLHF (growing fast), reasoning RL (the new frontier), and inference for agentic workloads. Some frontier labs reportedly spend more compute on reasoning RL than on pretraining.</p>
        <p><strong>What <em>isn't</em> working (yet).</strong> Continual learning (models still catastrophically forget). Mechanistic interpretability at frontier scale (understanding what a 1T-param model is <em>actually</em> computing). Truly efficient fine-tuning for deep behavior change (LoRA/QLoRA are band-aids). Long-horizon autonomy without drift. These are where the next decade's PhDs are going.</p>
      </Deeper>
    </Card>
  );
};

// --- 20. next trails --------------------------------------------------------

const NextTrailsCard = () => {
  const groups = [
    {
      label: 'Sibling explainers', color: 'sky', icon: Link2, items: [
        { label: 'Reinforcement Learning', href: '#reinforcement-learning', note: 'depth on MDPs, value/policy methods, deep RL, RLHF' },
        { label: 'Data Centers', href: '#data-centers-v2', note: 'the physical machinery training modern ML runs on' },
        { label: 'Quantum Mechanics', href: '#quantum-mechanics', note: 'probability, linear algebra, and why the math feels familiar' },
        { label: 'Systems Thinking', href: '#systems-thinking', note: 'feedback loops & leverage — a frame that applies well to ML pipelines' },
      ],
    },
    {
      label: 'Deepen inside ML', color: 'violet', icon: BookOpen, items: [
        { label: 'Deep Learning · Bishop (2024)', note: 'modern textbook, ideal after this explainer' },
        { label: 'Elements of Statistical Learning · Hastie/Tibshirani/Friedman', note: 'the classic for everything classical + theory' },
        { label: 'The Little Book of Deep Learning · Fleuret', note: 'tight, diagram-heavy, free' },
        { label: 'Neel Nanda\'s mechanistic interpretability tutorials', note: 'what a transformer is actually doing internally' },
      ],
    },
    {
      label: 'Upstream foundations', color: 'emerald', icon: Sigma, items: [
        { label: 'Linear algebra', note: 'everything is matrix–vector; 3Blue1Brown series is the gold standard intro' },
        { label: 'Probability & statistics', note: 'MLE, Bayes, distributions — the worldview ML is phrased in' },
        { label: 'Convex & non-convex optimization', note: 'Boyd & Vandenberghe for convex; then the deep learning book chapter 8' },
        { label: 'Information theory', note: 'entropy, KL, mutual information — the currency of modern losses' },
      ],
    },
    {
      label: 'Zoom out', color: 'amber', icon: Telescope, items: [
        { label: 'Compute trends (Epoch AI)', note: 'training compute has doubled every ~6 months since 2010' },
        { label: 'AI safety / alignment', note: 'what happens when the policy is smarter than the reward model' },
        { label: 'Economic impact', note: 'diffusion of automation across sectors; Anthropic Economic Index' },
        { label: 'Regulation (EU AI Act, US exec orders)', note: 'frontier thresholds, evaluations, reporting' },
      ],
    },
  ];
  return (
    <Card id="c-trails" icon={Route} title="Next trails" subtitle="Where to go from here — pick a branch." accent="sky" index={20}>
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((g) => {
          const I = g.icon;
          return (
            <div key={g.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <I className={`w-4 h-4 text-${g.color}-300`} />
                <div className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono">{g.label}</div>
              </div>
              <ul className="space-y-2 text-[13px]">
                {g.items.map((it, k) => (
                  <li key={k} className="flex gap-2">
                    <ArrowRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 text-${g.color}-300`} />
                    <div>
                      {it.href ? <a href={it.href} className={`text-${g.color}-200 hover:underline`}>{it.label}</a> : <span className="text-neutral-100">{it.label}</span>}
                      {it.note && <span className="text-neutral-400"> — {it.note}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="text-[12px] text-neutral-500 text-center pt-2 border-t border-white/10">
        The whole field in one sentence: <em className="text-neutral-300">ML is the art of picking a hypothesis class, a loss, and an optimizer so that fitting the loss on the data produces the behavior you wanted.</em> Everything on this page — linear regression to frontier LLMs — is some choice of those three.
      </div>
    </Card>
  );
};

// --- Acts -------------------------------------------------------------------

const FoundationsAct = () => (
  <>
    <ActHeader id="act-1" n="1" title="Foundations"
      blurb="Every learning algorithm — from an 1805 least-squares fit to GPT-5 — is an answer to three questions: what's the data, what's the loss, how do you minimize it?" />
    <TaxonomyCard />
    <GradientDescentDemo />
    <BiasVarianceDemo />
  </>
);

const SupervisedAct = () => (
  <>
    <ActHeader id="act-2" n="2" title="Classical supervised"
      blurb="Linear models, trees, kernels — the algorithms that still run most of the world's quiet, unsexy ML pipelines. On tabular data many of them remain state-of-the-art." />
    <LinearRegressionDemo />
    <RegularizationDemo />
    <KNNDemo />
    <DecisionTreeDemo />
    <EnsembleDemo />
    <SVMDemo />
  </>
);

const UnsupervisedAct = () => (
  <>
    <ActHeader id="act-3" n="3" title="Classical unsupervised"
      blurb="No labels. Just structure — clusters, low-dimensional axes, density. Still the right tool for exploratory analysis." />
    <ClusteringDemo />
    <DimReductionDemo />
  </>
);

const DeepAct = () => (
  <>
    <ActHeader id="act-4" n="4" title="Deep learning"
      blurb="When stacked linear layers, nonlinearities, GPUs, and internet-scale data met. The era that started with AlexNet in 2012 and hasn't slowed." />
    <MLPDemo />
    <CNNDemo />
    <RNNDemo />
  </>
);

const ModernAct = () => (
  <>
    <ActHeader id="act-5" n="5" title="Modern & frontier"
      blurb="Transformers, scaling laws, diffusion, agents. One architecture, many modalities, trillions of parameters — and a rapidly shifting research frontier." />
    <AttentionDemo />
    <LLMRecipeDemo />
    <DiffusionDemo />
    <MultimodalDemo />
    <FrontierDemo />
  </>
);

const TrailsAct = () => (
  <>
    <ActHeader id="act-6" n="6" title="Next trails" blurb="Where to go after this." />
    <NextTrailsCard />
  </>
);

export default function MachineLearningExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-violet-500/30">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .katex { color: inherit; }
        .katex-display { margin: 0 !important; }
      `}</style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
      <Hero />
      <SectionNav />
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12">
        <FoundationsAct />
        <SupervisedAct />
        <UnsupervisedAct />
        <DeepAct />
        <ModernAct />
        <TrailsAct />
      </main>
      <footer className="border-t border-white/5 py-10 text-center text-xs text-neutral-500">
        an interactive overview of machine learning — from least squares to foundation models
      </footer>
    </div>
  );
}
