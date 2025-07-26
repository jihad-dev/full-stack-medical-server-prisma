
import { Response } from 'express';

type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  
};

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  res.status(data.statusCode).json(data);
};
