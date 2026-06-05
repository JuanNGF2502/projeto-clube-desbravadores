-- ============================================================
-- CLASSE AGRUPADAS
-- ============================================================

-- Widen columns to support long requirement names/descriptions/areas
ALTER TABLE requisitos_classe ALTER COLUMN nome TYPE TEXT;
ALTER TABLE requisitos_classe ALTER COLUMN descricao TYPE TEXT;
ALTER TABLE requisitos_classe ALTER COLUMN area TYPE TEXT;

INSERT INTO classes (id, nome, descricao, ordem, cor, imagem)
VALUES (
  '7',
  'Agrupadas',
  'Classes avançadas agrupadas com requisitos por faixa etária',
  7,
  '#06B6D4',
  '/images/agrupadas-150x150.png'
)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ordem = EXCLUDED.ordem,
  cor = EXCLUDED.cor;

-- ============================================================
-- REQUISITOS - I. GERAIS
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'I - GERAIS', 'Ser membro ativo do Clube de Desbravadores.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'I - GERAIS', 'Memorizar e explicar o Voto e a Lei do Desbravador.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'I - GERAIS', 'Ilustrar de forma criativa o significado do Voto do Desbravador.', '11 - 12 - 13 - 14 - ≥15', 3, true),
('7', 'I - GERAIS', 'Demonstrar sua compreensão do significado da Lei do Desbravador através de representação, debate ou redação.', '12 - 13 - 14 - ≥15', 4, true),
('7', 'I - GERAIS', 'Memorizar e entender o Alvo e o Lema JA.', '13 - 14 - ≥15', 5, true),
('7', 'I - GERAIS', 'Memorizar e explicar o significado do Objetivo JA.', '14 - ≥15', 6, true),
('7', 'I - GERAIS', 'Memorizar e explicar o Voto de Fidelidade à Bíblia.', '≥15', 7, true),
('7', 'I - GERAIS', 'Ler o livro do Clube de Leitura do ano em curso e escrever um parágrafo sobre o que mais lhe chamou atenção.', '11', 8, true),
('7', 'I - GERAIS', 'Ler o livro do Clube de Leitura do ano em curso e escrever dois parágrafos sobre o que mais lhe chamou atenção.', '12', 9, true),
('7', 'I - GERAIS', 'Ler o livro do Clube de Leitura do ano em curso e resumi-lo em uma página.', '13 - 14 - ≥15', 10, true),
('7', 'I - GERAIS', 'Ler o livro Pela Graça de Deus.', '11 - 12 - 13 - 14 - ≥15', 11, true),
('7', 'I - GERAIS', 'Ler o livro Caminho a Cristo.', '11 - 12 - 13 - 14 - ≥15', 12, true),
('7', 'I - GERAIS', 'Ler o livro Além da Magia.', '12 - 13 - 14 - ≥15', 13, true),
('7', 'I - GERAIS', 'Ler o livro A História da Vida.', '13 - 14 - ≥15', 14, true),
('7', 'I - GERAIS', 'Ler o livro Nos Bastidores da Mídia.', '14 - ≥15', 15, true),
('7', 'I - GERAIS', 'Ler o livro Nossa Herança.', '≥15', 16, true),
('7', 'I - GERAIS', 'Participar ativamente da Classe Bíblica do seu Clube.', '11 - 12 - 13', 17, true);

