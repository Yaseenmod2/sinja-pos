import React, { useState, useEffect } from 'react';
import { Product, CartItem, Customer } from '../../types';
import { fetchProducts, fetchCustomers } from '../../services/dataService';
import ProductGrid from './ProductGrid';
import Cart from './Cart';

const POSView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        const fetchedCustomers = await fetchCustomers();
        setCustomers(fetchedCustomers);
    };
    loadData();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
            return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevCart; // Do not add if stock limit reached
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) => {
        const product = products.find(p => p.id === productId);
        if (!product) return prevCart;

        if (quantity === 0) {
            return prevCart.filter((item) => item.id !== productId);
        }
        if (quantity > product.stock) {
            quantity = product.stock; // Cap at stock limit
        }
        return prevCart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
        );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCustomerAdded = async () => {
    const fetchedCustomers = await fetchCustomers();
    setCustomers(fetchedCustomers);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      <div className="lg:w-3/5 xl:w-2/3">
        <ProductGrid products={products} onAddToCart={addToCart} />
      </div>
      <div className="lg:w-2/5 xl:w-1/3">
        <Cart
          cart={cart}
          customers={customers}
          onUpdateQuantity={updateQuantity}
          onClearCart={clearCart}
          onCustomerAdded={handleCustomerAdded}
        />
      </div>
    </div>
  );
};

export default POSView;