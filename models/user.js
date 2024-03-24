module.exports = function (sequelize, DataTypes) {
  let bcrypt   = require('bcryptjs');
    let saltRounds = 10;
      let User = sequelize.define("user", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        firstname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lastname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isAdmin:{
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        securityToken: {
          type: DataTypes.STRING,
          
        },
  
      },
  

      {
        hooks: {
          beforeCreate: function (user) {
            formatUser(user, true);
          },
          beforeUpdate: function (user) {
            formatUser(user);
          },
          beforeDestroy: function (user) {
            //TODO set elections user_id to null before delete user
          },
          // Define the hook
          beforeUpdate: async (user) => {
            if (user.changed("password")) {
              // Only hash the password if it has been changed
              const hashedPassword = await bcrypt.hash(user.password, saltRounds);
              user.password = hashedPassword;
            }
          },
        },
      }
      
      );
        // Functions
  function formatUser(user, isBeforeCreate = false) {
    const toFormat = [
      { dbColumn: "email", action: "toLowerCase" },
      { dbColumn: "firstname", action: "toTitleCase" },
      { dbColumn: "lastname", action: "toTitleCase" },
      { dbColumn: "password", action: "bcrypt" },
    ];

    for (let tf of toFormat)
      if (user[tf.dbColumn] && (isBeforeCreate || user.changed(tf.dbColumn)))
        if (tf.action == "toLowerCase")
          user[tf.dbColumn] = user[tf.dbColumn].toLowerCase();
        else if (tf.action == "toTitleCase")
          user[tf.dbColumn] = titleCase(user[tf.dbColumn]);
        else if (tf.action == "bcrypt")
          user[tf.dbColumn] = bcrypt.hashSync(user[tf.dbColumn], saltRounds);
  }

  let titleCase = (txt) => {
    return txt
      .replace(/ +(?= )/g, "")
      .toLowerCase()
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  }
  
  User.associate =function(models){
    User.hasMany(models.file,{
      hooks: true,
    })
} 

  
      return User;
  
  
  
  }