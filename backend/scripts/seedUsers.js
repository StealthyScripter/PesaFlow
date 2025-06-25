require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/users.models');
const Account = require('../models/accounts.models');
const Transaction = require('../models/transactions.models');

const seedUsers = [
  {
    memberNumber: 'ADMIN001',
    fname: 'System',
    lname: 'Administrator',
    email: 'admin@pesaflow.com',
    phoneNumber: '+254700000000',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    memberNumber: 'MEM001',
    fname: 'John',
    lname: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+254701000001',
    password: 'password123',
    role: 'admin', // Secondary admin for testing
    isActive: true,
    emergencyContacts: [
      {
        name: 'Jane Doe',
        relationship: 'Wife',
        phoneNumber: '+254701000002',
        email: 'jane.doe@example.com'
      }
    ]
  },
  {
    memberNumber: 'MEM002',
    fname: 'Jane',
    lname: 'Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+254701000003',
    password: 'password123',
    role: 'user',
    isActive: true,
    emergencyContacts: [
      {
        name: 'Robert Smith',
        relationship: 'Husband',
        phoneNumber: '+254701000004'
      }
    ]
  },
  {
    memberNumber: 'MEM003',
    fname: 'Bob',
    lname: 'Johnson',
    email: 'bob.johnson@example.com',
    phoneNumber: '+254701000005',
    password: 'password123',
    role: 'user',
    isActive: true
  },
  {
    memberNumber: 'MEM004',
    fname: 'Alice',
    lname: 'Brown',
    email: 'alice.brown@example.com',
    phoneNumber: '+254701000006',
    password: 'password123',
    role: 'user',
    isActive: true
  },
  {
    memberNumber: 'MEM005',
    fname: 'Charlie',
    lname: 'Wilson',
    email: 'charlie.wilson@example.com',
    phoneNumber: '+254701000007',
    password: 'password123',
    role: 'user',
    isActive: false // Inactive user for testing
  }
];

const seedAccounts = [
  {
    memberNumber: 'MEM001',
    savings: 15000.50,
    monthlyContribution: 500.00,
    sharesOwned: 25.50,
    accountStatus: 'active',
    notes: 'Premium admin member account with high savings'
  },
  {
    memberNumber: 'MEM002',
    savings: 7500.25,
    monthlyContribution: 300.00,
    sharesOwned: 15.75,
    accountStatus: 'active',
    notes: 'Regular member account with good standing'
  },
  {
    memberNumber: 'MEM003',
    savings: 3200.75,
    monthlyContribution: 200.00,
    sharesOwned: 8.25,
    accountStatus: 'active',
    notes: 'New member account showing growth'
  },
  {
    memberNumber: 'MEM004',
    savings: 12500.00,
    monthlyContribution: 450.00,
    sharesOwned: 20.00,
    accountStatus: 'active',
    notes: 'Consistent contributor with strong savings'
  },
  {
    memberNumber: 'MEM005',
    savings: 850.00,
    monthlyContribution: 100.00,
    sharesOwned: 2.50,
    accountStatus: 'suspended',
    notes: 'Account suspended - needs reactivation'
  }
];

const seedTransactions = [
  // MEM001 Transactions
  {
    transactionId: 'TXN001DEPOSIT',
    memberNumber: 'MEM001',
    type: 'deposit',
    amount: 5000,
    status: 'completed',
    confirmedBy: 'ADMIN001',
    description: 'Initial deposit',
    category: 'savings',
    date: new Date('2024-12-01')
  },
  {
    transactionId: 'TXN002CONTRIB',
    memberNumber: 'MEM001',
    type: 'contribution',
    amount: 500,
    status: 'completed',
    confirmedBy: 'ADMIN001',
    description: 'Monthly contribution December',
    category: 'savings',
    date: new Date('2024-12-15')
  },
  {
    transactionId: 'TXN003SHARES',
    memberNumber: 'MEM001',
    type: 'share_purchase',
    amount: 2500,
    status: 'completed',
    confirmedBy: 'ADMIN001',
    description: 'Purchase of 25 shares',
    category: 'shares',
    date: new Date('2024-12-20')
  },
  
  // MEM002 Transactions
  {
    transactionId: 'TXN004DEPOSIT',
    memberNumber: 'MEM002',
    type: 'deposit',
    amount: 3000,
    status: 'completed',
    confirmedBy: 'MEM001',
    description: 'Opening deposit',
    category: 'savings',
    date: new Date('2024-11-15')
  },
  {
    transactionId: 'TXN005WITHDRAW',
    memberNumber: 'MEM002',
    type: 'withdrawal',
    amount: 500,
    status: 'pending',
    description: 'Emergency withdrawal request',
    category: 'savings',
    date: new Date('2024-12-25')
  },
  
  // MEM003 Transactions
  {
    transactionId: 'TXN006DEPOSIT',
    memberNumber: 'MEM003',
    type: 'deposit',
    amount: 2000,
    status: 'completed',
    confirmedBy: 'ADMIN001',
    description: 'First deposit',
    category: 'savings',
    date: new Date('2024-12-10')
  },
  {
    transactionId: 'TXN007CONTRIB',
    memberNumber: 'MEM003',
    type: 'contribution',
    amount: 200,
    status: 'pending',
    description: 'Monthly contribution pending approval',
    category: 'savings',
    date: new Date('2024-12-28')
  },
  
  // MEM004 Transactions
  {
    transactionId: 'TXN008DEPOSIT',
    memberNumber: 'MEM004',
    type: 'deposit',
    amount: 8000,
    status: 'completed',
    confirmedBy: 'MEM001',
    description: 'Large initial deposit',
    category: 'savings',
    date: new Date('2024-11-01')
  },
  {
    transactionId: 'TXN009LOAN',
    memberNumber: 'MEM004',
    type: 'loan_payment',
    amount: 1000,
    status: 'completed',
    confirmedBy: 'ADMIN001',
    description: 'Loan repayment installment',
    category: 'loan',
    date: new Date('2024-12-05')
  },
  
  // Pending transactions for admin approval
  {
    transactionId: 'TXN010PENDING',
    memberNumber: 'MEM002',
    type: 'contribution',
    amount: 300,
    status: 'pending',
    description: 'Pending monthly contribution',
    category: 'savings',
    date: new Date()
  },
  {
    transactionId: 'TXN011PENDING',
    memberNumber: 'MEM003',
    type: 'share_purchase',
    amount: 800,
    status: 'pending',
    description: 'Pending share purchase request',
    category: 'shares',
    date: new Date()
  }
];

