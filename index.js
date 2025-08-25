import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://sunflowerpgs77:sunflower@pg.wctacc3.mongodb.net/sunflower_pg?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully');
})
.catch((error) => {
  console.error('❌ MongoDB Atlas connection error:', error);
});

// Define schemas directly in the server file to avoid import issues
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  wing: { type: String, enum: ['A', 'B'], required: true },
  type: { type: String, enum: ['single', 'double', 'triple'], required: true },
  rent: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  amenities: [{ type: String }],
  description: { type: String },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }
}, { timestamps: true });

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  rent: { type: Number, required: true },
  deposit: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinDate: { type: Date, required: true },
  address: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String }
  },
  idProof: {
    type: { type: String, enum: ['aadhar', 'passport', 'pancard', 'other'], default: 'aadhar' },
    number: { type: String },
    image: { type: String } // store URL or base64 data URL
  },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true }
  },
  wing: { type: String, required: true },
  floor: { type: Number, required: true }
}, { timestamps: true });

const rentPaymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  monthName: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'partial'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'cheque'] },
  transactionId: { type: String },
  lateFee: { type: Number, default: 0 },
  wing: { type: String, required: true }
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank_transfer'], required: true },
  vendor: { type: String, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  wing: { type: String, required: true }
}, { timestamps: true });

