import { SignInPage } from "@/components/ui/sign-in-flow";
import { useAuth } from "../contexts/AuthContext";

export default function Signin() {
  const { loginWithGitHub, loginWithGoogle, signIn, signUp, loading } = useAuth();

  return (
    <SignInPage
      onGoogleSignIn={loginWithGoogle}
      onGitHubSignIn={loginWithGitHub}
      onSignIn={signIn}
      onSignUp={signUp}
      loading={loading}
    />
  );
}
