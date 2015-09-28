exports.web_service = function(req, res){

	var login = req.body.login;
	var password = req.body.password;
	var mode = req.body.mode;

	switch(parseInt(mode)){
		case 1: //Check password admin
			check_password_admin(req,res);
			break;
		case 2: //Check password room
			check_room_password(req,res);
			break;
		case 3: //Get rooms
			get_rooms(req,res);
			break;
		case 4: //Get liste user admin
			get_liste_user(req,res);
			break;
		case 5: //Get playlist
			get_user_playlist(req,res);
			break;
		case 6: //New playlist
			new_playlist(req,res);
			break;
		case 7: //Edit playlist
			edit_playlist(req,res);
			break;
		case 8: //Get video_playlist
			get_user_video_playlist(req,res);
			break;
		case 9: //Add video to playlist
			add_video_to_playlist(req,res);
			break;
		case 10: //Delete playlist
			delete_playlist(req,res);
			break;
		case 11: //Delete video from playlist
			delete_video(req,res);
			break;
		case 12: //Create user
			create_user(req,res);
			break;
		case 13: //Save changes user settings
			save_changes_user_settings(req,res);
			break;
		case 14: //Get user settings
			get_user_settings(req,res);
			break;
		default:
			break;
	}

};

function check_password_admin(req,res){
	if(req.body.password == CFG.admin_password){
		res.send({ error: 0, password: req.body.password });
		res.end();
	} else {
		res.send({ error: 1 });
		res.end();
	}
};

function get_liste_user(req,res){
	var sql = "SELECT u.id_user,u.login,u.password,x.nb_playlist FROM user u LEFT JOIN (SELECT id_user,COUNT(id_playlist) as nb_playlist FROM playlist GROUP BY id_user) x ON u.id_user = x.id_user WHERE 1";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			res.send({
				users: row,
				error: 0,
				libelle: "OK"
			});
			res.end();
		} else {
			res.send({
				users: {},
				error: 0,
				libelle: "OK"
			});
			res.end();
		}
	});
};

function check_room_password(req,res){
	var password = req.body.room_password;
	var id_room = req.body.id_room;
	if(ROOMS[id_room].password == password){
		res.send({ error: 0 });
		res.end();
	} else {
		res.send({ error: 1 });
		res.end();
	}
};

function get_user_settings(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			res.send({ error: 0, user: user });
			res.end();
		} else {
			res.send({error: 1});
			res.end();
		}
	});	
};

function save_changes_user_settings(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var new_login = req.body.new_login;
	var new_password = req.body.new_password;
	var new_email = req.body.new_email;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			var sql = "UPDATE user SET login='"+ new_login +"', password='"+ new_password +"', email='"+ new_email +"' WHERE id_user="+user.id_user;
			DB.query(sql , function (err,row){
				if(!err){
					res.send({ error: 0, user: user });
					res.end();
				} else {
					res.send({ error: 2, user: user });
					res.end();					
				}
			});
		} else {
			res.send({error: 1});
			res.end();
		}
	});	
};

function create_user(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var mail = req.body.mail;
	var sql = "select * from user WHERE login='"+ login +"' OR password='"+ password +"' OR email='"+mail+"'";
	DB.query(sql , function (err , row){
		if (row.length == 0){
			var sql = "INSERT INTO user (login,password,email) VALUES ('"+login+"','"+password+"','"+mail+"')";
			DB.query(sql , function (err , row){
				if (err){
					res.send({
						error: 2,
						libelle: "Fail to insert user in database /// " + err + " /// " + sql
					});
					res.end();
				} else {
					res.send({
						error: 0,
						libelle: "OK"
					});
					res.end();
				}	
			});
		}
		else {
			res.send({
				error: 1,
				libelle: "User already exist"
			});
			res.end();
		}
	});
};

function get_rooms(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			var user_room = JSON.stringify(check_user_no_room(user.id_user));
			if(ROOMS.length > 0){
				res.send({ rooms: ROOMS, error: 0, user_room: user_room });
				res.end();
			} else {
				res.send({ rooms: false, error: 0 });
				res.end();
			}
		} else {
			res.send({error: 1});
			res.end();
		}
	});
};

function get_user_playlist(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			//Récupération des playlist de l'utilisateur
			var sql = "SELECT p.id_user,p.id_playlist,p.name,x.nb_video FROM playlist p LEFT JOIN (SELECT id_playlist,COUNT(id_video) as nb_video FROM video_playlist GROUP BY id_playlist) x ON p.id_playlist = x.id_playlist WHERE p.id_user="+user.id_user;
			DB.query(sql , function (err,row){
				if(row.length > 0){
					res.send({
						user: user,
						my_playlists: row,
						error: 0,
						libelle: "OK"
					});
					res.end();
				} else {
					res.send({
						user: user,
						my_playlists: {},
						error: 0,
						libelle: "OK"
					});
					res.end();
				}
			});
		} else {
			res.send({
				user: user,
				error: 1,
				libelle: "User not found"
			});
			res.end();
		}
	});
};

