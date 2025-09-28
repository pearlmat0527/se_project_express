// app.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errors: celebrateErrors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler'); // <- centralized handler
const NotFoundError = require('./errors/NotFoundError');

const { login, createUser } = require('./controllers/users');
const { getItems } = require('./controllers/clothingItems');
const usersRouter = require('./routes/users');
const clothingItemsRouter = require('./routes/clothingItems');

const User = require('./models/user'); // ensure unique indexes are built
const { PORT, MONGO_URI } = require('./utils/config'); // centralized config
const { validateSignin, validateSignup } = require('./middlewares/validators');

const app = express();

// ----- Global middleware -----
app.use(cors());
app.use(express.json());
app.use(requestLogger); // log every incoming request

// ----- Public endpoints -----
app.post('/signin', validateSignin, login);
app.post('/signup', validateSignup, createUser);
app.get('/items', getItems); // public list

// ----- Auth gate (everything below is protected) -----
app.use(auth);

// ----- Protected routers -----
app.use('/items', clothingItemsRouter);
app.use('/users', usersRouter);

// ----- 404 catch-all (forward to centralized error handler) -----
app.use((req, res, next) => next(new NotFoundError('Requested resource not found')));

// ----- Error logging & error handlers -----
// log errors after routes, before handlers
app.use(errorLogger);

// celebrate/joi validation errors FIRST
app.use(celebrateErrors());

// centralized error handler LAST
app.use(errorHandler);

// ----- DB connect & start server -----
mongoose.set('autoIndex', true);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => User.init()) // builds unique index on email
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB / index init failed:', err);
    process.exit(1);
  });

module.exports = app;
