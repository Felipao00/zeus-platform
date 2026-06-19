import React, { useState, useEffect } from 'react';
import {
  Plus, Search, StickyNote, Star, Pin, Trash2, X,
  GripVertical, FolderOpen, ChevronDown, ChevronRight,
  Palette, Tag
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { notesAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = [
  '#1F2937', '#1E3A5F', '#1B4332', '#3F1D2A',
  '#312E81', '#4A1942', '#3E2723', '#263238',
  '#1a1a2e', '#16213e', '#0f3460', '#533483'
];

// Componente de Nota Ordenável
const SortableNote: React.FC<{
  note: any;
  onEdit: (note: any) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onTogglePin: (id: number) => void;
}> = ({ note, onEdit, onDelete, onToggleFavorite, onTogglePin }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-200 group cursor-pointer relative"
    >
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: note.color || '#1F2937' }}
        onClick={() => onEdit(note)}
      >
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
          <GripVertical size={16} className="text-gray-400 hover:text-white" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-3 pr-8">
          <h3 className="text-white font-semibold flex-1 line-clamp-2">{note.title}</h3>
        </div>

        {/* Content */}
        <p className="text-gray-300/70 text-sm line-clamp-4 mb-4">
          {note.content || 'Nota vazia...'}
        </p>

        {/* Tags/Categories */}
        {note.category_name && (
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-xs text-gray-300">
              <FolderOpen size={12} />
              {note.category_name}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400/50">
          <span>{format(new Date(note.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${note.is_pinned ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}>
              <Pin size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${note.is_favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}>
              <Star size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Pin Indicator */}
        {note.is_pinned && (
          <div className="absolute top-3 left-3">
            <Pin size={14} className="text-yellow-400" />
          </div>
        )}
      </div>
    </div>
  );
};

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1F2937');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subNotes, setSubNotes] = useState<string[]>([]);
  const [newSubNote, setNewSubNote] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pinned'>('all');
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [filter, selectedCategory]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter === 'favorites') params.favorite = true;
      if (filter === 'pinned') params.pinned = true;
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;

      const response = await notesAPI.getAll(params);
      setNotes(response.data.notes);
    } catch (error) {
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll('note');
      setCategories(response.data.categories);
    } catch (error) {}
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('zeus_notes_order', JSON.stringify(newItems.map(n => n.id)));
        return newItems;
      });
      toast.success('Notas reordenadas!');
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }
    try {
      const noteData: any = { title, content, color: selectedColor };
      if (selectedCategory) noteData.category_id = selectedCategory;
      if (subNotes.length > 0) noteData.content = content + '\n\n--- Subnotas ---\n' + subNotes.map((s, i) => `${i + 1}. ${s}`).join('\n');

      if (editingNote) {
        await notesAPI.update(editingNote.id, noteData);
        toast.success('Nota atualizada!');
      } else {
        await notesAPI.create(noteData);
        toast.success('Nota criada!');
      }

      setShowEditor(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      toast.error('Erro ao salvar nota');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta nota?')) return;
    try {
      await notesAPI.delete(id);
      toast.success('Nota excluída!');
      fetchNotes();
    } catch (error) {
      toast.error('Erro ao excluir nota');
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      await notesAPI.toggleFavorite(id);
      fetchNotes();
    } catch (error) {
      toast.error('Erro ao atualizar nota');
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      await notesAPI.togglePin(id);
      fetchNotes();
    } catch (error) {
      toast.error('Erro ao atualizar nota');
    }
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setSelectedColor(note.color || '#1F2937');
    setSelectedCategory(note.category_id || '');
    setSubNotes([]);
    setShowEditor(true);
  };

  const addSubNote = () => {
    if (newSubNote.trim()) {
      setSubNotes([...subNotes, newSubNote.trim()]);
      setNewSubNote('');
    }
  };

  const removeSubNote = (index: number) => {
    setSubNotes(subNotes.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedColor('#1F2937');
    setSelectedCategory('');
    setSubNotes([]);
    setNewSubNote('');
    setEditingNote(null);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Notas</h1>
          <p className="text-gray-400 mt-2">Suas anotações privadas com subcategorias</p>
        </div>
        <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn btn-primary">
          <Plus size={18} /> Nova Nota
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="search-wrapper w-full sm:flex-1 sm:max-w-md">
          <Search className="search-icon w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar notas..." onKeyPress={(e) => e.key === 'Enter' && fetchNotes()} />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'favorites', label: 'Favoritas' },
            { key: 'pinned', label: 'Fixadas' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key ? 'bg-white text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-none sm:w-44">
            <option value="">Todas categorias</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid with Drag & Drop */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhuma nota encontrada</p>
          <p className="text-gray-500 text-sm mt-2">Crie sua primeira nota e organize com subcategorias</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={notes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {notes.map((note) => (
                <SortableNote
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingNote ? 'Editar Nota' : 'Nova Nota'}
              </h3>
              <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da nota" autoFocus className="flex-1" />
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-48">
                  <option value="">Sem categoria</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva sua nota aqui..." rows={6} />

              {/* Subnotas */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <FolderOpen size={16} /> Subitens da nota
                </label>
                <div className="space-y-2 mb-3">
                  {subNotes.map((sub, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                      <span className="text-gray-400 text-sm flex-1">{sub}</span>
                      <button onClick={() => removeSubNote(index)}
                        className="text-gray-500 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value={newSubNote} onChange={(e) => setNewSubNote(e.target.value)}
                    placeholder="Adicionar subitem..." className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addSubNote()} />
                  <button onClick={addSubNote} className="btn btn-secondary shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Palette size={16} /> Cor da nota
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {COLORS.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-xl transition-all duration-200 hover:scale-110 ${
                        selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
              <button onClick={() => setShowEditor(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleCreate} className="btn btn-primary">
                {editingNote ? 'Salvar Alterações' : 'Criar Nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;