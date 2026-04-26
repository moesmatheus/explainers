import AICodeOnboardingExplainer from '../ai-code-onboarding/AICodeOnboardingExplainer.jsx';
import DataCentersExplainer from '../data-centers/DataCentersExplainer.jsx';
import DataCentersV2Explainer from '../data-centers-v2/DataCentersV2Explainer.jsx';
import DeepSeekV4Explainer from '../deepseek-v4/DeepSeekV4Explainer.jsx';
import LinearAlgebraExplainer from '../linear-algebra/LinearAlgebraExplainer.jsx';
import MachineLearningExplainer from '../machine-learning/MachineLearningExplainer.jsx';
import QuantumMechanicsExplainer from '../quantum-mechanics/QuantumMechanicsExplainer.jsx';
import ReinforcementLearningExplainer from '../reinforcement-learning/ReinforcementLearningExplainer.jsx';
import DeepUncertaintyExplainer from '../deep-uncertainty/DeepUncertaintyExplainer.jsx';
import StatisticalForecastingExplainer from '../statistical-forecasting/StatisticalForecastingExplainer.jsx';
import SuperforecastingExplainer from '../superforecasting/SuperforecastingExplainer.jsx';
import SystemsThinkingExplainer from '../systems-thinking/SystemsThinkingExplainer.jsx';
import TributacaoBrasilExplainer from '../tributacao-brasil/TributacaoBrasilExplainer.jsx';
import WorldEconomyExplainer from '../world-economy/WorldEconomyExplainer.jsx';

/**
 * Registry of explainers shown on the home page.
 * To add one: drop a new folder at the repo root with a single-file component,
 * import it here, and add an entry. No other wiring needed.
 */
export const explainers = [
  {
    slug: 'ai-code-onboarding',
    title: 'Reading Code You Didn\u2019t Write',
    blurb:
      'How to onboard to an AI-built codebase fast \u2014 what connects to what, load-bearing vs scaffolding, state ownership, trust boundaries, and a concrete pruning workflow.',
    tags: ['workflow', 'interactive', 'code'],
    component: AICodeOnboardingExplainer,
  },
  {
    slug: 'data-centers',
    title: 'Data Centers',
    blurb:
      'The physical machinery behind the cloud and AI — power, cooling, redundancy, networking, and the gigawatt build-out of 2025–26.',
    tags: ['infrastructure', 'interactive', 'systems'],
    component: DataCentersExplainer,
  },
  {
    slug: 'data-centers-v2',
    title: 'Data Centers · v2',
    blurb:
      'Same content, redesigned for mental-model throughput: predict-before-reveal, worked examples, Q&A self-checks, misconception boxes, and cross-card callbacks.',
    tags: ['infrastructure', 'interactive', 'pedagogy'],
    component: DataCentersV2Explainer,
  },
  {
    slug: 'deepseek-v4',
    title: 'DeepSeek-V4',
    blurb:
      'Million-token context for the price of a short one \u2014 compressed-sparse attention, manifold-constrained residuals, the Muon optimizer, and FP4 training, one innovation at a time.',
    tags: ['ML', 'interactive', 'equations'],
    component: DeepSeekV4Explainer,
  },
  {
    slug: 'linear-algebra',
    title: 'Linear Algebra',
    blurb:
      'The grammar behind data, ML, and physics — vector spaces, change of basis, eigen/SVD, and high-dimensional intuition, grounded in both geometry and data.',
    tags: ['math', 'interactive', 'equations'],
    component: LinearAlgebraExplainer,
  },
  {
    slug: 'machine-learning',
    title: 'Machine Learning',
    blurb:
      'From least-squares to trillion-parameter transformers — a full-spectrum tour of classical, deep, and frontier ML, visualized one card at a time.',
    tags: ['ML', 'interactive', 'equations'],
    component: MachineLearningExplainer,
  },
  {
    slug: 'quantum-mechanics',
    title: 'Quantum Mechanics',
    blurb:
      'Superposition, entanglement, tunneling, the double-slit experiment — the main concepts, visualized.',
    tags: ['physics', 'interactive', 'equations'],
    component: QuantumMechanicsExplainer,
  },
  {
    slug: 'reinforcement-learning',
    title: 'Reinforcement Learning',
    blurb:
      'Agent, environment, reward — a broad survey across foundations, algorithms, deep RL, and RLHF.',
    tags: ['ML', 'interactive', 'equations'],
    component: ReinforcementLearningExplainer,
  },
  {
    slug: 'deep-uncertainty',
    title: 'Deep Uncertainty',
    blurb:
      'Decision-making when probabilities don’t apply — Knightian uncertainty, fat tails, scenario planning, RDM, real options, adaptive pathways. Anchored on Miami sea-level adaptation through 2070.',
    tags: ['decision-making', 'interactive', 'strategy'],
    component: DeepUncertaintyExplainer,
  },
  {
    slug: 'statistical-forecasting',
    title: 'Forecasting Noisy Series',
    blurb:
      'Decomposition, ETS, ARIMA, Prophet, gradient boosting, conformal prediction — the statistical/ML toolkit for forecasting continuous quantities under uncertainty. Anchored on a real ERCOT week with 50/80/95% prediction intervals.',
    tags: ['forecasting', 'interactive', 'equations'],
    component: StatisticalForecastingExplainer,
  },
  {
    slug: 'superforecasting',
    title: 'Superforecasting',
    blurb:
      'How a small group of amateurs beat CIA analysts at predicting world events — calibration, base rates, Fermi-izing, Bayesian updating, premortems, and the techniques used to forecast under deep uncertainty. Anchored on a real 2028 robotaxi question.',
    tags: ['forecasting', 'interactive', 'equations'],
    component: SuperforecastingExplainer,
  },
  {
    slug: 'systems-thinking',
    title: 'Systems Thinking',
    blurb:
      'Stocks, flows, feedback loops, delays, archetypes, leverage points — how to see the wiring under the world.',
    tags: ['thinking', 'interactive', 'lists'],
    component: SystemsThinkingExplainer,
  },
  {
    slug: 'tributacao-brasil',
    title: 'Tributação Brasil · empresas',
    blurb:
      'O sistema tributário brasileiro para founders e CFOs \u2014 3 esferas × 3 bases × 3 regimes, ICMS/ISS/PIS-COFINS/IRPJ, a reforma 2026\u20132033, com foco no caso "data center: locação vs serviço".',
    tags: ['tax', 'interactive', 'pt-br'],
    component: TributacaoBrasilExplainer,
  },
  {
    slug: 'world-economy',
    title: 'The World Economy',
    blurb:
      'Circular flow, GDP, trade, sectoral balances, money, rates, the dollar system, and the 2025–26 regime — with real numbers.',
    tags: ['economics', 'interactive', 'data'],
    component: WorldEconomyExplainer,
  },
];
