const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const StockRequest = require('../models/StockRequest');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');

const seedDB = async () => {
  try {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ MongoDB Connected for seeding...');
    } catch {
      console.log('⚠️  Local MongoDB not available, using in-memory server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('✅ MongoDB In-Memory Connected for seeding...');
    }

    // Clear all collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await StockRequest.deleteMany({});
    await AuditLog.deleteMany({});
    await Settings.deleteMany({});
    console.log('🗑️  Cleared all collections');

    // ── SETTINGS ──
    await Settings.create({});
    console.log('⚙️  Settings seeded');

    // ── USERS ──
    const users = await User.create([
      { name: 'Aryaman Singh',  email: 'admin@store.com',    password: 'admin123',   role: 'admin',    status: 'active', lastLogin: daysAgo(0) },
      { name: 'Priya Mehta',   email: 'admin2@store.com',   password: 'admin123',   role: 'admin',    status: 'active', lastLogin: daysAgo(1) },
      { name: 'Rahul Verma',   email: 'manager@store.com',  password: 'manager123', role: 'manager',  status: 'active', lastLogin: daysAgo(0) },
      { name: 'Sneha Patel',   email: 'manager2@store.com', password: 'manager123', role: 'manager',  status: 'inactive', lastLogin: daysAgo(14) },
      { name: 'Amit Rawat',    email: 'employee@store.com', password: 'emp123',     role: 'employee', status: 'active', lastLogin: daysAgo(0) },
      { name: 'Divya Singh',   email: 'emp2@store.com',     password: 'emp123',     role: 'employee', status: 'active', lastLogin: daysAgo(2) },
    ]);
    console.log(`👤 ${users.length} Users seeded`);

    const [admin1, admin2, manager1, manager2, emp1, emp2] = users;

    // ── CATEGORIES ──
    const categories = await Category.create([
      { name: 'Electronics', color: '#3b82f6' },
      { name: 'Furniture',   color: '#f59e0b' },
      { name: 'Stationery',  color: '#8b5cf6' },
      { name: 'Cleaning',    color: '#10b981' },
      { name: 'Pantry',      color: '#ef4444' },
    ]);
    console.log(`📁 ${categories.length} Categories seeded`);

    const [electronics, furniture, stationery, cleaning, pantry] = categories;

    // ── PRODUCTS (20 items) ──
    const products = await Product.create([
      // Electronics (5)
      { name: 'HP Laptop 15s',          sku: 'SKU-1001', category: electronics._id, quantity: 15, unitPrice: 42000, supplier: 'HP India',           description: 'Intel i5, 8GB RAM, 512GB SSD' },
      { name: 'Samsung Monitor 24"',    sku: 'SKU-1002', category: electronics._id, quantity: 25, unitPrice: 14500, supplier: 'Samsung India',       description: 'Full HD IPS display' },
      { name: 'Zebronics Keyboard',     sku: 'SKU-1003', category: electronics._id, quantity: 8,  unitPrice: 850,   supplier: 'Zebronics',           description: 'USB wired keyboard' },
      { name: 'Wireless Mouse Logitech', sku: 'SKU-1004', category: electronics._id, quantity: 3, unitPrice: 1200,  supplier: 'Logitech India',      description: 'Ergonomic wireless mouse' },
      { name: 'USB Hub 7-Port',         sku: 'SKU-1005', category: electronics._id, quantity: 0,  unitPrice: 2400,  supplier: 'Anker India',         description: 'USB-C multi-port adapter' },
      // Furniture (4)
      { name: 'Godrej Office Chair',    sku: 'SKU-2001', category: furniture._id,   quantity: 12, unitPrice: 18500, supplier: 'Godrej Interio',      description: 'Ergonomic mesh chair' },
      { name: 'Wooden Study Table',     sku: 'SKU-2002', category: furniture._id,   quantity: 10, unitPrice: 8500,  supplier: 'Urban Ladder',        description: '48" wooden desk' },
      { name: 'Steel Almirah',          sku: 'SKU-2003', category: furniture._id,   quantity: 5,  unitPrice: 12000, supplier: 'Godrej',              description: '3-door steel almirah' },
      { name: 'Visitor Chair Set',      sku: 'SKU-2004', category: furniture._id,   quantity: 20, unitPrice: 4500,  supplier: 'Featherlite',         description: 'Set of 4 visitor chairs' },
      // Stationery (4)
      { name: 'Classmate Notebooks (10)', sku: 'SKU-3001', category: stationery._id, quantity: 50, unitPrice: 300, supplier: 'ITC',                  description: 'Pack of 10 notebooks, 200 pages each' },
      { name: 'Cello Ballpen Box',       sku: 'SKU-3002', category: stationery._id, quantity: 10, unitPrice: 220, supplier: 'Cello Pens',            description: 'Box of 20 blue ballpoint pens' },
      { name: 'Sticky Notes Pack',       sku: 'SKU-3003', category: stationery._id, quantity: 0,  unitPrice: 180, supplier: '3M India',              description: '12 pads, neon colors' },
      { name: 'Whiteboard Markers',      sku: 'SKU-3004', category: stationery._id, quantity: 6,  unitPrice: 450, supplier: 'Camlin',                description: '8-color marker set' },
      // Cleaning (4)
      { name: 'Colin Glass Cleaner 750ml', sku: 'SKU-4001', category: cleaning._id, quantity: 18, unitPrice: 190, supplier: 'Reckitt',              description: 'Streak-free formula' },
      { name: 'Lizol Floor Cleaner 5L',    sku: 'SKU-4002', category: cleaning._id, quantity: 10, unitPrice: 420, supplier: 'Reckitt',              description: 'Pine fragrance' },
      { name: 'Scotch-Brite Scrub Pack',   sku: 'SKU-4003', category: cleaning._id, quantity: 30, unitPrice: 120, supplier: '3M India',             description: 'Pack of 6 scrub pads' },
      { name: 'Tissue Paper Box 100s',     sku: 'SKU-4004', category: cleaning._id, quantity: 2,  unitPrice: 150, supplier: 'Local Supplier',       description: 'Soft tissue box' },
      // Pantry (3)
      { name: 'Tata Tea Premium 1kg',   sku: 'SKU-5001', category: pantry._id,     quantity: 14, unitPrice: 550,  supplier: 'Tata Consumer',        description: 'Premium Assam tea' },
      { name: 'Nescafe Classic 200g',    sku: 'SKU-5002', category: pantry._id,     quantity: 4,  unitPrice: 480,  supplier: 'Nestle India',         description: 'Instant coffee jar' },
      { name: 'Paper Cups 100pk',        sku: 'SKU-5003', category: pantry._id,     quantity: 0,  unitPrice: 160,  supplier: 'Green Cups',           description: 'Disposable 200ml cups' },
    ]);
    console.log(`📦 ${products.length} Products seeded`);

    // ── STOCK REQUESTS (8) ──
    const requests = await StockRequest.create([
      // 3 Pending
      { product: products[4]._id,  requestedBy: emp1._id,     quantity: 10, reason: 'New joiners need USB hubs',                status: 'pending' },
      { product: products[11]._id, requestedBy: emp2._id,     quantity: 20, reason: 'Out of stock in supply room',              status: 'pending' },
      { product: products[19]._id, requestedBy: manager1._id, quantity: 50, reason: 'Pantry completely out of cups',             status: 'pending' },
      // 3 Approved
      { product: products[3]._id,  requestedBy: emp1._id,     quantity: 5,  reason: 'Team requests ergonomic mice',             status: 'approved', reviewedBy: admin1._id, reviewNote: 'Approved, order placed with vendor',   reviewedAt: daysAgo(2) },
      { product: products[16]._id, requestedBy: manager1._id, quantity: 15, reason: 'Running low across all floors',            status: 'approved', reviewedBy: admin1._id, reviewNote: 'Approved',                              reviewedAt: daysAgo(3) },
      { product: products[9]._id,  requestedBy: manager1._id, quantity: 30, reason: 'Quarterly print stock replenishment',      status: 'approved', reviewedBy: admin1._id, reviewNote: 'Approved — regular restock',             reviewedAt: daysAgo(6) },
      // 2 Rejected
      { product: products[0]._id,  requestedBy: emp1._id,     quantity: 3,  reason: 'Dual laptop setup for design team',        status: 'rejected', reviewedBy: manager1._id, reviewNote: 'Budget not approved for Q1',          reviewedAt: daysAgo(5) },
      { product: products[18]._id, requestedBy: emp2._id,     quantity: 8,  reason: 'Employee request for pantry restocking',   status: 'rejected', reviewedBy: admin1._id,   reviewNote: 'Use existing stock first',             reviewedAt: daysAgo(7) },
    ]);
    console.log(`🔄 ${requests.length} Stock Requests seeded`);

    // ── AUDIT LOGS (15) ──
    const logs = await AuditLog.create([
      { user: admin1._id, userName: 'Aryaman Singh', userRole: 'admin',    action: 'LOGIN',   module: 'Auth',    details: 'User logged in',                           ip: '192.168.1.10', createdAt: daysAgo(0) },
      { user: admin1._id, userName: 'Aryaman Singh', userRole: 'admin',    action: 'CREATE',  module: 'Product', details: 'Added product: USB Hub 7-Port (qty: 20)',   ip: '192.168.1.10', createdAt: daysAgo(0) },
      { user: manager1._id, userName: 'Rahul Verma', userRole: 'manager', action: 'LOGIN',   module: 'Auth',    details: 'User logged in',                           ip: '192.168.1.22', createdAt: daysAgo(0) },
      { user: manager1._id, userName: 'Rahul Verma', userRole: 'manager', action: 'UPDATE',  module: 'Product', details: 'Updated qty: Samsung Monitor 24" → 25',     ip: '192.168.1.22', createdAt: daysAgo(1) },
      { user: admin2._id, userName: 'Priya Mehta',  userRole: 'admin',    action: 'LOGIN',   module: 'Auth',    details: 'User logged in',                           ip: '192.168.1.15', createdAt: daysAgo(1) },
      { user: admin1._id, userName: 'Aryaman Singh', userRole: 'admin',    action: 'APPROVE', module: 'Request', details: 'Approved request: Wireless Mouse Logitech', ip: '192.168.1.10', createdAt: daysAgo(2) },
      { user: emp1._id, userName: 'Amit Rawat',     userRole: 'employee', action: 'LOGIN',   module: 'Auth',    details: 'User logged in',                           ip: '192.168.1.35', createdAt: daysAgo(2) },
      { user: manager1._id, userName: 'Rahul Verma', userRole: 'manager', action: 'APPROVE', module: 'Request', details: 'Approved request: Tissue Paper Box',        ip: '192.168.1.22', createdAt: daysAgo(3) },
      { user: admin1._id, userName: 'Aryaman Singh', userRole: 'admin',    action: 'CREATE',  module: 'Product', details: 'Added product: Standing Desk (qty: 5)',     ip: '192.168.1.10', createdAt: daysAgo(3) },
      { user: admin1._id, userName: 'Aryaman Singh', userRole: 'admin',    action: 'DELETE',  module: 'Product', details: 'Deleted product: Old Printer Cartridge',     ip: '192.168.1.10', createdAt: daysAgo(4) },
      { user: manager1._id, userName: 'Rahul Verma', userRole: 'manager', action: 'REJECT',  module: 'Request', details: 'Rejected request: HP Laptop 15s',           ip: '192.168.1.22', createdAt: daysAgo(5) },
      { user: emp1._id, userName: 'Amit Rawat',     userRole: 'employee', action: 'CREATE',  module: 'Request', details: 'Raised request: 3x HP Laptop 15s',          ip: '192.168.1.35', createdAt: daysAgo(5) },
      { user: admin1._id, userName: 'Aryaman Singh', userRole: 'admin',    action: 'APPROVE', module: 'Request', details: 'Approved request: A4 Paper Reams',          ip: '192.168.1.10', createdAt: daysAgo(6) },
      { user: admin1._id, userName: 'Aryaman Singh', userRole: 'admin',    action: 'UPDATE',  module: 'Settings', details: 'Updated threshold settings → 10',          ip: '192.168.1.10', createdAt: daysAgo(7) },
      { user: emp2._id, userName: 'Divya Singh',    userRole: 'employee', action: 'LOGIN',   module: 'Auth',    details: 'User logged in',                           ip: '192.168.1.40', createdAt: daysAgo(7) },
    ]);
    console.log(`🕵️  ${logs.length} Audit Logs seeded`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  Admin:    admin@store.com    / admin123 ║');
    console.log('║  Manager:  manager@store.com  / manager123 ║');
    console.log('║  Employee: employee@store.com / emp123   ║');
    console.log('╚══════════════════════════════════════════╝');

    if (require.main === module) process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    if (require.main === module) process.exit(1);
    throw error;
  }
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

if (require.main === module) {
  seedDB();
} else {
  module.exports = seedDB;
}
