import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_secret: process.env.JWT_SECRET as string,
  reset_password_token: process.env.RESET_PASSWORD_TOKEN,
  reset_password_expires_in: process.env.RESET_PASSWORD_EXPIRES_IN,
  reset_password_link: process.env.RESET_PASSWORD_LINK,
  email: process.env.EMAIL,
  app_password: process.env.APP_PASSWORD,
  ssl: {
    store_id: process.env.STORE_ID,
    store_pass: process.env.STORE_PASS,
    success_url: process.env.SUCCESS_URL,
    fail_url: process.env.FAIL_URL,
    cancel_url: process.env.CANCEL_URL,
    ssl_payment_api: process.env.SSL_PAYMENT_API,
    ssl_validate_api: process.env.SSL_VALIDATE_API,
  },
};
