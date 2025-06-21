const express = require('express');
const router = express.Router();

// In-memory "database"
let transactions = [];

// Get all transactions
router.get('/', (req, res) => {
  res.json(transactions);
});

// Get transaction by ID
router.get('/:id', (req, res) => {
  const tx = transactions.find(t => t.transactionId === req.params.id);
  if (!tx) return res.status(404).send('Transaction not found');
  res.json(tx);
});

// Create new transaction
router.post('/', (req, res) => {
  const {
    transactionId,
    memberNumber,
    date,
    type,
    amount,
    status,
    accountBalance,
    confirmedBy
  } = req.body;

  if (!transactionId || !memberNumber || !type || amount == null) {
    return res.status(400).send('Missing required fields');
  }

  const exists = transactions.find(t => t.transactionId === transactionId);
  if (exists) return res.status(400).send('Transaction already exists');

  const newTransaction = {
    transactionId,
    memberNumber,
    date: date || new Date().toISOString(),
    type,
    amount,
    status: status || 'pending',
    accountBalance: accountBalance || 0,
    confirmedBy: confirmedBy || null
  };

  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Update transaction
router.put('/:id', (req, res) => {
  const index = transactions.findIndex(t => t.transactionId === req.params.id);
  if (index === -1) return res.status(404).send('Transaction not found');

  const { memberNumber, date, type, amount, status, accountBalance, confirmedBy } = req.body;

  transactions[index] = {
    ...transactions[index],
    memberNumber: memberNumber ?? transactions[index].memberNumber,
    date: date ?? transactions[index].date,
    type: type ?? transactions[index].type,
    amount: amount ?? transactions[index].amount,
    status: status ?? transactions[index].status,
    accountBalance: accountBalance ?? transactions[index].accountBalance,
    confirmedBy: confirmedBy ?? transactions[index].confirmedBy
  };

  res.json(transactions[index]);
});

// Delete transaction
router.delete('/:id', (req, res) => {
  const index = transactions.findIndex(t => t.transactionId === req.params.id);
  if (index === -1) return res.status(404).send('Transaction not found');

  const deleted = transactions.splice(index, 1);
  res.json(deleted[0]);
});

module.exports = router;
