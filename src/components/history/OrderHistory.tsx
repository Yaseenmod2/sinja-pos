import React, { useState, useEffect, useMemo } from 'react';
import { Order, User, Customer } from '../../types';
import { fetchOrders, fetchUsers, fetchCustomers } from '../../services/dataService';
import OrderDetailModal from './OrderDetailModal';
import { Eye, Loader } from 'lucide-react';

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [fetchedOrders, fetchedUsers, fetchedCustomers] = await Promise.all([
                    fetchOrders(),
                    fetchUsers(),
                    fetchCustomers(),
                ]);
                // Sort orders by most recent first
                setOrders(fetchedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setUsers(fetchedUsers);
                setCustomers(fetchedCustomers);
            } catch (error) {
                console.error("Failed to load order history data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Order History</h1>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Served By</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{order.id.slice(-6)}</td>
                                <td className="px-6 py-4">{new Date(order.date).toLocaleString()}</td>
                                <td className="px-6 py-4">{order.customerId ? customerMap.get(order.customerId) || 'N/A' : 'Guest'}</td>
                                <td className="px-6 py-4">{order.finalAmount.toFixed(2)} DH</td>
                                <td className="px-6 py-4">{userMap.get(order.servedBy) || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:text-blue-700 p-1">
                                        <Eye className="h-5 w-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {orders.length === 0 && (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        No orders have been placed yet.
                    </div>
                )}
            </div>
            
            <OrderDetailModal 
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
        </div>
    );
};

export default OrderHistory;
