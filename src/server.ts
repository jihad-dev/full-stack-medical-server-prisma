import { Server } from "http";
import dotenv from 'dotenv';
import app from "./app";
import config from "./config";

dotenv.config();

async function main() {
    const server: Server = app.listen(config.port, () => {
        console.log('server is running..............', config.port)
    })
}
main()