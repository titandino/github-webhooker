const EventEmitter = require('events');
const axios = require('axios');

/**
 * Discord Webhook Manager
 * @author Bsian <bsian@staff.libraryofcode.org>
 * @note Initialise a new instance of the Webhook Manager for each webhook
 */
class WebhookManager extends EventEmitter {
  constructor(webhookID, webhookToken, interval = 2000) {
    super();
    if (!webhookID || !webhookToken) throw new TypeError('Expected Webhook ID and Webhook Token');
    this.url = `https://discordapp.com/api/webhooks/${webhookID}/${webhookToken}`;
    this.interval = interval;
    this.queue = [];
    this.rateLimiter = [];
    this.enabled = true;

    setInterval(() => { this.rateLimiter = this.rateLimiter.filter((d) => new Date(Date.now() - 2000) < d); });

    setInterval(async () => {
      try {
        if (this.rateLimiter.length >= 30 || !this.queue.length || this.enabled) return;
        const body = this.queue[0];
        try {
					await axios.post(this.url, body);
          this.queue.shift();
        } catch (error) {
          if (error.response.status !== 429 && error.response.status !== 500) this.rateLimiter.push(new Date());
          let errorMessage = `${error.response.response.status} ${error.response.message}: ${error.response.data}`;
          if (error.response.status === 429) errorMessage += 'Rate limit failed.';
          else if (error.response.status === 401 || error.response.status === 403 || error.response.status === 404) {
						errorMessage = `${error.response.status} ${error.response.data}`;
          }
          this.emit('error', [errorMessage, error]);
          return;
        }
        this.rateLimiter.push(new Date());
      } catch (error) {
        this.emit('error', 'Unknown error occured', error);
      }
    }, this.interval);
  }

  addToQueue(body) {
    this.queue.push(body);
    return this.queue;
  }

  emptyQueue() {
    this.queue = [];
    return this.queue;
  }

  resetRateLimit() {
    this.rateLimiter = [];
    return this.rateLimiter;
  }

  updateWebhook(webhookID, webhookToken) {
    this.url = `https://discordapp.com/api/webhooks/${webhookID}/${webhookToken}`;
    return this.url;
  }

  pauseWebhookSending() {
    this.enabled = false;
    return this.enabled;
  }

  startWebhookSending() {
    this.enabled = true;
    return this.enabled;
  }

  stopWebhookSending() {
    this.enabled = false;
    this.queue = [];
    return this.enabled;
  }
}

module.exports = WebhookManager;