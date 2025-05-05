-- CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE dbCryptoChiksGame;
USE dbCryptoChiksGame;
-- TABLA USUARIO
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    vidas INT DEFAULT 3 NOT NULL
);

CREATE TABLE Administrador(
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);


CREATE TABLE RegistroSesion (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_salida DATETIME DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE
);



CREATE TABLE Progreso_Usuario (
    id_usuario INT,
    id_curso INT,
    id_leccion INT,
    PRIMARY KEY (id_usuario, id_curso, id_leccion),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES Curso(id_curso) ON DELETE CASCADE,
    FOREIGN KEY (id_leccion) REFERENCES Leccion(id_leccion) ON DELETE CASCADE
);


-- TABLA CURSO
CREATE TABLE Curso (
id_curso INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
descripcion TEXT
);
-- TABLA LECCIÓN
CREATE TABLE Leccion (
id_leccion INT AUTO_INCREMENT PRIMARY KEY,
titulo VARCHAR(100) NOT NULL,
id_curso INT NOT NULL,
FOREIGN KEY (id_curso) REFERENCES Curso(id_curso) ON DELETE CASCADE
);
-- TABLA PREGUNTA
CREATE TABLE Pregunta (
id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
texto TEXT NOT NULL,
explicacion TEXT,
id_leccion INT NOT NULL,
FOREIGN KEY (id_leccion) REFERENCES Leccion(id_leccion) ON DELETE CASCADE
);
-- TABLA OPCIÓN_RESPUESTA
CREATE TABLE Opcion_Respuesta (
id_opcion INT AUTO_INCREMENT PRIMARY KEY,
texto_opcion TEXT NOT NULL,
es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
id_pregunta INT NOT NULL,
FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta) ON DELETE CASCADE
);
-- RELACIÓN N:M USUARIO - CURSO

CREATE TABLE Usuario_Curso (
id_usuario INT,
id_curso INT,
completado BOOLEAN NOT NULL DEFAULT FALSE,
intentos_restantes INT NOT NULL DEFAULT 3 CHECK (intentos_restantes BETWEEN 0 AND
3),
PRIMARY KEY (id_usuario, id_curso),
FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
FOREIGN KEY (id_curso) REFERENCES Curso(id_curso) ON DELETE CASCADE
);
-- TABLA LOGRO
CREATE TABLE Logro (
id_logro INT AUTO_INCREMENT PRIMARY KEY,
id_usuario INT NOT NULL,
id_leccion INT NOT NULL,
fecha_obtenida DATE NOT NULL,
FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
FOREIGN KEY (id_leccion) REFERENCES Leccion(id_leccion) ON DELETE CASCADE
);
-- TABLA EXAMEN
CREATE TABLE Examen (
id_examen INT AUTO_INCREMENT PRIMARY KEY,
id_usuario INT NOT NULL,
id_leccion INT NOT NULL,
puntaje INT NOT NULL CHECK (puntaje BETWEEN 0 AND 100),
hora_terminacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
FOREIGN KEY (id_leccion) REFERENCES Leccion(id_leccion) ON DELETE CASCADE
);
-- TABLA EXAMEN_RESPUESTA
CREATE TABLE Examen_Respuesta (
id_examenres INT AUTO_INCREMENT PRIMARY KEY,
id_examen INT NOT NULL,
id_pregunta INT NOT NULL,
opcion_elegida TEXT NOT NULL,
es_correcta BOOLEAN NOT NULL,
FOREIGN KEY (id_examen) REFERENCES Examen(id_examen) ON DELETE CASCADE,
FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta) ON DELETE CASCADE
);

CREATE TABLE Wallet (
    id_wallet INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    monedas INT NOT NULL DEFAULT 0 CHECK (monedas >= 0),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Item_Tienda (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio INT NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(50)
);

CREATE TABLE Compra (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_item INT NOT NULL,
    fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_item) REFERENCES Item_Tienda(id_item) ON DELETE CASCADE
);


-- TRIGGER: evitar duplicados en Usuario_Curso
DELIMITER $$
CREATE TRIGGER evitar_registro_duplicado
BEFORE INSERT ON Usuario_Curso
FOR EACH ROW
BEGIN
IF EXISTS (
SELECT 1 FROM Usuario_Curso
WHERE id_usuario = NEW.id_usuario AND id_curso = NEW.id_curso
) THEN
SIGNAL SQLSTATE '45000'

SET MESSAGE_TEXT = 'El usuario ya está inscrito en este curso.';
END IF;
END $$
DELIMITER ;
-- FUNCIÓN: Progreso del usuario
DELIMITER $$
CREATE FUNCTION ProgresoUsuario(user_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
DECLARE total INT;
DECLARE completados INT;
SELECT COUNT(*) INTO total FROM Usuario_Curso WHERE id_usuario = user_id;
SELECT COUNT(*) INTO completados FROM Usuario_Curso WHERE id_usuario = user_id AND
completado = TRUE;
IF total = 0 THEN
RETURN 0;
END IF;
RETURN (completados / total) * 100;
END $$
DELIMITER ;
-- PROCEDIMIENTO: Obtener logros de un usuario
DELIMITER $$
CREATE PROCEDURE ObtenerLogrosUsuario(IN user_id INT)
BEGIN
SELECT L.titulo AS Leccion, G.fecha_obtenida
FROM Logro G
JOIN Leccion L ON G.id_leccion = L.id_leccion
WHERE G.id_usuario = user_id;
END $$
DELIMITER ;

DELIMITER //

CREATE TRIGGER crear_wallet_automatica
AFTER INSERT ON Usuario
FOR EACH ROW
BEGIN
  INSERT INTO Wallet (id_usuario, monedas)
  VALUES (NEW.id_usuario, 100);
END;
//

DELIMITER ;
