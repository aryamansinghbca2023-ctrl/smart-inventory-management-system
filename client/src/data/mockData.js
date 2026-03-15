export const CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', color: '#6366f1', itemCount: 0 },
  { id: 'cat-2', name: 'Furniture', color: '#f59e0b', itemCount: 0 },
  { id: 'cat-3', name: 'Stationery', color: '#10b981', itemCount: 0 },
  { id: 'cat-4', name: 'Cleaning', color: '#ec4899', itemCount: 0 },
  { id: 'cat-5', name: 'Pantry', color: '#8b5cf6', itemCount: 0 },
];

export const USERS = [
  { id: 'u1', name: 'Arjun Sharma', email: 'admin@store.com', password: 'admin123', role: 'Admin', status: 'Active', lastLogin: '2026-03-14 09:15', avatar: 'AS' },
  { id: 'u2', name: 'Priya Mehta', email: 'admin2@store.com', password: 'admin123', role: 'Admin', status: 'Active', lastLogin: '2026-03-13 14:30', avatar: 'PM' },
  { id: 'u3', name: 'Rahul Verma', email: 'manager@store.com', password: 'manager123', role: 'Manager', status: 'Active', lastLogin: '2026-03-14 08:45', avatar: 'RV' },
  { id: 'u4', name: 'Sneha Patel', email: 'manager2@store.com', password: 'manager123', role: 'Manager', status: 'Inactive', lastLogin: '2026-02-28 11:00', avatar: 'SP' },
  { id: 'u5', name: 'Amit Rawat', email: 'employee@store.com', password: 'emp123', role: 'Employee', status: 'Active', lastLogin: '2026-03-14 10:20', avatar: 'AR' },
  { id: 'u6', name: 'Divya Singh', email: 'emp2@store.com', password: 'emp123', role: 'Employee', status: 'Active', lastLogin: '2026-03-12 16:50', avatar: 'DS' },
];

export const INVENTORY = [
  { id: 'p1',  sku: 'SKU-1001', name: 'Dell Monitor 24"',    category: 'Electronics', quantity: 25, price: 14500, supplier: 'Dell India',        description: 'Full HD IPS display' },
  { id: 'p2',  sku: 'SKU-1002', name: 'HP Wireless Keyboard', category: 'Electronics', quantity: 8,  price: 1850,  supplier: 'HP India',          description: 'Bluetooth keyboard' },
  { id: 'p3',  sku: 'SKU-1003', name: 'Logitech Mouse MX',   category: 'Electronics', quantity: 3,  price: 3200,  supplier: 'Logitech',          description: 'Ergonomic wireless mouse' },
  { id: 'p4',  sku: 'SKU-1004', name: 'USB-C Hub 7-in-1',    category: 'Electronics', quantity: 0,  price: 2400,  supplier: 'Anker India',       description: 'Multi-port adapter' },
  { id: 'p5',  sku: 'SKU-2001', name: 'Executive Office Chair', category: 'Furniture', quantity: 12, price: 18500, supplier: 'Featherlite',      description: 'Ergonomic mesh chair' },
  { id: 'p6',  sku: 'SKU-2002', name: 'Standing Desk 48"',   category: 'Furniture',    quantity: 5,  price: 24000, supplier: 'IKEA India',        description: 'Height adjustable' },
  { id: 'p7',  sku: 'SKU-2003', name: 'Filing Cabinet 3-Drawer', category: 'Furniture', quantity: 15, price: 7800, supplier: 'Godrej',           description: 'Metal filing cabinet' },
  { id: 'p8',  sku: 'SKU-2004', name: 'Bookshelf Wooden',    category: 'Furniture',    quantity: 9,  price: 6500,  supplier: 'Urban Ladder',      description: '5-tier wooden shelf' },
  { id: 'p9',  sku: 'SKU-3001', name: 'A4 Paper Ream 500',   category: 'Stationery',   quantity: 45, price: 350,   supplier: 'JK Paper',          description: '75 GSM copier paper' },
  { id: 'p10', sku: 'SKU-3002', name: 'Gel Pen Box (20)',     category: 'Stationery',   quantity: 30, price: 220,   supplier: 'Cello Pens',        description: 'Blue ink gel pens' },
  { id: 'p11', sku: 'SKU-3003', name: 'Whiteboard Marker Set', category: 'Stationery', quantity: 6,  price: 450,   supplier: 'Camlin',            description: '8-color marker pack' },
  { id: 'p12', sku: 'SKU-3004', name: 'Sticky Notes 3x3 Pack', category: 'Stationery', quantity: 0,  price: 180,   supplier: '3M India',          description: '12 pads neon colors' },
  { id: 'p13', sku: 'SKU-4001', name: 'Floor Cleaner 5L',    category: 'Cleaning',     quantity: 18, price: 420,   supplier: 'Hindustan Unilever',description: 'Pine fragrance liquid' },
  { id: 'p14', sku: 'SKU-4002', name: 'Hand Sanitizer 500ml', category: 'Cleaning',    quantity: 2,  price: 280,   supplier: 'Dettol',            description: 'Antibacterial gel' },
  { id: 'p15', sku: 'SKU-4003', name: 'Trash Bags Large 50pc', category: 'Cleaning',   quantity: 22, price: 350,   supplier: 'Greenleaf',         description: 'Biodegradable bags' },
  { id: 'p16', sku: 'SKU-4004', name: 'Glass Cleaner 750ml', category: 'Cleaning',     quantity: 7,  price: 190,   supplier: 'Colin',             description: 'Streak-free formula' },
  { id: 'p17', sku: 'SKU-5001', name: 'Premium Tea Box 100', category: 'Pantry',       quantity: 14, price: 550,   supplier: 'Tata Consumer',     description: 'Assam tea bags' },
  { id: 'p18', sku: 'SKU-5002', name: 'Instant Coffee 200g', category: 'Pantry',       quantity: 4,  price: 480,   supplier: 'Nescafé',           description: 'Classic instant' },
  { id: 'p19', sku: 'SKU-5003', name: 'Sugar 1kg Pack',      category: 'Pantry',       quantity: 20, price: 55,    supplier: 'Local Supplier',    description: 'Refined white sugar' },
  { id: 'p20', sku: 'SKU-5004', name: 'Paper Cups 100pc',    category: 'Pantry',       quantity: 0,  price: 160,   supplier: 'Green Cups',        description: 'Disposable 200ml cups' },
];

