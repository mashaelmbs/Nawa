
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, useAppContext } from './store';
import { Child, ActivityLog, ThemeColor, ThemePattern, DashboardLayout, MFAConfig, ThemeConfig, LinkedApp } from './types';
import { 
  Shield, User, QrCode, Activity, Settings, LogOut, Plus, ChevronRight, Lock, 
  CheckCircle, XCircle, AlertTriangle, Fingerprint, RefreshCw, Eye, Scan, 
  Smartphone, MapPin, FileKey, Database, Edit2, Trash2, 
  Calculator, Network, Share2, Link as LinkIcon, Palette, Key, LayoutGrid, List, Clock,
  ArrowRight, Check, Sparkles, School, Stethoscope, Gamepad2, Building2, Globe, Users, Award, Zap, Ban
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toCanvas } from 'qrcode';

// --- Theme Configurations ---
const THEMES: Record<ThemeColor, { 
  bg: string, 
  text: string, 
  border: string, 
  gradient: string, 
  shadow: string,
  lightBg: string,
  iconColor: string,
  ring: string,
  hex: string // Added for QR Code color
}> = {
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    gradient: 'from-blue-600 to-cyan-500',
    shadow: 'shadow-blue-500/30',
    lightBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    ring: 'focus:ring-blue-500',
    hex: '#2563eb'
  },
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    gradient: 'from-emerald-600 to-teal-500',
    shadow: 'shadow-emerald-500/30',
    lightBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    ring: 'focus:ring-emerald-500',
    hex: '#059669'
  },
  purple: {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-200',
    gradient: 'from-purple-600 to-fuchsia-500',
    shadow: 'shadow-purple-500/30',
    lightBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    ring: 'focus:ring-purple-500',
    hex: '#9333ea'
  },
  amber: {
    bg: 'bg-amber-600',
    text: 'text-amber-600',
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/30',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    ring: 'focus:ring-amber-500',
    hex: '#d97706'
  },
  rose: {
    bg: 'bg-rose-600',
    text: 'text-rose-600',
    border: 'border-rose-200',
    gradient: 'from-rose-600 to-pink-500',
    shadow: 'shadow-rose-500/30',
    lightBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    ring: 'focus:ring-rose-500',
    hex: '#e11d48'
  },
  indigo: {
    bg: 'bg-indigo-600',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    gradient: 'from-indigo-600 to-violet-500',
    shadow: 'shadow-indigo-500/30',
    lightBg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    ring: 'focus:ring-indigo-500',
    hex: '#4f46e5'
  },
  slate: {
    bg: 'bg-slate-800',
    text: 'text-slate-800',
    border: 'border-slate-200',
    gradient: 'from-slate-800 to-slate-700',
    shadow: 'shadow-slate-500/30',
    lightBg: 'bg-slate-50',
    iconColor: 'text-slate-700',
    ring: 'focus:ring-slate-500',
    hex: '#1e293b'
  }
};

// --- Helper Components ---

