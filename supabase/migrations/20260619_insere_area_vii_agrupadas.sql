-- Insere área VII - ESTUDO DA NATUREZA na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma das seguintes especialidades:', 'a) Felinos\nb) Cães\nc) Mamíferos\nd) Sementes\ne) Aves de estimação', 1, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Participar de jogos na natureza ou caminhada ecológica, pelo período de uma hora.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Identificar a estrela Alfa da constelação do Centauro e a constelação de Órion. Conhecer o significado espiritual de Órion, como descrito no livro "Primeiros Escritos", de Ellen White, pág. 41.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Estudar a história do dilúvio e o processo de fossilização.', '13 - 14 - ≥15', 4, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Recapitular a história de Nicodemos e relacioná-la com o ciclo da vida da lagarta ou da borboleta, acrescentando um significado espiritual.', '14 - ≥15', 5, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Ler o capítulo 7 do livro "O Desejado de Todas as Nações", sobre a infância de Jesus. Apresentar para um grupo, Clube ou Unidade as lições encontradas, demonstrando a importância que o estudo da natureza exerceu na educação e ministério de Jesus.', '≥15', 6, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Aprender e demonstrar uma maneira para purificar a água e escrever um parágrafo destacando o significado de Jesus como a água da vida.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar duas das seguintes especialidades:', 'a) Anfíbios\nb) Aves\nc) Aves domésticas\nd) Pecuária\ne) Répteis\nf) Moluscos\ng) Árvores\nh) Arbustos', 8, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma das especialidades abaixo:', 'a) Astronomia\nb) Cactos\nc) Climatologia\nd) Flores\ne) Rastreio de animais', 9, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma especialidade, não realizada anteriormente, em Estudos da natureza.', '13', 10, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar duas especialidades em Estudos da Natureza, não realizadas anteriormente.', '14 - ≥15', 11, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma das seguintes especialidades:', 'a) Ecologia\nb) Conservação ambiental', 12, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Aprender e montar três tipos de barraca em locais apropriados.', '11 - 12 - 13 - 14 - ≥15', 13, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Recapitular o estudo da criação e fazer um diário por sete dias registrando suas observações do que foi criado em cada dia correspondente.', '11 - 12 - 13 - 14 - ≥15', 14, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
