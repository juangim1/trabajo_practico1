const { DataTypes } = require('sequelize');
const sequelize = require('../alumnos_bd');
// Definir la clase 'Materia'
const Materia = sequelize.define('Materia', {
id: {
type: DataTypes.INTEGER,
primaryKey: true,
autoIncrement: true
},
nombre: {
type: DataTypes.STRING,
allowNull: false
    },
cantidad: {
type: DataTypes.INTEGER,
allowNull: false
}
    
}, {
tableName: 'materias',
timestamps: false
});
module.exports = Materia;