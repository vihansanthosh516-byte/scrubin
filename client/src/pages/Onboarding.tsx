import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AuthShell, SelectField, TextField } from "@/components/scrubin";
import { PROFESSIONS } from "@/lib/professions";

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [profession, setProfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill with OAuth data
  useEffect(() => {
    if (user) setDisplayName(user.name || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim() || !profession) return;
    setIsSubmitting(true);
    try {
      // completeOnboarding navigates to the profile on success.
      await completeOnboarding({ displayName: displayName.trim(), profession });
    } catch {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <AuthShell title="Complete your profile" lead="Tell us who's scrubbing in. You can change this later.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {user.avatar_url && (
          <img src={user.avatar_url} alt="" className="mx-auto h-16 w-16 rounded-sm border border-border object-cover" />
        )}
        <TextField
          label="Display name"
          placeholder="Dr. House"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={30}
          required
        />
        <SelectField
          label="Current role"
          options={PROFESSIONS}
          placeholder="Select your current role"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          required
        />
        <Button type="submit" disabled={!displayName.trim() || !profession || isSubmitting} className="h-11 w-full text-sm font-semibold">
          {isSubmitting ? (
            "Setting up your profile…"
          ) : (
            <>
              Start operating <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
