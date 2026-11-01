const { google } = require('googleapis');
const fs = require('fs');

/**
 * Service untuk mengunggah video ke YouTube Data API v3
 */
class YouTubeUploaderService {
  /**
   * Mengunggah video ke YouTube
   * @param {string} videoFilePath Lokasi file MP4 di disk
   * @param {Object} metadata Metadata video (title, description, tags, privacyStatus)
   * @param {Object} credentials Pengaturan OAuth2 YouTube
   * @returns {Promise<{ success: boolean, videoId: string, videoUrl: string }>}
   */
  async uploadVideo(videoFilePath, metadata, credentials) {
    console.log(`[YouTube] Memulai proses unggah: "${metadata.title}"`);

    // Validasi kredensial
    const { clientId, clientSecret, refreshToken, defaultPrivacy = 'public' } = credentials || {};

    if (!clientId || !clientSecret || !refreshToken || clientId.includes('YOUR_')) {
      console.log('[YouTube] Kredensial OAuth belum lengkap, menjalankan simulasi pengunggahan...');
      const dummyId = `yt_mock_${Date.now().toString(36)}`;
      return {
        success: true,
        videoId: dummyId,
        videoUrl: `https://www.youtube.com/shorts/${dummyId}`,
        isMock: true,
        message: 'Berhasil disimulasikan (Kredensial YouTube belum diisi pada menu Pengaturan).'
      };
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        credentials.redirectUri || 'http://localhost:3000/api/youtube/callback'
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });

      const requestParameters = {
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: metadata.title.slice(0, 100),
            description: metadata.description,
            tags: metadata.tags || ['Shorts', 'AI', 'Viral'],
            categoryId: credentials.categoryId || '28' // 28 = Science & Technology
          },
          status: {
            privacyStatus: metadata.privacyStatus || defaultPrivacy,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoFilePath)
        }
      };

      const response = await youtube.videos.insert(requestParameters);
      const videoId = response.data.id;
      const videoUrl = `https://www.youtube.com/shorts/${videoId}`;

      console.log(`[YouTube] Berhasil upload! URL: ${videoUrl}`);
      return {
        success: true,
        videoId,
        videoUrl,
        isMock: false
      };
    } catch (err) {
      console.error('[YouTube Error] Gagal mengunggah video:', err.message);
      throw new Error(`Gagal upload ke YouTube: ${err.message}`);
    }
  }

  /**
   * Generate URL otorisasi OAuth2 untuk mendapatkan Refresh Token
   */
  getAuthUrl(clientId, clientSecret, redirectUri) {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Tukarkan Auth Code menjadi Refresh Token
   */
  async getTokensFromCode(code, clientId, clientSecret, redirectUri) {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }
}

module.exports = new YouTubeUploaderService();
