-- Insere área C.A. - VI. GUIA DE EXPLORAÇÃO na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Completar a especialidade de Mordomia.', '≥15', 1, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Ler o livro O Maior Discurso de Cristo e escrever uma página sobre o efeito da leitura em sua vida.', '≥15', 2, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Cumprir um dos seguintes itens:', 'a) Trazer dois amigos para assistir a duas diferentes reuniões da igreja.\nb) Ajudar a planejar e participar de, no mínimo, quatro domingos em uma série de evangelismo jovem.', 3, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Escrever uma página ou apresentar uma palestra sobre como influenciar amigos para Cristo.', '≥15', 4, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Observar durante o período de dois meses o trabalho dos diáconos, apresentando um relatório detalhado de suas atividades, contendo:', 'a) Cuidado da propriedade da igreja\nb) Cerimônia de lava-pés\nc) Cerimônia de batismo\nd) Recolhimento dos dízimos e ofertas', 5, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Completar uma Especialidade, não realizada anteriormente, para o mestrado em Vida campestre.', '≥15', 6, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Projetar três tipos diferentes de abrigo, explicar seu uso e utilizar um deles em um acampamento.', '≥15', 7, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Assistir a um seminário ou apresentar uma palestra sobre dois dos seguintes temas:', 'a) Aborto\nb) Bullying\nc) Violência\nd) Drogas\ne) Doenças Sexualmente Transmissíveis', 8, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Completar a Especialidade de Liderança campestre.', '≥15', 9, true),
('7', 'C.A. - VI. GUIA DE EXPLORAÇÃO', 'Completar a Especialidade em Orçamento familiar.', '≥15', 10, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
