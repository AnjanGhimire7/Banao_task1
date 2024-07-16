import connectDB from "./database/db.js";
import dotenv from "dotenv";
import cluster from "node:cluster";
import os from "node:os";
const totalCpu = os.cpus().length;
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

// To increase performance and to make app scalable we are using clutser
if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} running !!!`);
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
  //suppose when some worker died by any reson it will automatically created another one.
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting ....`);
    cluster.fork();
  });
} else {
  connectDB()
    .then(() => {
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on the port :${process.env.PORT}`);
      });
    })
    .catch((error) => {
      console.log("MongoDb connection failed!!!", error);
    });
  console.log(`Worker process${process.pid} running !!!!`);
}
