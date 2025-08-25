// file : api/download.js


const { tikd } = require('@tobyg74/tiktok-api-dl');

export default async function handler(req, res) {
    const tiktokUrl = req.query.url;
    if (!tiktokUrl) {
        return res.status(400).json({ error: 'Parameter "url" tidak ditemukan.'
        });
    }
    try {
        const result = await tikd(tiktokUrl, { version: 'v1'});
        if (result.status !== 'success' || !result.video) {
            return res.status(500).json({ error: 'Gagal memperoses video TIKTOK.', message: result.message || 'Unknown error'});
        }

res.serHeader('Content-Type', 'video/mp4');
res.serHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
res.send(result.video)
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan internal.', message: error.message});
    }
}