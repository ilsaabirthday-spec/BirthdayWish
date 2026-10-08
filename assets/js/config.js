/* ============================================================
   BIRTHDAY SITE CONFIG — the only file you need to edit for
   the basics. (Music files go in assets/music/, photos go to
   assets/img/photos/)
   ============================================================ */
window.SITE = {
  // 👉 her name — shows up in the big letters, the logo, and page titles
  name: "Ilsaa",

  // 👉 background music — a different song per page
  music: {
    home:    "assets/music/home.mp3",      // homepage — Drama Queen
    wish:    "assets/music/birthday.mp3",  // wish page — Birthday Bash
    letter:  "assets/music/letter.mp3",    // letter page — Dildara
    photos:  "assets/music/gallery.mp3",   // photos page — Sharmeli (gallery)
    message: "assets/music/message.mp3",   // message page — Tere Jaisa Yaar Kahan
  },

  // 👉 fallback if a page body class isn't in the map above
  musicDefault: "assets/music/birthday.mp3",
};
