-- Insere área IV - DESENVOLVENDO AMIZADE na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'IV - DESENVOLVENDO AMIZADE', 'Mencionar dez qualidades de um bom amigo e apresentar quatro situações diárias onde você praticou a Regra Áurea de Mateus 7:12.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Conversar com seu Conselheiro ou Unidade sobre como respeitar pessoas de diferentes culturas, raça e sexo.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Participar de um debate ou representação sobre a pressão de grupo e identificar a influência que isso exerce sobre as decisões.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Participar de um debate e fazer uma avaliação pessoal sobre suas atitudes em dois dos seguintes temas:', 'a) Auto-estima\nb) Amizade\nc) Relacionamentos\nd) Otimismo e pessimismo', 4, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Através de uma conversa em grupo ou avaliação pessoal, examinar suas atitudes em dois dos seguintes temas:', 'a) Auto-estima\nb) Relacionamento familiar\nc) Finanças pessoais\nd) Pressão de grupo', 5, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Assistir uma palestra ou aula e examinar suas atitudes em relação a dois dos seguintes temas:', 'a) A importância da escolha profissional\nb) Como se relacionar com os pais\nc) A escolha da pessoa certa para namorar\nd) O plano de Deus para o sexo', 6, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Saber cantar o Hino Nacional de seu país e conhecer sua história. Saber o nome do autor da letra e da música do hino.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Visitar um órgão público de sua cidade ou bairro e descobrir de que maneiras o Clube pode ser útil à sua comunidade.', '12 - 13 - 14 - ≥15', 8, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Preparar uma lista contendo cinco sugestões de atividades recreativas para ajudar pessoas com necessidades específicas e colaborar na organização de uma destas atividades para essas pessoas.', '13 - 14 - ≥15', 9, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
