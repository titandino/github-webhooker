const axios = require('axios');
const moment = require('moment');
const router = require('express-promise-router')();
const logger = log4js.getLogger(`GH-WEBHOOKER:${require('path').parse(module.filename).name}`);

router.post('/ghwh', async (req, res, next) => {
    let data = req.body;
    let webHookUrl = config.webhookMapping[data.repository.name];
    if (!data.commits || !webHookUrl || data.ref != 'refs/heads/master') {
        res.status(500).end({ commits: data.commits, webhookUrl, ref: data.ref });
        return;
    }
    for (i in data.commits) {
        let commit = data.commits[i];
        if (commit.message.includes('Merge'))
            return;
        let hookBody = {
            username: commit.author.name,
            content: moment(commit.timestamp).format('MMMM Do YYYY, h:mm:ssa') + ' - ' + commit.message,
        };
        if (data.sender && data.sender.avatar_url)
            hookBody.avatar_url = data.sender.avatar_url;
        logger.info('Posting to ' + webHookUrl);
        logger.info(hookBody);
        await axios.post(webHookUrl, hookBody);
    }
    res.end(200);
});

module.exports = router;
