const logger = log4js.getLogger(`POS-APP-UPDATER:${require('path').parse(module.filename).name}`);
logger.level = 'warn';

module.exports = function (err, req, res, next) {
    if (err) {
        logger.error(err);
        console.log(err);
        return res.status(err.status || 500).json({msg: err.message} || {msg: 'Bad Request'}).end();
    }
    next();
};