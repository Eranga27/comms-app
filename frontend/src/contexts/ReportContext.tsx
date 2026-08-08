import React, { createContext, useContext } from 'react';

export const ReportContext = createContext<any>(null);

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
