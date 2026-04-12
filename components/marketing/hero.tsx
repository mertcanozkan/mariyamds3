"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp, Award, Star, MapPin, Clock, CheckCircle, Shield } from "lucide-react";

// Marquee row — qualifications & affiliations
const AFFILIATIONS = [
  { label: "DVSA Approved",        icon: Award },
  { label: "Pass Plus Registered", icon: CheckCircle },
  { label: "4.9 ★ Google Rating",  icon: Star },
  { label: "All London Zones",     icon: MapPin },
  { label: "Flexible Scheduling",  icon: Clock },
  { label: "DBS Checked",          icon: Shield },
] as const;

type Point = { x: number; y: number };

interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

// ─── Canvas wave background ───────────────────────────────────────────────────
function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Resolve CSS custom property to a canvas-safe rgba string.
    // Works for both HSL-channel variables (e.g. --primary) and hex variables
    // (e.g. --theme-accent-hex) by evaluating them via a temp element.
    const resolve = (variable: string, alpha = 1): string => {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;visibility:hidden;width:1px;height:1px;background-color:var(${variable})`;
      document.body.appendChild(el);
      const computed = getComputedStyle(el).backgroundColor;
      document.body.removeChild(el);
      if (!computed || computed === "rgba(0, 0, 0, 0)") return `rgba(255,255,255,${alpha})`;
      if (alpha >= 1) return computed;
      const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? `rgba(${m[1]},${m[2]},${m[3]},${alpha})` : computed;
    };

    const buildTheme = () => ({
      bgTop:    resolve("--theme-from", 1),
      bgBottom: resolve("--theme-to",   1),
      waves: [
        // Amber accent — primary glow wave
        { offset: 0,              amplitude: 72, frequency: 0.003,  color: resolve("--theme-accent-hex", 0.75), opacity: 0.45 },
        // Lighter amber — secondary shimmer
        { offset: Math.PI / 2,   amplitude: 95, frequency: 0.0026, color: resolve("--theme-accent-hex", 0.50), opacity: 0.30 },
        // White/silver — subtle crest
        { offset: Math.PI,       amplitude: 55, frequency: 0.0034, color: resolve("--primary-foreground", 0.35), opacity: 0.22 },
        // Faint navy lighter tone — depth wave
        { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: resolve("--theme-mid", 0.90),        opacity: 0.18 },
        // Ultra-faint wide wave
        { offset: Math.PI * 2,   amplitude: 50, frequency: 0.004,  color: resolve("--theme-accent-hex", 0.30), opacity: 0.15 },
      ] satisfies WaveConfig[],
    });

    let theme = buildTheme();

    const observer = new MutationObserver(() => { theme = buildTheme(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseInfluence  = reduced ? 12  : 65;
    const influenceRadius = reduced ? 160 : 320;
    const smoothing       = reduced ? 0.04 : 0.1;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const recenter = () => {
      const c = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = { ...c };
      targetRef.current = { ...c };
    };

    resize();
    recenter();

    const onResize      = () => { resize(); recenter(); };
    const onMouseMove   = (e: MouseEvent) => { targetRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave  = () => recenter();

    window.addEventListener("resize",      onResize);
    window.addEventListener("mousemove",   onMouseMove);
    window.addEventListener("mouseleave",  onMouseLeave);

    const drawWave = (wave: WaveConfig) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const infl = Math.max(0, 1 - dist / influenceRadius);
        const mouseEffect = infl * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset);
        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) +
          mouseEffect;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineWidth    = 2.5;
      ctx.strokeStyle  = wave.color;
      ctx.globalAlpha  = wave.opacity;
      ctx.shadowBlur   = 38;
      ctx.shadowColor  = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * smoothing;

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, theme.bgTop);
      grad.addColorStop(1, theme.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      theme.waves.forEach(drawWave);

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize",     onResize);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section
      className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden"
      role="region"
      aria-label="Hero"
    >
      {/* Animated canvas waves — fills full background */}
      <WaveCanvas />

      {/* Noise texture */}
      <div className="absolute inset-0 z-[2] noise-overlay pointer-events-none opacity-30" aria-hidden="true" />

      {/* Glow blobs layered above canvas */}
      <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.18] animate-float"
          style={{ background: "var(--theme-accent-hex)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[340px] h-[340px] rounded-full blur-3xl opacity-[0.10]"
          style={{ background: "var(--theme-accent-hex)" }}
        />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border border-white/[0.04] animate-spin-slow" />
        <div className="absolute top-1/2 -left-24 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-white/[0.03] animate-spin-slow" />
      </div>

      {/* Main content grid */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">

          {/* ── Left column ─────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-4">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-md"
                style={{
                  background: "var(--theme-accent-subtle)",
                  borderColor: "color-mix(in srgb, var(--theme-accent-hex) 35%, transparent)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "var(--theme-accent-hex)" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: "var(--theme-accent-hex)" }}
                  />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-accent-hex)" }}>
                  DVSA Approved · London
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-playfair text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-[1.0]"
              style={{
                maskImage: "linear-gradient(180deg, white 0%, white 78%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(180deg, white 0%, white 78%, transparent 100%)",
              }}
            >
              Pass Your Test<br />
              <span className="italic" style={{ color: "var(--theme-accent-hex)" }}>
                with Confidence
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="max-w-xl text-lg text-white/60 leading-relaxed"
            >
              Professional driving instruction across London. DVSA-approved instructors,
              flexible scheduling, and a proven pass rate that speaks for itself.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] shadow-xl shadow-black/20"
                style={{ background: "var(--theme-accent-hex)", color: "hsl(var(--accent-foreground))" }}
              >
                Book Your First Lesson
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#courses"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/[0.14] hover:border-white/25"
              >
                View Our Courses
              </Link>
            </motion.div>
          </div>

          {/* ── Right column ─────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5 lg:mt-10">

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl shadow-2xl"
            >
              <div
                className="absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ background: "var(--theme-accent-hex)" }}
              />

              <div className="relative z-10">
                {/* Primary stat */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">500+</div>
                    <div className="text-sm text-white/50">Students Passed</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2.5 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">First-Time Pass Rate</span>
                    <span className="text-white font-semibold">94%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(to right, var(--theme-accent-hex), color-mix(in srgb, var(--theme-accent-hex) 55%, white))" }}
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.2, delay: 1.0, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xl font-bold text-white sm:text-2xl">15+</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Years Exp.</span>
                  </div>
                  <div className="w-px bg-white/10 mx-auto h-full" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xl font-bold text-white sm:text-2xl">4.9</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Rating</span>
                  </div>
                  <div className="w-px bg-white/10 mx-auto h-full" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xl font-bold text-white sm:text-2xl">All</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">London</span>
                  </div>
                </div>

                {/* Tag pills */}
                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-medium tracking-wide text-white/70">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    ACCEPTING STUDENTS
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium tracking-wide"
                    style={{
                      borderColor: "color-mix(in srgb, var(--theme-accent-hex) 35%, transparent)",
                      background:  "var(--theme-accent-subtle)",
                      color:       "var(--theme-accent-hex)",
                    }}
                  >
                    <Award className="w-3 h-3" />
                    DVSA APPROVED
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Affiliations marquee card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.7 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] py-7 backdrop-blur-xl"
            >
              <h3 className="mb-5 px-7 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                Qualifications &amp; Affiliations
              </h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
                }}
              >
                <div className="animate-marquee flex gap-10 whitespace-nowrap px-4">
                  {[...AFFILIATIONS, ...AFFILIATIONS, ...AFFILIATIONS].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/35 transition-colors hover:text-white/80">
                      <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: "var(--theme-accent-hex)" }} />
                      <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/25 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
