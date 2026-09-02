import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatDate, formatDateForInput } from '../utils/formatters';
import { Snowflake, Plus, Minus, Trash2, Edit2, Check, X, CalendarClock } from 'lucide-react';

export default function FreezerView({ 
  freezerItems = [], 
  refreshFreezerItems, 
  categories = [], 
  suppliers = [] 
}) {
  // État pour la création
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // État pour l'édition en ligne (ID de l'item en cours de modification)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    supplier: '',
    quantity: 1,
    expirationDate: ''
  });

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Ajouter un élément
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/freezer', {
        title: name.trim(),
        portionsCount: Number(quantity),
        location: category || (categories[0]?.name || 'Tiroir 1'),
        supplier,
        expirationDate: expirationDate || null
      });

      setName('');
      setQuantity(1);
      setSupplier('');
      setExpirationDate('');
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur ajout congélateur :", err.response?.data || err.message);
    }
  };

  // Lancer le mode édition
  const startEditing = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.title,
      category: item.location,
      supplier: item.supplier || '',
      quantity: item.portionsCount,
      expirationDate: formatDateForInput(item.expirationDate)
    });
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingId(null);
  };

  // Sauvegarder l'édition
  const handleUpdateItem = async (id) => {
    try {
      await api.put(`/freezer/${id}`, {
        title: editForm.name,
        location: editForm.category,
        supplier: editForm.supplier,
        portionsCount: Number(editForm.quantity),
        expirationDate: editForm.expirationDate || null
      });
      setEditingId(null);
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur mise à jour congélateur :", err.response?.data || err.message);
    }
  };

  // Incrément / Décrément rapide
  const handleQuantityChange = async (item, delta) => {
    try {
      if (delta > 0) {
        await api.put(`/freezer/${item._id}`, { portionsCount: item.portionsCount + delta });
      } else {
        await api.patch(`/freezer/${item._id}/consume`, { count: Math.abs(delta) });
      }
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur modification quantité :", err);
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet article du congélateur ?")) return;
    try {
      await api.delete(`/freezer/${id}`);
      refreshFreezerItems();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  // Vérifier si un produit est périmé
  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddItem} className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Nom de l'article</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Steak haché" 
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
          <label className="text-xs text-slate-400 block mb-1">Péremption</label>
          <input 
            type="date" 
            value={expirationDate} 
            onChange={(e) => setExpirationDate(e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Quantité</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            min="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </form>

      {/* Tableau des articles */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-700">
              <th className="p-4">Produit</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Fournisseur</th>
              <th className="p-4">Péremption</th>
              <th className="p-4">Quantité</th>
              <th className="p-4">Ajouté le</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {freezerItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-400">
                  Aucun produit dans le congélateur.
                </td>
              </tr>
            ) : (
              freezerItems.map((item) => {
                const isEditing = editingId === item._id;
                const expired = isExpired(item.expirationDate);

                return (
                  <tr key={item._id} className="hover:bg-slate-700/30">
                    {/* Nom */}
                    <td className="p-4 font-medium text-slate-200">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.name} 
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Snowflake className="w-4 h-4 text-cyan-400" />
                          {item.title}
                        </div>
                      )}
                    </td>

                    {/* Catégorie */}
                    <td className="p-4 text-slate-400">
                      {isEditing ? (
                        <select 
                          value={editForm.category} 
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100"
                        >
                          {categories.map((cat) => (
                            <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      ) : (
                        item.location
                      )}
                    </td>

                    {/* Fournisseur */}
                    <td className="p-4 text-slate-400">
                      {isEditing ? (
                        <select 
                          value={editForm.supplier} 
                          onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                          className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100"
                        >
                          <option value="">-- Aucun --</option>
                          {suppliers.map((sup) => (
                            <option key={sup._id || sup.name} value={sup.name}>{sup.name}</option>
                          ))}
                        </select>
                      ) : (
                        item.supplier || '-'
                      )}
                    </td>

                    {/* Date de Péremption */}
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          type="date" 
                          value={editForm.expirationDate} 
                          onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                          className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100"
                        />
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${expired ? 'text-rose-400 font-semibold' : 'text-slate-300'}`}>
                          {expired && <CalendarClock className="w-3.5 h-3.5 text-rose-400" />}
                          {formatDate(item.expirationDate)}
                        </span>
                      )}
                    </td>

                    {/* Quantité */}
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editForm.quantity} 
                          onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                          className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100"
                        />
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300">
                          {item.portionsCount}
                        </span>
                      )}
                    </td>

                    {/* Date de création */}
                    <td className="p-4 text-slate-400 text-xs">
                      {formatDate(item.createdAt, true)}
                    </td>

                    {/* Actions */}
                    <td className="p-4 flex justify-end items-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleUpdateItem(item._id)} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white" title="Valider">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEditing} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300" title="Annuler">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleQuantityChange(item, -1)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200">
                            <Minus className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleQuantityChange(item, 1)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200">
                            <Plus className="w-4 h-4" />
                          </button>
                          <button onClick={() => startEditing(item)} className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg ml-1">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}