const express = require('express');
const router = express.Router();

//simple in memory database
let users = [];

//Get all users
router.get('/', (req, res) => {
    res.json(users);
});

//get user ny id
router.get('/:id', (req, res) => {
    const user = users.find(u => u.memberNumber === req.params.id);
    if (!user) return res.status(404).send('User not found');
    res.json(user);
});

//Create new user
router.post('/', (req, res) => {
    const { memberNumber, fname, lname, email, phoneNumber, dateJoined, emergencyContacts } = req.body;

    //Basic validation
    if (!memberNumber || !fname || !lname || !phoneNumber){
        return res.status(400).send('Missing required fields');
    }

    const existing = users.find(u => u.memberNumber === memberNumber);
  if (existing) return res.status(400).send('User with this member number already exists');

  const newUser = {
    memberNumber,
    fname,
    lname,
    email,
    phoneNumber,
    dateJoined,
    emergencyContacts
  };

  users.push(newUser);
  res.status(201).json(newUser);

});

//Update user by ID(Member Number)
router.put('/:id', (req, res) => {
    const index = users.findIndex(u => u.memberNumber === req.params.id);
  if (index === -1) return res.status(404).send('User not found');

  const { fname, lname, email, phoneNumber, dateJoined, emergencyContacts } = req.body;

  // Update only provided fields
  users[index] = {
    ...users[index],
    fname: fname ?? users[index].fname,
    lname: lname ?? users[index].lname,
    email: email ?? users[index].email,
    phoneNumber: phoneNumber ?? users[index].phoneNumber,
    dateJoined: dateJoined ?? users[index].dateJoined,
    emergencyContacts: emergencyContacts ?? users[index].emergencyContacts
  };

  res.json(users[index]);
});

//Delete user by ID(Member Number)
router.delete('/:id', (req, res) => {
    const index = users.findIndex(u => u.memberNumber === req.params.id);
  if (index === -1) return res.status(404).send('User not found');

  const deletedUser = users.splice(index, 1);
  res.json(deletedUser[0]);
});

module.exports = router;
