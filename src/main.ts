import { Session, readSave, record, type Save } from "./session.ts";
import { artwork } from "./art.ts";
import "./style.css";
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const ui = {
  play: $("#play"),
  title: $("#title"),
  text: $("#text"),
  choices: $("#choices"),
  art: $("#art"),
  dialog: $<HTMLDialogElement>("#dialog"),
  body: $("#dialog-body"),
  notebook: $<HTMLButtonElement>("#notebook"),
  pause: $<HTMLButtonElement>("#pause"),
  sound: $("#sound"),
  motion: $("#motion"),
};
let session: Session | null = null,
  paused = false,
  recorded = false,
  save: Save,
  audio: AudioContext | null = null,
  voices = 0,
  opener: HTMLElement | null = null;
try {
  save = readSave(localStorage.getItem("salao17.save.v1"));
} catch {
  save = readSave(null);
}
const roomNames = {
    hall: "ÁTRIO",
    archive: "ARQUIVO",
    gallery: "GALERIA",
    workshop: "OFICINA",
    ending: "SALÃO 17",
  },
  roomNumbers = {
    hall: "00",
    archive: "01",
    gallery: "02",
    workshop: "03",
    ending: "17",
  };
function persist() {
  try {
    localStorage.setItem("salao17.save.v1", JSON.stringify(save));
  } catch {}
}
function tone(end = false) {
  if (!save.sound || voices >= 4) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const o = audio.createOscillator(),
      gain = audio.createGain();
    o.type = "sine";
    o.frequency.value = end ? 440 : 196;
    gain.gain.setValueAtTime(0.02, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.16);
    o.connect(gain).connect(audio.destination);
    voices++;
    o.onended = () => {
      voices--;
      o.disconnect();
      gain.disconnect();
    };
    o.start();
    o.stop(audio.currentTime + 0.17);
  } catch {}
}
function preferences() {
  ui.sound.setAttribute("aria-pressed", String(save.sound));
  ui.sound.textContent = save.sound ? "Som ligado" : "Som desligado";
  ui.motion.setAttribute("aria-pressed", String(save.motion));
  document.body.classList.toggle("reduced", save.motion);
  for (const key of ["solo", "guided"] as const) {
    const s = save.stats[key];
    $("#" + key + "-record").textContent =
      `${key === "solo" ? "Solo" : "Com pista"}: ${s.played} ${s.played === 1 ? "visita" : "visitas"} · ${s.wins} ${s.wins === 1 ? "final de vitória" : "finais de vitória"} · melhor ${s.best === null ? "—" : s.best + " escolhas"}`;
  }
}
function paragraphs(parent: HTMLElement, text: string[]) {
  parent.replaceChildren(
    ...text.map((value) => {
      const p = document.createElement("p");
      p.textContent = value;
      return p;
    }),
  );
}
function showFrame() {
  if (!session) return;
  const f = session.frame;
  ui.title.textContent = f.title;
  paragraphs(ui.text, f.paragraphs);
  $("#scene-name").textContent = roomNames[f.room];
  $("#scene-number").textContent = roomNumbers[f.room];
  $("#chapter").textContent =
    f.status === "playing" ? "REGISTRO DA VISITA" : "DESFECHO";
  $("#route-label").textContent = f.assisted ? "ROTA COM PISTA" : "ROTA SOLO";
  ui.art.innerHTML = artwork(f);
  const cardinal = ["NORTE", "LESTE", "SUL", "OESTE"];
  $("#mechanism").textContent =
    f.room === "gallery"
      ? `A: ${cardinal[f.panels[0]]} / B: ${cardinal[f.panels[1]]} / C: ${cardinal[f.panels[2]]}`
      : f.room === "workshop"
        ? `SOMA NO PRATO: ${f.weights.reduce((n, on, i) => n + (on ? [2, 3, 5][i] : 0), 0)} / ROSÁCEA: 8 RAIOS`
        : f.room === "archive"
          ? "ESTRELA 4 / ONDA 2 / RAMO 7"
          : "AS PISTAS ESTÃO TAMBÉM NO TEXTO.";
  $("#seal-count").textContent = f.seals.filter(Boolean).length + "/3";
  $("#chances").textContent = String(f.chances);
  document.querySelectorAll("#seals li").forEach((el, i) => {
    el.classList.toggle("found", f.seals[i]);
    el.setAttribute(
      "aria-label",
      `${["Cobre", "Vidro", "Pedra"][i]}: ${f.seals[i] ? "recuperado" : "a encontrar"}`,
    );
  });
  $("#steps").textContent =
    `${session.steps} ${session.steps === 1 ? "ESCOLHA" : "ESCOLHAS"}`;
  ui.notebook.disabled = session.notes.size === 0;
  $("#note-count").textContent = String(session.notes.size);
  ui.pause.disabled = f.status !== "playing";
  $("#ending").hidden = f.status === "playing";
  ui.choices.replaceChildren();
  for (const c of f.choices) {
    const button = document.createElement("button");
    button.setAttribute("aria-label", c.text);
    button.dataset.choice = String(c.index);
    const n = document.createElement("span");
    n.textContent = String(c.index + 1).padStart(2, "0");
    const label = document.createElement("span");
    label.textContent = c.text;
    const arrow = document.createElement("span");
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");
    button.append(n, label, arrow);
    button.addEventListener("click", () => choose(c.index));
    ui.choices.append(button);
  }
  if (f.status !== "playing") {
    $("#ending-label").textContent =
      f.status === "won" ? "VISITA CONCLUÍDA" : "VISITA INTERROMPIDA";
    $("#ending-detail").textContent =
      `${session.steps} escolhas · ${f.assisted ? "com pista" : "sem pistas"} · ${f.status === "won" ? (f.ending === "caderno" ? "O caderno aberto." : "O guardião da próxima visita.") : "Uma nova visita continua disponível."}`;
    if (!recorded) {
      recorded = true;
      save = record(save, session);
      persist();
    }
    const b = document.createElement("button");
    b.id = "replay";
    b.className = "begin";
    b.textContent = "Abrir outra visita ↗";
    b.addEventListener("click", begin);
    ui.choices.append(b);
  }
  preferences();
}
function begin() {
  try {
    session = new Session();
    recorded = false;
    $("#error").hidden = true;
    showFrame();
    ui.play.focus({ preventScroll: true });
  } catch {
    failure();
  }
}
function failure() {
  $("#error").hidden = false;
  ui.pause.disabled = true;
  ui.choices.replaceChildren();
}
function choose(index: number) {
  if (!session || paused || session.frame.status !== "playing") return;
  try {
    const room = session.frame.room,
      old = session.frame;
    session.choose(index);
    if (session.frame === old) return;
    showFrame();
    tone(session.frame.status !== "playing");
    ui.play.focus({ preventScroll: true });
    if (room !== session.frame.room)
      ui.play.scrollIntoView({
        block: "start",
        behavior:
          save.motion || matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
      });
  } catch {
    failure();
  }
}
function addText(text: string) {
  const p = document.createElement("p");
  p.textContent = text;
  ui.body.append(p);
}
function open(kind: "pause" | "help" | "notes") {
  if (ui.dialog.open) return;
  opener =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  paused = true;
  document.body.classList.add("paused");
  ui.body.replaceChildren();
  if (kind === "help") {
    $("#dialog-label").textContent = "SALÃO 17 / MANUAL DA VISITA";
    $("#dialog-title").textContent = "Observe antes de validar.";
    addText(
      "Explore Arquivo, Galeria e Oficina a partir do átrio. Cada sala guarda um selo. Os três abrem o Salão 17.",
    );
    addText(
      "Você tem três tentativas de validação para a visita inteira. Observar, girar, selecionar pesos e voltar não gasta tentativas. A terceira validação errada encerra a visita.",
    );
    addText(
      "As pistas também estão em texto. Ler anotações as guarda no Caderno. Pedir pista revela ajuda e marca o resultado como assistido; abrir este manual não marca.",
    );
    addText(
      "Clique/toque nas escolhas ou Tab/Enter. Números 1–9 funcionam com a narrativa focada. Escape pausa ou fecha este manual. Não há cronômetro.",
    );
    addText(
      "Há dois finais de vitória e um de derrota. Resultados locais ficam separados entre solo e com pista. A visita em andamento não é salva; recarregar começa uma nova.",
    );
  } else if (kind === "notes") {
    $("#dialog-label").textContent = "SALÃO 17 / CADERNO DA VISITA";
    $("#dialog-title").textContent = "O que ficou anotado.";
    for (const [room, text] of session?.notes ?? []) {
      const h = document.createElement("h3");
      h.textContent = roomNames[room];
      ui.body.append(h);
      for (const p of text) addText(p);
    }
  } else {
    $("#dialog-label").textContent = "SALÃO 17 / INTERVALO";
    $("#dialog-title").textContent = "A sala pode esperar.";
    addText(
      "Nenhuma escolha avança enquanto você estiver fora. Retome quando quiser.",
    );
  }
  $("#resume").textContent =
    kind === "pause" ? "Retomar visita ↗" : "Entendi, voltar ↗";
  ui.dialog.showModal();
}
function close() {
  ui.dialog.close();
  paused = false;
  document.body.classList.remove("paused");
  if (session) ui.play.focus({ preventScroll: true });
  else opener?.focus();
}
$("#begin").addEventListener("click", begin);
$("#restart").addEventListener("click", begin);
ui.pause.addEventListener("click", () => open("pause"));
$("#help").addEventListener("click", () => open("help"));
ui.notebook.addEventListener("click", () => open("notes"));
$("#resume").addEventListener("click", close);
ui.dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  close();
});
ui.play.addEventListener("keydown", (e) => {
  if (paused || !session) return;
  if (e.key === "Escape" && session.frame.status === "playing") {
    e.preventDefault();
    open("pause");
  } else if (/^[1-9]$/.test(e.key) && session.frame.status === "playing") {
    e.preventDefault();
    const c = session.frame.choices[Number(e.key) - 1];
    if (c) choose(c.index);
  }
});
ui.sound.addEventListener("click", () => {
  save = { ...save, sound: !save.sound };
  persist();
  preferences();
  tone();
});
ui.motion.addEventListener("click", () => {
  save = { ...save, motion: !save.motion };
  persist();
  preferences();
});
const blur = () => {
  if (session?.frame.status === "playing") open("pause");
};
window.addEventListener("blur", blur);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) blur();
});
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) void audio?.close();
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted) blur();
});
ui.art.innerHTML = artwork(null);
preferences();
