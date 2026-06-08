-- Insere área VIII - ARTE DE ACAMPAR na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'VIII - ARTE DE ACAMPAR', 'Demonstrar como cuidar corretamente de uma corda. Fazer e explicar o uso prático dos seguintes nós:', 'a) Simples\nb) Cego\nc) Direito\nd) Cirurgião\ne) Lais de guia\nf) Lais de guia duplo\ng) Escota\nh) Catau\ni) Pescador\nj) Fateixa\nk) Volta do fiel\nl) Nó de gancho\nm) Volta da ribeira\nn) Ordinário', 1, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Descobrir os pontos cardeais sem a ajuda de um bússola e desenhar a Rosa dos Ventos.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Apresentar seis segredos para um bom acampamento. Participar de um acampamento de final de semana, planejando e cozinhando duas refeições.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Fazer um fogo refletor e mostrar seu uso.', '13 - 14 - ≥15', 4, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Com um grupo de, no mínimo, quatro pessoas e com a presença um Conselheiro adulto experiente, andar pelo menos 20 quilômetros numa área rural ou deserta, incluindo uma noite ao ar livre ou em barraca. Planejar a expedição em detalhes antes da saída. Durante a caminhada, efetuar anotações sobre o terreno, flora e fauna, observados. Depois, usando as anotações, participar de uma discussão de grupo, dirigida por seu Conselheiro.', '14 - ≥15', 5, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Participar com sua Unidade de um acampamento com estrutura de pioneiria, planejando o que vai acontecer neste acampamento.', '≥15', 6, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar a especialidade de Acampamento I.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Participar de um acampamento de final de semana e fazer um relatório destacando o que mais lhe impressionou positivamente.', '11 - 12 - 13 - 14 - ≥15', 8, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar as seguintes especialidades:', 'a) Acampamento III\nb) Primeiros socorros - Básico', 9, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Participar de um acampamento de final de semana, arrumando de forma apropriada sua bolsa ou mochila com o equipamento pessoal necessário.', '13 - 14 - ≥15', 10, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar a especialidade de Pioneirias.', '14 - ≥15', 11, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Planejar, preparar e cozinhar três refeições ao ar livre.', '≥15', 12, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Apresentar 10 regras para uma caminhada e explicar o que fazer quando estiver perdido.', '11 - 12 - 13 - 14 - ≥15', 13, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Aprender os seguintes nós:', 'a) Oito\nb) Volta do salteador\nc) Duplo\nd) Caminhoneiro\ne) Direito\nf) Volta do Fiel\ng) Escota\nh) Laís de Guia\ni) Simples', 14, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Aprender a usar uma bússola ou um GPS (urbano ou campo), e demonstrar sua habilidade encontrando endereços na zona urbana.', '12 - 13 - 14 - ≥15', 15, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar a especialidade de Resgate Básico.', '13 - 14 - ≥15', 16, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Construir e utilizar um móvel de acampamento em tamanho real, com nós e amarras.', '≥15', 17, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Aprender os sinais para seguir uma pista. Preparar e seguir uma pista de no mínimo, 10 sinais, que possa ser seguida por outros.', '11 - 12 - 13 - 14 - ≥15', 18, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar uma especialidade, não realizada anteriormente, que possa ser contada para o Mestrados abaixo:', 'a) Aquática\nb) Esportes\nc) Atividades recreativas\nd) Vida campestre', 19, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
