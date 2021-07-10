const axios = require('axios');
const moment = require('moment');
const router = require('express-promise-router')();

router.post('/ghwh', async (req, res, next) => {
    let data = req.body;
    let webHookUrl = config.webhookMapping[data.repository.name];
    if (!data.commits || !webHookUrl || data.ref != 'refs/heads/master') {
        res.end('500');
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
        await axios.post(webHookUrl, hookBody);
    });
    res.end(200);
});

module.exports = router;
