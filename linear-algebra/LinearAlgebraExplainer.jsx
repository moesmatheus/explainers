import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Boxes, Grid3x3, Move, Compass, Ruler, Eye, EyeOff, Lightbulb, HelpCircle,
  ChevronDown, AlertTriangle, CheckCircle2, XCircle, Link2, FlaskConical,
  Activity, Sigma, Anchor, ArrowUpRight, Square, Circle, Layers,
  CircleDot, Maximize2, Telescope, Binary, Sparkles, GitBranch, Play, Pause,
  RotateCcw, SquareStack,
} from 'lucide-react';

/* ============================================================================
   Linear Algebra — grounded, multivariate-aware
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

// Hex colors in KaTeX macros MUST double the # (## → #). See quantum-mechanics gotcha.
const KATEX_MACROS = {
  '\\vect':  '\\textcolor{##c4b5fd}{#1}',   // violet — generic vectors
  '\\basis': '\\textcolor{##7dd3fc}{#1}',   // sky — basis / eigenvectors
  '\\mat':   '\\textcolor{##f0abfc}{#1}',   // fuchsia — matrices
  '\\scal':  '\\textcolor{##fbbf24}{#1}',   // amber — scalars / eigenvalues
  '\\zero':  '\\textcolor{##6ee7b7}{#1}',   // emerald — zero / targets
  '\\num':   '\\textcolor{##fbbf24}{#1}',
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
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, source, children }) => {
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
            {source && <span className="text-[10px] normal-case tracking-normal text-neutral-500">{source}</span>}
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-neutral-50">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      <div className="relative mt-5 text-neutral-200 text-[15px] leading-relaxed space-y-4">
        {children}
      </div>
    </motion.section>
  );
};

const Deeper = ({ children }) => (
  <div className="relative mt-6 pt-5 border-t border-white/10">
    <div className="absolute -top-[11px] left-0 flex items-center gap-2 bg-neutral-900/80 pr-2">
      <FlaskConical className="w-3.5 h-3.5 text-violet-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">deeper</span>
    </div>
    <div className="text-sm text-neutral-300 leading-relaxed space-y-3">{children}</div>
  </div>
);

const Stat = ({ label, value, sub, color = 'text-neutral-100' }) => (
  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
    <div className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
    <div className={`text-2xl font-mono mt-0.5 ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-neutral-500 mt-0.5">{sub}</div>}
  </div>
);

// --- Floating tooltip -------------------------------------------------------

const FloatingTip = ({ hover, render, width = 280 }) => {
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

// --- Glossary + Term (hover-to-define) -------------------------------------

const GLOSS = {
  'vector space': 'Any set where you can add elements and multiply them by scalars and stay in the set. Closed under linear combinations. Arrows, functions, matrices, images, polynomials all qualify.',
  'vector spaces': 'Sets closed under addition and scalar multiplication. The abstract home of every linear-algebra object.',
  'scalar': 'A plain number — element of the underlying field (typically ℝ or ℂ). What you multiply a vector by to scale it.',
  'scalars': 'Plain numbers (usually real) — the things you multiply vectors by.',
  'linear combination': 'A weighted sum α·u + β·v. The only operation a vector space guarantees.',
  'linear combinations': 'Weighted sums of the form α·u + β·v + … . The only operation every vector space supports.',
  'span': 'The set of all linear combinations of a list of vectors. Geometrically: the subspace (line, plane, …) they cover.',
  'linearly independent': 'A list of vectors where no one is a combination of the others. Equivalently: the only way to sum them to zero is with all-zero coefficients.',
  'linear independence': 'A property of a list of vectors — none is redundant (none is a combination of the others).',
  'basis': 'A minimal spanning set. Every vector in the space is a unique combination of basis vectors. The coordinate system.',
  'bases': 'Plural of basis — different coordinate systems for the same space.',
  'dimension': 'The number of vectors in any basis. Well-defined (all bases have the same size).',
  'coordinates': "A vector's recipe in a given basis: the scalars you'd multiply each basis vector by to reconstruct it.",
  'change of basis': 'Reinterpreting the same vector using different basis vectors. The vector itself is unchanged; only its coordinate-tuple updates.',
  'linear map': 'A function T between vector spaces satisfying T(α·u + β·v) = α·T(u) + β·T(v). Every linear map on finite-dimensional spaces is a matrix once you fix bases.',
  'linear maps': 'Functions that preserve addition and scaling. Between finite-dimensional spaces they ARE matrices (once you pick bases).',
  'linear transformation': 'Synonym for linear map. A function T(αu + βv) = αT(u) + βT(v).',
  'matrix': 'A rectangular grid of numbers. Under a fixed choice of basis, every linear map between finite-dimensional spaces is represented by one.',
  'matrices': 'Grids of numbers. Under fixed bases, they are exactly the same objects as linear maps.',
  'matrix-vector product': 'Mv = a linear combination of M\'s columns, weighted by v\'s entries. Equivalently: apply the linear map M to the vector v.',
  'identity matrix': 'The matrix I with 1s on the diagonal and 0s elsewhere. Iv = v for every v — the "do nothing" linear map.',
  'transpose': 'Flip a matrix across its diagonal: rows become columns. Written Mᵀ.',
  'matrix multiplication': 'Composition of linear maps. (AB)v = A(Bv). Not commutative in general: AB ≠ BA.',
  'inverse': 'M⁻¹ is the matrix that undoes M: M⁻¹Mv = v. Exists iff det(M) ≠ 0.',
  'kernel': 'Alias for null space — the set of vectors a linear map sends to zero.',
  'null space': 'The set of vectors M sends to zero: { v : Mv = 0 }. The "dimensions M kills." A subspace.',
  'column space': 'The set of all outputs Mv as v ranges over the input space. Equal to the span of M\'s columns. The "dimensions M can reach."',
  'range': 'Same thing as column space — the set of outputs a linear map can produce.',
  'image': 'Same thing as column space — the set of outputs a linear map can produce.',
  'rank': 'The dimension of the column space. The number of linearly independent columns. "How many dimensions M actually keeps."',
  'nullity': 'The dimension of the null space. "How many dimensions M kills."',
  'rank-nullity': 'Theorem: rank(M) + nullity(M) = dim(input space). Kept + killed = total.',
  'determinant': "A scalar attached to a square matrix. |det M| = how much M scales volumes. sign(det M) = +1 if orientation is preserved, −1 if flipped. det = 0 iff M collapses a dimension.",
  'trace': 'The sum of the diagonal entries of a square matrix. Equals the sum of its eigenvalues.',
  'orientation': 'A choice of "handedness" — whether a basis is right-handed or left-handed. Flipping one basis vector (reflection) reverses it.',
  'orientation-preserving': 'A map with det > 0. Keeps right-handed frames right-handed.',
  'signed volume': "The volume of a parallelepiped, with a ± sign tracking whether its edges form a right-handed frame (+) or were flipped (−).",
  'parallelogram': 'The 2D shape spanned by two vectors u and v — corners at 0, u, v, u+v. Its area is |det[u|v]|.',
  'parallelepiped': 'The 3D generalization of a parallelogram — the box spanned by three vectors.',
  'eigenvector': 'A nonzero vector v such that Mv = λv for some scalar λ. A direction M only stretches, never rotates.',
  'eigenvectors': 'Nonzero vectors satisfying Mv = λv — the directions M only stretches. The natural coordinate axes of the map.',
  'eigenvalue': 'The scalar λ such that Mv = λv for some nonzero v. How much M stretches its eigenvector direction. The eigenvalues are the roots of det(M − λI) = 0.',
  'eigenvalues': "Scalars λ satisfying Mv = λv. Roots of the characteristic polynomial det(M − λI) = 0.",
  'eigenpair': 'A matched (λ, v) — an eigenvalue with its eigenvector.',
  'characteristic polynomial': 'det(M − λI) as a polynomial in λ. Its roots are the eigenvalues of M.',
  'eigendecomposition': 'Writing a diagonalizable matrix as M = PDP⁻¹, where D is diagonal (eigenvalues) and P\'s columns are eigenvectors. Change of basis to the eigenbasis.',
  'diagonalization': 'The same thing as eigendecomposition — expressing M as PDP⁻¹.',
  'eigenbasis': 'A basis made of eigenvectors. In this basis the map is just coordinate-wise scaling (diagonal matrix).',
  'diagonal matrix': 'A matrix with all off-diagonal entries zero. Action is pure coordinate-wise scaling.',
  'orthogonal': 'Two vectors are orthogonal if their dot product is zero. Geometrically: at right angles.',
  'orthonormal': 'A set of vectors that are pairwise orthogonal AND each unit-length.',
  'orthogonal matrix': 'A square matrix Q with QᵀQ = I — equivalently, its columns are orthonormal. Geometrically: a rigid rotation or reflection. Preserves all lengths and angles.',
  'orthogonal matrices': 'Matrices with orthonormal columns (QᵀQ = I). Rotations and reflections.',
  'unitary': 'Complex analogue of orthogonal: U*U = I (conjugate transpose). Preserves the complex inner product.',
  'rotation matrix': 'An orthogonal matrix with det = +1. Pure rotation, no reflection.',
  'reflection': 'An orthogonal matrix with det = −1. Flips orientation through a subspace.',
  'dot product': 'u·v = Σ uᵢvᵢ = |u| |v| cos θ. Measures how much of u points along v.',
  'inner product': 'A bilinear, symmetric, positive-definite form ⟨u,v⟩ generalizing the dot product. The ingredient that lets a vector space have lengths and angles.',
  'norm': "A vector's length. ||v|| = √⟨v,v⟩.",
  'projection': 'Mapping a vector onto a subspace along the direction perpendicular to it. Drops you to the closest point in that subspace.',
  'orthogonal projection': 'The projection that uses orthogonality as its notion of "perpendicular" — gives the closest point in the target subspace.',
  'orthogonal complement': 'Given a subspace W, the set W⊥ of all vectors orthogonal to every vector in W. Decomposes the space: V = W ⊕ W⊥.',
  'singular value decomposition': 'Any matrix M factors as UΣVᵀ, with U, V orthogonal and Σ diagonal with nonnegative entries σ₁ ≥ σ₂ ≥ … ≥ 0. Reads: M is a rotation, then axis-aligned stretches, then another rotation.',
  'SVD': 'Singular Value Decomposition — the factorization M = UΣVᵀ. Universal: exists for every matrix.',
  'singular values': 'The σᵢ on the diagonal of Σ. Nonnegative; equal to the square roots of eigenvalues of MᵀM. Measure how much M stretches its principal axes.',
  'singular vectors': "The columns of U (left singular vectors) and V (right singular vectors) in M = UΣVᵀ. Orthonormal bases for output and input spaces.",
  'low-rank approximation': 'Keep only the top k terms in the SVD: M ≈ Σᵢ₌₁ᵏ σᵢ uᵢ vᵢᵀ. Best rank-k approximation in Frobenius / spectral norm (Eckart–Young).',
  'Eckart–Young': 'Theorem: truncating the SVD to the top k terms gives the best rank-k approximation (in both Frobenius and spectral norm).',
  'pseudoinverse': "Moore–Penrose pseudoinverse M⁺. If M = UΣVᵀ, then M⁺ = VΣ⁺Uᵀ where Σ⁺ inverts nonzero singular values and zeros the rest. Gives the least-squares solution to Mx = b.",
  'Frobenius norm': 'The "entrywise ℓ₂" norm of a matrix: ||M||_F = √Σᵢⱼ Mᵢⱼ². Equal to √(sum of singular values squared).',
  'spectral norm': 'The operator 2-norm of a matrix: ||M||₂ = σ₁ (largest singular value). How much M can stretch any unit vector.',
  'condition number': 'σ₁/σ_n — the ratio of largest to smallest singular value. High condition number ⇒ M is nearly singular and numerically fragile.',
  'symmetric': 'A square matrix with Mᵀ = M. Always has real eigenvalues and an orthonormal eigenbasis (spectral theorem).',
  'symmetric matrix': "A square matrix with Mᵀ = M. Real eigenvalues, orthonormal eigenbasis — the 'nicest' kind of matrix.",
  'symmetric matrices': 'Matrices with Mᵀ = M. Real eigenvalues, orthonormal eigenbasis (spectral theorem).',
  'spectral theorem': 'Every real symmetric matrix is orthogonally diagonalizable: M = QΛQᵀ with Q orthogonal and Λ real diagonal.',
  'quadratic form': 'A function of a vector: x ↦ xᵀAx, quadratic in x. With A symmetric, it carves space into ellipsoid-shaped level sets.',
  'positive definite': 'A symmetric matrix A with xᵀAx > 0 for every nonzero x. Equivalent: all eigenvalues are strictly positive. Defines a genuine inner product.',
  'positive semidefinite': 'A symmetric A with xᵀAx ≥ 0. Eigenvalues are ≥ 0. Covariance matrices are always PSD.',
  'level set': 'The set of inputs giving the same output: { x : f(x) = c }. For a quadratic form xᵀAx = c with A positive definite, it\'s an ellipsoid.',
  'level sets': 'Curves/surfaces of constant value. For a PD quadratic form they form nested ellipsoids centered at 0.',
  'ellipsoid': 'The n-D generalization of an ellipse — set { x : xᵀAx ≤ 1 } for symmetric positive-definite A. Axes = eigenvectors of A; axis half-lengths = 1/√λᵢ.',
  'covariance matrix': 'For a random vector X, Σᵢⱼ = Cov(Xᵢ, Xⱼ). Symmetric and positive semidefinite. Encodes spread + correlations.',
  'PCA': "Principal Component Analysis — find the orthonormal directions along which data varies the most. Operationally: eigendecomposition of the covariance matrix.",
  'principal components': 'The eigenvectors of the data covariance matrix, ordered by eigenvalue (variance) descending. The axes PCA reports.',
  'multivariate Gaussian': 'A normal distribution in multiple dimensions parametrized by a mean μ and covariance Σ. Its density\'s level sets are ellipsoids aligned with Σ\'s eigenvectors.',
  'least squares': 'Solving Ax ≈ b when no exact solution exists. Picks x to minimize ||Ax − b||². Geometrically: projects b onto the column space of A.',
  'normal equations': "ᵀ ᵀAx = Aᵀb — the linear system whose solution is the least-squares x. Derived by setting the gradient of ||Ax-b||² to zero.",
  'Jacobian': 'The matrix of partial derivatives ∂fᵢ/∂xⱼ. Locally, a smooth map looks like this linear map. Its determinant is the local volume-scaling factor.',
  'change of variables': 'Substituting u = f(x) in an integral. The volume element transforms by |det Jf| — the determinant of the Jacobian.',
  'concentration of measure': 'A family of phenomena where well-behaved functions of many independent variables are extremely concentrated around their mean. Heart of high-D geometry.',
  'curse of dimensionality': 'A grab-bag name for the ways high-D breaks low-D intuition: volume flees to the shell, random points become equidistant, nearest-neighbor degrades, sample complexity explodes.',
  'Johnson–Lindenstrauss': "Lemma: n points in high-D can be projected into O(log n / ε²) dimensions with all pairwise distances preserved up to factor (1 ± ε). Foundation of random projections.",
  'Gram matrix': 'For vectors v₁,…,vₖ, the matrix G with Gᵢⱼ = ⟨vᵢ, vⱼ⟩. Always symmetric positive semidefinite. Holds all pairwise inner products.',
  'field': 'An algebraic structure where you can add, subtract, multiply, and divide (by nonzero). ℝ and ℂ are fields; ℤ is not (no division).',
  'subspace': 'A subset of a vector space that is itself closed under addition and scalar multiplication. Must contain 0. In ℝ³: lines and planes through the origin.',
  'shear': 'A linear map that slides points parallel to a fixed direction proportional to their distance from it. Like tilting a deck of cards.',
};

const Term = ({ children, def }) => {
  const [hover, setHover] = useState(null);
  const key = typeof children === 'string' ? children : null;
  const definition = def ?? (key ? GLOSS[key] : null);
  if (!definition) return <>{children}</>;
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  return (
    <>
      <span
        onMouseEnter={track}
        onMouseMove={track}
        onMouseLeave={() => setHover(null)}
        className="underline decoration-dotted decoration-violet-300/60 underline-offset-[3px] cursor-help text-neutral-100/95"
      >
        {children}
      </span>
      <FloatingTip
        hover={hover}
        width={360}
        render={() => (
          <div className="space-y-1">
            {key && <div className="text-[10px] uppercase tracking-wider text-violet-300">{key}</div>}
            <div className="text-neutral-200 leading-snug">{definition}</div>
          </div>
        )}
      />
    </>
  );
};

// --- Pedagogy primitives ----------------------------------------------------

const MinSchema = ({ children }) => (
  <div className="mt-2 mb-4 rounded-md border border-sky-400/25 bg-sky-400/5 px-3 py-2 flex items-start gap-2">
    <Ruler className="w-3.5 h-3.5 mt-[2px] text-sky-300 shrink-0" />
    <div className="text-xs text-sky-100 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300 mr-2">carry this</span>
      {children}
    </div>
  </div>
);

const WhenItMatters = ({ children }) => (
  <div className="mt-3 rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2 flex items-start gap-2">
    <Compass className="w-3.5 h-3.5 mt-[2px] text-amber-300 shrink-0" />
    <div className="text-xs text-amber-100/90 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300 mr-2">when it matters</span>
      {children}
    </div>
  </div>
);

const Grounding = ({ children }) => (
  <span className="inline-flex items-baseline gap-1 rounded-sm border border-emerald-400/25 bg-emerald-400/5 px-1.5 py-0 text-[11px] text-emerald-200 align-baseline">
    <span className="text-[9px] uppercase tracking-wider text-emerald-400">≈</span>
    {children}
  </span>
);

const Misconception = ({ wrong, right, because }) => (
  <div className="mt-3 rounded-md border border-rose-400/25 bg-rose-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-1">
      <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-rose-300">misconception</span>
    </div>
    <div className="text-xs text-neutral-200 leading-snug space-y-1">
      <div className="flex items-start gap-1.5"><XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" /><div><strong className="text-rose-200">Common belief:</strong> {wrong}</div></div>
      <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" /><div><strong className="text-emerald-200">Actually:</strong> {right}</div></div>
      {because && <div className="pl-4 text-neutral-400"><em>Why:</em> {because}</div>}
    </div>
  </div>
);

const Predict = ({ question, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-md border border-violet-400/25 bg-violet-400/5 overflow-hidden">
      <div className="px-3 py-2 flex items-start gap-2">
        <Lightbulb className="w-3.5 h-3.5 mt-[2px] text-violet-300 shrink-0" />
        <div className="flex-1 text-xs leading-snug">
          <div className="text-[9px] uppercase tracking-[0.2em] text-violet-300 mb-1">predict first</div>
          <div className="text-neutral-200">{question}</div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="ml-2 text-[10px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2 py-1 flex items-center gap-1 shrink-0"
        >
          {open ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {open ? 'hide' : 'reveal'}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-violet-400/20 bg-violet-400/5"
          >
            <div className="px-3 py-2 text-xs text-neutral-100 leading-snug">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QA = ({ items }) => (
  <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
    <div className="px-3 py-2 flex items-center gap-2 border-b border-white/10 bg-white/[0.02]">
      <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">quick check</span>
      <span className="text-[10px] text-neutral-500">· click to reveal</span>
    </div>
    <div className="divide-y divide-white/5">
      {items.map((it, i) => <QARow key={i} q={it.q} a={it.a} />)}
    </div>
  </div>
);

const QARow = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-white/[0.03] flex items-start gap-2"
      >
        <ChevronDown className={`w-3.5 h-3.5 mt-[2px] text-neutral-500 shrink-0 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
        <span className="flex-1">{q}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-3 pb-3 pt-0 pl-[30px] text-xs text-neutral-300 leading-snug">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CrossLink = ({ to, children, recap }) => {
  const [hover, setHover] = useState(null);
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  const go = (e) => {
    e.preventDefault();
    const el = document.getElementById(to);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <>
      <a
        href={`#${to}`}
        onClick={go}
        onMouseEnter={track}
        onMouseMove={track}
        onMouseLeave={() => setHover(null)}
        className="inline-flex items-baseline gap-1 rounded-sm border border-fuchsia-400/25 bg-fuchsia-400/5 px-1.5 py-0 text-[11px] text-fuchsia-200 hover:bg-fuchsia-400/15 transition-colors no-underline align-baseline"
      >
        <Link2 className="w-2.5 h-2.5 self-center text-fuchsia-300" />
        {children}
      </a>
      {recap && (
        <FloatingTip
          hover={hover}
          width={320}
          render={() => (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-fuchsia-300">recap · {to}</div>
              <div className="text-neutral-200 leading-snug">{recap}</div>
            </div>
          )}
        />
      )}
    </>
  );
};

const Worked = ({ title = 'Worked example', children }) => (
  <div className="mt-3 rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300">{title}</span>
    </div>
    <div className="text-xs text-neutral-200 leading-snug space-y-2">{children}</div>
  </div>
);

const NextSteps = ({ groups }) => {
  const onClick = (e, href) => {
    if (!href || !href.startsWith('#')) return;
    const el = document.getElementById(href.slice(1).replace(/^\//, ''));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  return (
    <div className="space-y-5">
      {groups.map((g, i) => (
        <div key={i}>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-violet-300">{g.title}</span>
            {g.note && <span className="text-[11px] text-neutral-500">— {g.note}</span>}
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {g.items.map((it, j) => {
              const isLink = !!it.href;
              const isExternal = it.external || (isLink && !it.href.startsWith('#') && !it.href.startsWith('/#'));
              const Tag = isLink ? 'a' : 'div';
              const props = isLink
                ? {
                    href: it.href,
                    onClick: (e) => onClick(e, it.href),
                    target: isExternal ? '_blank' : undefined,
                    rel: isExternal ? 'noopener noreferrer' : undefined,
                  }
                : {};
              return (
                <Tag
                  key={j}
                  {...props}
                  className={`group rounded-md border px-3 py-2 flex items-start gap-2 transition-colors no-underline ${
                    isLink
                      ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-400/30 cursor-pointer'
                      : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  <div className="mt-[3px] shrink-0 text-violet-300">
                    {isLink ? <Link2 className="w-3 h-3" /> : <Compass className="w-3 h-3 text-neutral-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs ${isLink ? 'text-neutral-100 group-hover:text-violet-200' : 'text-neutral-300'}`}>{it.label}</span>
                      {isExternal && <span className="text-[9px] text-neutral-500 font-mono">↗</span>}
                      {!isLink && <span className="text-[9px] uppercase tracking-wider text-neutral-600">find elsewhere</span>}
                    </div>
                    {it.note && <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">{it.note}</div>}
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============================================================================
   LINEAR-ALGEBRA SPECIFIC — math helpers + shared-M context + MatrixSandbox
   ============================================================================ */

