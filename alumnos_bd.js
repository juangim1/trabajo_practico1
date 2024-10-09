const { Sequelize } = require('sequelize');
// Configurar la conexión a la base de datos
const sequelize = new Sequelize('alumnos_bd', 'jcruz', 'mariana', {
host: 'localhost',
dialect: 'mysql'
});
// Probar la conexión

async function testConnection() {
    try {
      await sequelize.authenticate();
      console.log('Conexión a la base de datos establecida con éxito.');
    } catch (error) {
      console.error('No se pudo conectar a la base de datos:', error);
    }
  }
  
  testConnection();
  
  module.exports = sequelize;