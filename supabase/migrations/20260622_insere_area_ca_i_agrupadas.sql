-- Insere área C.A. - I. AMIGO DA NATUREZA na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Memorizar, cantar ou tocar o Hino dos Desbravadores e conhecer a história do hino.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Em consulta com seu líder, escolher um dos seguintes personagens do Antigo Testamento e conversar com seu grupo sobre o amor e cuidado de Deus e o livramento demonstrado na vida do personagem escolhido:', 'a) José\nb) Jonas\nc) Ester\nd) Rute', 2, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Levar pelo menos dois amigos não adventistas à Escola Sabatina ou ao Clube de Desbravadores.', '11 - 12 - 13 - 14 - ≥15', 3, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Conhecer os princípios de higiene, de boas maneiras à mesa e como se comportar diante de pessoas que tenham diferentes idades. Demonstrar e explicar como estas boas maneiras podem ser úteis nas reuniões e acampamentos do Clube.', '11 - 12 - 13 - 14 - ≥15', 4, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Completar a Especialidade de Arte de acampar.', '11 - 12 - 13 - 14 - ≥15', 5, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Conhecer e identificar 10 flores silvestres e 10 insetos de sua região.', '11 - 12 - 13 - 14 - ≥15', 6, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Começar uma fogueira com apenas um fósforo, usando materiais naturais, e mantê-la acesa.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Usar corretamente uma faca, facão ou uma machadinha e conhecer dez regras para usá-los com segurança.', '11 - 12 - 13 - 14 - ≥15', 8, true),
('7', 'C.A. - I. AMIGO DA NATUREZA', 'Escolher e completar uma especialidade em uma das áreas abaixo:', 'a) Atividades Missionárias e Comunitárias\nb) Atividades Agrícolas e Afins', 9, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
