import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, FolderOpen, Edit3, Trash2, 
  Play, CheckCircle, Archive, Pause, Calendar, Clock
} from 'lucide-react';
import { projectsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusIcons: any = { active: Play, completed: CheckCircle, archived: Archive, paused: Pause };
const statusColors: any = {
  active: 'text-green-400 bg-green-500/10',
  completed: 'text-blue-400 bg-blue-500/10',
  archived: 'text-gray-400 bg-gray-500/10',
  paused: 'text-yellow-400 bg-yellow-500/10',
};
const priorityColors: any = { low: 'bg-gray-500', medium: 'bg-yellow-500', high: 'bg-orange-500', urgent: 'bg-red-500' };

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', status: 'active', priority: 'medium',
    category_id: '', start_date: '', end_date: '', deadline: '', color: '#3B82F6',
  });

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [selectedCategory, selectedStatus]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;
      const response = await projectsAPI.getAll(params);
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll('project');
      setCategories(response.data.categories);
    } catch (error) {}
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) { toast.error('Nome do projeto é obrigatório'); return; }
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, formData);
        toast.success('Projeto atualizado!');
      } else {
        await projectsAPI.create(formData);
        toast.success('Projeto criado!');
      }
      setShowCreateModal(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      toast.error('Erro ao salvar projeto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este projeto?')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Projeto excluído!');
      fetchProjects();
    } catch (error) {
      toast.error('Erro ao excluir projeto');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'active', priority: 'medium', category_id: '', start_date: '', end_date: '', deadline: '', color: '#3B82F6' });
    setEditingProject(null);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name, description: project.description || '', status: project.status,
      priority: project.priority, category_id: project.category_id || '',
      start_date: project.start_date || '', end_date: project.end_date || '',
      deadline: project.deadline || '', color: project.color || '#3B82F6',
    });
    setShowCreateModal(true);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projetos</h1>
          <p className="text-gray-400 mt-2">Gerencie seus projetos e tarefas</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn btn-primary">
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="input-with-icon w-full sm:flex-1 sm:max-w-md">
          <Search className="search-icon w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar projetos..." />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 sm:flex-none sm:w-44">
            <option value="">Todas categorias</option>
            {categories.map((cat: any) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="flex-1 sm:flex-none sm:w-40">
            <option value="">Todos status</option>
            <option value="active">Ativos</option>
            <option value="completed">Concluídos</option>
            <option value="paused">Pausados</option>
            <option value="archived">Arquivados</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum projeto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const StatusIcon = statusIcons[project.status] || Play;
            const statusColor = statusColors[project.status] || 'text-gray-400 bg-gray-500/10';
            const priorityColor = priorityColors[project.priority] || 'bg-gray-500';
            return (
              <div key={project.id} className="card group cursor-pointer hover:bg-gray-800/50 transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color || '#3B82F6' }} />
                    <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(project); }} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {project.description && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>}

                <div className="flex items-center gap-2 mb-4">
                  <span className={`badge ${statusColor} flex items-center gap-1`}><StatusIcon size={12} /><span>{project.status}</span></span>
                  <span className={`w-2 h-2 rounded-full ${priorityColor}`} />
                  <span className="text-xs text-gray-500">{project.priority}</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-gray-300">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${getProgressColor(project.progress || 0)}`} style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1"><Calendar size={12} /><span>{format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}</span></div>
                  {project.deadline && <div className="flex items-center gap-1"><Clock size={12} /><span>{format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><Plus size={20} className="rotate-45" /></button>
            </div>

            <div className="space-y-4">
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do projeto *" autoFocus />
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva o projeto..." rows={3} />

              <div className="grid grid-cols-2 gap-4">
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="active">Ativo</option><option value="paused">Pausado</option><option value="completed">Concluído</option><option value="archived">Arquivado</option>
                </select>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="urgent">Urgente</option>
                </select>
                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
                  <option value="">Categoria</option>
                  {categories.map((cat: any) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cor</label>
                  <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer" />
                </div>
                <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} placeholder="Data de início" />
                <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} placeholder="Data de término" />
                <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} placeholder="Prazo final" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleCreate} className="btn btn-primary">{editingProject ? 'Salvar' : 'Criar Projeto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;