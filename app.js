
const winston = require('winston')
const debug = require('debug')('App');
const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

// ****** Testing errors *****
// throw new Error('Something failed during startup');

// const p = Promise.reject(new Error('Something failed miserably!'));
// p.then(() => console.log("Done"))

// WYłączenie i włączenie MongoDB z poziomu konsoli cmd*
// net start|stop mongodb
// *w celu przetestowania błędu "500 Internal Server Error"

// ****** END ******


const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;

// ****** Configuration ******

// Wyświetli inne dane w zależnoći od ustawienia w zmiennej NODE_ENV wartości production lub development (zmienne znajdują się w pliku .env (używam tego pliku ponieważ mój komp nie che tworzyć zmiennych środowiskowych z terminala...))
// debug('Application Name: ' + config.get('name'));
// debug('Mail server: ' + config.get('mail.host'));
// debug('mail password: ' + config.get('mail.password'));

// ****** END ******