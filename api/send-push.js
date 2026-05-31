const webpush = require('web-push');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const { subscription, title, body, tag } = req.body;
    if (!subscription) return res.status(400).json({ error: 'No subscription' });

    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL || 'admin@school.app'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify({ title, body, tag })
        );
        res.status(200).json({ success: true });
    } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
            return res.status(410).json({ error: 'Subscription expired', statusCode: error.statusCode });
        }
        res.status(500).json({ error: error.message });
    }
};
