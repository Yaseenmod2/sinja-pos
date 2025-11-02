import React, { useState, useEffect } from 'react';
import { Category, Product } from '../../types';
import { fetchCategories, saveCategories, fetchProducts } from '../../services/dataService';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setCategories(await fetchCategories());
        setProducts(await fetchProducts());
    };

    const handleSave = async () => {
        if (!editingCategory || !editingCategory.name) {
            setErrorMessage('Category name cannot be empty.');
            return;
        }
        let updatedCategories;
        if (editingCategory.id) {
            updatedCategories = categories.map(c => c.id === editingCategory.id ? { ...c, ...editingCategory } as Category : c);
        } else {
            const newCategory: Category = {
                id: `cat-${Date.now()}`,
                name: '',
                imageUrl: 'https://placehold.co/400x400/e2e8f0/e2e8f0',
                ...editingCategory
            };
            updatedCategories = [...categories, newCategory];
        }
        await saveCategories(updatedCategories);
        setCategories(updatedCategories);
        closeModal();
    };

    const openDeleteModal = (categoryId: string) => {
        setCategoryToDelete(categoryId);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        const isCategoryInUse = products.some(p => p.categoryId === categoryToDelete);

        if (isCategoryInUse) {
            alert('This category cannot be deleted because it is being used by one or more products.');
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            return;
        }

        const updatedCategories = categories.filter(c => c.id !== categoryToDelete);
        await saveCategories(updatedCategories);
        setCategories(updatedCategories);
        setCategoryToDelete(null);
    };

    const openModal = (category: Partial<Category> | null = null) => {
        setEditingCategory(category ? { ...category } : { name: '', imageUrl: '' });
        setIsModalOpen(true);
        setErrorMessage('');
    };

    const closeModal = () => {
        setEditingCategory(null);
        setIsModalOpen(false);
        setErrorMessage('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingCategory(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Category Management</h1>
                <button onClick={() => openModal()} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" /> Add Category
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Image</th>
                            <th scope="col" className="px-6 py-3">Category Name</th>
                            <th scope="col" className="px-6 py-3">Product Count</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">
                                    <img src={category.imageUrl || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=No+Image'} alt={category.name} className="w-10 h-10 rounded-md object-cover" />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{category.name}</td>
                                <td className="px-6 py-4">{products.filter(p => p.categoryId === category.id).length}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => openModal(category)} className="text-blue-500 hover:text-blue-700 p-1"><Edit className="h-5 w-5"/></button>
                                    <button onClick={() => openDeleteModal(category.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 p-6 space-y-4">
                        <h2 className="text-2xl font-bold">{editingCategory.id ? 'Edit' : 'Add'} Category</h2>
                        <div>
                            <input type="text" placeholder="Category Name" value={editingCategory.name || ''} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                             {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Image</label>
                            <div className="mt-1 flex items-center space-x-4">
                                <img src={editingCategory.imageUrl || 'https://placehold.co/400x400/e2e8f0/e2e8f0?text=Preview'} alt="Category Preview" className="w-20 h-20 rounded-md object-cover bg-gray-200" />
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-700 file:text-primary-700 dark:file:text-primary-100 hover:file:bg-primary-100 dark:hover:file:bg-primary-600"/>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
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
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
            />
        </div>
    );
};

export default CategoryManagement;