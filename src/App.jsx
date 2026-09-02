import { useEffect, useState } from 'react';
import api from './api/axios';
import StockList from './components/StockList';
import FreezerView from './components/FreezerView';
import StatsOverview from './components/StatsOverview';
import SettingsView from './components/SettingsView';
import { LayoutDashboard, Snowflake, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'freezer', 'settings'
  const [items, setItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = () => {
    api.get('/items')
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchFreezerItems = () => {
    api.get('/freezer')
      .then((res) => setFreezerItems(res.data))
      .catch((err) => console.error(err));
  };

  const fetchCategories = () => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  };

  const fetchSuppliers = () => {
    api.get('/suppliers')
      .then((res) => setSuppliers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchItems();
    fetchFreezerItems();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const lowStockItems = items.filter(item => item.quantity <= (item.minQuantity ?? 1));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* En-tête avec Navigation par Onglets */}
      <header className="mb-8 border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Gîte Stock Management</h1>
          <p className="text-slate-400 text-sm">Vue d'ensemble des stocks et congélateur</p>
        </div>

        {/* Boutons d'Onglets */}
        <nav className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/80 gap-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Tableau de Bord
          </button>
          
          <button 
            onClick={() => setActiveTab('freezer')} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'freezer' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Snowflake className="w-4 h-4" /> Congélateur
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'settings' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings className="w-4 h-4" /> Paramètres
          </button>
        </nav>
      </header>

      {/* Cartes de statistiques */}
      <StatsOverview items={items} freezerItems={freezerItems} />

      {/* VUE : TABLEAU DE BORD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Produits sous le seuil critique</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Chargement des données...</p>
            ) : lowStockItems.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucun produit en alerte de stock.</p>
            ) : (
              <div className="divide-y divide-slate-700">
                {lowStockItems.map((item) => (
                  <div key={item._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-200">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.category} {item.supplier ? `• ${item.supplier}` : ''}
                      </p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                      Reste : {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <StockList 
            items={items} 
            refreshItems={fetchItems} 
            categories={categories} 
            suppliers={suppliers} 
          />
        </div>
      )}

      {/* VUE : CONGÉLATEUR */}
      {activeTab === 'freezer' && (
        <FreezerView 
          freezerItems={freezerItems} 
          refreshFreezerItems={fetchFreezerItems} 
          categories={categories.filter(c => c.type === 'freezer' || c.type === 'both')} 
          suppliers={suppliers} 
        />
      )}

      {/* VUE : PARAMÈTRES */}
      {activeTab === 'settings' && (
        <SettingsView categories={categories} refreshCategories={fetchCategories} />
      )}
    </div>
  );
}