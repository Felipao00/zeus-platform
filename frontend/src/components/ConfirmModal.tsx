import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-md animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            type === 'danger' ? 'bg-red-500/10' : 'bg-yellow-500/10'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              type === 'danger' ? 'text-red-400' : 'text-yellow-400'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="btn btn-secondary flex-1">
                {cancelText}
              </button>
              <button onClick={() => { onConfirm(); onClose(); }}
                className={`flex-1 btn ${
                  type === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-none' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-gray-950 border-none'
                }`}>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;