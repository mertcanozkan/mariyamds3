'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';

export interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => Promise<void>;
  onGoogleSignIn?: () => void;
}

interface VideoBackgroundProps {
  videoUrl: string;
}

// VideoBackground Component
export const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — static overlay still looks fine
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Multi-layer overlay: deep dark at bottom for card contrast, subtle amber vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/75 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
      <video
        ref={videoRef}
        className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
};

// Main LoginForm Component
export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(email, password, remember);
      setIsSuccess(true);
    } catch {
      // Error handled by parent (toast shown there)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl backdrop-blur-xl bg-black/55 border border-white/12 shadow-2xl shadow-black/60">

      {/* ── Header ── */}
      <div className="mb-8 text-center">
        {/* Amber rule */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/60" />
          <span className="text-amber-400/80 text-xs uppercase tracking-[0.25em] font-dm font-medium">
            Welcome back
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/60" />
        </div>

        <h2 className="font-playfair text-3xl font-semibold text-white tracking-wide leading-tight">
          Mariyam<span className="text-amber-400">DS</span>
        </h2>
        <p className="text-white/50 text-sm font-dm mt-2">
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Mail className="text-white/40" size={16} />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-white/35 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-all duration-200 text-sm font-dm"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Lock className="text-white/40" size={16} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-11 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-white/35 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-all duration-200 text-sm font-dm"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 cursor-pointer ${remember ? 'bg-amber-500' : 'bg-white/15'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${remember ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span
              onClick={() => setRemember(!remember)}
              className="text-sm text-white/60 group-hover:text-white/80 transition-colors select-none font-dm"
            >
              Remember me
            </span>
          </label>
          <a href="/forgot-password" className="text-xs text-white/50 hover:text-amber-300 transition-colors font-dm">
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg mt-1 font-dm ${
            isSuccess
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/25 hover:shadow-amber-400/40 hover:-translate-y-0.5 transform'
          }`}
        >
          {isSubmitting ? 'Signing in…' : isSuccess ? 'Welcome back!' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="border-t border-white/10 absolute w-full" />
        <span className="relative bg-transparent px-4 text-white/35 text-xs uppercase tracking-widest font-dm">
          or continue with
        </span>
      </div>

      {/* Google sign-in */}
      {onGoogleSignIn && (
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/6 border border-white/12 rounded-xl text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 text-sm font-dm font-medium"
        >
          <Chrome size={16} />
          Continue with Google
        </button>
      )}

      <p className="mt-6 text-center text-xs text-white/45 font-dm">
        Don&apos;t have an account?{' '}
        <a href="/register" className="font-semibold text-white/80 hover:text-amber-300 transition-colors">
          Create Account
        </a>
      </p>
    </div>
  );
};

export default { LoginForm, VideoBackground };