-- ============================================================
-- REQUISITOS - II. DESCOBERTA ESPIRITUAL
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento da Criação (o que Deus criou em cada dia).', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento das 10 Pragas do Egito.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento das 12 Tribos de Israel.', '11 - 12 - 13 - 14 - ≥15', 3, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar os 39 livros do AT e demonstrar habilidade para encontrar qualquer um deles.', '11 - 12 - 13 - 14 - ≥15', 4, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento dos 10 Mandamentos.', '11 - 12 - 13 - 14 - ≥15', 5, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar os 27 livros do NT e demonstrar habilidade para encontrar qualquer um deles.', '11 - 12 - 13 - 14 - ≥15', 6, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento de Levítico 11 (alimentos comestíveis e não comestíveis).', '12 - 13 - 14 - ≥15', 7, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento das Bem-Aventuranças (Sermão da Montanha).', '13 - 14 - ≥15', 8, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento dos 12 apóstolos de Cristo.', '14 - ≥15', 9, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento do Fruto do Espírito.', '14 - ≥15', 10, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento das 3 mensagens angélicas (Apocalipse 14:6-12).', '≥15', 11, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento das 7 igrejas do Apocalipse.', '≥15', 12, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar conhecimento dos 12 fundamentos da Nova Jerusalém.', '≥15', 13, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar João 3:16, Efésios 6:1-3, II Timóteo 3:16, Salmo 1.', '11 - 12 - 13 - 14 - ≥15', 14, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar Isaías 41:9-10, Hebreus 13:5, Provérbios 22:6, I João 1:9, Salmo 8.', '11 - 12 - 13 - 14 - ≥15', 15, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar Eclesiastes 12:13-14, Romanos 6:23, Apocalipse 1:3, Isaías 43:1-2, Salmo 51:10, Salmo 16.', '12 - 13 - 14 - ≥15', 16, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar Isaías 26:3, Romanos 12:12, João 14:1-3, Salmo 37:5, Filipenses 3:12-14, Salmo 23, I Samuel 15:22.', '13 - 14 - ≥15', 17, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar Romanos 8:28, Apocalipse 21:1-3, II Pedro 1:20-21, I João 2:14, II Crônicas 20:20, Salmo 46.', '14 - ≥15', 18, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar I Coríntios 13, II Crônicas 7:14, Apocalipse 22:18-20, II Timóteo 4:6-7, Romanos 8:38-39, Mateus 6:33-34.', '≥15', 19, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Gênesis e Êxodo (capítulos selecionados).', '11 - 12 - 13 - 14 - ≥15', 20, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Levítico a 2 Samuel (capítulos selecionados).', '11 - 12 - 13 - 14 - ≥15', 21, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Reis a Salmos (capítulos selecionados).', '12 - 13 - 14 - ≥15', 22, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Eclesiastes a Mateus (capítulos selecionados).', '13 - 14 - ≥15', 23, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Mateus a Atos (capítulos selecionados).', '14 - ≥15', 24, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Atos a Apocalipse (capítulos selecionados).', '≥15', 25, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Conversar sobre o que é cristianismo, as características de um verdadeiro discípulo e como ser um cristão verdadeiro.', '13 - 14 - ≥15', 26, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Estudar e entender a pessoa do Espírito Santo e Seu papel no crescimento espiritual.', '14 - ≥15', 27, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Descrever os dons espirituais mencionados por Paulo e seus propósitos para a igreja.', '≥15', 28, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Escolher um tema (parábola, milagre, sermão) e demonstrar conhecimento através de troca de ideias, atividade em grupo ou redação.', '11 - 12 - 13 - 14 - ≥15', 29, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Escolher uma história bíblica e demonstrar compreensão de como Jesus salva as pessoas.', '12 - 13 - 14 - ≥15', 30, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Participar de um estudo sobre a inspiração da Bíblia com um pastor.', '13 - 14 - ≥15', 31, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Estudar os eventos finais e a segunda vinda de Cristo.', '14 - ≥15', 32, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Estudar o santuário do AT e relacionar com o ministério de Jesus e a cruz.', '≥15', 33, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Convidar três ou mais pessoas para assistirem a uma classe bíblica ou pequeno grupo.', '13 - 14 - ≥15', 34, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Descobrir o verdadeiro significado da observância do sábado através do estudo da Bíblia.', '14 - ≥15', 35, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e resumir três histórias de pioneiros adventistas e contar no Clube, Culto JA ou Escola Sabatina.', '≥15', 36, true);

