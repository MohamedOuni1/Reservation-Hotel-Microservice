const mongoose = require('mongoose');

// Définition du sous-schéma pour les chambres
const roomSchema = new mongoose.Schema({
    type: String,
    price_per_night: Number,
    available: Boolean
});

// Définition du schéma pour les hôtels
const hotelSchema = new mongoose.Schema({
    name: String,
    description: String,
    address: String,
    amenities: [String],
    rooms: [roomSchema] // Champ pour stocker les informations des chambres
});

// Définition du modèle Hotel basé sur le schéma
const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
