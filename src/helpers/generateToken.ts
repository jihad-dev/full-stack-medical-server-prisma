import jwt, { Secret } from 'jsonwebtoken';

// একটি reusable ফাংশন যা যেকোনো payload দিয়ে টোকেন তৈরি করে
export const generateToken = (
  payload: any,             // যে ডেটা টোকেনে থাকবে
  secret: Secret,           // সাইন করার গোপন চাবি
  expiresIn: string         // মেয়াদ (যেমন: "1h", "7d", "30m")
) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export const verifyToken = (token: string, secret: Secret) => {
 return jwt.verify(
    token,
    secret
  ) as jwt.JwtPayload;
}