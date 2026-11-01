const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service Khusus Pembuatan Konten Edukasi Matematika (SD sampai Kuliahan)
 * Menggunakan Gemini AI untuk menghasilkan naskah video 1 Menit (60 detik)
 * (YouTube Shorts & TikTok) dengan bentuk layout yang bervariasi dan ramah anak sekolahan:
 * - Layout 1: kids-challenge (Tantangan Berhitung Interaktif + Timer Lingkaran)
 * - Layout 2: battle-vs (Duel Cara Lama 😫 vs Trik Kilat 🤩)
 * - Layout 3: step-flow / geometry (Langkah Logika Rahasia / Diagram Visual)
 * - Layout 4: practice-round (Latihan Interaktif Penonton: "Sekarang Giliranmu!")
 * - Layout 5: celebration-star (Bintang Emas ⭐⭐⭐, Level Up & Konfeti Kemenangan)
 */
class AiGeneratorService {
  /**
   * Generate video package lengkap dari topik matematika
   */
  async generateVideoContent(topic, apiKey) {
    if (!topic || topic.trim() === '') {
      throw new Error('Topik matematika tidak boleh kosong.');
    }

    // Jika API Key tidak ada, gunakan intelligent fallback math generator
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GEMINI')) {
      console.log('[AI-Math] Menggunakan template generator matematika cerdas 1 Menit (Fallback tanpa API key)...');
      return this.generateFallbackContent(topic);
    }

