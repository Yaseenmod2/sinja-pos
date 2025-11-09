import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { fetchProducts, saveProducts, fetchCategories } from '../../services/dataService';
import { generateProductDescription } from '../../services/geminiService';
import { useOnlineStatus } from '../../context/OnlineStatusContext';
import { Plus, Edit, Trash2, Sparkles } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';

const ProductManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const { isOnline } = useOnlineStatus();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setProducts(await fetchProducts());
        setCategories(await fetchCategories());
    };

    const handleSave = async () => {
        if (!editingProduct) return;
        let updatedProducts;
        if (editingProduct.id) {
            updatedProducts = products.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct } as Product : p);
        } else {
            const newProduct: Product = {
                id: `prod-${Date.now()}`,
                name: '',
                description: '',
                price: 0,
                stock: 0,
                categoryId: '',
                imageUrl: 'https://placehold.co/400x400/e2e8f0/e2e8f0',
                ...editingProduct
            };
            updatedProducts = [...products, newProduct];
        }
        await saveProducts(updatedProducts);
        setProducts(updatedProducts);
        closeModal();
    };

    const openDeleteModal = (productId: string) => {
        setProductToDelete(productId);
        setIsDeleteModalOpen(true);
    };
    
    const handleDelete = async () => {
        if (!productToDelete) return;
        const updatedProducts = products.filter(p => p.id !== productToDelete);
        await saveProducts(updatedProducts);
        setProducts(updatedProducts);
        setProductToDelete(null);
    };

    const openModal = (product: Partial<Product> | null = null) => {
        setEditingProduct(product ? { ...product } : { name: '', price: 0, stock: 0, categoryId: categories[0]?.id || '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const handleGenerateDescription = async () => {
        if (!editingProduct || !editingProduct.name) return;
        setIsGeneratingDesc(true);
        const description = await generateProductDescription(editingProduct.name);
        setEditingProduct(prev => ({...prev, description}));
        setIsGeneratingDesc(false);
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Product Management</h1>
                <button onClick={() => openModal()} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" /> Add Product
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Stock</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap flex items-center">
                                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-4" />
                                    {product.name}
                                </th>
                                <td className="px-6 py-4">{categoryMap.get(product.categoryId) || 'N/A'}</td>
                                <td className="px-6 py-4">{product.price.toFixed(2)} DH</td>
                                <td className="px-6 py-4">{product.stock}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => openModal(product)} className="text-blue-500 hover:text-blue-700 p-1"><Edit className="h-5 w-5"/></button>
                                    <button onClick={() => openDeleteModal(product.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 p-6 space-y-4">
                        <h2 className="text-2xl font-bold">{editingProduct.id ? 'Edit' : 'Add'} Product</h2>
                        
                        <input type="text" placeholder="Name" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                        
                        <div className="relative">
                            <textarea placeholder="Description" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" rows={3}/>
                            <button 
                                onClick={handleGenerateDescription} 
                                disabled={isGeneratingDesc || !editingProduct.name || !isOnline} 
                                className="absolute bottom-2 right-2 flex items-center text-xs bg-primary-500 text-white px-2 py-1 rounded-md hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed"
                                title={!isOnline ? "AI features are disabled in offline mode" : "Generate with AI"}
                            >
                                {isGeneratingDesc ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div> : <Sparkles className="h-4 w-4 mr-1"/>}
                                AI Gen
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Price" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                            <input type="number" placeholder="Stock" value={editingProduct.stock || ''} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <select value={editingProduct.categoryId} onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                             <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
                            <div className="mt-1 flex items-center space-x-4">
                                <img src={editingProduct.imageUrl || 'https://placehold.co/400x400/e2e8f0/e2e8f0?text=Preview'} alt="Product Preview" className="w-20 h-20 rounded-md object-cover bg-gray-200" />
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-700 file:text-primary-700 dark:file:text-primary-100 hover:file:bg-primary-100 dark:hover:file:bg-primary-600"/>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
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
                title="Delete Product"
                message={`Are you sure you want to delete this product? This action cannot be undone.`}
            />
        </div>
    );
};

export default ProductManagement;
