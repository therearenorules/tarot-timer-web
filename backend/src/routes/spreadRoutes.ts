import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getSpreads,
  getSpreadById,
  createSpread,
  updateSpread,
  deleteSpread
} from '../controllers/spreadController';

const router = Router();

// All spread routes require authentication
router.use(authenticateToken);

// Spread CRUD operations
router.get('/', getSpreads);           // GET /api/spreads
router.get('/:id', getSpreadById);     // GET /api/spreads/:id
router.post('/', createSpread);        // POST /api/spreads
router.put('/:id', updateSpread);      // PUT /api/spreads/:id
router.delete('/:id', deleteSpread);   // DELETE /api/spreads/:id

export default router;