    try {
      console.log(`[AI-Math] Meminta Gemini AI menghasilkan konten matematika 1 Menit untuk topik: "${topic}"...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Menggunakan model Gemini terbaru yang aktif (gemini-3.5-flash-lite / gemini-3.5-flash / gemini-3.8-flash)
      let model;
      const modelCandidates = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
      for (const mName of modelCandidates) {
        try {
          model = genAI.getGenerativeModel({
            model: mName,
            generationConfig: { responseMimeType: 'application/json' }
          });
          break;
        } catch {
          // Lanjut ke kandidat berikutnya
        }
      }
      if (!model) {
        model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
      }

      const prompt = `
Kamu adalah Guru & Kreator Konten Matematika Viral No. 1 di YouTube Shorts dan TikTok (@MatematikaSeruAI).
Keahlianmu adalah membuat matematika menjadi SANGAT MENYENANGKAN, MUDAH, dan TIDAK MEMBOSANKAN bagi anak-anak sekolah:
mulai dari anak SD (berhitung cepat), SMP (aljabar & geometri seru), SMA (trik trigonometri & logika ujian), hingga Mahasiswa Kuliahan (konsep matematika indah).

Topik / Jenjang video yang diminta: "${topic}".
PETUNJUK KHUSUS JENJANG PENDIDIKAN:
- Jika pengguna hanya memilih jenjang pendidikan ("SD", "SMP", "SMA", atau "KULIAH"):
  Kamu WAJIB secara mandiri memilih dan menciptakan SATU materi atau trik matematika baru yang paling seru, mencengangkan, dan edukatif KHUSUS untuk jenjang tersebut:
  * Jika jenjang "SD": Buat materi berhitung kilat atau logika cerdas khusus anak SD (misal: trik perkalian jari tangan, perkalian angka 11, kuadrat berakhiran 5, trik persen ajaib, atau teka-teki pecahan). Tentukan "level": "🎒 LEVEL SD".
  * Jika jenjang "SMP": Buat materi seru tingkat SMP (misal: rahasia tripel pythagoras sakti tanpa rumus rumit, trik aljabar kilat, faktorisasi kuadrat visual, atau pola barisan angka ajaib). Tentukan "level": "📐 LEVEL SMP".
  * Jika jenjang "SMA": Buat materi SMA / persiapan ujian SNBT yang memukau (misal: trik 5 jari sudut istimewa trigonometri, konsep turunan/kalkulus visual, atau rahasia logaritma kilat). Tentukan "level": "📊 LEVEL SMA".
  * Jika jenjang "KULIAH": Buat konsep matematika mendalam yang mempesona (misal: keindahan rumus identitas Euler, batas limit kenapa pembagian nol tak terdefinisi, misteri kenapa 0! = 1, atau barisan Fibonacci di alam). Tentukan "level": "🎓 LEVEL KULIAHAN".
- Jika topik berupa materi spesifik, sesuaikan dengan materi yang diminta.
- Pastikan materi 100% orisinal, segar, dan sangat menyenangkan seperti tantangan game kuis berhadiah!

Kriteria Wajib Video Edukasi 1 Menit (60 Detik):
1. Durasi Total: 1 Menit (60 detik) dengan alur interaktif seperti game berhadiah.
2. Tentukan jenjang pendidikan: "🎒 LEVEL SD", "📐 LEVEL SMP", "📊 LEVEL SMA", atau "🎓 LEVEL KULIAHAN".
3. Pilih Maskot Pemandu: "🦉" (Profesor Burung Hantu), "🤖" (Robot Cerdas), "🦊" (Rubah Pintar), "🦖" (Dino Berhitung), atau "🧙‍♂️" (Penyihir Angka).
4. Pilih Tema Visual Ceria: "kids-arcade" (Default Ceria), "school-chalkboard" (Papan Tulis), "candy-pop" (Manis & Seru), "neon-cyan" (Cyber Canggih), atau "sunset-fire" (Energi Api).
5. Buat TEPAT 5 SCENE dengan layout yang BERBEDA-BEDA:
   - Scene 1: layout "kids-challenge" -> Berikan soal teka-teki yang menantang rasa penasaran anak.
   - Scene 2: layout "battle-vs" -> Bandingkan Cara Lama yang bikin pusing (😫) dengan Trik Sulap Cepat (🤩).
   - Scene 3: layout "step-flow" (atau "geometry" jika tentang segitiga/bangun ruang) -> Bedah langkah rahasianya secara visual dan mudah.
   - Scene 4: layout "practice-round" -> Berikan soal latihan interaktif untuk penonton: "Sekarang giliranmu! Coba tebak dalam 5 detik!"
   - Scene 5: layout "celebration-star" -> Rayakan keberhasilan dengan bintang emas ⭐⭐⭐, LEVEL UP, dan umumkan jawaban tepatnya.

HASIL HARUS DALAM FORMAT JSON VALID MURNI (tanpa markdown backtick json atau teks pengantar):
{
  "youtubeTitle": "Judul Viral Seru (Maksimal 60 karakter, ada emoji, tingkat kelas & #Shorts)",
  "tiktokTitle": "Caption TikTok menarik anak sekolah + hashtag (#fyp #matematika #trikmatematika #belajarseru)",
  "description": "Deskripsi lengkap video untuk YouTube dengan penjelasan rumus, langkah penyelesaian, dan ajakan subscribe.",
  "tags": ["matematika", "trik matematika", "anak sd", "smp", "sma", "shorts", "edukasi seru"],
  "remotionProps": {
    "level": "🎒 LEVEL SD & SMP",
    "hook": "TEKA-TEKI MATEMATIKA SERU!",
    "mascot": "🦉",
    "brandName": "@MatematikaSeruAI",
    "ctaText": "Komen jawabanmu di bawah & Subscribe untuk trik juara kelas berikutnya! 🚀⭐",
    "theme": "kids-arcade",
    "scenes": [
      {
        "layout": "kids-challenge",
        "title": "Siapa Bisa Jawab Soal Ini?",
        "highlight": "Tantangan Berhitung",
        "stat": "16% × 50 = ?",
        "tag": "🎮 TANTANGAN SERU",
        "body": "Penjelasan soal yang ramah dan memicu rasa penasaran anak-anak sekolah.",
        "icon": "❓"
      },
      {
        "layout": "battle-vs",
        "title": "Kenapa Cara Lama Bikin Pusing?",
        "highlight": "Perang Metode",
        "stat": "Cara Lama vs Trik Sulap",
        "tag": "⚔️ VS BATTLE",
        "oldMethod": "Cara biasa yang panjang dan bikin puyeng 😫",
        "fastMethod": "Trik sulap kilat cuma 2 detik 🤩",
        "body": "Tunjukkan betapa mudah dan cepatnya trik rahasia ini dibandingkan metode rumit.",
        "icon": "⚡"
      },
      {
        "layout": "step-flow",
        "title": "Bongkar Rahasia Triknya",
        "highlight": "Tinggal Dibalik Saja!",
        "stat": "x% dari y = y% dari x",
        "tag": "✨ TRIK RAHASIA",
        "body": "Jelaskan langkah demi langkah dengan analogi sederhana yang langsung nempel di kepala anak.",
        "icon": "💡"
      },
      {
        "layout": "practice-round",
        "title": "Sekarang Giliranmu Mencoba!",
        "highlight": "Tantangan Interaktif",
        "stat": "Berapa 18% dari 50?",
        "tag": "🎯 GILIRAN KAMU",
        "body": "Ajak penonton menghitung cepat dalam 5 detik menggunakan trik tadi!",
        "icon": "⏳"
      },
      {
        "layout": "celebration-star",
        "title": "Hebat! Kamu Juara Kelas!",
        "highlight": "Jawaban: 9!",
        "stat": "50% × 18 = 9 (Benar 100%)",
        "tag": "🏆 LEVEL UP!",
        "body": "Apresiasi anak dengan pujian juara kelas dan rangkum triknya!",
        "icon": "🎉"
      }
    ]
  }
}
`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();

      const cleanedJson = textResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsedData = JSON.parse(cleanedJson);
      console.log('[AI-Math] Berhasil menghasilkan naskah matematika 1 Menit berkualitas tinggi!');
      return parsedData;
    } catch (err) {
      console.error('[AI-Math Error] Menggunakan fallback generator khusus matematika 1 Menit:', err.message);
      return this.generateFallbackContent(topic);
    }
  }

  /**
   * Generator Fallback Cerdas 1 Menit dengan 5 Bentuk Berbeda (Multi-Layout)
   * Terdiri dari 5 Scene lengkap:
   * 1. kids-challenge (Tantangan)
   * 2. battle-vs (Duel Metode)
   * 3. step-flow / geometry (Penjelasan Langkah)
   * 4. practice-round (Latihan Interaktif Penonton)
   * 5. celebration-star (Perayaan Bintang Emas & Level Up)
   */
  generateFallbackContent(topic) {
    const cleanTopic = topic.trim();
    const lower = cleanTopic.toLowerCase();

    // 1. Jenjang SD: Trik Persen & Berhitung Cepat - Durasi 1 Menit Lengkap
    if (lower === 'sd' || lower.includes('sd') || lower.includes('persen') || lower.includes('%')) {
      return {
        youtubeTitle: `🔥 Trik Sulap Hitung Persen Dalam 2 Detik! [Matematika SD-SMP] #Shorts`,
        tiktokTitle: `Guru matematika kalian pasti kagum kalau tahu trik sulap ini! 🤩 #fyp #matematika #trikcepat #belajarseru #persen`,
        description: `Trik kilat menghitung persentase tanpa kalkulator: x% dari y itu nilainya persis sama dengan y% dari x! Jadi 16% dari 50 cukup dibalik jadi 50% dari 16 = 8.\n\nSubscribe channel ini untuk trik juara matematika setiap hari!\n\n#Shorts #Matematika #Edukasi #TrikCepat #SD #SMP`,
        tags: ["matematika", "trik persen", "hitung cepat", "matematika sd", "matematika smp", "shorts"],
        remotionProps: {
          level: "🎒 LEVEL SD & SMP",
          hook: "TEKA-TEKI MATEMATIKA SERU!",
          mascot: "🦉",
          brandName: "@MatematikaSeruAI",
          ctaText: "Komen jawabanmu & Follow untuk trik juara kelas berikutnya! 🚀⭐",
          theme: "kids-arcade",
          scenes: [
            {
              layout: "kids-challenge",
              title: "Siapa Bisa Jawab Soal Ini?",
              highlight: "Tantangan Berhitung",
              stat: "16% × 50 = ?",
              tag: "🎮 TANTANGAN SERU",
              body: "Di kelas, banyak teman-teman yang cakar kertas berlama-lama hanya untuk menghitung 16 persen dari 50!",
              icon: "❓"
            },
            {
              layout: "battle-vs",
              title: "Kenapa Cara Lama Bikin Pusing?",
              highlight: "Perang Metode",
              stat: "Cara Lama vs Trik Sulap",
              tag: "⚔️ VS BATTLE",
              oldMethod: "16/100 × 50 = 800/100 = 8 (Bikin Puyeng 😫)",
              fastMethod: "Balik angkanya: 50% dari 16! (Cuma 2 Detik 🤩)",
              body: "Jangan pakai cara lama yang berbelit-belit! Ada trik sulap rahasia yang bikin kamu jadi juara kelas!",
              icon: "⚡"
            },
            {
              layout: "step-flow",
              title: "Bongkar Rahasia: Sifat Komutatif",
              highlight: "Tinggal Dibalik Saja!",
              stat: "x% dari y = y% dari x",
              tag: "✨ TRIK RAHASIA",
              body: "Trik ajaibnya: 16% dari 50 itu nilainya sama persis dengan 50% dari 16! 50% kan tinggal dibagi dua, hasilnya 8!",
              icon: "💡"
            },
            {
              layout: "practice-round",
              title: "Sekarang Giliranmu Mencoba!",
              highlight: "Tantangan Latihan Interaktif",
              stat: "Berapa 18% dari 50?",
              tag: "🎯 GILIRAN KAMU",
              body: "Coba gunakan trik yang baru kamu pelajari tadi! Balik angkanya dan hitung dalam 5 detik!",
              icon: "⏳"
            },
            {
              layout: "celebration-star",
              title: "Hebat! Kamu Juara Kelas!",
              highlight: "Jawaban Tepat: 9!",
              stat: "50% × 18 = 9 (Benar 100%)",
              tag: "🏆 LEVEL UP!",
              body: "50% dari 18 adalah 9! Gampang banget kan? Sekarang kamu sudah 10x lebih pintar berhitung cepat!",
              icon: "🎉"
            }
          ]
        }
      };
    }