-- ============================================================
-- REQUISITOS - III. SERVINDO AOS OUTROS
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'III - SERVINDO AOS OUTROS', 'Dedicar duas horas ajudando alguém na comunidade (visita, alimento ou projeto ecológico/educativo).', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'III - SERVINDO AOS OUTROS', 'Planejar e dedicar pelo menos duas horas servindo a comunidade de maneira prática.', '11', 2, true),
('7', 'III - SERVINDO AOS OUTROS', 'Conhecer os projetos comunitários da cidade e participar em pelo menos um com sua Unidade ou Clube.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar de dois projetos missionários definidos por seu Clube.', '13 - 14 - ≥15', 4, true),
('7', 'III - SERVINDO AOS OUTROS', 'Convidar um amigo para participar de uma atividade social da igreja ou Associação/Missão.', '14 - ≥15', 5, true),
('7', 'III - SERVINDO AOS OUTROS', 'Ajudar a organizar e participar de visita a doente, adotar família necessitada ou projeto aprovado pelo líder.', '≥15', 6, true),
('7', 'III - SERVINDO AOS OUTROS', 'Escrever uma redação explicando como ser um bom cidadão no lar e na escola.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar de um projeto que beneficiará sua comunidade ou igreja.', '11 - 12', 8, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar em três atividades missionárias da igreja.', '12 - 13 - 14 - ≥15', 9, true),
('7', 'III - SERVINDO AOS OUTROS', 'Trabalhar em um projeto comunitário de sua igreja, escola ou comunidade.', '13 - 14 - ≥15', 10, true),
('7', 'III - SERVINDO AOS OUTROS', 'Participar de um projeto comunitário desde o planejamento até a execução.', '14 - ≥15', 11, true),
('7', 'III - SERVINDO AOS OUTROS', 'Discutir métodos de evangelismo pessoal e colocar princípios em prática.', '≥15', 12, true),
('7', 'III - SERVINDO AOS OUTROS', 'Discutir como jovens adventistas devem se relacionar com vizinhos, escola e atividades sociais/recreativas.', '14 - ≥15', 13, true);

-- ============================================================
-- REQUISITOS - IV. DESENVOLVENDO AMIZADE
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'IV - DESENVOLVENDO AMIZADE', 'Mencionar 10 qualidades de um bom amigo e apresentar 4 situações onde praticou a Regra Áurea (Mateus 7:12).', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Conversar sobre como respeitar pessoas de diferentes culturas, raça e sexo.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Participar de debate sobre pressão de grupo e sua influência sobre as decisões.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Participar de debate e avaliar atitudes em auto-estima, amizade, relacionamentos ou otimismo/pessimismo.', '13 - 14 - ≥15', 4, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Examinar atitudes em auto-estima, relacionamento familiar, finanças pessoais ou pressão de grupo.', '14 - ≥15', 5, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Assistir palestra sobre escolha profissional, relação com pais, namoro ou plano de Deus para o sexo.', '≥15', 6, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Saber cantar o Hino Nacional, conhecer sua história, autor da letra e música.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Visitar um órgão público e descobrir como o Clube pode ser útil à comunidade.', '12 - 13 - 14 - ≥15', 8, true),
('7', 'IV - DESENVOLVENDO AMIZADE', 'Preparar lista de 5 sugestões de atividades recreativas para pessoas com necessidades específicas e colaborar na organização.', '13 - 14 - ≥15', 9, true);

-- ============================================================
-- REQUISITOS - V. SAÚDE E APTIDÃO FÍSICA
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Completar uma especialidade: Natação I, Cultura Física ou Nós e Amarras.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Memorizar e explicar I Coríntios 9:24-27.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Participar de discussão ou assistir vídeo sobre efeitos do álcool/drogas e escrever texto sobre estilo de vida livre do álcool.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Preparar programa de exercícios físicos diários e fazer compromisso pessoal de exercitar-se regularmente.', '13 - 14 - ≥15', 4, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Completar a especialidade de Temperança.', '14 - ≥15', 5, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Fazer apresentação sobre os 8 remédios naturais para alunos do Ensino Fundamental.', '11 - 12 - 13 - 14 - ≥15', 6, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Utilizando a experiência de Daniel: explicar princípios de temperança, memorizar Daniel 1:8 e escrever compromisso pessoal.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Conversar com líder sobre aptidão física e exercícios regulares.', '11 - 12', 8, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Discutir as vantagens do estilo de vida adventista de acordo com a Bíblia.', '13 - 14 - ≥15', 9, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Escrever poesia/article sobre saúde, organizar corrida, ler "Temperança" págs 102-125 ou completar Nutrição/Cultura Física.', '≥15', 10, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Aprender princípios de dieta saudável e ajudar a preparar quadro com grupos básicos de alimentos.', '11 - 12 - 13 - 14 - ≥15', 11, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Aprender sobre os prejuízos do cigarro e escrever compromisso de não fumar.', '11 - 12 - 13 - 14 - ≥15', 12, true),
('7', 'V - SAÚDE E APTIDÃO FÍSICA', 'Completar uma especialidade: Natação II ou Acampamento II.', '11 - 12 - 13 - 14 - ≥15', 13, true);

