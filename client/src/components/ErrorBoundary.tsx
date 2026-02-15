import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <div className="rounded-full bg-rose-100 p-4 dark:bg-rose-950/50">
            <AlertTriangle className="h-12 w-12 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              An unexpected error occurred. Try reloading the page.
            </p>
            {this.state.error && (
              <p className="mt-2 max-w-md truncate text-xs text-slate-500">
                {this.state.error.message}
              </p>
            )}
          </div>
          <Button onClick={this.handleReload} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
