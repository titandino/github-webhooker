global.log4js = require('log4js');
global.log4js.configure({
    appenders: { console: { type: 'console', layout: { type: 'colored' }}},
    categories: { default: { appenders: ['console'], level: 'debug' }}
});

const logger = log4js.getLogger(`GH-WEBHOOKER:${require('path').parse(module.filename).name}`);
logger.level = 'all';

let args = require('yargs').argv;
let configPath = process.env.CONFIG_FILE || args.c || '../config.json';
global.config = require(configPath);

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const errors = require('./v1/lib/errors');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', require('./v1/routes/api'));

app.use(errors);

app.listen(3000, () => {
    logger.log('Started server.');
});