const RealQRCode = ({ text, colorHex }: { text: string, colorHex: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      toCanvas(canvasRef.current, text, {
        width: 180,
        margin: 0,
        color: {
          dark: colorHex,
          light: '#ffffff00' // transparent background
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [text, colorHex]);

  return <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-sm mix-blend-multiply" />;
};

const QRTimer = ({ expiresAt }: { expiresAt: number }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(newTime);
      if (newTime <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div className={`font-mono font-bold flex items-center gap-1.5 ${isUrgent ? 'text-amber-300 animate-pulse' : 'text-emerald-300'}`}>
      <Clock size={14} />
      <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
};

const Header = ({ onViewChange }: { onViewChange: (view: string) => void }) => {
  const { user, isAuthenticated, logout } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => onViewChange('landing')}>
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <Fingerprint size={24} />
              </div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight">نواه</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="flex gap-2 sm:gap-4">
                 <button 
                  onClick={() => onViewChange('verifier')}
                  className="hidden md:flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium px-3 py-2 transition-colors"
                >
                  <Scan size={18} />
                  بوابة التحقق
                </button>
                <button 
                  onClick={() => onViewChange('login')}
                  className="text-slate-600 hover:text-primary-600 font-medium px-3 py-2 transition-colors"
                >
                  تسجيل الدخول
                </button>
                <button 
                  onClick={() => onViewChange('register')}
                  className="bg-slate-900 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  حساب جديد
                </button>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="hidden md:block font-medium text-slate-700 text-sm">{user?.name}</span>
                  <ChevronRight size={16} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-90' : ''}`} />
                </button>
                {menuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-50 mb-2 bg-slate-50/50">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={() => { onViewChange('dashboard'); setMenuOpen(false); }} className="w-full text-right px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                      <User size={16} className="text-slate-400" /> لوحة التحكم
                    </button>
                    <button onClick={() => { logout(); setMenuOpen(false); onViewChange('landing'); }} className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                      <LogOut size={16} /> تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = ({ onStart, onVerify }: { onStart: () => void, onVerify: () => void }) => (
  <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
    
    {/* Section 1: Hero */}
    <div className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:w-2/3 mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100 shadow-sm animate-pulse">
            <Shield size={16} />
            هوية لا مركزية (SSI) معتمدة
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
            الهوية الرقمية <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">
              الآمنة لمستقبلهم
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            منصة "نواه" تمكنك من إصدار وإدارة هويات أطفالك الرقمية بتقنيات البلوكشين والمصادقة الصفرية (ZKP). أمان، خصوصية، وتحكم كامل.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/40 hover:bg-primary-700 transition-all hover:-translate-y-1 w-full sm:w-auto text-lg"
            >
              ابدأ الآن مجاناً
            </button>
            <button 
              onClick={onVerify}
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
            >
              <Scan size={20} />
              بوابة التحقق
            </button>
          </div>
        </div>
      </div>
      
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 pointer-events-none">
        <div className="absolute -right-20 top-20 w-[600px] h-[600px] bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute right-40 bottom-20 w-[500px] h-[500px] bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
    </div>

    {/* Section 2: Stats (Trust & Impact) */}
    <div className="bg-slate-900 py-12 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">+10k</div>
            <div className="text-slate-400 text-sm">هوية مصدرة</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">+500k</div>
            <div className="text-slate-400 text-sm">عملية تحقق</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">99.9%</div>
            <div className="text-slate-400 text-sm">نسبة الأمان</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-rose-400 mb-2">+50</div>
            <div className="text-slate-400 text-sm">شريك تعليمي</div>
          </div>
        </div>
      </div>
    </div>

    {/* Section 3: How It Works */}
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">كيف يعمل نظام نواه؟</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">ثلاث خطوات بسيطة تمنحك التحكم الكامل في هوية أطفالك الرقمية.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100 -z-10"></div>

          <div className="relative bg-white p-6 text-center group">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors duration-300 shadow-sm border border-primary-100">
              <User size={32} className="text-primary-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">1. إنشاء الحساب</h3>
            <p className="text-slate-500 text-sm leading-relaxed">سجل حساب ولي الأمر وأضف ملفات أطفالك. يتم إنشاء هوية لامركزية (DID) فورية لكل طفل.</p>
          </div>

          <div className="relative bg-white p-6 text-center group">
             <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 transition-colors duration-300 shadow-sm border border-emerald-100">
              <Shield size={32} className="text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">2. تخصيص الأمان</h3>
            <p className="text-slate-500 text-sm leading-relaxed">حدد طرق المصادقة (بصمة، وجه، موقع) التي تناسب عمر الطفل ومستوى الحماية المطلوب.</p>
          </div>

          <div className="relative bg-white p-6 text-center group">
             <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300 shadow-sm border border-purple-100">
              <LinkIcon size={32} className="text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">3. الربط والاستخدام</h3>
            <p className="text-slate-500 text-sm leading-relaxed">اربط الهوية بتطبيقات التعليم والألعاب بأمان تام، مع سجل دقيق لكل عملية وصول.</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Section 4: Use Cases (Ecosystem) */}
    <div className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
           <div>
             <h2 className="text-3xl font-bold text-slate-900 mb-2">هوية واحدة.. استخدامات لا محدودة</h2>
             <p className="text-slate-500">نظام "نواه" متكامل مع المنصات التي يستخدمها أطفالك يومياً.</p>
           </div>
           <button className="flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700">
             استكشف جميع الشركاء <ArrowRight size={20} className="rotate-180" />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
               <School size={24} />
             </div>
             <h3 className="font-bold text-lg text-slate-900 mb-2">التعليم والمدرسة</h3>
             <p className="text-sm text-slate-500">دخول آمن لمنصة مدرستي وبوابات المدارس الذكية دون الحاجة لكلمات مرور.</p>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
             <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
               <Stethoscope size={24} />
             </div>
             <h3 className="font-bold text-lg text-slate-900 mb-2">السجلات الصحية</h3>
             <p className="text-sm text-slate-500">مشاركة الملف الصحي والتطعيمات مع المستشفيات والعيادات بخصوصية تامة.</p>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
             <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
               <Gamepad2 size={24} />
             </div>
             <h3 className="font-bold text-lg text-slate-900 mb-2">الألعاب والترفيه</h3>
             <p className="text-sm text-slate-500">التحقق من العمر في ألعاب مثل Minecraft و Roblox لحماية الطفل من المحتوى غير المناسب.</p>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
               <Building2 size={24} />
             </div>
             <h3 className="font-bold text-lg text-slate-900 mb-2">الأندية والمرافق</h3>
             <p className="text-sm text-slate-500">دخول النوادي الرياضية والمكتبات العامة باستخدام QR Code فقط.</p>
           </div>
        </div>
      </div>
    </div>

    {/* Section 5: Security & Tech (The Core Value) */}
    <div className="py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-6">
              <Lock size={12} /> تقنية الحماية المتقدمة
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              لماذا نعتبر "نواه" <br/>
              <span className="text-primary-600">الخيار الأكثر أماناً؟</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              نعتمد على بنية تحتية لا مركزية تضمن أن بيانات أطفالك ملك لك وحدك، وليست مخزنة في خوادم مركزية معرضة للاختراق.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                   <Eye size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 text-lg">إثبات المعرفة الصفرية (ZKP)</h3>
                   <p className="text-slate-500 text-sm mt-1">إمكانية إثبات العمر أو الصلاحية للجهة الطالبة (مثل المدرسة) دون كشف تاريخ الميلاد أو البيانات الشخصية.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                   <Network size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 text-lg">سجل البلوكتشين (Blockchain)</h3>
                   <p className="text-slate-500 text-sm mt-1">كل عملية تحقق يتم توثيقها في سجل مشفر غير قابل للتعديل، مما يمنحك شفافية مطلقة حول متى وأين استخدمت الهوية.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                   <Users size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 text-lg">هوية ذاتية السيادة (SSI)</h3>
                   <p className="text-slate-500 text-sm mt-1">الطفل وولي الأمر هما المالكان الوحيدان لمفاتيح الهوية، ولا يمكن لأي جهة مركزية إلغاء الهوية أو انتحالها.</p>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
             {/* Visual representation of Security */}
             <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-teal-200 rounded-[2rem] transform rotate-3 scale-105 opacity-50 blur-xl"></div>
             <div className="relative bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs font-mono text-slate-400">Security Layer 1</div>
                </div>
                <div className="space-y-4 font-mono text-sm text-emerald-400">
                  <p> Initializing secure handshake...</p>
                  <p> Verifying DID credentials...</p>
                  <p className="text-blue-400"> Generating Zero-Knowledge Proof...</p>
                  <p className="text-white bg-white/10 p-2 rounded border border-white/20">
                    Proof: 0x7f...3a9c <span className="text-emerald-500 ml-2">✓ VALID</span>
                  </p>
                  <p> Transaction hashed to ledger.</p>
                  <p className="animate-pulse text-white"> Identity Confirmed.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    {/* Section 6: Developer API CTA */}
    <div className="bg-slate-50 py-16 border-y border-slate-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Zap size={40} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">هل أنت مطور تطبيقات؟</h2>
        <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
          استخدم واجهة Nawa API لدمج نظام المصادقة الآمن في تطبيقاتك التعليمية أو الترفيهية بسهولة. نوفر لك أدوات SDK جاهزة للربط مع نظامنا.
        </p>
        <button className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
          عرض وثائق المطورين
        </button>
      </div>
    </div>

    {/* Section 7: Final CTA */}
    <div className="bg-gradient-to-br from-primary-700 to-blue-900 py-20 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="max-w-3xl mx-auto px-4 relative z-10">
         <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">جاهز لحماية هوية أطفالك؟</h2>
         <p className="text-blue-100 text-lg mb-10">انضم  في نظام نواه لإدارة الهوية الرقمية لأطفالهم.</p>
         <button 
           onClick={onStart}
           className="bg-white text-primary-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/30 hover:bg-blue-50 hover:scale-105 transition-all"
         >
           إنشاء حساب مجاني
         </button>
         <p className="mt-4 text-sm text-blue-200/60">تجربة مجانية لمدة 30 يوم • لا يلزم بطاقة ائتمان</p>
      </div>
    </div>

  </div>
);

// --- Child Dashboard Sub-components ---

const MFAToggle = ({ label, icon: Icon, enabled, onChange, description }: { label: string, icon: any, enabled: boolean, onChange: () => void, description: string }) => (
  <div className={`flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm transition-all cursor-pointer ${enabled ? 'border-primary-200 bg-primary-50/30' : 'border-slate-100 hover:border-slate-200'}`} onClick={onChange}>
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${enabled ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="font-bold text-slate-800">{label}</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px] sm:max-w-xs">{description}</p>
      </div>
    </div>
    <button className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-slate-200'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-1' : 'translate-x-6'}`} />
    </button>
  </div>
);

const BlockchainLedgerItem: React.FC<{ log: ActivityLog }> = ({ log }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} />
      <span className="text-xs font-mono text-slate-400">BLK #{log.blockNumber}</span>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-slate-800 text-sm">{log.action}</span>
        {log.application && (
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
            <Globe size={8} /> {log.application}
          </span>
        )}
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{log.location}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 sm:items-center">
        <div className="flex items-center gap-2">
          <Database size={12} className="text-slate-400" />
          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">{log.hash}</span>
        </div>
        {log.criteriaMet && log.criteriaMet.length > 0 && (
          <div className="flex items-center gap-1">
             <CheckCircle size={10} className="text-emerald-500" />
             <span className="text-[10px] text-emerald-600">
               {log.criteriaMet.join(', ')}
             </span>
          </div>
        )}
      </div>
    </div>
    <div className="text-right">
      <span className="text-xs font-medium text-slate-500">{log.timestamp}</span>
    </div>
  </div>
);

// --- Main Child Control Center ---

const ChildControlCenter = ({ childId, onBack }: { childId: string, onBack: () => void }) => {
  const { children, updateChild, logs, regenerateQR, deleteChild, addLinkedApp, updateLinkedApp, toggleLinkedApp } = useAppContext();
  const child = children.find(c => c.id === childId);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'apps' | 'ledger' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(child?.name || '');
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showAppPermissions, setShowAppPermissions] = useState<string | null>(null);

  const childLogs = logs.filter(l => l.childId === childId);

  if (!child) return <div>Child not found</div>;

  const currentTheme = THEMES[child.themeConfig.color || 'blue'];

  const handleUpdateMFA = (key: keyof typeof child.mfaConfig) => {
    updateChild(child.id, {
      mfaConfig: { ...child.mfaConfig, [key]: !child.mfaConfig[key] }
    });
  };
  
  const handleUpdateTheme = (color: ThemeColor, pattern: ThemePattern) => {
    updateChild(child.id, {
      themeConfig: { ...child.themeConfig, color, pattern }
    });
  };
  
  const handleUpdateLayout = (layout: DashboardLayout) => {
    updateChild(child.id, {
        themeConfig: { ...child.themeConfig, layout }
    });
  }

  const handleDelete = () => {
     deleteChild(child.id);
        onBack();
 
  };

  const handleAddApp = (app: Omit<LinkedApp, 'id' | 'status' | 'lastAccess'>) => {
      addLinkedApp(child.id, app);
      setShowMarketplace(false);
  };

  // Calculate Security Score
  const securityScore = 
    (child.mfaConfig.biometric ? 35 : 0) +
    (child.mfaConfig.parentApproval ? 30 : 0) +
    (child.mfaConfig.locationCheck ? 20 : 0) +
    (child.mfaConfig.pin ? 15 : 0);

  // Icon map for required auth
  const authIcons: Record<keyof MFAConfig, any> = {
    biometric: Fingerprint,
    pin: Calculator,
    parentApproval: Smartphone,
    locationCheck: MapPin
  };

  const authLabels: Record<keyof MFAConfig, string> = {
    biometric: 'بصمة',
    pin: 'PIN',
    parentApproval: 'موافقة',
    locationCheck: 'موقع'
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 transition-colors duration-500">
      {/* Top Navigation Bar for Child View */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="relative">
                <img src={child.photoUrl} alt={child.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${child.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
             </div>
             <div>
               <h2 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">{child.name}</h2>
               <span className={`text-xs flex items-center gap-1 ${currentTheme.text}`}>
                 <Shield size={10} /> هوية SSI موثقة
               </span>
             </div>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
          {[
            { id: 'overview', label: 'الرئيسية', icon: Activity },
            { id: 'security', label: 'الأمان', icon: Lock },
            { id: 'apps', label: 'الخدمات المرتبطة', icon: LinkIcon },
            { id: 'ledger', label: 'السجل', icon: Database },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? `bg-white ${currentTheme.text} shadow-sm` 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Identity Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className={`bg-gradient-to-br ${currentTheme.gradient} rounded-[2rem] p-6 text-white ${currentTheme.shadow} shadow-xl relative overflow-hidden group`}>
                
                {/* Patterns based on themeConfig.pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  {child.themeConfig.pattern === 'dots' && (
                    <div className="w-full h-full" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                  )}
                  {child.themeConfig.pattern === 'abstract' && (
                     <>
                      <div className="absolute -right-20 top-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                      <div className="absolute left-10 bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                     </>
                  )}
                  {child.themeConfig.pattern === 'waves' && (
                     <div className="w-full h-full opacity-30" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'}}></div>
                  )}
                </div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-medium flex items-center gap-1">
                    <Shield size={12} className="text-white" />
                    موثق
                  </div>
                  <div className="flex flex-col items-end">
                    <QRTimer expiresAt={child.qrData.expiresAt} />
                    <span className="text-[10px] text-white/70 mt-1 font-mono">
                      ينتهي في: {new Date(child.qrData.expiresAt).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-6 relative z-10">
                  <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mb-4 relative group-hover:scale-[1.02] transition-transform">
                     {/* Real QR Code Generator */}
                     <RealQRCode text={child.qrData.token} colorHex={currentTheme.hex} />
                  </div>
                  
                  {/* Dynamic Auth Requirements Details */}
                  <div className="bg-black/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 mb-4">
                     <p className="text-[10px] text-white/70 mb-2 uppercase tracking-widest font-bold">طرق المصادقة المطلوبة</p>
                     <div className="flex flex-wrap justify-center gap-2">
                       {child.qrData.requiredAuth.length > 0 ? child.qrData.requiredAuth.map((authKey) => {
                         const Icon = authIcons[authKey];
                         return (
                           <div key={authKey} className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2 py-1 border border-white/20">
                             <Icon size={12} className="text-white" />
                             <span className="text-xs font-medium">{authLabels[authKey]}</span>
                           </div>
                         );
                       }) : (
                         <span className="text-xs text-white/60">بدون مصادقة إضافية</span>
                       )}
                     </div>
                  </div>

                  <p className="text-white/80 text-xs font-mono mb-2 tracking-wider">DID:NOWA:{child.id.toUpperCase()}</p>
                  <button 
                    onClick={() => regenerateQR(child.id)}
                    className="flex items-center justify-center gap-2 w-full text-xs bg-white/20 hover:bg-white/30 py-2 rounded-lg transition-colors border border-white/20"
                  >
                    <RefreshCw size={12} /> تحديث الرمز الديناميكي
                  </button>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between text-sm border-b border-white/20 pb-2">
                    <span className="text-white/70">الاسم</span>
                    <span className="font-semibold">{child.name}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/20 pb-2">
                    <span className="text-white/70">الهوية الوطنية</span>
                    <span className="font-mono">{child.nationalId}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span className="text-white/70">تاريخ الميلاد</span>
                    <span>{child.dob}</span>
                  </div>
                </div>
              </div>
              
              {/* Security Health Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity size={18} className={currentTheme.text} />
                  الصحة الأمنية
                </h3>
                <div className="flex items-center gap-4 mb-4">
                   <div className="relative w-16 h-16 flex items-center justify-center">
                     <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={securityScore > 80 ? '#10b981' : securityScore > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="4" strokeDasharray={`${securityScore}, 100`} className="animate-[spin_1s_ease-out_reverse]" />
                     </svg>
                     <span className="absolute font-bold text-sm text-slate-700">{securityScore}%</span>
                   </div>
                   <div>
                     <div className="text-sm font-bold text-slate-800">
                        {securityScore > 80 ? 'قوي جداً' : securityScore > 50 ? 'متوسط' : 'ضعيف'}
                     </div>
                     <p className="text-xs text-slate-500">مستوى الحماية الحالي</p>
                   </div>
                </div>
                <button onClick={() => setActiveTab('security')} className={`w-full py-2 rounded-lg text-xs font-bold border transition-colors ${currentTheme.text} ${currentTheme.border} hover:bg-slate-50`}>
                   تحسين الأمان
                </button>
              </div>
            </div>

            {/* Right Column: Analytics & Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Share2, label: 'مشاركة هوية', color: 'blue' },
                  { icon: FileKey, label: 'طلب شهادة', color: 'purple' },
                  { icon: AlertTriangle, label: 'الإبلاغ عن فقدان', color: 'amber' },
                  { icon: Settings, label: 'الإعدادات', color: 'slate', action: () => setActiveTab('settings') },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={item.action}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all group text-right"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${item.color === 'slate' ? 'bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white' : `bg-${item.color}-50 text-${item.color}-600 group-hover:bg-${item.color}-600 group-hover:text-white`}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-slate-700 block text-sm">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">نشاط التحقق الأسبوعي</h3>
                  <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
                    <option>آخر 7 أيام</option>
                    <option>آخر 30 يوم</option>
                  </select>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'السبت', value: 2 }, { name: 'الأحد', value: 5 }, { name: 'الاثنين', value: 3 },
                      { name: 'الثلاثاء', value: 6 }, { name: 'الأربعاء', value: 4 }, { name: 'الخميس', value: 8 }, { name: 'الجمعة', value: 1 }
                    ]}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#888888" stopOpacity={0.1}/> {/* Default gray fallback */}
                          <stop offset="95%" stopColor="#888888" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      {/* Note: In a real app, we'd pass the theme color hex here. For simplicity, keeping default blue-ish or using CSS var if possible */}
                      <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Logs Preview */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">آخر العمليات</h3>
                  <button onClick={() => setActiveTab('ledger')} className={`text-sm ${currentTheme.text} hover:underline`}>عرض الكل</button>
                </div>
                <div className="space-y-1">
                  {childLogs.slice(0, 3).map(log => (
                    <BlockchainLedgerItem key={log.id} log={log} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className={`${currentTheme.lightBg} p-6 rounded-2xl border ${currentTheme.border} flex items-start gap-4`}>
               <Shield className={`${currentTheme.iconColor} mt-1 flex-shrink-0`} size={24} />
               <div>
                 <h3 className={`font-bold ${currentTheme.text} mb-1`}>مركز إدارة المصادقات</h3>
                 <p className={`text-slate-600 text-sm leading-relaxed`}>
                   قم بإضافة وتعديل طرق المصادقة المطلوبة لاستخدام الهوية. يمكنك تعيين شروط مختلفة لكل تطبيق في قسم "الخدمات المرتبطة".
                 </p>
                 <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">قوة الأمان الحالية:</span>
                    <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${securityScore < 50 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all duration-500`} 
                        style={{width: `${securityScore}%`}}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500">{securityScore}%</span>
                 </div>
               </div>
             </div>

             {/* Authentication Table */}
             <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">المصادقات المفعلة</h3>
                  <button onClick={() => {}} className={`flex items-center gap-2 text-sm font-medium ${currentTheme.text} hover:underline`}>
                     <Plus size={16} /> إضافة مصادقة
                  </button>
               </div>
               
               <table className="w-full text-right">
                 <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                   <tr>
                     <th className="px-6 py-4">الطريقة</th>
                     <th className="px-6 py-4">النوع</th>
                     <th className="px-6 py-4">الحالة</th>
                     <th className="px-6 py-4">الإجراءات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-sm">
                   {[
                     { key: 'biometric', label: 'بصمة / وجه', icon: Fingerprint, type: 'Device Auth', active: child.mfaConfig.biometric },
                     { key: 'pin', label: 'رمز PIN', icon: Calculator, type: 'Knowledge', active: child.mfaConfig.pin },
                     { key: 'parentApproval', label: 'موافقة الوالدين', icon: Smartphone, type: 'Remote Auth', active: child.mfaConfig.parentApproval },
                     { key: 'locationCheck', label: 'الموقع الجغرافي', icon: MapPin, type: 'Context', active: child.mfaConfig.locationCheck },
                   ].map((auth) => (
                     <tr key={auth.key} className={auth.active ? 'bg-white' : 'bg-slate-50/50 opacity-60'}>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${auth.active ? currentTheme.lightBg : 'bg-slate-100'} ${auth.active ? currentTheme.text : 'text-slate-400'}`}>
                             <auth.icon size={18} />
                           </div>
                           <span className={`font-medium ${auth.active ? 'text-slate-800' : 'text-slate-500'}`}>{auth.label}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-slate-500">{auth.type}</td>
                       <td className="px-6 py-4">
                         {auth.active ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                             <Check size={10} /> مفعل
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                             <Ban size={10} /> معطل
                           </span>
                         )}
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           {auth.active ? (
                              <>
                                <button onClick={() => {}} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleUpdateMFA(auth.key as any)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="تعطيل">
                                  <Trash2 size={16} />
                                </button>
                              </>
                           ) : (
                              <button onClick={() => handleUpdateMFA(auth.key as any)} className={`px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-slate-50 ${currentTheme.text} border-slate-200`}>
                                تفعيل
                              </button>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* APPS TAB (NEW) */}
        {activeTab === 'apps' && (
           <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">الخدمات المرتبطة</h2>
                    <p className="text-slate-500 text-sm">إدارة الصلاحيات للتطبيقات والمواقع التي تستخدم هذه الهوية</p>
                 </div>
                 <button onClick={() => setShowMarketplace(true)} className={`flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors`}>
                    <Plus size={18} /> ربط تطبيق جديد
                 </button>
              </div>

              {child.linkedApps && child.linkedApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {child.linkedApps.map(app => (
                      <div key={app.id} className={`bg-white p-5 rounded-2xl border ${app.status === 'blocked' ? 'border-red-100 bg-red-50/10' : 'border-slate-100'} shadow-sm flex justify-between items-start group`}>
                         <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              app.category === 'education' ? 'bg-blue-100 text-blue-600' : 
                              app.category === 'game' ? 'bg-emerald-100 text-emerald-600' : 
                              'bg-purple-100 text-purple-600'
                            }`}>
                               {app.category === 'education' ? <School size={24} /> : app.category === 'game' ? <Gamepad2 size={24} /> : <Globe size={24} />}
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-800">{app.name}</h3>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{app.category}</span>
                                  {app.status === 'blocked' && <span className="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded-full font-medium">محظور</span>}
                               </div>
                               <p className="text-xs text-slate-400 mt-2">آخر دخول: {app.lastAccess}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={() => setShowAppPermissions(app.id)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="الصلاحيات">
                                <Settings size={18} />
                             </button>
                             <button onClick={() => toggleLinkedApp(child.id, app.id)} className={`p-2 rounded-lg transition-colors ${app.status === 'active' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`} title={app.status === 'active' ? 'حظر' : 'تفعيل'}>
                                {app.status === 'active' ? <Ban size={18} /> : <Check size={18} />}
                             </button>
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <LinkIcon size={32} />
                   </div>
                   <h3 className="font-bold text-slate-800 mb-1">لا توجد تطبيقات مرتبطة</h3>
                   <p className="text-slate-500 text-sm mb-6">لم يتم ربط هذه الهوية بأي خدمات خارجية بعد.</p>
                   <button onClick={() => setShowMarketplace(true)} className={`text-sm font-bold ${currentTheme.text} hover:underline`}>
                      استعراض متجر التطبيقات المدعومة
                   </button>
                </div>
              )}
           </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
               <div>
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <Network size={20} className={currentTheme.text} />
                   السجل  الموثق
                 </h3>
                 <p className="text-slate-500 text-sm mt-1">سجل غير قابل للتعديل لجميع عمليات التحقق والوصول</p>
               </div>
               <button className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                 <LinkIcon size={12} />
                 تصدير السجل
               </button>
             </div>
             <div className="divide-y divide-slate-100">
               {childLogs.map(log => (
                 <BlockchainLedgerItem key={log.id} log={log} />
               ))}
               {childLogs.length === 0 && (
                 <div className="p-8 text-center text-slate-500">لا توجد سجلات نشاط حتى الآن</div>
               )}
             </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
             {/* Appearance Settings */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Palette size={18} className={currentTheme.text} />
                تخصيص المظهر
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">نمط العرض</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdateLayout('grid')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${child.themeConfig.layout === 'grid' ? `${currentTheme.bg} text-white border-transparent` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <LayoutGrid size={16} /> شبكة
                    </button>
                    <button 
                      onClick={() => handleUpdateLayout('list')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${child.themeConfig.layout === 'list' ? `${currentTheme.bg} text-white border-transparent` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <List size={16} /> قائمة
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">لون السمة</label>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(THEMES) as ThemeColor[]).map((color) => (
                      <button
                        key={color}
                        onClick={() => handleUpdateTheme(color, child.themeConfig.pattern)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${THEMES[color].bg} ${child.themeConfig.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                        aria-label={color}
                      >
                         {child.themeConfig.color === color && <CheckCircle size={16} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-3">النمط الخلفي</label>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     {(['minimal', 'dots', 'abstract', 'waves'] as ThemePattern[]).map((pattern) => (
                       <button
                         key={pattern}
                         onClick={() => handleUpdateTheme(child.themeConfig.color, pattern)}
                         className={`px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${
                           child.themeConfig.pattern === pattern 
                             ? `${currentTheme.lightBg} ${currentTheme.border} ${currentTheme.text}` 
                             : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                         }`}
                       >
                         {pattern === 'minimal' && 'بسيط'}
                         {pattern === 'dots' && 'منقط'}
                         {pattern === 'abstract' && 'تجريدي'}
                         {pattern === 'waves' && 'أمواج'}
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </div>


            {/* Edit Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Edit2 size={18} className={currentTheme.text} />
                تعديل البيانات الأساسية
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم الطفل</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 ${currentTheme.ring} focus:border-transparent outline-none`}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الهوية الوطنية (للقراءة فقط)</label>
                  <input 
                    type="text" 
                    value={child.nationalId}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                  />
                </div>
                <button 
                  onClick={() => {
                    updateChild(child.id, { name: editName });
                    alert('تم تحديث البيانات بنجاح وتسجيل العملية في البلوكتشين');
                  }}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
               <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                 <Trash2 size={18} /> منطقة الخطر
               </h3>
               <p className="text-sm text-red-700 mb-4">
                 حذف الهوية سيؤدي إلى إبطال جميع الشهادات المرتبطة بها وإلغاء إمكانية الوصول. هذا الإجراء نهائي.
               </p>
               <button 
                 onClick={handleDelete}
                 className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
               >
                 حذف الهوية نهائياً
               </button>
            </div>
          </div>
        )}

      </div>
      
      {/* Marketplace Modal */}
      {showMarketplace && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowMarketplace(false)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
                 <XCircle size={24} />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">ربط تطبيق جديد</h2>
              <div className="relative mb-6">
                 <input type="text" placeholder="بحث عن تطبيق..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                 <Scan size={16} className="absolute right-3 top-2.5 text-slate-400" />
              </div>
              
              <div className="space-y-4">
                 <div onClick={() => handleAddApp({name: 'منصة مدرستي', category: 'education', permissions: ['full']})} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">M</div>
                       <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-blue-700">منصة مدرستي</h4>
                          <span className="text-xs text-slate-500">تعليم</span>
                       </div>
                    </div>
                    <Plus size={20} className="text-slate-300 group-hover:text-blue-500" />
                 </div>
                 
                 <div onClick={() => handleAddApp({name: 'Minecraft Education', category: 'game', permissions: ['time-limited']})} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">G</div>
                       <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-emerald-700">Minecraft Education</h4>
                          <span className="text-xs text-slate-500">ألعاب تعليمية</span>
                       </div>
                    </div>
                    <Plus size={20} className="text-slate-300 group-hover:text-emerald-500" />
                 </div>

                 <div onClick={() => handleAddApp({name: 'Roblox', category: 'game', permissions: ['read-only']})} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-red-50 hover:border-red-200 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">R</div>
                       <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-red-700">Roblox</h4>
                          <span className="text-xs text-slate-500">ترفيه</span>
                       </div>
                    </div>
                    <Plus size={20} className="text-slate-300 group-hover:text-red-500" />
                 </div>

                 <div onClick={() => handleAddApp({name: 'Khan Academy Kids', category: 'education', permissions: ['full']})} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-green-50 hover:border-green-200 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">K</div>
                       <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-green-700">Khan Academy Kids</h4>
                          <span className="text-xs text-slate-500">تعليم</span>
                       </div>
                    </div>
                    <Plus size={20} className="text-slate-300 group-hover:text-green-500" />
                 </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                 <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">مطور تطبيقات؟</h4>
                    <p className="text-xs text-slate-500 mb-3">استخدم Nawa API لدمج نظام المصادقة الآمن في تطبيقاتك التعليمية.</p>
                    <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-medium">التوثيق التقني</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showAppPermissions && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                <button onClick={() => setShowAppPermissions(null)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
                   <XCircle size={24} />
                </button>
                <div className="text-center mb-6">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield size={32} />
                   </div>
                   <h2 className="text-xl font-bold text-slate-900">صلاحيات التطبيق</h2>
                   <p className="text-slate-500 text-sm">تحكم في البيانات التي يمكن لهذا التطبيق الوصول إليها</p>
                </div>

                <div className="space-y-4 mb-6">
                   <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                         <User size={18} className="text-slate-400" />
                         <span className="text-sm font-medium text-slate-700">الاسم والصورة</span>
                      </div>
                      <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                   <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                         <Calculator size={18} className="text-slate-400" />
                         <span className="text-sm font-medium text-slate-700">تاريخ الميلاد (العمر)</span>
                      </div>
                      <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                   <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                         <MapPin size={18} className="text-slate-400" />
                         <span className="text-sm font-medium text-slate-700">الموقع الجغرافي</span>
                      </div>
                      <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                </div>

                <button onClick={() => setShowAppPermissions(null)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">
                   حفظ الإعدادات
                </button>
             </div>
         </div>
      )}
    </div>
  );
};

// --- Verifier Portal (ZKP Simulation) ---
const VerifierPortal = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState(0); // 0: Scan, 1: Processing ZKP, 2: Result
  
  const handleScan = () => {
    setStep(1);
    setTimeout(() => setStep(2), 2500); // Simulate ZKP calculation time
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white z-50">
        <XCircle size={32} />
      </button>

      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 mb-4">
            <Scan size={14} className="text-emerald-400" />
            <span className="text-xs font-mono text-emerald-300">SECURE VERIFIER NODE</span>
          </div>
          <h2 className="text-3xl font-bold">بوابة التحقق الآمنة</h2>
        </div>

        {step === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center animate-in zoom-in duration-300">
            <div className="w-64 h-64 mx-auto bg-black/20 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center mb-6 relative overflow-hidden group cursor-pointer" onClick={handleScan}>
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
              <Scan size={48} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
              <p className="absolute bottom-4 text-xs text-white/40">اضغط للمحاكاة</p>
            </div>
            <p className="text-slate-400 mb-6">قم بتوجيه الكاميرا نحو رمز QR الخاص بالطفل</p>
            <button onClick={handleScan} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
              مسح الرمز
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
               <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
               <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-emerald-500 border-l-transparent rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Database size={32} className="text-emerald-400" />
               </div>
            </div>
            <h3 className="text-xl font-bold mb-2">جاري معالجة إثبات المعرفة الصفرية (ZKP)</h3>
            <div className="space-y-2 text-xs font-mono text-emerald-400/80 my-6 bg-black/30 p-4 rounded-lg text-left overflow-hidden">
               <p> Fetching DID Document...</p>
               <p> Verifying Merkle Proof...</p>
               <p> Calculating zk-SNARK witness...</p>
               <p className="animate-pulse"> Validating constraints...</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-emerald-500 text-white rounded-3xl p-8 text-center shadow-2xl shadow-emerald-500/40 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">تم التحقق بنجاح!</h3>
            <p className="text-emerald-100 mb-8">الهوية صحيحة ونشطة. العمر أكبر من 6 سنوات.</p>
            
            <div className="bg-black/10 rounded-xl p-4 text-left space-y-2 mb-8 border border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">الحالة</span>
                <span className="font-bold">نشط</span>
              </div>
               <div className="flex justify-between text-sm">
                <span className="text-emerald-100">المُصدر</span>
                <span className="font-bold">وزارة الداخلية (MOI)</span>
              </div>
               <div className="flex justify-between text-sm">
                <span className="text-emerald-100">بيانات مكشوفة</span>
                <span className="font-bold text-xs bg-white/20 px-2 py-0.5 rounded">لا شيء (ZKP)</span>
              </div>
            </div>

            <button onClick={() => setStep(0)} className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
              تحقق جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- App Container & Router ---

const App = () => {
  const { user, isAuthenticated } = useAppContext();
  const [currentView, setCurrentView] = useState('landing');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Simple Router Logic
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onStart={() => setCurrentView(isAuthenticated ? 'dashboard' : 'login')} onVerify={() => setCurrentView('verifier')} />;
      case 'dashboard':
        if (!isAuthenticated) return <div className="p-8 text-center">يرجى تسجيل الدخول</div>;
        return <ParentDashboard onViewChild={(id) => { setSelectedChildId(id); setCurrentView('child-details'); }} />;
      case 'child-details':
        if (!isAuthenticated || !selectedChildId) return <div className="p-8 text-center">حدث خطأ</div>;
        return <ChildControlCenter childId={selectedChildId} onBack={() => setCurrentView('dashboard')} />;
      case 'login':
        return <AuthLogin onLogin={() => setCurrentView('dashboard')} onRegister={() => setCurrentView('register')} />;
      case 'register':
         return <AuthRegister onRegister={() => setCurrentView('dashboard')} onLogin={() => setCurrentView('login')} />;
      case 'verifier':
        return <VerifierPortal onBack={() => setCurrentView('landing')} />;
      default:
        return <LandingPage onStart={() => {}} onVerify={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
      {currentView !== 'verifier' && <Header onViewChange={setCurrentView} />}
      <main className="fade-in">
        {renderView()}
      </main>
    </div>
  );
};

// --- Parent Dashboard (Updated) ---
const ParentDashboard = ({ onViewChild }: { onViewChild: (id: string) => void }) => {
  const { user, children, addChild } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [step, setStep] = useState(1);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDob, setNewChildDob] = useState('');
  const [newChildId, setNewChildId] = useState('');
  const [newChildMFA, setNewChildMFA] = useState<MFAConfig>({
    biometric: false,
    pin: false,
    parentApproval: true,
    locationCheck: false
  });
  const [newChildTheme, setNewChildTheme] = useState<ThemeConfig>({
    color: 'indigo',
    pattern: 'abstract',
    layout: 'grid'
  });

  const handleAddChild = () => {
    addChild({
      name: newChildName,
      dob: newChildDob,
      nationalId: newChildId,
      gender: 'male', // Simplified for demo
      mfaConfig: newChildMFA,
      themeConfig: newChildTheme
    });
    resetForm();
  };

  const resetForm = () => {
    setShowAddModal(false);
    setStep(1);
    setNewChildName('');
    setNewChildDob('');
    setNewChildId('');
    setNewChildMFA({ biometric: false, pin: false, parentApproval: true, locationCheck: false });
    setNewChildTheme({ color: 'indigo', pattern: 'abstract', layout: 'grid' });
  };

  const handleToggleMFA = (key: keyof MFAConfig) => {
    setNewChildMFA(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else handleAddChild();
  };

  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-between mb-8 relative">
       <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 rounded-full"></div>
       <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary-200 -z-10 rounded-full transition-all duration-300" style={{width: `${((currentStep-1)/2)*100}%`}}></div>
       
       {[1, 2, 3].map(i => (
         <div key={i} className={`flex flex-col items-center gap-2 ${i <= currentStep ? 'text-primary-600' : 'text-slate-400'}`}>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${i <= currentStep ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white border-2 border-slate-200'}`}>
             {i < currentStep ? <Check size={16} /> : i}
           </div>
           <span className="text-xs font-medium bg-white px-2">
             {i === 1 && 'البيانات'}
             {i === 2 && 'الأمان'}
             {i === 3 && 'المظهر'}
           </span>
         </div>
       ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">مرحباً، {user?.name} 👋</h1>
          <p className="text-slate-500 mt-1">لديك {children.length} هويات نشطة لأطفالك.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
        >
          <Plus size={20} />
          إضافة هوية جديدة
        </button>
      </div>

      <div className={`grid gap-6 ${children[0]?.themeConfig?.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {children.map(child => (
          <div key={child.id} onClick={() => onViewChild(child.id)} className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary-100 transition-all cursor-pointer group relative overflow-hidden ${children[0]?.themeConfig?.layout === 'list' ? 'flex items-center justify-between' : ''}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-teal-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            
            <div className={`flex items-start ${children[0]?.themeConfig?.layout === 'list' ? 'gap-6' : 'justify-between mb-6'}`}>
              <div className="relative">
                <img src={child.photoUrl} alt={child.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center ${child.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  {child.status === 'active' && <CheckCircle size={12} className="text-white" />}
                </div>
              </div>
              
              {children[0]?.themeConfig?.layout === 'list' && (
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{child.name}</h3>
                    <p className="text-sm text-slate-500">تاريخ الميلاد: {child.dob}</p>
                 </div>
              )}

              {children[0]?.themeConfig?.layout !== 'list' && (
                  <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-primary-50 transition-colors">
                    <ChevronRight className="text-slate-400 group-hover:text-primary-500 rotate-180" />
                  </div>
              )}
            </div>

            {children[0]?.themeConfig?.layout !== 'list' && (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{child.name}</h3>
                <p className="text-sm text-slate-500 mb-6">تاريخ الميلاد: {child.dob}</p>
              </>
            )}

            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                <Shield size={12} /> ZKP محمي
              </span>
               <span className="flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg">
                <Database size={12} /> مسجل
              </span>
            </div>

            {children[0]?.themeConfig?.layout === 'list' && (
               <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-primary-50 transition-colors">
                  <ChevronRight className="text-slate-400 group-hover:text-primary-500 rotate-180" />
               </div>
            )}
          </div>
        ))}
        
        <button onClick={() => setShowAddModal(true)} className={`border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-all ${children[0]?.themeConfig?.layout === 'list' ? 'h-full min-h-[100px]' : 'min-h-[260px]'}`}>
          <div className={`bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-white ${children[0]?.themeConfig?.layout === 'list' ? 'w-10 h-10 mb-0 mr-4' : 'w-16 h-16 mb-4'}`}>
            <Plus size={children[0]?.themeConfig?.layout === 'list' ? 20 : 32} />
          </div>
          <span className="font-medium">إضافة طفل جديد</span>
        </button>
      </div>

      {/* Add Child Wizard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={resetForm} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">إصدار هوية جديدة</h2>
            
            <StepIndicator currentStep={step} />

            <form onSubmit={handleNext} className="space-y-6">
              
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل</label>
                    <input required type="text" value={newChildName} onChange={e => setNewChildName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="مثال: خالد محمد" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهوية الوطنية</label>
                    <input required type="text" value={newChildId} onChange={e => setNewChildId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="10xxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الميلاد</label>
                    <input required type="date" value={newChildDob} onChange={e => setNewChildDob(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                  </div>
                </div>
              )}

              {/* Step 2: Security & MFA */}
              {step === 2 && (
                <div className="space-y-3 animate-in slide-in-from-right-4 fade-in">
                  <div className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100 flex items-start gap-3">
                     <Shield size={18} className="text-blue-600 mt-0.5 shrink-0" />
                     <p className="text-sm text-blue-800 leading-relaxed">
                       يمكنك تفعيل أكثر من خيار في نفس الوقت (Multi-Factor). سيقوم النظام بدمج هذه الخيارات في الهوية الرقمية لضمان أعلى مستويات الأمان.
                     </p>
                  </div>
                  <MFAToggle 
                     label="بصمة حيوية" 
                     description="إلزامية البصمة عند الاستخدام"
                     icon={Fingerprint}
                     enabled={newChildMFA.biometric}
                     onChange={() => handleToggleMFA('biometric')}
                   />
                   <MFAToggle 
                     label="رمز PIN" 
                     description="طلب رمز 4 أرقام"
                     icon={Calculator}
                     enabled={newChildMFA.pin}
                     onChange={() => handleToggleMFA('pin')}
                   />
                   <MFAToggle 
                     label="موافقة الأهل" 
                     description="إشعار للموافقة الفورية"
                     icon={Smartphone}
                     enabled={newChildMFA.parentApproval}
                     onChange={() => handleToggleMFA('parentApproval')}
                   />
                   <MFAToggle 
                     label="التحقق الجغرافي" 
                     description="حصر الاستخدام في مناطق آمنة"
                     icon={MapPin}
                     enabled={newChildMFA.locationCheck}
                     onChange={() => handleToggleMFA('locationCheck')}
                   />
                </div>
              )}

              {/* Step 3: Appearance */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">لون الهوية</label>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {(Object.keys(THEMES) as ThemeColor[]).map((color) => (
                          <button
                            type="button"
                            key={color}
                            onClick={() => setNewChildTheme(prev => ({ ...prev, color }))}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${THEMES[color].bg} ${newChildTheme.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                          >
                             {newChildTheme.color === color && <CheckCircle size={16} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-3">النمط الخلفي</label>
                       <div className="grid grid-cols-2 gap-3">
                         {(['minimal', 'dots', 'abstract', 'waves'] as ThemePattern[]).map((pattern) => (
                           <button
                             type="button"
                             key={pattern}
                             onClick={() => setNewChildTheme(prev => ({ ...prev, pattern }))}
                             className={`px-3 py-3 border rounded-xl text-sm font-medium transition-all ${
                               newChildTheme.pattern === pattern 
                                 ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' 
                                 : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                             }`}
                           >
                             {pattern === 'minimal' && 'بسيط'}
                             {pattern === 'dots' && 'منقط'}
                             {pattern === 'abstract' && 'تجريدي'}
                             {pattern === 'waves' && 'أمواج'}
                           </button>
                         ))}
                       </div>
                    </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setStep(step - 1)}
                    className="flex-1 bg-white text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    السابق
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-[2] bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                  {step === 3 ? (
                    <>
                      <Sparkles size={18} />
                      إصدار الهوية
                    </>
                  ) : (
                    <>
                      التالي
                      <ArrowRight size={18} className="rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Auth Components (Simplified) ---

const AuthLogin = ({ onLogin, onRegister }: { onLogin: () => void, onRegister: () => void }) => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    onLogin();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <User size={32} />
           </div>
           <h2 className="text-2xl font-bold text-slate-900">تسجيل الدخول</h2>
           <p className="text-slate-500 mt-2">مرحباً بعودتك إلى منصة نواه</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="name@example.com" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
             <input required type="password" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all mt-2">
            دخول
          </button>
        </form>
        <div className="text-center mt-6">
          <button onClick={onRegister} className="text-primary-600 font-medium hover:underline text-sm">لا تملك حساباً؟ سجل الآن</button>
        </div>
      </div>
    </div>
  );
};

const AuthRegister = ({ onRegister, onLogin }: { onRegister: () => void, onLogin: () => void }) => {
    const { login } = useAppContext(); // Simulate auto login after register
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email);
        onRegister();
    };

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 w-full max-w-md">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Shield size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900">إنشاء حساب ولي أمر</h2>
             <p className="text-slate-500 mt-2">ابدأ رحلة الأمان الرقمي لعائلتك</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأول</label>
                  <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم العائلة</label>
                  <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
               </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">رقم الجوال</label>
               <input required type="tel" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="05xxxxxxxx" />
            </div>
            <button type="submit" className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-all mt-4 shadow-lg shadow-primary-500/20">
              إنشاء الحساب
            </button>
          </form>
           <div className="text-center mt-6">
            <button onClick={onLogin} className="text-slate-600 font-medium hover:text-primary-600 text-sm">لديك حساب بالفعل؟ تسجيل الدخول</button>
          </div>
        </div>
      </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <AppProvider>
    <App />
  </AppProvider>
);
