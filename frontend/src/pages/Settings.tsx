import React, { useState, useEffect } from 'react';
import {
  Palette, Database, Save, Download, Upload, Shield
} from 'lucide-react';
import { backupAPI } from '../services/api';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [userId, setUserId] = useState<number>(0);

  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    defaultView: 'grid',
    itemsPerPage: 20,
    autoBackup: false,
  });

  const [secondaryPassword, setSecondaryPassword] = useState('');

  useEffect(() => {
    // Pegar ID do usuário
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserId(user.id || 0);

    // Carregar preferências do usuário específico
    const savedPrefs = localStorage.getItem(`zeus_preferences_${user.id}`);
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
    
    // Carregar senha secundária do usuário específico
    const savedPass = localStorage.getItem(`zeus_secondary_password_${user.id}`);
    if (savedPass) {
      setSecondaryPassword(savedPass);
    }
    
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await backupAPI.getAll();
      setBackups(response.data.backups || []);
    } catch (error) {}
  };

  // Salvar preferências
  const handleSavePreferences = () => {
    localStorage.setItem(`zeus_preferences_${userId}`, JSON.stringify(preferences));
    toast.success('Preferências salvas!');
  };

  // Salvar senha secundária do cofre
  const handleSaveSecondaryPassword = () => {
    if (!secondaryPassword || secondaryPassword.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    localStorage.setItem(`zeus_secondary_password_${userId}`, secondaryPassword);
    toast.success('Senha do cofre salva!');
  };

  // Backup
  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await backupAPI.create();
      toast.success('Backup criado!');
      fetchBackups();
    } catch (error) {
      toast.error('Erro ao criar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!confirm('Restaurar backup? Todos os dados atuais serão substituídos.')) return;
      const formData = new FormData();
      formData.append('backup', file);
      try {
        await backupAPI.restore(formData);
        toast.success('Backup restaurado!');
      } catch (error) {
        toast.error('Erro ao restaurar');
      }
    };
    input.click();
  };

  const handleDownloadBackup = async (id: number) => {
    try {
      const response = await backupAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao baixar');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 mt-2">Gerencie suas preferências e segurança</p>
      </div>

      {/* Senha do Cofre */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Shield size={20} /> Senha do Cofre Seguro
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Esta senha é necessária para acessar e criar itens no Cofre Seguro. Mínimo 6 caracteres.
        </p>
        <input
          type="password"
          value={secondaryPassword}
          onChange={(e) => setSecondaryPassword(e.target.value)}
          placeholder="Defina sua senha do cofre"
        />
        <div className="flex justify-end mt-4">
          <button onClick={handleSaveSecondaryPassword} className="btn btn-primary">
            <Save size={18} /> Salvar Senha
          </button>
        </div>
      </div>

      {/* Preferências */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Palette size={20} /> Preferências
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Idioma</label>
            <select value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}>
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Visualização Padrão</label>
            <select value={preferences.defaultView} onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value })}>
              <option value="grid">Grade</option>
              <option value="list">Lista</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Itens por Página</label>
          <select value={preferences.itemsPerPage} onChange={(e) => setPreferences({ ...preferences, itemsPerPage: Number(e.target.value) })}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-white font-medium">Backup Automático</p>
            <p className="text-sm text-gray-400">Realizar backup semanalmente</p>
          </div>
          <button 
            onClick={() => setPreferences({ ...preferences, autoBackup: !preferences.autoBackup })}
            className={`w-12 h-6 rounded-full transition-colors relative ${preferences.autoBackup ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${preferences.autoBackup ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button onClick={handleSavePreferences} className="btn btn-primary">
            <Save size={18} /> Salvar Preferências
          </button>
        </div>
      </div>

      {/* Backup */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database size={20} /> Backup e Restauração
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={handleCreateBackup} disabled={loading}
            className="p-8 rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 transition-all text-center group">
            <Download className="w-10 h-10 text-gray-500 group-hover:text-white mx-auto mb-3 transition-colors" />
            <h3 className="text-white font-medium">Criar Backup</h3>
            <p className="text-gray-500 text-sm mt-1">Exportar todos os dados</p>
          </button>

          <button onClick={handleRestoreBackup}
            className="p-8 rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 transition-all text-center group">
            <Upload className="w-10 h-10 text-gray-500 group-hover:text-white mx-auto mb-3 transition-colors" />
            <h3 className="text-white font-medium">Restaurar Backup</h3>
            <p className="text-gray-500 text-sm mt-1">Importar dados</p>
          </button>
        </div>

        {backups.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-3">Backups Anteriores</h3>
            <div className="space-y-2">
              {backups.map((backup: any) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Database size={20} className="text-gray-400" />
                    <div>
                      <p className="text-white text-sm font-medium">{backup.filename}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(backup.created_at).toLocaleString('pt-BR')} • {((backup.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDownloadBackup(backup.id)}
                    className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;