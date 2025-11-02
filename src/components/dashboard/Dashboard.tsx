
import React, { useEffect, useState } from 'react';
import { fetchOrders, fetchProducts } from '../../services/dataService';
import { getSalesInsights } from '../../services/geminiService';
import { Order, Product } from '../../types';
import { DollarSign, ShoppingBag, Box, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
    <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const fetchedOrders = await fetchOrders();
      const fetchedProducts = await fetchProducts();
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
    };
    loadData();
  }, []);

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    const result = await getSalesInsights(orders, products);
    setInsights(result);
    setLoadingInsights(false);
  };
  
  // Use `any` for order to handle legacy data from localStorage gracefully
  const totalRevenue = orders.reduce((sum, order: any) => sum + (order.finalAmount ?? order.total ?? 0), 0);
  const totalOrders = orders.length;
  
  const productSales = orders
    .flatMap((order: any) => order.items || []) // Safety check for items array
    .reduce((acc, item) => {
      // Fix: The right-hand side of the addition could be a string if `item.quantity` is from legacy data,
      // leading to string concatenation. The subsequent sort on `productSales` would then fail with a type
      // error on subtraction. Explicitly casting to Number ensures correct arithmetic.
      acc[item.name] = Number(acc[item.name] || 0) + Number(item.quantity || 0);
      return acc;
    }, {} as Record<string, number>);

  const topProducts = Object.entries(productSales)
    // FIX: Explicitly cast values to Number during sort to handle cases where legacy data might contain strings, preventing runtime errors.
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 5)
    .map(([name, sales]) => ({ name, sales }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`${totalRevenue.toFixed(2)} DH`} icon={<DollarSign className="h-6 w-6 text-primary-500" />} />
        <StatCard title="Total Orders" value={totalOrders.toString()} icon={<ShoppingBag className="h-6 w-6 text-primary-500" />} />
        <StatCard title="Total Products" value={products.length.toString()} icon={<Box className="h-6 w-6 text-primary-500" />} />
        <StatCard title="Avg. Order Value" value={`${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'} DH`} icon={<Activity className="h-6 w-6 text-primary-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Top Selling Products</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topProducts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', color: '#fff' }}/>
                <Legend />
                <Bar dataKey="sales" fill="#10b981" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">AI Sales Insights</h2>
          <button
            onClick={handleGetInsights}
            disabled={loadingInsights}
            className="w-full mb-4 px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-primary-400 flex items-center justify-center"
          >
            {loadingInsights ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              'Generate Insights'
            )}
          </button>
          {insights ? (
            <div className="text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} />
          ) : (
             <p className="text-sm text-gray-500 dark:text-gray-400">Click the button to get AI-powered insights on your sales data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
