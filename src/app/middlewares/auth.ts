

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../helpers/generateToken';
import config from '../../config';
const auth = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).json({ message: 'Unauthorized: No or malformed token' });
            return;
        }
        try {
            const decoded = verifyToken(token, config.jwt_secret as string);

            if (!decoded?.role || !roles.includes(decoded.role)) {
                res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
                return;
            }
            next();
        } catch (err) {
            next(err)
        }
    };
};

export default auth;