-- ============================================================
-- REQUISITOS - VI. ORGANIZAÇÃO E LIDERANÇA
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Acompanhar o processo de planejamento até execução de uma caminhada de 5 km.', '11 - 12 - 13', 1, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Dirigir ou colaborar em uma meditação criativa para sua Unidade ou Clube.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Dirigir cerimônia de abertura da reunião semanal ou programa de Escola Sabatina.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Assistir seminário/treinamento em Ministério Pessoal ou Evangelismo.', '13 - 14 - ≥15', 4, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Preparar organograma da igreja local e relacionar funções dos departamentos.', '14 - ≥15', 5, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Preparar organograma da estrutura administrativa da IASD em sua Divisão.', '≥15', 6, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Ajudar no planejamento de excursão ou acampamento com pelo menos um pernoite.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Ajudar a organizar a classe bíblica do seu Clube.', '12 - 13 - 14 - ≥15', 8, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Participar de uma atividade social de sua igreja.', '13 - 14 - ≥15', 9, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Participar de dois programas envolvendo diferentes departamentos da igreja local.', '14 - ≥15', 10, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Participar de Curso de Conselheiros, Convenção de liderança ou duas reuniões de diretoria do Clube.', '≥15', 11, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Completar a especialidade de Aventuras com Cristo.', '14 - ≥15', 12, true),
('7', 'VI - ORGANIZAÇÃO E LIDERANÇA', 'Planejar e ensinar no mínimo dois requisitos de uma especialidade.', '≥15', 13, true);

-- ============================================================
-- REQUISITOS - VII. ESTUDO DA NATUREZA
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma especialidade: Felinos, Cães, Mamíferos, Sementes ou Aves de estimação.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Participar de jogos na natureza ou caminhada ecológica por 1 hora.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Identificar a estrela Alfa do Centauro e constelação de Órion. Conhecer o significado espiritual de Órion (Primeiros Escritos, p.41).', '12 - 13 - 14 - ≥15', 3, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Estudar a história do dilúvio e o processo de fossilização.', '13 - 14 - ≥15', 4, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Recapitular a história de Nicodemos e relacionar com o ciclo da lagarta/borboleta com significado espiritual.', '14 - ≥15', 5, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Ler O Desejado de Todas as Nações cap.7 e apresentar lições sobre a importância do estudo da natureza na educação de Jesus.', '≥15', 6, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Aprender e demonstrar purificação da água e escrever parágrafo sobre Jesus como a água da vida.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar duas especialidades: Anfíbios, Aves, Aves domésticas, Pecuária, Répteis, Moluscos, Árvores ou Arbustos.', '11 - 12 - 13 - 14 - ≥15', 8, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma especialidade: Astronomia, Cactos, Climatologia, Flores ou Rastreio de animais.', '12 - 13 - 14 - ≥15', 9, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma especialidade em Estudos da Natureza não realizada anteriormente.', '13', 10, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar duas especialidades em Estudos da Natureza não realizadas anteriormente.', '14 - ≥15', 11, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Completar uma especialidade: Ecologia ou Conservação ambiental.', '≥15', 12, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Aprender e montar três tipos de barraca em locais apropriados.', '11 - 12 - 13 - 14 - ≥15', 13, true),
('7', 'VII - ESTUDO DA NATUREZA', 'Recapitular a criação e fazer diário por 7 dias registrando observações de cada dia.', '11 - 12 - 13 - 14 - ≥15', 14, true);

