# Validação

Executada em 02/11/2026.

- `npm test`: cinco testes passaram, exercitando os dois finais de vitória, os três selos, bloqueio da sala final, derrota na terceira validação errada, entradas inválidas, pistas, notas, rotação circular dos painéis, resultados solo/assistidos e rejeição de save corrompido.
- `npm run build`: compilador Ink sem erros/avisos, TypeScript estrito e export Vite concluídos.
- `npm audit --audit-level=high`: nenhuma vulnerabilidade reportada na árvore instalada.
- Navegador integrado: visita completa solo, três enigmas e final do caderno; segunda visita assistida e final do guardião em viewport 390 × 844; caderno de notas, reinício e Escape/retomada por teclado conferidos.
- Em 390 px: sem overflow horizontal; escolhas com altura mínima de 51 px. Isso é teste de viewport, não teste em telefone físico.
- Sem cronômetro ou loop contínuo de renderização. Arte SVG decorativa; pistas, orientações e pesos também em texto. Som procedural opcional.

Publicação usa GitHub Pages de repositório público, disponível no GitHub Free: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages . Não há conta adicional, cartão, backend ou serviço de consumo faturável no projeto.

A verificação de publicação, histórico e autoria será registrada após o deploy. Testes não constituem auditoria universal de navegadores, acessibilidade ou garantia de ausência de vulnerabilidades.