    // 2. Perkalian Angka 11 (SD/SMP) - Durasi 1 Menit Lengkap
    if (lower.includes('11') || lower.includes('perkalian 11')) {
      return {
        youtubeTitle: `⚡ Trik Kilat Perkalian 11 Tanpa Cakar Kertas! [Matematika SD] #Shorts`,
        tiktokTitle: `Perkalian 11 dua digit cuma butuh 1 detik! Auto juara kelas! 🤩 #fyp #matematika #perkalian11 #sd #anakpintar`,
        description: `Perkalian dua digit dengan 11 sangat mudah: cukup pisahkan angka depan dan belakang, lalu jumlahkan kedua angka tersebut dan taruh di tengah!\n\nSubscribe untuk tips matematika seru lainnya!\n\n#Shorts #Matematika #Perkalian11 #TrikHitung #SD`,
        tags: ["matematika", "perkalian 11", "hitung cepat", "matematika sd", "shorts"],
        remotionProps: {
          level: "🎒 LEVEL SD",
          hook: "PERKALIAN 11 KILAT!",
          mascot: "🤖",
          brandName: "@MatematikaSeruAI",
          ctaText: "Komen jawabanmu & Subscribe untuk trik matematika pintar tiap hari! 🚀⭐",
          theme: "school-chalkboard",
          scenes: [
            {
              layout: "kids-challenge",
              title: "Tantangan Perkalian Dua Digit",
              highlight: "Hitung Dalam 3 Detik",
              stat: "35 × 11 = ?",
              tag: "🎮 TANTANGAN KILAT",
              body: "Biasanya kita butuh coret-coretan bersusun ke bawah yang rawan salah hitung saat ujian kelas!",
              icon: "🧮"
            },
            {
              layout: "battle-vs",
              title: "Cara Bersusun vs Trik Sisip",
              highlight: "Bandingkan Kecepatannya",
              stat: "Bersusun vs Sisip Tengah",
              tag: "⚔️ VS BATTLE",
              oldMethod: "Perkalian bersusun 2 baris (Lama & Rawan keliru 😫)",
              fastMethod: "Pisahkan angka: 3 _ 5 ➔ Sisipkan 3+5=8 ➔ 385 🤩",
              body: "Cukup pisahkan angka 3 dan 5, lalu tambahkan keduanya di tengah! Gak perlu coretan kertas sama sekali!",
              icon: "⚡"
            },
            {
              layout: "step-flow",
              title: "Langkah Rahasia Trik 11",
              highlight: "Pisahkan & Jumlahkan",
              stat: "3 ... (3+5) ... 5 = 385",
              tag: "✨ CARA MUDAH",
              body: "Langkah 1: Tulis 3 di depan. Langkah 2: Tulis 5 di belakang. Langkah 3: Jumlahkan 3 + 5 = 8 di tengah!",
              icon: "💡"
            },
            {
              layout: "practice-round",
              title: "Sekarang Giliranmu Mencoba!",
              highlight: "Kuis Cepat 5 Detik",
              stat: "Berapa 42 × 11?",
              tag: "🎯 GILIRAN KAMU",
              body: "Pisahkan 4 dan 2, lalu jumlahkan di tengah! Berapa hasilnya? Tebak cepat!",
              icon: "⏳"
            },
            {
              layout: "celebration-star",
              title: "Luar Biasa! Jawabanmu Tepat!",
              highlight: "Hasilnya: 462!",
              stat: "4 _ 2 ➔ 4+2=6 ➔ 462 ⭐",
              tag: "🏆 JUARA KELAS!",
              body: "4 ditambah 2 adalah 6, jadi hasilnya 462! Sekarang kamu resmi jago perkalian 11 kilat!",
              icon: "🎉"
            }
          ]
        }
      };
    }

