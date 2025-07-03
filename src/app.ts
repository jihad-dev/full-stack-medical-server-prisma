import express, { Application, Request, Response } from 'express';
import cors from 'cors'
import { userRoutes } from './app/modules/user/user.route';
import { adminRoutes } from './app/modules/Admin/admin.route';

const app: Application = express();
app.use(cors());
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.get('/', (req: Request, res: Response) => {
	res.send('server is running');
});

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/admin', adminRoutes)

export default app;