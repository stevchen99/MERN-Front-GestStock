import { useEffect, useState } from 'react';
import api from './api/axios';
import StockList from './components/StockList';
import FreezerView from './components/FreezerView';
import StatsOverview from './components/StatsOverview';

export default function App() {
  const [items, setItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupération des produits du stock principal
  const fetchItems = () => {
    api.get('/items')
      .then((res) => {
        setItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des stocks:", err);
        setLoading(false);
      });
  };

  // Récupération des produits du congélateur
  const fetchFreezerItems = () => {
    api.get('/freezer')
      .then((res) => {
        setFreezerItems(res.data);
      })
      .catch((err) => {
        console.error("Erreur chargement congélateur :", err);
      });
  };

  useEffect(() => {
    fetchItems();
    fetchFreezerItems();
  }, []);

  const lowStockItems = items.filter(item => item.quantity <= (item.minThreshold || 2));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Gîte Stock Management</h1>
          <p className="text-slate-400 text-sm">Vue d'ensemble des stocks et congélateur</p>
        </div>
      </header>

      {/* Reçoit freezerItems directement */}
      <StatsOverview items={items} freezerItems={freezerItems} />

      <section className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
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
                  <p className="text-xs text-slate-400">{item.category}</p>
                </div>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Reste : {item.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="add-form" className="mb-8">
        <StockList items={items} refreshItems={fetchItems} />
      </section>

      <section>
        {/* Reçoit les items et la fonction de rafraîchissement */}
        <FreezerView freezerItems={freezerItems} refreshFreezerItems={fetchFreezerItems} />
      </section>
    </div>
  );
}