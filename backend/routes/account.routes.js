const express = require('express');
const router = express.Router();

let accounts = [];

//Get all accounts
router.get('/', (req, res) => {
    res.json(accounts);
});

//Get account by member number
router.get('/:id', (req, res) => {
    const account = accounts.find(a => a.memberNumber === req.params.id);

    if (!account) return res.status(404).send('Account not found');
    res.json(account);
});

//create a new account
router.post('/', (req, res) => {
    const { memberNumber, savings, monthlyContribution, sharesOwned, accountStatus } = req.body;

    if (!memberNumber) res.status(400).send('Member number is required');

    const exists =  accounts.find(a => a.memberNumber === memberNumber);
    if (exists) return res.status(400).send('Account already exists');

    const newAccount = {
        memberNumber,
        savings: savings || 0,
        monthlyContribution: monthlyContribution || 0,
        sharesOwned: sharesOwned || 0,
        accountStatus: accountStatus || 'pending'
    }

    accounts.push(newAccount);
    res.status(201).json(newAccount);
});

//update account
router.put('/:id', (req, res) => {
    const index = accounts.findIndex(a => a.memberNumber === req.params.id);
  if (index === -1) return res.status(404).send('Account not found');

  const { savings, monthlyContribution, sharesOwned, accountStatus } = req.body;

  accounts[index] = {
    ...accounts[index],
    savings: savings ?? accounts[index].savings,
    monthlyContribution: monthlyContribution ?? accounts[index].monthlyContribution,
    sharesOwned: sharesOwned ?? accounts[index].sharesOwned,
    accountStatus: accountStatus ?? accounts[index].accountStatus
  };

  res.json(accounts[index]);
});


router.delete('/:id', (req, res) => {
    const index = accounts.findIndex(a => a.memberNumber === req.params.id);
  if (index === -1) return res.status(404).send('Account not found');

  const deleted = accounts.splice(index, 1);
  res.json(deleted[0]);
});

module.exports = router;
