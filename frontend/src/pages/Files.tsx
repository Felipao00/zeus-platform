import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FolderPlus, Search, Download, Trash2, 
  Folder, FileText, Image, Film, Music, Archive, 
  Grid, List, ChevronRight, X
} from 'lucide-react';
import { filesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Files: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, [currentFolder]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (currentFolder) params.folder_id = currentFolder.id;
      if (search) params.search = search;
      const response = await filesAPI.getAll(params);
      setFiles(response.data.files);
    } catch (error) {
      toast.error('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const parentId = currentFolder?.id;
      const response = await filesAPI.getFolders(parentId);
      setFolders(response.data.folders);
    } catch (error) {}
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) formData.append('folder_id', currentFolder.id.toString());
        await filesAPI.upload(formData);
      }
      toast.success(`${acceptedFiles.length} arquivo(s) enviado(s)!`);
      fetchFiles();
    } catch (error) {
      toast.error('Erro ao enviar arquivos');
    } finally {
      setUploading(false);
    }
  }, [currentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await filesAPI.createFolder({ name: newFolderName, parent_id: currentFolder?.id });
      toast.success('Pasta criada!');
      setNewFolderName('');
      setShowNewFolder(false);
      fetchFolders();
    } catch (error) {
      toast.error('Erro ao criar pasta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
    try {
      await filesAPI.delete(id);
      toast.success('Arquivo excluído!');
      fetchFiles();
    } catch (error) {
      toast.error('Erro ao excluir arquivo');
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await filesAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao baixar arquivo');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-blue-400" />;
      case 'video': return <Film className="w-8 h-8 text-purple-400" />;
      case 'audio': return <Music className="w-8 h-8 text-green-400" />;
      case 'archive': return <Archive className="w-8 h-8 text-yellow-400" />;
      case 'document': return <FileText className="w-8 h-8 text-red-400" />;
      default: return <FileText className="w-8 h-8 text-gray-400" />;
    }
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
          <h1 className="text-3xl font-bold text-white">Arquivos</h1>
          <p className="text-gray-400 mt-2">Gerencie seus documentos e arquivos</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNewFolder(true)} className="btn btn-secondary">
            <FolderPlus size={18} />
            Nova Pasta
          </button>
          <label className="btn btn-primary cursor-pointer">
            <Upload size={18} />
            {uploading ? 'Enviando...' : 'Upload'}
            <input type="file" multiple className="hidden" onChange={(e) => {
              if (e.target.files) onDrop(Array.from(e.target.files));
            }} />
          </label>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button onClick={() => setCurrentFolder(null)} className="text-gray-400 hover:text-white transition-colors">Raiz</button>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-white">{currentFolder.name}</span>
        </div>
      )}

      {/* Search & View */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="search-wrapper w-full sm:flex-1 sm:max-w-md">
          <Search className="search-icon w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar arquivos..." />
        </div>
        <div className="flex items-center bg-gray-800 rounded-xl border border-gray-700">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-l-xl transition-colors ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>
            <Grid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-r-xl transition-colors ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Nova Pasta</h3>
              <button onClick={() => setShowNewFolder(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Nome da pasta" autoFocus onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()} />
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
              <button onClick={() => setShowNewFolder(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleCreateFolder} className="btn btn-primary">Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 mb-8 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 hover:border-gray-700 bg-gray-900/50'}`}>
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-2">{isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para enviar'}</p>
        <p className="text-gray-500 text-sm">Suporte para documentos, imagens, vídeos e outros formatos</p>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Pastas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {folders.map((folder) => (
              <button key={folder.id} onClick={() => setCurrentFolder(folder)} className="card p-4 text-left hover:bg-gray-800 transition-all group">
                <Folder className="w-10 h-10 text-yellow-500 mb-3" />
                <h3 className="text-white font-medium truncate">{folder.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{format(new Date(folder.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4">{currentFolder ? `Arquivos em ${currentFolder.name}` : 'Todos os Arquivos'}</h2>
        
        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto" /></div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 card">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum arquivo encontrado</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {files.map((file) => (
              <div key={file.id} className="card p-4 group">
                <div className="flex items-center justify-between mb-3">
                  {getFileIcon(file.type)}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => handleDownload(file.id, file.original_name)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
                      <Download size={16} />
                    </button>
                    <button onClick={() => handleDelete(file.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-white text-sm font-medium truncate mb-1">{file.name || file.original_name}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatSize(file.size)}</span>
                  <span>{format(new Date(file.created_at), "dd/MM/yy", { locale: ptBR })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Nome</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden sm:table-cell">Tamanho</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm hidden md:table-cell">Data</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="text-white text-sm truncate max-w-[200px]">{file.name || file.original_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm hidden sm:table-cell">{formatSize(file.size)}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm hidden md:table-cell">{format(new Date(file.created_at), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDownload(file.id, file.original_name)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
                          <Download size={16} />
                        </button>
                        <button onClick={() => handleDelete(file.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;