import React from 'react';
import { Palette, GraduationCap, Home, ArrowLeft, Moon, Sun } from 'lucide-react';
import { UserRole, AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onResetRole: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentRole, 
  currentView, 
  onNavigate, 
  onResetRole,
  isDarkMode,
  onToggleDarkMode
}) => {
  
  const isHome = currentView === AppView.HOME;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen flex flex-col font-sans transition-colors duration-300`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer" onClick={() => onNavigate(AppView.HOME)}>
                <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">EduArt CV</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Plàstica i Visual - Comunitat Valenciana</p>
                </div>
              </div>

              <nav className="flex items-center space-x-2">
                {/* Dark Mode Toggle */}
                <button
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors mr-2"
                  title={isDarkMode ? "Mode Clar" : "Mode Fosc"}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {!isHome && (
                   <button 
                   onClick={() => onNavigate(AppView.HOME)}
                   className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                   title="Inici"
                 >
                   <Home className="h-5 w-5" />
                 </button>
                )}
                {currentRole !== UserRole.NONE && (
                   <button 
                   onClick={onResetRole}
                   className="flex items-center px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                 >
                   <ArrowLeft className="h-4 w-4 mr-1" />
                   Eixir
                 </button>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Desenvolupat amb Tecnologia Gemini 
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0 text-sm text-slate-400 dark:text-slate-500">
                <span>Per a docents i alumnes</span>
                <span>•</span>
                <span>EduArt CV © {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;