export const STOCK_REQUESTS = [
  { id: 'r1', itemId: 'p4',  itemName: 'USB-C Hub 7-in-1',     requestedBy: 'u5', requesterName: 'Amit Rawat',  qty: 10, reason: 'New joiners need docking stations',       date: '2026-03-14', status: 'Pending', note: '' },
  { id: 'r2', itemId: 'p12', itemName: 'Sticky Notes 3x3 Pack', requestedBy: 'u6', requesterName: 'Divya Singh', qty: 20, reason: 'Out of stock in supply room',              date: '2026-03-13', status: 'Pending', note: '' },
  { id: 'r3', itemId: 'p3',  itemName: 'Logitech Mouse MX',    requestedBy: 'u5', requesterName: 'Amit Rawat',  qty: 5,  reason: 'Team requests ergonomic mice',              date: '2026-03-12', status: 'Approved', note: 'Approved, order placed with vendor' },
  { id: 'r4', itemId: 'p14', itemName: 'Hand Sanitizer 500ml',  requestedBy: 'u3', requesterName: 'Rahul Verma', qty: 15, reason: 'Running low across all floors',             date: '2026-03-11', status: 'Approved', note: '' },
  { id: 'r5', itemId: 'p20', itemName: 'Paper Cups 100pc',     requestedBy: 'u6', requesterName: 'Divya Singh', qty: 50, reason: 'Pantry completely out of cups',              date: '2026-03-10', status: 'Pending', note: '' },
  { id: 'r6', itemId: 'p1',  itemName: 'Dell Monitor 24"',     requestedBy: 'u5', requesterName: 'Amit Rawat',  qty: 3,  reason: 'Dual monitor setup for design team',        date: '2026-03-09', status: 'Rejected', note: 'Budget not approved for Q1' },
  { id: 'r7', itemId: 'p9',  itemName: 'A4 Paper Ream 500',    requestedBy: 'u3', requesterName: 'Rahul Verma', qty: 30, reason: 'Quarterly print stock replenishment',       date: '2026-03-08', status: 'Approved', note: 'Approved' },
  { id: 'r8', itemId: 'p18', itemName: 'Instant Coffee 200g',   requestedBy: 'u6', requesterName: 'Divya Singh', qty: 8,  reason: 'Employee request for pantry restocking',    date: '2026-03-07', status: 'Rejected', note: 'Use existing stock first' },
];

