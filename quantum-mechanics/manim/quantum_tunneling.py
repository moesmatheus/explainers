"""
Quantum tunneling visualised as a real Schrödinger wave packet hitting a
rectangular barrier (split-step Fourier evolution, atomic units ℏ = m = 1).

Render at production quality:
    manim -qh quantum_tunneling.py QuantumTunneling
"""

from manim import *
import numpy as np

# Colors matched to the React explainer's palette
COL_PSI    = "#7dd3fc"   # sky-300       — wavefunction / |ψ|²
COL_BAR    = "#fcd34d"   # amber-300     — potential barrier
COL_E      = "#f9a8d4"   # pink-300      — energy line
COL_DIM    = "#9ca3af"   # neutral-400   — axes / labels
COL_REFL   = "#fb7185"   # rose-400      — reflected probability
COL_TRANS  = "#86efac"   # green-300     — transmitted probability


def evolve_wavepacket():
    """Pre-compute |ψ(x,t)|² snapshots via the split-step Fourier method.

    Tuned so the barrier transmits ~5 %: visible but clearly suppressed,
    matching the e^{-2κL} exponential-decay regime.
    """
    # Spatial grid
    L_box = 30.0
    N = 1024
    x = np.linspace(-L_box / 2, L_box / 2, N, endpoint=False)
    dx = x[1] - x[0]

    # Rectangular barrier
    a, b = 2.0, 2.6                              # barrier from x=a to x=b
    V0 = 22.0
    V = np.where((x >= a) & (x <= b), V0, 0.0)

    # Initial Gaussian wave packet, mean momentum k0 → kinetic energy k0²/2
    x0, sigma, k0 = -8.0, 1.0, 6.0
    psi = (1.0 / (np.pi * sigma**2) ** 0.25) \
        * np.exp(-(x - x0) ** 2 / (2 * sigma**2)) \
        * np.exp(1j * k0 * x)

    # Time-stepping
    dt = 0.002
    n_frames = 200
    steps_per_frame = 8

    # k-space grid (with FFT ordering)
    k = 2.0 * np.pi * np.fft.fftfreq(N, d=dx)
    half_V = np.exp(-1j * V * (dt / 2.0))         # half-step in position
    full_K = np.exp(-1j * 0.5 * k**2 * dt)        # full-step in momentum

    prob = np.empty((n_frames, N), dtype=np.float64)
    for f in range(n_frames):
        prob[f] = (psi.real ** 2 + psi.imag ** 2)
        for _ in range(steps_per_frame):
            psi = half_V * psi
            psi = np.fft.ifft(full_K * np.fft.fft(psi))
            psi = half_V * psi

    # Diagnostics for live counters
    in_barrier = (x >= a) & (x <= b)
    p_trans = np.array([np.sum(p[x > b]) * dx for p in prob])
    p_refl  = np.array([np.sum(p[x < a]) * dx for p in prob])
    return x, prob, V, (a, b, V0, k0), (p_refl, p_trans)


