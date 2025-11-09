import { Product, User, UserRole, Customer, Order, Category, CartItem } from '../types';

const SEED_DATA_KEY = 'pos_seeded';

const getInitialData = () => {
  const users: User[] = [
    { id: 'user-1', name: 'Admin', role: UserRole.ADMIN, accessCode: '111111' },
    { id: 'user-2', name: 'Jessica', role: UserRole.WORKER, accessCode: '222222' },
  ];

  const categories: Category[] = [
    { id: 'cat-1', name: 'Coffee', imageUrl: 'https://picsum.photos/id/431/400/400' },
    { id: 'cat-2', name: 'Tea', imageUrl: 'https://picsum.photos/id/42/400/400' },
    { id: 'cat-3', name: 'Pastries', imageUrl: 'https://picsum.photos/id/368/400/400' },
    { id: 'cat-4', name: 'Sandwiches', imageUrl: 'https://picsum.photos/id/1080/400/400' },
  ];

  const products: Product[] = [
    { id: 'prod-1', name: 'Espresso', description: 'Strong and bold coffee shot.', price: 10.00, stock: 100, categoryId: 'cat-1', imageUrl: 'https://picsum.photos/id/225/400/400' },
    { id: 'prod-2', name: 'Latte', description: 'Espresso with steamed milk.', price: 15.50, stock: 80, categoryId: 'cat-1', imageUrl: 'https://picsum.photos/id/305/400/400' },
    { id: 'prod-3', name: 'Croissant', description: 'Buttery and flaky pastry.', price: 8.75, stock: 50, categoryId: 'cat-3', imageUrl: 'https://picsum.photos/id/368/400/400' },
    { id: 'prod-4', name: 'Green Tea', description: 'Healthy and refreshing green tea.', price: 9.50, stock: 120, categoryId: 'cat-2', imageUrl: 'https://picsum.photos/id/42/400/400' },
    { id: 'prod-5', name: 'Turkey Club', description: 'Classic turkey club sandwich.', price: 25.50, stock: 30, categoryId: 'cat-4', imageUrl: 'https://picsum.photos/id/1080/400/400' },
     { id: 'prod-6', name: 'Cappuccino', description: 'Espresso, steamed milk, and foam.', price: 15.50, stock: 75, categoryId: 'cat-1', imageUrl: 'https://picsum.photos/id/326/400/400' },
    { id: 'prod-7', name: 'Muffin', description: 'Blueberry muffin.', price: 12.25, stock: 60, categoryId: 'cat-3', imageUrl: 'https://picsum.photos/id/1071/400/400' },
    { id: 'prod-8', name: 'Black Tea', description: 'Classic English breakfast tea.', price: 9.50, stock: 110, categoryId: 'cat-2', imageUrl: 'https://picsum.photos/id/24/400/400' },
  ];
  
  const customers: Customer[] = [
      {id: 'cust-1', name: 'John Doe', phone: '555-1234', loyaltyPoints: 150},
      {id: 'cust-2', name: 'Jane Smith', phone: '555-5678', loyaltyPoints: 75},
  ];

  return { users, categories, products, customers, orders: [] };
};

const withLocalStorage = <T,>(key: string, defaultValue: T): [() => T, (value: T) => void] => {
  const get = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const set = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [get, set];
};

const [getUsers, setUsers] = withLocalStorage<User[]>('pos_users', []);
const [getProducts, setProducts] = withLocalStorage<Product[]>('pos_products', []);
const [getCategories, setCategories] = withLocalStorage<Category[]>('pos_categories', []);
const [getCustomers, setCustomers] = withLocalStorage<Customer[]>('pos_customers', []);
const [getOrders, setOrders] = withLocalStorage<Order[]>('pos_orders', []);
const [getOfflineOrders, setOfflineOrders] = withLocalStorage<Order[]>('pos_offline_orders', []);

