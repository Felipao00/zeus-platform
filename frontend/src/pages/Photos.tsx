import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Search, Grid, List, Heart, Trash2, 
  X, ChevronLeft, ChevronRight, CheckSquare, Square
} from 'lucide-react';
import { photosAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConfirmModal from '../components/ConfirmModal';

const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [photoData, setPhotoData] = useState({
    title: '', description: '', category_id: '', taken_at: ''
  });
  
  // Seleção múltipla
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchPhotos();
    fetchCategories();
  }, [selectedCategory, showFavorites]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (showFavorites) params.favorite = true;
      if (search) params.search = search;
      const response = await photosAPI.getAll(params);
      setPhotos(response.data.photos);
    } catch (error) {
      toast.error('Erro ao carregar fotos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll('photo');
      setCategories(response.data.categories);
    } catch (error) {}
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('photo', file);
        if (photoData.title) formData.append('title', photoData.title);
        if (photoData.description) formData.append('description', photoData.description);
        if (photoData.category_id) formData.append('category_id', photoData.category_id);
        if (photoData.taken_at) formData.append('taken_at', photoData.taken_at);
        await photosAPI.upload(formData);
      }
      toast.success(`${acceptedFiles.length} foto(s) enviada(s)!`);
      setShowUploadModal(false);
      fetchPhotos();
    } catch (error) {
      toast.error('Erro ao enviar fotos');
    } finally {
      setUploading(false);
    }
  }, [photoData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    multiple: true,
  });

  // Selecionar/Deselecionar uma foto
  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Selecionar todas
  const selectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map(p => p.id)));
    }
  };

  // Deletar uma foto
  const handleDeleteSingle = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Foto',
      message: 'Tem certeza que deseja excluir esta foto? Esta ação é irreversível!',
      onConfirm: async () => {
        try {
          await photosAPI.delete(id);
          toast.success('Foto excluída!');
          setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
          fetchPhotos();
          if (selectedPhoto?.id === id) setSelectedPhoto(null);
        } catch (error) {
          toast.error('Erro ao excluir foto');
        }
      }
    });
  };

  // Deletar selecionadas
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) {
      toast.error('Nenhuma foto selecionada');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Fotos Selecionadas',
      message: `Tem certeza que deseja excluir ${selectedIds.size} foto(s)? Esta ação é irreversível!`,
      onConfirm: async () => {
        try {
          for (const id of selectedIds) {
            await photosAPI.delete(id);
          }
          toast.success(`${selectedIds.size} foto(s) excluída(s)!`);
          setSelectedIds(new Set());
          setSelectMode(false);
          fetchPhotos();
        } catch (error) {
          toast.error('Erro ao excluir fotos');
        }
      }
    });
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      await photosAPI.toggleFavorite(id);
      fetchPhotos();
    } catch (error) {
      toast.error('Erro ao atualizar foto');
    }
  };

  const openLightbox = (photo: any, index: number) => {
    if (!selectMode) {
      setSelectedPhoto(photo);
      setCurrentIndex(index);
    }
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % photos.length
      : (currentIndex - 1 + photos.length) % photos.length;
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Fotos</h1>
          <p className="text-gray-400 mt-2">Sua galeria pessoal de imagens</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botão de seleção múltipla */}
          {photos.length > 0 && (
            <button
              onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
              className={`btn ${selectMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}
            >
              <CheckSquare size={18} />
              <span className="hidden sm:inline">{selectMode ? 'Cancelar' : 'Selecionar'}</span>
            </button>
          )}
          
          {/* Botão de excluir selecionadas (aparece quando há seleção) */}
          {selectMode && selectedIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="btn btn-danger">
              <Trash2 size={18} />
              <span>Excluir ({selectedIds.size})</span>
            </button>
          )}

          {/* Selecionar todas */}
          {selectMode && (
            <button onClick={selectAll} className="btn bg-gray-800 text-gray-400 border border-gray-700 hover:text-white">
              {selectedIds.size === photos.length ? <Square size={18} /> : <CheckSquare size={18} />}
              <span className="hidden sm:inline">{selectedIds.size === photos.length ? 'Desmarcar' : 'Todas'}</span>
            </button>
          )}

          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
            <Upload size={18} />
            Nova Foto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="search-wrapper w-full sm:flex-1 sm:max-w-md">
          <Search className="search-icon w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar fotos..." />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 sm:flex-none sm:w-48">
            <option value="">Todas categorias</option>
            {categories.map((cat: any) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
          <button onClick={() => setShowFavorites(!showFavorites)}
            className={`btn ${showFavorites ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>
            <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Favoritas</span>
          </button>
          <div className="flex items-center bg-gray-800 rounded-xl border border-gray-700">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-l-xl transition-colors ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>
              <Grid size={18} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-r-xl transition-colors ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Enviar Fotos</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={photoData.title} onChange={(e) => setPhotoData({ ...photoData, title: e.target.value })} placeholder="Título (opcional)" />
                <select value={photoData.category_id} onChange={(e) => setPhotoData({ ...photoData, category_id: e.target.value })}>
                  <option value="">Categoria</option>
                  {categories.map((cat: any) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <textarea value={photoData.description} onChange={(e) => setPhotoData({ ...photoData, description: e.target.value })} placeholder="Descrição (opcional)" rows={3} />
              <input type="date" value={photoData.taken_at} onChange={(e) => setPhotoData({ ...photoData, taken_at: e.target.value })} />
            </div>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">{isDragActive ? 'Solte as fotos aqui' : 'Arraste fotos ou clique para selecionar'}</p>
              <p className="text-gray-500 text-sm mt-2">PNG, JPG, GIF, WebP • Máx 50MB</p>
            </div>
            {uploading && (
              <div className="mt-4 text-center">
                <div className="w-6 h-6 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Enviando fotos...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto" /></div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg">Nenhuma foto encontrada</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          : "space-y-4"
        }>
          {photos.map((photo, index) => (
            <div key={photo.id}
              className={viewMode === 'grid'
                ? "group relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
                : "card flex items-center gap-4 hover:bg-gray-800/50 transition-all cursor-pointer"
              }
              onClick={() => selectMode ? toggleSelect(photo.id, {} as React.MouseEvent) : openLightbox(photo, index)}
            >
              {/* Checkbox de seleção */}
              {selectMode && (
                <div className="absolute top-3 left-3 z-20" onClick={(e) => toggleSelect(photo.id, e)}>
                  {selectedIds.has(photo.id) ? (
                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                      <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-500">
                      <Square className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'grid' ? (
                <>
                  <img src={`/uploads/photos/user_${photo.user_id}/${photo.filename}`} alt={photo.title || photo.original_name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-medium truncate text-sm">{photo.title || photo.original_name}</p>
                    </div>
                    {!selectMode && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(photo.id); }}
                          className={`p-2 rounded-lg backdrop-blur-sm ${photo.is_favorite ? 'bg-red-500/20 text-red-400' : 'bg-black/50 text-white hover:bg-red-500/20 hover:text-red-400'}`}>
                          <Heart className={`w-4 h-4 ${photo.is_favorite ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(photo.id); }}
                          className="p-2 rounded-lg bg-black/50 text-white hover:bg-red-500/20 hover:text-red-400 backdrop-blur-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  {photo.is_favorite && !selectMode && (
                    <div className="absolute top-3 left-3">
                      <Heart className="w-5 h-5 text-red-400 fill-current drop-shadow-lg" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <img src={`/uploads/photos/user_${photo.user_id}/${photo.filename}`} alt={photo.title || photo.original_name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{photo.title || photo.original_name}</p>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{photo.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{formatSize(photo.size)}</span>
                      <span>•</span>
                      <span>{format(new Date(photo.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                  {!selectMode && (
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(photo.id); }}
                        className={`p-2 rounded-lg transition-colors ${photo.is_favorite ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
                        <Heart className={`w-5 h-5 ${photo.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(photo.id); }}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"><X size={32} /></button>
          <button onClick={() => navigatePhoto('prev')} className="absolute left-4 text-white/70 hover:text-white z-10 p-2"><ChevronLeft size={48} /></button>
          <button onClick={() => navigatePhoto('next')} className="absolute right-4 text-white/70 hover:text-white z-10 p-2"><ChevronRight size={48} /></button>
          <div className="max-w-6xl max-h-[90vh] mx-4">
            <img src={`/uploads/photos/user_${selectedPhoto.user_id}/${selectedPhoto.filename}`} alt={selectedPhoto.title || selectedPhoto.original_name} className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
            <div className="mt-6 text-center">
              <h3 className="text-white text-xl font-medium">{selectedPhoto.title || selectedPhoto.original_name}</h3>
              {selectedPhoto.description && <p className="text-gray-400 mt-2">{selectedPhoto.description}</p>}
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                <span>{formatSize(selectedPhoto.size)}</span>
                <span>•</span>
                <span>{format(new Date(selectedPhoto.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-sm">{currentIndex + 1} / {photos.length}</div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
};

export default Photos;