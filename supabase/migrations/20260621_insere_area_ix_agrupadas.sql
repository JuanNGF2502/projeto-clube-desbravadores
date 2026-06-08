-- Insere área IX - ESTILO DE VIDA na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'IX - ESTILO DE VIDA', 'Completar duas especialidades não realizadas anteriormente na área de Artes e Habilidades Manuais.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente na seção de Artes e Habilidades Manuais.', '12 - 13 - 14 - ≥15', 2, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente em uma das seguintes áreas:', 'a) Atividades Missionárias\nb) Atividades Profissionais\nc) Atividades Agrícolas', 3, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente em uma das seguintes áreas:', 'a) Atividades Missionárias\nb) Atividades Agrícolas\nc) Ciência e Saúde\nd) Habilidades Domésticas', 4, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente em uma das seguintes áreas:', 'a) Atividades Recreativas\nb) Ciência e Saúde\nc) Habilidades Domésticas\nd) Atividades Profissionais', 5, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
