import React, { createContext, useContext, useState, useCallback } from 'react';
import LeadCaptureFlow from '../components/LeadCaptureFlow';

const LeadCaptureContext = createContext(null);

export const useLeadCapture = () => {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) throw new Error('useLeadCapture must be used within LeadCaptureProvider');
  return ctx;
};

export const LeadCaptureProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leadType, setLeadType] = useState('free_trial');

  const openFreeTrial = useCallback(() => {
    setLeadType('free_trial');
    setIsOpen(true);
  }, []);

  const openConsultation = useCallback(() => {
    setLeadType('consultation');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <LeadCaptureContext.Provider value={{ openFreeTrial, openConsultation }}>
      {children}
      <LeadCaptureFlow isOpen={isOpen} onClose={close} leadType={leadType} />
    </LeadCaptureContext.Provider>
  );
};
