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

  /** From Research Portal — validated pain points and messaging angles */
  researchPortal: {
    painPoints: string[];
    emotionalTriggers: string[];
    messagingAngles: Array<{ angle: string; targetEmotion: string; exampleHook: string }>;
    sessionId: string;
  } | null;
  setResearchPortal: (data: WorkflowContextValue["researchPortal"]) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [offerLab, setOfferLabState] = useState<WorkflowContextValue["offerLab"]>(null);
  const setOfferLab = useCallback((data: WorkflowContextValue["offerLab"]) => setOfferLabState(data), []);
  const [researchPortal, setResearchPortalState] = useState<WorkflowContextValue["researchPortal"]>(null);
  const setResearchPortal = useCallback((data: WorkflowContextValue["researchPortal"]) => setResearchPortalState(data), []);
  return (
    <WorkflowContext.Provider value={{ offerLab, setOfferLab, researchPortal, setResearchPortal }}>
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
      researchPortal: null,
      setResearchPortal: () => {},
    };
  }
  return ctx;
}
