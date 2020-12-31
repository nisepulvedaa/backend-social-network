'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//cargar rutas
var user_router = require('./routes/user');
var follow_router = require('./routes/follow');
var publication_router = require('./routes/publication');
var messages_router = require('./routes/message');

//cargar middlewares (metodo que se ejecute antes de que llegue a un controlador)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});



//rutas
app.use('/api', user_router);
app.use('/api', follow_router);
app.use('/api', publication_router);
app.use('/api', messages_router);

//exportar

module.exports = app;