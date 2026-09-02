import { useState } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Edit2, Check, X, Tag } from 'lucide-react';

export default function SettingsView({ categories = [], refreshCategories }) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('both');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('both');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await api.post('/categories', { 
        name: newCatName.trim(), 
        type: newCatType 
      });
      setNewCatName('');
      refreshCategories();
    } catch (err) {
      console.error("Erreur création catégorie :", err.response?.data || err.message);
      alert(`Erreur : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditType(cat.type || 'both');
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/categories/${id}`, { name: editName, type: editType });
      setEditingId(null);
      refreshCategories();
    } catch (err) {
      console.error("Erreur modification catégorie :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    try {
      await api.delete(`/categories/${id}`);
      refreshCategories();
    } catch (err) {
      console.error("Erreur suppression catégorie :", err);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Gestion des Catégories</h2>
          <p className="text-xs text-slate-400">Ajoutez, modifiez ou supprimez les catégories d'articles</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400 block mb-1">Nom de la catégorie</label>
          <input 
            type="text" 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ex: Produits Laitiers"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Utilisation</label>
          <select 
            value={newCatType} 
            onChange={(e) => setNewCatType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
          >
            <option value="both">Stock & Congélateur</option>
            <option value="stock">Stock uniquement</option>
            <option value="freezer">Congélateur uniquement</option>
          </select>
        </div>

        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </form>

      <div className="divide-y divide-slate-700/60">
        {categories.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">Aucune catégorie enregistrée.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat._id || cat.id} className="py-3 flex justify-between items-center gap-4">
              {editingId === cat._id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-900 border border-purple-500 rounded px-2 py-1 text-sm text-slate-100"
                  />
                  <select 
                    value={editType} 
                    onChange={(e) => setEditType(e.target.value)}
                    className="bg-slate-900 border border-purple-500 rounded px-2 py-1 text-sm text-slate-100"
                  >
                    <option value="both">Stock & Congélateur</option>
                    <option value="stock">Stock uniquement</option>
                    <option value="freezer">Congélateur uniquement</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSaveEdit(cat._id)} className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-slate-200">{cat.name}</p>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      {cat.type === 'both' ? 'Stock & Congélateur' : cat.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStartEdit(cat)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700/50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}