import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Edit2, Check, X, Truck, Phone, Mail } from 'lucide-react';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      console.error("Erreur de chargement des fournisseurs :", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/suppliers', { name: name.trim(), contactName, phone, email });
      setName('');
      setContactName('');
      setPhone('');
      setEmail('');
      fetchSuppliers();
    } catch (err) {
      console.error("Erreur de création :", err);
      alert(`Erreur : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleStartEdit = (supplier) => {
    setEditingId(supplier._id);
    setEditForm(supplier);
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/suppliers/${id}`, editForm);
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      console.error("Erreur de modification :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Gestion des Fournisseurs</h2>
          <p className="text-xs text-slate-400">Gérez vos contacts et partenaires d'approvisionnement</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Nom fournisseur</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Metro, Promocash"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Contact</label>
          <input 
            type="text" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)} 
            placeholder="Nom du représentant"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Téléphone</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="06 00 00 00 00"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="contact@fournisseur.fr"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </form>

      <div className="divide-y divide-slate-700/60">
        {suppliers.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">Aucun fournisseur enregistré.</p>
        ) : (
          suppliers.map((sup) => (
            <div key={sup._id} className="py-3 flex justify-between items-center gap-4">
              {editingId === sup._id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input 
                    type="text" 
                    value={editForm.name || ''} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="bg-slate-900 border border-blue-500 rounded px-2 py-1 text-sm text-slate-100"
                  />
                  <input 
                    type="text" 
                    value={editForm.contactName || ''} 
                    onChange={(e) => setEditForm({...editForm, contactName: e.target.value})}
                    className="bg-slate-900 border border-blue-500 rounded px-2 py-1 text-sm text-slate-100"
                  />
                  <input 
                    type="text" 
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="bg-slate-900 border border-blue-500 rounded px-2 py-1 text-sm text-slate-100"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSaveEdit(sup._id)} className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30">
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
                    <p className="font-medium text-slate-200">{sup.name}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      {sup.contactName && <span>Contact : {sup.contactName}</span>}
                      {sup.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{sup.phone}</span>}
                      {sup.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{sup.email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStartEdit(sup)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700/50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(sup._id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/50">
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