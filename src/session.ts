import { Story } from "inkjs";
import data from "./story.json" with { type: "json" };
export type Room = "hall" | "archive" | "gallery" | "workshop" | "ending";
export type Frame = {
  room: Room;
  title: string;
  paragraphs: string[];
  choices: { index: number; text: string }[];
  status: "playing" | "won" | "lost";
  ending: string;
  chances: number;
  assisted: boolean;
  seals: boolean[];
  panels: number[];
  weights: boolean[];
};
export class Session {
  private story: Story;
  steps = 0;
  notes = new Map<Room, string[]>();
  frame: Frame;
  constructor() {
    this.story = new Story(JSON.stringify(data));
    this.story.onError = (message) => {
      throw Error(message);
    };
    this.frame = this.read();
  }
  private read(): Frame {
    const paragraphs: string[] = [],
      tags: string[] = [];
    let lines = 0;
    while (this.story.canContinue) {
      if (++lines > 128)
        throw Error("Narrativa excedeu o limite de continuação.");
      const line = this.story.Continue()?.trim();
      if (line) paragraphs.push(line);
      tags.push(...(this.story.currentTags ?? []));
    }
    const meta = Object.fromEntries(
      tags.map((t) => {
        const colon = t.indexOf(":");
        return [t.slice(0, colon), t.slice(colon + 1).trim()];
      }),
    );
    const room = (
      ["hall", "archive", "gallery", "workshop", "ending"].includes(meta.room)
        ? meta.room
        : "hall"
    ) as Room;
    const val = (key: string) => this.story.variablesState.$(key);
    const frame: Frame = {
      room,
      title: meta.title || "Salão 17",
      paragraphs,
      choices: this.story.currentChoices.map((c) => ({
        index: c.index,
        text: c.text.trim(),
      })),
      status:
        meta.result === "won"
          ? "won"
          : meta.result === "lost"
            ? "lost"
            : "playing",
      ending: meta.ending || "",
      chances: Number(val("chances")),
      assisted: Boolean(val("assisted")),
      seals: ["archive", "gallery", "workshop"].map((k) => Boolean(val(k))),
      panels: ["panel_a", "panel_b", "panel_c"].map((k) => Number(val(k))),
      weights: ["weight_two", "weight_three", "weight_five"].map((k) =>
        Boolean(val(k)),
      ),
    };
    if (meta.note) this.notes.set(room, [...paragraphs]);
    if (frame.status === "playing" && frame.choices.length === 0)
      throw Error("A narrativa terminou sem um desfecho.");
    return frame;
  }
  choose(index: number): Frame {
    if (
      this.frame.status !== "playing" ||
      !Number.isInteger(index) ||
      !this.frame.choices.some((c) => c.index === index)
    )
      return this.frame;
    this.story.ChooseChoiceIndex(index);
    this.steps++;
    this.frame = this.read();
    return this.frame;
  }
}
export type Stat = { played: number; wins: number; best: number | null };
export type Save = {
  version: 1;
  sound: boolean;
  motion: boolean;
  stats: { solo: Stat; guided: Stat };
};
export function blank(): Save {
  return {
    version: 1,
    sound: false,
    motion: false,
    stats: {
      solo: { played: 0, wins: 0, best: null },
      guided: { played: 0, wins: 0, best: null },
    },
  };
}
export function readSave(raw: string | null): Save {
  try {
    const s = JSON.parse(raw || "null"),
      out = blank();
    if (
      s?.version !== 1 ||
      typeof s.sound !== "boolean" ||
      typeof s.motion !== "boolean"
    )
      return out;
    for (const key of ["solo", "guided"] as const) {
      const t = s.stats?.[key];
      if (
        !t ||
        !Number.isInteger(t.played) ||
        t.played < 0 ||
        t.played > 1000000 ||
        !Number.isInteger(t.wins) ||
        t.wins < 0 ||
        t.wins > t.played ||
        (t.best !== null &&
          (!Number.isInteger(t.best) || t.best < 1 || t.best > 1000000)) ||
        (t.wins === 0 && t.best !== null) ||
        (t.wins > 0 && t.best === null)
      )
        return blank();
      out.stats[key] = { played: t.played, wins: t.wins, best: t.best };
    }
    out.sound = s.sound;
    out.motion = s.motion;
    return out;
  } catch {
    return blank();
  }
}
export function record(save: Save, session: Session): Save {
  if (session.frame.status === "playing") return save;
  const key = session.frame.assisted ? "guided" : "solo",
    old = save.stats[key];
  if (old.played >= 1000000) return save;
  const win = session.frame.status === "won";
  return {
    ...save,
    stats: {
      ...save.stats,
      [key]: {
        played: old.played + 1,
        wins: old.wins + (win ? 1 : 0),
        best: win
          ? Math.min(old.best ?? Infinity, Math.min(1000000, session.steps))
          : old.best,
      },
    },
  };
}