-- ============================================================
-- REQUISITOS - VIII. ARTE DE ACAMPAR
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'VIII - ARTE DE ACAMPAR', 'Demonstrar cuidados com cordas e fazer nós: Simples, Cego, Direito, Cirurgião, Lais de guia, Lais de guia duplo, Escota, Catau, Pescador, Fateixa, Volta do fiel, Nó de gancho, Volta da ribeira, Ordinário.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Descobrir pontos cardeais sem bússola e desenhar a Rosa dos Ventos.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Apresentar 6 segredos para um bom acampamento. Participar de acampamento de fim de semana cozinhando 2 refeições.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Fazer um fogo refletor e mostrar seu uso.', '13 - 14 - ≥15', 4, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Caminhar 20 km com grupo de 4+ pessoas incluindo noite ao ar livre. Fazer anotações e participar de discussão.', '14 - ≥15', 5, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Participar de acampamento com estrutura de pioneiria planejando as atividades.', '≥15', 6, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar a especialidade de Acampamento I.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Participar de acampamento de fim de semana e fazer relatório destacando o que mais impressionou.', '11 - 12 - 13 - 14 - ≥15', 8, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar as especialidades: Acampamento III e Primeiros Socorros Básico.', '13 - 14 - ≥15', 9, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Participar de acampamento arrumando mochila com equipamento pessoal necessário.', '13 - 14 - ≥15', 10, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar a especialidade de Pioneirias.', '14 - ≥15', 11, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Planejar, preparar e cozinhar três refeições ao ar livre.', '≥15', 12, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Apresentar 10 regras para caminhada e explicar o que fazer quando estiver perdido.', '11 - 12 - 13 - 14 - ≥15', 13, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Aprender nós: Oito, Volta do salteador, Duplo, Caminhoneiro, Direito, Volta do Fiel, Escota, Laís de Guia, Simples.', '11 - 12 - 13 - 14 - ≥15', 14, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Aprender a usar bússola ou GPS demonstrando habilidade na zona urbana.', '12 - 13 - 14 - ≥15', 15, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar a especialidade de Resgate Básico.', '13 - 14 - ≥15', 16, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Construir e utilizar móvel de acampamento em tamanho real com nós e amarras.', '≥15', 17, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Aprender sinais para seguir pista e preparar pista de no mínimo 10 sinais.', '11 - 12 - 13 - 14 - ≥15', 18, true),
('7', 'VIII - ARTE DE ACAMPAR', 'Completar especialidade não realizada anteriormente para mestrado: Aquática, Esportes, Recreativas ou Vida campestre.', '≥15', 19, true);

-- ============================================================
-- REQUISITOS - IX. ESTILO DE VIDA
-- ============================================================

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'IX - ESTILO DE VIDA', 'Completar duas especialidades não realizadas anteriormente em Artes e Habilidades Manuais.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente em Artes e Habilidades Manuais.', '12 - 13 - 14 - ≥15', 2, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente em Atividades Missionárias, Profissionais ou Agrícolas.', '13 - 14 - ≥15', 3, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente em Missionárias, Agrícolas, Ciência e Saúde ou Domésticas.', '14 - ≥15', 4, true),
('7', 'IX - ESTILO DE VIDA', 'Completar uma especialidade não realizada anteriormente em Recreativas, Ciência e Saúde, Domésticas ou Profissionais.', '≥15', 5, true);

-- ============================================================
-- CLASSES AVANÇADAS
-- ============================================================

-- I. AMIGO DA NATUREZA
INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Memorizar, cantar ou tocar o Hino dos Desbravadores e conhecer sua história.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Escolher personagem do AT (José, Jonas, Ester ou Rute) e conversar sobre o amor e livramento de Deus.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Levar pelo menos dois amigos não adventistas à Escola Sabatina ou ao Clube.', '11 - 12 - 13 - 14 - ≥15', 3, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Conhecer princípios de higiene, boas maneiras à mesa e comportamento com diferentes idades.', '11 - 12 - 13 - 14 - ≥15', 4, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Completar a especialidade de Arte de Acampar.', '11 - 12 - 13 - 14 - ≥15', 5, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Conhecer e identificar 10 flores silvestres e 10 insetos da região.', '11 - 12 - 13 - 14 - ≥15', 6, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Começar fogueira com um fósforo usando materiais naturais e mantê-la acesa.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Usar corretamente faca, facão ou machadinha e conhecer 10 regras de segurança.', '11 - 12 - 13 - 14 - ≥15', 8, true),
('7', 'AVANÇADA I - AMIGO DA NATUREZA', 'Completar especialidade em Atividades Missionárias/Comunitárias ou Agrícolas.', '11 - 12 - 13 - 14 - ≥15', 9, true);