// --- math helpers -----------------------------------------------------------

const matVec2 = ([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y];
const matMat2 = (A, B) => {
  const [[a, b], [c, d]] = A;
  const [[e, f], [g, h]] = B;
  return [[a*e+b*g, a*f+b*h], [c*e+d*g, c*f+d*h]];
};
const det2 = ([[a, b], [c, d]]) => a * d - b * c;
const trace2 = ([[a, b], [c, d]]) => a + d;
const transpose2 = ([[a, b], [c, d]]) => [[a, c], [b, d]];
const inverse2 = (M) => {
  const d = det2(M); if (Math.abs(d) < 1e-12) return null;
  const [[a, b], [c, e]] = M;
  return [[e/d, -b/d], [-c/d, a/d]];
};
const rot2 = (t) => [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]];
const scale2 = (sx, sy) => [[sx, 0], [0, sy]];

// Real-eigen decomposition for a 2×2; returns { real, vals, vecs } if discriminant ≥ 0,
// otherwise { real: false, ... } with complex-rotation metadata.
const eigen2 = (M) => {
  const [[a, b], [c, d]] = M;
  const tr = a + d, dt = a*d - b*c;
  const disc = tr*tr - 4*dt;
  if (disc < -1e-10) {
    return { real: false, tr, det: dt, disc, theta: Math.atan2(Math.sqrt(-disc), tr) };
  }
  const s = Math.sqrt(Math.max(0, disc));
  const l1 = (tr + s) / 2;
  const l2 = (tr - s) / 2;
  const evec = (lam) => {
    // (M - λI) v = 0; try row (a-λ, b)
    if (Math.abs(b) > 1e-10 || Math.abs(a - lam) > 1e-10) {
      const vx = -b, vy = a - lam;
      const n = Math.hypot(vx, vy) || 1;
      return [vx / n, vy / n];
    }
    // else fall back to row (c, d-λ)
    const vx = d - lam, vy = -c;
    const n = Math.hypot(vx, vy) || 1;
    return [vx / n, vy / n];
  };
  return { real: true, vals: [l1, l2], vecs: [evec(l1), evec(l2)] };
};

// Closed-form SVD for 2×2 matrices. Returns U, S (σ₁, σ₂ with σ₁≥σ₂≥0), V.
// M = U · diag(S) · Vᵀ. Algorithm via M = U diag(S) Vᵀ closed-form.
const svd2 = (M) => {
  const [[a, b], [c, d]] = M;
  const E = (a + d) / 2;
  const F = (a - d) / 2;
  const G = (c + b) / 2;
  const H = (c - b) / 2;
  const Q = Math.hypot(E, H);
  const R = Math.hypot(F, G);
  let s1 = Q + R;
  let s2 = Math.abs(Q - R);
  const a1 = Math.atan2(G, F); // angle(right singular) pre-avg
  const a2 = Math.atan2(H, E); // angle(left singular) pre-avg
  const theta = (a2 - a1) / 2;  // V rotation
  const phi = (a2 + a1) / 2;    // U rotation
  const U = [[Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]];
  // V such that M = U S Vᵀ — V's rotation angle is θ.
  const V = [[Math.cos(theta), -Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]];
  // Handle sign: if det(M) < 0, flip sign of last column of U (so σ's stay nonnegative).
  if (det2(M) < 0) { U[0][1] = -U[0][1]; U[1][1] = -U[1][1]; s2 = -s2; s2 = Math.abs(s2); }
  return { U, S: [s1, s2], V };
};

// --- shared-M context --------------------------------------------------------

const DEFAULT_M = [[1.6, 0.8], [0.4, 1.2]]; // det=1.6, eigenvalues 2 and 0.8, clean.

const MatrixContext = createContext(null);

const MatrixProvider = ({ children }) => {
  const [M, setM] = useState(DEFAULT_M);
  const reset = () => setM(DEFAULT_M);
  return (
    <MatrixContext.Provider value={{ M, setM, reset }}>
      {children}
    </MatrixContext.Provider>
  );
};

const useMatrix = () => useContext(MatrixContext);

// --- MatrixSandbox ----------------------------------------------------------
// One interactive 2×2 that a dozen cards reuse — drag the two column vectors,
// and the overlay (determined by `mode`) highlights a different property.

const MatrixSandbox = ({
  mode = 'freeform',
  height = 360,
  showGrid = true,
  showInput = true,
  testVec = [1, 1],
  // Internal M state — when provided, sandbox reads from context instead of local:
  local = false,
  initialM = null,
}) => {
  const ctx = useMatrix();
  const [localM, setLocalM] = useState(initialM ?? DEFAULT_M);
  const M = local ? localM : ctx.M;
  const setM = local ? setLocalM : ctx.setM;
  const reset = local ? () => setLocalM(initialM ?? DEFAULT_M) : ctx.reset;

  const width = 480;
  const SCALE = 60; // px per unit
  const cx = width / 2, cy = height / 2;
  const worldToPx = ([x, y]) => [cx + x * SCALE, cy - y * SCALE];
  const pxToWorld = (px, py) => [(px - cx) / SCALE, (cy - py) / SCALE];

  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null); // 'c1' | 'c2' | null
  const [hover, setHover] = useState(null);

  const onMove = (e) => {
    if (!drag || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const [wx, wy] = pxToWorld(clientX - r.left, clientY - r.top);
    const clamp = (v) => Math.max(-3.5, Math.min(3.5, Math.round(v * 10) / 10));
    const [x, y] = [clamp(wx), clamp(wy)];
    if (drag === 'c1') setM([[x, M[0][1]], [y, M[1][1]]]);
    else if (drag === 'c2') setM([[M[0][0], x], [M[1][0], y]]);
  };

  useEffect(() => {
    const up = () => setDrag(null);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, []);

  // Column vectors
  const col1 = [M[0][0], M[1][0]];
  const col2 = [M[0][1], M[1][1]];
  const [p1x, p1y] = worldToPx(col1);
  const [p2x, p2y] = worldToPx(col2);
  const [p0x, p0y] = worldToPx([0, 0]);

  // Parallelogram corners: 0, col1, col1+col2, col2
  const sum = [col1[0] + col2[0], col1[1] + col2[1]];
  const [psx, psy] = worldToPx(sum);
  const determinant = det2(M);

  // Eigen data (for eigen mode)
  const eig = useMemo(() => eigen2(M), [M]);

  // SVD data
  const svd = useMemo(() => svd2(M), [M]);

  // Animation clock for eigen-sweep / SVD progression
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0); // 0..1 cycle
  const rafRef = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let start = performance.now();
    const tick = (t) => {
      const dt = (t - start) / 1000;
      const period = mode === 'eigen' ? 6 : 4;
      setPhase(((dt % period) / period));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, mode]);

  // Grid lines
  const GRID_EXTENT = 4;
  const gridLines = [];
  if (showGrid) {
    for (let i = -GRID_EXTENT; i <= GRID_EXTENT; i++) {
      const [x1, y1] = worldToPx([i, -GRID_EXTENT]);
      const [x2, y2] = worldToPx([i, GRID_EXTENT]);
      gridLines.push({ x1, y1, x2, y2, key: `v${i}`, axis: i === 0 });
      const [x3, y3] = worldToPx([-GRID_EXTENT, i]);
      const [x4, y4] = worldToPx([GRID_EXTENT, i]);
      gridLines.push({ x1: x3, y1: y3, x2: x4, y2: y4, key: `h${i}`, axis: i === 0 });
    }
  }

  // Test vector (for basis and freeform modes)
  const [tx, ty] = testVec;
  const Mtest = matVec2(M, [tx, ty]);
  const [testInX, testInY] = worldToPx([tx, ty]);
  const [testOutX, testOutY] = worldToPx(Mtest);

  // ======= EIGEN sweep =======
  const eigenSweep = useMemo(() => {
    if (mode !== 'eigen') return null;
    const angle = phase * 2 * Math.PI;
    const v = [Math.cos(angle), Math.sin(angle)];
    const Mv = matVec2(M, v);
    // Align indicator: parallel if cross product ≈ 0
    const cross = v[0] * Mv[1] - v[1] * Mv[0];
    const vMag = 1;
    const MvMag = Math.hypot(Mv[0], Mv[1]) || 1e-9;
    const aligned = Math.abs(cross) / (vMag * MvMag) < 0.03;
    return { v, Mv, aligned };
  }, [mode, phase, M]);

  // ======= SVD stages =======
  // phase 0..0.33: apply Vᵀ; 0.33..0.66: apply Σ; 0.66..1.0: apply U.
  const svdStage = useMemo(() => {
    if (mode !== 'svd') return null;
    const { U, S, V } = svd;
    const Vt = transpose2(V);
    const S_mat = [[S[0], 0], [0, S[1]]];
    let stage = 'V';
    let partial;
    if (phase < 1 / 3) {
      // 0..1 across this third: interpolate I → Vᵀ (using rotation)
      const t = phase * 3;
      const theta = Math.atan2(Vt[1][0], Vt[0][0]) * t;
      partial = rot2(theta); stage = 'V';
    } else if (phase < 2 / 3) {
      const t = (phase - 1 / 3) * 3;
      const theta = Math.atan2(Vt[1][0], Vt[0][0]);
      const R = rot2(theta);
      const s1 = 1 + (S[0] - 1) * t;
      const s2 = 1 + (S[1] - 1) * t;
      partial = matMat2(scale2(s1, s2), R); stage = 'Σ';
    } else {
      const t = (phase - 2 / 3) * 3;
      const theta = Math.atan2(Vt[1][0], Vt[0][0]);
      const R = rot2(theta);
      const after_s = matMat2(S_mat, R);
      const phi = Math.atan2(U[1][0], U[0][0]) * t;
      const Up = rot2(phi);
      partial = matMat2(Up, after_s); stage = 'U';
    }
    return { stage, partial, S, U, V };
  }, [mode, phase, svd]);

  // Circle/ellipse points for SVD mode
  const svdPts = useMemo(() => {
    if (mode !== 'svd' || !svdStage) return null;
    const N = 80;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * 2 * Math.PI;
      pts.push(matVec2(svdStage.partial, [Math.cos(a), Math.sin(a)]));
    }
    return pts.map(worldToPx);
  }, [mode, svdStage]);

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-3 relative">
      <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="uppercase tracking-wider text-neutral-500">mode</span>
          <span className="text-fuchsia-300 uppercase">{mode}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">
            M = [[<span className="text-fuchsia-300">{M[0][0].toFixed(1)}</span>, <span className="text-fuchsia-300">{M[0][1].toFixed(1)}</span>], [<span className="text-fuchsia-300">{M[1][0].toFixed(1)}</span>, <span className="text-fuchsia-300">{M[1][1].toFixed(1)}</span>]]
          </span>
          <button onClick={reset} className="rounded border border-white/10 bg-white/5 hover:bg-white/10 px-1.5 py-0.5 text-neutral-300 text-[10px] flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" />reset</button>
          {(mode === 'eigen' || mode === 'svd') && (
            <button onClick={() => setPlaying(p => !p)} className="rounded border border-white/10 bg-white/5 hover:bg-white/10 px-1.5 py-0.5 text-neutral-300 text-[10px] flex items-center gap-1">
              {playing ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              {playing ? 'pause' : 'play'}
            </button>
          )}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full select-none"
        onMouseMove={onMove}
        onTouchMove={onMove}
        style={{ touchAction: 'none', cursor: drag ? 'grabbing' : 'default' }}
      >
        {/* grid */}
        {showGrid && gridLines.map(g => (
          <line key={g.key} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
            stroke={g.axis ? '#475569' : '#27272a'} strokeWidth={g.axis ? 1 : 0.5} />
        ))}

        {/* Determinant mode: fill parallelogram with colored area */}
        {mode === 'determinant' && (
          <>
            <polygon
              points={`${p0x},${p0y} ${p1x},${p1y} ${psx},${psy} ${p2x},${p2y}`}
              fill={determinant >= 0 ? '#c4b5fd33' : '#fb718533'}
              stroke={determinant >= 0 ? '#c4b5fd' : '#fb7185'}
              strokeWidth={1.5}
            />
            {/* Unit square, for reference */}
            {(() => {
              const [ux1, uy1] = worldToPx([0, 0]);
              const [ux2, uy2] = worldToPx([1, 0]);
              const [ux3, uy3] = worldToPx([1, 1]);
              const [ux4, uy4] = worldToPx([0, 1]);
              return (
                <polygon
                  points={`${ux1},${uy1} ${ux2},${uy2} ${ux3},${uy3} ${ux4},${uy4}`}
                  fill="none" stroke="#38bdf8" strokeWidth={1} strokeDasharray="4 3" opacity={0.7}
                />
              );
            })()}
          </>
        )}

        {/* SVD mode: circle/ellipse at current stage */}
        {mode === 'svd' && svdPts && (
          <>
            {/* unit circle ghost */}
            <circle cx={p0x} cy={p0y} r={SCALE} fill="none" stroke="#38bdf833" strokeWidth={1} strokeDasharray="3 3" />
            {/* current ellipse */}
            <polyline
              points={svdPts.map(p => p.join(',')).join(' ')}
              fill="#c4b5fd22" stroke="#c4b5fd" strokeWidth={1.5}
            />
            {/* Singular vector axes — final positions */}
            {(() => {
              const [sU, _S, sV] = [svd.U, svd.S, svd.V];
              const v1 = sV.map(r => r[0]);
              const v2 = sV.map(r => r[1]);
              const u1 = sU.map(r => r[0]);
              const u2 = sU.map(r => r[1]);
              const draw = (vec, color, label, len = 1.5, dash = '') => {
                const [xe, ye] = worldToPx([vec[0] * len, vec[1] * len]);
                return (
                  <line x1={p0x} y1={p0y} x2={xe} y2={ye}
                    stroke={color} strokeWidth={1.2} strokeDasharray={dash} opacity={0.6} />
                );
              };
              return (
                <>
                  {draw(v1, '#7dd3fc', 'v1', 1.2, '4 3')}
                  {draw(v2, '#7dd3fc', 'v2', 1.2, '4 3')}
                  {draw(u1, '#fbbf24', 'u1', svd.S[0], '')}
                  {draw(u2, '#fbbf24', 'u2', svd.S[1], '')}
                </>
              );
            })()}
          </>
        )}

        {/* Basis mode: tag the transformed basis vectors */}
        {/* Eigen mode: sweep unit-circle vector and its image */}
        {mode === 'eigen' && eigenSweep && (() => {
          const [vpx, vpy] = worldToPx(eigenSweep.v);
          const [mvpx, mvpy] = worldToPx(eigenSweep.Mv);
          return (
            <>
              {/* unit circle */}
              <circle cx={p0x} cy={p0y} r={SCALE} fill="none" stroke="#38bdf833" strokeWidth={1} strokeDasharray="3 3" />
              {/* eigenvector directions */}
              {eig.real && eig.vecs.map((v, i) => {
                const len = 3;
                const [xe1, ye1] = worldToPx([v[0] * len, v[1] * len]);
                const [xe2, ye2] = worldToPx([-v[0] * len, -v[1] * len]);
                return (
                  <line key={i} x1={xe1} y1={ye1} x2={xe2} y2={ye2}
                    stroke="#fbbf24" strokeWidth={1} strokeDasharray="6 3" opacity={0.7} />
                );
              })}
              {/* current v and Mv */}
              <line x1={p0x} y1={p0y} x2={vpx} y2={vpy} stroke="#7dd3fc" strokeWidth={2} />
              <circle cx={vpx} cy={vpy} r={4} fill="#7dd3fc" />
              <line x1={p0x} y1={p0y} x2={mvpx} y2={mvpy}
                stroke={eigenSweep.aligned ? '#fbbf24' : '#c4b5fd'} strokeWidth={2} />
              <polygon
                points={(() => {
                  const dx = mvpx - p0x, dy = mvpy - p0y;
                  const len = Math.hypot(dx, dy) || 1;
                  const ux = dx / len, uy = dy / len;
                  const size = 7;
                  const x1 = mvpx - ux * size - uy * (size * 0.6);
                  const y1 = mvpy - uy * size + ux * (size * 0.6);
                  const x2 = mvpx - ux * size + uy * (size * 0.6);
                  const y2 = mvpy - uy * size - ux * (size * 0.6);
                  return `${mvpx},${mvpy} ${x1},${y1} ${x2},${y2}`;
                })()}
                fill={eigenSweep.aligned ? '#fbbf24' : '#c4b5fd'}
              />
            </>
          );
        })()}

        {/* Freeform / basis: draw column vectors */}
        {(mode !== 'svd') && (
          <>
            {/* origin dot */}
            <circle cx={p0x} cy={p0y} r={3} fill="#94a3b8" />
            {/* col1 — fuchsia (matrix column) */}
            <line x1={p0x} y1={p0y} x2={p1x} y2={p1y}
              stroke="#f0abfc" strokeWidth={2.2} />
            <circle cx={p1x} cy={p1y} r={7}
              onMouseDown={() => setDrag('c1')}
              onTouchStart={() => setDrag('c1')}
              fill="#f0abfc" style={{ cursor: 'grab' }} />
            {/* col2 — fuchsia lighter */}
            <line x1={p0x} y1={p0y} x2={p2x} y2={p2y}
              stroke="#d8b4fe" strokeWidth={2.2} />
            <circle cx={p2x} cy={p2y} r={7}
              onMouseDown={() => setDrag('c2')}
              onTouchStart={() => setDrag('c2')}
              fill="#d8b4fe" style={{ cursor: 'grab' }} />

            {/* test input + image (for basis/freeform) */}
            {showInput && mode !== 'determinant' && mode !== 'eigen' && (
              <>
                <line x1={p0x} y1={p0y} x2={testInX} y2={testInY}
                  stroke="#7dd3fc" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6} />
                <circle cx={testInX} cy={testInY} r={4} fill="#7dd3fc" />
                <line x1={p0x} y1={p0y} x2={testOutX} y2={testOutY}
                  stroke="#7dd3fc" strokeWidth={2.4} />
                <circle cx={testOutX} cy={testOutY} r={5} fill="#7dd3fc" />
              </>
            )}

            {/* labels */}
            <text x={p1x + 8} y={p1y - 4} fontSize={11} fill="#f0abfc" fontFamily="monospace">
              col₁ ({M[0][0].toFixed(1)}, {M[1][0].toFixed(1)})
            </text>
            <text x={p2x + 8} y={p2y - 4} fontSize={11} fill="#d8b4fe" fontFamily="monospace">
              col₂ ({M[0][1].toFixed(1)}, {M[1][1].toFixed(1)})
            </text>
            {showInput && mode !== 'determinant' && mode !== 'eigen' && (
              <text x={testOutX + 8} y={testOutY + 4} fontSize={10} fill="#7dd3fc" fontFamily="monospace">
                Mv = ({Mtest[0].toFixed(2)}, {Mtest[1].toFixed(2)})
              </text>
            )}
          </>
        )}
      </svg>

      {/* Legend / readout strip below */}
      <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] font-mono text-neutral-400">
        {mode === 'determinant' && (
          <>
            <span>det M = <span className={determinant >= 0 ? 'text-violet-300' : 'text-rose-300'}>{determinant.toFixed(3)}</span></span>
            <span className="text-neutral-500">|area|= {Math.abs(determinant).toFixed(3)} · unit square (dashed)</span>
            <span className="text-neutral-500">sign = {determinant >= 0 ? '+ (orientation preserved)' : '− (flipped)'}</span>
          </>
        )}
        {mode === 'eigen' && (
          <>
            {eig.real ? (
              <>
                <span>λ₁ = <span className="text-amber-300">{eig.vals[0].toFixed(3)}</span></span>
                <span>λ₂ = <span className="text-amber-300">{eig.vals[1].toFixed(3)}</span></span>
                <span className="text-neutral-500">(dashed gold = eigendirections)</span>
              </>
            ) : (
              <span className="text-rose-300">no real eigenvectors · M rotates by {(eig.theta * 180 / Math.PI).toFixed(1)}°</span>
            )}
          </>
        )}
        {mode === 'svd' && (
          <>
            <span>σ₁ = <span className="text-amber-300">{svd.S[0].toFixed(3)}</span></span>
            <span>σ₂ = <span className="text-amber-300">{svd.S[1].toFixed(3)}</span></span>
            <span>κ = σ₁/σ₂ = <span className="text-sky-300">{(svd.S[0] / Math.max(svd.S[1], 1e-9)).toFixed(2)}</span></span>
            <span className="text-neutral-500">stage: <span className="text-fuchsia-300">{svdStage?.stage}</span></span>
          </>
        )}
        {(mode === 'basis' || mode === 'freeform') && (
          <>
            <span className="text-neutral-500">drag the two fuchsia dots to change M · sky = test vector & its image</span>
          </>
        )}
      </div>

      <FloatingTip hover={hover} render={() => null} />
    </div>
  );
};

