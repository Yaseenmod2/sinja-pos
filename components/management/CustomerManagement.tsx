
import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { fetchCustomers, saveCustomers } from '../../services/dataService';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setCustomers(await fetchCustomers());
    };

    const handleSave = async () => {
        if (!editingCustomer) return;
        let updatedCustomers;
        if (editingCustomer.id) {
            updatedCustomers = customers.map(c => c.id === editingCustomer.id ? { ...c, ...editingCustomer } as Customer : c);
        } else {
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                name: '',
                phone: '',
                loyaltyPoints: 0,
                ...editingCustomer
            };
            updatedCustomers = [...customers, newCustomer];
        }
        await saveCustomers(updatedCustomers);
        setCustomers(updatedCustomers);
        closeModal();
    };

    const openDeleteModal = (customerId: string) => {
        setCustomerToDelete(customerId);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!customerToDelete) return;
        const updatedCustomers = customers.filter(c => c.id !== customerToDelete);
        await saveCustomers(updatedCustomers);
        setCustomers(updatedCustomers);
        setCustomerToDelete(null);
    };

    const openModal = (customer: Partial<Customer> | null = null) => {
        setEditingCustomer(customer ? { ...customer } : { name: '', phone: '', loyaltyPoints: 0 });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingCustomer(null);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customer Loyalty</h1>
                <button onClick={() => openModal()} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" /> Add Customer
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Phone</th>
                            <th scope="col" className="px-6 py-3">Loyalty Points</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customer.name}</td>
                                <td className="px-6 py-4">{customer.phone}</td>
                                <td className="px-6 py-4 flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    {customer.loyaltyPoints}
                                </td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => openModal(customer)} className="text-blue-500 hover:text-blue-700 p-1"><Edit className="h-5 w-5"/></button>
                                    <button onClick={() => openDeleteModal(customer.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 p-6 space-y-4">
                        <h2 className="text-2xl font-bold">{editingCustomer.id ? 'Edit' : 'Add'} Customer</h2>
                        <input type="text" placeholder="Name" value={editingCustomer.name || ''} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                        <input type="text" placeholder="Phone Number" value={editingCustomer.phone || ''} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                        <input type="number" placeholder="Loyalty Points" value={editingCustomer.loyaltyPoints || ''} onChange={e => setEditingCustomer({...editingCustomer, loyaltyPoints: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>

                        <div className="flex justify-end space-x-2">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This action cannot be undone."
            />
        </div>
    );
};

export default CustomerManagement;
