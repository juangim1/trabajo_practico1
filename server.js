const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

let materias = []; // Arreglo para almacenar las materias en el servidor
let nextId = 1; // Variable para asignar IDs únicos a las materias

const servidor = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); // Parsear la URL
    const method = req.method; // Obtener el método HTTP

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
            res.end(data); // Enviar el formulario al cliente
        });
    } 
    // Manejar la solicitud POST para agregar materia
    else if (method === "POST" && parsedUrl.pathname === "/materias") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Concatenar los datos
        });
        req.on('end', () => {
            const nuevaMateria = JSON.parse(body); // Parsear el cuerpo de la solicitud
            nuevaMateria.id = nextId++; // Asignar un ID único
            materias.push(nuevaMateria); // Agregar materia al arreglo
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materias)); // Devolver todas las materias
        });
    } 
    // Listar todas las materias
    else if (method === "GET" && parsedUrl.pathname === "/materias") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(materias)); // Devolver la lista de materias
    }
    // Ruta no encontrada
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Ruta no encontrada" })); // Enviar mensaje de error
    }
});

servidor.listen(3000, () => {
    console.log("Servidor ejecutándose en el puerto 3000"); // Mensaje de inicio
});
