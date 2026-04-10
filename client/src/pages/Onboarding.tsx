/**
 * ScrubIn Onboarding — First-time user setup
 * Collects display name and username after OAuth sign-in
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, AtSign, AlertCircle, CheckCircle } from "lucide-react";

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill with OAuth data
  useEffect(() => {
    if (user) {
      setDisplayName(user.name?.split(" ")[0] || "");
      setUsername(user.login || "");
    }
  }, [user]);

  // Check username availability (debounced)
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem("scrubin_usernames") || "{}");
      const isAvailable = !existingUsers[username.toLowerCase()] || existingUsers[username.toLowerCase()] === user?.id;
      setUsernameAvailable(isAvailable);
    }, 300);

    return () => clearTimeout(timer);
  }, [username, user?.id]);

  const handleSubmit = async () => {
    if (!user || !username || !displayName) return;
    if (username.length < 3 || !usernameAvailable) return;

    setIsSubmitting(true);

    // Save username mapping
    const existingUsers = JSON.parse(localStorage.getItem("scrubin_usernames") || "{}");
    existingUsers[username.toLowerCase()] = user.id;
    localStorage.setItem("scrubin_usernames", JSON.stringify(existingUsers));

    // Complete onboarding - this will update user and redirect
    completeOnboarding({ displayName, username });
  };

  const usernameValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

  // Don't render if no user
  if (!user) {
    return null;
  }

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
              className="w-20 h-20 rounded-2xl border-2 border-primary/40 overflow-hidden mx-auto mb-4 bg-muted"
            >
              <img
                src={user?.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Complete Your Profile
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm"
            >
              Let's set up your surgeon identity
            </motion.p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Display Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-white mb-2">
                Display Name
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
              <p className="text-xs text-muted-foreground mt-1.5">
                This is how others will see you
              </p>
            </motion.div>

            {/* Username */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="surgeon123"
                  className={`w-full h-12 pl-11 pr-10 rounded-xl bg-muted border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                    username.length > 0 && !usernameValid
                      ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/30"
                      : usernameAvailable === true
                      ? "border-emerald-400/50 focus:border-emerald-400 focus:ring-emerald-400/30"
                      : "border-border focus:border-primary/50 focus:ring-primary/30"
                  }`}
                  maxLength={20}
                />
                {username.length >= 3 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameAvailable === true ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : usernameAvailable === false ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : null}
                  </div>
                )}
              </div>
              {username.length > 0 && !usernameValid && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  3-20 characters, letters, numbers, and underscores only
                </p>
              )}
              {username.length >= 3 && usernameAvailable === false && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Username is already taken
                </p>
              )}
              {username.length >= 3 && usernameAvailable === true && (
                <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Username is available
                </p>
              )}
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2"
            >
              <span className="text-xs text-muted-foreground">Suggestions:</span>
              {["surgeon", "medic", "doctor", "scrub"].map((prefix) => (
                <button
                  key={prefix}
                  onClick={() => setUsername(`${prefix}${Math.floor(Math.random() * 1000)}`)}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                >
                  {prefix}{Math.floor(Math.random() * 1000)}
                </button>
              ))}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-4"
            >
              <Button
                onClick={handleSubmit}
                disabled={!displayName || !usernameValid || !usernameAvailable || isSubmitting}
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

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          You can change these later in your profile settings
        </motion.p>
      </motion.div>
    </div>
  );
}
