import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Link2, ExternalLink, Star, Trash2, Copy, X
} from 'lucide-react';
import { linksAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Links: React.FC = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', url: '', description: '', category_id: '' });

  useEffect(() => {
    fetchLinks();
    fetchCategories();
  }, [selectedCategory, showFavorites]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (showFavorites) params.favorite = true;
      if (search) params.search = search;
      const response = await linksAPI.getAll(params);
      setLinks(response.data.links);
    } catch (error) {
      toast.error('Erro ao carregar links');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll('link');
      setCategories(response.data.categories);
    } catch (error) {}
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error('Nome e URL são obrigatórios');
      return;
    }
    let url = formData.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    try {
      if (editingLink) {
        await linksAPI.update(editingLink.id, { ...formData, url });
        toast.success('Link atualizado!');
      } else {
        await linksAPI.create({ ...formData, url });
        toast.success('Link salvo!');
      }
      setShowModal(false);
      resetForm();
      fetchLinks();
    } catch (error) {
      toast.error('Erro ao salvar link');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este link?')) return;
    try {
      await linksAPI.delete(id);
      toast.success('Link removido!');
      fetchLinks();
    } catch (error) {
      toast.error('Erro ao remover link');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada!');
  };

  const handleEdit = (link: any) => {
    setEditingLink(link);
    setFormData({ name: link.name, url: link.url, description: link.description || '', category_id: link.category_id || '' });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', url: '', description: '', category_id: '' });
    setEditingLink(null);
  };

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  };

  const getFavicon = (url: string) => `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=32`;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Links</h1>
          <p className="text-gray-400 mt-2">Salve e organize seus links importantes</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
          <Plus size={18} />
          Novo Link
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="input-with-icon w-full sm:flex-1 sm:max-w-md">
          <Search className="search-icon w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar links..." />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 sm:flex-none sm:w-44">
            <option value="">Todas categorias</option>
            {categories.map((cat: any) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
          <button onClick={() => setShowFavorites(!showFavorites)}
            className={`btn ${showFavorites ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>
            <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Favoritos</span>
          </button>
        </div>
      </div>

      {/* Links Grid */}
      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto" /></div>
      ) : links.length === 0 ? (
        <div className="text-center py-16">
          <Link2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum link salvo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {links.map((link) => (
            <div key={link.id} className="card group hover:bg-gray-800/50 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={getFavicon(link.url)} alt="" className="w-8 h-8 rounded-lg bg-gray-800 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{link.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{getDomain(link.url)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleCopyUrl(link.url)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"><Copy size={14} /></button>
                  <button onClick={() => handleDelete(link.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>

              {link.description && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{link.description}</p>}

              <div className="flex items-center justify-between">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink size={14} /><span>Abrir</span>
                </a>
                <div className="flex items-center gap-2">
                  {link.is_favorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                  {link.category_name && <span className="text-xs text-gray-500">#{link.category_name}</span>}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
                <span>{format(new Date(link.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                {link.click_count > 0 && <span>{link.click_count} acessos</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">{editingLink ? 'Editar Link' : 'Novo Link'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome *" autoFocus />
              <input type="text" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="URL *" />
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descrição (opcional)" rows={3} />
              <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
                <option value="">Categoria</option>
                {categories.map((cat: any) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleCreate} className="btn btn-primary">{editingLink ? 'Salvar' : 'Adicionar Link'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Links;