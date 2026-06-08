-- Insere área V - SAÚDE E APTIDÃO FÍSICA na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Completar uma das seguintes especialidades:', 'a) Natação principiante I\nb) Cultura física\nc) Nós e amarras', 1, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Memorizar e explicar I Coríntios 9:24-27.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Escolher uma das atividades abaixo e escrever um texto pessoal para um estilo de vida livre do álcool:', 'a) Participar de uma discussão em classe sobre os efeitos do álcool no organismo\nb) Assistir um vídeo sobre o efeito do álcool ou outras drogas no corpo humano e conversar sobre o assunto.', 3, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Preparar um programa especial de exercícios físicos diários e conversar com seu líder ou Conselheiro sobre os princípios de aptidão física. Fazer e assinar um compromisso pessoal de realizar exercícios físicos regularmente.', '13 - 14 - ≥15', 4, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Completar a especialidade de Temperança.', '14 - ≥15', 5, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Fazer uma apresentação, para alunos do Ensino Fundamental, sobre os oito remédios naturais dados por Deus.', '11 - 12 - 13 - 14 - ≥15', 6, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Utilizando a experiência de Daniel:', 'a) Explicar os princípios de temperança que ele defendeu ou participar de uma apresentação ou encenação sobre Daniel 1.\nb) Memorizar e explicar Daniel 1:8.\nc) Escrever seu compromisso pessoal de seguir um estilo de vida saudável.', 7, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Conversar com seu líder sobre a aptidão física e os exercícios físicos regulares que se relacionam com uma vida saudável.', '11 - 12', 8, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Discutir as vantagens do estilo de vida Adventista de acordo com o que a Bíblia ensina.', '13 - 14 - ≥15', 9, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Completar uma das seguintes atividades:', 'a) Escrever uma poesia ou artigo sobre saúde para ser divulgado em uma revista, boletim ou jornal da igreja.\nb) Individualmente ou em grupo, organizar e participar de uma corrida ou atividade similar e apresentar com antecedência um programa de treinamento físico para esse evento.\nc) Ler as páginas 102-125 do livro "Temperança", de Ellen G. White, e apresentar em uma página ou mais, 10 textos selecionados da leitura.\nd) Completar a especialidade de Nutrição ou liderar um grupo para a especialidade de Cultura Física.', 10, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Aprender os princípios de uma dieta saudável e ajudar a preparar um quadro com os grupos básicos de alimentos.', '11 - 12 - 13 - 14 - ≥15', 11, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Aprender sobre os prejuízos que o cigarro causa à saúde e escrever seu compromisso de não fazer uso do fumo.', '11 - 12 - 13 - 14 - ≥15', 12, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Completar uma das seguintes especialidades:', 'a) Natação principiante II\nb) Acampamento II', 13, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
