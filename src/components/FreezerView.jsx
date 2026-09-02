import { useState } from 'react';
import api from '../api/axios';
import { Snowflake, Plus, Flame, Trash2 } from 'lucide-react';

export default function FreezerView({ freezerItems = [], refreshFreezerItems }) {
  const [title, setTitle] = useState('');
  const [portionsCount, setPortionsCount] = useState(1);
  const [category, setCategory] = useState('Plats cuisinés');

  const handleAddPortion = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.post('/freezer', { 
        title: title.trim(),
        portionsCount: Number(portionsCount),
        category: category 
      });
      setTitle('');
      setPortionsCount(1);
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur ajout congélateur :", err);
    }
  };

  const handleConsume = async (id) => {
    try {
      await api.patch(`/freezer/${id}/consume`, { count: 1 });
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur décongélation :", err);
    }
  };

const handleDelete = async (id) => {
  if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;

  try {
    await api.delete(`/freezer/${id}`);
    refreshFreezerItems();
  } catch (err) {
    console.error("Erreur de suppression :", err.response?.data || err.message);
    alert("Erreur lors de la suppression de l'élément.");
  }
};

  return (
    <div id="freezer-section" className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
          <Snowflake className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Gestion du Congélateur</h2>
          <p className="text-xs text-slate-400">Suivi des portions cuisinées et congelées</p>
        </div>
      </div>

      <form onSubmit={handleAddPortion} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Nom du plat / aliment</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Ex: Bolognaise maison" 
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
            <option value="Plats cuisinés">Plats cuisinés</option>
            <option value="Viandes & Poissons">Viandes & Poissons</option>
            <option value="Légumes">Légumes</option>
            <option value="Desserts & Pains">Desserts & Pains</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Nombre de portions</label>
          <input 
            type="number" 
            value={portionsCount} 
            onChange={(e) => setPortionsCount(e.target.value)} 
            min="1"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Congeler
        </button>
      </form>

      {freezerItems.length === 0 ? (
        <p className="text-slate-400 text-sm py-4 text-center">Le congélateur est vide.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freezerItems.map((item) => {
            const itemId = item._id || item.id;
            return (
              <div key={itemId} className="bg-slate-900 p-4 rounded-lg border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-200">{item.title || item.dishName || item.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                      {item.portionsCount ?? item.count ?? item.quantity} portion(s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{item.category}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <button 
                    onClick={() => handleConsume(itemId)}
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" /> Décongeler (-1)
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(itemId)}
                    className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-md transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}