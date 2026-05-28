import { useAuth } from "@/contexts/AuthContext";
import { SignInPage } from "@/components/ui/sign-in-flow";
import WelcomeBack from "@/pages/WelcomeBack";

export default function Signin() {
  const { 
    loginWithGitHub, 
    loginWithGoogle, 
    signIn, 
    signUp, 
    loading,
    isReturningUser,
    confirmReturningUser,
    restartOnboarding
  } = useAuth();

  if (isReturningUser) {
    return <WelcomeBack onConfirm={confirmReturningUser} onNotYou={restartOnboarding} />;
  }

  return (
    <div className="w-full min-h-screen bg-black">
      <SignInPage 
        onGitHubSignIn={loginWithGitHub}
        onGoogleSignIn={loginWithGoogle}
        onSignIn={signIn}
        onSignUp={signUp}
        loading={loading}
      />
    </div>
  );
}


