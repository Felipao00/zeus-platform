import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon, FileText, Image, FolderOpen,
  StickyNote, Link2, Shield, X
} from 'lucide-react';
import { searchAPI } from '../services/api';
import toast from 'react-hot-toast';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query.length >= 3) {
      handleSearch();
    }
  }, [query, activeTab]);

  const handleSearch = async () => {
    if (query.length < 3) return;
    
    try {
      setLoading(true);
      const type = activeTab !== 'all' ? activeTab : undefined;
      const response = await searchAPI.search(query, type);
      setResults(response.data);
    } catch (error) {
      toast.error('Erro ao realizar busca');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'Todos', icon: SearchIcon },
    { key: 'files', label: 'Arquivos', icon: FileText },
    { key: 'photos', label: 'Fotos', icon: Image },
    { key: 'projects', label: 'Projetos', icon: FolderOpen },
    { key: 'notes', label: 'Notas', icon: StickyNote },
    { key: 'links', label: 'Links', icon: Link2 },
  ];

  const totalResults = Object.values(results).reduce(
    (sum: number, items: any) => sum + (items?.length || 0),
    0
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white">
          <span className="font-semibold">Buscar</span>
        </h1>
        <p className="text-gray-500 mt-2">Pesquise em toda a plataforma</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar arquivos, fotos, projetos, notas..."
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-14 pr-12 py-4
                     text-white text-lg placeholder-gray-500 focus:outline-none focus:border-gray-700
                     transition-all"
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium 
                       whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-950'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Buscando...</p>
        </div>
      ) : query.length < 3 ? (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Digite pelo menos 3 caracteres para buscar</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum resultado encontrado</p>
          <p className="text-gray-600 text-sm mt-2">Tente outros termos de busca</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.files?.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                Arquivos ({results.files.length})
              </h2>
              <div className="space-y-2">
                {results.files.map((file: any) => (
                  <div key={file.id} className="card flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-sm text-gray-400">Arquivo • {file.type}</p>
                    </div>
                    <span className="text-sm text-gray-500">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.notes?.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <StickyNote className="w-5 h-5 mr-2 text-yellow-400" />
                Notas ({results.notes.length})
              </h2>
              <div className="space-y-2">
                {results.notes.map((note: any) => (
                  <div key={note.id} className="card">
                    <p className="text-white font-medium">{note.title}</p>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.projects?.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2 text-green-400" />
                Projetos ({results.projects.length})
              </h2>
              <div className="space-y-2">
                {results.projects.map((project: any) => (
                  <div key={project.id} className="card flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{project.name}</p>
                      <p className="text-sm text-gray-400">{project.status}</p>
                    </div>
                    <span className="badge bg-gray-800 text-gray-400">{project.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.links?.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <Link2 className="w-5 h-5 mr-2 text-purple-400" />
                Links ({results.links.length})
              </h2>
              <div className="space-y-2">
                {results.links.map((link: any) => (
                  <div key={link.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{link.name}</p>
                        <p className="text-sm text-blue-400 truncate">{link.url}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;