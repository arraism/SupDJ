/* =========================================================
*
*	SupDJ 
*
* =========================================================*/
URL = require('url');
SWIG = require("swig");
MYSQL = require("mysql");
CONSOLIDATE = require("consolidate");
EXPRESS = require("express");
JQuery = require("jquery");
HTTP = require('http');
OS = require('os');

var interfaces = require('os').networkInterfaces();
var addresses = [];
for (k in interfaces) {
	for (k2 in interfaces[k]) {
		var address = interfaces[k][k2];
		if (address.family == 'IPv4' && !address.internal) {
			addresses.push(address.address)
		}
	}
}

// ===================================================
// Configuration Variable globales
// ===================================================
CFG = {
	hostAdress: addresses[0],
	admin_password: "admin",
	controllers: "./core/controllers/",
	httpPort : 1337,
	www : "./core/www/",
	db:{
		// host : "10.18.19.251",
		host: "localhost",
		user : "root",
		pass : "",
		name : "supdj"
	}
}

TIMERS = new Array();
SOCKETS = new Array();
USERS = new Array();
ROOMS = new Array();

// ===================================================
// Modules
// ===================================================
var app = EXPRESS();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(CFG.httpPort);

// ===================================================
// Server Initialisation
// ===================================================

server.listen(CFG.httpPort);

app.engine('.html', CONSOLIDATE.swig);
app.use(EXPRESS.bodyParser());
app.set('view engine', 'html');
app.set('views', './core/views/');

// ===================================================
// SWIG
// ===================================================

SWIG.init({
	root: './core/views/',
	allowErrors: true,
});


// ===================================================
// MySQL Database
// ===================================================


DB = MYSQL.createConnection({
  host     : CFG.db.host,
  user     : CFG.db.user,
  password : CFG.db.pass,
  database : CFG.db.name,
});

DB.connect(function (error){
	if (error) console.log("[ERR] Not connected to MySQL");
	else console.log("[OK] Connected to MySQL");
	console.log ("\nListening on "+CFG.hostAdress+":"+CFG.httpPort+"/localhost:"+CFG.httpPort);
	init();
});


// ===================================================
// Loading Controllers
// ===================================================

page = require(CFG.controllers + "page.js");
socketController = require(CFG.controllers + "socketController.js");
FUNCTIONS = require(CFG.controllers + "functions.js");
WEB_SERVICE = require(CFG.controllers + "web_service.js");

// ===================================================
// Loading Classes
// ===================================================

User = require(CFG.controllers + "/classes/User.js");
Room = require(CFG.controllers + "/classes/Room.js");

// ===================================================
// Socket.io
// ===================================================
io.set('log level', 1);
io.sockets.on("connection", socketController.socketHandler);

// ===================================================
// Routes
// ===================================================

app.use("/", EXPRESS.static(CFG.www));

app.get('/', page.index);
app.get('/admin',page.admin);
app.get('/disconnect',page.disconnect);
app.get('/index',page.index);
app.post('/web_service',WEB_SERVICE.web_service);
app.post('/login',page.login);
app.get('/dashboard',page.dashboard);
app.post('/register',page.register);
app.post('/new_room',page.new_room);
app.get('/room',page.join_room);
app.post('/room',page.join_room);
app.get('/my_playlists',page.my_playlists);
app.get('/profile',page.profile);
// Components Loaded

function init(){
	console.log("INIT");

	/*DB.query("SELECT * FROM tile ORDER BY x,y; " ,function(err, rows, fields){
		if(err) throw err;
		for (var i in rows) {
			var tile = rows[i];
			x = tile.x;
			y = tile.y;
			TILESJSON = rows;

			if (typeof TILES[x] == "undefined")
				TILES[x] = new Array();
			TILES[x][y] = tile;

		} 	
		console.log("Tiles Loaded");
		//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
		var growInterval = setInterval(grow, 1000);
	});*/
}