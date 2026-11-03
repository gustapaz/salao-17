import { test } from "node:test";
import assert from "node:assert/strict";
import { Session, blank, readSave, record } from "../src/session.ts";
function pick(s: Session, t: string) {
  const c = s.frame.choices.find((c) => c.text === t);
  assert.ok(c, `Missing ${t}: ${s.frame.choices.map((c) => c.text)}`);
  return s.choose(c.index);
}
function seals(s: Session) {
  pick(s, "Entrar no Arquivo");
  pick(s, "Validar 427");
  pick(s, "Voltar ao átrio");
  pick(s, "Entrar na Galeria");
  for (const p of ["A", "B", "B", "C", "C"]) pick(s, `Girar o painel ${p}`);
  pick(s, "Validar os painéis");
  pick(s, "Voltar ao átrio");
  pick(s, "Entrar na Oficina");
  pick(s, "Colocar ou retirar o peso 3");
  pick(s, "Colocar ou retirar o peso 5");
  pick(s, "Validar a balança");
  pick(s, "Voltar ao átrio");
}
for (const [choice, ending] of [
  ["Levar o caderno para a rua", "caderno"],
  ["Deixar o caderno para o próximo visitante", "guardiao"],
])
  test(`Full visit ${ending}`, () => {
    const s = new Session();
    assert.equal(
      s.frame.choices.some((c) => c.text.includes("três selos")),
      false,
    );
    seals(s);
    assert.deepEqual(s.frame.seals, [true, true, true]);
    assert.equal(s.frame.chances, 3);
    pick(s, "Usar os três selos no Salão 17");
    pick(s, choice);
    assert.equal(s.frame.status, "won");
    assert.equal(s.frame.ending, ending);
    const frame = s.frame;
    assert.equal(s.choose(0), frame);
    const save = record(blank(), s);
    assert.equal(save.stats.solo.wins, 1);
    assert.deepEqual(readSave(JSON.stringify(save)), save);
  });
test("Third wrong validation ends visit and records a loss", () => {
  const s = new Session();
  pick(s, "Entrar no Arquivo");
  for (let i = 0; i < 3; i++) {
    pick(s, "Validar 247");
    assert.equal(s.frame.chances, 2 - i);
    if (i < 2) pick(s, "Voltar à fechadura");
  }
  assert.equal(s.frame.status, "lost");
  assert.equal(record(blank(), s).stats.solo.played, 1);
  assert.equal(record(blank(), s).stats.solo.wins, 0);
});
test("Clues, guided route, invalid choice and circular panels", () => {
  const s = new Session();
  const f = s.frame;
  for (const n of [-1, 9, NaN, 0.5]) assert.equal(s.choose(n), f);
  pick(s, "Entrar no Arquivo");
  pick(s, "Ler a anotação do Arquivo");
  assert.equal(s.notes.size, 1);
  pick(s, "Voltar à fechadura");
  pick(s, "Pedir pista do Arquivo");
  assert.equal(s.frame.assisted, true);
  pick(s, "Voltar à fechadura");
  pick(s, "Voltar ao átrio");
  seals(s);
  pick(s, "Usar os três selos no Salão 17");
  pick(s, "Levar o caderno para a rua");
  assert.equal(record(blank(), s).stats.guided.wins, 1);
  assert.equal(record(blank(), s).stats.solo.played, 0);
  const g = new Session();
  pick(g, "Entrar na Galeria");
  for (let i = 0; i < 4; i++) pick(g, "Girar o painel A");
  assert.equal(g.frame.panels[0], 0);
  assert.equal(g.frame.chances, 3);
});
test("Corrupt local saves are rejected", () => {
  for (const raw of [
    "invalid",
    "null",
    "{}",
    JSON.stringify({
      ...blank(),
      stats: { solo: { played: -1, wins: 0, best: null } },
    }),
  ])
    assert.deepEqual(readSave(raw), blank());
});
test("Validation budget is shared across rooms and solved seals cannot be duplicated", () => {
  const s = new Session();
  pick(s, "Entrar na Galeria");
  pick(s, "Validar os painéis");
  assert.equal(s.frame.chances, 2);
  pick(s, "Voltar aos painéis");
  pick(s, "Voltar ao átrio");
  pick(s, "Entrar na Oficina");
  for (const n of [2, 3, 5]) pick(s, `Colocar ou retirar o peso ${n}`);
  pick(s, "Validar a balança");
  assert.equal(s.frame.chances, 1);
  pick(s, "Voltar à balança");
  pick(s, "Colocar ou retirar o peso 2");
  pick(s, "Validar a balança");
  assert.deepEqual(s.frame.seals, [false, false, true]);
  pick(s, "Voltar ao átrio");
  pick(s, "Entrar na Oficina");
  assert.ok(!s.frame.choices.some(c => c.text === "Validar a balança"));
  assert.equal(s.frame.chances, 1);
  pick(s, "Voltar ao átrio");
  pick(s, "Entrar no Arquivo");
  pick(s, "Validar 742");
  assert.equal(s.frame.status, "lost");
});
