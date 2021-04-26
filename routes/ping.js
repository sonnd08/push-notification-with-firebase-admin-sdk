import { Router } from 'express';
import sendJson from 'utils/sendJson';

const router = Router();

/* GET index page. */
router.get('/', (req, res) => {
  sendJson({ res, message: 'Pong' });
});

export default router;
