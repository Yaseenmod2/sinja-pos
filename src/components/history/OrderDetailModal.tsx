import React from 'react';
import { Order } from '../../types';
import { X } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const POINTS_TO_DH_RATE = 0.5; // 1 point = 0.5 DH discount

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Order Details (#{order.id.slice(-6)})
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <X />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm space-y-1">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity} x {item.name}</span>
                <span>{(item.price * item.quantity).toFixed(2)} DH</span>
              </div>
            ))}
            <hr className="my-2 border-gray-300 dark:border-gray-600" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{order.subtotal.toFixed(2)} DH</span>
            </div>
            {order.pointsRedeemed > 0 && (
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Points Discount</span>
                <span>-{(order.pointsRedeemed * POINTS_TO_DH_RATE).toFixed(2)} DH</span>
              </div>
            )}
            <hr className="my-2 border-gray-300 dark:border-gray-600" />
            <div className="flex justify-between font-bold text-base">
              <span>Total Paid</span>
              <span>{order.finalAmount.toFixed(2)} DH</span>
            </div>
            {order.pointsEarned > 0 && (
              <div className="flex justify-between mt-1 text-green-600 dark:text-green-400 font-semibold">
                <span>Points Earned</span>
                <span>+{order.pointsEarned}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
