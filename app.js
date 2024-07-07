const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const fileRouter = require('./routes/file');

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerConfig'); // Import your Swagger configuration

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Define your routes
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', fileRouter);

// Serve Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

module.exports = app;
