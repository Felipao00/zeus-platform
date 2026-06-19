import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Image, FolderOpen, 
  StickyNote, Link2, Shield, Search, Settings, 
  LogOut, Menu, X, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/app/files', icon: FileText, label: 'Arquivos' },
    { to: '/app/photos', icon: Image, label: 'Fotos' },
    { to: '/app/projects', icon: FolderOpen, label: 'Projetos' },
    { to: '/app/notes', icon: StickyNote, label: 'Notas' },
    { to: '/app/links', icon: Link2, label: 'Links' },
    { to: '/app/vault', icon: Shield, label: 'Cofre' },
    { to: '/app/search', icon: Search, label: 'Buscar' },
    { to: '/app/logs', icon: Clock, label: 'Logs' },
    { to: '/app/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-gray-900 border-r border-gray-800
        transform transition-all duration-300 ease-in-out lg:translate-x-0
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        w-72
      `}>
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-gray-800 flex-shrink-0 ${collapsed ? 'lg:justify-center lg:px-2' : 'px-6'}`}>
          <div className="relative group cursor-pointer" onClick={() => navigate('/app/dashboard')}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-700 group-hover:border-gray-500 transition-all shadow-lg">
              <Shield className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
          </div>
          {!collapsed && (
            <div className="ml-3 lg:block hidden">
              <h1 className="text-xl font-bold text-white tracking-tight">ZEUS</h1>
              <p className="text-xs text-gray-500">Cofre Digital</p>
            </div>
          )}
          <div className="ml-3 lg:hidden">
            <h1 className="text-xl font-bold text-white tracking-tight">ZEUS</h1>
            <p className="text-xs text-gray-500">Cofre Digital</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center px-3 py-3 rounded-xl text-sm font-medium 
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
                ${collapsed ? 'lg:justify-center lg:px-2' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              <item.icon className={`
                w-5 h-5 flex-shrink-0 transition-all duration-200
                group-hover:scale-110 group-hover:rotate-3
                ${collapsed ? 'lg:mr-0' : 'mr-3'}
              `} />
              {!collapsed && <span className="lg:block hidden">{item.label}</span>}
              <span className="lg:hidden">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Botão de Recolher/Expandir */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-gray-800 rounded-full 
                     border border-gray-700 items-center justify-center hover:bg-gray-700 
                     transition-all z-50 shadow-lg hover:scale-110"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>

        {/* User Info */}
        {user && (
          <div className={`p-4 border-t border-gray-800 ${collapsed ? 'lg:p-2' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'lg:justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-300">
                  {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 lg:block hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className={`p-3 border-t border-gray-800 ${collapsed ? 'lg:p-2' : ''}`}>
          <button
            onClick={logout}
            className={`
              flex items-center w-full rounded-xl text-sm font-medium
              text-gray-400 hover:text-red-400 hover:bg-red-400/10 
              transition-all duration-200 group
              ${collapsed ? 'lg:justify-center lg:px-2 py-3' : 'px-4 py-3'}
            `}
          >
            <LogOut className={`w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0 ${collapsed ? 'lg:mr-0' : 'mr-3'}`} />
            {!collapsed && <span className="lg:block hidden">Sair do ZEUS</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300
        ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}
        ml-0
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-white" />
            <span className="text-lg font-bold text-white">ZEUS</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;