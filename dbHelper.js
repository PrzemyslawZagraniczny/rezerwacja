const db = require('./db');
const config = require('./pg_config');

async function getCarz() {
  const rs = await db.query(
    'SELECT "id", "model","year", "img", "A/C" as AC, "price", "gearbox", "doors", "seats", "condition", "type" FROM car' 
  );
  return rs;
}

async function getCar(id) {
  const rs = await db.query(
    'SELECT "id", "model","year", "img", "A/C" as AC, "price", "gearbox", "doors", "seats", "condition", "type" FROM car WHERE id = $1', [id] 
  );
  return rs;
}
async function getCarRental(id) {
  const rs = await db.query(
    'SELECT id, id_car, czas_start, days, now() as now FROM rent  WHERE id_car = $1', [id]
  )
  return rs;
}
async function getCarRentalByClient(id) {
  const rs = await db.query(
    'SELECT r.id,cl.email, cl.nick, c.model, c.price, r.czas_start, r.days FROM rent r, car c, client cl  WHERE id_client = $1 AND id_client = cl.id AND c.id=r.id_car', [id]
  )
  return rs;
}
function rmRent(id) {
  console.log('DELETE  FROM rent r WHERE r.id ='+id);
  const rs = db.query(
    'DELETE  FROM rent r WHERE r.id = $1', [id]
  )
  return rs;
}
async function getClients() {
    const rs = await db.query(
      'SELECT id, nick, email, password, role FROM client' 
    );
    return rs;
  }

  async function getCarRentals() {
    const rs = await db.query(
      'SELECT c.id, r.id, r.id_car, r.czas_start, r.days, now() as now FROM rent r, car c  WHERE c.id = r.id_car'
    )
    return rs;
  }
    


//wprowadza dane samochodu do bazy
function putCarz(car) {
    db.query('INSERT INTO "car" ("model","year", "img", "A/C", "price", "gearbox", "doors", "seats", "condition", "type" ) VALUES ($1,$2,$3,$4,$5, $6,$7,$8, $9, $10)',
    [car.model, car.rocznik, 
    car.grafika,
    car.klmatyzacja,
    car.CENA,
    car.gearbox,
    car.drzwi,
    car.siedzenia,
    car.stan,
    car.typ]);
}
function reserve(id, carId, dat, days) {
  console.log('INSERT INTO "rent" ("id_car","id_client", "czas_start", "days" ) VALUES (' + carId+','+id+','+dat+','+days+')');
  db.query('INSERT INTO "rent" ("id_car","id_client", "czas_start", "days" ) VALUES ($1,$2,$3,$4)',
  [
    carId,
    id,
    dat,
    days
  ]);
  
}

function addClient(client) {
    db.query('INSERT INTO "client" ("nick", "email", "password" ) VALUES ($1,$2,$3)',
    [client.nick, client.email, client.password]);
}

module.exports = {
  getCarz,
  getCar,
  putCarz,
  addClient,
  getClients,
  getCarRentals,
  getCarRental,
  getCarRentalByClient,
  reserve,
  rmRent
}