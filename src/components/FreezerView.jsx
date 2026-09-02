import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Minus, Trash2, Snowflake } from 'lucide-react';

export default function FreezerView({ freezerItems = [], refreshFreezerItems, categories = [] }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('');
  const [minThreshold, setMinThreshold] = useState(1);

  // Mettre à jour la catégorie par défaut quand la liste des catégories est disponible
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const handleQuantityChange = async (item, delta) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    try {
      await api.patch(`/freezer/${item._id}/quantity`, { 
        quantity: newQuantity,
        delta: delta,
        action: delta > 0 ? 'increment' : 'decrement'
      });
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur de modification de quantité (congélateur) :", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet article du congélateur ?")) return;
    try {
      await api.delete(`/freezer/${id}`);
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/freezer', { 
        name: name.trim(), 
        quantity: Number(quantity), 
        category: category || (categories[0]?.name || 'CONGELATEUR'), 
        minThreshold: Number(minThreshold) 
      });
      setName('');
      setQuantity(1);
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur lors de l'ajout dans le congélateur :", err.response?.data || err.message);
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Erreur lors de l'ajout : ${serverMessage}`);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddItem} className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Article surgelé</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Filets de Poulet 1kg" 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Catégorie</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {categories.length === 0 ? (
              <option value="VIANDES">VIANDES</option>
            ) : (
              categories.map((cat) => (
                <option key={cat._id || cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Quantité initiale</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            min="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Seuil d'alerte</label>
          <input 
            type="number" 
            value={minThreshold} 
            onChange={(e) => setMinThreshold(e.target.value)} 
            min="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </form>

      {/* Tableau des articles du congélateur */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-700 flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Snowflake className="w-4 h-4" />
          <span>Inventaire Congélateur</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-700">
              <th className="p-4">Article</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Quantité</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {freezerItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-400">Aucun produit dans le congélateur.</td>
              </tr>
            ) : (
              freezerItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-700/30">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-slate-400">{item.category}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.quantity <= (item.minThreshold || 1) ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end items-center gap-2">
                    <button 
                      onClick={() => handleQuantityChange(item, -1)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleQuantityChange(item, 1)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}