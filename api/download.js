// File: api/download.js

import { tikd, tikdJ } from '@tobyg74/tiktok-api-dl';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const tiktokUrl = req.query.url;
  const format = req.query.format;

  if (!tiktokUrl) {
    return res.status(400).json({ error: 'Parameter "url" tidak ditemukan.' });
  }

  try {
    if (format === 'mp3') {
      const jsonResult = await tikdJ(tiktokUrl, { version: 'v1' });
      if (jsonResult.status !== 'success' || !jsonResult.result.music?.playUrl) {
        throw new Error('Gagal mendapatkan data musik atau musik tidak tersedia.');
      }
      const musicUrl = jsonResult.result.music.playUrl;
      const response = await fetch(musicUrl);
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_audio.mp3"');
      res.send(Buffer.from(buffer));
    } else {
      const result = await tikd(tiktokUrl, { version: 'v1' });
      if (result.status !== 'success' || !result.video) {
        throw new Error(result.message || 'Gagal memproses video TikTok.');
      }
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
      res.send(result.video);
    }
  } catch (error) {
    // ==== BAGIAN PENTING UNTUK DEBUGGING ====
    console.error("====== KESALAHAN PENUH DI SERVER ======");
    console.error(error); // Ini akan mencetak detail error lengkap di Log Vercel
    console.error("======================================");
    
    res.status(500).json({ error: 'Terjadi kesalahan internal di server.', message: error.message });
  }
}
