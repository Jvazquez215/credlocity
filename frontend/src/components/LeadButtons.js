import React from 'react';
import { useLeadCapture } from '../context/LeadCaptureContext';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Drop-in replacement for all "Start Free Trial" external links site-wide.
 * Triggers the lead capture popup flow instead.
 */
export const TrialButton = ({ children, className = '', size, variant, ...props }) => (
  <LeadButton type="free_trial" className={className} size={size} variant={variant} {...props}>
    {children || <>Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></>}
  </LeadButton>
);

export const ConsultButton = ({ children, className = '', size, variant, ...props }) => (
  <LeadButton type="consultation" className={className} size={size} variant={variant} {...props}>
    {children || <>Book Free Consultation <ArrowRight className="w-4 h-4 ml-2" /></>}
  </LeadButton>
);

const LeadButton = ({ type, children, className, size, variant, ...props }) => {
  const { openFreeTrial, openConsultation } = useLeadCapture();
  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={type === 'consultation' ? openConsultation : openFreeTrial}
      {...props}
    >
      {children}
    </Button>
  );
};

export default LeadButton;
