"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a1628]">
      <Card className="w-full max-w-md mx-4 rounded-2xl border-[rgba(56,189,248,0.15)]">
        <CardContent className="pt-6 p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-6 mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">404 Page Not Found</h1>

          <p className="mt-4 text-sm text-slate-400 text-center mb-6">
            The page you're looking for doesn't exist.
          </p>

          <Link href="/" className="block">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
