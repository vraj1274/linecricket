import { createContext, ReactNode, useContext } from 'react';

interface MobileAppContextType {
  showMobileAppModal: () => void;
}

const MobileAppContext = createContext<MobileAppContextType | undefined>(undefined);

export function MobileAppProvider({ children, onShowModal }: { children: ReactNode; onShowModal: () => void }) {
  return (
    <MobileAppContext.Provider value={{ showMobileAppModal: onShowModal }}>
      {children}
    </MobileAppContext.Provider>
  );
}

export function useMobileApp() {
  const context = useContext(MobileAppContext);
  if (context === undefined) {
    throw new Error('useMobileApp must be used within a MobileAppProvider');
  }
  return context;
}
