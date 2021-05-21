require('dotenv').config();

var path = require('path');
var express = require('express');
const data = require('./data');
const bcrypt = require('bcrypt');
const passport = require('passport');
const localPassport = require('passport-local').Strategy;
const flash = require('express-flash');
const session = require('express-session');
const mo = require('method-override');
var app = express();
const Sequelize = require('sequelize')
//inicjacja połączenia z PostgreSQL
const db = require('./dbHelper');
const { allowedNodeEnvironmentFlags } = require('process');


app.use(express.urlencoded({ extended: false }));

var serv = require('http').Server(app);
serv.listen(9003, function () {  
    var host = serv.address().address;  
    var port = serv.address().port;  
    console.log('Example app listening at http://%s:%s', host, port);  
});

app.use(express.static(path.join(__dirname, '/')));

app.set('view engine', 'ejs');


//* * * * * * * * <PASSPORT AUTH> * * * * * * * * * *
let currentUser = {}
var users = [];
async function getUserByEmail(email) {
    console.log("AUTH email = "+email);
    users = await db.getClients();
    //console.log(users);
    //TODO z bazy danych wydobądź obiekt usera
    for( usr of users) {
        console.log("usr = " +usr.email);
        if(usr.email == email ) {
            console.log("usr = " +usr.email);
            return usr;
        }
    }
    return null;
}

function getUserById(id) {
    console.log("AUTH id = "+id);
    console.log(currentUser);
    for( usr of users) {
        if(id == usr.id) {
            return usr;
        }
    }
    return null;
}

async function auth(email, pass, done) {
    const usr = await getUserByEmail(email);
    // console.log(usr);
    if ( !usr) {
        return done(null, false, { message: 'Nie ma takiego użytkownika.'});
    }
    try {
        if( await bcrypt.compare(pass, usr.password)) {
            console.log("AUTH true!!!! " + usr.id);
            currentUser = usr;
            return done(null, usr);
        }
        else {
            return done(null, false, { message: 'Nieprawidłowe hasło.'});
        }
    }catch (err) {
        return done(err);
    }
    return done(null, false, { message: 'Nierozpoznany błąd autoryzacji.'});
}

function initPassport() {
    passport.use(new localPassport({usernameField: 'email', }, auth));
    passport.serializeUser((user, done) => { done(null, user)});
    passport.deserializeUser((user, done) => {  done(null, user) });
} 

//* * * * * * * * </PASSPORT AUTH> * * * * * * * * * *


initPassport();
app.use(flash());
app.use(session({
    secret:  'MW2ZaxbV1elbIuihlU0TNuM0Y3IvZx07A4ddVatpgJrBxLGE.BvR2',
    resave: false,
    saveUninitialized: false
}));
 
app.use(passport.initialize());
app.use(passport.session());
app.use(mo('_mo'));

app.post('/login', passport.authenticate('local', {
    successRedirect: '/wyszukiwanie',
    failureRedirect: '/login',
    failureFlash: true
} ));
// function (req, res) {  
    
//     res.render("index.ejs", {menu : 'menus/mainMenu', body: 'pages/loginPage', cars:  {} });
 
// }
app.get('/rejestracja', function (req, res) {  
 
    res.render("index.ejs", {menu : 'menus/mainMenu', body: 'pages/registerPage', cars:  [] });
 
});

app.get('/login', function (req, res) {  

    res.render("index.ejs", {menu : 'menus/mainMenu', body: 'pages/loginPage', cars:  [] });
});



app.post('/reserve', isLogged, function(req, res){
    
    console.log(req.body);
    const data = JSON.parse(req.body.json);
    db.reserve(currentUser.id, data.car, new Date(data.dateFrom), data.days)
    console.log(req.body)
    res.send('Zarezerwowano auto na ' + data.days+"dni od <br><i>" + new Date(data.dateFrom)+ "</i>");
    
});

app.post('/rejestracja', async function (req, res) {  
    
    try {
        const encryptedPass = await bcrypt.hash(req.body.password, 5)
        console.log(encryptedPass);
        currentUser = {
            id: 0,
            nick: req.body.nickname,
            email: req.body.email,
            password: encryptedPass
        };
        //dodaje klienta do bazy danych
        db.addClient(currentUser);
        users = await db.getClients();
        
        currentUser = users.filter( c => c.email === currentUser.email && c.password == currentUser.password && c.nick == currentUser.nick)

        console.log("currentUser: " + currentUser);
        res.redirect("/login");
    }
    catch{
        res.redirect("/rejestracja");
    }
    //res.send("login " + req.body.email + ": " + req.body.password); 
 
});
app.delete('/logout', (req, res) => {

        req.logOut();
        res.redirect("/login");
});

