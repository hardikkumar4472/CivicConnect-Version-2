import SectorHead from '../models/SectorHead.js';
export const isSectorHead = async (req, res, next) => {
  try {
    const user = await SectorHead.findById(req.user.id);
    if (user) return next();
    return res.status(403).json({ message: 'Access denied: Sector Heads only' });
  } catch (err) {
    return res.status(500).json({ message: 'Role check failed' });
  }
};
