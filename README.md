V27 UPDATE
- Kotak petunjuk kiri atas diperbesar, border dipertebal, dan dibuat lebih mewah.
- Tampilan login dibuat lebih menarik dengan pill promo, panel partner yang lebih premium, dan kotak keunggulan permainan.

V26 UPDATE
- Halaman login ditambahkan logo IMBASLOT dengan panel premium.
- Saat menang, hasil sekarang menampilkan tombol CHAT PETUGAS ADMIN PENYELENGGARA menuju t.me/pusat_officialbot.

V24 REVISION
- Kotak pengganggu di pojok kiri atas dihilangkan (money mask dimatikan).
- Petunjuk dipindah ke pojok kiri atas agar area tengah-bawah lebih bersih.

V23 REVISION
- Kotak profil/PEMAIN TAMU di pojok kiri atas dihilangkan بالكامل.
- Tombol kanan atas tetap dipertahankan dan disejajarkan ke kanan.

V22 REVISION
- Banner petunjuk atas dihilangkan.
- Petunjuk gameplay dipindah ke pojok kiri bawah agar tidak mengganggu area atas.

V21 REVISION
- Target yang kena tembak sekarang ditutup efek ledakan/pecah yang opak supaya celengan asli tidak kelihatan masih berdiri.
- Shell pecah besar juga muncul langsung di area target.

V20 REVISION
- Pig yang kena tembak sekarang langsung disembunyikan agar efek pecah terlihat jelas.
- Pecahan diperbesar, diperbanyak, dan dibuat lebih buyar ke berbagai arah.
- Delay hasil diperpanjang supaya animasi pecah sempat terlihat.

V19 REVISION
- Lingkaran seleksi diganti menjadi aim marker kecil di target.
- Efek pecah piggy dibuat lebih realistis: shell pecah kiri-kanan, lebih banyak pecahan, dan coin fragments berhamburan.

V18 REVISION
- Meriam dikembalikan ke versi normal/rapi seperti V15.
- Garis aim dan crosshair disembunyikan.
- Hint ditempatkan di atas.
- Angka uang di pojok atas ditutupi.
- Efek pecah piggy dibuat lebih cepat dan berhamburan.

V15 REVISION: cannon extended deeper to the very bottom edge so it reads like a natural POV cannon coming from below, instead of looking like a cut pasted object.

V14 REVISION: cannon repositioned upward and resized so the whole lower body reads naturally in POV and no longer looks cut off at the bottom edge.

V13 REVISION: cannon is blended into the scene more realistically with an integrated socket, front pedestal, and deeper floor shadow so it no longer looks like a pasted sticker.

V12 REVISION: cannon body extended visually all the way to the bottom so no small visual defects are visible under the cannon.

V11 SYNC UPDATE: cannon now feels more united with the scene. It not only rotates, but also shifts left-right and up-down in sync with the selected piggy, including diagonal movement for upper-left and upper-right targets.

V10 FIX: removed the faulty cannon clip-path that created a large transparent hole. The cannon sprite now uses its native transparent alpha, so the body remains complete.

V9 FIX: cleaned the small visual defect near the bottom side of the cannon by clipping stray sprite edges, leaving only the cannon shape visible.

V8 FINAL CANNON FIX: the static cannon is removed from the background, and the movable cannon sprite now has a transparent background. Only one cannon is visible.

V7 FIX: static cannon removed from the gameplay background. Only the moving cannon remains; old cannon mask is disabled.

V6 FIX: removed the large dark shadow under the cannon and replaced it with a much smaller low oval mask near the base only.

V5 FIX: removed the large dark cannon cover that was blocking the middle UI; replaced with a slimmer center mask.

V4 FIX: cannon background ghosting removed with a larger mask so only the moving cannon is visible.

# PIGGY GOLD PLAYABLE FINAL

Versi demo yang dapat dimainkan langsung tanpa Firebase dan tanpa server lokal.

## Cara menjalankan

### Windows
1. Ekstrak ZIP.
2. Klik dua kali `START_GAME.bat`.
3. Masukkan email demo atau pilih **MAIN SEBAGAI TAMU**.
4. Tekan tombol **START** pada gambar.
5. Pilih salah satu dari 6 Piggies.
6. Tekan tombol **SHOOT** pada gambar.

Anda juga bisa membuka `index.html` langsung dengan Chrome atau Edge.

## Fitur
- Login email lokal untuk mode demo.
- Layar START sesuai desain Piggy Gold.
- Enam target Piggy dapat dipilih.
- Crosshair dan garis aim bergerak.
- Animasi muzzle flash, proyektil, impact, retak, pecah, koin, dan pecahan emas.
- Hadiah: 500, 5.000, 10.000, 20.000, 30.000, 50.000, atau ZONK.
- Layar hasil menang dan ZONK.
- Tombol main ulang, reset, suara, dan keluar.
- Responsif untuk Android, iPhone, dan desktop.

## Catatan penting
Randomisasi hadiah masih berjalan di browser dan cocok untuk demo/MVP. Untuk hadiah uang sungguhan, hasil wajib ditentukan serta diverifikasi dari backend/server agar tidak dapat dimanipulasi pemain.


## Update Smooth Cannon V3

- Meriam sekarang merupakan sprite terpisah dan benar-benar berputar mengikuti target kiri, tengah, atau kanan.
- Titik keluarnya peluru mengikuti posisi ujung meriam setelah berputar.
- Ada animasi charge, glow, recoil, dan kembali ke posisi semula saat menembak.
- Ditambahkan idle motion, cahaya lampion, sweeping light, koin jatuh, target glow, dan transisi masuk agar permainan tidak terasa kaku.
- Jalankan `START_GAME.bat`, pilih profil demo, tekan START, pilih satu Piggy, lalu tekan SHOOT.
