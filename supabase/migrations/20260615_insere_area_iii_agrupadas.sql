-- Insere área III - SERVINDO AOS OUTROS na classe Agrupadas
-- Cada área tem numeração independente

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'III - SERVINDO AOS OUTROS', 'Dedicar duas horas ajudando alguém em sua comunidade, através de uma das seguintes atividades:', 'a) Visitar alguém que precisa de amizade e orar com essa pessoa\nb) Oferecer alimento para alguém carente\nc) Participar de um projeto ecológico ou educativo', 1, true),
('7', 'III - SERVINDO AOS OUTROS', 'Planejar e dedicar pelo menos duas horas servindo sua comunidade e demonstrando companheirismo a alguém, de maneira prática.', '11', 2, true),
('7', 'III - SERVINDO AOS OUTROS', 'Conhecer os projetos comunitários desenvolvidos em sua cidade e participar em pelo menos um deles com sua Unidade ou Clube.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar de dois projetos missionários definidos por seu Clube.', '13 - 14 - ≥15', 4, true),
('7', 'III - SERVINDO AOS OUTROS', 'Convidar um amigo para participar de uma atividade social de sua igreja ou da Associação/Missão.', '14 - ≥15', 5, true),
('7', 'III - SERVINDO AOS OUTROS', 'Ajudar a organizar e participar de uma das seguintes atividades:', 'a) Fazer uma visita de cortesia a uma pessoa doente\nb) Adotar uma pessoa ou família em necessidade e ajudá-los\nc) Um projeto de sua escolha aprovado por seu líder', 6, true),
('7', 'III - SERVINDO AOS OUTROS', 'Escrever uma redação explicando como ser um bom cidadão no lar e na escola.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar de um projeto que beneficiará sua comunidade ou igreja.', '11 - 12', 8, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar em três atividades missionárias da igreja.', '12 - 13 - 14 - ≥15', 9, true),
('7', 'III - SERVINDO AOS OUTROS', 'Trabalhar em um projeto comunitário de sua igreja, escola ou comunidade.', '13 - 14 - ≥15', 10, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar de um projeto comunitário desde o planejamento, organização até a execução.', '14 - ≥15', 11, true),
('7', 'III - SERVINDO AOS OUTROS', 'Discutir com sua Unidade os métodos de evangelismo pessoal e colocar alguns princípios em prática.', '≥15', 12, true),
('7', 'III - SERVINDO AOS OUTROS', 'Discutir como os jovens adventistas devem se relacionar com as pessoas nas diferentes situações do dia a dia, tais como:', 'a) Vizinhos\nb) Escola\nc) Atividades sociais\nd) Atividades recreativas', 13, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
