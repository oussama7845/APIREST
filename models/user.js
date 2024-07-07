const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    securityToken: {
      type: DataTypes.STRING,
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    hooks: {
      beforeCreate: (user) => {
        formatUser(user, true);
      },
      beforeUpdate: (user) => {
        formatUser(user);
      },
      beforeDestroy: (user) => {},
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const hashedPassword = await bcrypt.hash(user.password, saltRounds);
          user.password = hashedPassword;
        }
      },
    },
  });



  function formatUser(user, isBeforeCreate = false) {
    const toFormat = [
      { dbColumn: "email", action: "toLowerCase" },
      { dbColumn: "firstname", action: "toTitleCase" },
      { dbColumn: "lastname", action: "toTitleCase" },
      { dbColumn: "password", action: "bcrypt" },
    ];

    for (let tf of toFormat) {
      if (user[tf.dbColumn] && (isBeforeCreate || user.changed(tf.dbColumn))) {
        if (tf.action === "toLowerCase") {
          user[tf.dbColumn] = user[tf.dbColumn].toLowerCase();
        } else if (tf.action === "toTitleCase") {
          user[tf.dbColumn] = titleCase(user[tf.dbColumn]);
        } else if (tf.action === "bcrypt") {
          user[tf.dbColumn] = bcrypt.hashSync(user[tf.dbColumn], saltRounds);
        }
      }
    }
  }

  function titleCase(txt) {
    return txt
      .replace(/ +(?= )/g, "")
      .toLowerCase()
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  }

  return User;
};