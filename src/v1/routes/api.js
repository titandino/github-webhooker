const axios = require('axios');
const moment = require('moment');
const router = require('express-promise-router')();

router.post('/ghwh', async (req, res, next) => {
    let data = req.body;
    let webHookUrl = config.webhookMapping[repository.name];
    if (webHookUrl && data.ref != 'refs/heads/master')
        return;
    data.commits.forEach(commit => {
        if (commit.message.includes('Merge'))
            return;
        let hookBody = {
            username: commit.author.name,
            content: moment(commit.timestamp).format('MMMM Do YYYY, h:mm:ssa') + ' - ' + commit.message,
        };
        if (data.sender && data.sender.avatar_url)
            hookBody.avatar_url = data.sender.avatar_url;
        axios({method: 'POST', url: webHookUrl, data: hookBody});
    });
});

module.exports = router;
