import jwt from 'jsonwebtoken';
import Citizen from '../models/Citizen.js';

const authCitizen = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const citizen = await Citizen.findById(decoded.id);

    if (!citizen) return res.status(401).json({ message: 'Citizen not found' });

    req.citizen = citizen; 
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authCitizen;
