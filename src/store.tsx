
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, AuthState, Child, ActivityLog, User, QRData, MFAConfig, ThemeConfig, LinkedApp } from './types';

// Helper to generate QR Data
const generateQRData = (mfaConfig: MFAConfig): QRData => {
  const activeAuths = (Object.keys(mfaConfig) as (keyof MFAConfig)[]).filter(k => mfaConfig[k]);
  const now = Date.now();
  
  // Encode active auths into token string to simulate a smart token structure (e.g., did:nowa:BIO-PIN:xyz)
  // BIO = Biometric, PIN = Pin, PAR = Parent, LOC = Location
  const authCodes = activeAuths.map(k => k.substring(0, 3).toUpperCase()).join('-');
  const token = `did:nowa:${authCodes ? authCodes + ':' : ''}${Math.random().toString(36).substr(2, 9)}`;

  // Set expiry to 5 minutes for demo purposes (300000ms)
  return {
    token,
    generatedAt: now,
    expiresAt: now + 300000, 
    requiredAuth: activeAuths
  };
};

// Mock Data
const MOCK_CHILDREN: Child[] = [
  {
    id: 'c1',
    name: 'سارة أحمد',
    dob: '2015-05-12',
    gender: 'female',
    nationalId: '1092837465',
    status: 'active',
    lastVerification: 'منذ ساعتين',
    qrData: {
      token: 'did:nowa:BIO-PAR-LOC:sara123',
      generatedAt: Date.now(),
      expiresAt: Date.now() + 300000,
      requiredAuth: ['biometric', 'parentApproval', 'locationCheck']
    },
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zaher&backgroundColor=b6e3f4',
    mfaConfig: { biometric: true, pin: false, parentApproval: true, locationCheck: true },
    themeConfig: { color: 'rose', pattern: 'dots', layout: 'grid' },
    linkedApps: [
      { id: 'app1', name: 'منصة مدرستي', category: 'education', status: 'active', lastAccess: 'منذ ساعتين', permissions: ['full'] },
      { id: 'app2', name: 'Minecraft Education', category: 'game', status: 'active', lastAccess: 'أمس', permissions: ['time-limited'] }
    ]
  },
  {
    id: 'c2',
    name: 'عمر أحمد',
    dob: '2018-09-23',
    gender: 'male',
    nationalId: '1029384756',
    status: 'active',
    lastVerification: 'أمس',
    qrData: {
      token: 'did:nowa:BIO-PIN:omar456',
      generatedAt: Date.now(),
      expiresAt: Date.now() + 300000,
      requiredAuth: ['biometric', 'pin']
    },
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=d&backgroundColor=c0aede',
    mfaConfig: { biometric: true, pin: true, parentApproval: false, locationCheck: false },
    themeConfig: { color: 'blue', pattern: 'abstract', layout: 'list' },
    linkedApps: [
       { id: 'app3', name: 'Roblox', category: 'game', status: 'blocked', lastAccess: 'منذ 3 أيام', permissions: ['read-only'] }
    ]
  }
];

const MOCK_LOGS: ActivityLog[] = [
  { id: 'l1', childId: 'c1', action: 'دخول المدرسة', location: 'مدرسة الرواد', timestamp: '07:30 ص', status: 'success', hash: '0x8f...2a1', blockNumber: 10245, application: 'GateSystem', criteriaMet: ['Location', 'Time'] },
  { id: 'l2', childId: 'c1', action: 'شراء مقصف', location: 'مقصف المدرسة', timestamp: '10:15 ص', status: 'success', hash: '0x3c...9b2', blockNumber: 10248, application: 'CanteenPOS', criteriaMet: ['Bio'] },
  { id: 'l3', childId: 'c2', action: 'زيارة عيادة', location: 'مستشفى الدلة', timestamp: '04:00 م', status: 'success', hash: '0x7d...1f4', blockNumber: 10255, application: 'HealthLink', criteriaMet: ['ParentApproval'] },
  { id: 'l4', childId: 'c1', action: 'محاولة دخول غير مصرح', location: 'بوابة النادي', timestamp: '06:00 م', status: 'failed', hash: '0xe1...5a9', blockNumber: 10260 },
  { id: 'l5', childId: 'c2', action: 'خروج من المدرسة', location: 'مدرسة الرواد', timestamp: '01:30 م', status: 'success', hash: '0xa2...8c3', blockNumber: 10262, application: 'GateSystem', criteriaMet: ['Location'] },
];

