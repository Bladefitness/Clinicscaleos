"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="p-8 text-center space-y-6 max-w-md bg-white rounded-2xl shadow-sm border border-red-100">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
        <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      </Card>
    </div>
  );
}
