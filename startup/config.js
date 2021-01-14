require('dotenv').config();
const config = require("config");

module.exports = function () {
    if (!config.get('jwtPrivateKey')) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
    }
}

// Best Practice - Używając throw new Error - mamy dostęp do stosu 
// ale przy throw 'error' - nie mamy dostępu do stosu