/* ============================================================================
   HERO + SECTION NAV
   ============================================================================ */

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-violet-500/5 to-transparent" />
    <HeroField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-200/80 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-400/20">
          <Grid3x3 className="w-3.5 h-3.5" /> grounding the abstract · reasoning past 3D
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-fuchsia-200 bg-clip-text text-transparent">
          Linear Algebra
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          What a <span className="text-fuchsia-300 font-mono">matrix</span> is actually <em>doing</em>, why the abstractions (<span className="text-sky-300 font-mono">basis</span>, <span className="text-amber-300 font-mono">eigen</span>, <span className="text-violet-300 font-mono">SVD</span>) exist, and how to think in <span className="text-emerald-300 font-mono">100 dimensions</span> when your visual cortex has only three.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">spaces</span>
          <span className="text-fuchsia-300">matrices</span>
          <span className="text-amber-300">eigen</span>
          <span className="text-violet-300">svd</span>
          <span className="text-emerald-300">high-d</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

// Subtle animated grid for the hero
const HeroField = () => {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf;
    let s = performance.now();
    const tick = (now) => {
      setT((now - s) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const theta = 0.35 * Math.sin(t * 0.3);
  const shear = 0.3 * Math.sin(t * 0.25);
  const M = [[Math.cos(theta) * 1.1, shear], [Math.sin(theta) * 0.4, Math.cos(theta) * 1.1]];
  const W = 1200, H = 420;
  const cx = W / 2, cy = H / 2;
  const S = 40;
  const lines = [];
  for (let i = -8; i <= 8; i++) {
    const pts = [];
    for (let j = -20; j <= 20; j++) {
      const [x, y] = [j * 0.5, i * 0.5];
      const [mx, my] = matVec2(M, [x, y]);
      pts.push([cx + mx * S, cy + my * S]);
    }
    lines.push({ k: `h${i}`, pts });
  }
  for (let j = -20; j <= 20; j++) {
    const pts = [];
    for (let i = -8; i <= 8; i++) {
      const [x, y] = [j * 0.5, i * 0.5];
      const [mx, my] = matVec2(M, [x, y]);
      pts.push([cx + mx * S, cy + my * S]);
    }
    lines.push({ k: `v${j}`, pts });
  }
  return (
    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox={`0 0 ${W} ${H}`}>
      {lines.map(l => (
        <polyline key={l.k} fill="none" stroke="#a78bfa" strokeWidth={0.6} opacity={0.35}
          points={l.pts.map(p => p.join(',')).join(' ')} />
      ))}
    </svg>
  );
};

const SECTIONS = [
  { id: 'spaces',     label: 'Vector spaces',       icon: Boxes },
  { id: 'basis',      label: 'Basis & change',      icon: Grid3x3 },
  { id: 'maps',       label: 'Linear maps = matrices', icon: Move },
  { id: 'rank',       label: 'Rank · null · column',   icon: Layers },
  { id: 'det',        label: 'Determinant',         icon: Square },
  { id: 'eigen',      label: 'Eigen',               icon: Sparkles },
  { id: 'svd',        label: 'SVD',                 icon: Sigma },
  { id: 'quad',       label: 'Quadratic forms · PCA', icon: CircleDot },
  { id: 'highd',      label: 'High-dimensional',    icon: Telescope },
  { id: 'trails',     label: 'Next trails',         icon: Compass },
];

const SectionNav = () => {
  const [active, setActive] = useState(SECTIONS[0].id);
  useEffect(() => {
    const onScroll = () => {
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - 120 <= 0) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <nav className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20">
        <ul className="space-y-1 text-xs">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">0{i + 1}</span>
                  <span className="tracking-wide">{s.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <nav className="xl:hidden sticky top-0 z-20 backdrop-blur-md bg-neutral-950/70 border-b border-white/10 overflow-x-auto">
        <ul className="flex gap-1 px-3 py-2 text-[11px] whitespace-nowrap">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">0{i + 1}</span>{s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

/* ============================================================================
   01 — VECTOR SPACES
   ============================================================================ */

// Small inline "is-it-a-vector-space?" visuals.
const ArrowSpace = () => {
  const W = 180, H = 140;
  const cx = W / 2, cy = H / 2, S = 22;
  const u = [1.6, 0.6], v = [-0.8, 1.4];
  const sum = [u[0] + v[0], u[1] + v[1]];
  const arrow = (to, color, label) => {
    const [x2, y2] = [cx + to[0] * S, cy - to[1] * S];
    return (
      <>
        <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={color} strokeWidth={1.6} />
        <polygon points={(() => {
          const dx = x2 - cx, dy = y2 - cy, L = Math.hypot(dx, dy);
          const ux = dx / L, uy = dy / L, s = 5;
          return `${x2},${y2} ${x2 - ux*s - uy*s*0.5},${y2 - uy*s + ux*s*0.5} ${x2 - ux*s + uy*s*0.5},${y2 - uy*s - ux*s*0.5}`;
        })()} fill={color} />
        <text x={x2 + 5} y={y2} fontSize={9} fill={color} fontFamily="monospace">{label}</text>
      </>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* axes */}
      <line x1={0} y1={cy} x2={W} y2={cy} stroke="#27272a" />
      <line x1={cx} y1={0} x2={cx} y2={H} stroke="#27272a" />
      {arrow(u, '#7dd3fc', 'u')}
      {arrow(v, '#f0abfc', 'v')}
      {arrow(sum, '#fbbf24', 'u+v')}
      {/* dashed parallel */}
      <line x1={cx + u[0] * S} y1={cy - u[1] * S} x2={cx + sum[0] * S} y2={cy - sum[1] * S}
        stroke="#f0abfc" strokeDasharray="3 2" strokeWidth={1} opacity={0.5} />
      <line x1={cx + v[0] * S} y1={cy - v[1] * S} x2={cx + sum[0] * S} y2={cy - sum[1] * S}
        stroke="#7dd3fc" strokeDasharray="3 2" strokeWidth={1} opacity={0.5} />
    </svg>
  );
};

const FunctionSpace = () => {
  const W = 180, H = 140;
  const pts = (fn) => {
    const arr = [];
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 6 - 3;
      const y = fn(x);
      arr.push([20 + (i / 60) * (W - 40), H / 2 - y * 18]);
    }
    return arr.map(p => p.join(',')).join(' ');
  };
  const f = (x) => Math.sin(x) * 1.2;
  const g = (x) => 0.3 * x;
  const sum = (x) => f(x) + g(x);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={20} y1={H/2} x2={W-20} y2={H/2} stroke="#27272a" />
      <polyline fill="none" stroke="#7dd3fc" strokeWidth={1.4} points={pts(f)} />
      <polyline fill="none" stroke="#f0abfc" strokeWidth={1.4} points={pts(g)} />
      <polyline fill="none" stroke="#fbbf24" strokeWidth={1.8} points={pts(sum)} />
      <text x={24} y={16} fontSize={9} fill="#7dd3fc" fontFamily="monospace">f(x) = sin x</text>
      <text x={24} y={28} fontSize={9} fill="#f0abfc" fontFamily="monospace">g(x) = 0.3x</text>
      <text x={24} y={40} fontSize={9} fill="#fbbf24" fontFamily="monospace">(f+g)(x)</text>
    </svg>
  );
};

const UnitVectorsBroken = () => {
  const W = 180, H = 140;
  const cx = W / 2, cy = H / 2, S = 28;
  // two unit vectors + their sum (length 2, NOT in set)
  const u = [1, 0], v = [0.6, 0.8];
  const sum = [u[0] + v[0], u[1] + v[1]];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={0} y1={cy} x2={W} y2={cy} stroke="#27272a" />
      <line x1={cx} y1={0} x2={cx} y2={H} stroke="#27272a" />
      <circle cx={cx} cy={cy} r={S} fill="none" stroke="#38bdf8" strokeDasharray="3 2" opacity={0.6} />
      <line x1={cx} y1={cy} x2={cx + u[0] * S} y2={cy - u[1] * S} stroke="#7dd3fc" strokeWidth={1.6} />
      <line x1={cx} y1={cy} x2={cx + v[0] * S} y2={cy - v[1] * S} stroke="#f0abfc" strokeWidth={1.6} />
      <line x1={cx} y1={cy} x2={cx + sum[0] * S} y2={cy - sum[1] * S} stroke="#fb7185" strokeWidth={2} strokeDasharray="4 3" />
      <text x={W - 4} y={cy - sum[1] * S - 4} textAnchor="end" fontSize={9} fill="#fb7185" fontFamily="monospace">|u+v|= {Math.hypot(sum[0], sum[1]).toFixed(2)}</text>
      <text x={10} y={H - 8} fontSize={9} fill="#fb7185">not in set</text>
    </svg>
  );
};

const VectorSpaces = () => {
  return (
    <Card id="spaces" icon={Boxes} title="Vector spaces · the abstraction that runs everything" accent="sky" index={1}>
      <MinSchema>
        A <Term>vector space</Term> is any collection where you can add elements and scale them by numbers and stay inside. That's it. The rest of the subject rides on that one closure property.
      </MinSchema>

      <p>
        You already "know" vectors as arrows in the plane — but that picture is an <em>example</em>, not the definition. A vector space is defined by what operations are allowed: <Term>linear combinations</Term> α·u + β·v. Anything that supports them sensibly gets the full toolkit (<Term>basis</Term>, <Term>dimension</Term>, <Term>linear maps</Term>, <Term>eigenvalues</Term>, <Term>SVD</Term>) for free.
      </p>

      {/* Three realizations side-by-side */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-sky-300">ℝ² · arrows</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <ArrowSpace />
          <div className="mt-1 text-[11px] text-neutral-400 leading-snug">Two arrows sum to a third via the parallelogram rule. Stays in ℝ² no matter how we add or scale. <strong className="text-sky-200">Vector space.</strong></div>
        </div>
        <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-sky-300">functions ℝ→ℝ</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <FunctionSpace />
          <div className="mt-1 text-[11px] text-neutral-400 leading-snug">Add two functions pointwise, scale by a number, still a function. <strong className="text-sky-200">Vector space</strong> — infinite-dimensional, the home of Fourier series and quantum mechanics.</div>
        </div>
        <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-rose-300">unit vectors</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <UnitVectorsBroken />
          <div className="mt-1 text-[11px] text-neutral-400 leading-snug">Unit-length vectors aren't closed under addition (their sum generally isn't unit-length). <strong className="text-rose-200">Not a vector space.</strong></div>
        </div>
      </div>

      <Misconception
        wrong='"Vectors are arrows."'
        right='Vectors are elements of ANY set that is closed under addition and scalar multiplication. Arrows, functions, images, polynomials, audio signals, neural-net weights, quantum states — all vectors.'
        because='Defining by the axioms (rather than the picture) means every theorem you prove for arrows transfers, for free, to every other setting. This is the whole reason abstraction is useful — you learn one toolkit and get to apply it in a hundred places.'
      />

      <WhenItMatters>
        The abstraction is the reason your LA intuition from 2D arrows transfers directly to "what does this attention head do to the embedding?" or "what's the space of 3-pixel perturbations that fool this classifier?" Both are linear algebra on vector spaces, just with different realizations.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why linearity is THE assumption.</strong> Most interesting things in the world are nonlinear (turbulent flow, neural-net activations, markets). So why do we spend so much time on linear maps? Because <em>nonlinear things are locally linear</em>: zoom in enough on a smooth function and it looks like its <Term>Jacobian</Term>. Linear algebra is the infinitesimal-scale model for nearly every smooth system in science. Calculus is "nonlinear things, studied by sticking a linear approximation at every point and integrating." Every other advanced subject (optimization, differential geometry, quantum mechanics, deep-learning training dynamics) runs on this pattern.
        </p>
        <p>
          <strong>Trade-off: abstraction vs concreteness.</strong> Axiomatic LA buys transfer (same theorem, a hundred settings) but costs intuition — you lose "the picture" the first time you meet a <Term>subspace</Term> of functions. The working compromise most mathematicians use: reason on arrows (ℝⁿ) for intuition, state results axiomatically, and be willing to port back to ℝⁿ whenever a problem is specifically finite-dimensional. That's the mental routine this explainer will keep exercising.
        </p>
        <p>
          <strong>The axioms, compressed.</strong> Formally a vector space over a <Term>field</Term> F requires (+) to be associative/commutative with a zero and inverses, and (·) to distribute over (+) and respect 1 and multiplication. Eight rules that together enforce "closure under linear combinations." Nothing else. The moment you see "closed under linear combinations" in the wild, you are in a vector space.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is the set { (x, y) ∈ ℝ² : x + y = 1 } a subspace of ℝ²?', a: 'No — it does not contain the zero vector (0+0 ≠ 1), and it is not closed under addition ((1,0) + (0,1) = (1,1) which has x+y = 2, outside the set). A line through the origin IS a subspace; a line that misses the origin is not.' },
        { q: 'Polynomials of degree ≤ 3 in x — vector space? What is its dimension?', a: 'Yes. Adding two degree-≤3 polynomials yields a degree-≤3 polynomial; scaling preserves the degree bound; 0 is in the set. Dimension = 4, with basis {1, x, x², x³}.' },
        { q: 'If u, v, w are linearly dependent, is the span { αu + βv + γw } necessarily 2-dimensional?', a: 'No — it is AT MOST 2-dimensional. If two of the three are already collinear (and the third is in their span), the span could be 1-dimensional. "Linearly dependent" only says at least one is redundant.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   02 — BASIS & CHANGE OF BASIS
   ============================================================================ */

const BasisChange = () => {
  const [theta, setTheta] = useState(Math.PI / 6); // basis rotation
  const pt = [2.2, 0.9]; // a test vector in standard coords
  // New basis is standard basis rotated by θ (columns = Rθ e₁, Rθ e₂).
  // Coordinates of pt in new basis = Rθᵀ · pt.
  const ptNew = matVec2(rot2(-theta), pt);

  const W = 420, H = 280, cx = W / 2, cy = H / 2, S = 48;
  const p = ([x, y]) => [cx + x * S, cy - y * S];

  // Draw grid lines for both bases
  const drawGrid = (color, thetaLocal, dashed = false) => {
    const lines = [];
    for (let i = -4; i <= 4; i++) {
      for (const axis of [0, 1]) {
        // line at constant coord i along the OTHER axis
        const L = 5;
        const [sx, sy] = matVec2(rot2(thetaLocal), axis === 0 ? [i, -L] : [-L, i]);
        const [ex, ey] = matVec2(rot2(thetaLocal), axis === 0 ? [i, L] : [L, i]);
        const [x1, y1] = p([sx, sy]);
        const [x2, y2] = p([ex, ey]);
        lines.push(
          <line key={`${color}-${axis}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth={i === 0 ? 1 : 0.5}
            strokeDasharray={dashed ? '4 3' : ''} opacity={i === 0 ? 0.8 : 0.35} />
        );
      }
    }
    return lines;
  };

  const [ppx, ppy] = p(pt);

  return (
    <Card id="basis" icon={Grid3x3} title="Basis & change of basis · the vector doesn't change, only the ruler does" accent="violet" index={2}>
      <MinSchema>
        A <Term>basis</Term> is a minimal set of vectors that together span the space — a <em>coordinate system</em>. The same vector has different <Term>coordinates</Term> in different bases, but it's the same vector.
      </MinSchema>

      <p>
        Say "the vector (3, 1)" and you've said more than you mean: you've said <em>in the standard basis</em>. The arrow itself doesn't carry coordinates — it carries a recipe, and that recipe depends on what the basis vectors are pointing at. Rotate the coordinate axes and the arrow's two numbers update, but the arrow stays put.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* standard basis — sky */}
          {drawGrid('#38bdf8', 0, false)}
          {/* rotated basis — violet dashed */}
          {drawGrid('#c4b5fd', theta, true)}

          {/* standard basis arrows */}
          {(() => {
            const [e1x, e1y] = p([1, 0]);
            const [e2x, e2y] = p([0, 1]);
            return (
              <>
                <line x1={cx} y1={cy} x2={e1x} y2={e1y} stroke="#7dd3fc" strokeWidth={2} />
                <line x1={cx} y1={cy} x2={e2x} y2={e2y} stroke="#7dd3fc" strokeWidth={2} />
                <text x={e1x + 6} y={e1y - 4} fontSize={10} fill="#7dd3fc" fontFamily="monospace">e₁</text>
                <text x={e2x + 6} y={e2y - 4} fontSize={10} fill="#7dd3fc" fontFamily="monospace">e₂</text>
              </>
            );
          })()}
          {/* rotated basis arrows */}
          {(() => {
            const b1 = matVec2(rot2(theta), [1, 0]);
            const b2 = matVec2(rot2(theta), [0, 1]);
            const [b1x, b1y] = p(b1);
            const [b2x, b2y] = p(b2);
            return (
              <>
                <line x1={cx} y1={cy} x2={b1x} y2={b1y} stroke="#c4b5fd" strokeWidth={2} />
                <line x1={cx} y1={cy} x2={b2x} y2={b2y} stroke="#c4b5fd" strokeWidth={2} />
                <text x={b1x + 6} y={b1y - 4} fontSize={10} fill="#c4b5fd" fontFamily="monospace">b₁</text>
                <text x={b2x + 6} y={b2y - 4} fontSize={10} fill="#c4b5fd" fontFamily="monospace">b₂</text>
              </>
            );
          })()}
          {/* the vector itself */}
          <line x1={cx} y1={cy} x2={ppx} y2={ppy} stroke="#fbbf24" strokeWidth={2.5} />
          <circle cx={ppx} cy={ppy} r={5} fill="#fbbf24" />
          <text x={ppx + 8} y={ppy - 4} fontSize={11} fill="#fbbf24" fontFamily="monospace">v (same arrow)</text>
        </svg>
        <div className="mt-2 flex items-center gap-3 text-[11px]">
          <span className="text-neutral-400 font-mono shrink-0">basis angle θ</span>
          <input type="range" min={0} max={Math.PI / 2} step={0.02} value={theta}
            onChange={e => setTheta(parseFloat(e.target.value))} className="flex-1" />
          <span className="font-mono text-violet-300 w-12 text-right">{(theta * 180 / Math.PI).toFixed(0)}°</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="rounded border border-sky-400/20 bg-sky-400/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-wider text-sky-300">in standard basis</div>
            <div className="text-neutral-200">v = ({pt[0].toFixed(2)}, {pt[1].toFixed(2)})</div>
          </div>
          <div className="rounded border border-violet-400/20 bg-violet-400/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-wider text-violet-300">in rotated basis {(theta * 180 / Math.PI).toFixed(0)}°</div>
            <div className="text-neutral-200">v = ({ptNew[0].toFixed(2)}, {ptNew[1].toFixed(2)})</div>
          </div>
        </div>
      </div>

      <p>
        The <em>arrow</em> points to the same place (same gold dot). Only its two-number description changes — as if you described a city with different map projections. The change of basis is captured by a <Term>matrix</Term> P whose columns are the new basis vectors (expressed in the old basis). Then coordinates transform as <Eq>{`[v]_{new} = P^{-1} [v]_{old}`}</Eq>.
      </p>

      <Worked title="Same vector, two rulers">
        Standard basis: <Eq>{`\\vect{v} = (3,\\ 1)`}</Eq>. Rotate the basis 45°: <Eq>{`\\basis{b_1} = (\\tfrac{1}{\\sqrt{2}},\\tfrac{1}{\\sqrt{2}}),\\ \\basis{b_2} = (-\\tfrac{1}{\\sqrt{2}},\\tfrac{1}{\\sqrt{2}})`}</Eq>. Then
        <Block>{`[\\vect{v}]_{\\text{new}} = P^{-1}[\\vect{v}]_{\\text{old}} = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1 & 1\\\\ -1 & 1\\end{pmatrix}\\begin{pmatrix}3\\\\ 1\\end{pmatrix} = \\begin{pmatrix}\\num{2.83}\\\\ \\num{-1.41}\\end{pmatrix}.`}</Block>
        Same arrow — the map you draw it on just rotated. Notice the <Term>orthogonal matrix</Term> P has P⁻¹ = Pᵀ; for general bases, you'd have to actually invert.
      </Worked>

      <WhenItMatters>
        Change of basis is the single most useful trick in LA: hard problems in the standard basis are often <em>trivial</em> in a cleverly chosen one. Diagonalizing a matrix (card 6) <em>is</em> "change to the basis where the map becomes coordinate-wise scaling." PCA (card 8) <em>is</em> "change to the basis of principal axes where the covariance is diagonal." Most of the power moves in linear algebra are "pick the right basis."
      </WhenItMatters>

      <Misconception
        wrong={`"Different coordinates = different vector."`}
        right={`The coordinates are the vector's description, not the vector itself. A vector in a finite-dimensional space is basis-free; coordinates appear only once you pick a ruler.`}
        because={`This matters most in physics and DL: a "direction in feature space" is an abstract vector; its coordinate-tuple depends on whatever embedding basis the layer happens to use. Two networks can represent the same semantic direction with completely different coordinate-tuples and still be doing the same computation.`}
      />

      <Deeper>
        <p>
          <strong>Why the formula has an inverse.</strong> If the columns of P are the new basis written in the old basis, then P takes <em>new coordinates</em> to <em>old coordinates</em>: Pe₁ = b₁ means "in the new basis (1,0) is the vector b₁, which written in the old basis is the first column of P." So to go the other way (old → new) you invert. This is the number-one sign-flipping bug when people first learn change of basis.
        </p>
        <p>
          <strong>Orthonormal bases are cheap to invert.</strong> When the basis vectors are pairwise orthogonal and unit-length (an <Term>orthonormal</Term> basis), P is an <Term>orthogonal matrix</Term> and P⁻¹ = Pᵀ. That's a <em>huge</em> computational win — inverting a general matrix is O(n³), transposing is free. Nearly every numerical algorithm for LA spends effort constructing orthonormal bases (QR, Gram–Schmidt, Householder) for exactly this reason.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If I rotate my basis by 90°, how do the coordinates of (1, 0) change?', a: 'The old (1, 0) is the old e₁. In the new basis (which is e₁ rotated 90° CCW and e₂ rotated 90° CCW), the old e₁ becomes "−1 in the direction of new e₂". So the new coordinates are (0, −1).' },
        { q: 'Is "the basis" of ℝⁿ unique?', a: 'No — any n linearly independent vectors form a basis. There are infinitely many. Choosing among them is an important modeling decision (good bases make matrices sparse, diagonal, or interpretable).' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — LINEAR MAPS = MATRICES
   ============================================================================ */

// Smiley-face path to deform by M, so the "this is the same function applied" lands.
const SMILEY = {
  head: (() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * 2 * Math.PI;
      pts.push([Math.cos(a) * 1.4, Math.sin(a) * 1.4]);
    }
    return pts;
  })(),
  eyeL: (() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * 2 * Math.PI;
      pts.push([-0.45 + 0.15 * Math.cos(a), 0.4 + 0.15 * Math.sin(a)]);
    }
    return pts;
  })(),
  eyeR: (() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * 2 * Math.PI;
      pts.push([0.45 + 0.15 * Math.cos(a), 0.4 + 0.15 * Math.sin(a)]);
    }
    return pts;
  })(),
  mouth: (() => {
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const a = (i / 30) * Math.PI;
      pts.push([0.7 * Math.cos(Math.PI + a), -0.35 + 0.5 * Math.sin(Math.PI + a) * 0.6]);
    }
    return pts;
  })(),
};

const LinearMaps = () => {
  const PRESETS = useMemo(() => ({
    identity:   { label: 'identity',       M: [[1, 0], [0, 1]] },
    scale:      { label: 'scale ×1.5',     M: [[1.5, 0], [0, 1.5]] },
    rotate:     { label: 'rotate 40°',     M: rot2(40 * Math.PI / 180) },
    shear:      { label: 'horizontal shear', M: [[1, 0.8], [0, 1]] },
    project:    { label: 'project to x-axis', M: [[1, 0], [0, 0]] },
    reflect:    { label: 'reflect (det<0)', M: [[-1, 0], [0, 1]] },
    demo:       { label: 'default M',      M: DEFAULT_M },
  }), []);
  const [M, setLocalM] = useState(DEFAULT_M);
  const [phase, setPhase] = useState(1); // 0 = identity, 1 = M
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let s = performance.now();
    let raf;
    const tick = (t) => {
      const dt = (t - s) / 1000;
      setPhase((Math.sin(dt * 0.8) + 1) / 2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const I = [[1, 0], [0, 1]];
  const Mblend = [
    [I[0][0] + (M[0][0] - I[0][0]) * phase, I[0][1] + (M[0][1] - I[0][1]) * phase],
    [I[1][0] + (M[1][0] - I[1][0]) * phase, I[1][1] + (M[1][1] - I[1][1]) * phase],
  ];

  const W = 420, H = 280, cx = W / 2, cy = H / 2, S = 56;
  const xf = (pts) => pts.map(([x, y]) => {
    const [mx, my] = matVec2(Mblend, [x, y]);
    return [cx + mx * S, cy - my * S];
  });
  const toPath = pts => pts.map(p => p.join(',')).join(' ');

  // A running v = (1.5, 1) worked example
  const v = [1.5, 1];
  const Mv = matVec2(M, v);

  return (
    <Card id="maps" icon={Move} title="Linear maps are matrices · columns are where the basis vectors land" accent="fuchsia" index={3}>
      <MinSchema>
        A <Term>matrix</Term> M acts on a vector by matrix-vector product: <Eq>{'M\\vect{v} = v_1\\cdot(\\text{col }1) + v_2\\cdot(\\text{col }2)'}</Eq>. The columns of M are literally where the standard basis vectors e₁, e₂ get sent. Nothing more.
      </MinSchema>

      <p>
        A <Term>linear map</Term> is a function T from one vector space to another that commutes with combinations: T(αu + βv) = αT(u) + βT(v). Once you fix a basis on each side, every linear map is a matrix — and the j-th column of that matrix is T(eⱼ), i.e. where the j-th basis vector lands. That's the whole of matrix-vector multiplication; the "row times column" mechanics people memorize is the dual picture.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3">
        <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
          <div className="flex flex-wrap gap-1">
            {Object.entries(PRESETS).map(([k, v]) => (
              <button key={k} onClick={() => { setLocalM(v.M); setPhase(1); }}
                className="rounded border border-white/10 bg-white/5 hover:bg-fuchsia-500/10 hover:border-fuchsia-400/30 px-1.5 py-0.5 text-neutral-300">
                {v.label}
              </button>
            ))}
          </div>
          <button onClick={() => setPlaying(p => !p)}
            className="rounded border border-white/10 bg-white/5 hover:bg-white/10 px-1.5 py-0.5 text-neutral-300 flex items-center gap-1">
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {playing ? 'pause morph' : 'morph'}
          </button>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* grid — transformed */}
          {Array.from({ length: 17 }, (_, i) => i - 8).map(i => {
            const hpts = xf(Array.from({ length: 41 }, (_, j) => [j / 4 - 5, i * 0.5]));
            const vpts = xf(Array.from({ length: 41 }, (_, j) => [i * 0.5, j / 4 - 5]));
            return (
              <g key={i}>
                <polyline fill="none" stroke={i === 0 ? '#475569' : '#27272a'} strokeWidth={i === 0 ? 1 : 0.5} points={toPath(hpts)} />
                <polyline fill="none" stroke={i === 0 ? '#475569' : '#27272a'} strokeWidth={i === 0 ? 1 : 0.5} points={toPath(vpts)} />
              </g>
            );
          })}
          {/* smiley, transformed */}
          <polyline fill="none" stroke="#fde047" strokeWidth={2.2} points={toPath(xf(SMILEY.head))} />
          <polyline fill="none" stroke="#fde047" strokeWidth={1.8} points={toPath(xf(SMILEY.eyeL))} />
          <polyline fill="none" stroke="#fde047" strokeWidth={1.8} points={toPath(xf(SMILEY.eyeR))} />
          <polyline fill="none" stroke="#fde047" strokeWidth={1.8} points={toPath(xf(SMILEY.mouth))} />

          {/* basis vectors (transformed) */}
          {(() => {
            const [e1x, e1y] = xf([[1, 0]])[0];
            const [e2x, e2y] = xf([[0, 1]])[0];
            const [o0x, o0y] = xf([[0, 0]])[0];
            return (
              <>
                <line x1={o0x} y1={o0y} x2={e1x} y2={e1y} stroke="#f0abfc" strokeWidth={2.2} />
                <circle cx={e1x} cy={e1y} r={5} fill="#f0abfc" />
                <line x1={o0x} y1={o0y} x2={e2x} y2={e2y} stroke="#d8b4fe" strokeWidth={2.2} />
                <circle cx={e2x} cy={e2y} r={5} fill="#d8b4fe" />
                <text x={e1x + 6} y={e1y - 4} fontSize={10} fill="#f0abfc" fontFamily="monospace">M·e₁</text>
                <text x={e2x + 6} y={e2y - 4} fontSize={10} fill="#d8b4fe" fontFamily="monospace">M·e₂</text>
              </>
            );
          })()}
        </svg>
        <div className="mt-1.5 flex items-center gap-3 text-[11px]">
          <span className="text-neutral-400 font-mono shrink-0">morph I → M</span>
          <input type="range" min={0} max={1} step={0.01} value={phase}
            onChange={e => setPhase(parseFloat(e.target.value))} className="flex-1" />
          <span className="font-mono text-fuchsia-300 w-10 text-right">{(phase * 100).toFixed(0)}%</span>
        </div>
      </div>

      <Worked title="Mv, column by column">
        Take M = <Eq>{'\\begin{pmatrix}\\mat{1.6} & \\mat{0.8}\\\\ \\mat{0.4} & \\mat{1.2}\\end{pmatrix}'}</Eq> and v = <Eq>{'\\begin{pmatrix}\\vect{1.5}\\\\ \\vect{1}\\end{pmatrix}'}</Eq>.
        <Block>{`M\\vect{v} = \\vect{1.5}\\cdot\\begin{pmatrix}\\mat{1.6}\\\\ \\mat{0.4}\\end{pmatrix} + \\vect{1}\\cdot\\begin{pmatrix}\\mat{0.8}\\\\ \\mat{1.2}\\end{pmatrix} = \\begin{pmatrix}\\num{${Mv[0].toFixed(2)}}\\\\ \\num{${Mv[1].toFixed(2)}}\\end{pmatrix}.`}</Block>
        The picture is: "go 1.5 steps of M·e₁, then 1 step of M·e₂." Every matrix-vector product is that recipe.
      </Worked>

      <WhenItMatters>
        Once you see matrices as "columns are where basis vectors land," you stop memorizing matrix-multiplication rules and start <em>deriving</em> them. AB applied to v means "B takes v to Bv, then A takes Bv to ABv" — so (AB)'s j-th column is A times B's j-th column. This is the move that cascades into every advanced topic (<CrossLink to="eigen" recap="The eigenvectors of M are the basis in which M becomes just coordinate-wise scaling.">eigenbasis</CrossLink>, <CrossLink to="svd" recap="SVD factors M into rotation · stretch · rotation — each factor is a matrix whose action is easy to read.">SVD</CrossLink>, change of basis for a linear map).
      </WhenItMatters>

      <Misconception
        wrong='"Matrix multiplication is row-times-column arithmetic."'
        right='Matrix multiplication is function composition. AB is the single linear map you get by first applying B, then A. The row-by-column formula is the bookkeeping that makes composition work out entry-by-entry.'
        because='Thinking composition-first explains why AB ≠ BA (doing two operations in different orders is different), why (AB)C = A(BC) (function composition is associative), and why A times "the identity matrix" is A (composing with "do nothing" is a no-op). Everything falls out.'
      />

      <Deeper>
        <p>
          <strong>The m × n shape, read geometrically.</strong> A matrix with m rows and n columns is a linear map from ℝⁿ to ℝᵐ. n is "input dimension" (how many coordinates you feed in); m is "output dimension" (how many numbers come back). A 3×100 matrix is a linear map from ℝ¹⁰⁰ to ℝ³ — the kind of thing that compresses a 100-D feature vector to 3-D for plotting.
        </p>
        <p>
          <strong>Non-square matrices don't have inverses.</strong> A 3×2 matrix (ℝ² → ℝ³) embeds the plane into 3-D space, but most vectors in ℝ³ aren't on that plane, so there's no function "go back." The natural generalization — the <Term>pseudoinverse</Term> — still exists (via SVD; see card 7) and does the "best-possible inverse" via projection to the column space.
        </p>
        <p>
          <strong>Trade-off: matrices vs tensors.</strong> Matrices handle linear maps between two vector spaces (in and out). If you want linear maps with more inputs (e.g. bilinear forms on <em>two</em> vectors, or trilinear on three), you need <em>tensors</em>: matrices are the 2-index tensors. Deep learning lives in this land — a 4-D "tensor" (batch, channel, height, width) is just n-indexed data, and most operations on it are still linear in one index at a time, so matrix intuition carries over per axis.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If the columns of M are m·e₁ = (0,1) and m·e₂ = (−1, 0), what transformation is M?', a: 'A 90° counterclockwise rotation. M = [[0, −1], [1, 0]]. Check: M·(1, 0) = (0, 1) and M·(0, 1) = (−1, 0).' },
        { q: 'Can a 2×3 matrix be invertible?', a: 'No. It maps ℝ³ to ℝ² — at least one dimension gets collapsed, so you cannot uniquely recover the input. Only square matrices with nonzero determinant can be inverted.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — RANK · NULL SPACE · COLUMN SPACE
   ============================================================================ */

const RankVisual = ({ rank }) => {
  // 3D → 2D projection effect with a "rank" slider.
  // rank ∈ {3..1}: show a box of 3D points being projected to a subspace of that rank.
  const W = 420, H = 260;
  const cx = W / 2, cy = H / 2;
  // A set of 3D points in a unit cube (rotated)
  const pts = useMemo(() => {
    const arr = [];
    const N = 7;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        for (let k = 0; k < N; k++) {
          const x = (i / (N - 1)) - 0.5;
          const y = (j / (N - 1)) - 0.5;
          const z = (k / (N - 1)) - 0.5;
          arr.push([x, y, z]);
        }
    return arr;
  }, []);
  // Rotate then project: a matrix from ℝ³ to ℝ² of rank `rank` (1, 2, or 3).
  // We construct a 2×3 matrix whose columns interpolate toward coplanarity/collinearity as rank drops.
  const tRank = useMemo(() => {
    // continuous rank for smooth animation: rank can be 1.0 to 3.0
    const r = rank;
    // Base: project ℝ³ → ℝ² via isometric-ish view
    const A = [[0.85, -0.3, 0.4], [0.2, 0.85, -0.35]];
    // Interpolate to reduce rank: shrink the z-contribution, then y, then x
    if (r >= 2) {
      const f = r - 2; // 0..1
      return [[A[0][0], A[0][1], A[0][2] * f], [A[1][0], A[1][1], A[1][2] * f]];
    }
    // r in [1, 2): also shrink y-dimension toward zero in 2D
    const f2 = r - 1; // 0..1
    const uy = [0.2, 0.85]; // direction in 2D
    const un = Math.hypot(uy[0], uy[1]);
    return [
      [A[0][0] * (f2 + 0.001), uy[0] / un * (f2 * 0.1), 0],
      [A[1][0] * (f2 + 0.001), uy[1] / un * (f2 * 0.1), 0],
    ];
  }, [rank]);
  const S = 110;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Faint axes */}
      <line x1={0} y1={cy} x2={W} y2={cy} stroke="#27272a" />
      <line x1={cx} y1={0} x2={cx} y2={H} stroke="#27272a" />
      {/* rank subspace visualization */}
      {rank >= 1.95 && (() => {
        // Plane spanned by col 1 and col 2 (projected)
        const c1 = [tRank[0][0], tRank[1][0]];
        const c2 = [tRank[0][1], tRank[1][1]];
        const corners = [
          [-1.2, -1.2], [1.2, -1.2], [1.2, 1.2], [-1.2, 1.2],
        ].map(([a, b]) => [a * c1[0] + b * c2[0], a * c1[1] + b * c2[1]]);
        return (
          <polygon
            points={corners.map(([x, y]) => [cx + x * S, cy - y * S].join(',')).join(' ')}
            fill="#38bdf833" stroke="#38bdf8" strokeWidth={1} opacity={0.7}
          />
        );
      })()}
      {rank < 1.95 && rank >= 0.95 && (() => {
        // A line (rank 1 subspace)
        const c1 = [tRank[0][0], tRank[1][0]];
        const len = Math.hypot(c1[0], c1[1]) || 0.001;
        const u = [c1[0] / len, c1[1] / len];
        const L = 2.2;
        return (
          <line
            x1={cx - u[0] * S * L} y1={cy + u[1] * S * L}
            x2={cx + u[0] * S * L} y2={cy - u[1] * S * L}
            stroke="#38bdf8" strokeWidth={3} opacity={0.7}
          />
        );
      })()}
      {/* projected points */}
      {pts.map((p, i) => {
        const [x, y, z] = p;
        const [px, py] = [tRank[0][0] * x + tRank[0][1] * y + tRank[0][2] * z,
                          tRank[1][0] * x + tRank[1][1] * y + tRank[1][2] * z];
        return (
          <circle key={i} cx={cx + px * S} cy={cy - py * S} r={1.8}
            fill="#c4b5fd" opacity={0.85} />
        );
      })}
      <text x={12} y={20} fontSize={11} fill="#7dd3fc" fontFamily="monospace">rank = {rank.toFixed(2)}</text>
      <text x={12} y={36} fontSize={10} fill="#94a3b8" fontFamily="monospace">
        {rank >= 1.95 ? 'image = plane (column space dim 2)' :
         rank >= 0.95 ? 'image = line (column space dim 1)' :
         'image collapses toward 0'}
      </text>
    </svg>
  );
};

const RankNullCol = () => {
  const [rank, setRank] = useState(3);

  return (
    <Card id="rank" icon={Layers} title="Rank · null space · column space — what a map keeps, kills, and reaches" accent="emerald" index={4}>
      <MinSchema>
        For any linear map M: <Term>rank</Term> = dimensions you keep; <Term>nullity</Term> = dimensions you kill; <Term>column space</Term> = dimensions you can reach. The <Term>rank-nullity</Term> theorem: kept + killed = input dim.
      </MinSchema>

      <p>
        Pull a cube of points through a rank-deficient map and watch it collapse to a plane, a line, a point. The lost dimensions are the <Term>null space</Term> — the set of directions M sends to zero. What remains — the plane, the line — is the <Term>column space</Term>, the span of the columns of M, also known as the <Term>image</Term>.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3">
        <RankVisual rank={rank} />
        <div className="mt-2 flex items-center gap-3 text-[11px]">
          <span className="text-neutral-400 font-mono shrink-0">map rank</span>
          <input type="range" min={0.5} max={3} step={0.01} value={rank}
            onChange={e => setRank(parseFloat(e.target.value))} className="flex-1" />
          <span className="font-mono text-emerald-300 w-12 text-right">{rank.toFixed(2)}</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(r => (
              <button key={r} onClick={() => setRank(r)}
                className="rounded border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-400/30 px-1.5 py-0.5 text-neutral-300 text-[10px]">rank {r}</button>
            ))}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-wider text-emerald-300">keeps (rank)</div>
            <div className="text-neutral-200">{rank >= 2.5 ? '3' : rank >= 1.5 ? '2' : '1'} dim</div>
          </div>
          <div className="rounded border border-rose-400/20 bg-rose-400/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-wider text-rose-300">kills (nullity)</div>
            <div className="text-neutral-200">{rank >= 2.5 ? '0' : rank >= 1.5 ? '1' : '2'} dim</div>
          </div>
          <div className="rounded border border-sky-400/20 bg-sky-400/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-wider text-sky-300">reaches (col space)</div>
            <div className="text-neutral-200">{rank >= 2.5 ? 'ℝ³ plane' : rank >= 1.5 ? 'plane' : 'line'}</div>
          </div>
        </div>
      </div>

      <p>
        The <em>conservation law</em> for linear maps is rank + nullity = input dimension. You cannot have dimensions magically appear or vanish: every input direction is either preserved (counts toward rank) or annihilated (counts toward nullity). If you're compressing ℝ¹⁰⁰⁰ to ℝ⁵⁰, <em>950 dimensions of the input must be in the null space.</em> That's not a bug — it's the definition.
      </p>

      <Worked title="Least-squares grounding: projecting b onto the column space">
        Say you have A (3 × 2, so it maps ℝ² → ℝ³ — an embedding) and a target b in ℝ³. Usually b is <em>not</em> in the column space of A, so there's no exact solution to Ax = b. The least-squares fix:
        <Block>{`\\hat{\\vect x} = (A^\\top A)^{-1} A^\\top \\zero{\\vect b}, \\quad \\text{and} \\quad A\\hat{\\vect x} = P_{\\text{col}(A)}\\zero{\\vect b}`}</Block>
        Geometrically: project b onto the column space of A (drop perpendicular to it), and solve for the input that produces the projection. The residual b − Ax̂ lives entirely in the <Term>orthogonal complement</Term> of col(A). This one move — project the unreachable target to the closest reachable point — is the backbone of regression, filtering, calibration, and tons of estimation theory.
      </Worked>

      <WhenItMatters>
        Rank is the dial between "expressive" and "cheap". A rank-k approximation of a matrix costs k(m+n) numbers instead of mn. In ML this is <em>low-rank adapters</em> (LoRA) — freeze a huge model's weights, train a small rank-8 update. In imaging, it's <em>compression</em>. In causal inference, <em>low-rank covariance</em> means a few latent factors drive everything.
      </WhenItMatters>

      <Misconception
        wrong='"Null space is the kernel — just a technicality."'
        right='The null space IS the set of input perturbations that disappear in the output — and in ML and inverse problems, that is exactly the set of "directions you cannot identify from data." Ignoring it makes you confidently wrong.'
        because='Example: fit a linear model y = Xβ where X has a null space (collinear features). Any β in the null space of X changes nothing about ŷ, so infinitely many β produce the same predictions. Regularization (ridge, lasso) is a principled way to pick one representative — but you have to know the null space is there first.'
      />

      <Deeper>
        <p>
          <strong>The four fundamental subspaces.</strong> For an m × n matrix A, there are four subspaces that tile ℝⁿ and ℝᵐ:
          <em> col(A)</em> and <em>null(Aᵀ)</em> partition ℝᵐ (as <Term>orthogonal complement</Term>s); <em>col(Aᵀ)</em> (a.k.a. "row space") and <em>null(A)</em> partition ℝⁿ. Rank of A equals dim col(A) = dim col(Aᵀ) — "column rank equals row rank," a non-obvious theorem that pays back every time you work with regression.
        </p>
        <p>
          <strong>Trade-off: full rank vs stable.</strong> A matrix can be full rank in exact arithmetic but nearly rank-deficient numerically — its smallest <Term>singular value</Term> is tiny. The <Term>condition number</Term> σ₁/σₙ tells you how bad this is: large condition number means the solution to Ax = b wobbles wildly when b wobbles slightly. In practice "full rank" (a yes/no question) is less useful than "effective rank" (a continuous measure from the singular-value spectrum; see card 7).
        </p>
      </Deeper>

      <QA items={[
        { q: 'If A is 4 × 7, what is the largest possible rank? The smallest possible nullity?', a: 'Largest rank = min(4, 7) = 4. By rank-nullity, smallest nullity = 7 − 4 = 3. At least 3 input directions MUST be killed, because the output only has 4 slots.' },
        { q: 'If Ax = b has infinitely many solutions, what does that say about the null space?', a: 'The null space is nontrivial — dim ≥ 1. Any particular solution x₀ plus any element of null(A) is also a solution.' },
        { q: 'Can a matrix have rank 0?', a: 'Only the zero matrix. Rank 0 means every column is the zero vector, i.e. every input maps to 0.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — DETERMINANT
   ============================================================================ */

const Determinant = () => {
  return (
    <Card id="det" icon={Square} title="Determinant · signed volume scaling" accent="amber" index={5}>
      <MinSchema>
        <Term>det</Term> M = (volume scaling factor) × (+1 if orientation preserved, −1 if flipped). <Eq>|\det M| = 0</Eq> exactly when M collapses a dimension.
      </MinSchema>

      <p>
        Drag the columns in the sandbox below: the parallelogram they span is M's image of the unit square. Its (signed) area is the determinant. When you cross a column through the other — or make them parallel — the parallelogram flattens to a line, area hits zero, and at that moment M has collapsed a dimension (<CrossLink to="rank" recap="rank-deficient maps kill input directions — det = 0 is the 2D signature that this has happened.">rank-deficient</CrossLink>).
      </p>

      <MatrixSandbox mode="determinant" />

      <Worked title="Determinant, in two ways">
        The formula and the picture agree. For M = <Eq>{'\\begin{pmatrix}\\mat{1.6} & \\mat{0.8}\\\\ \\mat{0.4} & \\mat{1.2}\\end{pmatrix}'}</Eq>:
        <Block>{`\\det M = (\\mat{1.6})(\\mat{1.2}) - (\\mat{0.8})(\\mat{0.4}) = \\num{1.92} - \\num{0.32} = \\num{1.6}.`}</Block>
        Geometric check: the unit square (area 1, dashed blue in the sandbox) becomes a parallelogram of area <Eq>{'\\num{1.6}'}</Eq>. Sign is +, so orientation was preserved. Had a column been flipped, the sign would be −.
      </Worked>

      <Predict question="What is det of a rotation matrix by 30°? A shear? A projection onto the x-axis?">
        Rotations have det = +1 (rigid motion, no stretch or flip). Pure shears (unit diagonal) have det = +1 too — surprisingly, because a shear visibly "slants" a square but actually preserves its area. Projections onto a lower-dim subspace have det = 0 (they collapse).
      </Predict>

      <WhenItMatters>
        The <Term>Jacobian</Term> |det J| is the factor by which an integral's volume element transforms when you change variables. You cannot convert a spherical integral to Cartesian without it. In generative models (normalizing flows), the log-det-Jacobian is literally the log-likelihood correction for an invertible layer. The determinant isn't a curiosity — it's the universal "how much did my volume change?" meter.
      </WhenItMatters>

      <Misconception
        wrong='"The determinant is a weird alternating-sum formula I should memorize."'
        right='The determinant is the UNIQUE scalar function of a matrix that is (i) linear in each column, (ii) flips sign when two columns are swapped, and (iii) equals 1 on the identity. The "weird formula" is just the closed-form consequence of those three constraints.'
        because='The axioms are worth knowing because they explain everything: linearity-in-columns gives the "cofactor expansion." Swap-flips-sign gives det = 0 when two columns are equal. det(I) = 1 fixes the normalization. From those three lines you can DERIVE every determinant identity — det(AB) = det(A)det(B), det(Aᵀ) = det(A), det(A⁻¹) = 1/det(A), and why the formula has signed permutations.'
      />

      <Deeper>
        <p>
          <strong>In 2D: signed area; in 3D: signed volume; in n-D: signed n-volume.</strong> The determinant of n column vectors is the (signed) volume of the n-dimensional parallelepiped they span. "Signed" because flipping one vector (a reflection) reverses the <Term>orientation</Term> of the frame — and the determinant tracks that by its sign. In computer graphics this is how you tell whether a triangle is facing toward or away from the camera: compute the determinant of its edge-vectors, read the sign.
        </p>
        <p>
          <strong>Trade-off: det vs singular values.</strong> You can learn <em>whether</em> M is invertible from the determinant (det ≠ 0 ↔ invertible). You cannot learn <em>how invertible</em> from it. The determinant is the <em>product</em> of the <Term>singular values</Term>; a matrix with σ₁ = 10⁸ and σ₂ = 10⁻⁸ has det = 1 (looks fine!) but is numerically catastrophic. For any real numerical work, the SVD's singular-value spectrum is what you want; det is a blunt summary.
        </p>
        <p>
          <strong>Why det(AB) = det(A)·det(B).</strong> Volume scaling composes: doing B scales volumes by det(B), then doing A scales that result by det(A). Total scaling is the product. The identity det(A⁻¹) = 1/det(A) is the same principle: undoing A must undo its volume scaling.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If I multiply one row of M by 5, what happens to det M?', a: 'det gets multiplied by 5. Determinant is linear in each row (and column). Multiplying a row by 5 is the same as scaling one axis by 5, which scales the parallelepiped volume by 5.' },
        { q: 'What is det of an orthogonal matrix?', a: '±1. Orthogonal matrices preserve all lengths and angles, so they preserve volumes (|det|=1). The sign is +1 for rotations and −1 for reflections.' },
        { q: 'How does det relate to eigenvalues?', a: 'det M is the product of the eigenvalues (counted with multiplicity). Trace(M) is their sum. Makes sense geometrically: in the eigenbasis, M is diagonal with the eigenvalues as diagonal entries, and det of a diagonal matrix is the product of its diagonal.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — EIGENVECTORS & EIGENVALUES
   ============================================================================ */

const EigenCard = () => {
  const { M, setM } = useMatrix();
  const eig = eigen2(M);

  const presets = [
    { label: 'default M',    M: DEFAULT_M },
    { label: 'rotation 30°', M: rot2(30 * Math.PI / 180) },
    { label: 'diagonal',     M: [[2, 0], [0, 0.5]] },
    { label: 'defective',    M: [[1, 1], [0, 1]] },
  ];

  return (
    <Card id="eigen" icon={Sparkles} title="Eigenvectors & eigenvalues · the directions M only stretches" accent="amber" index={6}>
      <MinSchema>
        An <Term>eigenvector</Term> v satisfies <Eq>{`M\\basis{v} = \\scal{\\lambda}\\basis{v}`}</Eq> for some scalar <Eq>{`\\scal{\\lambda}`}</Eq> (the <Term>eigenvalue</Term>). It's a direction M preserves — stretching it, but never rotating it off its own line.
      </MinSchema>

      <p>
        Drive the sandbox: a sky unit vector sweeps around the circle; its image Mv (violet → gold when aligned) follows. At exactly two angles, Mv points along v — those are the two real eigendirections (dashed gold). At those directions the map is pure scaling by <Eq>{`\\scal{\\lambda}`}</Eq>.
      </p>

      <MatrixSandbox mode="eigen" />

      <div className="flex flex-wrap gap-1 mt-2">
        {presets.map(p => (
          <button key={p.label} onClick={() => setM(p.M)}
            className="rounded border border-white/10 bg-white/5 hover:bg-amber-500/10 hover:border-amber-400/30 px-1.5 py-0.5 text-neutral-300 text-[10px] font-mono">
            {p.label}
          </button>
        ))}
      </div>

      <Worked title="Finding eigenvalues of our M">
        The eigenvalues solve <Term>characteristic polynomial</Term> <Eq>{`\\det(M - \\scal{\\lambda} I) = 0`}</Eq>. For our default M:
        <Block>{`\\det\\begin{pmatrix}\\mat{1.6}-\\scal{\\lambda} & \\mat{0.8}\\\\ \\mat{0.4} & \\mat{1.2}-\\scal{\\lambda}\\end{pmatrix} = (\\scal{\\lambda})^2 - \\num{2.8}\\scal{\\lambda} + \\num{1.6} = 0.`}</Block>
        Trace = 2.8, det = 1.6. Quadratic formula: <Eq>{`\\scal{\\lambda} = (2.8 \\pm \\sqrt{7.84 - 6.4})/2 = (2.8 \\pm 1.2)/2`}</Eq>, so <Eq>{`\\scal{\\lambda_1} = 2`}</Eq>, <Eq>{`\\scal{\\lambda_2} = 0.8`}</Eq>. Product = 1.6 (= det ✓); sum = 2.8 (= trace ✓).
        <br />
        Eigenvectors: solve <Eq>{`(M - \\scal{\\lambda_1} I)\\basis{v} = 0`}</Eq> → <Eq>{`\\basis{v_1} \\propto (2, 1)`}</Eq>. For <Eq>{`\\scal{\\lambda_2}`}</Eq>: <Eq>{`\\basis{v_2} \\propto (-1, 1)`}</Eq>. Those are the dashed gold lines in the sandbox.
      </Worked>

      <p>
        Try the <strong>rotation 30°</strong> preset: no vector stays on its own line (they all rotate). The discriminant goes negative and the eigenvalues become a conjugate pair of complex numbers, <Eq>{'\\scal{\\lambda} = \\cos\\theta \\pm i\\sin\\theta'}</Eq>. Sandbox readout flips to "no real eigenvectors." The <strong>defective</strong> preset (shear) has a repeated eigenvalue λ = 1 with only <em>one</em> independent eigenvector — a matrix that fails to be diagonalizable.
      </p>

      <WhenItMatters>
        Eigen-structure is the coordinate system the matrix itself chooses. Whenever a process evolves by repeated application of a matrix (discrete-time linear systems, power iteration, Markov chains, recurrent networks), the long-term behavior is dominated by the eigenvector with the largest |λ|. PageRank is the dominant eigenvector of the web-link transition matrix. Vibration modes of a structure are the eigenvectors of its stiffness matrix. Principal-component analysis (next-but-one card) reads the eigenvectors of a covariance matrix. Same math, different names.
      </WhenItMatters>

      <Misconception
        wrong='"Eigenvectors are special vectors."'
        right='Eigenvectors are the NATURAL COORDINATE AXES of the map. Every other direction is just a mixture of them (when the matrix is diagonalizable). In the eigenbasis, M is a diagonal matrix — action collapses to per-coordinate scaling.'
        because={`This is why eigendecomposition is such a powerful move: most questions about M^k, or about "how does iterating M evolve a vector?", become trivial once you've changed to the eigenbasis. M^k v₀ = Σ c_i λ_i^k v_i — for large k, one term dominates.`}
      />

      <Deeper>
        <p>
          <strong>Diagonalization: M = PDP⁻¹.</strong> When M has n linearly independent eigenvectors (always true for symmetric matrices, generic for random matrices), stack them as columns of P; then P⁻¹MP = D is the diagonal matrix of eigenvalues. In the eigenbasis, M's action is purely per-coordinate stretch. This turns hard matrix operations into easy scalar ones: <Eq>{`M^{10}`}</Eq> becomes <Eq>{`PD^{10}P^{-1}`}</Eq> and D^10 is just 10th powers of the diagonal entries — O(n) work instead of ten O(n³) multiplications.
        </p>
        <p>
          <strong>Defective matrices and Jordan form.</strong> A matrix can fail to be diagonalizable: the 2×2 shear <Eq>{'\\begin{pmatrix}1 & 1\\\\ 0 & 1\\end{pmatrix}'}</Eq> has λ = 1 with algebraic multiplicity 2 but only one eigenvector. The <em>Jordan normal form</em> patches this: any matrix is similar to a block-diagonal with either diagonal blocks (the easy case) or "Jordan blocks" (1s on the superdiagonal) for the defective eigenvalues. In practice, numerical methods prefer the <Term>SVD</Term>, which always exists and never has this pathology.
        </p>
        <p>
          <strong>Trade-off: eigenvalues vs singular values.</strong> Eigenvalues can be complex, negative, repeated, or nonexistent (defective). They require a square matrix. Singular values (card 7) are always nonnegative real, always exist, and work for any m × n matrix. For <em>symmetric</em> matrices the two agree up to sign (|λᵢ| = σᵢ). For non-symmetric matrices they can be wildly different — and for numerical analysis σ's are nearly always what you want.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If M has eigenvalues λ = 2 and λ = 0.5, what are the eigenvalues of M²? Of M⁻¹?', a: 'M²: eigenvalues get squared (4 and 0.25), eigenvectors unchanged. M⁻¹: eigenvalues invert (0.5 and 2), eigenvectors unchanged.' },
        { q: 'Can a real matrix have complex eigenvalues?', a: 'Yes — any non-symmetric real matrix can. They come in conjugate pairs (λ and λ̄). Rotation matrices have eigenvalues e^(±iθ) on the unit circle.' },
        { q: 'Why is the largest |λ| special for Markov chains and iterated processes?', a: 'M^k v = Σ cᵢλᵢᵏ vᵢ. For k large, the term with the largest |λ| dominates — so the direction of v_max becomes the attracting direction. If |λ| > 1 the vector grows; = 1 it is stable; < 1 it decays.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — SVD
   ============================================================================ */

// Simple SVD via alternating power iteration + deflation. For small matrices.
const svdTopK = (A, k, iters = 60) => {
  const m = A.length, n = A[0].length;
  const Aw = A.map(r => r.slice());
  const U = [], S = [], V = [];
  for (let t = 0; t < k; t++) {
    let v = Array.from({ length: n }, (_, i) => Math.sin((i + 1) * (t + 2) * 1.7) + 0.1 * Math.cos((i + 3) * 0.9));
    let vn = Math.hypot(...v) || 1; v = v.map(x => x / vn);
    let u = Array(m).fill(0);
    for (let it = 0; it < iters; it++) {
      // u = A v
      u = Array(m).fill(0);
      for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) u[i] += Aw[i][j] * v[j];
      const un = Math.hypot(...u) || 1e-12;
      u = u.map(x => x / un);
      // v = Aᵀ u
      const nv = Array(n).fill(0);
      for (let j = 0; j < n; j++) for (let i = 0; i < m; i++) nv[j] += Aw[i][j] * u[i];
      const nvn = Math.hypot(...nv) || 1e-12;
      v = nv.map(x => x / nvn);
    }
    // sigma = ||A v||
    u = Array(m).fill(0);
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) u[i] += Aw[i][j] * v[j];
    const s = Math.hypot(...u);
    const uN = s > 1e-12 ? u.map(x => x / s) : u;
    S.push(s); U.push(uN); V.push(v);
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) Aw[i][j] -= s * uN[i] * v[j];
  }
  return { U, S, V };
};

// Build a 32×32 "image": a radial gradient + a sine stripe. Low-rank-ish.
const buildImage = () => {
  const N = 32;
  const A = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = (j - N / 2) / (N / 2);
      const y = (i - N / 2) / (N / 2);
      const r = Math.sqrt(x * x + y * y);
      const ring = Math.exp(-Math.pow(r - 0.55, 2) / 0.04) * 0.8;
      const stripe = 0.35 * Math.sin((x + y) * 7);
      const core = Math.exp(-r * r / 0.25) * 0.6;
      const mouth = (y > 0.25 && y < 0.38 && Math.abs(x) < 0.22) ? -0.45 : 0;
      const eyeL = Math.exp(-((x + 0.25) ** 2 + (y + 0.12) ** 2) / 0.005) * -0.6;
      const eyeR = Math.exp(-((x - 0.25) ** 2 + (y + 0.12) ** 2) / 0.005) * -0.6;
      A[i][j] = 0.5 + ring * 0.6 + stripe * 0.15 + core * 0.2 + mouth + eyeL + eyeR;
      A[i][j] = Math.max(0, Math.min(1, A[i][j]));
    }
  }
  return A;
};

const reconstruct = (U, S, V, k) => {
  const m = U[0].length, n = V[0].length;
  const A = Array.from({ length: m }, () => Array(n).fill(0));
  const K = Math.min(k, S.length);
  for (let t = 0; t < K; t++) {
    const u = U[t], v = V[t], s = S[t];
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) A[i][j] += s * u[i] * v[j];
  }
  return A;
};

const SVDCompressionDemo = () => {
  const original = useMemo(() => buildImage(), []);
  const svd = useMemo(() => svdTopK(original, 12, 90), [original]);
  const [k, setK] = useState(3);
  const recon = useMemo(() => reconstruct(svd.U, svd.S, svd.V, k), [svd, k]);

  // Frobenius error
  const frobErr = useMemo(() => {
    let sum = 0, sumA = 0;
    for (let i = 0; i < original.length; i++) for (let j = 0; j < original[0].length; j++) {
      const d = original[i][j] - recon[i][j];
      sum += d * d; sumA += original[i][j] * original[i][j];
    }
    return Math.sqrt(sum / sumA);
  }, [original, recon]);

  const renderGrid = (grid, label) => {
    const N = grid.length;
    const px = 4;
    return (
      <div className="rounded border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{label}</div>
        <svg viewBox={`0 0 ${N * px} ${N * px}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {grid.map((row, i) => row.map((v, j) => {
            const shade = Math.max(0, Math.min(255, Math.round(v * 255)));
            return <rect key={`${i}-${j}`} x={j * px} y={i * px} width={px} height={px}
              fill={`rgb(${shade},${shade},${shade})`} />;
          }))}
        </svg>
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-3">
      <div className="flex items-center gap-3 text-[11px] mb-2">
        <span className="text-neutral-400 font-mono shrink-0">rank k</span>
        <input type="range" min={1} max={12} step={1} value={k}
          onChange={e => setK(parseInt(e.target.value))} className="flex-1" />
        <span className="font-mono text-violet-300 w-24 text-right">{k} / {svd.S.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {renderGrid(original, 'original · 32×32 = 1024 numbers')}
        {renderGrid(recon, `rank-${k} recon · ${k * (32 + 32)} = ${k * 64} numbers`)}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono">
        <span>σ spectrum:</span>
        {svd.S.map((s, i) => (
          <span key={i} className={`${i < k ? 'text-amber-300' : 'text-neutral-600'}`}>
            σ{String(i + 1).padStart(1, '0')}={s.toFixed(2)}
          </span>
        ))}
      </div>
      <div className="mt-1.5 text-[11px] text-neutral-400 font-mono">
        relative Frobenius error: <span className="text-emerald-300">{(frobErr * 100).toFixed(1)}%</span> ·
        compression ratio: <span className="text-sky-300">{(1024 / Math.max(k * 64, 1)).toFixed(1)}×</span>
      </div>
    </div>
  );
};

const SVDCard = () => {
  return (
    <Card id="svd" icon={Sigma} title="SVD · every matrix is rotate → stretch → rotate" accent="violet" index={7}>
      <MinSchema>
        For ANY matrix M, there exist <Term>orthogonal matrices</Term> U, V and a diagonal Σ of nonnegative <Term>singular values</Term> with <Eq>{'M = U\\Sigma V^\\top'}</Eq>. Right-rotation, axis-aligned stretch, left-rotation.
      </MinSchema>

      <p>
        Watch the unit circle in the sandbox below morph into an ellipse through three stages. First Vᵀ rotates it (still a circle, but rotated). Then Σ stretches it along the axes by σ₁, σ₂. Then U rotates the stretched ellipse into its final pose. The singular values σᵢ are the lengths of the ellipse's semi-axes. Every linear map, no matter how weird, factors into exactly this rotate-stretch-rotate.
      </p>

      <MatrixSandbox mode="svd" />

      <Worked title="SVD, computed">
        For our default M: <Eq>{`\\sigma_1 \\approx 2.05`}</Eq>, <Eq>{`\\sigma_2 \\approx 0.78`}</Eq>, and <Eq>{'\\det M = \\sigma_1 \\sigma_2 = \\num{1.6}'}</Eq> (✓). The <Term>condition number</Term> is σ₁/σ₂ ≈ 2.6 — well-conditioned. The singular values are the square roots of the eigenvalues of <Eq>{'M^\\top M'}</Eq>, a <em>symmetric positive-semidefinite</em> matrix that always has real nonnegative eigenvalues:
        <Block>{`M^\\top M = \\begin{pmatrix}\\num{2.72} & \\num{1.76}\\\\ \\num{1.76} & \\num{2.08}\\end{pmatrix}, \\quad \\text{eig} = \\{\\num{4.19}, \\num{0.61}\\}, \\quad \\sqrt{\\cdot} = \\{\\sigma_1, \\sigma_2\\}.`}</Block>
      </Worked>

      <div className="text-[13px] text-neutral-400 mt-1">Low-rank approximation · keep only the top k terms:</div>
      <Block>{`M \\;\\approx\\; \\sum_{i=1}^{k} \\sigma_i \\,\\basis{u_i}\\,\\basis{v_i}^\\top \\quad \\text{(the \\Term{Eckart–Young} best rank-}k\\text{ approximation)}`}</Block>

      <SVDCompressionDemo />

      <div className="text-[11px] text-neutral-400 mt-2 leading-snug">
        The rank-k reconstruction uses only k(m+n) numbers instead of mn. At k=3, you already read "smiley face" out of 192 numbers instead of 1024 — a 5× compression. This is not just a toy: it is literally the idea behind JPEG (DCT is a fixed orthogonal basis, then thresholding equals rank-k), behind latent semantic analysis in NLP, behind <em>denoising</em> (noise lives in the tail singular values; zero them out), and behind LoRA-style low-rank adapters in LLM fine-tuning.
      </div>

      <WhenItMatters>
        SVD is the hammer you reach for when you want to (a) solve ill-posed linear systems stably via the <Term>pseudoinverse</Term>, (b) find the best low-rank approximation, (c) compute principal components (<CrossLink to="quad" recap="PCA = eigendecomposition of the covariance matrix = top right singular vectors of the centered data matrix.">see the PCA card</CrossLink>), or (d) detect rank deficiency numerically. If you only learn one decomposition from this explainer, make it this one.
      </WhenItMatters>

      <Misconception
        wrong='"SVD and eigendecomposition are basically the same."'
        right='For symmetric (or normal) matrices, they agree. For general matrices they disagree strongly — eigendecomposition can fail (defective matrices) or produce complex numbers; SVD always exists, is real, and is numerically stable. For non-square matrices, eigendecomposition is not even defined.'
        because={`The correct high-level story: SVD IS the eigendecomposition of MᵀM (and MMᵀ), rotated by M itself. That is why σᵢ² are the eigenvalues of MᵀM, V's columns are its eigenvectors, and U = MV/σ.`}
      />

      <Deeper>
        <p>
          <strong>SVD as "best basis pair."</strong> Eigendecomposition finds a single basis where a square matrix is diagonal; SVD finds <em>two</em> bases (one for input, V; one for output, U) such that M is diagonal between them. That is strictly more general — and it's why SVD works for non-square, non-diagonalizable, rectangular, rank-deficient cases. The cost: you now have two bases to track instead of one.
        </p>
        <p>
          <strong>Pseudoinverse (Moore–Penrose).</strong> If <Eq>{'M = U\\Sigma V^\\top'}</Eq>, define <Eq>{'M^+ = V\\Sigma^+ U^\\top'}</Eq>, where Σ⁺ inverts nonzero σ's and leaves zeros alone. Then <Eq>{'\\hat{\\vect x} = M^+ \\zero{\\vect b}'}</Eq> gives the least-squares solution of Mx = b for any M, square or not, invertible or not. The pseudoinverse is how every "unsolvable" linear system gets a canonical "best available" answer.
        </p>
        <p>
          <strong>Eckart–Young, and why truncating the SVD is optimal.</strong> The claim "the rank-k truncation of the SVD is the best rank-k approximation" is a deep theorem. In practice it explains why so many subjects reduce to SVD: whenever you want the "simplest" rank-limited model of high-dimensional data, SVD gives it to you in closed form. Trade-off: SVD of an m×n matrix costs O(min(m,n)·mn) — expensive for very large matrices, which is why <em>randomized SVD</em> (random projection + small SVD) is the workhorse at scale.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If M is symmetric with eigenvalues λ₁ = 3, λ₂ = −2, what are its singular values?', a: 'σ₁ = 3, σ₂ = 2. Singular values are |λᵢ| for symmetric matrices (sorted descending). Signs get absorbed into U/V.' },
        { q: 'What is the SVD of an orthogonal matrix?', a: 'Q = Q · I · Iᵀ. All singular values are 1. Orthogonal matrices preserve lengths — they stretch no direction.' },
        { q: 'How do σ₁ and σₙ relate to "how much the matrix amplifies / shrinks" input vectors?', a: 'For any unit vector v, ||Mv|| lies in [σₙ, σ₁]. σ₁ is the maximum stretch, σₙ (the smallest) is the minimum stretch. If σₙ = 0 the matrix is singular; if σ₁/σₙ is huge, it is nearly so (ill-conditioned).' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — QUADRATIC FORMS · PCA
   ============================================================================ */

// Box–Muller standard normal samples
const randomNormal = () => {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// Symmetric 2×2 matrix from (λ₁, λ₂, θ)
const symFromEigen = (l1, l2, theta) => {
  const R = rot2(theta);
  const D = [[l1, 0], [0, l2]];
  // A = R D Rᵀ
  const Rt = transpose2(R);
  return matMat2(R, matMat2(D, Rt));
};

// Sample from N(0, A) with symmetric PSD A.
const sampleNormal2 = (A, N, seed = 1) => {
  // A = Q diag(λ) Qᵀ; √A = Q diag(√λ) Qᵀ; sample x ~ N(0,I), then √A x ~ N(0, A)
  const eig = eigen2(A);
  const Q = [[eig.vecs[0][0], eig.vecs[1][0]], [eig.vecs[0][1], eig.vecs[1][1]]];
  const sqrtL = [Math.sqrt(Math.max(0, eig.vals[0])), Math.sqrt(Math.max(0, eig.vals[1]))];
  // deterministic "random" from seed
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) % 1000) / 1000; };
  const randN = () => {
    const u = 1 - rand(); const v = rand();
    return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
  };
  const pts = [];
  for (let i = 0; i < N; i++) {
    const z = [randN(), randN()];
    const sz = [z[0] * sqrtL[0], z[1] * sqrtL[1]];
    const x = matVec2(Q, sz);
    pts.push(x);
  }
  return pts;
};

const QuadraticCard = () => {
  const [l1, setL1] = useState(3);
  const [l2, setL2] = useState(0.7);
  const [theta, setTheta] = useState(30 * Math.PI / 180);
  const A = useMemo(() => symFromEigen(l1, l2, theta), [l1, l2, theta]);
  const pts = useMemo(() => sampleNormal2(A, 260, 42), [A]);

  // Sample covariance (should ≈ A)
  const sampleCov = useMemo(() => {
    let mx = 0, my = 0;
    pts.forEach(([x, y]) => { mx += x; my += y; });
    mx /= pts.length; my /= pts.length;
    let xx = 0, yy = 0, xy = 0;
    pts.forEach(([x, y]) => {
      xx += (x - mx) * (x - mx);
      yy += (y - my) * (y - my);
      xy += (x - mx) * (y - my);
    });
    const N = pts.length - 1;
    return [[xx / N, xy / N], [xy / N, yy / N]];
  }, [pts]);
  const sampleEig = useMemo(() => eigen2(sampleCov), [sampleCov]);

  const W = 420, H = 280, cx = W / 2, cy = H / 2, S = 34;
  const p = ([x, y]) => [cx + x * S, cy - y * S];

  // Ellipse: xᵀ A x = 1, parametrize.
  const ellipsePts = useMemo(() => {
    const out = [];
    // For A positive definite, level set is R · diag(1/√λ) · unit circle
    const R = rot2(theta);
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * 2 * Math.PI;
      const v = matVec2(R, [Math.cos(a) / Math.sqrt(l1), Math.sin(a) / Math.sqrt(l2)]);
      out.push(p(v));
    }
    return out;
  }, [A, theta, l1, l2]);

  // Principal axes
  const axisL1 = useMemo(() => {
    const v = matVec2(rot2(theta), [1, 0]);
    const l = 1 / Math.sqrt(l1);
    return { start: p([-v[0] * l * 1.1, -v[1] * l * 1.1]), end: p([v[0] * l * 1.1, v[1] * l * 1.1]) };
  }, [theta, l1]);
  const axisL2 = useMemo(() => {
    const v = matVec2(rot2(theta), [0, 1]);
    const l = 1 / Math.sqrt(l2);
    return { start: p([-v[0] * l * 1.1, -v[1] * l * 1.1]), end: p([v[0] * l * 1.1, v[1] * l * 1.1]) };
  }, [theta, l2]);

  return (
    <Card id="quad" icon={CircleDot} title="Quadratic forms & PCA · ellipsoids, covariance, principal axes" accent="cyan" index={8}>
      <MinSchema>
        A <Term>symmetric matrix</Term> A carves space into ellipsoid <Term>level sets</Term> <Eq>{'\\vect x^\\top A \\vect x = c'}</Eq>. Its <Term>eigenvectors</Term> are the <em>axes</em>; its <Term>eigenvalues</Term> set the axis (semi-)lengths (short = big λ, long = small λ).
      </MinSchema>

      <p>
        Drag the sliders: tweak eigenvalues λ₁, λ₂ and the orientation θ. The orange curve is the <Term>level set</Term> <Eq>{'\\vect x^\\top A\\vect x = 1'}</Eq> — an <Term>ellipsoid</Term> aligned with A's eigenvectors. The violet scatter is a cloud of samples drawn from a <Term>multivariate Gaussian</Term> with <em>covariance = A</em>. Those two objects are the <strong>same thing</strong>: data spreads out in the directions and amounts A prescribes.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* axes */}
          <line x1={0} y1={cy} x2={W} y2={cy} stroke="#27272a" />
          <line x1={cx} y1={0} x2={cx} y2={H} stroke="#27272a" />
          {/* scatter */}
          {pts.map(([x, y], i) => {
            const [px, py] = p([x, y]);
            return <circle key={i} cx={px} cy={py} r={2} fill="#c4b5fd" opacity={0.6} />;
          })}
          {/* ellipse (population) */}
          <polyline fill="none" stroke="#fbbf24" strokeWidth={1.8}
            points={ellipsePts.map(q => q.join(',')).join(' ')} />
          {/* principal axes (population) */}
          <line x1={axisL1.start[0]} y1={axisL1.start[1]} x2={axisL1.end[0]} y2={axisL1.end[1]}
            stroke="#f0abfc" strokeWidth={1.5} strokeDasharray="5 3" />
          <line x1={axisL2.start[0]} y1={axisL2.start[1]} x2={axisL2.end[0]} y2={axisL2.end[1]}
            stroke="#f0abfc" strokeWidth={1.5} strokeDasharray="5 3" />
          {/* sample covariance eigenvectors */}
          {sampleEig.real && (() => {
            const v1 = sampleEig.vecs[0]; const v2 = sampleEig.vecs[1];
            const s1 = Math.sqrt(Math.max(sampleEig.vals[0], 0));
            const s2 = Math.sqrt(Math.max(sampleEig.vals[1], 0));
            const L = 1.2;
            const [a1, a2] = [p([-v1[0] * s1 * L, -v1[1] * s1 * L]), p([v1[0] * s1 * L, v1[1] * s1 * L])];
            const [b1, b2] = [p([-v2[0] * s2 * L, -v2[1] * s2 * L]), p([v2[0] * s2 * L, v2[1] * s2 * L])];
            return (
              <>
                <line x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} stroke="#34d399" strokeWidth={2} />
                <line x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} stroke="#34d399" strokeWidth={2} />
              </>
            );
          })()}
          <text x={10} y={16} fontSize={10} fill="#fbbf24" fontFamily="monospace">orange: level set xᵀA x = 1</text>
          <text x={10} y={28} fontSize={10} fill="#c4b5fd" fontFamily="monospace">violet: samples from N(0, A)</text>
          <text x={10} y={40} fontSize={10} fill="#f0abfc" fontFamily="monospace">dashed: population axes (eigenvectors of A)</text>
          <text x={10} y={52} fontSize={10} fill="#34d399" fontFamily="monospace">green: principal components (eigenvectors of sample cov)</text>
        </svg>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono shrink-0 w-10">λ₁</span>
            <input type="range" min={0.1} max={6} step={0.05} value={l1}
              onChange={e => setL1(parseFloat(e.target.value))} className="flex-1" />
            <span className="font-mono text-amber-300 w-10 text-right">{l1.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono shrink-0 w-10">λ₂</span>
            <input type="range" min={0.1} max={6} step={0.05} value={l2}
              onChange={e => setL2(parseFloat(e.target.value))} className="flex-1" />
            <span className="font-mono text-amber-300 w-10 text-right">{l2.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono shrink-0 w-10">θ</span>
            <input type="range" min={0} max={Math.PI} step={0.02} value={theta}
              onChange={e => setTheta(parseFloat(e.target.value))} className="flex-1" />
            <span className="font-mono text-amber-300 w-10 text-right">{(theta * 180 / Math.PI).toFixed(0)}°</span>
          </div>
        </div>
      </div>

      <Worked title="PCA, demystified">
        Given N data points <Eq>{`\\vect{x_i}`}</Eq> in ℝᵈ, center them and form the <Term>covariance matrix</Term>:
        <Block>{`\\Sigma = \\frac{1}{N-1}\\sum_i (\\vect{x_i} - \\bar{\\vect{x}})(\\vect{x_i} - \\bar{\\vect{x}})^\\top.`}</Block>
        Σ is symmetric PSD. Compute its eigendecomposition <Eq>{'\\Sigma = Q\\Lambda Q^\\top'}</Eq>. The columns of Q (sorted by λ) are the <Term>principal components</Term>. Projecting data onto the top k of them gives the best k-dim linear summary (Eckart–Young again). In the widget above: green lines = principal components of the sample, dashed pink = population eigenvectors. They agree well for N = 260. That agreement gets arbitrarily tight as N → ∞; that's <em>why PCA works.</em>
      </Worked>

      <WhenItMatters>
        Whenever you reason about data spread, noise, or uncertainty in more than one dimension, you're implicitly reasoning about a positive-semidefinite matrix. Covariance, Fisher information, Hessian of a loss function near a minimum, Gram matrix of kernel methods — all symmetric PSD, all tell you "how does this vary in each direction?" via their eigendecomposition. Knowing to <em>think ellipsoidally</em> is the biggest single upgrade to your multivariate intuition.
      </WhenItMatters>

      <Misconception
        wrong='"PCA is a mysterious ML algorithm."'
        right='PCA is "find the ellipsoid that fits my data cloud, report its axes." That is it. The eigendecomposition of the sample covariance IS the algorithm.'
        because={`Seeing PCA this way demystifies all its quirks: it's invariant to rotations of the input (rotation just rotates the ellipsoid — axes follow). It's NOT invariant to rescaling axes (stretching one axis stretches the ellipsoid anisotropically — which is why you standardize features before PCA). It fails for nonlinear structure (a circle-shaped cloud has isotropic ellipse fit, λ₁≈λ₂ — "no preferred direction" — even though it has obvious nonlinear structure). Those aren't bugs, they're direct consequences of the ellipsoid picture.`}
      />

      <Deeper>
        <p>
          <strong>The <Term>spectral theorem</Term>.</strong> Every real symmetric matrix A has (i) all real eigenvalues, (ii) an orthonormal basis of eigenvectors. Equivalently: A = QΛQᵀ with Q orthogonal and Λ diagonal-real. This is the reason ellipsoid geometry works at all — axes are orthogonal and at well-defined lengths. In infinite dimensions (Hilbert spaces, quantum mechanics) the analogue is the spectral theorem for self-adjoint operators; same idea, more care needed with convergence.
        </p>
        <p>
          <strong>Positive-definiteness, and why it matters.</strong> A is <Term>positive definite</Term> when xᵀAx > 0 for all x ≠ 0 (equivalently, all eigenvalues are strictly positive). This is exactly the condition that makes A define a genuine inner product ⟨x, y⟩_A = xᵀAy, with a genuine "norm" ||x||_A = √(xᵀAx). Covariance matrices are positive <em>semi</em>definite (≥ 0); positive-definiteness is the generic case. When you see a matrix in the wild with xᵀAx ≥ 0, you're implicitly being handed a measurement of "size" customized to that matrix's geometry.
        </p>
        <p>
          <strong>Trade-off: PCA vs more flexible methods.</strong> PCA is fast, interpretable, closed-form, and optimal under a linear + Gaussian model. It fails when the structure is nonlinear (curves, clusters, manifolds). Remedies: kernel PCA (apply PCA in a nonlinearly transformed space), t-SNE / UMAP (nonlinear embeddings, no closed form, much worse theory, much better on images + text clusters), autoencoders (learn a nonlinear compression from data). Each trade-off is "flexibility vs guarantees"; PCA is the well-understood anchor everything else is compared against.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why are covariance matrices always symmetric?', a: 'Cov(X, Y) = E[(X − EX)(Y − EY)] = Cov(Y, X). The definition is symmetric in its arguments, so the (i, j) and (j, i) entries agree.' },
        { q: 'If one eigenvalue of Σ is zero, what does that mean about my data?', a: 'The data lies in a strict subspace — there is a direction in which it does not vary at all. Equivalently, there is an exact linear relationship among your variables (collinearity).' },
        { q: 'Can you do PCA on a rank-deficient covariance matrix?', a: 'Yes. The zero eigenvalues correspond to directions the data doesn\'t occupy; you simply keep only the eigenvectors with nonzero eigenvalues. This is exactly the low-rank approximation story.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — HIGH-DIMENSIONAL GEOMETRY (the multivariate-is-hard capstone)
   ============================================================================ */

// Closed-form ratio V_ball(d) / V_cube(d) = π^(d/2) / (2^d Γ(d/2 + 1))
// Γ(n/2 + 1) = (n/2)!  for even n; (n/2)·Γ(n/2) recursion otherwise
const gammaHalfPlusOne = (d) => {
  // returns Γ(d/2 + 1). Computed iteratively starting from Γ(1)=1 or Γ(1/2)=√π.
  if (d % 2 === 0) {
    // Γ((d/2)+1) = (d/2)!
    let k = d / 2;
    let r = 1;
    for (let i = 2; i <= k; i++) r *= i;
    return r;
  } else {
    // d odd. Γ(d/2+1) = Γ((d+2)/2). (d+2)/2 = (d/2)+1. Start from Γ(1/2)=√π, multiply up by halves.
    // Γ(x+1) = x Γ(x). Start at x=1/2, Γ=√π. We want Γ(d/2 + 1) so we go d/2 steps of +1 from x=1/2.
    // i.e. up to x = 1/2 + d/2 = (d+1)/2, then one more step (+1) gets us Γ((d+3)/2)... no wait.
    // We want Γ(d/2 + 1). The recursion: starting at x0 = 1/2 with Γ(x0) = √π,
    // Γ(x0 + 1) = x0 * Γ(x0) = (1/2)·√π = Γ(3/2)
    // Γ(3/2 + 1) = (3/2) * Γ(3/2) = Γ(5/2); etc.
    // We want to reach x_final = d/2 + 1; starting at 1/2, need (d/2 + 1 − 1/2) = (d+1)/2 steps.
    const steps = (d + 1) / 2;
    let x = 0.5, g = Math.sqrt(Math.PI);
    for (let i = 0; i < steps; i++) { g = x * g; x += 1; }
    return g;
  }
};
const ballCubeRatio = (d) => Math.pow(Math.PI, d / 2) / (Math.pow(2, d) * gammaHalfPlusOne(d));

// Fraction of d-ball volume in the outer (1-ρ) shell
const shellFrac = (d, rho = 0.9) => 1 - Math.pow(rho, d);

// Quick random-Gaussian angle histogram data (precomputed for a few d)
const anglesForDim = (d, N, seed = 7) => {
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) % 1000) / 1000; };
  const randN = () => {
    const u = 1 - rand(); const v = rand();
    return Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * v);
  };
  const gen = () => { const v = []; let sq = 0; for (let i = 0; i < d; i++) { const g = randN(); v.push(g); sq += g*g; } const n = Math.sqrt(sq) || 1; return v.map(x => x / n); };
  const angles = [];
  for (let i = 0; i < N; i++) {
    const a = gen(), b = gen();
    let dot = 0; for (let j = 0; j < d; j++) dot += a[j] * b[j];
    angles.push(Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI);
  }
  return angles;
};

const ShellPanel = () => {
  const [d, setD] = useState(20);
  const W = 320, H = 150, pad = 28;
  const f = shellFrac(d, 0.9);
  // Plot y = 1 - 0.9^x over x ∈ [1, 100]
  const pts = [];
  for (let x = 1; x <= 100; x++) {
    const y = 1 - Math.pow(0.9, x);
    pts.push([pad + (x - 1) / 99 * (W - 2 * pad), H - pad - y * (H - 2 * pad)]);
  }
  const [cx, cy] = [pad + (d - 1) / 99 * (W - 2 * pad), H - pad - f * (H - 2 * pad)];
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-cyan-300 mb-1">volume flees to the shell</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#475569" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#475569" />
        <polyline fill="none" stroke="#22d3ee" strokeWidth={1.8}
          points={pts.map(p => p.join(',')).join(' ')} />
        <circle cx={cx} cy={cy} r={4} fill="#fbbf24" />
        <text x={cx + 6} y={cy - 4} fontSize={10} fill="#fbbf24" fontFamily="monospace">{(f * 100).toFixed(1)}%</text>
        <text x={pad + 2} y={pad - 4} fontSize={9} fill="#94a3b8" fontFamily="monospace">fraction of ball volume in outer 10% shell</text>
        <text x={W - pad - 40} y={H - pad + 16} fontSize={9} fill="#94a3b8" fontFamily="monospace">dim d</text>
      </svg>
      <div className="mt-1 flex items-center gap-2 text-[10px]">
        <span className="text-neutral-400 font-mono shrink-0">d</span>
        <input type="range" min={1} max={100} step={1} value={d}
          onChange={e => setD(parseInt(e.target.value))} className="flex-1" />
        <span className="font-mono text-cyan-300 w-8 text-right">{d}</span>
      </div>
      <div className="mt-1 text-[10px] text-neutral-400 leading-snug">
        At d = 20, about <span className="text-amber-300 font-mono">{(shellFrac(20, 0.9) * 100).toFixed(0)}%</span> of a high-D ball's volume is in its outer 10% shell. At d = 100, essentially all of it — the interior is nearly empty. High-D balls are effectively spheres.
      </div>
    </div>
  );
};

const AnglesPanel = () => {
  const [d, setD] = useState(50);
  const angles = useMemo(() => anglesForDim(d, 600, 7), [d]);
  const bins = 30;
  const counts = new Array(bins).fill(0);
  angles.forEach(a => {
    const b = Math.min(bins - 1, Math.max(0, Math.floor(a / 180 * bins)));
    counts[b]++;
  });
  const maxC = Math.max(...counts, 1);
  const W = 320, H = 150, pad = 28;
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-cyan-300 mb-1">random vectors become nearly orthogonal</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#475569" />
        {counts.map((c, i) => {
          const x1 = pad + (i / bins) * (W - 2 * pad);
          const x2 = pad + ((i + 1) / bins) * (W - 2 * pad);
          const h = (c / maxC) * (H - 2 * pad);
          const y2 = H - pad;
          return <rect key={i} x={x1 + 0.5} y={y2 - h} width={x2 - x1 - 1} height={h}
            fill="#a78bfa" opacity={0.8} />;
        })}
        {/* 90° line */}
        <line x1={pad + (90 / 180) * (W - 2 * pad)} y1={pad} x2={pad + (90 / 180) * (W - 2 * pad)} y2={H - pad}
          stroke="#fbbf24" strokeWidth={1} strokeDasharray="3 3" />
        <text x={pad + (90 / 180) * (W - 2 * pad) + 4} y={pad + 10} fontSize={9} fill="#fbbf24" fontFamily="monospace">90°</text>
        <text x={pad} y={pad - 4} fontSize={9} fill="#94a3b8" fontFamily="monospace">histogram of angles between random unit vectors</text>
        <text x={pad} y={H - 4} fontSize={9} fill="#94a3b8" fontFamily="monospace">0°</text>
        <text x={W - pad - 16} y={H - 4} fontSize={9} fill="#94a3b8" fontFamily="monospace">180°</text>
      </svg>
      <div className="mt-1 flex items-center gap-2 text-[10px]">
        <span className="text-neutral-400 font-mono shrink-0">d</span>
        <input type="range" min={2} max={200} step={1} value={d}
          onChange={e => setD(parseInt(e.target.value))} className="flex-1" />
        <span className="font-mono text-cyan-300 w-8 text-right">{d}</span>
      </div>
      <div className="mt-1 text-[10px] text-neutral-400 leading-snug">
        At d = 2 the distribution is roughly uniform on [0°, 180°]. By d = 50 it is already a tight spike at 90°. Any two random high-D directions are "almost certainly perpendicular." This is why random projections preserve distances so well (<Term>Johnson–Lindenstrauss</Term>) — each dimension looks nearly independent of the others.
      </div>
    </div>
  );
};

const CubeBallPanel = () => {
  const [d, setD] = useState(3);
  const r = ballCubeRatio(d);
  const W = 320, H = 150, pad = 28;
  const pts = [];
  for (let x = 1; x <= 20; x++) {
    const y = ballCubeRatio(x);
    pts.push([pad + (x - 1) / 19 * (W - 2 * pad), H - pad - y * (H - 2 * pad)]);
  }
  const [cx, cy] = [pad + (d - 1) / 19 * (W - 2 * pad), H - pad - r * (H - 2 * pad)];
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-cyan-300 mb-1">cubes hide their mass in the corners</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#475569" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#475569" />
        <polyline fill="none" stroke="#f472b6" strokeWidth={1.8}
          points={pts.map(p => p.join(',')).join(' ')} />
        <circle cx={cx} cy={cy} r={4} fill="#fbbf24" />
        <text x={cx + 6} y={cy - 4} fontSize={10} fill="#fbbf24" fontFamily="monospace">{(r * 100).toFixed(r < 0.01 ? 3 : 1)}%</text>
        <text x={pad} y={pad - 4} fontSize={9} fill="#94a3b8" fontFamily="monospace">V(ball) / V(cube), unit-side</text>
      </svg>
      <div className="mt-1 flex items-center gap-2 text-[10px]">
        <span className="text-neutral-400 font-mono shrink-0">d</span>
        <input type="range" min={1} max={20} step={1} value={d}
          onChange={e => setD(parseInt(e.target.value))} className="flex-1" />
        <span className="font-mono text-cyan-300 w-8 text-right">{d}</span>
      </div>
      <div className="mt-1 text-[10px] text-neutral-400 leading-snug">
        In 2D the inscribed disk covers ~78% of the unit square. In 3D the sphere covers ~52% of the cube. By d = 10, the inscribed ball occupies <span className="text-amber-300 font-mono">{(ballCubeRatio(10) * 100).toFixed(3)}%</span> of the cube — the 2^10 = 1024 corners hold essentially <em>all</em> the volume. "Nearest neighbor in Euclidean distance" becomes meaningless: everything is in a corner far from everything else.
      </div>
    </div>
  );
};

const HighDimensionsCard = () => {
  return (
    <Card id="highd" icon={Telescope} title="High-dimensional geometry · your 3D intuition is actively lying to you" accent="cyan" index={9}>
      <MinSchema>
        In high dimensions, well-behaved functions concentrate tightly around their mean, random vectors become nearly orthogonal, and almost all volume lives in the outer shell or the corners. This is <Term>concentration of measure</Term> — the unifying force behind "multivariate is weird."
      </MinSchema>

      <p>
        Everything so far has used 2×2 pictures. Good for pedagogy, terrible for intuition about the settings where LA actually earns its keep — 1,000-dimensional embeddings, 10⁶-dimensional images, million-parameter layers. High-dimensional space doesn't just have "more room"; it's qualitatively strange. Three specific ways, each with a slider over dimension:
      </p>

      <div className="grid md:grid-cols-3 gap-3">
        <ShellPanel />
        <AnglesPanel />
        <CubeBallPanel />
      </div>

      <WhenItMatters>
        Every phenomenon on this card shows up in ML: <strong>volume in the shell</strong> is why sampling from a high-D standard normal gives vectors of roughly the same length (and why normalizing-flow training works). <strong>Random near-orthogonality</strong> is why you can stuff exponentially many near-distinct vectors into ℝᵈ and why <em>random projections</em> preserve distances. <strong>Ball-in-cube collapse</strong> is the single-sentence version of the "curse of dimensionality" — nearest-neighbor search breaks, and locality-sensitive hashing / ANN indices exist to patch it.
      </WhenItMatters>

      <Misconception
        wrong='"High-dimensional = just more directions to rotate through."'
        right='High-dimensional = geometry that contradicts 3D intuition. Lengths concentrate, angles concentrate, volumes go to the boundary, "distance to the nearest point" becomes nearly the same as "distance to the farthest point," and most of the mass of a high-D Gaussian is on a thin spherical shell at radius √d.'
        because={`This is why ML relies on LA machinery that feels heavy for 2D problems: PCA, SVD, kernel methods, Bayesian regularization. In 3D you could plot and squint; in 300D that is not an option and these tools are how you reason at all. Multivariate intuition isn't just "2D intuition with more axes" — it is a different beast, and the tools you built up in cards 1–8 are precisely what lets you reason about it without visuals.`}
      />

      <Deeper>
        <p>
          <strong>Concentration of measure, stated crisply.</strong> For a Lipschitz function f: S^(d-1) → ℝ on the unit sphere in d dimensions with Lipschitz constant L,
        </p>
        <Block>{`\\mathbb{P}(|f(\\vect{X}) - \\mathbb{E}f| > t) \\;\\leq\\; 2 \\exp\\!\\left(-\\frac{d\\,t^2}{2L^2}\\right).`}</Block>
        <p>
          In words: any well-behaved function of a high-D random unit vector is concentrated tightly (exponentially in d) around its mean. Corollaries: ||X||₂ is tightly concentrated around its typical value; dot products ⟨X, Y⟩ are tightly concentrated around 0; any smooth function of a Gaussian is very nearly constant. This single inequality is the reason so much of high-D ML "just works."
        </p>
        <p>
          <strong>Why PCA / SVD / eigen become essential (not optional) in high-D.</strong> In 3D you can visualize a point cloud and pick "interesting directions" by eye. In 1000D that is physically impossible — and you're rescued by the spectral theorem: A symmetric matrix has orthonormal eigenvectors, so the eigenbasis of the covariance matrix is a real, principled, mechanically findable coordinate system. PCA, SVD, kernel-PCA, the normal-matrix-of-features trick in GPs — all run on the same "spectral decomposition" trick in varying guises. Without it you are effectively blind in high dimensions.
        </p>
        <p>
          <strong>Johnson–Lindenstrauss, one sentence.</strong> Any n points in ℝ^D can be projected into k = O(log n / ε²) dimensions by a random Gaussian matrix while preserving all pairwise distances up to factor (1 ± ε). Practical consequence: even if your features are billion-dimensional, a few-hundred-dimensional random projection is distance-preserving. The proof is essentially the angles histogram above + a union bound. The fact that the <em>intrinsic</em> dimension is log(n), not D, is the quiet reason you can do ML on text, audio, and images at all.
        </p>
      </Deeper>

      <QA items={[
        { q: 'In a 100-D unit Gaussian, where is most of the probability mass concentrated?', a: 'On a thin spherical shell at radius √100 = 10. Density is maximized at the origin but volume at the origin is negligible; in high-D the "typical set" is on a shell, not at the mode. This is the single most counterintuitive consequence of concentration.' },
        { q: 'If I take two random vectors in 100-D (uniform on the unit sphere) what is the expected angle between them?', a: 'About 90°, with a standard deviation of roughly 1/√d radians ≈ 5.7°. The histogram of angles is a tight spike at 90° — essentially all pairs of random high-D directions are near-orthogonal.' },
        { q: 'Why does "nearest neighbor" struggle in high-D?', a: 'Because all points tend to be at roughly the same distance from any query point (distance concentrates). The ratio (max distance / min distance) across a dataset trends to 1 as d grows, so "nearest" carries less and less information.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — NEXT TRAILS
   ============================================================================ */

const NextTrails = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — adjacent topics, foundations, and siblings in this sandbox" accent="violet" index={10}>
    <MinSchema>
      Linear algebra sits under an enormous fraction of modern math, physics, ML, and engineering. The three most productive next moves: (1) go deeper <em>numerical/analytic</em> (how these objects are actually computed), (2) go deeper <em>abstract</em> (what linear algebra looks like in infinite dimensions or over different fields), (3) apply it in a new domain.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers',
        note: 'in this sandbox · clickable',
        items: [
          { label: 'Machine Learning', href: '#machine-learning', note: 'The biggest downstream user of everything in this explainer. Nearly every ML move is LA dressed up — embeddings, attention, regression, PCA, SGD all live here.' },
          { label: 'Quantum Mechanics', href: '#quantum-mechanics', note: 'LA in infinite-dimensional complex Hilbert spaces. Operators replace matrices, spectral theorem becomes eigenvalue-equation, inner products power the Born rule.' },
          { label: 'Reinforcement Learning', href: '#reinforcement-learning', note: 'Policy/value iteration are power iterations on stochastic matrices. Bellman equations are linear systems. Dominant eigenvectors define stationary distributions.' },
          { label: 'Systems Thinking', href: '#systems-thinking', note: 'Continuous-time dynamical systems ẋ = Ax are solved by eigendecomposition of A. Long-term behavior is controlled by the real parts of eigenvalues.' },
        ],
      },
      {
        title: 'Deepen inside LA',
        note: 'next layer of detail on things we only skimmed',
        items: [
          { label: 'Numerical linear algebra', note: 'How SVD, QR, LU, Cholesky are actually computed. Conditioning, stability, iterative methods (Krylov, Lanczos, Arnoldi). Trefethen & Bau is the textbook.' },
          { label: 'Jordan normal form & generalized eigenvectors', note: 'The fix for defective matrices. Essential for understanding linear ODEs with repeated roots.' },
          { label: 'Tensor decompositions', note: 'Multi-index generalizations of SVD — CP, Tucker, Tensor-Train. The natural tool for data with more than two indices (images, time-series panels, graph attention).' },
          { label: 'Matrix calculus', note: 'Derivatives of vector/matrix expressions w.r.t. vectors/matrices. Not a separate subject — just LA made rigorous about ∂/∂.' },
          { label: 'Randomized & sketching algorithms', note: 'How SVD / regression are done at billion-row scale. Random projection + small exact solve. The frontier of numerical LA.' },
          { label: 'Lie groups & rotations', note: 'The group of orthogonal/rotation matrices, with its infinitesimal generators (skew-symmetric matrices). How to parameterize and interpolate rotations without gimbal-lock.' },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'what LA itself sits on top of',
        items: [
          { label: 'Abstract algebra', note: 'Groups, rings, modules — the algebraic context vector spaces fit into. A vector space is a "module over a field"; generalizing to rings gives you lattices, codes, more.' },
          { label: 'Functional analysis', note: 'LA in infinite dimensions, with topology. Hilbert and Banach spaces, bounded operators, spectral theory for self-adjoint operators. The home of Fourier, PDE, quantum.' },
          { label: 'Differential geometry', note: 'Smooth manifolds are "locally ℝⁿ" with tangent vector spaces at every point. The Jacobian IS the tangent map; Riemannian metrics are smoothly varying inner products.' },
          { label: 'Category theory (sliver)', note: 'The category Vect of vector spaces and linear maps is one of the simplest non-trivial examples. Seeing LA this way is not necessary, but it makes the "linearity is functorial" idea precise.' },
          { label: 'Representation theory', note: 'Groups act on vector spaces via matrices. The structure of irreducible representations is pure eigendecomposition — decomposing into blocks the group action preserves.' },
        ],
      },
      {
        title: 'Zoom out',
        note: 'places LA shows up that people don\'t always label "LA"',
        items: [
          { label: 'Signal processing', note: 'DFT / DCT are orthogonal bases; filters are convolutions (linear maps); spectrograms are sliding PCAs. Digital audio, image compression, wireless — all LA.' },
          { label: 'Graphs', note: 'Adjacency / Laplacian matrices. Their eigenvalues (spectral graph theory) tell you about connectivity, clustering, and diffusion dynamics. GNNs are just linear algebra on Laplacians.' },
          { label: 'Optimization', note: 'Quadratic programming, SDPs, Newton\'s method all turn on symmetric PSD matrices. Convexity ↔ Hessians ≽ 0. SDPs generalize all of it.' },
          { label: 'Control theory', note: 'Linear state-space models ẋ = Ax + Bu. Stability, controllability, observability are all eigenvalue and rank conditions on assemblies of A, B, C.' },
          { label: 'Statistics & econometrics', note: 'Least squares, PCA, factor models, state-space filters (Kalman), mixed-effects models — LA the whole way down.' },
          { label: 'Computer graphics', note: 'Transforms (translation, rotation, scale, perspective) as 4×4 matrices. Normals transform by the inverse-transpose. Shading, projection, all LA.' },
        ],
      },
    ]} />
  </Card>
);

/* ============================================================================
   FOOTER
   ============================================================================ */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>see also:</span>
        <span className="text-sky-300">Axler · Linear Algebra Done Right</span>
        <span className="text-violet-300">Strang · Linear Algebra & Its Applications</span>
        <span className="text-emerald-300">Trefethen & Bau · Numerical LA</span>
        <span className="text-amber-300">3Blue1Brown · Essence of LA</span>
        <span className="text-fuchsia-300">Boyd · Intro to Applied LA</span>
      </div>
      <p className="max-w-xl mx-auto">
        The matrix M that threaded cards 2–7 is a single 2×2: <span className="font-mono text-fuchsia-300">M = [[1.6, 0.8], [0.4, 1.2]]</span>. Its eigenvalues are 2 and 0.8, its determinant is 1.6, its singular values are ≈2.05 and ≈0.78 — properties you watched different cards read off the same object. That's the whole point.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ============================================================================ */

export default function LinearAlgebraExplainer() {
  return (
    <MatrixProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <style>{`
          .eq-inline .katex { font-size: 1em; }
          .keq-display .katex-display { margin: 0; }
        `}</style>

        <Hero />
        <SectionNav />

        <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
          <VectorSpaces />
          <BasisChange />
          <LinearMaps />
          <RankNullCol />
          <Determinant />
          <EigenCard />
          <SVDCard />
          <QuadraticCard />
          <HighDimensionsCard />
          <NextTrails />
        </main>

        <Footer />
      </div>
    </MatrixProvider>
  );
}

