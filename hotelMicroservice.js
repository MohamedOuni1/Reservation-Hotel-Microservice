const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Hotel = require('./models/hotelsModel'); // Importation du modèle d'hôtel depuis le fichier correspondant
const { Kafka } = require('kafkajs');

// Chargement du fichier hotel.proto
const hotelProtoPath = 'hotel.proto';
const hotelProtoDefinition = protoLoader.loadSync(hotelProtoPath, {
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
// Chargement de la définition proto de l'hôtel
const hotelProto = grpc.loadPackageDefinition(hotelProtoDefinition).hotel;

// URL de connexion MongoDB
const url = 'mongodb://localhost:27017/hotelsDB';

// Connexion à MongoDB
mongoose.connect(url)
    .then(() => {
        console.log('Connecté à la base de données !');
    }).catch((err) => {
        console.log(err);
    });

// Définition des méthodes du service gRPC pour les hôtels
const hotelService = {
    // Méthode pour obtenir un hôtel par ID
    getHotel: async (call, callback) => {
        await producer.connect();

        try {
            const HotelId = call.request.hotel_id;
            const hotel = await Hotel.findOne({ _id: HotelId }).exec();
            
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: 'hotel trouvé avecc id : '+HotelId.toString() }],
            });



            if (!hotel) {
                callback({ code: grpc.status.NOT_FOUND, message: 'hôtel non trouvé' });
                return;
            }
            callback(null, { hotel });
            
        } catch (error) {
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: `hotel non trouvé :  ${error}` }],
            });

            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la récupération de l\'hôtel' });
        }
    },

    // Méthode pour rechercher des hôtels
    searchHotels: async(call, callback) => {
        try {
            const hotels = await Hotel.find({}).exec(); // Recherche de tous les hôtels
            await producer.connect();
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: 'recherche hotel' }],
            });

            
            callback(null, { hotels }); // Retourne les hôtels trouvés
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: 'Une erreur s\'est produite lors de la recherche des hôtels: ${error}' }],
            });

            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la récupération des hôtels' }); // Erreur interne
        }
    },

    // Méthode pour ajouter un nouvel hôtel
    addHotel: async (call, callback) => {
        const { name, description, address, amenities,rooms } = call.request; // Extraction des paramètres de la demande
        const newHotel = new Hotel({ name, description, address, amenities,rooms }); // Création d'une nouvelle instance d'hôtel

        try {
            const savedHotel = await newHotel.save(); // Enregistrement du nouvel hôtel dans la base de données
            callback(null, { hotel: savedHotel }); // Retourne l'hôtel enregistré
            
            await producer.connect();

            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: JSON.stringify(newHotel) }],
            });

            await producer.disconnect();

        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: `hotel non ajouté ( erreur ) : ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de l\'ajout de l\'hôtel' }); // Erreur interne
        }
    },

    // Méthode pour mettre à jour un hôtel
    updateHotel: async (call, callback) => {
        try {
            const { id, name, description, address, amenities, rooms } = call.request;
            const _id=id;
            // Mettre à jour l'hôtel dans la base de données
            const updatedHotel = await Hotel.findByIdAndUpdate(_id, {
                name: name,
                description: description,
                address: address,
                amenities: amenities,
                rooms: rooms
            }, { new: true }); // Utilisez { new: true } pour renvoyer l'hôtel mis à jour plutôt que l'ancien
            await producer.connect();
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: JSON.stringify(updatedHotel) }],
            });
            await producer.disconnect();
            // Vérifier si l'hôtel existe
            if (!updatedHotel) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Hôtel non trouvé' });
                return;
            }
            // Renvoyer la réponse avec l'hôtel mis à jour
            callback(null, { hotel: updatedHotel });
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: `'Erreur lors de la mise à jour de l\'hôtel  ${error}` }],
            });
            console.error('Erreur lors de la mise à jour de l\'hôtel :', error);
            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la mise à jour de l\'hôtel' });
        }
    },


    // Méthode pour supprimer un hôtel
    deleteHotel: async (call, callback) => {
        try {
            const HotelId = call.request.hotel_id;
            const hotel = await Hotel.findOneAndDelete({ _id: HotelId }).exec();
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: 'Hotel supprimé : id  : '+HotelId.toString() }],
            });



            if (!hotel) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Hôtel non trouvé' });
                return;
            }
            callback(null, { message: 'Hôtel supprimé avec succès' });
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'hotel_topic',
                messages: [{ value: `Erreur en supprimant  hotel: ${error}` }],
            });

            callback({ code: grpc.status.INTERNAL, message: 'Une erreur s\'est produite lors de la suppression de l\'hôtel' });
        }
    }
};

// Création du serveur gRPC
const server = new grpc.Server();
server.addService(hotelProto.HotelService.service, hotelService); // Ajout du service d'hôtel au serveur

const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Échec de la liaison du serveur :', err);
            return;
        }
        console.log(`Le serveur fonctionne sur le port ${port}`);
        server.start(); // Démarrage du serveur
    });

console.log(`Le microservice d'hôtel fonctionne sur le port ${port}`);