export const AUDIT_LOG = [
  { id: 'log1',  timestamp: '2026-03-14 09:15:00', userId: 'u1', userName: 'Arjun Sharma',  role: 'Admin',    action: 'LOGIN',   details: 'User logged in',                         ip: '192.168.1.10' },
  { id: 'log2',  timestamp: '2026-03-14 09:20:32', userId: 'u1', userName: 'Arjun Sharma',  role: 'Admin',    action: 'CREATE',  details: 'Added item: USB-C Hub 7-in-1 (qty: 20)', ip: '192.168.1.10' },
  { id: 'log3',  timestamp: '2026-03-14 08:45:00', userId: 'u3', userName: 'Rahul Verma',   role: 'Manager',  action: 'LOGIN',   details: 'User logged in',                         ip: '192.168.1.22' },
  { id: 'log4',  timestamp: '2026-03-13 16:10:45', userId: 'u3', userName: 'Rahul Verma',   role: 'Manager',  action: 'UPDATE',  details: 'Updated qty: Dell Monitor 24" → 25',     ip: '192.168.1.22' },
  { id: 'log5',  timestamp: '2026-03-13 14:30:00', userId: 'u2', userName: 'Priya Mehta',   role: 'Admin',    action: 'LOGIN',   details: 'User logged in',                         ip: '192.168.1.15' },
  { id: 'log6',  timestamp: '2026-03-12 11:22:18', userId: 'u1', userName: 'Arjun Sharma',  role: 'Admin',    action: 'APPROVE', details: 'Approved request #R3: Logitech Mouse MX', ip: '192.168.1.10' },
  { id: 'log7',  timestamp: '2026-03-12 10:05:00', userId: 'u5', userName: 'Amit Rawat',    role: 'Employee', action: 'LOGIN',   details: 'User logged in',                         ip: '192.168.1.35' },
  { id: 'log8',  timestamp: '2026-03-11 15:40:33', userId: 'u3', userName: 'Rahul Verma',   role: 'Manager',  action: 'APPROVE', details: 'Approved request #R4: Hand Sanitizer',    ip: '192.168.1.22' },
  { id: 'log9',  timestamp: '2026-03-11 09:12:05', userId: 'u1', userName: 'Arjun Sharma',  role: 'Admin',    action: 'CREATE',  details: 'Added item: Standing Desk 48" (qty: 5)',  ip: '192.168.1.10' },
  { id: 'log10', timestamp: '2026-03-10 14:55:22', userId: 'u1', userName: 'Arjun Sharma',  role: 'Admin',    action: 'DELETE',  details: 'Deleted item: Old Printer Cartridge',     ip: '192.168.1.10' },
  { id: 'log11', timestamp: '2026-03-09 16:30:11', userId: 'u3', userName: 'Rahul Verma',   role: 'Manager',  action: 'REJECT',  details: 'Rejected request #R6: Dell Monitor 24"',  ip: '192.168.1.22' },
  { id: 'log12', timestamp: '2026-03-09 12:00:00', userId: 'u5', userName: 'Amit Rawat',    role: 'Employee', action: 'CREATE',  details: 'Raised request #R6: 3x Dell Monitor',    ip: '192.168.1.35' },
  { id: 'log13', timestamp: '2026-03-08 10:18:44', userId: 'u3', userName: 'Rahul Verma',   role: 'Manager',  action: 'APPROVE', details: 'Approved request #R7: A4 Paper Ream',     ip: '192.168.1.22' },
  { id: 'log14', timestamp: '2026-03-07 14:22:09', userId: 'u1', userName: 'Arjun Sharma',  role: 'Admin',    action: 'UPDATE',  details: 'Updated threshold settings → 10',         ip: '192.168.1.10' },
  { id: 'log15', timestamp: '2026-03-07 09:00:00', userId: 'u6', userName: 'Divya Singh',   role: 'Employee', action: 'LOGIN',   details: 'User logged in',                         ip: '192.168.1.40' },
];

export const CATEGORY_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];

let _counter = 100;
export const genId = (prefix = 'id') => `${prefix}-${++_counter}`;
export const genSKU = (prefix = 'SKU') => `${prefix}-${1000 + (++_counter)}`;
