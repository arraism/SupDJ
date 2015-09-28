exports.index = function (req, res){
	res.render("index.html");
};

exports.admin = function (req, res){
	res.render("admin.html");
};

exports.disconnect = function (req, res){
	res.render("index.html");
};

exports.dashboard = function (req, res){
	res.render("dashboard.html");
};

exports.my_playlists = function (req, res){
	res.render("my_playlists.html");
};

exports.profile = function (req, res){
	res.render("profile.html");
};

exports.login = function (req, res){
	var login = req.body.login ;
	var password = req.body.password ;
	var sql = "select * from user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err , row){
		if (row.length > 0){
			var user = row[0];
			user.ip = CFG.hostAdress;
			res.send({
				redirect: "/dashboard",
				error: 0,
				user: user
			});
			res.end();
		}
		else {
			res.send("index.html",{error:1});
			res.end();
		}
	});
};
 
exports.register = function (req, res){
	var login = req.body.login;
	var password = req.body.password;
	var mail = req.body.mail;
	var sql;

	sql = "SELECT * FROM user WHERE login='"+login+"' OR email='"+mail+"'";
		DB.query(sql, function (err, row){
		if (err)console.log(err);
		if(row.length == 0){
			sql = "INSERT INTO user (login,password,email) VALUES ('"+ login +"','"+ password +"','"+ mail +"')";
			DB.query(sql, function (err, row){
				if (err)console.log(err);
			});
			res.send({
				error: 0,
				libelle: "OK"
			});
			res.end();
		} else {
			res.send({
				error: 1,
				libelle: "User already exist"
			});
			res.end();
		}
	});


};

exports.new_room = function (req,res){
	//Récupération des données
	var id_user = req.body.id_user;
	var room_name = req.body.room_name;
	var room_password = req.body.room_password;
	var room_max_length_queue = req.body.room_max_length_queue;
	//Vérificaion que l'utilisateur n'a pas déjà une room créée
	if(check_user_no_room(id_user) == true){
		//Création de la room
		var room = new Room();
		id_room = get_new_room_id();
		room.id = id_room;
		room.id_admin = id_user;
		room.name = room_name;
		room.password = room_password;
		room.max_length_queue = room_max_length_queue;
		//Récupération de l'utilisateur qui a créé la room
		var sql = "SELECT * FROM user WHERE id_user="+id_user;
		DB.query(sql, function (err, row){
			if (err){
				console.log(sql);
				console.log(err);
				res.end();
			} else {
				if (row.length == 1){
					var user = row[0];
					user.ip = CFG.hostAdress;
					user.is_admin = 1;
					ROOMS[room.id] = room;
					res.render("room.html",{
						room: JSON.stringify(room),
						user: JSON.stringify(user),
						server: {
							ip: CFG.hostAdress,
							port: CFG.httpPort
						}
					});
				} else {
					res.render("dashboard.html",{
						error: 1,
					});
				}
			}
		});
	} else {
		res.render("dashboard.html",{
			error: 2,
		});
	}
};

exports.join_room = function (req,res){
	var id_room = req.body.id_room; if(id_room == undefined)id_room = req.query.id_room;
	var id_user = req.body.id_user; if(id_user == undefined)id_user = req.query.id_user;
	var sql = "SELECT * FROM user WHERE id_user="+id_user;
	DB.query(sql, function (err, row){
		if (err){
			console.log(err);
			res.end();
		} else {
			if (row.length == 1){
				var timer = 0;
				if(TIMERS[id_room] != undefined){
					timer = Math.ceil((ROOMS[id_room].queue[0].data_link.duration)-(TIMERS[id_room]._idleStart + TIMERS[id_room]._idleTimeout - Math.ceil(OS.uptime()*1000)) / 1000);
				}
				var user = row[0];
				user.ip = CFG.hostAdress;
				if(user.id_user == ROOMS[id_room].id_admin){
					user.is_admin = 1;
				} else {
					user.is_admin = 0;
				}
				res.render("room.html",{
					room: JSON.stringify(ROOMS[id_room]).replace("'",""),
					user: JSON.stringify(user),
					server: {
						ip: CFG.hostAdress,
						port: CFG.httpPort
					},
					timer: timer
				});
			} else {
				res.render("index.html",{
					error: 1
				});
			}
		}
	});
};

function check_user_no_room(id_user){
	for(var i = 0 ; i < ROOMS.length ; i++){
		var room = ROOMS[i];
		if(room.id_admin == id_user){
			return room;
		}
	}
	return true;
};

function get_new_room_id(){
	for(var i = 0 ; i < ROOMS.length ; i++){
		if(ROOMS[i] == undefined){
			return i;
		}
	}
	return ROOMS.length;
};