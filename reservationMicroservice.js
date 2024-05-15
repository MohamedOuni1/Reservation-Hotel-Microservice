const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Reservation = require('./models/reservationsModel'); // Importation du modèle de réservation depuis le fichier correspondant
const reservationProtoPath = 'reservation.proto';
const { Kafka } = require('kafkajs');
// Chargement du fichier reservation.proto
const reservationProtoDefinition = protoLoader.loadSync(reservationProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();


const reservationProto = grpc.loadPackageDefinition(reservationProtoDefinition).reservation;

const url = 'mongodb://localhost:27017/reservations';

// Connexion à MongoDB
mongoose.connect(url)
    .then(() => {
        console.log('Connecté à la base de données !');
    }).catch((err) => {
        console.log(err);
    });

// Définition des méthodes du service gRPC pour les réservations
const reservationService = {
    // Méthode pour obtenir une réservation par ID
    getReservation: async (call, callback) => {
        try {
            await producer.connect();
            const RId = call.request.reservation_id;
            const reservation = await Reservation.findOne({ _id: RId }).exec();
            
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: 'reservation trouvé avecc id : '+RId.toString() }],
            });

            
            
            if (!reservation) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Reservation non trouvé' });
                return;
            }
            callback(null, { reservation });
        } catch (error) {

            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: `reservation non trouvé :  ${error}` }],
            });


            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la récupération de Reservation' });
        }
    },

    // Méthode pour rechercher des réservations
    searchReservations: async (call, callback) => {
        try {
            const reservations = await Reservation.find({}).exec();
            await producer.connect();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: 'recherche reservation' }],
            });
            callback(null, { reservations: reservations });
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: 'Une erreur s\'est produite lors de la recherche des hôtels: ${error}' }],
            });

            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la récupération des réservations' });
        }
    },

    // Méthode pour ajouter une nouvelle réservation
    addReservation: async (call, callback) => {
        const { customer_id, reservation_date, check_in_date, check_out_date, room_type } = call.request;
        const newReservation = new Reservation({ customer_id, reservation_date, check_in_date, check_out_date, room_type });

        try {
            const savedReservation = await newReservation.save();
            callback(null, { reservation: savedReservation });
            await producer.connect();

            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: JSON.stringify(savedReservation) }],
            });

            await producer.disconnect();


        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: `reservation non ajouté ( erreur ) : ${error}` }],
            });

            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la réservation' });
        }
    },

    // Méthode pour supprimer une réservation
    deleteReservation: async (call, callback) => {
        try {
            await producer.connect();
            const reservationId = call.request.reservation_id;
            const reservation = await Reservation.findOneAndDelete({ _id: reservationId }).exec();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: 'Reservation supprimé : id  : '+reservationId.toString() }],
            });

           
            if (!reservation) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Réservation non trouvée' });
                return;
            }
            callback(null, { message: 'Réservation supprimée avec succès' });
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: `Erreur en supprimant  resrvation: ${error}` }],
            });

            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la suppression de la réservation' });
        }
    },

    // Méthode pour mettre à jour une réservation
    updateReservation: async (call, callback) => {
        try {
            await producer.connect();
            const { id, customer_id, reservation_date, check_in_date, check_out_date, room_type } = call.request;
            // Mettre à jour la réservation dans la base de données
            const updatedReservation = await Reservation.findByIdAndUpdate(id, {
                customer_id: customer_id,
                reservation_date: reservation_date,
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                room_type: room_type
            }, { new: true }); 
            await producer.connect();

            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: JSON.stringify(updatedReservation) }],
            });

            await producer.disconnect();


            // Vérifier si la réservation existe
            if (!updatedReservation) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Reservation non trouvé' });
                return;
            }

            // Renvoyer la réponse avec la réservation mise à jour
            callback(null, { reservation: updatedReservation });
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'reservation_topic',
                messages: [{ value: `'Erreur lors de la mise à jour de reservation  ${error}` }],
            });

            console.error('Erreur lors de la mise à jour de la réservation :', error);
            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la mise à jour de réservation' });
        }
    },
};



// Création et démarrage du serveur gRPC
const server = new grpc.Server();
server.addService(reservationProto.ReservationService.service, reservationService); // Ajout du service au serveur

const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Échec de la liaison du serveur :', err);
            return;
        }
        console.log(`Le serveur fonctionne sur le port ${port}`);
        server.start();
    });

console.log(`Le microservice de réservation fonctionne sur le port ${port}`);
