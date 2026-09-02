import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Snowflake, Plus, Minus, Pencil, Trash2 } from 'lucide-react';

export default function FreezerView({ 
  freezerItems = [], 
  refreshFreezerItems, 
  categories = [], 
  suppliers = [] 
}) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('');
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/freezer', {
        title: name.trim(),
        portionsCount: Number(quantity),
        location: category || (categories[0]?.name || 'Tiroir 1'),
        supplier
      });
      setName('');
      setQuantity(1);
      setSupplier('');
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur ajout congélateur :", err.response?.data || err.message);
    }
  };

  const handleQuantityChange = async (item, delta) => {
    try {
      if (delta > 0) {
        await api.put(`/freezer/${item._id}`, { portionsCount: item.portionsCount + delta });
      } else {
        await api.patch(`/freezer/${item._id}/consume`, { count: Math.abs(delta) });
      }
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur modification quantité congélateur :", err.response?.data || err.message);
    }
  };

  const handleEdit = async (item) => {
    const editedTitle = prompt('Nom de l\'article congelé', item.title);
    if (editedTitle === null || !editedTitle.trim()) return;
    const editedCount = prompt('Nombre de portions', item.portionsCount);
    if (editedCount === null) return;

    const portionsCount = Number(editedCount);
    if (!Number.isInteger(portionsCount) || portionsCount < 1) return;

    try {
      await api.put(`/freezer/${item._id}`, { title: editedTitle.trim(), portionsCount });
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur de modification congélateur :", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet article du congélateur ?")) return;
    try {
      await api.delete(`/freezer/${id}`);
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur suppression congélateur :", err);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddItem} className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Nom de l'article congelé</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Filet de saumon" 
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
            {categories.map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Fournisseur</label>
          <select 
            value={supplier} 
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">-- Aucun --</option>
            {suppliers.map((sup) => (
              <option key={sup._id || sup.name} value={sup.name}>{sup.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Quantité initiale</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            min="1"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </form>

      {/* Tableau des articles en congélateur */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-700">
              <th className="p-4">Produit</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Fournisseur</th>
              <th className="p-4">Quantité</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {freezerItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-400">
                  Aucun produit dans le congélateur.
                </td>
              </tr>
            ) : (
              freezerItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-700/30">
                  <td className="p-4 font-medium text-slate-200 flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                    {item.title}
                  </td>
                  <td className="p-4 text-slate-400">{item.location}</td>
                  <td className="p-4 text-slate-400">{item.supplier || '-'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300">
                      {item.portionsCount}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end items-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200" title="Modifier">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleQuantityChange(item, -1)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200">
                      <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleQuantityChange(item, 1)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg ml-2">
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