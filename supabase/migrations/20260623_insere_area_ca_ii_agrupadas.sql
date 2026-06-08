-- Insere área C.A. - II. COMPANHEIRO DE EXCURSIONISMO na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Aprender e demonstrar a composição, significado e uso correto da Bandeira Nacional.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Ler a primeira visão de Ellen White e discutir como Deus usa os profetas para apresentar Sua mensagem à igreja (ver Primeiros Escritos, págs. 13 à 20).', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Participar de uma atividade missionária ou comunitária, envolvendo também um amigo.', '11 - 12 - 13 - 14 - ≥15', 3, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Conversar com seu Conselheiro ou Unidade sobre como demonstrar respeito pelos seus pais ou responsáveis e fazer uma lista mostrando como cuidam de você.', '11 - 12 - 13 - 14 - ≥15', 4, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Participar de uma caminhada de 6 quilômetros, preparando, ao final, um relatório de uma página.', '11 - 12 - 13 - 14 - ≥15', 5, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Escolher um dos seguintes itens:', 'a) Assistir a um curso "Como deixar de fumar"\nb) Assistir a dois filmes sobre saúde\nc) Ajudar a preparar material para uma exposição ou passeata sobre saúde\nd) Pesquisar na internet informações sobre saúde e escrever uma página sobre os resultados encontrados', 6, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Identificar e descrever 12 pássaros e 12 árvores nativas.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Planejar e organizar uma das seguintes:', 'a) Investidura\nb) Admissão em lenço\nc) Dia Mundial do Desbravador', 8, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Preparar uma refeição em uma fogueira durante um acampamento do Clube ou unidade.', '11 - 12 - 13 - 14 - ≥15', 9, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Preparar um quadro com quinze nós diferentes.', '11 - 12 - 13 - 14 - ≥15', 10, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Completar a especialidade de Excursionismo Pedestre com mochila.', '11 - 12 - 13 - 14 - ≥15', 11, true),
('7', 'C.A. - II. COMPANHEIRO DE EXCURSIONISMO', 'Completar uma especialidade, não realizada anteriormente, em uma das seguintes áreas:', 'a) Habilidades Domésticas\nb) Ciência e Saúde\nc) Atividades Missionárias e Comunitárias\nd) Atividades Agrícolas e Afins', 12, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
