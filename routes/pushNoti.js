import { Router } from 'express';
import sendJson from 'utils/sendJson';
import { sendMessageToMultipleDevice } from 'services/pushNotification';
const router = Router();

/* GET index page. */
router.post('/', async (req, res) => {
  const { deviceTokens, notification } = req.body;
  try {
    const response = await sendMessageToMultipleDevice({
      deviceTokens,
      notification,
    });
    sendJson({
      res,
      message: 'received',
      data: { deviceTokens, notification, response },
    });
  } catch (error) {
    sendJson({
      status: 400,
      res,
      data: { error },
    });
  }
});

export default router;
