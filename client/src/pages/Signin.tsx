import { motion } from "framer-motion";
import { Activity, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "@/components/Navbar";

// Google SVG Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.23v2.84C4.13 20.49 7.8 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.23C1.46 8.55 1 10.22 1 12s.46 3.45 1.23 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.8 1 4.13 3.49 2.23 7.07l3.61 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Signin() {
  const { loginWithGitHub, loginWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-[#161b2c] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-baby-blue" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              Scrub<span className="text-baby-blue">In</span>
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono-data">Advanced Surgical Simulator</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white mb-2">Sign in to save your progress</h1>
              <p className="text-sm text-gray-400">
                Track your rank, XP, certifications, and surgery history across every session.
              </p>
            </div>

            {/* Google Sign In Button */}
            <Button
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg flex items-center justify-center gap-3 transition-all border border-gray-200"
            >
              <GoogleIcon className="w-5 h-5" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#161b2c] text-gray-500">or</span>
              </div>
            </div>

            {/* GitHub Sign In Button */}
            <Button
              onClick={loginWithGitHub}
              disabled={loading}
              className="w-full h-12 bg-[#24292e] hover:bg-[#2d333b] text-white font-semibold rounded-lg flex items-center justify-center gap-3 transition-all border border-gray-600"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>

            <p className="text-[10px] text-center text-gray-500 mt-6 leading-relaxed">
              We only use your name and profile picture. No medical data is stored.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