// Seed initial data if it doesn't exist
if (!localStorage.getItem(SEED_DATA_KEY)) {
  const initialData = getInitialData();
  setUsers(initialData.users);
  setProducts(initialData.products);
  setCategories(initialData.categories);
  setCustomers(initialData.customers);
  setOrders(initialData.orders);
  localStorage.setItem(SEED_DATA_KEY, 'true');
}

// --- API ---

// Users
export const fetchUsers = async (): Promise<User[]> => Promise.resolve(getUsers());
export const saveUsers = async (users: User[]): Promise<void> => Promise.resolve(setUsers(users));
export const loginUser = async (accessCode: string): Promise<User | null> => {
    const users = getUsers();
    const user = users.find(u => u.accessCode === accessCode);
    return Promise.resolve(user || null);
};


// Products
export const fetchProducts = async (): Promise<Product[]> => Promise.resolve(getProducts());
export const saveProducts = async (products: Product[]): Promise<void> => Promise.resolve(setProducts(products));

// Categories
export const fetchCategories = async (): Promise<Category[]> => Promise.resolve(getCategories());
export const saveCategories = async (categories: Category[]): Promise<void> => Promise.resolve(setCategories(categories));

// Customers
export const fetchCustomers = async (): Promise<Customer[]> => Promise.resolve(getCustomers());
export const saveCustomers = async (customers: Customer[]): Promise<void> => Promise.resolve(setCustomers(customers));
export const addCustomer = async (customer: Pick<Customer, 'name' | 'phone'>): Promise<Customer> => {
    const customers = getCustomers();
    const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: customer.name,
        phone: customer.phone,
        loyaltyPoints: 0
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    return Promise.resolve(newCustomer);
};


// Orders
export const fetchOrders = async (): Promise<Order[]> => Promise.resolve(getOrders());
export const createOrder = async (
    cart: CartItem[],
    subtotal: number,
    finalAmount: number,
    pointsRedeemed: number,
    user: User,
    isOnline: boolean,
    customerId?: string
): Promise<Order> => {
    // Stock update logic is the same for both online and offline
    const products = getProducts();
    cart.forEach(cartItem => {
        const productIndex = products.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
            products[productIndex].stock -= cartItem.quantity;
        }
    });
    setProducts(products);
    
    const pointsEarned = Math.floor(finalAmount * 0.3);

    const newOrder: Order = {
        id: `order-${Date.now()}`,
        items: cart,
        subtotal,
        pointsRedeemed,
        finalAmount,
        customerId,
        pointsEarned,
        date: new Date().toISOString(),
        servedBy: user.id
    };
    
    if (isOnline) {
        if (customerId) {
            const customers = getCustomers();
            const customerIndex = customers.findIndex(c => c.id === customerId);
            if (customerIndex !== -1) {
                // Deduct redeemed points and add earned points
                customers[customerIndex].loyaltyPoints -= pointsRedeemed;
                customers[customerIndex].loyaltyPoints += pointsEarned;
                setCustomers(customers);
            }
        }
        const orders = getOrders();
        setOrders([...orders, newOrder]);
    } else {
        const offlineOrders = getOfflineOrders();
        setOfflineOrders([...offlineOrders, newOrder]);
    }

    return Promise.resolve(newOrder);
};

export const syncOfflineOrders = async (): Promise<number> => {
    const offlineOrders = getOfflineOrders();
    if (offlineOrders.length === 0) {
        return Promise.resolve(0);
    }

    const allOrders = getOrders();
    const allCustomers = getCustomers();

    offlineOrders.forEach(order => {
        if (order.customerId) {
            const customerIndex = allCustomers.findIndex(c => c.id === order.customerId);
            if (customerIndex !== -1) {
                allCustomers[customerIndex].loyaltyPoints -= order.pointsRedeemed;
                allCustomers[customerIndex].loyaltyPoints += order.pointsEarned;
            }
        }
    });
    
    setCustomers(allCustomers);
    setOrders([...allOrders, ...offlineOrders]);
    setOfflineOrders([]);
    
    return Promise.resolve(offlineOrders.length);
};