app.get('/aktualnie', isLogged, function (req, res) {  
    //res.send("Aktualnie");
    const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5433/dbname')
    sequelize

    .authenticate()

    .then(() => {
        console.log('Zalogowano do bazy!');
    })

    .catch(err => {
        console.error('Problem z logowaniem do bazy danych:', err);
    });
});


app.get('/wyszukiwanie', isLogged,  async function (req, res) {  
    
    console.log("currentUser == "+currentUser.nick);
    const carz = await db.getCarz();
    const rentals = await db.getCarRentals();
    rentals.map( r=> {
        r.czas_stop = new Date();
        r.czas_stop.setDate(r.czas_start.getDate()+r.days);
    });
    carz.map( c => rentals.filter( r => r.id_car === c.id).map( rent => {
        const now = rent.now;
        //console.log("RENTED: now = "+ (parseInt(rent.czas_start.valueOf()) - parseInt(now.valueOf()) ) );
        if( rent.czas_start.valueOf() < now.valueOf()  && rent.czas_stop.valueOf() > now.valueOf()) {
            c.rented = rent;
            //console.log("RENTED!!!: "+c.id);
        }
    } ));
    // for ( c of carz)
    //     console.log("carz == "+c.model);

    res.render("index.ejs", {menu : 'menus/loggedMenu', body: 'pages/startPage', cars: [carz, currentUser]});
});

app.get('/historia', isLogged,  async function (req, res) {  
    
    console.log("currentUser == "+currentUser.id);
    const carz = await db.getCarz();
    const rentals = await db.getCarRentalByClient(currentUser.id);
    rentals.map( r=> {
        r.czas_stop = new Date();
        r.czas_stop.setDate(r.czas_start.getDate()+r.days);
    });
    
    for ( rr of rentals)
         console.log("rents == "+rr.czas_stop+":"+rr.czas_start);

    res.render("index.ejs", {menu : 'menus/loggedMenu', body: 'pages/historyPage', cars: [rentals, currentUser]});
});

app.get('/rm_reservations', isLogged,  async function (req, res) {  
    
    console.log("currentUser == "+currentUser.id);
    const carz = await db.getCarz();
    const rentals = await db.getCarRentalByClient(currentUser.id);
    rentals.map( r=> {
        r.czas_stop = new Date();
        r.czas_stop.setDate(r.czas_start.getDate()+r.days);
    });
    
    for ( rr of rentals)
         console.log("rents == "+rr.czas_stop+":"+rr.czas_start);

    res.render("index.ejs", {menu : 'menus/loggedMenu', body: 'pages/rmPage', cars: [rentals, currentUser]});
});
app.get('/rm', isLogged,  function (req, res) {  
    if(  currentUser == null ||  currentUser.role != 'Admin')
        res.send("No Admin error")
    db.rmRent(req.query.id)
    res.redirect('/rm_reservations');
});

app.get('/detail', isLogged,  async function (req, res) {  
    
    console.log("currentUser == "+currentUser.nick);
    
    
    const car = await db.getCar(req.query.id);
    console.log(car)

    // res.send(""+req.query.id)
    res.render("index.ejs", {menu : 'menus/backMenu', body: 'pages/detailPage', cars: [car, currentUser]});
});

app.get('/searching', isLogged,  async function (req, res) {  
    
    console.log(req.query.id + " == req.query.id");
    let rentals = await db.getCarRental(req.query.id);
    // console.log(rentals);
    rentals.map( r=> {
        r.czas_stop = new Date();
        r.czas_stop.setDate(r.czas_start.getDate()+r.days);
    });
    const now = new Date();
    rentals = rentals.filter( r => r.czas_stop > now );
    console.log(rentals);
    if(rentals.length == 0)
    rentals.push({id_car:req.query.id, id_client: currentUser.id});
    // rentals="ABC";
    res.render("index.ejs", {menu : 'menus/backMenu1', body: 'pages/rentPage', cars: [rentals, currentUser]});
});


app.get('/', async function (req, res) {  
    
    users = await db.getClients();
        
    //data.carz.map( c => { db.putCarz(c); } );
    //console.log(rs)

    res.render("index.ejs", {menu : 'menus/mainMenu', body: 'pages/registerPage', cars:  [] });

});  

function isLogged(req, res, callback) {

    if(req.isAuthenticated()) {
        return callback();
    }
    else {
        res.redirect('/login');
    }
}

console.log("Server ON");