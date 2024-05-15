const mongoose = require('mongoose');

// Définition du schéma pour les réservations
const reservationSchema = new mongoose.Schema({
    customer_id: String,
    reservation_date: String,
    check_in_date: String,
    check_out_date: String,
    room_type: String
});

// Définition du modèle Reservation basé sur le schéma
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
