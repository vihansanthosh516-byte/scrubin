import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Activity } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg mx-4 p-10 rounded-[2rem] glass-card-pro text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          4<span className="text-gradient">0</span>4
        </h1>

        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
          Page Not Found
        </h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <Button
          onClick={handleGoHome}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-2xl text-lg font-semibold shadow-[0_0_30px_rgba(126,200,227,0.4)] hover:shadow-[0_0_50px_rgba(126,200,227,0.6)] transition-all"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Home className="w-5 h-5 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
