const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

let materias = []; // Arreglo para almacenar las materias en el servidor
let nextId = 1; // Variable para asignar IDs únicos a las materias

const servidor = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Manejar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responder a la solicitud OPTIONS antes de manejar POST y DELETE
    if (method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // Mostrar formulario para agregar registro
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
    // Manejar la solicitud POST para agregar materia
    else if (method === "POST" && parsedUrl.pathname === "/materias") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const nuevaMateria = JSON.parse(body);
            nuevaMateria.id = nextId++; // Asignar un ID único
            materias.push(nuevaMateria); // Agregar materia al arreglo
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materias)); // Devolver todas las materias
        });
    } 
    // Listar todas las materias
    else if (method === "GET" && parsedUrl.pathname === "/materias") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(materias));
    }
    // Obtener una materia por ID
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
    // Eliminar una materia por ID
    else if (method === "DELETE" && parsedUrl.pathname.startsWith("/materias/")) {
        const id = parseInt(parsedUrl.pathname.split("/")[2]);
        materias = materias.filter(m => m.id !== id);
        
        // Reiniciar nextId a 1 si no quedan materias
        if (materias.length === 0) {
            nextId = 1;
        }

        res.writeHead(204);
        res.end();
    }
    // Ruta no encontrada
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Ruta no encontrada" }));
    }
});

servidor.listen(3000, () => {
    console.log("Servidor ejecutándose en el puerto 3000");
});
