import type { Frame } from "./session.ts";
export function artwork(f: Frame | null): string {
  const room = f?.room ?? "hall",
    panels = f?.panels ?? [0, 2, 1],
    weights = f?.weights ?? [false, false, false];
  const defs =
    '<defs><linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#cad6e5" stop-opacity=".25"/><stop offset="1" stop-color="#cad6e5" stop-opacity="0"/></linearGradient><linearGradient id="door"><stop stop-color="#bdcada"/><stop offset="1" stop-color="#6e829e"/></linearGradient><pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".4" fill="#bfcbd8" opacity=".13"/></pattern></defs>';
  let content = "";
  if (room === "hall")
    content =
      '<path d="M45 540V95L200 30l155 65v445" fill="#1d2330" stroke="#718095"/><path d="m45 95 155 70 155-70M200 165v375" fill="none" stroke="#4b586d"/><path d="M65 470V235q0-70 48-70t48 70v235M239 470V235q0-70 48-70t48 70v235" fill="#10141e" stroke="#a0adbd"/><path d="M171 510V273q0-52 29-52t29 52v237" fill="#111725" stroke="#8c9bad"/><path d="m200 30-80 440h190Z" fill="url(#beam)"/><path d="m45 540 155-75 155 75M45 500l155-35 155 35" stroke="#66778d" fill="none"/><text x="200" y="206" text-anchor="middle" fill="#d8dedf" font-size="18" font-family="Georgia">17</text><circle cx="210" cy="389" r="3" fill="#dc6254"/>';
  if (room === "archive")
    content =
      '<path d="M45 90h310v435H45Z" fill="#1b2230" stroke="#8997a7"/>' +
      [0, 1, 2]
        .map(
          (n) =>
            `<g><path d="M65 ${120 + n * 120}h270v94H65Z" fill="#101722" stroke="#8997a7"/><path d="M170 ${157 + n * 120}h60v15h-60Z" fill="#202b3d" stroke="#b1bdcb"/><text x="100" y="${176 + n * 120}" fill="#b9c5d1" font-size="22">${["✳", "≈", "⌁"][n]}</text><text x="300" y="${176 + n * 120}" fill="#e3e4dd" font-size="22" text-anchor="end">${[4, 2, 7][n]}</text></g>`,
        )
        .join("") +
      '<path d="m45 525 45 30h225l40-30" fill="#111622" stroke="#5c708a"/><path d="m55 75 290 410 55-410Z" fill="url(#beam)"/>';
  if (room === "gallery")
    content =
      '<path d="M25 510V70h350v440" fill="#1d2534" stroke="#76889f"/><path d="m25 510 175-40 175 40" stroke="#7d8ea4" fill="none"/>' +
      [
        { x: 50, y: 220, w: 80, h: 145 },
        { x: 150, y: 150, w: 105, h: 260 },
        { x: 275, y: 240, w: 72, h: 105 },
      ]
        .map(
          (p, i) =>
            `<g><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#111823" stroke="#c1c9d2"/><rect x="${p.x + 7}" y="${p.y + 7}" width="${p.w - 14}" height="${p.h - 14}" fill="#202e43" stroke="#546984"/><g class="panel-arrow" transform="rotate(${(panels[i] ?? 0) * 90} ${p.x + p.w / 2} ${p.y + p.h / 2})"><path d="m${p.x + p.w / 2} ${p.y + p.h / 2 - 25} -13 29 13-7 13 7Z" fill="#d4dee7"/></g><text x="${p.x + p.w / 2}" y="${p.y + p.h + 27}" fill="#b6c4d7" font-size="15" text-anchor="middle">${"ABC"[i]}</text></g>`,
        )
        .join("") +
      '<path d="m210 30-90 450h245Z" fill="url(#beam)"/>';
  if (room === "workshop")
    content =
      '<path d="M35 500h330v35H35ZM63 535v35m274-35v35" fill="#283345" stroke="#8799b1"/><circle cx="200" cy="160" r="58" fill="#1e2b40" stroke="#b9c6d7"/>' +
      Array.from(
        { length: 8 },
        (_, i) =>
          `<path transform="rotate(${i * 45} 200 160)" d="M200 120v-15" stroke="#b9c6d7"/>`,
      ).join("") +
      '<path d="M200 280v150m-90 0h180m-135-145h90m-90 0-65 140m155-140 65 140" fill="none" stroke="#b4c0cf" stroke-width="2"/><path d="M62 425h55q0 25-28 25t-27-25m221 0h55q0 25-27 25t-28-25" fill="#5d6f8b" stroke="#c6cbd2"/>' +
      [2, 3, 5]
        .map(
          (n, i) =>
            `<g><path d="M${100 + i * 75} ${weights[i] ? 400 : 480}h45l-6-40h-33Z" fill="${weights[i] ? "#c66054" : "#45556f"}" stroke="#bec6d1"/><text x="${122 + i * 75}" y="${weights[i] ? 387 : 467}" text-anchor="middle" fill="#f0e7db" font-size="18">${n}</text></g>`,
        )
        .join("");
  if (room === "ending")
    content =
      '<path d="M85 540V160q0-100 115-100t115 100v380" fill="#111722" stroke="#aab9ca"/><path d="M110 520V170q0-76 90-76v426Z" fill="url(#door)"/><path d="m200 94 96 61v365l-96-30Z" fill="#233147" stroke="#7e94ad"/><path d="M110 520 20 590h350l-170-100" fill="url(#beam)"/><text x="200" y="46" text-anchor="middle" fill="#d1d8dc" font-family="Georgia" font-size="21">17</text><circle cx="220" cy="319" r="4" fill="#d56b5b"/>';
  return `<svg viewBox="0 0 400 620" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}<rect width="400" height="620" fill="#151c28"/>${content}<rect width="400" height="620" fill="url(#grain)"/><path d="M22 15H7v15M378 15h15v15M22 605H7v-15m371 15h15v-15" stroke="#748198" fill="none"/></svg>`;
}
