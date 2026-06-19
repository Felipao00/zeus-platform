import React, { useState, useEffect } from 'react';
import { 
  FileText, Image, FolderOpen, StickyNote, 
  HardDrive, Activity, Upload, TrendingUp,
  Clock, Shield, Database, Sparkles
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalFiles: 0, totalPhotos: 0, totalProjects: 0, totalNotes: 0, totalLinks: 0,
    storageUsed: 0, storageLimit: 10737418240, recentActivities: [], storageByType: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cards = [
    { 
      icon: FileText, label: 'Arquivos', value: stats.totalFiles, 
      color: 'from-blue-600 to-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400',
      iconBg: 'bg-blue-500/20', glow: 'shadow-blue-500/20'
    },
    { 
      icon: Image, label: 'Fotos', value: stats.totalPhotos,
      color: 'from-purple-600 to-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400',
      iconBg: 'bg-purple-500/20', glow: 'shadow-purple-500/20'
    },
    { 
      icon: FolderOpen, label: 'Projetos', value: stats.totalProjects,
      color: 'from-green-600 to-green-400', bg: 'bg-green-500/10', text: 'text-green-400',
      iconBg: 'bg-green-500/20', glow: 'shadow-green-500/20'
    },
    { 
      icon: StickyNote, label: 'Notas', value: stats.totalNotes,
      color: 'from-yellow-600 to-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20', glow: 'shadow-yellow-500/20'
    },
  ];

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">ZEUS</span>
          <span className="text-gray-500 ml-3 font-light">Dashboard</span>
        </h1>
        <p className="text-gray-500 mt-2">Visão geral da sua central digital privada</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group relative bg-gray-900 rounded-2xl border border-gray-800 p-6
                       hover:border-gray-700 transition-all duration-500 cursor-pointer
                       hover:scale-[1.02] hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                          transition-opacity duration-500 blur-xl ${card.glow}`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center
                              group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-7 h-7 ${card.text}`} />
                </div>
                <div className={`w-2 h-2 rounded-full ${card.text} opacity-0 group-hover:opacity-100 
                              transition-all duration-300 group-hover:shadow-lg group-hover:shadow-current`} />
              </div>
              
              <h3 className="text-gray-400 text-sm font-medium mb-2">{card.label}</h3>
              <p className="text-4xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                {card.value}
              </p>
              
              {/* Bottom gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} 
                            rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Storage & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <HardDrive className="w-5 h-5 text-gray-400" />
            Armazenamento
          </h2>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">{formatBytes(stats.storageUsed)} de {formatBytes(stats.storageLimit)}</span>
              <span className="text-gray-300">{storagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                  storagePercentage > 90 ? 'from-red-600 to-red-400' :
                  storagePercentage > 70 ? 'from-yellow-600 to-yellow-400' :
                  'from-blue-600 to-blue-400'
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-800">
            {[
              { label: 'Documentos', value: stats.storageByType?.documents || 0 },
              { label: 'Imagens', value: stats.storageByType?.images || 0 },
              { label: 'Vídeos', value: stats.storageByType?.videos || 0 },
              { label: 'Outros', value: stats.storageByType?.others || 0 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-gray-300">{formatBytes(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-gray-400" />
            Atividades Recentes
          </h2>

          <div className="space-y-3">
            {stats.recentActivities?.length > 0 ? (
              stats.recentActivities.slice(0, 8).map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-all group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.action === 'upload' ? 'bg-blue-500/10 text-blue-400' :
                    activity.action === 'delete' ? 'bg-red-500/10 text-red-400' :
                    activity.action === 'create' ? 'bg-green-500/10 text-green-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {activity.action === 'upload' ? <Upload size={16} /> :
                     activity.action === 'delete' ? <Activity size={16} /> :
                     <Sparkles size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {new Date(activity.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;