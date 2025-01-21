import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType = 'list' | 'calendar';

interface ViewContextType {
  view: ViewType;
  setView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [view, setView] = useState<ViewType>('list');

  const value = React.useMemo(() => ({ view, setView }), [view, setView]);

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

export const useView = (): ViewContextType => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
