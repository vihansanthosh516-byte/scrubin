/**
 * ScrubIn Welcome Back — returning-user confirmation shown on /signin when a saved session exists.
 */
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/scrubin";

interface WelcomeBackProps {
  onConfirm: () => void;
  onNotYou: () => void;
}

export default function WelcomeBack({ onConfirm, onNotYou }: WelcomeBackProps) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const name = user.name || user.login;

  return (
    <AuthShell
      title={`Welcome back, ${name.split(" ")[0]}`}
      lead="Your cases, XP and history are saved."
      footer={
        <>
          Not you?{" "}
          <button type="button" onClick={logout} className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign out and use another account
          </button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-14 w-14 rounded-sm border border-border object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-muted text-xl font-bold text-foreground" aria-hidden="true">
            {name[0]?.toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">{name}</p>
          <p className="truncate font-mono-data text-xs text-muted-foreground">@{user.customUsername || user.login}</p>
        </div>
        <CheckCircle className="ml-auto h-5 w-5 shrink-0 text-success" aria-label="Account found" />
      </div>

      <div className="mt-6 space-y-3">
        <Button onClick={onConfirm} className="h-11 w-full text-sm font-semibold">
          Continue as {name.split(" ")[0]}
        </Button>
        <Button onClick={onNotYou} variant="outline" className="h-11 w-full text-sm">
          Edit my name and role
        </Button>
      </div>
    </AuthShell>
  );
}
