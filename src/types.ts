
export type ThemeColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo' | 'slate';
export type ThemePattern = 'abstract' | 'minimal' | 'dots' | 'waves';
export type DashboardLayout = 'grid' | 'list';

export interface ThemeConfig {
  color: ThemeColor;
  pattern: ThemePattern;
  layout: DashboardLayout;
}

export interface MFAConfig {
  biometric: boolean;
  pin: boolean;
  parentApproval: boolean;
  locationCheck: boolean;
}

export interface QRData {
  token: string;
  generatedAt: number; // timestamp
  expiresAt: number; // timestamp
  requiredAuth: (keyof MFAConfig)[]; // Snapshot of MFA required for this specific QR
}

export interface LinkedApp {
  id: string;
  name: string;
  category: 'education' | 'game' | 'health' | 'other';
  status: 'active' | 'blocked';
  lastAccess: string;
  permissions: string[];
}

export interface Child {
  id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female';
  nationalId: string;
  photoUrl?: string;
  status: 'active' | 'pending' | 'suspended';
  lastVerification: string;
  qrData: QRData; // Changed from qrToken string to object
  mfaConfig: MFAConfig;
  themeConfig: ThemeConfig;
  linkedApps?: LinkedApp[];
}

export interface ActivityLog {
  id: string;
  childId: string;
  action: string;
  location: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  hash: string;
  blockNumber: number;
  application?: string;
  criteriaMet?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[]; // Array of Child IDs
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

export interface AppState {
  children: Child[];
  logs: ActivityLog[];
  addChild: (data: Omit<Child, 'id' | 'status' | 'lastVerification' | 'qrData'> & { mfaConfig?: MFAConfig, themeConfig?: ThemeConfig }) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  regenerateQR: (childId: string) => void;
  addLinkedApp: (childId: string, app: Omit<LinkedApp, 'id' | 'status' | 'lastAccess'>) => void;
  updateLinkedApp: (childId: string, appId: string, data: Partial<LinkedApp>) => void;
  toggleLinkedApp: (childId: string, appId: string) => void;
}
