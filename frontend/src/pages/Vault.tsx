import React, { useState, useEffect } from 'react';
import {
  Shield, Plus, Key, Eye, EyeOff, Lock, Trash2,
  Copy, X, AlertTriangle, Unlock
} from 'lucide-react';
import { vaultAPI } from '../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const Vault: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [userId, setUserId] = useState<number>(0);
  
  const [secondaryPassword, setSecondaryPassword] = useState('');
  const [viewPassword, setViewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    title: '', type: 'credential',
    data: { username: '', password: '', url: '', notes: '' },
    notes: '', category_id: ''
  });

  // Modal de exclusão personalizado
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null as any,
    password: '',
    confirmCheck: false,
    error: ''
  });

  // Modal de confirmação genérico
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserId(user.id || 0);
    
    const savedPass = localStorage.getItem(`zeus_secondary_password_${user.id}`);
    if (savedPass) {
      setSecondaryPassword(savedPass);
    }
    
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await vaultAPI.getAll();
      setItems(response.data.items);
    } catch (error) {
      toast.error('Erro ao carregar cofre');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    const pass = secondaryPassword || localStorage.getItem(`zeus_secondary_password_${userId}`);
    if (!pass) {
      toast.error('Configure uma senha secundária nas Configurações primeiro!');
      return;
    }

    if (pass.length < 6) {
      toast.error('Senha secundária deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      await vaultAPI.create({
        title: formData.title,
        type: formData.type,
        data: formData.data,
        notes: formData.notes,
        category_id: formData.category_id,
        secondary_password: pass
      });
      
      toast.success('Item adicionado ao cofre!');
      setShowCreateModal(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar no cofre');
    }
  };

  const handleView = async (item: any) => {
    setSelectedItem(item);
    setViewPassword('');
    setDecryptedData(null);
    setShowViewModal(true);
  };

  const handleDecrypt = async () => {
    const pass = viewPassword || localStorage.getItem(`zeus_secondary_password_${userId}`);
    
    if (!pass) {
      toast.error('Digite a senha do cofre');
      return;
    }

    try {
      const response = await vaultAPI.view(selectedItem.id, pass);
      setDecryptedData(response.data.item.data);
      toast.success('Item desbloqueado!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Senha incorreta');
    }
  };

  // Abrir modal de exclusão personalizado
  const openDeleteModal = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      item: item,
      password: '',
      confirmCheck: false,
      error: ''
    });
  };

  // Confirmar exclusão
  const handleDeleteConfirm = async () => {
    // Validar senha
    if (!deleteModal.password) {
      setDeleteModal({ ...deleteModal, error: 'Digite a senha do cofre' });
      return;
    }
    
    // Validar checkbox
    if (!deleteModal.confirmCheck) {
      setDeleteModal({ ...deleteModal, error: 'Marque a caixa de confirmação para prosseguir' });
      return;
    }

    // PRIMEIRO verifica se a senha está correta tentando visualizar o item
    try {
      await vaultAPI.view(deleteModal.item.id, deleteModal.password);
      
      // Se chegou aqui, senha está correta. Agora pode excluir.
      await vaultAPI.delete(deleteModal.item.id, deleteModal.password);
      
      toast.success('Item removido permanentemente do cofre!');
      setDeleteModal({ isOpen: false, item: null, password: '', confirmCheck: false, error: '' });
      fetchItems();
      
    } catch (error: any) {
      // Se deu erro ao visualizar, a senha está errada
      setDeleteModal({ ...deleteModal, error: 'Senha do cofre incorreta. Verifique e tente novamente.' });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const resetForm = () => {
    setFormData({
      title: '', type: 'credential',
      data: { username: '', password: '', url: '', notes: '' },
      notes: '', category_id: ''
    });
  };

  const typeLabels: any = {
    credential: 'Credencial', note: 'Nota Segura', document: 'Documento',
    financial: 'Financeiro', other: 'Outro'
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Cofre Seguro</h1>
          <p className="text-gray-400 mt-2">Armazenamento criptografado de informações sensíveis</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn btn-primary">
          <Plus size={18} /> Novo Item
        </button>
      </div>

      {/* Alerta se não tiver senha */}
      {!localStorage.getItem(`zeus_secondary_password_${userId}`) && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Senha não configurada</h3>
              <p className="text-yellow-400/70 text-sm mb-3">
                Configure uma senha secundária nas Configurações antes de usar o Cofre.
              </p>
              <a href="/app/settings" className="text-yellow-400 underline text-sm hover:text-yellow-300">
                Ir para Configurações →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Descriptografando cofre...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gray-800 rounded-full blur-xl opacity-50" />
            <div className="relative w-24 h-24 bg-gray-900 border-2 border-gray-800 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-gray-600" />
            </div>
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Cofre Vazio</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Seus itens salvos aparecerão aqui completamente bloqueados.
          </p>
          <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn btn-primary mt-6">
            <Plus size={18} /> Adicionar Primeiro Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 cursor-pointer
                         hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/50
                         hover:-translate-y-1"
            >
              {/* Botão de Excluir */}
              <button
                onClick={(e) => openDeleteModal(item, e)}
                className="absolute top-3 right-3 z-30 p-2 rounded-lg bg-red-500/10 text-red-400 
                           hover:bg-red-500/20 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
                title="Excluir permanentemente"
              >
                <Trash2 size={16} />
              </button>

              {/* Bloqueio Visual */}
              <div 
                onClick={() => handleView(item)}
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-10
                          group-hover:bg-gray-950/40 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-3
                              group-hover:scale-110 group-hover:bg-gray-700 transition-all duration-300">
                  <Lock className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-gray-500 text-sm font-medium group-hover:text-gray-300 transition-colors">
                  Clique para desbloquear
                </p>
              </div>

              {/* Conteúdo Borrado */}
              <div className="blur-sm select-none pointer-events-none">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="text-gray-400 font-medium mb-2">{item.title}</h3>
                <span className="inline-flex px-2 py-1 rounded-lg bg-gray-800 text-xs text-gray-500">
                  {typeLabels[item.type] || item.type}
                </span>
                <p className="text-xs text-gray-600 mt-3">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Exclusão Personalizado */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>
          <div className="modal-content p-6 max-w-md animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Excluir Permanentemente</h3>
              <p className="text-gray-400 text-sm">
                Você está prestes a excluir <span className="text-white font-medium">"{deleteModal.item?.title}"</span>.
                Esta ação é <span className="text-red-400 font-semibold">irreversível</span>!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Digite a senha do cofre para confirmar
                </label>
                <input
                  type="password"
                  value={deleteModal.password}
                  onChange={(e) => setDeleteModal({ ...deleteModal, password: e.target.value, error: '' })}
                  placeholder="Senha do cofre"
                  autoFocus
                  className={deleteModal.error && !deleteModal.password ? '!border-red-500/50' : ''}
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={deleteModal.confirmCheck}
                  onChange={(e) => setDeleteModal({ ...deleteModal, confirmCheck: e.target.checked, error: '' })}
                  className="mt-0.5 w-4 h-4 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm text-gray-300">
                  Eu entendo que esta ação é <span className="text-red-400 font-semibold">permanente e irreversível</span>. 
                  Todos os dados deste item serão perdidos para sempre.
                </span>
              </label>

              {deleteModal.error && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  {deleteModal.error}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModal({ isOpen: false, item: null, password: '', confirmCheck: false, error: '' })}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Adicionar ao Cofre</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Título do item *" autoFocus />
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="credential">Credencial</option>
                  <option value="note">Nota Segura</option>
                  <option value="document">Documento</option>
                  <option value="financial">Financeiro</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              {formData.type === 'credential' && (
                <>
                  <input type="text" value={formData.data.username} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, username: e.target.value } })} placeholder="Usuário/Email" />
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.data.password} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, password: e.target.value } })} placeholder="Senha" className="!pr-10" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <input type="url" value={formData.data.url} onChange={(e) => setFormData({ ...formData, data: { ...formData.data, url: e.target.value } })} placeholder="https://" />
                </>
              )}

              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Notas adicionais (também criptografadas)" rows={3} />

              <div className={`rounded-xl p-4 ${secondaryPassword ? 'bg-green-500/5 border border-green-500/20' : 'bg-yellow-500/5 border border-yellow-500/20'}`}>
                <p className={`text-sm ${secondaryPassword ? 'text-green-400' : 'text-yellow-400'}`}>
                  {secondaryPassword ? '✓ Senha do cofre configurada' : '⚠ Configure a senha nas Configurações'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleCreate} className="btn btn-primary" disabled={!secondaryPassword}>
                <Lock size={16} /> Criptografar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${decryptedData ? 'bg-green-500/10' : 'bg-gray-800'}`}>
                  {decryptedData ? <Unlock size={18} className="text-green-400" /> : <Lock size={18} className="text-gray-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedItem.title}</h3>
                  <p className="text-xs text-gray-500">{typeLabels[selectedItem.type]}</p>
                </div>
              </div>
              <button onClick={() => { setShowViewModal(false); setDecryptedData(null); }} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            {!decryptedData ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Item Bloqueado</h3>
                <p className="text-gray-500 text-sm mb-6">Digite sua senha do cofre para descriptografar</p>
                
                {!secondaryPassword && (
                  <div className="mb-4">
                    <input type="password" value={viewPassword} onChange={(e) => setViewPassword(e.target.value)}
                      placeholder="Senha do cofre" className="max-w-xs mx-auto"
                      onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()} />
                  </div>
                )}
                
                <button onClick={handleDecrypt} className="btn btn-primary">
                  <Unlock size={18} /> Descriptografar
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 mb-4">
                  <Unlock size={14} className="text-green-400" />
                  <p className="text-green-400 text-xs">Descriptografado com sucesso</p>
                </div>

                {decryptedData.username && (
                  <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between group">
                    <div><p className="text-gray-400 text-xs mb-1">Usuário</p><p className="text-white font-medium">{decryptedData.username}</p></div>
                    <button onClick={() => handleCopy(decryptedData.username)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100"><Copy size={16} /></button>
                  </div>
                )}
                {decryptedData.password && (
                  <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex-1"><p className="text-gray-400 text-xs mb-1">Senha</p><p className="text-white font-medium font-mono">{showPassword ? decryptedData.password : '••••••••••••'}</p></div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowPassword(!showPassword)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-white">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      <button onClick={() => handleCopy(decryptedData.password)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100"><Copy size={16} /></button>
                    </div>
                  </div>
                )}
                {decryptedData.url && (
                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">URL</p>
                    <a href={decryptedData.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline break-all">{decryptedData.url}</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;