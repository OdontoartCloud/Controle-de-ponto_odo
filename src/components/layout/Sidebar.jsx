import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings, 
  LogOut,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Controle de Ponto</span>
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
        fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <div className="relative bg-white h-full flex flex-col">
      {/* Logo */}
          <div className="p-6 border-b border-gray-200 hidden lg:flex lg:items-center lg:justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <span className="text-xl font-bold text-gray-900">Controle de Ponto</span>
                  <p className="text-sm text-gray-500">Sistema de Gestão</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="p-2 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="p-2 hover:bg-gray-100 absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow-sm"
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
          <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
            <Button
              variant="ghost"
              className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} text-gray-700 hover:text-red-600 hover:bg-red-50`}
              onClick={handleSignOut}
              title={isCollapsed ? 'Sair' : ''}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {!isCollapsed && 'Sair'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
