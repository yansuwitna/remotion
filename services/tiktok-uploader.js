const axios = require('axios');
const fs = require('fs');

/**
 * Service untuk mengunggah video ke TikTok Content Posting API v2
 */
class TikTokUploaderService {
  /**
   * Mengunggah video ke TikTok
   * @param {string} videoFilePath Lokasi file MP4
   * @param {Object} metadata Metadata video (tiktokTitle, tags)
   * @param {Object} credentials Kredensial TikTok (clientKey, clientSecret, accessToken)
   * @returns {Promise<{ success: boolean, publishId: string, videoUrl: string }>}
   */
  async uploadVideo(videoFilePath, metadata, credentials) {
    console.log(`[TikTok] Memulai proses unggah: "${metadata.tiktokTitle || metadata.title}"`);

    const { clientKey, accessToken, defaultPrivacy = 'PUBLIC_TO_EVERYONE' } = credentials || {};

    if (!clientKey || !accessToken || clientKey.includes('YOUR_')) {
      console.log('[TikTok] Kredensial API belum lengkap, menjalankan simulasi pengunggahan...');
      const dummyPublishId = `tt_mock_${Date.now().toString(36)}`;
      return {
        success: true,
        publishId: dummyPublishId,
        videoUrl: `https://www.tiktok.com/@creator/video/${dummyPublishId}`,
        isMock: true,
        message: 'Berhasil disimulasikan (Kredensial TikTok API belum diisi pada menu Pengaturan).'
      };
    }

    try {
      const stats = fs.statSync(videoFilePath);
      const videoSize = stats.size;

      // 1. Inisialisasi pengunggahan (Direct Post)
      const initUrl = 'https://open.tiktokapis.com/v2/post/publish/video/init/';
      const initResponse = await axios.post(
        initUrl,
        {
          post_info: {
            title: metadata.tiktokTitle || metadata.title,
            privacy_level: defaultPrivacy,
            disable_duet: false,
            disable_stitch: false,
            disable_comment: false
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: videoSize,
            total_chunk_count: 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const publishData = initResponse.data.data;
      const uploadUrl = publishData.upload_url;
      const publishId = publishData.publish_id;

      // 2. Unggah file binary video ke upload_url yang disediakan TikTok
      const fileStream = fs.createReadStream(videoFilePath);
      await axios.put(uploadUrl, fileStream, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoSize,
          'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`
        }
      });

      console.log(`[TikTok] Unggah video berhasil diinisialisasi! Publish ID: ${publishId}`);
      return {
        success: true,
        publishId,
        videoUrl: `https://www.tiktok.com/@me/video/${publishId}`,
        isMock: false
      };
    } catch (err) {
      console.error('[TikTok Error] Gagal mengunggah ke TikTok:', err.response?.data || err.message);
      throw new Error(`Gagal upload ke TikTok: ${err.message}`);
    }
  }
}

module.exports = new TikTokUploaderService();
