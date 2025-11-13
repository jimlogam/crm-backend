// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Para leer variables de entorno como la conexión a la BD

const Cotizacion = require('./cotizacion.model'); // Importamos nuestro modelo

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuraciones ---
app.use(cors()); // Permite que tu página de Firebase pueda hablar con este servidor
app.use(express.json()); // Permite al servidor entender los datos JSON que le envías

// --- Conexión a la Base de Datos ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a la base de datos (MongoDB Atlas)'))
    .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

// --- Rutas de la API ---

// Esta es la ruta que recibirá el "lead" desde tu página web
app.post('/api/cotizaciones', async (req, res) => {
    try {
        console.log('>> Nuevo lead recibido:', req.body); // Vemos en la terminal lo que llega
        
        // Creamos una nueva cotización en la base de datos con los datos recibidos
        const nuevaCotizacion = new Cotizacion(req.body);
        await nuevaCotizacion.save();

        // Respondemos a la página web que todo salió bien
        res.status(201).json({ message: 'Lead guardado con éxito', data: nuevaCotizacion });

    } catch (error) {
        console.error('!! Error al guardar el lead:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});