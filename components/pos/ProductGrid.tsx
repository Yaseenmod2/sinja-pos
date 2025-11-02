import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../../types';
import { fetchCategories } from '../../services/dataService';
import { Search, PlusCircle, ArrowLeft } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200 cursor-pointer group" onClick={() => onAddToCart(product)}>
    <div className="relative">
      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <PlusCircle className="h-12 w-12 text-white" />
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{product.name}</h3>
      <p className="text-gray-500 dark:text-gray-400">{product.price.toFixed(2)} DH</p>
      <p className={`text-sm ${product.stock > 10 ? 'text-green-500' : 'text-yellow-500'}`}>
        {product.stock} in stock
      </p>
    </div>
  </div>
);

const CategoryCard: React.FC<{ category: Category; onClick: () => void }> = ({ category, onClick }) => (
  <div 
    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200 cursor-pointer group" 
    onClick={onClick}
  >
    <div className="relative h-40">
        <img 
            src={category.imageUrl || 'https://placehold.co/400x400/e2e8f0/e2e8f0?text=No+Image'} 
            alt={category.name} 
            className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h3 className="font-bold text-xl text-white text-center p-2">{category.name}</h3>
        </div>
    </div>
  </div>
);

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewingCategoryId, setViewingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    };
    loadCategories();
  }, []);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => {
    if (viewingCategoryId === null) return false;
    const matchesCategory = product.categoryId === viewingCategoryId;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentCategoryName = viewingCategoryId ? categoryMap.get(viewingCategoryId) : 'All Categories';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        {viewingCategoryId && (
          <button 
            onClick={() => { setViewingCategoryId(null); setSearchTerm(''); }} 
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Back to categories"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                type="text"
                placeholder={viewingCategoryId ? `Search in ${currentCategoryName}...` : "Search categories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
            />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {viewingCategoryId === null ? (
              filteredCategories.map(category => (
                <CategoryCard key={category.id} category={category} onClick={() => { setViewingCategoryId(category.id); setSearchTerm(''); }} />
              ))
            ) : (
              filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              )) : <p className="col-span-full text-center text-gray-500">No products found in this category.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;