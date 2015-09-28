module.exports = {
	check_login: function (login,password){
		var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
		DB.query(sql , function (err,row){
		  if (row.length > 0){
			return true;
		  } else {
			  return false; 
		  }
		});
	},
	get_user: function (login,password){
		var sql = "SELECT * FROM user WHERE login='"+ login +"' AND password='"+ password +"'";
		DB.query(sql , function (err,row){
		  if (row.length > 0){
			return row[0];
		  } else {
			  return false; 
		  }
		});
	},
	get_rooms: function(){
		if(ROOMS.length > 0){
			return { rooms: ROOMS, error: 0 };
		} else {
		  return { rooms: false, error: 0 };
		}
	},
	create_room: function(user,room_name,room_password){
		var room = new Room();
		room.id = ROOMS.length;
		room.name = room_name;
		room.password = room_password;
		user.ip = CFG.hostAdress;
		user.isAdmin = 1;
		room.users.push(user);
		ROOMS.push(room);
		return {
		  room: room,
		  user: user,
		  server: {
			  ip: CFG.hostAdress,
			  port: CFG.httpPort
		  }
		};
	}
}