    // 3. Jenjang SMP: Pythagoras, Geometri & Aljabar - Durasi 1 Menit Lengkap
    if (lower === 'smp' || lower.includes('smp') || lower.includes('pythagoras') || lower.includes('segitiga') || lower.includes('aljabar')) {
      return {
        youtubeTitle: `📐 Rahasia Tripel Pythagoras Sakti Tanpa Menghafal! [SMP] #Shorts`,
        tiktokTitle: `Soal ujian pythagoras langsung kelar dalam 3 detik! 📐 #fyp #matematika #pythagoras #smp #ujiansekolah`,
        description: `Hafalkan pola dasar tripel Pythagoras: 3-4-5, 5-12-13, 7-24-25, 8-15-17. Semua kelipatannya berlaku sama!\n\nSubscribe channel ini untuk materi SMP & SMA!\n\n#Shorts #Pythagoras #MatematikaSMP #Geometri`,
        tags: ["matematika", "pythagoras", "geometri", "matematika smp", "tripel pythagoras", "shorts"],
        remotionProps: {
          level: "📐 LEVEL SMP",
          hook: "JANGAN TARIK AKAR!",
          mascot: "🦊",
          brandName: "@MatematikaSeruAI",
          ctaText: "Save video ini & Subscribe untuk persiapan sukses ujian matematika! 📐✨",
          theme: "sunset-fire",
          scenes: [
            {
              layout: "kids-challenge",
              title: "Mencari Sisi Miring Segitiga",
              highlight: "Soal Ujian Sering Keluar",
              stat: "Alas = 6, Tinggi = 8, Sisi Miring = ?",
              tag: "🎮 SOAL UJIAN",
              body: "Di ruang ujian, banyak murid menghabiskan waktu berharga untuk menghitung kuadrat 6² + 8² lalu menarik akar!",
              icon: "❓"
            },
            {
              layout: "geometry",
              title: "Diagram Tripel Pythagoras Sakti",
              highlight: "Pola Dasar 3 - 4 - 5",
              stat: "a=6, b=8 ➔ c=10",
              tag: "📐 DIAGRAM GEOMETRI",
              body: "Jika alas 6 dan tinggi 8, itu adalah kelipatan 2 dari tripel dasar (3, 4, 5). Maka sisi miring pasti 5 × 2 = 10!",
              icon: "📐"
            },
            {
              layout: "battle-vs",
              title: "Hitung Manual vs Pola Tripel",
              highlight: "Beda Waktu 1 Menit!",
              stat: "Cara Rumus vs Pola Rasio",
              tag: "⚔️ VS BATTLE",
              oldMethod: "c = √(6² + 8²) = √(36 + 64) = √100 = 10 (Lama 😫)",
              fastMethod: "Tripel 3:4:5 dikali 2 langsung dapat 10! (Cuma 2 Detik 🤩)",
              body: "Dengan mengenali rasio kelipatan tripel Pythagoras, kamu tidak perlu repot-repot menarik akar bilangan!",
              icon: "⚡"
            },
            {
              layout: "practice-round",
              title: "Tantangan Latihan Interaktif",
              highlight: "Tripel Kelipatan 3",
              stat: "Alas = 9, Tinggi = 12, c = ?",
              tag: "🎯 GILIRAN KAMU",
              body: "9 itu 3×3, 12 itu 4×3. Berarti sisi miringnya 5 dikali berapa? Tebak sekarang!",
              icon: "⏳"
            },
            {
              layout: "celebration-star",
              title: "Hebat Banget! Jawabannya 15!",
              highlight: "5 × 3 = 15!",
              stat: "Sisi Miring = 15 (Benar 100%)",
              tag: "🏆 MASTER GEOMETRI!",
              body: "Tepat sekali! 5 × 3 = 15! Kamu berhasil memangkas waktu pengerjaan soal ujian hingga 95%!",
              icon: "🎉"
            }
          ]
        }
      };
    }

    // 4. Jenjang SMA: Trigonometri, Kalkulus & Logaritma - Durasi 1 Menit Lengkap
    if (lower === 'sma' || lower.includes('sma') || lower.includes('trigonometri') || lower.includes('sin') || lower.includes('cos') || lower.includes('logaritma') || lower.includes('turunan') || lower.includes('kalkulus')) {
      return {
        youtubeTitle: `📊 Trik Ajaib 5 Jari Sudut Istimewa Trigonometri [SMA/SNBT] #Shorts`,
        tiktokTitle: `Gak perlu hafalkan tabel trigonometri yang bikin pusing! Pakai 5 jarimu! 🖐️ #fyp #trigonometri #matematikasma #snbt`,
        description: `Trik telapak tangan untuk mengingat Sin dan Cos sudut 0°, 30°, 45°, 60°, dan 90° menggunakan rumus ½√n jari!\n\nSubscribe untuk persiapan SNBT dan Ujian Matematika SMA!\n\n#Shorts #Trigonometri #MatematikaSMA #SNBT #Kalkulus`,
        tags: ["trigonometri", "sudut istimewa", "matematika sma", "snbt", "utbk", "shorts"],
        remotionProps: {
          level: "📊 LEVEL SMA",
          hook: "JANGAN HAFAL TABEL!",
          mascot: "🦖",
          brandName: "@MatematikaSeruAI",
          ctaText: "Share video ini ke teman kelasmu & Subscribe untuk trik lolos SNBT! 🚀⭐",
          theme: "candy-pop",
          scenes: [
            {
              layout: "kids-challenge",
              title: "Teka-Teki Sudut Istimewa",
              highlight: "Sering Tertukar di Ujian",
              stat: "Berapa Sin 30° dan Cos 60°?",
              tag: "🎮 TANTANGAN SMA",
              body: "Menghafal 15 baris tabel sudut istimewa sering bikin nge-blank saat detik-detik penting ujian SNBT!",
              icon: "🖐️"
            },
            {
              layout: "battle-vs",
              title: "Hafalan Kertas vs Trik 5 Jari",
              highlight: "Metode Tercepat",
              stat: "Hafalan vs 5 Jari Sakti",
              tag: "⚔️ VS BATTLE",
              oldMethod: "Menghafal tabel 15 baris (Gampang lupa & stres 😫)",
              fastMethod: "Trik 5 Jari: Rumus ½ × √Jumlah Jari (Anti Lupa 🤩)",
              body: "Tangan kirimu adalah kalkulator alami! Setiap jari melambangkan sudut: 0°, 30°, 45°, 60°, dan 90°!",
              icon: "✨"
            },
            {
              layout: "step-flow",
              title: "Cara Menghitung Nilai Sin",
              highlight: "Hitung Jari di Bawah",
              stat: "Sin = ½ × √(Jari Bawah)",
              tag: "✨ RUMUS 5 JARI",
              body: "Untuk Sin, hitung jumlah jari di bawah sudut! Telunjuk adalah 30°, di bawahnya ada 1 jari (jempol). Maka Sin 30° = ½√1 = ½!",
              icon: "💡"
            },
            {
              layout: "practice-round",
              title: "Sekarang Giliranmu Mencoba!",
              highlight: "Tebak Nilai Sin 90 Derajat",
              stat: "Berapa Sin 90°?",
              tag: "🎯 GILIRAN KAMU",
              body: "Kelingking adalah 90°. Ada berapa jari di bawah kelingking? Hitung sekarang dalam 5 detik!",
              icon: "⏳"
            },
            {
              layout: "celebration-star",
              title: "Pintar! Jawabannya Adalah 1!",
              highlight: "½ × √4 = ½ × 2 = 1!",
              stat: "Sin 90° = 1 (Tepat 100%)",
              tag: "🏆 MASTER SNBT!",
              body: "Ada 4 jari di bawah kelingking! ½ kali akar 4 = 1! Anti lupa selamanya di semua ujian matematika!",
              icon: "🎉"
            }
          ]
        }
      };
    }

