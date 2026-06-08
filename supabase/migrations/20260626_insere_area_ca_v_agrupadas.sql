-- Insere área C.A. - V. EXCURSIONISTA NA MATA na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Fazer uma apresentação escrita ou falada sobre o respeito que devemos ter com a Lei de Deus e as autoridades civis, enumerando dez princípios de comportamento moral.', '14 - ≥15', 1, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Acompanhar seu pastor ou ancião numa visita missionária ou estudo bíblico.', '14 - ≥15', 2, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Completar a especialidade de Testemunho juvenil.', '14 - ≥15', 3, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Apresentar cinco atividades junto à natureza, que podem ser desenvolvidas nas tardes de Sábado.', '14 - ≥15', 4, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Com sua Unidade, construir um móvel de acampamento e um portal para o Clube.', '14 - ≥15', 5, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Através da supervisão de seu líder ou Conselheiro, conversar em sua Unidade ou Clube sobre um dos seguintes temas:', 'a) Modéstia Cristã\nb) Recreação\nc) Saúde\nd) Observância do Sábado', 6, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Demonstrar conhecimento para encontrar alimentos, através de plantas silvestres de sua região e saber diferenciá-las de plantas tóxicas/venenosas.', '14 - ≥15', 7, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Demonstrar conhecimento quanto aos procedimentos necessários em caso de ferimentos por diferentes animais peçonhentos e não peçonhentos.', '14 - ≥15', 8, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Demonstrar técnicas para percorrer trilhas em diferentes tipos de terrenos, como: desertos, florestas, pântanos e rios.', '14 - ≥15', 9, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Completar a Especialidade de Ordem unida.', '14 - ≥15', 10, true),
('7', 'C.A. - V. EXCURSIONISTA NA MATA', 'Completar a Especialidade de Vida silvestre.', '14 - ≥15', 11, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
