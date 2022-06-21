/* ----------------------------------- */
/* Module dependencies and env setup */
/* ----------------------------------- */
require('dotenv').config();
const path = require('path');
const express = require('express');

console.log("ENV====>", process.env.NODE_ENV)
/* ----------------------------------- */
/* Initiating Database connection */
/* ----------------------------------- */
// require('./models/index');

const app = express();

/* Registering required middlewares */
/* ----------------------------------- */
// Request / Response patchers / Functionality enhancers
app.use(require('./middlewares/cors-handler'));
// app.use(require('./middlewares/sentry-request-handler'));
app.use(require('./middlewares/body-parser'));
app.use(require('./middlewares/nocache'));
// Client related middlewares
app.use(require('./middlewares/favicon'));
app.use(require('./middlewares/robots'));
// Server/API related middlewares
app.use(require('./middlewares/api-headers'));
app.use(require('./middlewares/ip-handler'));
app.use(require('./middlewares/access-log'));

app.use('/public', express.static(path.join(__dirname, 'public')));

/* ----------------------------------- */
/* Initiating API Routes */
/* ----------------------------------- */
app.use('/', require('./routes/api'));
/* ----------------------------------- */

/* ----------------------------------- */
/* Initialising server on given port */
/* ----------------------------------- */
const port = process.env.PORT || 5000;
app.listen(port, async () => {
  console.log('Server is running on port:' + port);
});

module.exports = {app};