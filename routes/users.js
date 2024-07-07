/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

let express = require('express');
let router = express.Router();
const fs = require('fs'); 
let User = require('../models').User;
const { v4: uuidv4 } = require('uuid');
let bcrypt   = require('bcryptjs');
let jwt = require("jsonwebtoken");
let path = require('path');
let config = require(path.join(__dirname, '..', 'config', 'config.json'));
require("dotenv").config();

const passwordValidator = require('password-validator');
const schema = new passwordValidator();

schema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     description: Retrieve a list of all users from the database.
 *     responses:
 *       '200':
 *         description: A successful response with a list of users.
 *       '500':
 *         description: Internal server error.
 */
router.get('/users', function (req, res) {
  User.findAll().then(users => {
    return res.status(200).json(users); 
  }).catch(err => {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching users.' });
  });
});

/**
 * @swagger
 * /createUser:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully created user.
 *       '400':
 *         description: Invalid email format or password does not meet requirements.
 *       '405':
 *         description: Email already in use.
 *       '500':
 *         description: Internal server error.
 */
router.post('/createUser', async function (req, res) {
  const { firstname, lastname, email, password } = req.body;

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(405).json({ error: 'Email already in use' });
    }

    // Password validation with schema
    if (!schema.validate(password)) {
      return res.status(400).json({ error: 'Password does not meet requirements' });
    }

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password,
      isAdmin: true,
      securityToken: uuidv4(),
    });

    res.status(200).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login
 *     description: Authenticates user credentials and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully authenticated and returned JWT token.
 *       '400':
 *         description: User not found or incorrect password.
 *       '500':
 *         description: Internal server error.
 */
router.post('/login', async function (req, res) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(400).json('User not found');
    }

    bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
      if (err) {
        return res.status(500).json('Error verifying password');
      }
      if (!isMatch) {
        return res.status(400).json('Incorrect password');
      }

      let token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 876000), // Expiration in seconds
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          isAdmin: user.isAdmin,
        },
        config.privateKey
      );

      return res.status(200).json({
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isAdmin: user.isAdmin,
        token: token,
      });
    });
  } catch (error) {
    console.error('Error finding user:', error);
    return res.status(500).json('An error occurred while finding user');
  }
});

module.exports = router;
