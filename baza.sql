DROP TABLE "rent";
DROP TABLE "car";
DROP TABLE "client";

CREATE TABLE "client" (
 "id" SERIAL PRIMARY KEY,
 "nick" VARCHAR(125) NOT NULL,
 "email" VARCHAR(125) NOT NULL,
 "password" VARCHAR(125) NOT NULL,
 "role" VARCHAR(7) CHECK( "role" IN ('Admin','Client') )  NOT NULL DEFAULT 'Client'
);

CREATE TABLE "car" (
	"id" SERIAL PRIMARY KEY,
	"model" VARCHAR(100) NOT NULL,
	"year" INTEGER NOT NULL,
	"A/C" BOOLEAN NOT NULL DEFAULT true,
	"price" INTEGER NOT NULL, 
    "gearbox" VARCHAR(7) CHECK( "gearbox" IN ('Manual','Auto') )  NOT NULL DEFAULT 'Manual',
    "doors" INTEGER CHECK ( "doors" BETWEEN 1 AND 9),
    "seats" INTEGER CHECK ( "doors" BETWEEN 1 AND 9),
    "condition" INTEGER CHECK ( "doors" BETWEEN 1 AND 5),
    "type" CHAR(4) NOT NULL,
    "img"VARCHAR(255)
);
CREATE TABLE "rent" (
	"id" SERIAL PRIMARY KEY,
	"id_client" INTEGER NOT NULL REFERENCES client(id),
	"id_car" INTEGER NOT NULL REFERENCES car(id),
	"czas_start" TIMESTAMP NOT NULL,
	"reservation_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"days" INTEGER NOT NULL
);
		
INSERT INTO "client" ("nick", "email", "password", "role" ) VALUES('przemek', 'pz@wp.pl', '$2b$05$yUYhKamxwTlSK1u/NkjZtekpy7xXnyhRgGTrorT4d4ufAfPujQj56', 'Admin');
-- INSERT INTO "rent" ("id_client", "id_car", "days") VALUES(1, 1, 5), (1,2, 2), (1, 5, 3)
-- INSERT INTO "client" ("nick", "email", "password" ) VALUES('Przemysław', 'Zagraniczny', '');
-- INSERT INTO "car" ("model","year", "img", "A/C", "price", "gearbox", "doors", "type" ) VALUES
--     ( 'Opel Astra',2017, 'img/flota/opel-astra-5d-weiss-2017.png', true, 29999, 'Manual', 5, 'CDMR'),
--     ( 'Renault Clio', 2020, 'img/flota/renault-clio-5d-schwarz-2020.png', true, 32900, 'Manual',5, 'EDMR'),
--     ( 'Opel Astra SW', 2016, 'img/flota/opel-astra-kombi-grau-2016.png', true, 12900,'Manual',5, 'CWMR')