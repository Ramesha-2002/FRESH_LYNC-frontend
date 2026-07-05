import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSetup } from '../context/SetupContext';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { setupState } = useSetup();
  const { user } = useAuth();
  const location = useLocation();

  const STEP_ROUTES = user?.role === 'supplier'
    ? ['/setup/profile', '/setup/verification', '/setup/preferences']
    : ['/setup/profile', '/setup/preferences'];

  // Find index of current route
  const currentStepIndex = STEP_ROUTES.indexOf(location.pathname);
  
  // If we are on a setup route, check if we are allowed to be here
  if (currentStepIndex !== -1) {
    // You can access any step up to highestStepCompleted + 1
    const allowedMaxStepIndex = setupState?.highestStepCompleted ?? 0;
    
    if (currentStepIndex > allowedMaxStepIndex) {
      // Redirect to the highest allowed step they haven't completed yet
      const redirectPath = STEP_ROUTES[allowedMaxStepIndex] || STEP_ROUTES[0];
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
}
