const fetch = require('node-fetch');
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
// Reemplaza tu app.post actual con esta versión mejorada
app.post('/api/cotizaciones', async (req, res) => {
    try {
        console.log('>> Nuevo lead recibido:', req.body);
        
        // 1. Guardamos en la base de datos (como antes)
        const nuevaCotizacion = new Cotizacion(req.body);
        await nuevaCotizacion.save();

        // === INICIO DEL CÓDIGO PARA GOOGLE SHEETS ===
        // ¡PEGA TU URL DE ZAPIER AQUÍ!
        const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/15803267/u88sw8c/'; 

        const datosParaSheets = {
            fechaEvento: new Date(nuevaCotizacion.eventDate).toLocaleDateString('es-ES'),
            telefonoCliente: nuevaCotizacion.phone,
            precioTotal: nuevaCotizacion.totalPrice,
            paquete: nuevaCotizacion.packageName || 'M.H.N.Q.N',
            serviciosExtra: nuevaCotizacion.selectedServices.map(s => s.name).join(', '),
            fechaDeContacto: new Date(nuevaCotizacion.createdAt).toLocaleString('es-ES')
        };

        // 2. Enviamos una copia a Zapier
        await fetch(ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaSheets)
        });
        console.log('>> Lead enviado a Zapier para Google Sheets.');
        // === FIN DEL CÓDIGO ===

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