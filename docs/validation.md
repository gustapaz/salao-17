# Validação

Executada em 02 e 03/11/2026.

- `npm test`: seis testes passaram, exercitando os dois finais de vitória, os três selos, bloqueio da sala final, derrota na terceira validação errada, entradas inválidas, pistas, notas, rotação circular dos painéis, resultados solo/assistidos e rejeição de save corrompido.
- `npm run build`: compilador Ink sem erros/avisos, TypeScript estrito e export Vite concluídos.
- `npm audit --audit-level=high`: nenhuma vulnerabilidade reportada na árvore instalada.
- Navegador integrado: visita completa solo, três enigmas e final do caderno; segunda visita assistida e final do guardião em viewport 390 × 844; caderno de notas, reinício e Escape/retomada por teclado conferidos.
- Em 390 px: sem overflow horizontal; escolhas com altura mínima de 51 px. Isso é teste de viewport, não teste em telefone físico.
- Sem cronômetro ou loop contínuo de renderização. Arte SVG decorativa; pistas, orientações e pesos também em texto. Som procedural opcional.

Publicação usa GitHub Pages de repositório público, disponível no GitHub Free: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages . Não há conta adicional, cartão, backend ou serviço de consumo faturável no projeto.

Implementação inicial: `c3d8ecef5343646f465ced1200811c1f17ae40bc`. CI inicial `41612593650` executou testes, auditoria, build e deploy. Jogo público concluído sem pistas com 24 escolhas e três tentativas restantes; resultado preservado após reload. Inspeção visual revelou quebra de linha no replay; corrigida nesta entrega.

Gitleaks 8.30.1, regras externas e saída redigida: staged, histórico completo, export e clone novo do remoto sem achados. Configurações públicas: secret scanning, proteção de push e atualizações de segurança habilitadas. API GitHub confirmou somente `gustapaz` como contribuidor e autor/committer `Gustavo Paz <96732649+gustapaz@users.noreply.github.com>`.

O build inicial publicado foi comparado byte a byte: cinco arquivos idênticos aos locais. A verificação será repetida no artefato final.

 Testes não constituem auditoria universal de navegadores, acessibilidade ou garantia de ausência de vulnerabilidades.
