const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const EJS = require('ejs');
const cors = require('cors');
const app = express();
const noCache = require('nocache');

const config = require('./config');
const crudSession = require('./modules/crudSession');
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = config.LOG_LEVEL;

app.use(cors());
app.use(compression());
app.use(helmet());
app.use(noCache());
app.use(bodyParser.json({ limit: 1024 * 1024 * 50 }));
app.use(bodyParser.urlencoded({ limit: 1024 * 1024 * 50, extended: true }));
app.use(function (req, res, next) {
  res.set("Content-Security-Policy", "default-src *;img-src * 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *;style-src  'self' 'unsafe-inline' *");
  next();
});

app.use(/\/(api|user)\/(.+)/, log4js.connectLogger(logger, { level: 'info', format: config.logFormat, nolog: '/app/status' }));

app.all('/app/status', (req, res) => res.json({ status: 'OK' }));
app.get('/init', (req, res) => res.json({
  config: {
    REST_URL: config.REST_URL,
    RC_REST_URL: config.RC_REST_URL
  }
}))
app.use('/api', require('./middlewares/Auth'), require('./controllers/gateway'));
app.use('/user', require('./controllers/user'));

app.use(function (err, req, res, next) {
  if (!err) {
    return next();
  }
  logger.error(err.stack || err);
  if (err.isAxiosError) {
    return res.status((err.response.status || 500)).json(err.response.data);
  }
  return res.status(500).json({ message: err.message });
});

app.engine('html', EJS.renderFile);

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


// Middleware for handle axiosError
app.use(function (err, req, res, next) {
  if (!err) {
    return next();
  }
  logger.error(err.stack || err);
  if (err.isAxiosError) {
    return res.status((err.response.status || 500)).json(err.response.data);
  }
  return res.status(500).json({ message: err.message });
});


crudSession.init()
  .then((result) => {
    app.listen(config.PORT, function () {
      logger.info('Server is listening on port ' + config.PORT);
    }).keepAliveTimeout = 0;
  })
  .catch((err) => {
    logger.error(err);
  });

process.on('uncaughtException', function (err) {
  logger.error(err);
});