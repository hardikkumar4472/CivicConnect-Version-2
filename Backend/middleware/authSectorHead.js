// import jwt from 'jsonwebtoken';
// import SectorHead from '../models/SectorHead.js';

// const authSectorHead = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) return res.status(401).json({ message: 'No token' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const sectorHead = await SectorHead.findById(decoded.id);
//     if (!sectorHead) return res.status(401).json({ message: 'Not authorized' });

//     req.sectorHead = sectorHead; 
//     next();
//   } catch (err) {
//     console.error('Sector Head Auth Error:', err);
//     res.status(401).json({ message: 'Token verification failed' });
//   }
// };

// export default authSectorHead;

// import jwt from 'jsonwebtoken';
// import SectorHead from '../models/SectorHead.js';

// const authSectorHead = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const sectorHead = await SectorHead.findById(decoded.id);
//     if (!sectorHead) return res.status(401).json({ message: 'Not authorized' });

//     req.user = { id: sectorHead._id }; 
//     next();
//   } catch (err) {
//     console.error('Sector Head Auth Error:', err);
//     res.status(401).json({ message: 'Token verification failed' });
//   }
// };

// export default authSectorHead;

import jwt from 'jsonwebtoken';
import SectorHead from '../models/SectorHead.js';

const authSectorHead = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const sectorHead = await SectorHead.findById(decoded.id);
    if (!sectorHead) return res.status(401).json({ message: 'Not authorized' });

    // Attach full info for role checks in routes
    req.user = { id: sectorHead._id, role: decoded.role }; 

    next();
  } catch (err) {
    console.error('Sector Head Auth Error:', err);
    res.status(401).json({ message: 'Token verification failed' });
  }
};

export default authSectorHead;