    // 5. Jenjang Kuliah: Konsep Lanjutan, Euler & Paradoks - Durasi 1 Menit Lengkap
    if (lower === 'kuliah' || lower.includes('kuliah') || lower.includes('kuliahan') || lower.includes('euler') || lower.includes('nol') || lower.includes('paradoks') || lower.includes('phi')) {
      return {
        youtubeTitle: `🎓 Kenapa Rumus Identitas Euler Disebut Rumus Terindah di Alam Semesta? #Shorts`,
        tiktokTitle: `Persamaan sakral yang menggabungkan 5 bilangan terpenting alam semesta! 🌌 #fyp #matematika #kuliahan #euler #sains`,
        description: `Rumus Identitas Euler e^(iπ) + 1 = 0 menghubungkan 5 bilangan terpenting di seluruh sains: e, i, π, 1, dan 0 dalam satu keindahan mutlak!\n\nSubscribe untuk eksplorasi matematika tingkat lanjut!\n\n#Shorts #Kalkulus #MatematikaKuliah #Euler #Sains`,
        tags: ["matematika kuliah", "rumus euler", "kalkulus", "bilangan kompleks", "sains", "shorts"],
        remotionProps: {
          level: "🎓 LEVEL KULIAHAN",
          hook: "PERSAMAAN TERINDAH!",
          mascot: "🧙‍♂️",
          brandName: "@MatematikaSeruAI",
          ctaText: "Follow & Subscribe untuk eksplorasi keajaiban matematika sains! 🌌✨",
          theme: "neon-cyan",
          scenes: [
            {
              layout: "kids-challenge",
              title: "Misteri Identitas Euler",
              highlight: "Persamaan Sakral Sains",
              stat: "e^(iπ) + 1 = 0",
              tag: "🌌 TEOREMA AGUNG",
              body: "Bagaimana mungkin bilangan irasional, konstanta lingkaran, dan bilangan imajiner bisa bersatu menghasilkan angka nol?",
              icon: "🌌"
            },
            {
              layout: "battle-vs",
              title: "Dunia Terpisah vs Harmoni Satu Baris",
              highlight: "5 Cabang Sains",
              stat: "Kekacauan vs Kesatuan Mutlak",
              tag: "⚔️ HARMONI SEMESTA",
              oldMethod: "Aritmatika, Geometri, Aljabar & Analisis berdiri sendiri 😫",
              fastMethod: "Bersatu dalam persamaan paling indah: e^(iπ) + 1 = 0 🤩",
              body: "Fisikawan Richard Feynman menyebut rumus ini sebagai 'permata matematika paling luar biasa dalam sejarah manusia'.",
              icon: "👑"
            },
            {
              layout: "step-flow",
              title: "Rotasi Pada Bidang Kompleks",
              highlight: "Putaran Sudut 180 Derajat",
              stat: "e^(iπ) = cos(π) + i sin(π) = -1",
              tag: "✨ BUKTI FORMULA",
              body: "Mengalikan dengan e^(iθ) berarti memutar titik di bidang kompleks sejauh θ radian. Bila θ = π (180°), posisi mendarat tepat di -1!",
              icon: "💡"
            },
            {
              layout: "practice-round",
              title: "Tantangan Logika Cepat",
              highlight: "Pindahkan Angka -1",
              stat: "Jika e^(iπ) = -1, maka e^(iπ) + 1 = ?",
              tag: "🎯 GILIRAN KAMU",
              body: "Jika sisi kiri bernilai minus satu, berapa hasil penjumlahannya dengan positif satu? Tebak dalam 5 detik!",
              icon: "⏳"
            },
            {
              layout: "celebration-star",
              title: "Sempurna! Jawabannya Adalah 0!",
              highlight: "-1 + 1 = 0 (Harmoni Mutlak)",
              stat: "e^(iπ) + 1 = 0 ⭐⭐⭐",
              tag: "🏆 GENIUS LEVEL!",
              body: "Nol melambangkan keseimbangan sempurna alam semesta! Kamu telah memahami persamaan paling legendaris di dunia!",
              icon: "🎉"
            }
          ]
        }
      };
    }

