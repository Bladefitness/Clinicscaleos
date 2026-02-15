import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StickyCtaProps {
  children: React.ReactNode;
  /** Ref to the form container - when it scrolls out of view, CTA sticks */
  formRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

export function StickyCta({ children, formRef, className }: StickyCtaProps) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [formRef]);

  if (!stuck) return null;

  return (
    <div
      className={cn(
        "fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4 py-3 bg-background/95 backdrop-blur border-t border-border shadow-lg lg:hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
