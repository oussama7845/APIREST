module.exports = function (sequelize, DataTypes) {
  let File = sequelize.define("file", {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      file: {
          type: DataTypes.STRING,
      }
  });


  File.associate = function (models) {
    console.log('Associating File with models:', Object.keys(models)); // Log models
    if (models.User) {
      File.belongsTo(models.User, {
        foreignKey: { allowNull: false },
      });
    } else {
      console.error('User model is not defined');
    }
  };


  return File;
};
