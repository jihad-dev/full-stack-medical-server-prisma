import express, { Application, Request, Response } from 'express';
import cors from 'cors'
import router from './app/routes';
import { notFound } from './app/middlewares/NotFound';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import cookieParser from 'cookie-parser'
const app: Application = express();
app.use(cors());
app.use(cookieParser())
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
	res.send('server is running');
});


app.use('/api/v1', router)
app.use(globalErrorHandler);
app.use(notFound)

export default app;