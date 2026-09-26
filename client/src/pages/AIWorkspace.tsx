import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Upload, FileType, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/state/aiStore";

export default function AIWorkspace() {
  const [, setLocation] = useLocation();
  const { isUploading, uploadError, uploadFiles } = useAIStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(f => 
        f.type === "application/pdf" || 
        f.type.startsWith("image/")
      );
      setSelectedFiles(validFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    const sessionId = await uploadFiles(selectedFiles);
    if (sessionId) {
      setLocation(`/ai/session/${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 pt-24">
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            AI Workspace Upload
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload patient case files (PDF, PNG, JPG) to begin AI analysis.
          </p>
        </div>

        {uploadError && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-destructive w-5 h-5" />
            <span className="text-destructive font-medium">{uploadError}</span>
          </div>
        )}

        <div 
          className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <div className="p-6 bg-[#0D1628]/40 rounded-full border border-white/5 shadow-[0_0_30px_rgba(126,200,227,0.1)]">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            
            <div>
              <p className="text-2xl font-bold text-white mb-2">Drag & drop case files here</p>
              <p className="text-muted-foreground">Supported formats: PDF, PNG, JPG</p>
            </div>

            <div className="flex items-center gap-4 w-full max-w-sm my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-muted-foreground text-sm font-mono-data">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/5 hover:bg-primary/20 border-white/10 hover:border-primary/50"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              Browse Files
            </Button>
          </motion.div>
        </div>

        {selectedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl glass-card-pro bg-[#0D1628]/40 border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-4">Selected Files</h3>
            <div className="space-y-3 mb-6">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <FileType className="w-5 h-5 text-primary" />
                  <span className="text-white text-sm">{file.name}</span>
                  <span className="text-muted-foreground text-xs ml-auto">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Process Files"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
