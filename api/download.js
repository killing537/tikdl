// File: api/download.js

const { Downloader } = require('@tobyg74/tiktok-api-dl');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const tiktokUrl = req.query.url;
  const format = req.query.format;

  if (!tiktokUrl) {
    return res.status(400).json({ error: 'Parameter "url" tidak ditemukan.' });
  }

  try {
    // Panggil fungsi Downloader sesuai struktur library
    const result = await Downloader(tiktokUrl, { version: 'v1' });

    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal memproses URL TikTok.');
    }
    
    if (format === 'mp3') {
      if (!result.result.music?.playUrl) {
        throw new Error('Musik tidak ditemukan untuk URL ini.');
      }
      const musicUrl = result.result.music.playUrl;
      const response = await fetch(musicUrl);
      const buffer = await response.buffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_audio.mp3"');
      res.send(buffer);
    } else {
      if (!result.result.video?.nowm) {
        throw new Error('Video tanpa watermark tidak ditemukan.');
      }
      // Ambil URL video tanpa watermark dari hasil
      const videoUrl = result.result.video.nowm;
      const response = await fetch(videoUrl);
      const buffer = await response.buffer();
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
      res.send(buffer);
    }
  } catch (error) {
    console.error("====== KESALAHAN PENUH DI SERVER ======");
    console.error(error);
    console.error("======================================");
    res.status(500).json({ error: 'Terjadi kesalahan internal di server.', message: error.message });
  }
};
