import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "./config/index.js";

// class Timer {
//   constructor(value) {
//     this.timer = value;
//     this.started = false;
//   }
//   update() {
//     // Timer value is of the following format
//     // HH:mm:ss
//     let ss = this.timer.split(":");
//     let dt = new Date();
//     dt.setHours(ss[0]);
//     dt.setMinutes(ss[1]);
//     dt.setSeconds(ss[2]);

//     let newDate = new Date(dt.valueOf() - 1000);
//     if (
//       !newDate.getHours == 0 ||
//       !newDate.getMinutes == 0 ||
//       !newDate.getSeconds == 0
//     ) {
//       var ts = newDate.toTimeString().split(" ")[0];
//       this.timer = ts;
//     }
//   }
// }

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let summonersData = {
  defaultServer: {
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
};

// // 2.
// let timer = new Timer("00:05:00");
// let interval;

// Configuration des événements Socket.io
io.on("connection", (socket) => {
  console.log("Nouvelle connexion :", socket.id);

  socket.on("join-room", (room) => {
    socket.emit("get-summoners-data", room);
    socket.join(room);
  });

  socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
    console.log(socket.rooms.size); // the Set contains at least the socket ID
  });

  // Gestion de l'événement "get-summoners-data"
  socket.on("get-summoners-data", (room) => {
    // Émission des données des invocateurs au client
    socket.emit("updateSummonerData", summonersData[room], room);
  });

  // Gestion de l'événement "updateSummonerData"
  socket.on("updateSummonerData", (data, room) => {
    summonersData = {
      ...summonersData,
      [room]: data,
    };
    socket.in(room).emit("updateSummonerData", summonersData[room]);
  });
});

server.listen(config.PORT, () => {
  console.log(`✔️ Server listening on port ${config.PORT}`);
});
