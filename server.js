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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST,PUT,DELETE, OPTIONS');
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

    //uso de findAll() para listar todas las materias en lugar de usar el arrray
    else if (method === "GET" && parsedUrl.pathname === "/materias") {
        Materia.findAll()
         .then(materias => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materias));
         })
         .catch(err => { //control mensajes de error... esto puede no ir
            console.error('');
            res.writeHead(500,{'Content-Type':'applicaiont/json'});
            res.end(JSON.stringify({message:"Error al obtener materias"}))
         });
        
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
    //actualizar o editar materia
    else if (method==="PUT" && parsedUrl.pathname.startsWith("/materias/")){
        const id =parseInt(parsedUrl,pathname.split('/')[2]);
        let body='';
        req.on('data',chuk => {
            body+=chunk.toString();// obtenemos la informacion por partes con el chunk y lo ponemos en le cuerpo de la solicitud
        });

        req.on('end',() => {
            const registroActualizado = JSON.parse(body); // 

            Materia.update(registroActualizado,{ where: {id:id}})
                .then (([filaActualizada]) => {
                    if (filaActualizada>0) {//Si se actualizo el registro
                        return Materia.findByPk(id); //se devuelve para ver los datos actualizados
                    } else {//si no encontro una materia para actualizar
                        res.writeHead(404,{ 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: "Materia no encontrada" }))
                    }
                })
                .then (materiaActualizada => {//recibe el resultado de findByPk(id) 
                    if (materiaActualizada){ // se actualizo OK un registro, entonces envia el registro actualizado y avisa OK
                        res.writeHead(200,{'Content-Type:':'application/json'});
                        res.end(JSON.stringify(materiaActualizada));
                    }
                })
                .catch(err => { //control mensajes de error... esto puede no ir
                    console.error('');
                    res.writeHead(500,{'Content-Type':'applicaiont/json'});
                    res.end(JSON.stringify({message:"Error del servidor"}))
                 });
            
        })

    }
    //Borrado de materia
    else if (method === "DELETE" && parsedUrl.pathname.startsWith("/materias/")) {
        const id = parseInt(parsedUrl.pathname.split("/")[2]);
        //materias = materias.filter(m => m.id !== id);
        
        materias.destroy ({where:{id:id}}) 
            .then (borrado => { //si encuenta el id en la BBDD pone borrado=1, sino lo deja en cero
               if (borrado){
                    res.writeHead(200,{'Content-Type:':'application/json'});//res.writeHead(200) se puede poner esto y el renglon de abajo solo 
                    res.end(JSON.stringify({message:"Materia eliminada"})); // res.end() y no se muestra mensaje de eliminacion exisotsa
                }
               else 
               {
                res.writeHead(404,{'Content-Type:':'application/json'}); 
                res.end(JSON.stringify({message: "MAteria no encontrada"}));
               }  

            })
            .catch(err => { //control mensajes de error... esto puede no ir
                console.error('');
                res.writeHead(500,{'Content-Type':'applicaiont/json'});
                res.end(JSON.stringify({message:"Error del servidor"}))
             });
    }
            

        
   

servidor.listen(3000, () => {
    console.log("Servidor ejecutándose en el puerto 3000");
});
});