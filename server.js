import fastify from "fastify";
import http from "http";
import { Server } from "socket.io";
import { config } from "./config/index.js";

const app = fastify();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let summonersData = {
  defaultServer: {
    users: ["Default"],
    roles: {
      TOP: {
        isFlashed: false,
        lucidityBoots: false,
        cosmicInsight: false,
      },
      JUNGLE: {
        isFlashed: false,
        lucidityBoots: false,
        cosmicInsight: false,
      },
      MID: {
        isFlashed: false,
        lucidityBoots: false,
        cosmicInsight: false,
      },
      SUPPORT: {
        isFlashed: false,
        lucidityBoots: false,
        cosmicInsight: false,
      },
      ADC: {
        isFlashed: false,
        lucidityBoots: false,
        cosmicInsight: false,
      },
    },
  },
};

// Configuration des événements Socket.io
io.on("connection", (socket) => {
  console.log("Nouvelle connexion :", socket.id);

  socket.on("join-room", (room, username) => {
    try {
      socket.join(room);
      socket.username = username; // Stocker le nom d'utilisateur dans l'objet socket

      if (!summonersData[room]) {
        summonersData[room] = { ...summonersData.defaultServer, users: [] };
      }
      if (!summonersData[room].users.includes(username)) {
        summonersData[room].users.push(username);
        console.log(`Utilisateur ${username} ajouté à la salle ${room}`);
      } else {
        console.log(
          `L'utilisateur ${username} existe déjà dans la salle ${room}.`
        );
      }
      io.in(room).emit("updateSummonerData", summonersData[room]);
      socket.emit("joined-room", room); // Confirmer que l'utilisateur a rejoint la salle
    } catch (error) {
      console.error(
        `Erreur lors de l'ajout de l'utilisateur ${username} à la salle ${room}: ${error}`
      );
    }
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms);
    console.log(
      `L'utilisateur ${
        socket.username
      } se déconnecte, salles associées: ${rooms.join(", ")}`
    );

    // Le premier élément de rooms est l'ID du socket, donc on l'ignore
    rooms.shift();

    rooms.forEach((room) => {
      if (summonersData[room]) {
        console.log(
          `Avant suppression, utilisateurs dans la salle ${room}: ${summonersData[
            room
          ].users.join(", ")}`
        );

        // Supprimer l'utilisateur de la liste des utilisateurs de la salle
        const index = summonersData[room].users.indexOf(socket.username);
        if (index !== -1) {
          summonersData[room].users.splice(index, 1);
          console.log(
            `Après suppression, utilisateurs dans la salle ${room}: ${summonersData[
              room
            ].users.join(", ")}`
          );

          // Envoyer les données mises à jour à tous dans la salle
          io.in(room).emit("updateSummonerData", summonersData[room]);
        } else {
          console.log(
            `L'utilisateur ${socket.username} n'a pas été trouvé dans la salle ${room}.`
          );
        }
      } else {
        console.log(`La salle ${room} n'existe pas ou n'a pas de données.`);
      }
    });
  });

  socket.on("get-summoners-data", (room) => {
    // Émission des données des invocateurs au client
    socket.emit("updateSummonerData", summonersData[room], room);
  });

  socket.on("updateSummonerData", (data, room) => {
    summonersData = {
      ...summonersData,
      [room]: data,
    };
    socket.in(room).emit("updateSummonerData", summonersData[room]);
  });

  socket.on("show-toast", (role, room) => {
    io.in(room).emit("send-toast", { role }); // Cela enverra à tous dans la salle
  });
});

server.listen(config.PORT, () => {
  console.log(`✔️ Server listening on port ${config.PORT}`);
});