function get_user_video_playlist(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var id_playlist = req.body.id_playlist;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			//Récupération des playlist de l'utilisateur
			var sql = "SELECT * FROM video_playlist WHERE id_playlist="+id_playlist;
			DB.query(sql , function (err,row){
				if(row.length > 0){
					res.send({
						user: user,
						video_playlist: row,
						error: 0,
						libelle: "OK"
					});
					res.end();
				} else {
					res.send({
						user: user,
						video_playlist: {},
						error: 0,
						libelle: "OK"
					});
					res.end();
				}
			});
		} else {
			res.send({
				user: user,
				error: 1,
				libelle: "User not found"
			});
			res.end();
		}
	});
};

function new_playlist(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var playlist_name = req.body.playlist_name;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			//Check si le nom de la playlist n'existe pas déjà pour cet utilisateur
			var sql = "SELECT * FROM playlist,video_playlist WHERE playlist.id_user="+user.id_user+" AND playlist.name='"+playlist_name+"'";
			DB.query(sql , function (err,row){
				if(row.length == 0){
					//Enregistrement dans la base de données
					var sql = "INSERT INTO playlist (id_user,name) VALUES ("+user.id_user+",'"+playlist_name+"')";
					DB.query(sql , function (err,row){
						res.send({
							user: user,
							playlist_name: playlist_name,
							error: 0,
							libelle: "OK"
						});
						res.end();
					});
				} else {
					res.send({
						user: user,
						error: 2,
						libelle: "Name already exist"
					});
					res.end();
				}
			});
		} else {
			res.send({
				user: user,
				error: 1,
				libelle: "User not found"
			});
			res.end();
		}
	});
};

function edit_playlist(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var id_playlist = req.body.id_playlist;
	var rename = req.body.rename;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			var sql = "UPDATE playlist SET name='"+rename+"' WHERE id_playlist="+id_playlist;
			DB.query(sql , function (err,row){
				res.send({
					user: user,
					playlist_name: rename,
					error: 0,
					libelle: "OK"
				});
				res.end();
			});
		} else {
			res.send({
				user: user,
				error: 1,
				libelle: "User not found"
			});
			res.end();
		}
	});
};

function add_video_to_playlist(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var id_playlist = req.body.id_playlist;
	var link = req.body.link;
	var name = req.body.name;
	var duration = req.body.duration;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			var sql = "SELECT * FROM video_playlist WHERE link='"+link+"' AND id_playlist="+id_playlist;
			DB.query(sql , function (err,row){
				if(row.length == 0){
					var sql = "INSERT INTO video_playlist (id_playlist,link,name,duration) VALUES ("+id_playlist+",'"+link+"','"+name+"',"+duration+")";
					DB.query(sql , function (err,row){
						res.send({
							error: 0,
							libelle: "OK"
						});
						res.end();
					});
				} else {
					res.send({
						user: user,
						error: 2,
						libelle: "Link already exist"
					});
					res.end();
				}
			});
		} else {
			res.send({
				user: user,
				error: 1,
				libelle: "User not found"
			});
			res.end();
		}
	});
};

function delete_playlist(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var id_playlist = req.body.id_playlist;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			var sql = "SELECT * FROM playlist WHERE id_playlist="+id_playlist;
			DB.query(sql , function (err,row){
				if(row.length != 0){
					var sql = "DELETE FROM playlist WHERE id_playlist="+id_playlist;
					DB.query(sql , function (err,row){
						var sql = "DELETE FROM video_playlist WHERE id_playlist="+id_playlist;
						DB.query(sql , function (err,row){
							res.send({
								error: 0,
								libelle: "OK"
							});
							res.end();
						});
					});
				} else {
					res.send({
						user: user,
						error: 2,
						libelle: "Playlist doesn't exist"
					});
					res.end();
				}
			});
		} else {
			res.send({
				user: user,
				error: 1,
				libelle: "User not found"
			});
			res.end();
		}
	});
};

function delete_video(req,res){
	var login = req.body.login;
	var password = req.body.password;
	var id_playlist = req.body.id_playlist;
	var id_video = req.body.id_video;
	var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
	DB.query(sql , function (err,row){
		if(row.length > 0){
			var user = row[0];
			var sql = "SELECT * FROM video_playlist WHERE id_video="+id_video;
			DB.query(sql , function (err,row){
				if(row.length != 0){
					var sql = "DELETE FROM video_playlist WHERE id_video="+id_video;
					DB.query(sql , function (err,row){
						res.send({
							error: 0,
							libelle: "OK"
						});
						res.end();
					});
				} else {
					res.send({
						user: user,
						error: 2,
						libelle: "Video doesn't exist"
					});
					res.end();
				}
			});
		} else {
			res.send({
				user: user,
				error: 1,
				libelle: "User not found"
			});
			res.end();
		}
	});
};

function check_user_no_room(id_user){
	for(var i = 0 ; i < ROOMS.length ; i++){
		if(ROOMS[i] != undefined){
			var room = ROOMS[i];
			if(room.id_admin == id_user){
				return room;
			}
		}	
	}
	return true;
};