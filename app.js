import path from 'path';
import cookieParser from 'cookie-parser';
import express from 'express';
import httpErrors from 'http-errors';
import logger from 'morgan';
import sassMiddleware from 'node-sass-middleware';

import handleRouters from 'routes/index';

const app = express();

app.set('views', path.join(__dirname, 'views'));
// view engine setup
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true,
  }),
);
app.use(express.static(path.join(__dirname, 'public')));

handleRouters(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
