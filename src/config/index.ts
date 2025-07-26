import path from "path";
import dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    env: process.env.NODE_ENV,
    port:process.env.PORT,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_secret: process.env.JWT_SECRET

}