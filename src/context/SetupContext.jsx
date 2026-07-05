import React, { createContext, useContext, useState, useEffect } from 'react';

const SetupContext = createContext();

export function useSetup() {
  return useContext(SetupContext);
}

export function SetupProvider({ children }) {
  // Try to load state from localStorage, fallback to default state
  const [setupState, setSetupState] = useState(() => {
    const saved = localStorage.getItem('freshlync_setup');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse setup state from localStorage", e);
      }
    }
    return {
      highestStepCompleted: 0,
      profile: {
        fullName: '',
        jobTitle: '',
        phoneNumber: '',
        avatar: null
      },
      business: {
        companyName: '',
        taxId: '',
        entityType: 'Corporation',
        address: '',
        documents: [] // mock filenames
      },
      team: {
        invitations: [
          { initials: 'JS', email: 'j.smith@freshlync.com', name: 'Julian Smith', role: 'Driver', date: 'Oct 24, 2023', status: 'Waiting' },
          { initials: 'MR', email: 'm.rodriguez@logistics.net', name: 'Maria Rodriguez', role: 'Manager', date: 'Oct 23, 2023', status: 'Waiting' },
          { initials: 'KL', email: 'k.lee@freshlync.com', name: 'Kevin Lee', role: 'Viewer', date: 'Oct 22, 2023', status: 'Expired' }
        ]
      },
      integrations: {
        connected: []
      },
      preferences: {
        email: true,
        sms: false,
        push: true,
        units: 'Metric',
        timeZone: '(GMT-08:00) Pacific Time (US & Canada)'
      }
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('freshlync_setup', JSON.stringify(setupState));
  }, [setupState]);

  // Actions
  const updateProfile = (data) => {
    setSetupState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...data },
      highestStepCompleted: Math.max(prev.highestStepCompleted, 1)
    }));
  };

  const updateBusiness = (data) => {
    setSetupState(prev => ({
      ...prev,
      business: { ...prev.business, ...data },
      highestStepCompleted: Math.max(prev.highestStepCompleted, 2)
    }));
  };

  const updateTeam = (invitations) => {
    setSetupState(prev => ({
      ...prev,
      team: { invitations },
      highestStepCompleted: Math.max(prev.highestStepCompleted, 3)
    }));
  };

  const updateIntegrations = (connected) => {
    setSetupState(prev => ({
      ...prev,
      integrations: { connected }
    }));
  };

  const updatePreferences = (data) => {
    setSetupState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...data },
      highestStepCompleted: Math.max(prev.highestStepCompleted, 2)
    }));
  };
  
  const resetSetup = () => {
    localStorage.removeItem('freshlync_setup');
    window.location.reload();
  };

  const value = {
    setupState,
    updateProfile,
    updateBusiness,
    updateTeam,
    updateIntegrations,
    updatePreferences,
    resetSetup
  };

  return (
    <SetupContext.Provider value={value}>
      {children}
    </SetupContext.Provider>
  );
}
