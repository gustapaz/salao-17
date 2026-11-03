VAR chances = 3
VAR archive = false
VAR gallery = false
VAR workshop = false
VAR assisted = false
VAR note_archive = false
VAR note_gallery = false
VAR note_workshop = false
VAR panel_a = 0
VAR panel_b = 2
VAR panel_c = 1
VAR weight_two = false
VAR weight_three = false
VAR weight_five = false
-> hall

=== hall ===
# room:hall
# title:O último visitante
O museu fechou sem fazer barulho. Quando você percebe, o relógio do átrio já não tem ponteiros — e a porta da rua desapareceu atrás de uma cortina de metal.
Sobre o balcão, um bilhete: “O Salão 17 só se abre para quem sabe ler o que ficou. Traga os selos do Arquivo, da Galeria e da Oficina.”
{archive && gallery && workshop: Os três selos pesam no seu bolso. A fresta do Salão 17 agora deixa passar uma linha de luz. | Você ainda precisa reunir os selos que faltam para abrir a última sala.}
+ [Entrar no Arquivo] -> archive_room
+ [Entrar na Galeria] -> gallery_room
+ [Entrar na Oficina] -> workshop_room
+ {archive && gallery && workshop} [Usar os três selos no Salão 17] -> threshold
+ [Ler o bilhete outra vez] -> welcome_note

=== welcome_note ===
# room:hall
# title:Uma visita sem relógio
No verso do bilhete, uma regra escrita a lápis: “Há três tentativas de validação para toda a visita. Girar, observar e voltar não custa nada. A terceira interpretação errada fecha o arquivo.”
As pistas podem ajudar, mas seu caderno lembrará que você as pediu. Não há pressa.
+ [Voltar ao átrio] -> hall

=== archive_room ===
# room:archive
# title:O arquivo dos símbolos
Gavetas altas guardam as etiquetas de uma exposição que ninguém chegou a ver. Na fechadura, três espaços aceitam números.
As etiquetas são claras: estrela = 4, onda = 2, ramo = 7. A ordem, porém, está numa anotação dobrada ao lado.
{archive: A gaveta já está aberta. O selo de cobre é seu. | O selo de cobre continua dentro da gaveta central.}
+ [Ler a anotação do Arquivo]
    ~ note_archive = true
    -> archive_note
+ {not archive} [Validar 427] -> archive_correct
+ {not archive} [Validar 247] -> archive_wrong
+ {not archive} [Validar 742] -> archive_wrong
+ {not archive} [Pedir pista do Arquivo]
    ~ assisted = true
    -> archive_hint
+ [Voltar ao átrio] -> hall

=== archive_note ===
# note:yes
# room:archive
# title:A ordem antes dos números
“Primeiro aquilo que se vê no céu. Depois aquilo que move o barco. Por último aquilo que nasce da terra.”
Você copia a frase no caderno. As etiquetas da sala continuam visíveis: estrela 4, onda 2, ramo 7.
+ [Voltar à fechadura] -> archive_room

=== archive_hint ===
# note:yes
# room:archive
# title:O céu, a água, a terra
O desenho do céu é a estrela. O barco se move na onda. Da terra nasce o ramo. Leia os números nessa ordem: 4, 2, 7.
+ [Voltar à fechadura] -> archive_room

=== archive_correct ===
~ archive = true
# room:archive
# title:O primeiro lacre
A gaveta desliza. Um selo de cobre, frio como uma moeda antiga, fica entre seus dedos. Atrás dele há apenas uma frase: “Uma ordem pode mudar tudo.”
+ [Voltar ao átrio] -> hall

=== archive_wrong ===
~ chances -= 1
{chances <= 0: -> closed}
# room:archive
# title:A gaveta não cede
Os números fazem sentido sozinhos, mas a ordem não. A fechadura devolve o clique sem abrir. Você ainda tem {chances} tentativa(s) de validação.
+ [Voltar à fechadura] -> archive_room

=== gallery_room ===
# room:gallery
# title:Três obras, quatro direções
Três painéis giram sobre eixos silenciosos. A obra A é pequena, a B é a maior e a C é uma moldura vazia. Norte é o alto; leste é a direita; sul é baixo; oeste é a esquerda.
Posições atuais: A aponta para {cardinal(panel_a)}. B aponta para {cardinal(panel_b)}. C aponta para {cardinal(panel_c)}.
{gallery: O selo de vidro já deixou o nicho. Não é preciso girar mais. | Uma frase no rodapé parece indicar a orientação certa.}
+ [Ler a frase da Galeria]
    ~ note_gallery = true
    -> gallery_note
+ {not gallery} [Girar o painel A]
    ~ panel_a = (panel_a + 1) % 4
    -> gallery_room
+ {not gallery} [Girar o painel B]
    ~ panel_b = (panel_b + 1) % 4
    -> gallery_room
+ {not gallery} [Girar o painel C]
    ~ panel_c = (panel_c + 1) % 4
    -> gallery_room
+ {not gallery} [Validar os painéis] -> gallery_check
+ {not gallery} [Pedir pista da Galeria]
    ~ assisted = true
    -> gallery_hint
+ [Voltar ao átrio] -> hall

=== gallery_note ===
# note:yes
# room:gallery
# title:Os tamanhos contam
“A menor obra encara o nascer do sol. A maior olha para o alto. A ausência contempla o poente.”
Você registra a frase: pequena A, maior B, vazia C. Os painéis giram sempre no sentido horário.
+ [Voltar aos painéis] -> gallery_room

