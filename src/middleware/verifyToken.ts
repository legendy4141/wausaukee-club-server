import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Middleware to verify the JWT token
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Extract token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach the decoded data (e.g., customer_id) to the request object
    req.user = decoded;
    next();  // Pass control to the next middleware or route handler
  });
};

export default verifyToken;