// Contact Messages
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const settingsSchema = new mongoose.Schema({
  pgName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  gstNumber: { type: String, required: true },
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true }
  },
  rentDueDate: { type: Number, required: true, default: 5 },
  lateFeePercentage: { type: Number, required: true, default: 5 },
  maintenanceFee: { type: Number, required: true, default: 0 },
  amenities: [{ type: String }],
  policies: [{ type: String }],
  theme: {
    primaryColor: { type: String, default: '#fbbf24' },
    secondaryColor: { type: String, default: '#92400e' }
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Tenant = mongoose.model('Tenant', tenantSchema);
const RentPayment = mongoose.model('RentPayment', rentPaymentSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Rooms API
app.get('/api/rooms', async (req, res) => {
  try {
    // Populate all tenant fields for tenantId
    const rooms = await Room.find().populate('tenantId');
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tenants API
app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find().populate('roomId', 'roomNumber floor wing');
    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/tenants', async (req, res) => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();
    // Update the room's tenantId field
    await Room.findByIdAndUpdate(tenant.roomId, { tenantId: tenant._id, status: 'occupied' });
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/tenants/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/tenants/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }
    res.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper to consistently compute status
function calculatePaymentStatus(amount, paidAmount, dueDate) {
  const total = Number(amount) || 0;
  const paid = Number(paidAmount) || 0;
  if (paid > 0 && paid >= total) return 'paid';
  if (paid > 0 && paid < total) return 'partial';
  const now = new Date();
  return now > new Date(dueDate) ? 'overdue' : 'pending';
}

// Rent Payments API
app.get('/api/rent-payments', async (req, res) => {
  try {
    const { status, wing, month, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (wing && wing !== 'all') {
      query.wing = wing;
    }
    if (month) {
      query.month = month;
    }
    if (search) {
      // search by tenant name or email
      const tenants = await Tenant.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const tenantIds = tenants.map(t => t._id);
      if (tenantIds.length > 0) {
        query.tenantId = { $in: tenantIds };
      } else {
        // If no tenants match, force empty result
        query.tenantId = null;
      }
    }

    const payments = await RentPayment.find(query)
      .populate('tenantId')
      .populate('roomId', 'roomNumber floor wing');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/rent-payments', async (req, res) => {
  try {
    // Derive paidAmount and status
    const paidAmount = typeof req.body.paidAmount === 'number' ? req.body.paidAmount : 0;
    // If dueDate not provided but month is, assume 5th as due date
    const dueDate = req.body.dueDate
      ? new Date(req.body.dueDate)
      : (req.body.month ? new Date(`${req.body.month}-05`) : undefined);

    const status = calculatePaymentStatus(req.body.amount, paidAmount, dueDate || new Date());

    const payment = new RentPayment({
      ...req.body,
      paidAmount,
      dueDate: dueDate || req.body.dueDate,
      status,
    });
    await payment.save();
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/rent-payments/:id', async (req, res) => {
  try {
    const existing = await RentPayment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rent payment not found' });
    }

    const amount = typeof req.body.amount === 'number' ? req.body.amount : existing.amount;
    const paidAmount = typeof req.body.paidAmount === 'number' ? req.body.paidAmount : (existing.paidAmount || 0);
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : existing.dueDate;
    const status = calculatePaymentStatus(amount, paidAmount, dueDate);

    const update = {
      ...req.body,
      amount,
      paidAmount,
      dueDate,
      status,
    };

    const payment = await RentPayment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Rent payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rent payments stats
app.get('/api/rent-payments/stats', async (req, res) => {
  try {
    const { month } = req.query;
    const match = {};
    if (month) {
      match.month = month;
    }

    const [totalAmountAgg, collectedAmountAgg, pendingAmountAgg, overdueAmountAgg] = await Promise.all([
      RentPayment.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      RentPayment.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
      RentPayment.aggregate([
        { $match: { ...match, status: { $in: ['pending', 'partial'] } } },
        { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$paidAmount'] } } } },
      ]),
      RentPayment.aggregate([
        { $match: { ...match, status: 'overdue' } },
        { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$paidAmount'] } } } },
      ]),
    ]);

    const totalAmount = totalAmountAgg[0]?.total || 0;
    const collectedAmount = collectedAmountAgg[0]?.total || 0;
    const pendingAmount = pendingAmountAgg[0]?.total || 0;
    const overdueAmount = overdueAmountAgg[0]?.total || 0;

    const counts = await Promise.all([
      RentPayment.countDocuments(match),
      RentPayment.countDocuments({ ...match, status: 'paid' }),
      RentPayment.countDocuments({ ...match, status: 'pending' }),
      RentPayment.countDocuments({ ...match, status: 'partial' }),
      RentPayment.countDocuments({ ...match, status: 'overdue' }),
    ]);

    res.json({
      success: true,
      data: {
        total: counts[0],
        paid: counts[1],
        pending: counts[2],
        partial: counts[3],
        overdue: counts[4],
        totalAmount,
        collectedAmount,
        pendingAmount,
        overdueAmount,
        collectionRate: totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate monthly payments for all active tenants for provided YYYY-MM
app.post('/api/rent-payments/generate', async (req, res) => {
  try {
    const { month } = req.body; // format YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, error: 'month is required in YYYY-MM format' });
    }
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const dueDate = new Date(year, monthIndex, 5);

    const tenants = await Tenant.find({ status: 'active' }).populate('roomId', 'wing');
    let created = 0;
    for (const tenant of tenants) {
      const exists = await RentPayment.findOne({ tenantId: tenant._id, month });
      if (exists) continue;
      await RentPayment.create({
        tenantId: tenant._id,
        roomId: tenant.roomId,
        month,
        year,
        monthName: dueDate.toLocaleString('default', { month: 'long' }),
        amount: tenant.rent,
        paidAmount: 0,
        dueDate,
        paidDate: null,
        status: calculatePaymentStatus(tenant.rent, 0, dueDate),
        paymentMethod: undefined,
        transactionId: undefined,
        lateFee: 0,
        wing: tenant.wing || (tenant.roomId && tenant.roomId.wing) || 'A',
      });
      created += 1;
    }
    res.json({ success: true, data: { created } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete('/api/rent-payments/:id', async (req, res) => {
  try {
    const payment = await RentPayment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Rent payment not found' });
    }
    res.json({ success: true, message: 'Rent payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expenses API
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Contacts API
app.get('/api/contacts', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const msg = await ContactMessage.create(req.body);
    res.json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/contacts/:id/read', async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Settings API
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        pgName: 'Sunflower PG',
        address: '123 Main Street, Bangalore, Karnataka 560001',
        contactNumber: '+91 9876543210',
        email: 'info@sunflowerpg.com',
        gstNumber: '29ABCDE1234F1Z5',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          accountHolderName: 'Sunflower PG'
        },
        rentDueDate: 5,
        lateFeePercentage: 5,
        maintenanceFee: 0,
        amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'Security', 'Parking'],
        policies: ['No smoking', 'No pets', 'Quiet hours after 10 PM'],
        theme: {
          primaryColor: '#fbbf24',
          secondaryColor: '#92400e'
        },
        notifications: {
          email: true,
          sms: false,
          push: false
        }
      });
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize database with sample data
app.post('/api/init-database', async (req, res) => {
  try {
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    const existingRooms = await Room.countDocuments();
    const existingTenants = await Tenant.countDocuments();

    if (existingUsers > 0 || existingRooms > 0 || existingTenants > 0) {
      return res.json({ success: true, message: 'Database already has data' });
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@sunflowerpg.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    // Create rooms
    const rooms = await Room.insertMany([
      {
        roomNumber: '101',
        floor: 1,
        wing: 'A',
        type: 'single',
        rent: 8000,
        status: 'occupied',
        amenities: ['AC', 'Wi-Fi', 'Food'],
        description: 'Single occupancy room with attached bathroom'
      },
      {
        roomNumber: '102',
        floor: 1,
        wing: 'A',
        type: 'double',
        rent: 12000,
        status: 'occupied',
        amenities: ['AC', 'Wi-Fi', 'Food'],
        description: 'Double occupancy room with attached bathroom'
      },
      {
        roomNumber: '201',
        floor: 2,
        wing: 'A',
        type: 'single',
        rent: 8500,
        status: 'available',
        amenities: ['AC', 'Wi-Fi', 'Food'],
        description: 'Single occupancy room with attached bathroom'
      },
      {
        roomNumber: '202',
        floor: 2,
        wing: 'A',
        type: 'triple',
        rent: 15000,
        status: 'occupied',
        amenities: ['AC', 'Wi-Fi', 'Food'],
        description: 'Triple occupancy room with attached bathroom'
      },
      {
        roomNumber: '101',
        floor: 1,
        wing: 'B',
        type: 'single',
        rent: 7500,
        status: 'available',
        amenities: ['AC', 'Wi-Fi'],
        description: 'Single occupancy room with attached bathroom'
      },
      {
        roomNumber: '102',
        floor: 1,
        wing: 'B',
        type: 'double',
        rent: 11000,
        status: 'occupied',
        amenities: ['AC', 'Wi-Fi'],
        description: 'Double occupancy room with attached bathroom'
      }
    ]);

    // Create tenants
    const tenants = await Tenant.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+91 9876543210',
        roomId: rooms[0]._id,
        rent: 8000,
        deposit: 16000,
        status: 'active',
        joinDate: new Date('2024-01-15'),
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+91 9876543211',
          relation: 'Father'
        },
        wing: 'A',
        floor: 1
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+91 9876543212',
        roomId: rooms[1]._id,
        rent: 12000,
        deposit: 24000,
        status: 'active',
        joinDate: new Date('2024-02-01'),
        emergencyContact: {
          name: 'Mike Wilson',
          phone: '+91 9876543213',
          relation: 'Brother'
        },
        wing: 'A',
        floor: 1
      },
      {
        name: 'Alice Smith',
        email: 'alice.smith@email.com',
        phone: '+91 9876543214',
        roomId: rooms[3]._id,
        rent: 15000,
        deposit: 30000,
        status: 'active',
        joinDate: new Date('2024-01-20'),
        emergencyContact: {
          name: 'Bob Smith',
          phone: '+91 9876543215',
          relation: 'Father'
        },
        wing: 'A',
        floor: 2
      },
      {
        name: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+91 9876543216',
        roomId: rooms[5]._id,
        rent: 11000,
        deposit: 22000,
        status: 'active',
        joinDate: new Date('2024-03-01'),
        emergencyContact: {
          name: 'Emma Brown',
          phone: '+91 9876543217',
          relation: 'Mother'
        },
        wing: 'B',
        floor: 1
      }
    ]);

    // Update room status for occupied rooms
    await Room.findByIdAndUpdate(rooms[0]._id, { 
      status: 'occupied', 
      tenantId: tenants[0]._id 
    });
    await Room.findByIdAndUpdate(rooms[1]._id, { 
      status: 'occupied', 
      tenantId: tenants[1]._id 
    });
    await Room.findByIdAndUpdate(rooms[3]._id, { 
      status: 'occupied', 
      tenantId: tenants[2]._id 
    });
    await Room.findByIdAndUpdate(rooms[5]._id, { 
      status: 'occupied', 
      tenantId: tenants[3]._id 
    });

    // Create rent payments
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();
    const monthName = new Date().toLocaleString('default', { month: 'long' });

    await RentPayment.insertMany([
      {
        tenantId: tenants[0]._id,
        roomId: rooms[0]._id,
        month: currentMonth,
        year: currentYear,
        monthName,
        amount: 8000,
        dueDate: new Date(currentYear, new Date().getMonth(), 5),
        paidDate: new Date(currentYear, new Date().getMonth(), 3),
        status: 'paid',
        paymentMethod: 'upi',
        transactionId: 'UPI123456789',
        wing: 'A'
      },
      {
        tenantId: tenants[1]._id,
        roomId: rooms[1]._id,
        month: currentMonth,
        year: currentYear,
        monthName,
        amount: 12000,
        dueDate: new Date(currentYear, new Date().getMonth(), 5),
        status: 'pending',
        wing: 'A'
      },
      {
        tenantId: tenants[2]._id,
        roomId: rooms[3]._id,
        month: currentMonth,
        year: currentYear,
        monthName,
        amount: 15000,
        dueDate: new Date(currentYear, new Date().getMonth(), 5),
        status: 'overdue',
        lateFee: 750,
        wing: 'A'
      },
      {
        tenantId: tenants[3]._id,
        roomId: rooms[5]._id,
        month: currentMonth,
        year: currentYear,
        monthName,
        amount: 11000,
        dueDate: new Date(currentYear, new Date().getMonth(), 5),
        status: 'pending',
        wing: 'B'
      }
    ]);

    // Create expenses
    await Expense.insertMany([
      {
        category: 'provisions',
        subcategory: 'groceries',
        description: 'Monthly grocery supplies',
        amount: 25000,
        date: new Date(),
        paymentMethod: 'cash',
        vendor: 'Local Grocery Store',
        status: 'paid',
        wing: 'common'
      },
      {
        category: 'maintenance',
        subcategory: 'plumbing',
        description: 'Water pump repair',
        amount: 5000,
        date: new Date(),
        paymentMethod: 'bank_transfer',
        vendor: 'ABC Plumbing Services',
        status: 'paid',
        wing: 'A'
      },
      {
        category: 'utilities',
        subcategory: 'electricity',
        description: 'Monthly electricity bill',
        amount: 15000,
        date: new Date(),
        paymentMethod: 'upi',
        vendor: 'State Electricity Board',
        status: 'paid',
        wing: 'common'
      },
      {
        category: 'cleaning',
        subcategory: 'supplies',
        description: 'Cleaning supplies and equipment',
        amount: 3000,
        date: new Date(),
        paymentMethod: 'cash',
        vendor: 'CleanPro Supplies',
        status: 'paid',
        wing: 'common'
      }
    ]);

    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 