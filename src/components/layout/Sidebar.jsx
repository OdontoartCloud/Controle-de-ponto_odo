import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Building2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const sidebarWidth = isCollapsed ? '4rem' : '16rem';
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [isCollapsed]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : prefersDark;

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard'
    },
    // {
    //   icon: Users,
    //   label: 'Usuários',
    //   path: '/usuarios'
    // },
    {
      icon: Clock,
      label: 'Registros',
      path: '/registros'
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const ThemeIcon = isDarkMode ? Sun : Moon;
  const themeLabel = isDarkMode ? 'Modo claro' : 'Modo noturno';

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Controle de Ponto</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out dark:bg-gray-900 dark:border-gray-800
        lg:translate-x-0 lg:flex lg:flex-col lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <div className="relative bg-white h-full flex flex-col dark:bg-gray-900">
      {/* Logo */}
          <div
            className={`border-b border-gray-200 hidden lg:flex lg:items-center dark:border-gray-800 ${
              isCollapsed ? 'p-3 justify-center' : 'p-6 justify-between'
            }`}
          >
            <div
              className={`flex items-center gap-3 ${isCollapsed ? 'w-full justify-center' : ''}`}
            >
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Controle de Ponto</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de Gestão</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="p-2 hover:bg-gray-100 absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
      </div>

      {/* Navigation */}
          <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
            
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

      {/* Logout Button */}
          <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-800`}>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-800`}
                onClick={handleToggleTheme}
                title={isCollapsed ? themeLabel : ''}
                aria-label={themeLabel}
                aria-pressed={isDarkMode}
              >
                <ThemeIcon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && themeLabel}
              </Button>
              <Button
                variant="ghost"
                className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-200 dark:hover:text-red-400 dark:hover:bg-red-950/40`}
                onClick={handleSignOut}
                title={isCollapsed ? 'Sair' : ''}
              >
                <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && 'Sair'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
