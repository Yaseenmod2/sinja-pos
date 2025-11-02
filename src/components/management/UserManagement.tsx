import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { fetchUsers, saveUsers } from '../../services/dataService';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setUsers(await fetchUsers());
    };

    const handleSave = async () => {
        if (!editingUser) return;
        let updatedUsers;
        if (editingUser.id) {
            updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...editingUser } as User : u);
        } else {
            const newUser: User = {
                id: `user-${Date.now()}`,
                name: '',
                role: UserRole.WORKER,
                accessCode: '',
                ...editingUser
            };
            updatedUsers = [...users, newUser];
        }
        await saveUsers(updatedUsers);
        setUsers(updatedUsers);
        closeModal();
    };

    const openDeleteModal = (userId: string) => {
        setUserToDelete(userId);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        const updatedUsers = users.filter(u => u.id !== userToDelete);
        await saveUsers(updatedUsers);
        setUsers(updatedUsers);
        setUserToDelete(null);
    };

    const openModal = (user: Partial<User> | null = null) => {
        setEditingUser(user ? { ...user } : { name: '', role: UserRole.WORKER, accessCode: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
                <button onClick={() => openModal()} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" /> Add User
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Access Code</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4">{user.accessCode}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    {(currentUser?.role === UserRole.ADMIN || user.role !== UserRole.ADMIN) && (
                                        <button onClick={() => openModal(user)} className="text-blue-500 hover:text-blue-700 p-1"><Edit className="h-5 w-5"/></button>
                                    )}
                                    {user.role !== UserRole.ADMIN && (
                                        <button onClick={() => openDeleteModal(user.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-5 w-5"/></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 p-6 space-y-4">
                        <h2 className="text-2xl font-bold">{editingUser.id ? 'Edit' : 'Add'} User</h2>
                        <input type="text" placeholder="Name" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                        <input type="text" placeholder="Access Code (4 digits)" value={editingUser.accessCode || ''} onChange={e => setEditingUser({...editingUser, accessCode: e.target.value.replace(/\D/g, '').slice(0,4)})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" maxLength={4}/>
                        <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <option value={UserRole.WORKER}>Worker</option>
                            {currentUser?.role === UserRole.ADMIN && (
                                <option value={UserRole.ADMIN}>Admin</option>
                            )}
                        </select>
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
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
            />
        </div>
    );
};

export default UserManagement;