class QuantumTunneling(Scene):
    def construct(self):
        self.camera.background_color = "#0a0a0a"

        # ------ Pre-compute the physics ------------------------------------
        x, prob, V, (a, b, V0, k0), (p_refl, p_trans) = evolve_wavepacket()
        n_frames = prob.shape[0]
        # Subsample for fast curve building (256 points is smooth at this scale)
        stride = max(1, len(x) // 256)
        x_plot = x[::stride]
        prob_plot = prob[:, ::stride]

        # ------ Title -----------------------------------------------------
        title = Text("Quantum Tunneling", font_size=44, weight=BOLD)
        subtitle = Text(
            "A wave packet meets a barrier it classically cannot cross",
            font_size=22, color=COL_DIM,
        )
        header = VGroup(title, subtitle).arrange(DOWN, buff=0.18).to_edge(UP, buff=0.4)
        self.play(FadeIn(title, shift=DOWN * 0.2))
        self.play(FadeIn(subtitle, shift=DOWN * 0.1))

        # ------ Axes ------------------------------------------------------
        ax = Axes(
            x_range=[-12, 12, 4],
            y_range=[0, 0.6, 0.2],
            x_length=12,
            y_length=3.6,
            tips=False,
            axis_config={"color": COL_DIM, "stroke_width": 1.5,
                          "include_numbers": False},
        ).shift(DOWN * 0.6)
        x_label = MathTex("x", font_size=28, color=COL_DIM).next_to(
            ax.x_axis.get_right(), DOWN, buff=0.15
        )
        # Park y-label OUTSIDE the chart, just above the top-left corner —
        # this guarantees it never collides with in-chart elements.
        y_label = MathTex(r"|\psi(x,t)|^2", font_size=30, color=COL_PSI)
        y_label.next_to(ax, UP, buff=0.15).align_to(ax, LEFT).shift(RIGHT * 0.2)
        self.play(Create(ax), FadeIn(x_label), FadeIn(y_label))

        # ------ Barrier ---------------------------------------------------
        # Visual height of the barrier rectangle is decoupled from V₀ so it
        # always reads as "tall enough"; energy line sits below it.
        bar_top = 0.55
        bar_bl = ax.c2p(a, 0)
        bar_tr = ax.c2p(b, bar_top)
        barrier = Rectangle(
            width=bar_tr[0] - bar_bl[0],
            height=bar_tr[1] - bar_bl[1],
            stroke_color=COL_BAR,
            stroke_width=2,
            fill_color=COL_BAR,
            fill_opacity=0.22,
        ).move_to(((np.array(bar_bl) + np.array(bar_tr)) / 2))
        bar_lbl = MathTex(r"V_0", font_size=30, color=COL_BAR).next_to(
            barrier, UP, buff=0.1
        )

        # Energy line: drawn at a fixed visual height (decoupled from V₀'s
        # numerical value) — kept low so labels can sit safely above it.
        E_visual = 0.28
        # Trim the line so it doesn't run into the right-hand counters.
        e_line = DashedLine(
            ax.c2p(-12, E_visual), ax.c2p(8.5, E_visual),
            color=COL_E, stroke_width=1.6, dash_length=0.12,
        )
        e_lbl = MathTex(r"E < V_0", font_size=24, color=COL_E).next_to(
            e_line.get_start(), UP, buff=0.08
        ).shift(RIGHT * 0.4)
        self.play(FadeIn(barrier), FadeIn(bar_lbl), Create(e_line), FadeIn(e_lbl))

        # ------ |ψ|² curve, gradient-filled --------------------------------
        # Re-scale probability density so the max wave-packet amplitude fits
        # comfortably below the barrier top.
        scale = 0.42 / prob_plot[0].max()
        time_t = ValueTracker(0.0)

        def build_curve():
            f = int(np.clip(time_t.get_value(), 0, n_frames - 1))
            y = prob_plot[f] * scale
            pts = [ax.c2p(xi, yi) for xi, yi in zip(x_plot, y)]
            curve = VMobject(stroke_color=COL_PSI, stroke_width=3.0)
            curve.set_points_as_corners(pts)
            curve.make_smooth()
            return curve

        def build_fill():
            f = int(np.clip(time_t.get_value(), 0, n_frames - 1))
            y = prob_plot[f] * scale
            pts = [ax.c2p(xi, yi) for xi, yi in zip(x_plot, y)]
            base_l = ax.c2p(x_plot[0], 0)
            base_r = ax.c2p(x_plot[-1], 0)
            poly = VMobject(
                stroke_width=0,
                fill_color=COL_PSI,
                fill_opacity=0.18,
            )
            poly.set_points_as_corners([base_l, *pts, base_r, base_l])
            return poly

        psi_fill = always_redraw(build_fill)
        psi_curve = always_redraw(build_curve)
        self.add(psi_fill, psi_curve)

        # ------ Live transmission / reflection counters -------------------
        # Anchor ABOVE the chart (scene coords), top-right — keeps them
        # clear of both axis ticks below and the energy line inside.
        anchor_TR = ax.get_corner(UR) + UP * 0.15
        counter_R = always_redraw(lambda: MathTex(
            r"P_\text{refl}\, = " + f"{p_refl[int(np.clip(time_t.get_value(), 0, n_frames-1))]*100:5.2f}\\%",
            font_size=26, color=COL_REFL,
        ).move_to(anchor_TR).align_to(anchor_TR, RIGHT + DOWN))
        counter_T = always_redraw(lambda: MathTex(
            r"P_\text{trans} = " + f"{p_trans[int(np.clip(time_t.get_value(), 0, n_frames-1))]*100:5.2f}\\%",
            font_size=26, color=COL_TRANS,
        ).next_to(counter_R, LEFT, buff=0.6, aligned_edge=DOWN))
        self.add(counter_T, counter_R)

        # ------ Animate ---------------------------------------------------
        self.play(
            time_t.animate.set_value(n_frames - 1),
            run_time=10,
            rate_func=linear,
        )
        self.wait(0.6)

        # ------ Punch-line equation ---------------------------------------
        equation = MathTex(
            r"T \;\approx\; e^{-2\kappa L}",
            r",\qquad",
            r"\kappa \;=\; \tfrac{1}{\hbar}\sqrt{2m(V_0 - E)}",
            font_size=36,
        )
        equation[0].set_color(COL_TRANS)            # whole "T ≈ e^{-2κL}" green
        equation[2].set_color(WHITE)                # κ definition in white
        equation.next_to(ax, DOWN, buff=0.7)

        self.play(FadeIn(equation, shift=UP * 0.2))
        self.wait(2.5)
