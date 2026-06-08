-- Insere área C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS na classe Agrupadas

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Completar a especialidade de Cidadania cristã, caso não tenha sido feita anteriormente.', '13 - 14 - ≥15', 1, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Encenar a história do bom samaritano, demonstrando como ajudar as pessoas. Auxiliar de forma prática pelo menos a três pessoas.', '13 - 14 - ≥15', 2, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Participar de uma das seguintes atividades, apresentando ao final um relatório escrito contendo no mínimo duas páginas:', 'a) Caminhar 10 km\nb) Cavalgar 2 km\nc) Viajar de canoa durante 2h\nd) Praticar 15 km de ciclismo\ne) Nadar 200 metros\nf) Correr 1500 metros\ng) Rodar 2 km de patins ou roller', 3, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Completar a especialidade de Mapa e bússola.', '13 - 14 - ≥15', 4, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Demonstrar habilidade no uso correto de uma machadinha.', '13 - 14 - ≥15', 5, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Ser capaz de acender uma fogueira em dia de chuva, saber como conseguir lenha seca e manter o fogo aceso.', '13 - 14 - ≥15', 6, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Completar um dos seguintes itens:', 'a) Pesquisar e identificar 10 variedades de plantas silvestres comestíveis.\nb) Ser capaz de enviar e receber 35 letras por minuto pelo código semafórico\nc) Ser capaz de enviar e receber 35 letras por minuto através do código náutico, usando o código internacional\nd) Ser capaz de apresentar e entender Mateus 24 em LIBRAS (língua de sinais)\ne) Preparar o salmo 23 em braile', 7, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Completar uma especialidade, não realizadas anteriormente, em Atividades Recreativas.', '13 - 14 - ≥15', 8, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Pesquisar e identificar, através de fotografia, exposição ou ao vivo, dois dos seguintes itens:', 'a) 25 folhas de árvores\nb) 25 rochas e minerais\nc) 25 flores silvestres\nd) 25 borboletas e mariposas\ne) 25 conchas', 9, true),
('7', 'C.A. - IV. PIONEIRO DE NOVAS FRONTEIRAS', 'Completar a especialidade de Fogueiras e cozinha ao ar livre.', '13 - 14 - ≥15', 10, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
