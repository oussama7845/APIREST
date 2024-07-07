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

// Get All users
router.get('/users', function (req, res) {
  User.findAll().then(users => {
    return res.status(200).json(users); 
  }).catch(err => {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching users.' });
  });
});




// create a new user
router.post('/createUser', async function (req, res) {
  const { firstname, lastname, email, password } = req.body;


    // Vérification du format de l'email avec une expression régulière
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

  try {
    // Vérifier si l'email existe déjà dans la base de données
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(405).json({ error: 'Email déjà utilisé' });
    }

    // Vérification du mot de passe avec le schéma
    if (!schema.validate(password)) {
      return res.status(400).json({ error: 'Le mot de passe ne respecte pas les critères requis' });
    }


    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password, // Le hashage est géré par le modèle User via les hooks
      isAdmin: true,
      securityToken: uuidv4(),
    });


    res.status(200).json(newUser);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l\'utilisateur' });
  }
});



// Login authentification
router.post('/login', async function (req, res) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json('user introuvable');
    }

    bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
      if (err) {
        return res.status(500).json('Erreur est survenue lors de la vérification du mot de passe');
      }
      if (!isMatch) {
        return res.status(403).json('Mot de passe incorrect');
      }

      let token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 876000), // expiration en secondes
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
    console.error(error);
    return res.status(500).json("Une erreur est survenue lors de la recherche de l'user");
  }
});






module.exports = router;