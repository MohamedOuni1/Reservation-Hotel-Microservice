const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les réservations et les hôtels
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

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        // Résolveur pour obtenir un hôtel par son ID
        hotel: (_, { id }) => {
            // Effectuer un appel gRPC au microservice d'hôtels
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getHotel({ hotel_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.hotel);
                    }
                });
            });
        },
        // Résolveur pour obtenir tous les hôtels
        hotels: () => {
            // Effectuer un appel gRPC au microservice d'hôtels
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchHotels({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.hotels);
                    }
                });
            });
        },
        // Résolveur pour supprimer un hôtel par son ID
        deleteHotel: (_, { id }) => {
            // Effectuer un appel gRPC au microservice d'hôtels
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.deleteHotel({ hotel_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ message: response.message });
                    }
                });
            });
        },
        // Résolveur pour supprimer une réservation par son ID
        deleteReservation: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de réservations
            const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.deleteReservation({ reservation_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ message: response.message });
                    }
                });
            });
        },
        // Résolveur pour mettre à jour un hôtel par son ID
        updateHotel: (_, { id, input }) => {
            // Effectuer un appel gRPC au microservice d'hôtels pour mettre à jour l'hôtel correspondant à l'ID donné
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.updateHotel({
                    hotel_id: id,
                    name: input.name,
                    description: input.description,
                    address: input.address,
                    amenities: input.amenities,
                    rooms: input.rooms,
                }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.hotel);
                    }
                });
            });
        },
        // Résolveur pour mettre à jour une réservation par son ID
        updateReservation: (_, { id, customer_id, reservation_date, check_in_date, check_out_date, room_type }) => {
            // Effectuer un appel gRPC au microservice de réservations pour mettre à jour la réservation correspondant à l'ID donné
            const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.updateReservation({
                    id: id,
                    customer_id: customer_id,
                    reservation_date: reservation_date,
                    check_in_date: check_in_date,
                    check_out_date: check_out_date,
                    room_type: room_type,
                }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reservation);
                    }
                });
            });
        },
        // Résolveur pour ajouter un nouvel hôtel
        addHotel: (_, { name, description, address, amenities, rooms }) => {
            // Effectuer un appel gRPC au microservice d'hôtels pour ajouter un nouvel hôtel
            const client = new hotelProto.HotelService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addHotel({
                    name: name,
                    description: description,
                    address: address,
                    amenities: amenities,
                    rooms: rooms,
                }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.hotel);
                    }
                });
            });
        },
        // Résolveur pour obtenir une réservation par son ID
        reservation: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de réservations
            const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getReservation({ reservation_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reservation);
                    }
                });
            });
        },
        // Résolveur pour obtenir toutes les réservations
        reservations: () => {
            // Effectuer un appel gRPC au microservice de réservations
            const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchReservations({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reservations);
                    }
                });
            });
        },
        // Résolveur pour ajouter une nouvelle réservation
        addReservation: (_, { customer_id, reservation_date, check_in_date, check_out_date, room_type }) => {
            // Effectuer un appel gRPC au microservice de réservations pour ajouter une nouvelle réservation
            const client = new reservationProto.ReservationService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addReservation({
                    customer_id: customer_id,
                    reservation_date: reservation_date,
                    check_in_date: check_in_date,
                    check_out_date: check_out_date,
                    room_type: room_type,
                }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reservation);
                    }
                });
            });
        },
    },
};

module.exports = resolvers;