=== gallery_hint ===
# note:yes
# room:gallery
# title:Nascente e poente
O nascer do sol fica a leste. Alto é norte. Poente é oeste. Deixe A a leste, B ao norte e C a oeste.
+ [Voltar aos painéis] -> gallery_room

=== gallery_check ===
{panel_a == 1 && panel_b == 0 && panel_c == 3:
    ~ gallery = true
    -> gallery_correct
- else:
    ~ chances -= 1
    {chances <= 0: -> closed}
    -> gallery_wrong
}

=== gallery_correct ===
# room:gallery
# title:Uma fresta transparente
As molduras deixam de refletir você. No nicho, aparece o selo de vidro — tão leve que parece feito de uma ausência. A sala continua exatamente onde estava.
+ [Voltar ao átrio] -> hall

=== gallery_wrong ===
# room:gallery
# title:As molduras discordam
Uma luz cruza os painéis, mas os reflexos não se encontram. A orientação está errada. Restam {chances} tentativa(s) de validação.
+ [Voltar aos painéis] -> gallery_room

=== workshop_room ===
# room:workshop
# title:O peso da luz
Na Oficina, uma balança aceita três pesos: 2, 3 e 5. Cada um pode entrar ou sair uma vez por escolha. Uma rosácea de oito raios está desenhada sobre o prato.
Pesos selecionados: {weight_two: 2; }{weight_three: 3; }{weight_five: 5; } soma = {weight_sum()}.
{workshop: O selo de pedra já está com você. | O selo de pedra espera que a soma acompanhe a luz.}
+ [Ler a placa da Oficina]
    ~ note_workshop = true
    -> workshop_note
+ {not workshop} [Colocar ou retirar o peso 2]
    ~ weight_two = not weight_two
    -> workshop_room
+ {not workshop} [Colocar ou retirar o peso 3]
    ~ weight_three = not weight_three
    -> workshop_room
+ {not workshop} [Colocar ou retirar o peso 5]
    ~ weight_five = not weight_five
    -> workshop_room
+ {not workshop} [Validar a balança] -> workshop_check
+ {not workshop} [Pedir pista da Oficina]
    ~ assisted = true
    -> workshop_hint
+ [Voltar ao átrio] -> hall

=== workshop_note ===
# note:yes
# room:workshop
# title:Uma medida sem números escritos
“A soma dos pesos deve igualar os raios da rosácea.” O desenho tem oito raios, contáveis também nesta anotação. Não há truque de força: só uma escolha de pesos.
+ [Voltar à balança] -> workshop_room

=== workshop_hint ===
# note:yes
# room:workshop
# title:Oito, sem excesso
Três mais cinco somam oito. Deixe o peso 2 fora do prato e os pesos 3 e 5 dentro.
+ [Voltar à balança] -> workshop_room

=== workshop_check ===
{not weight_two && weight_three && weight_five:
    ~ workshop = true
    -> workshop_correct
- else:
    ~ chances -= 1
    {chances <= 0: -> closed}
    -> workshop_wrong
}

=== workshop_correct ===
# room:workshop
# title:A matéria encontra a medida
O prato se alinha com a sombra da rosácea. O selo de pedra cai sobre um pano, sem som de impacto. Agora ele parece mais leve do que os pesos que o libertaram.
+ [Voltar ao átrio] -> hall

=== workshop_wrong ===
# room:workshop
# title:O prato fica suspenso
A soma ainda não acompanha os oito raios. Nada se quebra e os pesos continuam disponíveis. Restam {chances} tentativa(s) de validação.
+ [Voltar à balança] -> workshop_room

=== threshold ===
# room:ending
# title:O Salão 17
Os três selos encaixam sem resistência. Além da porta não há uma exposição, mas uma mesa com um caderno aberto e a luz da rua.
Na última página está a letra do mesmo bilhete: “Todo visitante leva alguma coisa. Escolha o que quer deixar.”
+ [Levar o caderno para a rua] -> ending_caderno
+ [Deixar o caderno para o próximo visitante] -> ending_guardiao

=== ending_caderno ===
# room:ending
# title:O museu vai com você
# result:won
# ending:caderno
Você atravessa a porta com o caderno sob o braço. Lá fora, o relógio da cidade ainda funciona. Entre as páginas, os três selos viraram desenhos. O Salão 17 passa a existir também na sua memória.
Fim — O caderno aberto.
-> END

=== ending_guardiao ===
# room:ending
# title:Uma sala continua acesa
# result:won
# ending:guardiao
Você deixa o caderno aberto na primeira página e atravessa a porta de mãos vazias. Antes de sair, percebe outra linha surgindo no papel. Não é seu nome: é um espaço para quem vem depois.
Fim — O guardião da próxima visita.
-> END

=== closed ===
# room:ending
# title:O arquivo se fecha
# result:lost
# ending:fechado
O terceiro clique errado apaga a linha de luz. Uma portinhola discreta devolve você ao átrio de entrada, do lado de fora. O museu não o prendeu: apenas encerrou esta visita.
Os enigmas continuam lá. Você pode recomeçar com um caderno em branco.
Fim — Uma visita interrompida.
-> END


=== function cardinal(value) ===
{value == 0:
    ~ return "norte"
}
{value == 1:
    ~ return "leste"
}
{value == 2:
    ~ return "sul"
}
~ return "oeste"

=== function weight_sum() ===
~ temp total = 0
{weight_two:
    ~ total += 2
}
{weight_three:
    ~ total += 3
}
{weight_five:
    ~ total += 5
}
~ return total
