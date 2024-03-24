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
      File.belongsTo(models.user, {
          foreignKey: { allowNull: false },
      });
  };

  return File;
};
