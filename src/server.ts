import { Server } from "http";
import dotenv from 'dotenv';
import app from "./app";
const port = 3000;
dotenv.config();

async function main() {
    const server: Server = app.listen(port, () => {
        console.log('server is running..............', port)
    })
}
main()