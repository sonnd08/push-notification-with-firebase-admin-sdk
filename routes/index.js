import { Router } from 'express';
import pingRoute from 'routes/ping';
import pushNotiRoute from 'routes/pushNoti';
import sendJson from 'utils/sendJson';

const indexRouter = Router();

/* GET index page. */
indexRouter.get('/', (req, res) => {
  sendJson({ res, message: 'OK' });
});

function handleRouters(app) {
  app.use('/', indexRouter);
  app.use('/ping', pingRoute);
  app.use('/push-noti', pushNotiRoute);
}

export default handleRouters;
