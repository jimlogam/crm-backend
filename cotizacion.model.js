// cotizacion.model.js
const mongoose = require('mongoose');

// Define cómo se verá cada servicio extra (nombre y precio)
const servicioSchema = new mongoose.Schema({
    name: String,
    price: Number
});

// Define la estructura principal de la cotización
const cotizacionSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    eventDate: { type: Date, required: true },
    selectedServices: [servicioSchema], // Esto será una lista de servicios
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Nuevo' }, // Por defecto, todos los leads son "Nuevos"
    createdAt: { type: Date, default: Date.now } // Guarda la fecha en que se creó el lead
});

const Cotizacion = mongoose.model('Cotizacion', cotizacionSchema);

module.exports = Cotizacion;