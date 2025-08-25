// File: api/download.js

import { tikd, tikdJ } from '@tobyg74/tiktok-api-dl';
import fetch from 'node-fetch'; // Pastikan untuk mengimpor node-fetch

export default async function handler(req, res) {
  const tiktokUrl = req.query.url;
  const format = req.query.format; // Parameter baru untuk format (mp3/mp4)

  if (!tiktokUrl) {
    return res.status(400).json({ error: 'Parameter "url" tidak ditemukan.' });
  }

  try {
    // === LOGIKA UNTUK UNDUH MP3 ===
    if (format === 'mp3') {
      const jsonResult = await tikdJ(tiktokUrl, { version: 'v1' });

      if (jsonResult.status !== 'success' || !jsonResult.result.music?.playUrl) {
        return res.status(500).json({ error: 'Gagal mendapatkan data musik.', message: 'Musik tidak ditemukan atau URL tidak valid.' });
      }

      const musicUrl = jsonResult.result.music.playUrl;
      const response = await fetch(musicUrl);
      const buffer = await response.arrayBuffer();

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_audio.mp3"');
      res.send(Buffer.from(buffer));

    // === LOGIKA UNTUK UNDUH MP4 (DEFAULT) ===
    } else {
      const result = await tikd(tiktokUrl, { version: 'v1' });

      if (result.status !== 'success' || !result.video) {
        return res.status(500).json({ error: 'Gagal memproses video TikTok.', message: result.message || 'Unknown error' });
      }

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
      res.send(result.video);
    }

  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan internal.', message: error.message });
  }
}
