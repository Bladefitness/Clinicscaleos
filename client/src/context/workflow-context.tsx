import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface WorkflowContextValue {
  /** From Offer Lab — clinic type, service, offer, location, target market */
  offerLab: {
    clinicType: string;
    service: string;
    currentOffer: string;
    location: string;
    targetMarket: string;
  } | null;
  setOfferLab: (data: WorkflowContextValue["offerLab"]) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [offerLab, setOfferLabState] = useState<WorkflowContextValue["offerLab"]>(null);
  const setOfferLab = useCallback((data: WorkflowContextValue["offerLab"]) => setOfferLabState(data), []);
  return (
    <WorkflowContext.Provider value={{ offerLab, setOfferLab }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    return {
      offerLab: null,
      setOfferLab: () => {},
    };
  }
  return ctx;
}
