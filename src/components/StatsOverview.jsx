import { Package, AlertTriangle, Snowflake } from 'lucide-react';

export default function StatsOverview({ items = [], freezerItems = [] }) {
  const totalItems = items.length;
  const lowStockAlerts = items.filter(
    (item) => item.quantity <= (item.minQuantity ?? 1)
  ).length;

  const totalFreezerPortions = freezerItems.reduce(
    (acc, item) => acc + Number(item.portionsCount || item.count || item.quantity || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">Total Produits</p>
          <h3 className="text-3xl font-bold mt-1">{totalItems}</h3>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <Package className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">Alertes Stock Bas</p>
          <h3 className="text-3xl font-bold text-amber-400 mt-1">{lowStockAlerts}</h3>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">Total produits congelés</p>
          <h3 className="text-3xl font-bold text-cyan-400 mt-1">{totalFreezerPortions}</h3>
        </div>
        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
          <Snowflake className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}