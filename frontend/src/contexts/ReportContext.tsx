import React, { createContext, useContext, useRef } from 'react';

export interface ReportContextValue {
  sessionReport: any;
  pillars: any[];
  radarData: any[];
  strengths: string[];
  focusAreas: { area: string; tip: string }[];
  coachSummary: string[];
  cafBreakdown: any[];
  transcript: { time: string; text: string; fillers: string[] }[];
  /** Mutable ref populated by SessionPlayback to allow cross-component seeking. */
  seekVideoRef: React.MutableRefObject<((seconds: number) => void) | null>;
}

export const ReportContext = createContext<ReportContextValue | null>(null);

export function useReport(): ReportContextValue {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
