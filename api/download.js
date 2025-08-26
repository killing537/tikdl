// File: api/download.js

const tiktokModule = require('@tobyg74/tiktok-api-dl');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // BARIS PENTING UNTUK DEBUGGING
  // Ini akan mencetak struktur asli dari library ke Log Vercel
  console.log('Struktur library yang diimpor:', tiktokModule);

  const tiktokUrl = req.query.url;
  const format = req.query.format;

  if (!tiktokUrl) {
    return res.status(400).json({ error: 'Parameter "url" tidak ditemukan.' });
  }

  try {
    // Mencoba mengakses fungsi melalui properti .default
    const tikd = tiktokModule.default?.tikd || tiktokModule.tikd || tiktokModule;
    const tikdJ = tiktokModule.default?.tikdJ || tiktokModule.tikdJ;

    if (typeof tikd !== 'function' || typeof tikdJ !== 'function') {
        throw new Error('Fungsi inti dari library downloader tidak dapat ditemukan.');
    }

    if (format === 'mp3') {
      const jsonResult = await tikdJ(tiktokUrl, { version: 'v1' });
      if (jsonResult.status !== 'success' || !jsonResult.result.music?.playUrl) {
        throw new Error('Gagal mendapatkan data musik atau musik tidak tersedia.');
      }
      const musicUrl = jsonResult.result.music.playUrl;
      const response = await fetch(musicUrl);
      const buffer = await response.buffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_audio.mp3"');
      res.send(buffer);
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
    console.error("====== KESALAHAN PENUH DI SERVER ======");
    console.error(error);
    console.error("======================================");
    res.status(500).json({ error: 'Terjadi kesalahan internal di server.', message: error.message });
  }
};
