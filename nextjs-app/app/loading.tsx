import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
}