const AppContext = createContext<(AppState & AuthState) | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>(MOCK_CHILDREN);
  const [logs, setLogs] = useState<ActivityLog[]>(MOCK_LOGS);

  const login = (email: string) => {
    // Simulate API login
    setUser({
      id: 'p1',
      name: 'أحمد محمد',
      email,
      phone: '0501234567',
      children: ['c1', 'c2']
    });
  };

  const logout = () => setUser(null);

  const addChild = (data: Omit<Child, 'id' | 'status' | 'lastVerification' | 'qrData'> & { mfaConfig?: MFAConfig, themeConfig?: ThemeConfig }) => {
    const defaultMFA: MFAConfig = { biometric: false, pin: false, parentApproval: true, locationCheck: false };
    const defaultTheme: ThemeConfig = { color: 'indigo', pattern: 'abstract', layout: 'grid' };
    
    const mfaConfig = data.mfaConfig || defaultMFA;
    const themeConfig = data.themeConfig || defaultTheme;

    const newChild: Child = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
      lastVerification: 'جديد',
      qrData: generateQRData(mfaConfig),
      mfaConfig: mfaConfig,
      themeConfig: themeConfig,
      photoUrl: data.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=d&backgroundColor=e6e6e6`,
      linkedApps: []
    };
    setChildrenList(prev => [...prev, newChild]);
  };

  const updateChild = (id: string, data: Partial<Child>) => {
    setChildrenList(prev => prev.map(child => {
      if (child.id === id) {
        const updatedChild = { ...child, ...data };
        
        // Critical: If MFA config is changed, we MUST regenerate the QR code data
        // to reflect the new security requirements in the "requiredAuth" snapshot.
        if (data.mfaConfig) {
          updatedChild.qrData = generateQRData(updatedChild.mfaConfig);
        }
        
        return updatedChild;
      }
      return child;
    }));
  };

  const deleteChild = (id: string) => {
    setChildrenList(prev => prev.filter(c => c.id !== id));
  };

  const regenerateQR = (childId: string) => {
    setChildrenList(prev => prev.map(child => {
      if (child.id === childId) {
        return { ...child, qrData: generateQRData(child.mfaConfig) };
      }
      return child;
    }));
  };

  const addLinkedApp = (childId: string, appData: Omit<LinkedApp, 'id' | 'status' | 'lastAccess'>) => {
    setChildrenList(prev => prev.map(child => {
      if (child.id === childId) {
        const newApp: LinkedApp = {
          ...appData,
          id: Math.random().toString(36).substr(2, 9),
          status: 'active',
          lastAccess: 'الآن',
        };
        return { ...child, linkedApps: [...(child.linkedApps || []), newApp] };
      }
      return child;
    }));
  };

  const updateLinkedApp = (childId: string, appId: string, data: Partial<LinkedApp>) => {
    setChildrenList(prev => prev.map(child => {
      if (child.id === childId && child.linkedApps) {
        return {
          ...child,
          linkedApps: child.linkedApps.map(app => app.id === appId ? { ...app, ...data } : app)
        };
      }
      return child;
    }));
  };

  const toggleLinkedApp = (childId: string, appId: string) => {
    setChildrenList(prev => prev.map(child => {
      if (child.id === childId && child.linkedApps) {
        return {
          ...child,
          linkedApps: child.linkedApps.map(app => app.id === appId ? { ...app, status: app.status === 'active' ? 'blocked' : 'active' } : app)
        };
      }
      return child;
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      children: childrenList,
      logs,
      isAuthenticated: !!user,
      login,
      logout,
      addChild,
      updateChild,
      deleteChild,
      regenerateQR,
      addLinkedApp,
      updateLinkedApp,
      toggleLinkedApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
