-- Insere área C.A. - III. PESQUISADOR DE CAMPO E BOSQUE na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Conhecer e saber usar de forma adequada a Bandeira dos Desbravadores e o Bandeirim de Unidade.', '12 - 13 - 14 - ≥15', 1, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Ler a história de J. N. Andrews ou um pioneiro de seu país. Discutir a importância do trabalho de missionários em outros países e por que Cristo ordenou a Grande Comissão (Mateus 28:18-20).', '12 - 13 - 14 - ≥15', 2, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Convidar uma pessoa para assistir um dos seguintes programas:', 'a) Clube de Desbravadores\nb) Classe Bíblica\nc) Pequenos Grupos', 3, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Fazer uma das seguintes especialidades:', 'a) Asseio e cortesia cristã\nb) Vida Familiar', 4, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Participar de uma caminhada de 10 km e fazer uma lista dos equipamentos necessários, incluindo a roupa e o calçado que devem ser usados.', '12 - 13 - 14 - ≥15', 5, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Participar na organização de um dos eventos especiais do Clube:', 'a) Investidura\nb) Admissão em lenço\nc) Dia Mundial do Desbravador', 6, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Identificar seis pegadas de animais ou aves. Fazer um modelo em gesso, massa de modelar ou biscuit de três dessas pegadas.', '12 - 13 - 14 - ≥15', 7, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Aprender a fazer as quatro amarras básicas e construir um móvel de acampamento.', '12 - 13 - 14 - ≥15', 8, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Planejar um cardápio vegetariano para sua Unidade, para um acampamento de três dias e apresentar ao seu instrutor.', '12 - 13 - 14 - ≥15', 9, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Enviar e receber uma mensagem através de uma das formas de comunicação abaixo:', 'a) Alfabeto com semáforos\nb) Código Morse, com lanterna\nc) Alfabeto LIBRAS (língua de sinais)\nd) Alfabeto Braile', 10, true),
('7', 'C.A. - III. PESQUISADOR DE CAMPO E BOSQUE', 'Completar uma especialidade, não realizada anteriormente, em duas das seguintes áreas:', 'a) Habilidades Domésticas\nb) Ciência e Saúde\nc) Atividades Missionárias e Comunitárias\nd) Atividades Agrícolas e Afins', 11, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
