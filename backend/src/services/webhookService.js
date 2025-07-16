const crypto = require('crypto-js');

class WebhookService {
  constructor() {
    this.webhooks = new Map();
  }

  // Register a new webhook
  async registerWebhook(url, events, secret) {
    const id = crypto.SHA256(url + Date.now()).toString();
    this.webhooks.set(id, { url, events, secret });
    return id;
  }

  // Remove a webhook
  async removeWebhook(id) {
    return this.webhooks.delete(id);
  }

  // Sign the payload with the webhook secret
  signPayload(payload, secret) {
    return crypto.HmacSHA256(JSON.stringify(payload), secret).toString();
  }

  // Send webhook notification
  async notify(event, payload) {
    const notifications = [];

    for (const [id, webhook] of this.webhooks) {
      if (webhook.events.includes(event)) {
        const signature = this.signPayload(payload, webhook.secret);
        
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-DeSpy-Signature': signature,
              'X-DeSpy-Event': event
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            console.error(`Webhook delivery failed for ${id}: ${response.statusText}`);
          }

          notifications.push({
            id,
            success: response.ok,
            status: response.status,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`Webhook delivery error for ${id}:`, error);
          notifications.push({
            id,
            success: false,
            error: error.message,
            timestamp: new Date()
          });
        }
      }
    }

    return notifications;
  }
}

module.exports = new WebhookService(); 