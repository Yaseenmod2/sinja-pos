import React, { useState, useMemo } from 'react';
import { CartItem, Customer } from '../../types';
import { Trash2, X } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

interface CartProps {
  cart: CartItem[];
  customers: Customer[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onCustomerAdded: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, customers, onUpdateQuantity, onClearCart, onCustomerAdded }) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal; // Tax has been removed

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
        <h2 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">Current Order</h2>
        
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.price.toFixed(2)} DH</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                    className="w-16 text-center border rounded-md mx-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    min="0"
                    max={item.stock}
                  />
                  <button onClick={() => onUpdateQuantity(item.id, 0)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white">
            <span>Total</span>
            <span>{total.toFixed(2)} DH</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
            className="w-full mt-4 py-3 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            Checkout
          </button>
          <button 
            onClick={onClearCart}
            className="w-full mt-2 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear Cart
          </button>
        </div>
      </div>
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cart={cart}
          customers={customers}
          total={total}
          onSuccessfulCheckout={onClearCart}
          onCustomerAdded={onCustomerAdded}
        />
      )}
    </>
  );
};

export default Cart;