// Requerimos la herramienta para hacer llamadas a internet
const fetch = require('node-fetch');

// Importaciones estándar
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Cotizacion = require('./cotizacion.model'); // Nuestro modelo de datos

const app = express();
const PORT = process.env.PORT || 10000; // Render usa el puerto 10000

// --- Configuraciones ---
app.use(cors());
app.use(express.json());

// --- Conexión a la Base de Datos ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a la base de datos (MongoDB Atlas)'))
    .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

// --- Rutas de la API ---

app.post('/api/cotizaciones', async (req, res) => {
    try {
        console.log('>> Nuevo lead recibido:', req.body);
        
        // 1. Guardamos el lead en nuestra base de datos
        const nuevaCotizacion = new Cotizacion(req.body);
        await nuevaCotizacion.save();

        // === INICIO DEL CÓDIGO PARA GOOGLE SHEETS VÍA MAKE.COM ===
        
        // La dirección de nuestro "cartero digital" en Make.com
        const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/kffw4wme23rvw75gprq9cv6naums02yv';
        
        // Preparamos los datos en un formato amigable para la hoja de cálculo
        const datosParaSheets = {
            fechaEvento: new Date(nuevaCotizacion.eventDate).toLocaleDateString('es-ES'),
            telefonoCliente: nuevaCotizacion.phone,
            precioTotal: nuevaCotizacion.totalPrice,
            paquete: nuevaCotizacion.packageName || 'M.H.N.Q.N',
            serviciosExtra: nuevaCotizacion.selectedServices.map(s => s.name).join(', '),
            fechaDeContacto: new Date(nuevaCotizacion.createdAt).toLocaleString('es-ES')
        };

        // 2. Enviamos una copia de los datos a Make.com
        await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaSheets)
        });

        // ¡MENSAJE CORREGIDO!
        console.log('>> Lead enviado a Make.com para Google Sheets.');

        // === FIN DEL CÓDIGO PARA GOOGLE SHEETS ===

        // Respondemos a la página web que todo salió bien
        res.status(201).json({ message: 'Lead guardado con éxito', data: nuevaCotizacion });

    } catch (error) {
        console.error('!! Error al procesar el lead:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

