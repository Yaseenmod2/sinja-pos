import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createOrder, addCustomer as apiAddCustomer } from '../../services/dataService';
import { CartItem, Customer, Order } from '../../types';
import { X, CheckCircle, Star, Search, UserPlus } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  customers: Customer[];
  total: number; // This is the subtotal
  onSuccessfulCheckout: () => void;
  onCustomerAdded: () => void;
}

const POINTS_TO_DH_RATE = 0.5; // 1 point = 0.5 DH discount

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, customers, total, onSuccessfulCheckout, onCustomerAdded }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  
  const [isAddCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');


  const customer = useMemo(() => customers.find(c => c.id === selectedCustomer), [customers, selectedCustomer]);
  
  const maxRedeemablePoints = useMemo(() => {
    if (!customer) return 0;
    const maxForOrder = Math.floor(total / POINTS_TO_DH_RATE);
    return Math.min(customer.loyaltyPoints, maxForOrder);
  }, [customer, total]);

  const discount = pointsToRedeem * POINTS_TO_DH_RATE;
  const finalTotal = total - discount;
  const pointsToBeEarned = Math.floor(finalTotal * 0.3);
  
  const handlePointsChange = (value: string) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) numValue = 0;
    if (numValue > maxRedeemablePoints) numValue = maxRedeemablePoints;
    setPointsToRedeem(numValue);
  };
  
  const handleCheckout = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const order = await createOrder(cart, total, finalTotal, pointsToRedeem, user, selectedCustomer || undefined);
      setCompletedOrder(order);
      onSuccessfulCheckout();
    } catch (error) {
      console.error("Failed to create order", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setSelectedCustomer('');
    setPointsToRedeem(0);
    setCustomerSearch('');
    setAddCustomerOpen(false);
    onClose();
  }
  
  const handleAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
    const newCustomer = await apiAddCustomer({ name: newCustomerName, phone: newCustomerPhone });
    onCustomerAdded();
    setSelectedCustomer(newCustomer.id);
    setAddCustomerOpen(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (completedOrder) {
      return (
        <div className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Thank You!</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Order #{completedOrder.id.slice(-6)} processed successfully.</p>
          <div className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm space-y-1">
              {completedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                      <span>{item.quantity} x {item.name}</span>
                      <span>{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
              ))}
              <hr className="my-1 border-gray-300 dark:border-gray-600" />
               <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{completedOrder.subtotal.toFixed(2)} DH</span>
              </div>
              {completedOrder.pointsRedeemed > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>Points Discount</span>
                      <span>-{(completedOrder.pointsRedeemed * POINTS_TO_DH_RATE).toFixed(2)} DH</span>
                  </div>
              )}
              <hr className="my-1 border-gray-300 dark:border-gray-600" />
               <div className="flex justify-between font-bold">
                  <span>Total Paid</span>
                  <span>{completedOrder.finalAmount.toFixed(2)} DH</span>
              </div>
              {completedOrder.pointsEarned > 0 && (
                  <div className="flex justify-between mt-1 text-green-600 dark:text-green-400 font-semibold">
                      <span>Points Earned</span>
                      <span>+{completedOrder.pointsEarned}</span>
                  </div>
              )}
          </div>
          <button onClick={handleClose} className="w-full mt-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            New Order
          </button>
        </div>
      );
    }

    if (isAddCustomerOpen) {
      return (
        <div className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Customer</h3>
            <input 
                type="text" 
                placeholder="Customer Name" 
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            />
            <input 
                type="text" 
                placeholder="Phone Number" 
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => setAddCustomerOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                <button onClick={handleAddCustomer} className="px-4 py-2 bg-primary-600 text-white rounded-md">Save Customer</button>
            </div>
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <div className="mb-4">
          <label htmlFor="customer-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assign to Customer
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="customer-search"
                placeholder="Search by name or phone..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button onClick={() => setAddCustomerOpen(true)} className="flex items-center bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-500">
                <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
        <select
          id="customer"
          value={selectedCustomer}
          onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setPointsToRedeem(0); // Reset points when customer changes
          }}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700"
        >
          <option value="">None (Guest)</option>
          {filteredCustomers.map(c => (
            <option key={c.id} value={c.id}>{c.name} - {c.phone} ({c.loyaltyPoints} pts)</option>
          ))}
        </select>
        
         {customer && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-gray-700/50 rounded-md">
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Use Loyalty Points ({customer.loyaltyPoints} available)
            </label>
            <div className="flex items-center space-x-4 mt-2">
                <input type="range" min="0" max={maxRedeemablePoints} value={pointsToRedeem} onChange={(e) => handlePointsChange(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"/>
                <input type="number" id="points" value={pointsToRedeem} onChange={(e) => handlePointsChange(e.target.value)} className="w-24 p-2 text-center border rounded-md bg-white dark:bg-gray-600 dark:border-gray-500"/>
            </div>
          </div>
        )}
        <div className="space-y-2 py-4 my-4 border-t border-b border-dashed dark:border-gray-600">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>{total.toFixed(2)} DH</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-red-500 dark:text-red-400">
                    <span>Points Discount</span>
                    <span>-{discount.toFixed(2)} DH</span>
                </div>
            )}
            {pointsToBeEarned > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Points to be Earned</span>
                    <span>+{pointsToBeEarned}</span>
                </div>
            )}
            <div className="flex justify-between text-2xl font-extrabold text-gray-900 dark:text-white pt-2">
                <span>Amount Due</span>
                <span>{finalTotal.toFixed(2)} DH</span>
            </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : `Confirm Payment (${finalTotal.toFixed(2)} DH)`}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {completedOrder ? 'Order Confirmed' : isAddCustomerOpen ? 'Add Customer' : 'Checkout'}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <X />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CheckoutModal;