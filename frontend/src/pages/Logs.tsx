import React, { useState, useEffect } from 'react';
import { Clock, Activity, Filter, Search } from 'lucide-react';
import { logsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') params.action = filter;
      
      const response = await logsAPI.getAll(params);
      setLogs(response.data.logs);
    } catch (error) {
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const colors: any = {
      login: 'text-green-400 bg-green-500/10',
      logout: 'text-gray-400 bg-gray-500/10',
      upload: 'text-blue-400 bg-blue-500/10',
      delete: 'text-red-400 bg-red-500/10',
      create: 'text-purple-400 bg-purple-500/10',
      update: 'text-yellow-400 bg-yellow-500/10',
      view: 'text-cyan-400 bg-cyan-500/10',
    };
    return colors[action] || 'text-gray-400 bg-gray-500/10';
  };

  const actions = [
    { key: 'all', label: 'Todos' },
    { key: 'login', label: 'Login' },
    { key: 'logout', label: 'Logout' },
    { key: 'upload', label: 'Uploads' },
    { key: 'delete', label: 'Exclusões' },
    { key: 'create', label: 'Criações' },
    { key: 'update', label: 'Atualizações' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white">
          <span className="font-semibold">Logs</span>
        </h1>
        <p className="text-gray-500 mt-2">Registro de atividades do sistema</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-8 overflow-x-auto">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => setFilter(action.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === action.key
                ? 'bg-white text-gray-950'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum log encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="card flex items-center justify-between hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActionColor(log.action)}`}>
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">{log.description}</p>
                  <p className="text-sm text-gray-400">
                    {log.entity_type && `${log.entity_type} • `}
                    {log.ip_address}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Logs;