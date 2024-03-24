var express = require('express');
const { uuid } = require('uuidv4');
let bcrypt   = require('bcryptjs');
var router = express.Router();
let User = require('../models').user;
let jwt = require("jsonwebtoken");
let path = require("path");
let env = process.env.NODE_ENV || "development";
let config = require(path.join(__dirname, "..", "config", "config.json"))[env];



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/users', function (req, res) {
  User.findAll().then(users => {
    return res.status(200).json(users);
  })
});

// CREATE ADMIN ROUTE

router.post('/createUser', function(req, res){

  try{
  const { firstname , lastname , email, password} = req.body;
  let Admin = {
    firstname : firstname,
    lastname : lastname,
    email : email,
    password: password,
    isAdmin: true,
    securityToken : uuid(),
  }

  const created = User.create(Admin);
  res.status(200).json(created);

  }catch(err){
    console.log(err)

  }

})

// lOGIN ROUTE

router.post("/login", async function (req, res) {

  let user = await User.findOne({ where: { email: req.body.email.toLowerCase() } });
 

  if (!user)
    return res
      .status(404)
      .json("utilisateur introuvable");
    

  bcrypt.compare(req.body.password, user.password, async function (
    err,
    isMatch
  ) {
  

    if (err)
      return res
        .status(500)
        .json("erreur est survenue lors de la verification du mot de passe"); // Error in bcrypt comparing
    if (!isMatch) {
      return res
        .status(403)
        .json("mot de passe incorrect"); // Wrong password
    } else {
     

      // Correct login
      

      let token = jwt.sign(
        {
          exp: Math.floor(Date.now() + 60 * 1000 * 60 * 876000),
          id: user.id,
          isAdmin: user.isAdmin,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        },
        config.privateKey
      );
      return res.status(200).json({
        id: user.id,
        isAdmin: user.isAdmin,

        
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        token: token,
      });
    }
  });
});







module.exports = router;
