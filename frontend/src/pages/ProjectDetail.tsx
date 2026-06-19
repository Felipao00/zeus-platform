import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Calendar, TrendingUp, Clock, FileText, Image, Link2, StickyNote, Plus } from 'lucide-react';
import { projectsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(Number(id));
      setProject(response.data.project);
    } catch (error) {
      toast.error('Erro ao carregar projeto');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Excluir este projeto?')) return;
    try {
      await projectsAPI.delete(Number(id));
      toast.success('Projeto excluído!');
      navigate('/projects');
    } catch (error) {
      toast.error('Erro ao excluir projeto');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'text-green-400 bg-green-500/10',
      completed: 'text-blue-400 bg-blue-500/10',
      paused: 'text-yellow-400 bg-yellow-500/10',
      archived: 'text-gray-400 bg-gray-500/10',
    };
    return colors[status] || 'text-gray-400 bg-gray-500/10';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Projeto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color || '#3B82F6' }}
              />
              <h1 className="text-3xl font-semibold text-white">{project.name}</h1>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className={`badge ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <span className="text-gray-500">
                Criado em {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/projects/${id}/edit`)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit3 size={18} />
            <span>Editar</span>
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center space-x-2"
          >
            <Trash2 size={18} />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <div className="card">
              <h2 className="text-lg font-medium text-white mb-3">Descrição</h2>
              <p className="text-gray-400">{project.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className="card">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Progresso
            </h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completo</span>
              <span className="text-white font-medium">{project.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressColor(project.progress || 0)}`}
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Anexos</h2>
              <button className="btn-secondary text-sm py-2 px-3 flex items-center space-x-1">
                <Plus size={16} />
                <span>Adicionar</span>
              </button>
            </div>
            <p className="text-gray-500 text-sm">Nenhum anexo ainda</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="card">
            <h2 className="text-lg font-medium text-white mb-4">Detalhes</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`badge ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Prioridade</span>
                <span className="text-white text-sm">{project.priority}</span>
              </div>
              {project.start_date && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Início
                  </span>
                  <span className="text-white text-sm">
                    {format(new Date(project.start_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
              {project.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm flex items-center">
                    <Clock size={14} className="mr-1" />
                    Prazo
                  </span>
                  <span className="text-white text-sm">
                    {format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          {project.category_name && (
            <div className="card">
              <h2 className="text-lg font-medium text-white mb-3">Categoria</h2>
              <span className="badge bg-gray-800 text-gray-400">
                {project.category_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;