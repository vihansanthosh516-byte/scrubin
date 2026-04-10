import { SignInPage } from "@/components/ui/sign-in-flow";
import { useAuth } from "../contexts/AuthContext";

export default function Signin() {
  const { loginWithGitHub, loginWithGoogle, loading } = useAuth();

  return (
    <SignInPage
      onGoogleSignIn={loginWithGoogle}
      onGitHubSignIn={loginWithGitHub}
      loading={loading}
    />
  );
}