    // Default Fallback Khusus Matematika (1 Menit Lengkap dengan 5 Scene)
    return {
      youtubeTitle: `🔢 Trik Kilat Berhitung Cepat: ${cleanTopic.slice(0, 32)} [SD-SMP] #Shorts`,
      tiktokTitle: `Trik rahasia berhitung yang bikin kamu jadi juara kelas! 🧠 #fyp #matematika #trikcepat #belajarseru`,
      description: `Bongkar trik matematika seru seputar ${cleanTopic}.\n\nLike & Subscribe untuk trik matematika pintar dari SD sampai Kuliahan setiap hari!\n\n#Shorts #Matematika #Edukasi #TrikCepat`,
      tags: ["matematika", "trik matematika", "edukasi", "shorts", cleanTopic.toLowerCase()],
      remotionProps: {
        level: "🎒 MATEMATIKA SERU",
        hook: "TEKA-TEKI MATEMATIKA SERU!",
        mascot: "🦉",
        brandName: "@MatematikaSeruAI",
        ctaText: "Komen jawabanmu & Subscribe untuk trik pintar berikutnya! 🚀⭐",
        theme: "kids-arcade",
        scenes: [
          {
            layout: "kids-challenge",
            title: `Tantangan Seru ${cleanTopic.split(' ').slice(0, 3).join(' ')}`,
            highlight: "Tantangan Menarik",
            stat: "Soal Hitung Cepat",
            tag: "🎮 TANTANGAN SERU",
            body: `Banyak teman-teman yang merasa kesulitan dengan ${cleanTopic} karena belum tahu cara asyik menyelesaikannya!`,
            icon: "❓"
          },
          {
            layout: "battle-vs",
            title: "Cara Biasa vs Trik Sulap",
            highlight: "Bandingkan Kecepatannya",
            stat: "Metode Rumit vs Metode Kilat",
            tag: "⚔️ VS BATTLE",
            oldMethod: "Cara biasa di buku yang panjang & bikin pusing 😫",
            fastMethod: "Trik sulap kilat cuma butuh beberapa detik 🤩",
            body: `Dengan memahami trik rahasianya, kita bisa memotong waktu pengerjaan sampai 90% tanpa kalkulator!`,
            icon: "⚡"
          },
          {
            layout: "step-flow",
            title: "Langkah Rahasia Penyelesaian",
            highlight: "Pola Sederhana",
            stat: "Langkah 1 - 2 - 3",
            tag: "✨ RAHASIA JUARA",
            body: `Cukup ikuti pola logikanya: sederhanakan angkanya, kelompokkan bagian yang mudah, dan jawabannya langsung terlihat!`,
            icon: "💡"
          },
          {
            layout: "practice-round",
            title: "Sekarang Giliranmu Mencoba!",
            highlight: "Tantangan Kuis 5 Detik",
            stat: "Bisakah Kamu Menyelesaikan Ini?",
            tag: "🎯 GILIRAN KAMU",
            body: `Gunakan trik yang baru kita pelajari! Coba tebak jawabannya dalam 5 detik dan buktikan kamu bisa!`,
            icon: "⏳"
          },
          {
            layout: "celebration-star",
            title: "Hebat! Kamu Juara Kelas!",
            highlight: "Jawabanmu 100% Benar!",
            stat: "LEVEL UP: JUARA BERHITUNG ⭐",
            tag: "🏆 SELAMAT!",
            body: `Keren banget! Sekarang kamu sudah tahu trik rahasia ini dan siap jadi yang tercepat di kelas!`,
            icon: "🎉"
          }
        ]
      }
    };
  }

  /**
   * Cari atau generate ide-ide topik matematika baru menggunakan AI
   * @param {string} query Kata kunci atau materi yang ingin dicari (misal: "persen", "pythagoras", "aljabar")
   * @param {string} level Jenjang pendidikan ("SD", "SMP", "SMA", "KULIAHAN", atau "SEMUA")
   * @param {string} apiKey Gemini API Key
   * @returns {Promise<Array<{ title: string, level: string, tag: string, description: string }>>}
   */
  async searchTopicsWithAi(query = '', level = 'SEMUA', apiKey = '') {
    const cleanQuery = (query || '').trim();
    const cleanLevel = (level || 'SEMUA').toUpperCase();

    // 1. Coba panggil Gemini jika API Key ada
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_GEMINI')) {
      try {
        console.log(`[AI-TopicSearch] Meminta Gemini AI mencari topik: "${cleanQuery}" (Level: ${cleanLevel})...`);
        const genAI = new GoogleGenerativeAI(apiKey);
        const candidates = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];

        const prompt = `
Kamu adalah produser konten edukasi matematika viral no. 1 untuk YouTube Shorts dan TikTok (@MatematikaSeruAI).
Tugasmu: Buatkan TEPAT 4 ide topik/judul materi matematika yang SANGAT MENARIK, BIKIN PENASARAN, dan MENGHIBUR untuk anak sekolah jenjang ${cleanLevel}.

Target jenjang: "${cleanLevel}" (SD, SMP, SMA, atau KULIAHAN)
Kata kunci pencarian: "${cleanQuery || 'trik matematika kilat, teka-teki logika angka, dan misteri rumus'}"

Kriteria Wajib:
- Wajib mencantumkan tag level di depan judul, contoh: [${cleanLevel}].
- Buat judul yang memicu rasa penasaran siswa (ada emoji, trik kilat, atau teka-teki seru).
- Buat deskripsi singkat 1 kalimat yang menjelaskan trik/konsepnya secara sederhana.
- Buat tag materi singkat (contoh: "Trik Jari", "Aljabar Cepat", "Pythagoras Sakti", "Sudut Istimewa", "Paradoks Peluang").

HASIL HARUS DALAM FORMAT JSON ARRAY MURNI (tanpa markdown backtick json atau teks pengantar):
[
  {
    "title": "[${cleanLevel}] Trik Sulap Jari Perkalian 9: Gak Perlu Hafalan! 🖐️✨",
    "level": "${cleanLevel}",
    "tag": "Trik Jari",
    "description": "Cukup tekuk satu jari, langsung ketemu puluhan dan satuan dalam 2 detik!"
  }
]
`;

        for (const c of candidates) {
          try {
            const model = genAI.getGenerativeModel({
              model: c,
              generationConfig: { responseMimeType: 'application/json' }
            });
            const result = await model.generateContent(prompt);
            const text = result.response.text()
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`[AI-TopicSearch] Berhasil mendapatkan ${parsed.length} topik langsung dari ${c}!`);
              return parsed;
            }
          } catch (mErr) {
            console.warn(`[AI-TopicSearch] Model ${c} gagal (${mErr.message}), mencoba kandidat lain...`);
          }
        }
      } catch (err) {
        console.warn('[AI-TopicSearch] Beralih ke Intelligent Math Topic Search Engine:', err.message);
      }
    }

    // 2. Intelligent Math Topic Search Engine
    return this.fallbackTopicSearch(cleanQuery, cleanLevel);
  }

  /**
   * Search Engine Topik Matematika Berbasis Database Cerdas & Variasi Dinamis
   */
  fallbackTopicSearch(query = '', level = 'SEMUA') {
    const q = query.toLowerCase();

    // Bank Topik Master Cerdas dengan Ragam Jenjang & Konsep
    const masterBank = [
      // === LEVEL SD ===
      {
        title: "[SD] Trik Ajaib Menghitung Persen: 16% dari 50 Sama Dengan 50% dari 16",
        level: "SD",
        tag: "Trik Persen",
        keywords: ["persen", "%", "sd", "hitung cepat", "komutatif"],
        description: "Balik angkanya: 50% dari 16 tinggal dibagi dua = 8 dalam 2 detik!"
      },
      {
        title: "[SD] Hitung Cepat Persen: 18% dari 50 Cukup Dibalik Jadi 50% dari 18!",
        level: "SD",
        tag: "Trik Persen",
        keywords: ["persen", "%", "sd", "hitung cepat"],
        description: "Setengah dari 18 adalah 9! Gampang banget tanpa kalkulator."
      },
      {
        title: "[SD] Rahasia Persen Sakti: 4% dari 75 Sama Dengan 75% dari 4 (Hasilnya 3!)",
        level: "SD",
        tag: "Trik Persen",
        keywords: ["persen", "%", "sd", "75"],
        description: "Tiga perempat dari 4 langsung ketemu 3 dalam sekejap!"
      },
      {
        title: "[SD] Rahasia Perkalian Cepat Angka 11 dengan Dua Digit Tanpa Coretan Kertas",
        level: "SD",
        tag: "Perkalian 11",
        keywords: ["perkalian", "11", "sd", "hitung cepat", "kali"],
        description: "Pisahkan angka depan & belakang, lalu jumlahkan di tengah (misal 35 x 11 = 385)."
      },
      {
        title: "[SD] Trik Kilat Perkalian 11: 42 × 11 Cuma Butuh 1 Detik Langsung Ketemu 462!",
        level: "SD",
        tag: "Perkalian 11",
        keywords: ["perkalian", "11", "sd", "kali"],
        description: "4 dan 2 dipisah, 4+2=6 sisipkan di tengah jadi 462."
      },
      {
        title: "[SD] Trik Jari Tangan Ajaib Menghafal Tabel Perkalian 9 Tanpa Menghafal",
        level: "SD",
        tag: "Perkalian 9 Jari",
        keywords: ["perkalian", "9", "jari", "sd", "tangan"],
        description: "Lipat jari yang dikali 9, hitung jari kiri sebagai puluhan dan kanan sebagai satuan!"
      },
      {
        title: "[SD] Cara Mudah Menjumlahkan Pecahan Berbeda Penyebut: Metode Sayap Kupu-Kupu",
        level: "SD",
        tag: "Pecahan Kupu-Kupu",
        keywords: ["pecahan", "kupu-kupu", "sd", "jumlah pecahan", "tambah"],
        description: "Kalikan silang kedua sayap dan kalikan bagian bawah tanpa perlu mencari KPK!"
      },
      {
        title: "[SD] Trik Kilat Menghitung Kuadrat Angka Berakhiran 5: 35², 65², 85² dalam 2 Detik",
        level: "SD",
        tag: "Kuadrat Akhiran 5",
        keywords: ["kuadrat", "pangkat", "5", "sd", "hitung cepat"],
        description: "Kalikan angka depan dengan kakaknya (3x4=12) lalu akhiri dengan 25 -> 1225!"
      },

      // === LEVEL SMP ===
      {
        title: "[SMP] Cara Menemukan Sisi Miring Tripel Pythagoras Tanpa Menghafal Rumus Rumit",
        level: "SMP",
        tag: "Pythagoras Sakti",
        keywords: ["pythagoras", "segitiga", "smp", "sisi miring", "geometri"],
        description: "Kenali pola rasio 3-4-5 dan kelipatannya! Alas 6 & tinggi 8 pasti sisi miring 10!"
      },
      {
        title: "[SMP] Rahasia Tripel Pythagoras 5-12-13 yang Sering Keluar di Ujian Sekolah",
        level: "SMP",
        tag: "Tripel Pythagoras",
        keywords: ["pythagoras", "segitiga", "smp", "ujian"],
        description: "Segitiga dengan sisi 5 dan 12 langsung ketemu sisi miring 13 tanpa menarik akar."
      },
      {
        title: "[SMP] Pemfaktoran Aljabar Cepat Bentuk x² + bx + c Menggunakan Metode Kotak",
        level: "SMP",
        tag: "Aljabar Cepat",
        keywords: ["aljabar", "pemfaktoran", "smp", "persamaan kuadrat", "kotak"],
        description: "Cari dua angka yang dijumlahkan jadi b dan dikalikan jadi c dalam 5 detik!"
      },
      {
        title: "[SMP] Rahasia Menjumlahkan Deret Angka 1 Sampai 100 dengan Trik Gauss Cuma 3 Detik",
        level: "SMP",
        tag: "Deret Gauss",
        keywords: ["deret", "gauss", "smp", "jumlah", "pola"],
        description: "Pasangkan ujung ke ujung: (1+100) x 50 pasang = 5050 tanpa kalkulator!"
      },
      {
        title: "[SMP] Trik Kilat Menentukan Digit Satuan dari 2 Pangkat 2026 Tanpa Menghitung",
        level: "SMP",
        tag: "Pola Eksponen",
        keywords: ["pangkat", "eksponen", "smp", "satuan", "modulus"],
        description: "Gunakan siklus 4 pola satuan eksponen (2, 4, 8, 6) dan bagi pangkatnya dengan 4!"
      },

      // === LEVEL SMA ===
      {
        title: "[SMA] Trik Telapak Tangan Mengingat Sudut Istimewa Trigonometri (Sin, Cos, Tan 0°-90°)",
        level: "SMA",
        tag: "Trigonometri 5 Jari",
        keywords: ["trigonometri", "sin", "cos", "tan", "sma", "sudut", "jari"],
        description: "Rumus sakti 1/2 akar jari bawah untuk Sin dan akar jari atas untuk Cos!"
      },
      {
        title: "[SMA] Rahasia Sifat Logaritma yang Paling Sering Muncul di Ujian Masuk PTN / SNBT",
        level: "SMA",
        tag: "Logaritma SNBT",
        keywords: ["logaritma", "log", "sma", "snbt", "utbk"],
        description: "Kuasai sifat a_log(b) x b_log(c) = a_log(c) untuk mencoret rantai logaritma panjang!"
      },
      {
        title: "[SMA] Konsep Dasar Turunan (Kalkulus) Dijelaskan Secara Visual Dalam 1 Menit",
        level: "SMA",
        tag: "Kalkulus Visual",
        keywords: ["kalkulus", "turunan", "sma", "gradien", "diferensial"],
        description: "Turunan adalah kemiringan garis singgung (gradien) saat jarak dua titik mendekati nol!"
      },
      {
        title: "[SMA] Aturan Cepat Determinan Matriks 3x3 Metode Sarrus Tanpa Khawatir Salah Tanda",
        level: "SMA",
        tag: "Matriks Sarrus",
        keywords: ["matriks", "determinan", "sarrus", "sma"],
        description: "Salin 2 kolom pertama ke samping kanan lalu kalikan diagonal positif dan negatif!"
      },
      {
        title: "[SMA] Trik Cepat Mencari Nilai Maksimum & Minimum Fungsi Kuadrat Tanpa Turunan",
        level: "SMA",
        tag: "Fungsi Kuadrat",
        keywords: ["fungsi kuadrat", "maksimum", "minimum", "puncak", "sma"],
        description: "Gunakan koordinat titik puncak x = -b/(2a) langsung ketemu nilai optimumnya!"
      },

      // === LEVEL KULIAHAN ===
      {
        title: "[KULIAHAN] Kenapa e^(iπ) + 1 = 0 Disebut Persamaan Matematika Paling Indah di Alam Semesta?",
        level: "KULIAHAN",
        tag: "Identitas Euler",
        keywords: ["euler", "pi", "imajiner", "kuliah", "kalkulus", "keindahan"],
        description: "Menggabungkan 5 konstanta terpenting (e, i, pi, 1, 0) dalam satu kesatuan absolut!"
      },
      {
        title: "[KULIAHAN] Kenapa Pembagian dengan Angka Nol Tak Terdefinisi dan Bukan Tak Hingga?",
        level: "KULIAHAN",
        tag: "Pembagian Nol",
        keywords: ["pembagian nol", "nol", "limit", "kuliah", "definisi"],
        description: "Jika 1/0 = c maka 0 x c = 1, yang merusak seluruh hukum aritmatika aljabar!"
      },
      {
        title: "[KULIAHAN] Kenapa 0 Faktorial (0!) Sama Dengan 1? Pembuktian Logika Fungsi Gamma",
        level: "KULIAHAN",
        tag: "Misteri 0 Faktorial",
        keywords: ["faktorial", "0!", "gamma", "kuliah", "kombinatorika"],
        description: "Pola n! = (n+1)! / (n+1). Saat n=0, maka 0! = 1! / 1 = 1!"
      },
      {
        title: "[KULIAHAN] Paradoks Monty Hall: Alasan Matematis Kenapa Kamu Wajib Ganti Pilihan Pintu",
        level: "KULIAHAN",
        tag: "Peluang Monty Hall",
        keywords: ["monty hall", "paradoks", "peluang", "kuliah", "statistika"],
        description: "Peluang pintu pertama hanya 1/3, sedangkan berpindah pintu melipatgandakan peluang jadi 2/3!"
      },
      {
        title: "[KULIAHAN] Misteri Rasio Emas Phi (1.618) dan Hubungan Ajaibnya dengan Deret Fibonacci",
        level: "KULIAHAN",
        tag: "Rasio Emas Phi",
        keywords: ["phi", "rasio emas", "fibonacci", "kuliah", "geometri"],
        description: "Bagi dua angka Fibonacci berurutan (misal 55/34, 89/55) dan kamu akan selalu mendekati 1.618!"
      }
    ];

    // Filter berdasarkan level jika dispesifikasikan
    let filtered = masterBank;
    if (level && level !== 'SEMUA') {
      filtered = filtered.filter(item => item.level.toUpperCase() === level.toUpperCase());
    }

    // Filter berdasarkan kecocokan query pencarian
    if (q) {
      const scored = filtered.map(item => {
        let score = 0;
        const text = `${item.title} ${item.tag} ${item.description} ${(item.keywords || []).join(' ')}`.toLowerCase();
        
        // Exact match
        if (text.includes(q)) score += 10;
        
        // Word token match
        const tokens = q.split(' ').filter(Boolean);
        for (const token of tokens) {
          if (text.includes(token)) score += 3;
        }

        return { item, score };
      });

      const matched = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);

      if (matched.length > 0) {
        return matched.slice(0, 5);
      }
    }

    // Jika tidak ada query spesifik atau hasil kosong, acak dari filtered list
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }
}

module.exports = new AiGeneratorService();
