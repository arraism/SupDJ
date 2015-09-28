exports.socketHandler = function (socket){

	socket.on("connexion" , function (data){
		if(SOCKETS.length > 0){
			for(my_socket in SOCKETS){
				if(my_socket.id_user == socket.id_user){
					socket.emit("multi_connexion",{
						error: 1                   
					});
				}
			}
		}
		console.log("Connection ok");
	});

	socket.on("disconnect", function (data) {
		delete_user(socket.id);
		console.log("disconnected");
	});

	socket.on("register_socket",function (data) {
		var id_room = data.id_room;
		var user = new User();
		var clean_user = new User();
		user.id_user = data.user.id_user;
		user.login = data.user.login;
		user.password = data.user.password;
		user.is_admin = data.user.is_admin;
		user.id_socket = socket.id;
		SOCKETS[socket.id] = socket;
		ROOMS[id_room].users.push(user);
		for (var i = 0 ; i < ROOMS[id_room].users.length ; i++){
			var my_user = ROOMS[id_room].users[i];
			var user_socket = SOCKETS[my_user.id_socket];
			user_socket.emit("room_new_user",{
				user: user
			});
		}
		socket.emit("socket_registered");
	});

	socket.on("get_my_playlist", function (data) {
		console.log("get_my_playlist");
		var id_user = data.user.id_user;
		var sql = "SELECT * FROM user WHERE id_user="+id_user;
		DB.query(sql , function (err,row){
			if(row.length > 0){
				var user = row[0];
				var sql = "SELECT * FROM playlist WHERE id_user="+id_user;
				DB.query(sql , function (err,row){
					if(row.length > 0){
						var playlists = Array();
						for(var i = 0 ; i < row.length ; i++){
							var playlist = row[i];
							if(playlists[playlist.id_playlist] == undefined){
								playlists[playlist.id_playlist] = {};
								playlists[playlist.id_playlist].name = playlist.name;
								playlists[playlist.id_playlist].id_playlist = playlist.id_playlist;
								playlists[playlist.id_playlist].videos = Array();
							}
						}
						var sql = "SELECT playlist.id_playlist, playlist.id_user, playlist.name AS name_playlist, video_playlist.id_video, video_playlist.name AS name_video, video_playlist.link, video_playlist.duration FROM playlist INNER JOIN video_playlist ON playlist.id_playlist=video_playlist.id_playlist WHERE playlist.id_user="+id_user+" ORDER BY playlist.id_playlist,video_playlist.id_video";
						DB.query(sql , function (err,row){
							if(row.length > 0){
								for(var i = 0 ; i < row.length ; i++){
									video = row[i];
									playlists[video.id_playlist].videos.push(video);
								}
								socket.emit("get_my_playlist",{error: 0, playlists: playlists});
							} else {
								socket.emit("get_my_playlist",{error: 1, libelle: "No playlist"});
							}
						});	
					} else {
						socket.emit("get_my_playlist",{error: 1, libelle: "No playlist"});
					}					
				});
			} else {
				socket.emit("get_my_playlist",{error: 1, libelle: "User not found"});
			}
		});	
	});

	socket.on("add_playlist_to_queue", function (data) {
		console.log("add_playlist_to_queue");
		var id_user = data.id_user;
		var id_room = data.id_room;
		var playlist = data.playlist;
		if(ROOMS[id_room].queue.length < ROOMS[id_room].max_length_queue){
			if(check_user_queue(id_user,id_room)){
				var sql = "SELECT * FROM playlist INNER JOIN video_playlist ON playlist.id_playlist=video_playlist.id_playlist WHERE id_user="+id_user+" AND name='"+playlist+"'";
				DB.query(sql , function (err,row){
					var myplaylist = row[0];
					ROOMS[id_room].queue.push({link: link, id_user: id_user, data_link: data_link});
					for(var i = 0 ; i < ROOMS[id_room].users.length ; i++){
						var user = ROOMS[id_room].users[i];
						var user_socket = SOCKETS[user.id_socket];
						user_socket.emit("add_playlist_to_queue",{
							error: 0,
							id_user: id_user
						});
						if(ROOMS[id_room].queue.length == 1){
							TIMERS[id_room] = setTimeout(function(){next_video(id_room);},data_link.duration*1000);
						}
					}
				});
			} else {
				socket.emit("add_playlist_to_queue",{
					error: 3,
					libelle: "You already have a video to the queue."
				});	
			}
		} else {
			socket.emit("add_playlist_to_queue",{
				error: 2,
				libelle: "Maximum queue length."
			});
		}
	});

	socket.on("add_to_queue", function (data) {
		console.log("add_to_queue");
		var id_user = data.id_user;
		var id_room = data.id_room;
		var link = data.link;
		var data_link = data.data_link;
		if(ROOMS[id_room].queue.length < ROOMS[id_room].max_length_queue){
			if(check_user_queue(id_user,id_room)){
				data_link.description = data_link.description.replace("'"," ");
				data_link.description = data_link.description.replace("\""," ");
				ROOMS[id_room].queue.push({link: link, id_user: id_user, data_link: data_link});
				for(var i = 0 ; i < ROOMS[id_room].users.length ; i++){
					var user = ROOMS[id_room].users[i];
					var user_socket = SOCKETS[user.id_socket];
					user_socket.emit("add_to_queue",{
						error: 0,
						link: link,
						id_user: id_user,
						data_link: data_link
					});
					if(ROOMS[id_room].queue.length == 1){
						TIMERS[id_room] = setTimeout(function(){next_video(id_room);},data_link.duration*1000);
					}
				}
			} else {
				socket.emit("add_to_queue",{
					error: 3,
					libelle: "You already have a video to the queue."
				});				
			}
		} else {
			socket.emit("add_to_queue",{
				error: 2,
				libelle: "Maximum queue length."
			});
		}
	});

	socket.on("get_current_video", function (data) {
		console.log("get_current_video");
		var id_user = data.id_user;
		var id_playlist = data.id_playlist;
		var link = data.link;
		var data_link = data.data_link;
		var sql = "SELECT * FROM playlist INNER JOIN video_playlist ON playlist.id_playlist=video_playlist.id_playlist WHERE id_user="+id_user+" AND playlist.id_playlist="+id_playlist+" AND video_playlist.link='"+link+"'";
		DB.query(sql , function (err,row){
			if(row.length == 0){
				var name = data_link.title;
				var duration = data_link.duration;
				var sql = "INSERT INTO video_playlist VALUES (0,"+id_playlist+",'"+link+"','"+name+"',"+duration+")";
				DB.query(sql , function (err,row){
					socket.emit("get_current_video",{
						error: 0,
						libelle: "OK"
					});
				});
			} else {
				socket.emit("get_current_video",{
					error: 1,
					libelle: "You already have this video on your playlist."
				});
			}
		});
	});

	socket.on("get_queue" , function (data) {
		socket.emit("get_queue",{
			queue: ROOMS[data.id_room].queue
		});
	});

	socket.on("chat_message" , function (data) {
		var room = ROOMS[data.id_room];
		var login = data.user.login;
		for(var i = 0 ; i < room.users.length ; i++){
			var user = room.users[i];
			var user_socket = SOCKETS[user.id_socket];
			user_socket.emit("chat_message",{
				message: data.message,
				login: login
			});
		}
	});

	socket.on("next_video" , function (data) {
		var room = ROOMS[data.id_room];
		room.queue.shift();
		for(var i = 0 ; i < room.users.length ; i++){
			var user = room.users[i];
			var user_socket = SOCKETS[user.id_socket];
			user_socket.emit("next_video",{
				error: 0
			});
		}
	});

	socket.on("skip_video" , function (data) {
		var room = ROOMS[data.id_room];
		room.queue.shift();
		for(var i = 0 ; i < room.users.length ; i++){
			var user = room.users[i];
			var user_socket = SOCKETS[user.id_socket];
			user_socket.emit("skip_video",{
				error: 0,
				message: "Too much cancer on this video, admin skip it."
			});
		}
	});

	socket.on("close_room" , function (data) {
		var room = ROOMS[data.id_room];
		for(var i = 0 ; i < room.users.length ; i++){
			var user = room.users[i];
			var user_socket = SOCKETS[user.id_socket];
			user_socket.emit("close_room",{
				error: 0,
				message: "Too much cancer on this room, admin close it. Everyone get out of here !"
			});
		}
		ROOMS.splice(data.id_room, 1);
		console.log(ROOMS.length);
	});

};

