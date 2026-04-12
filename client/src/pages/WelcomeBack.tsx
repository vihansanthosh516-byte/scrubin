/**
 * ScrubIn Welcome Back — Returning user confirmation
 * Shows "Is this you?" with stored credentials for returning users
 */
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

interface WelcomeBackProps {
  onConfirm: () => void;
  onNotYou: () => void;
}

export default function WelcomeBack({ onConfirm, onNotYou }: WelcomeBackProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-[#0a0f1e] z-50 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl p-8 bg-card/95 backdrop-blur-xl border border-border shadow-[0_0_40px_rgba(126,200,227,0.15)]">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-24 h-24 rounded-2xl border-2 border-primary/40 overflow-hidden mx-auto mb-4 bg-muted"
            >
              <img
                src={user?.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-2"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Account Found</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {user.name || user.login}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm"
            >
              @{user.customUsername || user.login}
            </motion.p>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-muted/50 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Your surgery history and XP are saved</span>
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              onClick={onConfirm}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Yes, It's Me
            </Button>

            <Button
              onClick={onNotYou}
              variant="outline"
              className="w-full h-12 border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-foreground font-medium rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
              Not You? Change Name
            </Button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Click "Yes, It's Me" to continue to your profile
        </motion.p>
      </motion.div>
    </div>
  );
}
