import { motion } from "framer-motion";
import { Activity, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function Signin() {
  const { login, loading } = useAuth();

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
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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

            <Button 
              onClick={login}
              disabled={loading}
              className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg flex items-center justify-center gap-3 transition-all"
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
