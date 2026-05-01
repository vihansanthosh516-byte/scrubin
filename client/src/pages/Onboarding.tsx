import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Briefcase } from "lucide-react";

const PROFESSIONS = [
  "Medical Student",
  "Resident",
  "Fellow",
  "Attending Surgeon",
  "Nurse Practitioner",
  "Physician Assistant",
  "Other"
];

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [profession, setProfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill with OAuth data
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !displayName || !profession) return;
    setIsSubmitting(true);
    completeOnboarding({ displayName, profession });
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#0a0f1e] z-50 flex items-center justify-center p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-gradient-shift" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              delay: Math.random() * 2 
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl p-8 bg-card/95 backdrop-blur-xl border border-border shadow-[0_0_60px_rgba(126,200,227,0.2)]">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
              className="w-20 h-20 rounded-2xl border-2 border-primary/40 overflow-hidden mx-auto mb-4 bg-muted shadow-[0_0_20px_rgba(126,200,227,0.3)]"
            >
              <img
                src={user?.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Complete Your Profile
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm"
            >
              Let's set up your surgeon identity
            </motion.p>
          </div>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dr. House"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-muted border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  maxLength={30}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-white mb-2">
                Profession / Rank
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full h-12 pl-11 pr-10 rounded-xl bg-muted border border-border text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-muted text-muted-foreground">Select your current role</option>
                  {PROFESSIONS.map(p => (
                    <option key={p} value={p} className="bg-background text-white">{p}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <Button
                onClick={handleSubmit}
                disabled={!displayName || !profession || isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                ) : (
                  <>
                    Start Operating
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
