
# 🏨 Reservation-Hotel-Microservice 🏨

Reservation hotel Microservice est une application basée sur des microservices construite avec REST , gRPC, GraphQL et Kafka en utilisant MongoDB comme base de données. Le projet est composé de deux  entités : Hotel et Reservation.


## Les Technologies et Les langages utilisés

- 🔵 **Node.js** est un environnement d'exécution JavaScript côté serveur, qui permet aux développeurs de construire des applications Web et des serveurs. 

-  ⚙️ **Restful** est un terme utilisé pour décrire les services Web qui suivent les principes de l'architecture REST (Representational State Transfer).

- 🚀 **gRPC** est un framework RPC (Remote Procedure Call) développé par Google, utilisé pour la communication entre services distribués. 

- 🌐 **GraphQL** est un langage de requête de données développé par Facebook, permettant aux clients de définir la structure des données requises. 

- 🍃 **MongoDB** est un système de gestion de base de données NoSQL, stockant les données sous forme de documents JSON.

-  📨 **Kafka** est un système de messagerie de type publication/abonnement conçu pour remplacer les courtiers de message traditionnels.



![Logo](https://scontent.ftun14-1.fna.fbcdn.net/v/t39.30808-6/441161205_7641878515899976_4998460982839942709_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=5f2048&_nc_ohc=eO43MDdiLR0Q7kNvgEUUDlL&_nc_oc=AdiUy1j_7DYWPONpURSO4ot4vOBdQdvDw2cQ18G5NTVqb-BFeXaWOVY47yeJzsjqu9o&_nc_ht=scontent.ftun14-1.fna&oh=00_AYBlwG7CuTi8x49OFwJ9J5hrHGuC9tYvNpAfM7wW49nkAQ&oe=664B05DE)


## Les tables modéles

### 📅 Table Reservation



| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id`      | `Number` | **Required**|
| `customer_id` | `Number` | **Required**|
| `reservation_date` | `Date` | **Required**|
| `check_in_date` | `Date` | **Required**|
| `check_out_date` | `Date` | **Required**|
| `room_type` | `string` | **Required**|





- *****customer_id***** : l'identifiant du client effectuant la réservation .

- *****reservation_date*****  : la date à laquelle la réservation a été effectuée .

- *****check_in_date***** : la date d'arrivée prévue pour la réservation .

- *****check_out_date***** : la date de départ prévue pour la réservation .

- *****room_type***** : le type de chambre réservée .

### 🏨 Table Hotel



| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `Number` | **Required**|
| `name`      | `string` | **Required**|
| `description`      | `string` | **Required**|
| `address`      | `string` | **Required**|
| `amenities`      | `string` | **Required**|
| `rooms`      | `string` | **Required**|



- *****name***** :le nom de l'hôtel .

- *****description*****  : la description de l'hôtel .

- *****adresse***** : l'adresse de l'hôtel .

- *****amenities***** : une liste des équipements fournis par l'hôtel .

- *****rooms*****  une liste de sous-documents représentant les chambres disponibles dans l'hôtel. 

 Chaque chambre est représentée par un objet avec les champs suivants :

- *****type***** : le type de la chambre .

- *****price_per_night***** : le prix par nuit de la chambre .

- *****available***** : un indicateur booléen indiquant si la chambre est disponible ou non.


## 🛠️ Installation
Téléchargez tous les fichiers, puis installez les dépendances nécessaires.












## 🔍 Pré-requis :

- Node.js **( 20.11.0 )**
- GraphQL **( 16.1.0 )**
- Restful **( 0.4.5 )**
- Kafka   **( 3.7.0 )**



## 🔗 API Endpoints :
### 🏨 Pour Hotel : 


- **GET /hotel :** Récupère tous les hôtels de la base de données. 
- **GET /hotel/:id :** Récupère un hôtel spécifique par son ID. 
- **POST /hotel/add :** Crée un nouvel hôtel dans la base de données. 
- **PUT /hotel/update/:id :** Modifie un hôtel spécifique par son ID. 
- **DELETE /hotel/:id :** Supprime un hôtel spécifique par son ID. 

### 📅 Pour Reservation :
- **GET /reservation :** Récupère toutes les réservations de la base de données. 
- **GET /reservation/:id :** Récupère une réservation spécifique par son ID. 
- **POST /reservation/add :** Crée une nouvelle réservation dans la base de données. 
- **PUT /reservation/update/:id :** Modifie une réservation spécifique par son ID. 
- **DELETE /reservation/:id :** Supprime une réservation spécifique par son ID.

# 🔌 Ports utilisés :


Voici la liste des ports utilisés par chaque service dans l'architecture :

### Le service de gestion des hôtels :

- Port utilisé : **50052**
- Protocole : **gRPC**

### Le service de gestion des réservations :

- Port utilisé : **50051**
- Protocole : **gRPC**

### L'API Gateway :

- Port écouté : **3000**
- Protocoles : **REST et GraphQL**
### Kafka :

- Port écouté : **9092**
- Protocole : **Kafka**




## 🚀 Execution du Projet

Pour démarrer le serveur de l'API Gateway, exécutez la commande suivante : 

`nodemon apiGateway.js`



Pour démarrer le serveur de gestion des hotels , exécutez la commande suivante :

`nodemon hotelMicroservice.js`

Pour démarrer le serveur de gestion des reseervations , exécutez la commande suivante :

`nodemon reservationMicroservice.js`


Exécutez la commande suivante pour démarrer le serveur Zookeeper :

`.\bin\windows\zookeeper-server-start.bat config\zookeeper.properties`

Exécutez la commande suivante pour démarrer le serveur Kafka :

`.\bin\windows\kafka-server-start.bat config\server.properties`

## 👨‍💻 Auteur du projet

- **[Mohamed Ouni](https://www.github.com/mohamedouni1)**

