/**
 * ScrubIn Signin v2.0 - Heavy Animations
 */
import { motion } from "framer-motion";
import { Activity, Github, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Signin() {
  const { loginWithGitHub } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute w-[900px] h-[900px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #7EC8E3 0%, transparent 70%)", top: "-20%", right: "-10%" }} animate={{ x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 25, repeat: Infinity }} />
        <motion.div className="absolute w-[800px] h-[800px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #5DCAA5 0%, transparent 70%)", bottom: "-10%", left: "-5%" }} animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.3, 1], rotate: [360, 180, 0] }} transition={{ duration: 30, repeat: Infinity }} />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ background: i % 2 === 0 ? '#7EC8E3' : '#5DCAA5', boxShadow: `0 0 10px ${i % 2 === 0 ? '#7EC8E3' : '#5DCAA5'}` }}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
            animate={{ y: Math.random() * -200 - 100, opacity: [0, 0.8, 0], x: Math.random() * window.innerWidth }}
            transition={{ duration: Math.random() * 15 + 15, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-10 glass-card-pro text-center relative overflow-hidden group">
          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Logo animation */}
            <motion.div
              className="w-24 h-24 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-8 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              whileHover={{ scale: 1.2, rotate: 180 }}
            >
              <Activity className="w-12 h-12 text-primary" />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-mono-data text-primary font-semibold">Welcome to ScrubIn</span>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Begin Your <span className="text-gradient">Journey</span>
            </motion.h1>

            <motion.p 
              className="text-muted-foreground mb-10 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sign in to track your progress and achievements
            </motion.p>

            {/* Signin Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={loginWithGitHub}
                  className="w-full h-16 bg-white hover:bg-gray-100 text-black font-bold text-lg rounded-2xl gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.3)] transition-all duration-300"
                >
                  <Github className="w-6 h-6" />
                  Continue with GitHub
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Features */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: Activity, text: "Track Progress" },
                { icon: Activity, text: "Earn XP" },
                { icon: Activity, text: "Unlock Procedures" }
              ].map((feature, i) => (
                <motion.div
                  key={feature.text}
                  className="text-center"
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-mono-data">{feature.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
