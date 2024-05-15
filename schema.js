const typeDefs = `#graphql
  type Hotel {
    id: ID!
    name: String!
    description: String!
    address: String!
    amenities: [String!]!
    rooms: [Room!]!
  }

  type Room {
    id: ID!
    type: String!
    price_per_night: Float!
    available: Boolean!
  }

  type Reservation {
    id: ID!
    customer_id: String!
    reservation_date: String!
    check_in_date: String!
    check_out_date: String!
    room_type: String!
  }

  type Query {
    hotel(id: ID!): Hotel
    hotels: [Hotel]
    reservation(id: ID!): Reservation
    reservations: [Reservation]
    addHotel(name: String!, description: String!, address: String!, amenities: [String!]!, rooms: [RoomInput!]!): Hotel
    addReservation(customer_id: String!, reservation_date: String!, check_in_date: String!, check_out_date: String!, room_type: String!): Reservation
    updateReservation(id:String!,customer_id: String!, reservation_date: String!, check_in_date: String!, check_out_date: String!, room_type: String!): Reservation
    updateHotel(id: ID!, name: String, description: String, address: String, amenities: [String], rooms: [RoomInput]): Hotel
    deleteHotel(id: ID!): DeleteHotelResponse
    deleteReservation(id: ID!): deleteReservationResponse

  }


  input RoomInput {
    id: ID!
    type: String!
    price_per_night: Float!
    available: Boolean!
  }

  type DeleteHotelResponse {
    message: String!
  }

  type deleteReservationResponse {
    message: String!
  }
`;

module.exports = typeDefs;
