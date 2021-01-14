const winston = require('winston');
const { format, transports } = require("winston");
const { combine, timestamp, printf } = format;
require('winston-mongodb');
require('express-async-errors');
require('dotenv').config();
const config = require("config");

module.exports = function () {
    process.on("unhandledRejection", ex => {
        throw ex;
    });
    
    winston.createLogger({
        level: 'info',
        format: combine(
            format.errors({ stack: true }),
            timestamp(),
            printf(({ level, message, timestamp, stack }) => {
            return `${timestamp} ${level}: ${message} - ${stack}`;
            })
        ),
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                format: winston.format.combine(
                    winston.format.json(),
                    winston.format.prettyPrint(),
                    winston.format.colorize()
                )
            }),
            new winston.transports.File({
                filename: "logfile.log",
                level: 'info',
                format: format.combine(
                    format.colorize({ all: false })
                ),
                handleRejections: true,

            }),
            new winston.transports.MongoDB({
                db: config.get('db'),
                options: { useUnifiedTopology: true },
                level: 'info',
                storeHost: true,
                capped: true,
                // handleExceptions: true,
            })
        ],
        exceptionHandlers: [
            new transports.File({
                filename: 'uncaughExceptions.log',
                handleRejections: true
            })
        ],
    })

    winston.add(
        new winston.transports.File({
            filename: 'logfile.log',
            level: 'info',
            handleRejections: true,
            format: combine(
                format.errors({ stack: true }),
                timestamp(),
                printf(({ level, message, timestamp, stack }) => {
                    if (stack) {
                        return `${timestamp} ${level}: ${message} - ${stack}`;
                    } else {
                        return `${timestamp} ${level}: ${message}`;
                    }
                }),
                format.metadata()
            )
        })
    )
}




// *** Wersja z process.on ***

// module.exports = function () {
//     process.on('uncaughtException', ex => {
//         logger.error(ex, () => {
//             process.exit(1);
//         })
//         // W zwykłej fukncji dodamy:
//         // res.status(500).json(err.message);
//     })

//     process.on('unhandledRejection', ex => {
//         logger.error(ex, () => {
//             process.exit(1);
//         })
//         // W zwykłej fukncji dodamy:
//         // res.status(500).json(err.message);
//     })

//     const logger = winston.createLogger({
//         level: 'info',
//         format: combine(
//             format.errors({ stack: true }),
//             timestamp(),
//             printf(({ level, message, timestamp, stack }) => {
//             return `${timestamp} ${level}: ${message} - ${stack}`;
//             }),
//             format.metadata()
//         ),
//         transports: [
//             new winston.transports.File({
//                 filename: "logfile.log",
//                 format: format.combine(
//                     format.colorize({
//                     all: false,
//                     })
//                 ),
//             }),
//             new winston.transports.MongoDB({
//                 db: config.get('db'),
//                 options: { useUnifiedTopology: true },
//                 level: 'info',
//                 storeHost: true,
//                 capped: true,
//                 handleExceptions: true,
//             })
//         ]
//     })
// }