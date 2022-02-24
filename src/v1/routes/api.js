const moment = require('moment');
const router = require('express-promise-router')();
const logger = log4js.getLogger(`GH-WEBHOOKER:${require('path').parse(module.filename).name}`);
const WebhookManager = require('../lib/webhookmgr');

const webhooks = {};

Object.keys(config.webhookMapping).forEach(key => {
    webhooks[key] = new WebhookManager(config.webhookMapping[key].id, config.webhookMapping[key].token)
});

router.post('/ghwh', async (req, res, next) => {
    let data = req.body;
    let webhookData = config.webhookMapping[data.repository.name];
    if (!data.commits || !webhookData || data.ref != 'refs/heads/master') {
        res.status(500).end({ error: "wrong ref or data", commits: data.commits, webhookData, ref: data.ref });
        return;
    }
    let webhook = webhooks[data.repository.name];
    if (!webhook) {
        res.status(500).end({ error: "webhook not found", commits: data.commits, webhookData, ref: data.ref });
        return;
    }
    for (i in data.commits) {
        let commit = data.commits[i];
        if (commit.message.includes('Merge'))
            continue;
        let hookBody = {
            username: commit.author.name,
            content: moment(commit.timestamp).format('MMMM Do YYYY, h:mm:ssa') + ' - ' + commit.message,
        };
        if (data.sender && data.sender.avatar_url)
            hookBody.avatar_url = data.sender.avatar_url;
        logger.info('Posting to ' + webhookData.id + ' - ' + webhookData.token);
        logger.info(hookBody);
        try {
            webhook.addToQueue(hookBody);
        } catch(e) {
            logger.error(e);
        }
        webhook.startWebhookSending();
    }
    res.status(200).end();
});

module.exports = router;
