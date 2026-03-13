import React from 'react';
import { usePermissions } from '../../context/PermissionsContext';
import DashboardHome from './DashboardHome';
import CollectionsRepDashboard from './dashboards/CollectionsRepDashboard';
import MarketingDashboard from './dashboards/MarketingDashboard';
import HRPayrollDashboard from './dashboards/HRPayrollDashboard';
import LegalDashboard from './dashboards/LegalDashboard';
import FinanceDashboard from './dashboards/FinanceDashboard';

/**
 * Smart Dashboard Router
 * Shows a department-specific dashboard based on the user's group.
 * Admins always see the Master Dashboard.
 */
export default function SmartDashboard() {
  const { isAdmin, groupName, loaded } = usePermissions();

  if (!loaded) return null;

  // Admins always see the master dashboard
  if (isAdmin) return <DashboardHome />;

  // Map group names to department dashboards
  const groupLower = (groupName || '').toLowerCase();

  if (groupLower.includes('collection rep')) return <CollectionsRepDashboard />;
  if (groupLower.includes('collection manager')) return <CollectionsRepDashboard />;
  if (groupLower.includes('marketing')) return <MarketingDashboard />;
  if (groupLower.includes('hr') || groupLower.includes('payroll')) return <HRPayrollDashboard />;
  if (groupLower.includes('legal')) return <LegalDashboard />;
  if (groupLower.includes('finance')) return <FinanceDashboard />;

  // Default to master dashboard
  return <DashboardHome />;
}
