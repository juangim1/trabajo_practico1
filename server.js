const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

let materias = []; 
let nextId = 1; 

const sequelize = require('./alumnos_db');

const Materia = require('./models/Materia');
// Sincronizar el modelo con la base de datos (crea la tabla si no

sequelize.sync()
.then(() => {
console.log('Base de datos sincronizada.');
})
.then()
.catch(err => {
console.error('Error al guardar la materia:', err);
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
            nuevaMateria.id = nextId++; 
            materias.push(nuevaMateria); 
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materias)); 
        });
    }

    else if (method === "GET" && parsedUrl.pathname === "/materias") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(materias));
    }
    else if (method === "GET" && parsedUrl.pathname.startsWith("/materias/")) {
        const id = parseInt(parsedUrl.pathname.split("/")[2]);
        const materia = materias.find(m => m.id === id);
        if (materia) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materia));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Materia no encontrada" }));
        }
    }
    
    else if (method === "DELETE" && parsedUrl.pathname.startsWith("/materias/")) {
        const id = parseInt(parsedUrl.pathname.split("/")[2]);
        materias = materias.filter(m => m.id !== id);
        
        
        if (materias.length === 0) {
            nextId = 1;
        }

        res.writeHead(204);
        res.end();
    }
    
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Ruta no encontrada" }));
    }
});

servidor.listen(3000, () => {
    console.log("Servidor ejecutándose en el puerto 3000");
});
