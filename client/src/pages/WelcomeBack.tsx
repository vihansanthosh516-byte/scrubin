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
    <div role="dialog" aria-modal="true" aria-label="Welcome back" className="fixed inset-0 bg-[#161310] z-50 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-sm p-8 bg-[#1E1A16] border border-[#3A342C] shadow-[0_0_40px_rgba(204,85,61,0.15)]">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-24 h-24 rounded-sm border-2 border-primary/40 overflow-hidden mx-auto mb-4 bg-[#26211B]"
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
              <CheckCircle className="w-5 h-5 text-[#2E6B4B]" />
              <span className="text-sm font-medium text-[#2E6B4B]">Account Found</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-[#EDEAE4] mb-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {user.name || user.login}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#A89F95] text-sm"
            >
              @{user.customUsername || user.login}
            </motion.p>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#26211B] border border-[#3A342C] rounded-sm p-4 mb-6"
          >
            <div className="flex items-center gap-3 text-sm text-[#A89F95]">
              <div className="w-2 h-2 rounded-full bg-[#2E6B4B]" />
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
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-sm flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Yes, It's Me
            </Button>

            <Button
              onClick={onNotYou}
              variant="outline"
              className="w-full h-12 border-[#3A342C] hover:border-primary/30 hover:bg-primary/5 text-[#A89F95] hover:text-[#EDEAE4] font-medium rounded-sm transition-all"
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
          className="text-center text-xs text-[#A89F95] mt-6"
        >
          Click "Yes, It's Me" to continue to your profile
        </motion.p>
      </motion.div>
    </div>
  );
}