-- II. COMPANHEIRO DE EXCURSIONISMO
INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Aprender e demonstrar composição, significado e uso correto da Bandeira Nacional.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Ler a primeira visão de Ellen White (Primeiros Escritos págs 13-20) e discutir como Deus usa profetas.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Participar de atividade missionária ou comunitária envolvendo também um amigo.', '11 - 12 - 13 - 14 - ≥15', 3, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Conversar sobre respeito aos pais e fazer lista mostrando como cuidam de você.', '11 - 12 - 13 - 14 - ≥15', 4, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Participar de caminhada de 6 km e preparar relatório de uma página.', '11 - 12 - 13 - 14 - ≥15', 5, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Assistir curso "Como deixar de fumar", filmes sobre saúde, ajudar em exposição ou pesquisar sobre saúde.', '11 - 12 - 13 - 14 - ≥15', 6, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Identificar e descrever 12 pássaros e 12 árvores nativas.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Planejar e organizar Investidura, Admissão em lenço ou Dia Mundial do Desbravador.', '11 - 12 - 13 - 14 - ≥15', 8, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Preparar refeição em fogueira durante acampamento.', '11 - 12 - 13 - 14 - ≥15', 9, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Preparar quadro com 15 nós diferentes.', '11 - 12 - 13 - 14 - ≥15', 10, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Completar especialidade de Excursionismo Pedestre com mochila.', '11 - 12 - 13 - 14 - ≥15', 11, true),
('7', 'AVANÇADA II - COMPANHEIRO DE EXCURSIONISMO', 'Completar especialidade não realizada anteriormente em Domésticas, Ciência e Saúde, Missionárias ou Agrícolas.', '11 - 12 - 13 - 14 - ≥15', 12, true);

-- III. PESQUISADOR DE CAMPO E BOSQUE
INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Conhecer e usar adequadamente a Bandeira dos Desbravadores e o Bandeirim de Unidade.', '12 - 13 - 14 - ≥15', 1, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Ler história de pioneiro e discutir a importância missionária e a Grande Comissão (Mateus 28:18-20).', '12 - 13 - 14 - ≥15', 2, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Convidar pessoa para assistir Clube, Classe Bíblica ou Pequeno Grupo.', '12 - 13 - 14 - ≥15', 3, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Completar especialidade: Asseio e cortesia cristã ou Vida Familiar.', '12 - 13 - 14 - ≥15', 4, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Participar de caminhada de 10 km e listar equipamentos necessários.', '12 - 13 - 14 - ≥15', 5, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Participar na organização de Investidura, Admissão em lenço ou Dia Mundial do Desbravador.', '12 - 13 - 14 - ≥15', 6, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Identificar 6 pegadas de animais/aves e fazer modelo em gesso de 3 delas.', '12 - 13 - 14 - ≥15', 7, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Aprender 4 amarras básicas e construir móvel de acampamento.', '12 - 13 - 14 - ≥15', 8, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Planejar cardápio vegetariano para acampamento de 3 dias.', '12 - 13 - 14 - ≥15', 9, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Enviar/receber mensagem por semáforos, código Morse, LIBRAS ou Braile.', '12 - 13 - 14 - ≥15', 10, true),
('7', 'AVANÇADA III - PESQUISADOR DE CAMPO E BOSQUE', 'Completar especialidades não realizadas anteriormente em 2 áreas (Domésticas, Ciência, Missionárias ou Agrícolas).', '12 - 13 - 14 - ≥15', 11, true);

