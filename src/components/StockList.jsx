import { useState } from 'react';
import api from '../api/axios';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function StockList({ items, refreshItems }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('EPICERIE');
  const [minThreshold, setMinThreshold] = useState(2);

  const handleQuantityChange = async (item, delta) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    try {
      await api.patch(`/items/${item._id}/quantity`, { 
        quantity: newQuantity,
        delta: delta,
        action: delta > 0 ? 'increment' : 'decrement'
      });
      refreshItems();
    } catch (err) {
      console.error("Erreur de modification de quantité :", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await api.delete(`/items/${id}`);
      refreshItems();
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/items', { 
        name: name.trim(), 
        quantity: Number(quantity), 
        category, 
        minThreshold: Number(minThreshold) 
      });
      setName('');
      setQuantity(1);
      refreshItems();
    } catch (err) {
      console.error("Erreur détaillée lors de l'ajout :", err.response?.data || err.message);
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Erreur lors de l'ajout du produit : ${serverMessage}`);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      <form onSubmit={handleAddItem} className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Nom du produit</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Pâtes 500g" 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Catégorie</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="EPICERIE">Épicerie</option>
            <option value="FRAIS">Frais</option>
            <option value="BOISSONS">Boissons</option>
            <option value="ENTRETIEN">Entretien</option>
            <option value="PETIT_DEJEUNER">Petit Déjeuner</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Quantité initiale</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            min="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Seuil d'alerte</label>
          <input 
            type="number" 
            value={minThreshold} 
            onChange={(e) => setMinThreshold(e.target.value)} 
            min="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-700">
              <th className="p-4">Produit</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Quantité</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-400">Aucun produit dans l'inventaire.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-700/30">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-slate-400">{item.category}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.quantity <= (item.minThreshold || 2) ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
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