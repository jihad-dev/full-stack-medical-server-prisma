import jwt, { Secret } from 'jsonwebtoken';
// একটি reusable ফাংশন যা যেকোনো payload দিয়ে টোকেন তৈরি করে
export const generateToken = (
  payload: object,                  // টোকেনে রাখা ডেটা
  secret: string,                    // JWT secret
  expiresIn: string | number         // মেয়াদ
): string => {
  return jwt.sign(payload, secret, { expiresIn });
};


export const verifyToken = (token: string, secret: Secret) => {
 return jwt.verify(
    token,
    secret
  ) as jwt.JwtPayload;
}