-- IV. PIONEIRO DE NOVAS FRONTEIRAS
INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Completar especialidade de Cidadania Cristã (se não feita anteriormente).', '13 - 14 - ≥15', 1, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Encenar a história do Bom Samaritano e auxiliar praticamente pelo menos 3 pessoas.', '13 - 14 - ≥15', 2, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Participar de atividade física (caminhada 10km, cavalgar, canoa, ciclismo, natação, corrida ou patins) e apresentar relatório.', '13 - 14 - ≥15', 3, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Completar especialidade de Mapa e Bússola.', '13 - 14 - ≥15', 4, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Demonstrar habilidade no uso correto de uma machadinha.', '13 - 14 - ≥15', 5, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Acender fogueira em dia de chuva e mantê-la acesa.', '13 - 14 - ≥15', 6, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Pesquisar 10 plantas silvestres comestíveis, ou enviar 35 letras/min em código semafórico/ náutico, ou apresentar Mateus 24 em LIBRAS, ou preparar Salmo 23 em braile.', '13 - 14 - ≥15', 7, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Completar especialidade não realizada anteriormente em Atividades Recreativas.', '13 - 14 - ≥15', 8, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Pesquisar e identificar 25 itens (folhas, rochas, flores, borboletas ou conchas).', '13 - 14 - ≥15', 9, true),
('7', 'AVANÇADA IV - PIONEIRO DE NOVAS FRONTEIRAS', 'Completar especialidade de Fogueiras e Cozinha ao Ar Livre.', '13 - 14 - ≥15', 10, true);

-- V. EXCURSIONISTA NA MATA
INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Apresentar texto sobre respeito à Lei de Deus e autoridades civis, enumerando 10 princípios de comportamento moral.', '14 - ≥15', 1, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Acompanhar pastor ou ancião em visita missionária ou estudo bíblico.', '14 - ≥15', 2, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Completar especialidade de Testemunho Juvenil.', '14 - ≥15', 3, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Apresentar 5 atividades na natureza para tardes de sábado.', '14 - ≥15', 4, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Construir móvel de acampamento e portal para o Clube com a Unidade.', '14 - ≥15', 5, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Conversar sobre Modéstia Cristã, Recreação, Saúde ou Observância do Sábado.', '14 - ≥15', 6, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Demonstrar conhecimento para encontrar alimentos através de plantas silvestres e diferenciar de tóxicas.', '14 - ≥15', 7, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Demonstrar procedimentos para ferimentos por animais peçonhentos e não peçonhentos.', '14 - ≥15', 8, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Demonstrar técnicas para percorrer trilhas em desertos, florestas, pântanos e rios.', '14 - ≥15', 9, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Completar especialidade de Ordem Unida.', '14 - ≥15', 10, true),
('7', 'AVANÇADA V - EXCURSIONISTA NA MATA', 'Completar especialidade de Vida Silvestre.', '14 - ≥15', 11, true);

-- VI. GUIA DE EXPLORAÇÃO
INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Completar especialidade de Mordomia.', '≥15', 1, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Ler O Maior Discurso de Cristo e escrever uma página sobre o efeito da leitura.', '≥15', 2, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Trazer 2 amigos para reuniões da igreja ou ajudar a planejar e participar de 4 dias de evangelismo jovem.', '≥15', 3, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Escrever página ou apresentar palestra sobre como influenciar amigos para Cristo.', '≥15', 4, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Observar por 2 meses o trabalho dos diáconos e apresentar relatório detalhado.', '≥15', 5, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Completar especialidade não realizada anteriormente para mestrado em Vida Campestre.', '≥15', 6, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Projetar 3 tipos de abrigo, explicar seu uso e utilizar um em acampamento.', '≥15', 7, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Assistir seminário ou apresentar palestra sobre Aborto, Bullying, Violência, Drogas ou DSTs.', '≥15', 8, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Completar especialidade de Liderança Campestre.', '≥15', 9, true),
('7', 'AVANÇADA VI - GUIA DE EXPLORAÇÃO', 'Completar especialidade de Orçamento Familiar.', '≥15', 10, true);

-- ============================================================
-- TRIGGER para updated_at em requisitos_classe
-- ============================================================

DROP TRIGGER IF EXISTS set_updated_at ON requisitos_classe;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON requisitos_classe
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
