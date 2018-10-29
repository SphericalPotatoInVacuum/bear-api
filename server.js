// Import all needed modules

const express = require('express');
const helmet = require('helmet');
const config = require('config');
const Joi = require('joi');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bearRoutes = require('./routes/bear');
const app = express();

// Set our port

const port = process.env.port | 3000;

// Apply all needed middleware

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Enable logging if in debug mode

if (app.get('env') == 'development') {
    app.use(morgan('tiny'));
    console.log('Morgan enabled');
}

// Connect to mongo database with mongoose

mongoose.connect(config.get('database-host'))
    .then(() => console.log('Connected to mongo db'))
    .catch(err => console.error('Connection to mongo db failed'));

app.use('/api/bears/', bearRoutes);

app.listen(port, () => {
    console.log('We are live on port ' + port);
});