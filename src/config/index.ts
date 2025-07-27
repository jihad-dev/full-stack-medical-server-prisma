import path from "path";
import dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_secret: process.env.JWT_SECRET,
    reset_password_token: process.env.RESET_PASSWORD_TOKEN,
    reset_password_expires_in: process.env.RESET_PASSWORD_EXPIRES_IN,

}