const clearDatabase = async () => {
  console.log('🗑️  Clearing existing database...');
  await Promise.all([
    User.deleteMany({}),
    Account.deleteMany({}),
    Transaction.deleteMany({})
  ]);
  console.log('✅ Database cleared successfully');
};

const createUsers = async () => {
  console.log('👥 Creating users...');
  for (const userData of seedUsers) {
    try {
      const user = new User(userData);
      await user.save();
      const roleIcon = userData.role === 'admin' ? '👑' : '👤';
      const statusIcon = userData.isActive ? '✅' : '❌';
      console.log(`${roleIcon}${statusIcon} Created user: ${userData.memberNumber} (${userData.fname} ${userData.lname}) - ${userData.role}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.memberNumber}:`, error.message);
    }
  }
};

const createAccounts = async () => {
  console.log('\n💰 Creating accounts...');
  for (const accountData of seedAccounts) {
    try {
      const account = new Account(accountData);
      await account.save();
      const statusIcon = accountData.accountStatus === 'active' ? '✅' : '⚠️';
      console.log(`${statusIcon} Created account: ${accountData.memberNumber} - ${accountData.accountStatus} (Balance: KSh ${accountData.savings.toLocaleString()})`);
    } catch (error) {
      console.error(`❌ Error creating account ${accountData.memberNumber}:`, error.message);
    }
  }
};

const createTransactions = async () => {
  console.log('\n💳 Creating transactions...');
  for (const transactionData of seedTransactions) {
    try {
      const transaction = new Transaction(transactionData);
      await transaction.save();
      const statusIcon = transactionData.status === 'completed' ? '✅' : '⏳';
      console.log(`${statusIcon} Created transaction: ${transactionData.transactionId} - ${transactionData.type} (KSh ${transactionData.amount.toLocaleString()})`);
    } catch (error) {
      console.error(`❌ Error creating transaction ${transactionData.transactionId}:`, error.message);
    }
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB for seeding...\n');

    // Clear existing data
    await clearDatabase();

    // Create all data
    await createUsers();
    await createAccounts();
    await createTransactions();

    console.log('\n🎉 Database seeding completed successfully!\n');
    
    // Display test credentials
    console.log('📋 TEST CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMIN ACCOUNTS:');
    console.log('   ADMIN001 / admin123   (System Administrator)');
    console.log('   MEM001   / password123 (John Doe - Admin)');
    console.log('');
    console.log('👤 USER ACCOUNTS:');
    console.log('   MEM002   / password123 (Jane Smith - Active)');
    console.log('   MEM003   / password123 (Bob Johnson - Active)');
    console.log('   MEM004   / password123 (Alice Brown - Active)');
    console.log('   MEM005   / password123 (Charlie Wilson - Inactive)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 DATABASE SUMMARY:');
    const userCount = await User.countDocuments();
    const accountCount = await Account.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    
    console.log(`   Users: ${userCount} (${seedUsers.filter(u => u.role === 'admin').length} admins, ${seedUsers.filter(u => u.role === 'user').length} users)`);
    console.log(`   Accounts: ${accountCount} (${seedAccounts.filter(a => a.accountStatus === 'active').length} active)`);
    console.log(`   Transactions: ${transactionCount} (${pendingTransactions} pending approval)`);
    console.log('');
    console.log('⚠️  Remember to change default passwords in production!');
    console.log('🚀 You can now start the server and test the application!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Seeding interrupted...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Seeding terminated...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the seeding
seedDatabase();