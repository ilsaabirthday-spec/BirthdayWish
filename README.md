# 🎂 Happy Birthday, Ilsaa — a little birthday microsite

A five-page birthday site with a cursor-tracking character on the homepage.

## Pages

| File | What it is |
|---|---|
| `index.html` | Homepage — big name, cursor-tracking character, nav cards |
| `wish.html` | Your birthday wish for her |
| `letter.html` | The letter from you to her |
| `photos.html` | Photo gallery of her |
| `message.html` | The closing special message |

Open `index.html` in a browser (or run `python -m http.server` in this folder and visit `http://localhost:8000`).

## The only files you need to edit

1. **Her name** — `assets/js/config.js` → change `name: "Ilsaa"` (already set ❤️).
   It's injected into the big headline, the logo and every page title.

2. **Background music** — drop your song at:
   ```
   assets/music/birthday.mp3
   ```
   The ♫ button on the homepage and every page toggles it. Music starts on her
   first click/tap (browsers block autoplay) and remembers her choice.

3. **Her photos** — put them in:
   ```
   assets/img/photos/1.jpg, 2.jpg, 3.jpg ...
   ```
   Then in `photos.html` swap the placeholder `.frame` backgrounds:
   ```html
   <div class="frame" data-cap="us, that night"
        style="background-image:url('assets/img/photos/1.jpg')"></div>
   ```

4. **The real words** — each page has `<!-- EDIT ME -->` comments marking where
   the wish / letter / message text goes.

5. **The character photo** — `assets/img/character.png` is a background-removed
   cut-out of the girl you pasted (original kept at `assets/img/girl-src.png`).
   If you ever swap the photo, also update the two eye positions in `index.html`
   (`data-cx` / `data-cy` on the `.eye` spans) and `SRC_W` / `SRC_H` in
   `assets/js/main.js`. Add `?grid` to the homepage URL to see a calibration grid.

## Fun bits on the homepage

- Her **face and eyes follow the cursor** — turn/move it and she watches you.
- When the mouse is still she glances around on her own.
- The four cards bottom-right **stagger in, tilt in 3D and shine** on hover,
  and link to the four content pages.
- Custom ring cursor, floating avatar stack, orbiting sparkles.
