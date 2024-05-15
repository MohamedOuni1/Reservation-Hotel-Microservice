const express = require('express');
const { ApolloServer } = require('@apollo/server');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { expressMiddleware } = require('@apollo/server/express4');
const { Kafka } = require('kafkajs');

// Chargement des fichiers proto pour les réservations et les hôtels
const reservationProtoPath = 'reservation.proto';
const hotelProtoPath = 'hotel.proto';

const reservationProtoDefinition = protoLoader.loadSync(reservationProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const hotelProtoDefinition = protoLoader.loadSync(hotelProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const reservationProto = grpc.loadPackageDefinition(reservationProtoDefinition).reservation;
const hotelProto = grpc.loadPackageDefinition(hotelProtoDefinition).hotel;


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'] 
});

const consumer = kafka.consumer({ groupId: 'api-gateway-consumer' });

consumer.subscribe({ topic: 'reservation_topic' });
consumer.subscribe({ topic: 'hotel_topic' });

(async () => {
    await consumer.connect();
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value.toString()}, from topic: ${topic}`);
        },
    });
})();



// Créer une nouvelle application Express
const app = express();

// Configuration du serveur Apollo GraphQL
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const server = new ApolloServer({ typeDefs, resolvers });

// Démarrage du serveur Apollo
server.start().then(() => {
    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
    );
});

// Middleware pour CORS et bodyParser pour les requêtes RESTful
app.use(cors());
app.use(bodyParser.json());

// Configuration des routes Express pour les requêtes RESTful

// Récupérer tous les hôtels
app.get('/hotel', (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    client.searchHotels({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.hotels);
        }
    });
});

// Récupérer un hôtel spécifique par son ID
app.get('/hotel/:id', (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getHotel({ hotel_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.hotel);
        }
    });
});


// Ajouter un nouvel hôtel
app.post('/hotel/add', (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    const data = req.body;
    const { name, description, address, amenities, rooms } = data;

    client.addHotel({ name, description, address, amenities, rooms }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.hotel);
        }
    });
});


// Mettre à jour un hôtel par son ID
app.put('/hotel/update/:id', async (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    const id = req.params.id;
    const data = req.body;
    try {
        // Envoi de la requête de mise à jour au service gRPC
        client.updateHotel({ 
            id: id,
            name: data.name,
            description: data.description,
            address: data.address,
            amenities: data.amenities,
            rooms: data.rooms,
        }, (err, response) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(response.hotel);
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Supprimer un hôtel par son ID
app.delete('/hotel/:id', (req, res) => {
    const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
    const id = req.params.id;

    client.deleteHotel({ hotel_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ message: `Hôtel avec l'ID ${id} supprimé avec succès` });
        }
    });
});


// Mettre à jour une réservation par son ID
app.put('/reservation/update/:id', async (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());

    const id = req.params.id;
    const data = req.body;
    try {
        // Envoi de la requête de mise à jour au service gRPC
        client.updateReservation({ 
            id: id,
            customer_id:data.customer_id,
            reservation_date: data.reservation_date,
            check_in_date: data.check_in_date,
            room_type: data.room_type,
        }, (err, response) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(response.reservation);
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Récupérer toutes les réservations
app.get('/reservation/:id', (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getReservation({ reservation_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reservation);
        }
    });
});

// Ajouter une nouvelle réservation
app.post('/reservation/add', (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
    const data = req.body;
    const { customer_id, reservation_date, check_in_date, check_out_date, room_type } = data;

    client.addReservation({ customer_id, reservation_date, check_in_date, check_out_date, room_type }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reservation);
        }
    });
});

// Récupérer une réservation spécifique par son ID
app.get('/reservation', (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
    client.searchReservations({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reservations);
        }
    });
});



// Supprimer une réservation par son ID
app.delete('/reservation/:id', (req, res) => {
    const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
    const id = req.params.id;

    client.deleteReservation({ reservation_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ message: `Réservation avec l'ID ${id} supprimée avec succès` });
        }
    });
});

// Démarrage de l'application Express
const port = 3000;
app.listen(port, () => {
    console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});