function next_video(id_room){
	console.log("NEXT :"+id_room);
	var room = ROOMS[id_room];
	room.queue.shift();
	if(room.queue.length > 0){
		for(var i = 0 ; i < room.users.length ; i++){
			var user = ROOMS[id_room].users[i];
			var user_socket = SOCKETS[user.id_socket];
			user_socket.emit("next_video",{
				link: room.queue[0].link,
				data_link: room.queue[0].data_link
			});
		}
		var link = room.queue[0].link;
		TIMERS[id_room] = setTimeout(function(){next_video(id_room);},room.queue[0].data_link.duration*1000);
	} else {
		for(var i = 0 ; i < room.users.length ; i++){
			var user = ROOMS[id_room].users[i];
			var user_socket = SOCKETS[user.id_socket];
			user_socket.emit("next_video",{
				link: undefined,
				data_link: undefined
			});
		}
		TIMERS[id_room] = undefined;
	}
};

function delete_user(socket_id){
	for(var i = 0 ; i < ROOMS.length ; i++){
		if(ROOMS[i] != undefined){
			var room = ROOMS[i];
			for(var j = 0 ; j < room.users.length ; j++){
				var user = room.users[j];
				if(user.id_socket == socket_id){
					//Envoie du meesage de déconnection d'un utilisateur
					for(var k = 0 ; k < room.users.length ; k++){
						var user_socket = SOCKETS[room.users[k].id_socket];
						user_socket.emit("disconnected_user",{
							id_user: user.id_user
						});
					}
					room.users.splice(j,1);
				}
			}
		}
	}
	SOCKETS.splice(socket_id,1);
};

function check_user_queue(id_user,id_room){
	var room = ROOMS[id_room];
	for(var i = 0 ; i < room.queue.length ; i++){
		if(room.queue[i].id_user == id_user){
			return false;
		}
	}
	return true;
};