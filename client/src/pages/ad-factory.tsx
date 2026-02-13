import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BusinessForm } from "@/components/ad-factory/business-form";
import { LoadingScreen } from "@/components/ad-factory/loading-screen";
import { ResultsGrid } from "@/components/ad-factory/results-grid";
import type { Creative, GenerateRequest } from "@shared/schema";

export default function AdFactory() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval>>();
  const stageRef = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (stageRef.current) clearInterval(stageRef.current);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const generateMutation = useMutation({
    mutationFn: async (formData: GenerateRequest) => {
      const res = await apiRequest("POST", "/api/generate", formData);
      return res.json();
    },
    onSuccess: async (data) => {
      cleanup();
      setProgress(100);
      setActiveStage(5);
      await new Promise((r) => setTimeout(r, 800));
      setCreatives(data.creatives || []);
      setStep(3);
    },
    onError: async () => {
      cleanup();
      setProgress(100);
      setActiveStage(5);
      await new Promise((r) => setTimeout(r, 800));
      setCreatives([]);
      setStep(3);
    },
  });

  const handleSubmit = (formData: GenerateRequest) => {
    setStep(2);
    setProgress(0);
    setActiveStage(0);

    stageRef.current = setInterval(() => {
      setActiveStage((prev) => {
        if (prev >= 4) {
          if (stageRef.current) clearInterval(stageRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 3 + 1;
      });
    }, 200);

    generateMutation.mutate(formData);
  };

  const handleReset = () => {
    setStep(1);
    setCreatives([]);
    setProgress(0);
    setActiveStage(0);
  };

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-auto">
      {step === 1 && <BusinessForm onSubmit={handleSubmit} />}
      {step === 2 && <LoadingScreen progress={progress} activeStage={activeStage} />}
      {step === 3 && <ResultsGrid creatives={creatives} onReset={handleReset} />}
    </div>
  );
}
