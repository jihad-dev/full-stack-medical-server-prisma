import { Server } from "http";
import dotenv from "dotenv";
import app from "./app";
import config from "./config";

dotenv.config();

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("server is running..............", config.port);
  });
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
      });
    }
    process.exit(1);
  };
  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler();
  });
}
main();
