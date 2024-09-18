const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

let materias = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'POST' && pathname === '/materias') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convertir el chunk a string
        });

        req.on('end', () => {
            const materia = JSON.parse(body);
            materias.push(materia);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materia));
        });
    } else if (req.method === 'GET') {
        if (pathname === '/materias') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materias));
        } else if (pathname.match(/^\/materias\/\d+$/)) {
            const id = parseInt(pathname.split('/')[2]);
            const materia = materias[id];
            if (materia) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(materia));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Materia no encontrada');
            }
        } else {
            // Serve static files (index.html, style.css)
            const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Archivo no encontrado');
                    return;
                }
                res.writeHead(200, { 'Content-Type': getContentType(filePath) });
                res.end(data);
            });
        }
    } else if (req.method === 'DELETE') {
        if (pathname === '/materias') {
            materias = [];
            res.writeHead(204, { 'Content-Type': 'text/plain' });
            res.end();
        } else if (pathname.match(/^\/materias\/\d+$/)) {
            const id = parseInt(pathname.split('/')[2]);
            if (materias[id]) {
                materias.splice(id, 1);
                res.writeHead(204, { 'Content-Type': 'text/plain' });
                res.end();
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Materia no encontrada');
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Ruta no encontrada');
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Método no permitido');
    }
});

function getContentType(filePath) {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        default: return 'application/octet-stream';
    }
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
