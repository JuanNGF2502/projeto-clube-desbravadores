-- Insere área VI - ORGANIZAÇÃO E LIDERANÇA na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Através da observação, acompanhar todo o processo de planejamento até a execução de uma caminhada de 5 quilômetros.', '11 - 12 - 13', 1, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Dirigir ou colaborar em uma meditação criativa para sua Unidade ou Clube.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Dirigir uma cerimônia de abertura da reunião semanal em seu Clube ou um programa de Escola sabatina.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Assistir a um seminário ou treinamento, oferecido pela sua igreja ou distrito nos departamentos abaixo:', 'a) Ministério Pessoal\nb) Evangelismo', 4, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Preparar um organograma da igreja local e relacionar as funções dos departamentos.', '14 - ≥15', 5, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Preparar um organograma da estrutura administrativa da Igreja Adventista em sua Divisão.', '≥15', 6, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Ajudar no planejamento de uma excursão ou acampamento com sua Unidade ou Clube, envolvendo pelo menos um pernoite.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Ajudar a organizar a classe bíblica do seu Clube.', '12 - 13 - 14 - ≥15', 8, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Participar de uma atividade social de sua igreja.', '13 - 14 - ≥15', 9, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Participar de dois programas envolvendo diferentes departamentos da igreja local.', '14 - ≥15', 10, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Participar em um dos itens abaixo:', 'a) Curso de Conselheiros\nb) Convenção de liderança da Associação/Missão\nc) Duas reuniões de diretoria do seu Clube', 11, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Completar a especialidade de Aventuras com Cristo.', '14 - ≥15', 12, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Planejar e ensinar, no mínimo, dois requisitos de uma especialidade para um grupo ou Unidade de desbravadores.', '≥15', 13, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
