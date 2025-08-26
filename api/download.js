// File: api/download.js

const { Downloader } = require('@tobyg74/tiktok-api-dl');
const fetch = require('node-fetch');

const fetchWithHeaders = (url) => {
  return fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Referer": "https://www.tiktok.com/"
    }
  });
};

module.exports = async (req, res) => {
  const tiktokUrl = req.query.url;
  const format = req.query.format;

  if (!tiktokUrl) {
    return res.status(400).json({ error: 'Parameter "url" tidak ditemukan.' });
  }

  try {
    const result = await Downloader(tiktokUrl, { version: 'v1' });

    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal memproses URL TikTok.');
    }
    
    if (format === 'mp3') {
      if (!result.result.music?.playUrl) {
        throw new Error('Musik tidak ditemukan untuk URL ini.');
      }
      const musicUrl = result.result.music.playUrl;
      const response = await fetchWithHeaders(musicUrl);
      const buffer = await response.buffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_audio.mp3"');
      res.send(buffer);
    } else {
      // === PERUBAHAN LOGIKA DI SINI ===
      // Coba cari URL video tanpa watermark (nowm), jika tidak ada, pakai yang ada watermark (wm)
      const videoUrl = result.result.video?.nowm || result.result.video?.wm;

      if (!videoUrl) {
        // Jika keduanya tidak ada, baru tampilkan error
        throw new Error('Video tanpa watermark atau dengan watermark tidak ditemukan.');
      }

      const response = await fetchWithHeaders(videoUrl);
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
