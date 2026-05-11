require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');

// Import models
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Payout = require('../models/Payout');
const PayoutAudit = require('../models/PayoutAudit');

const seed = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected.');

    // Clear existing data
    console.log('📋 Clearing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      Payout.deleteMany({}),
      PayoutAudit.deleteMany({}),
    ]);
    console.log('✅ Database cleared.');

    // ─── SEED USERS ────────────────────────────────────────────────────────
    console.log('\n👤 Seeding users...');

    const salt = await bcrypt.genSalt(10);
    const opsHash = await bcrypt.hash('ops123', salt);
    const finHash = await bcrypt.hash('fin123', salt);

    const users = await User.insertMany([
      {
        email: 'ops@demo.com',
        password: opsHash,
        role: 'OPS',
        name: 'Operations Manager',
      },
      {
        email: 'finance@demo.com',
        password: finHash,
        role: 'FINANCE',
        name: 'Finance Manager',
      },
    ]);

    const opsUser = users[0];
    const finUser = users[1];
    console.log(`   ✅ ops@demo.com (OPS) — id: ${opsUser._id}`);
    console.log(`   ✅ finance@demo.com (FINANCE) — id: ${finUser._id}`);

    // ─── SEED VENDORS ──────────────────────────────────────────────────────
    console.log('\n🏢 Seeding vendors...');

    const vendors = await Vendor.insertMany([
      {
        name: 'TechCorp Solutions',
        upi_id: 'techcorp@okaxis',
        bank_account: '12345678901',
        ifsc: 'HDFC0001234',
        is_active: true,
      },
      {
        name: 'Rapid Logistics Pvt Ltd',
        upi_id: null,
        bank_account: '98765432100',
        ifsc: 'ICIC0005678',
        is_active: true,
      },
      {
        name: 'Creative Designs Studio',
        upi_id: 'creativedesigns@ybl',
        bank_account: null,
        ifsc: null,
        is_active: true,
      },
      {
        name: 'Old Vendor (Inactive)',
        upi_id: null,
        bank_account: '11122233344',
        ifsc: 'SBIN0009999',
        is_active: false,
      },
    ]);

    vendors.forEach((v) => console.log(`   ✅ ${v.name} (id: ${v._id})`));

    // ─── SEED PAYOUTS ──────────────────────────────────────────────────────
    console.log('\n💸 Seeding payouts...');

    // Payout 1: Draft (just created)
    const p1 = await Payout.create({
      vendor_id: vendors[0]._id,
      amount: 25000.00,
      mode: 'NEFT',
      note: 'Monthly retainer fee for Nov 2024',
      status: 'Draft',
      created_by: opsUser._id,
    });
    await PayoutAudit.create({
      payout_id: p1._id,
      action: 'CREATED',
      performed_by: opsUser._id,
      performed_by_name: opsUser.name,
      performed_by_role: opsUser.role,
    });
    console.log(`   ✅ Payout #${p1._id} — Draft`);

    // Payout 2: Submitted
    const p2 = await Payout.create({
      vendor_id: vendors[1]._id,
      amount: 8500.50,
      mode: 'IMPS',
      note: 'Delivery charges Q3',
      status: 'Submitted',
      created_by: opsUser._id,
    });
    await PayoutAudit.insertMany([
      {
        payout_id: p2._id,
        action: 'CREATED',
        performed_by: opsUser._id,
        performed_by_name: opsUser.name,
        performed_by_role: opsUser.role,
        created_at: new Date(Date.now() - 3600000),
      },
      {
        payout_id: p2._id,
        action: 'SUBMITTED',
        performed_by: opsUser._id,
        performed_by_name: opsUser.name,
        performed_by_role: opsUser.role,
        created_at: new Date(),
      },
    ]);
    console.log(`   ✅ Payout #${p2._id} — Submitted`);

    // Payout 3: Approved
    const p3 = await Payout.create({
      vendor_id: vendors[2]._id,
      amount: 15000.00,
      mode: 'UPI',
      note: 'Logo design project payment',
      status: 'Approved',
      created_by: opsUser._id,
    });
    await PayoutAudit.insertMany([
      {
        payout_id: p3._id,
        action: 'CREATED',
        performed_by: opsUser._id,
        performed_by_name: opsUser.name,
        performed_by_role: opsUser.role,
        created_at: new Date(Date.now() - 86400000),
      },
      {
        payout_id: p3._id,
        action: 'SUBMITTED',
        performed_by: opsUser._id,
        performed_by_name: opsUser.name,
        performed_by_role: opsUser.role,
        created_at: new Date(Date.now() - 43200000),
      },
      {
        payout_id: p3._id,
        action: 'APPROVED',
        performed_by: finUser._id,
        performed_by_name: finUser.name,
        performed_by_role: finUser.role,
        created_at: new Date(),
      },
    ]);
    console.log(`   ✅ Payout #${p3._id} — Approved`);

    // Payout 4: Rejected
    const p4 = await Payout.create({
      vendor_id: vendors[0]._id,
      amount: 500.00,
      mode: 'UPI',
      note: 'Miscellaneous expenses',
      status: 'Rejected',
      decision_reason: 'Amount too small and documentation missing. Please resubmit with proper receipts.',
      created_by: opsUser._id,
    });
    await PayoutAudit.insertMany([
      {
        payout_id: p4._id,
        action: 'CREATED',
        performed_by: opsUser._id,
        performed_by_name: opsUser.name,
        performed_by_role: opsUser.role,
        created_at: new Date(Date.now() - 172800000),
      },
      {
        payout_id: p4._id,
        action: 'SUBMITTED',
        performed_by: opsUser._id,
        performed_by_name: opsUser.name,
        performed_by_role: opsUser.role,
        created_at: new Date(Date.now() - 86400000),
      },
      {
        payout_id: p4._id,
        action: 'REJECTED',
        performed_by: finUser._id,
        performed_by_name: finUser.name,
        performed_by_role: finUser.role,
        created_at: new Date(),
      },
    ]);
    console.log(`   ✅ Payout #${p4._id} — Rejected`);

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('  Test Credentials:');
    console.log('  OPS:     ops@demo.com     / ops123');
    console.log('  FINANCE: finance@demo.com / fin123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
