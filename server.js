const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');


let materias = [];
let nextId = 1;


const sequelize = require('./alumnos_bd');


const Materia = require('./models/Materia');


// Sincronizar el modelo con la base de datos (crea la tabla si no existe)
sequelize.sync()
.then(() => {  
    console.log('Base de datos sincronizada.');
})
.catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
});




const servidor = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');




    if (method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }
   
    if (method === "GET" && parsedUrl.pathname === "/") {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error cargando el formulario.');
            }
            res.end(data);
        });
    }
    else if (method === "POST" && parsedUrl.pathname === "/materias") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const nuevaMateria = JSON.parse(body);
            console.log('Nueva Materia:', nuevaMateria); // Agrega este log para ver los datos que recibes.
            Materia.create({
                nombre: nuevaMateria.nombre,
                cantidad: nuevaMateria.cantidad
            }).then(materiaCreada => {
                console.log('Materia Creada:', materiaCreada); // Verifica que la materia se haya creado.
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(materiaCreada));
            }).catch(err => {
                console.error('Error al crear la materia:', err); // Log para ver si hay un error.
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error al crear la materia', error: err }));
            });
        });
    }
    else if (method === "GET" && parsedUrl.pathname === "/materias") {
        Materia.findAll().then(materias => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materias));
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al obtener las materias', error: err }));
        });
    }
    else if (method === "GET" && parsedUrl.pathname.startsWith("/materias/")) {
        const id = parseInt(parsedUrl.pathname.split("/")[2]);
        Materia.findByPk(id).then(materia => {
            if (materia) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(materia));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Materia no encontrada" }));
            }
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al buscar la materia', error: err }));
        });
    }
    else if (method === "GET" && parsedUrl.pathname === "/materia/buscar") {
        const nombre = parsedUrl.query.nombre;
        Materia.findOne({ where: { nombre: nombre } }).then(materia => {
            if (materia) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(materia));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Materia no encontrada" }));
            }
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al buscar la materia', error: err }));
        });
    }
    else if (method === "DELETE" && parsedUrl.pathname.startsWith("/materias/")) {
        const id = parseInt(parsedUrl.pathname.split("/")[2]);
        Materia.destroy({ where: { id: id } }).then(() => {
            res.writeHead(204);
            res.end();
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al eliminar la materia', error: err }));
        });
    }
    else if (method === "DELETE" && parsedUrl.pathname === "/materias") {
        Materia.destroy({ where: {}, truncate: true }).then(() => {
            res.writeHead(204);
            res.end();
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al eliminar todas las materias', error: err }));
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Ruta no encontrada" }));
    }
});




servidor.listen(3000, () => {
    console.log("Servidor ejecutándose en el puerto 3000");
});
