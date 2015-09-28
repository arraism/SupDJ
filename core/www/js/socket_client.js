socket.on ("multi_connexion" , function (data){
	alert("You already have an open socket.");
	socket.disconnect();
	window.location = "/dashboard";
});


socket.on ("socket_registered" , function (data){
	console.log("socket regitered");
	//Connection ok récupération de la queue
	//get_queue();
});

socket.on ("room_new_user" , function (data){
	ROOM.users.push(data.user);
	$('#room_info_nb_user').html("&nbsp;"+ROOM.users.length);
});

socket.on ("disconnected_user" , function (data){
	for(var i = 0 ; i < ROOM.users.length ; i++){
		var user = ROOM.users[i];
		if(user.id_user == data.id_user){
			ROOM.users.splice(i,1);
		}
	}
	$('#room_info_nb_user').html("&nbsp;"+ROOM.users.length);
});

socket.on ("add_to_queue" , function (data){
	if(data.error == 0){
		if(data.id_user == ME.user){
			$('#danger_add_to_queue').html("Link added to the queue");
			$('#success_add_to_queue').show(200);
			setTimeout("$('#success_add_to_queue').hide(200);",5000);
		}
		ROOM.queue.push({ link: data.link, id_user: data.id_user, data_link: data.data_link });
		if(ROOM.queue.length == 1){
			play();
		}
	} else {
		if(data.id_user == ME.user){
			$('#danger_add_to_queue').html(data.libelle);
			$('#danger_add_to_queue').show(200);
			setTimeout("$('#danger_add_to_queue').hide(200);",5000);
		}
	}
});

socket.on ("add_playlist_to_queue" , function (data){
	if(data.error == 0){
		if(data.id_user == ME.user){
			$('#danger_add_to_queue').html("Playlist added to the queue");
			$('#success_add_to_queue').show(200);
			setTimeout("$('#success_add_to_queue').hide(200);",5000);
		}
	} else {
		if(data.id_user == ME.user){
			$('#danger_add_to_queue').html(data.libelle);
			$('#danger_add_to_queue').show(200);
			setTimeout("$('#danger_add_to_queue').hide(200);",5000);
		}
	}
});

socket.on ("get_current_video" , function (data){
	if(data.error == 0){
		if(data.id_user == ME.user){
			$('#danger_add_to_queue').html("Current video added to your playlist");
			$('#success_add_to_queue').show(200);
			setTimeout("$('#success_add_to_queue').hide(200);",5000);
		}
	} else {
		if(data.id_user == ME.user){
			$('#danger_add_to_queue').html(data.libelle);
			$('#danger_add_to_queue').show(200);
			setTimeout("$('#danger_add_to_queue').hide(200);",5000);
		}
	}
});

socket.on ("chat_message" , function (data){
	var message = insert_emote(data.message);
	message = clear_message(message);
	var message_html = "<span class=\"chat_username\">"+data.login+"</span> : <span class=\"chat_message\">"+message+"</span><br>";
	$('#chat_messages').append(message_html);
	$("#chat_messages").animate({ scrollTop: $(document).height() }, 100);
});

socket.on ("get_queue" , function (data){
	ROOM.queue = data.queue;
});

socket.on ("next_video" , function (data){
	ROOM.queue.shift();
	if(ROOM.queue.length > 0){
		play();
	}
	//Check next waiting playlist
	if(WAITING_PLAYLIST != undefined && check_user_queue() == false){
		WAITING_PLAYLIST.videos.shift();
		play_waiting_playlist();
	}
});

socket.on ("skip_video" , function (data){
	ROOM.queue.shift();
	if(ROOM.queue.length > 0){
		play();
	} else {
		youtube_player.stopVideo();
	}
	var message_html = "<span class=\"admin_message\">"+data.message+"</span><br>";
	$('#chat_messages').append(message_html);
});

socket.on ("close_room" , function (data){
	//socket.end();
	$( "#dialog-message" ).dialog({
		autoOpen: false,
		modal: true,
		width: 500,
		height: 300
	});
});

socket.on ("get_my_playlist" , function (data){
	console.log(data);
	MY_PLAYLISTS = data.playlists;
	$("#liste_playlist").html("");
	for (id_playlist in MY_PLAYLISTS) {
		playlist = MY_PLAYLISTS[id_playlist];
		if(playlist != undefined){
			$("#liste_playlist").html($("#liste_playlist").html()+"<li><a onclick=\"select_playlist(event)\">"+playlist.name+"</a></li>");
			$("#liste_playlist_1").html($("#liste_playlist_1").html()+"<li><a onclick=\"select_playlist_1(event)\">"+playlist.name+"</a></li>");
		}
	}
});























// Move a player
socket.on("game-move",function (data){game.movePlayer(data)});
// On player joining the game
socket.on("game-newPlayer",function (data) {
	game.createPlayer(data); console.log("new player")
});
// get users playing
socket.on("game-disconnectPlayer",function (data) {
	game.deletePlayer(data.id);
});
// get users playing
socket.on("game-connectedPlayers" , function (data) {
	for (var i in data) game.createPlayer(data[i]);
});



socket.on("error" , function(data){ 
	$("#ui-alert").addClass("alert-error").html(data).fadeIn().fadeOut(4000).removeClass("alert-error");
});

socket.on("success" , function(data){ 
	$("#ui-alert").addClass("alert-success").html(data).fadeIn().fadeOut(4000).removeClass("alert-success");
});





socket.on('game-getInventory', function (data) {
	for (var i in data) {
		if(data[i].type == "weapon"){
			game.inventory.push({type: "weapon", id_item: data[i].id_item, quantity: data[i].quantity});
		} else if(data[i].type == "crop"){
			game.inventory.push({type: "crop", id_item: data[i].id_item, quantity: data[i].quantity});
		}
	}
});



socket.on('game-getShop-weapon', function (data) {
		weapons = data;
		var html = "<table id='table' class=\"table\"><tr><th>Weapon</th><th>Power</th><th>Hit ratio</th><th>Hit per second</th><th>Price</th></tr>" ;
		for (var i in weapons) {
			html += "<tr class=\"weapon\" id="+weapons[i].id+" onClick=\"selectWeaponBuy('"+weapons[i].id+"')\"><td>"+weapons[i].name+"</td><td>"+weapons[i].power+"</td><td>"+weapons[i].hitratio+"</td><td>"+weapons[i].hps+"</td><td>"+weapons[i].price+"</td></tr>";
		}
		html += "</table>";
		html += "<label id='label-money'>Money : "+userInfo.money+"</label>";
		html += "<button id=\"button-buy-weapon\" onClick=\"buyWeapon()\">Buy</button>";

		$("#buy-weapon").html(html);
		$("#button-buy-weapon").attr('disabled', true);

		var html2 = "<table id='table' class=\"table\"><tr><th>Weapon</th><th>Power</th><th>Hit ratio</th><th>Hit per second</th><th>Quantity</th><th>Price</th></tr>" ;
		for (var i in game.inventory) {
			if(game.inventory[i].type == "weapon"){
				id = game.inventory[i].id_item;
				weapon = game.weapons[id];
				html2 += "<tr class=\"weapon\" id="+weapon.id+" onClick=\"selectWeaponSell('"+weapon.id+"')\"><td>"+weapon.name+"</td><td>"+weapon.power+"</td><td>"+weapon.hitratio+"</td><td>"+weapon.hps+"</td><td>"+game.inventory[i].quantity+"</td><td>"+game.weapons[game.inventory[i].id_item].price+"</td></tr>";
			}
		}
		html2 += "</table>";
		html2 += "<label id='label-money'>Money : "+userInfo.money+"</label>";
		html2 += "<button id=\"button-sell-weapon\" onClick=\"sellWeapon()\">Sell</button>";

		$("#sell-weapon").html(html2);
		$("#button-sell-weapon").attr('disabled', true);
});

socket.on('game-getShop-crop', function (data) {
		crops = data;
		var html = "<table id='table' class=\"table\"><tr><th>Crop</th><th>Price</th></tr>" ;
		for (var i in crops) {
			html += "<tr class=\"crop\" id="+crops[i].id+" onClick=\"selectCropBuy('"+crops[i].id+"')\"><td>"+crops[i].name+"</td><td>"+crops[i].buy_price+"</td></tr>";
		}
		html += "</table>";
		html += "<label id='label-money'>Money : "+userInfo.money+"</label>";
		html += "<button id=\"button-buy-crop\" onClick=\"buyCrop()\">Buy</button>";

		$("#buy-crop").html(html);
		$("#button-buy-crop").attr('disabled', true);

		var html2 = "<table id='table' class=\"table\"><tr><th>Crop</th><th>Quantity</th><th>Price</th></tr>" ;
		for (var i in game.inventory) {
			if(game.inventory[i].type == "crop"){
				id = game.inventory[i].id_item;
				crop = game.crops[id];
				html2 += "<tr class=\"crop\" id="+crop.id+" onClick=\"selectCropSell('"+crop.id+"')\"><td>"+crop.name+"</td><td>"+game.inventory[i].quantity+"</td><td>"+crop.price+"</td></tr>";
			}
		}
		html2 += "</table>";
		html2 += "<label id='label-money'>Money : "+userInfo.money+"</label>";
		html2 += "<button id=\"button-sell-crop\" onClick=\"sellCrop()\">Sell</button>";

		$("#sell-crop").html(html2);
		$("#button-sell-crop").attr('disabled', true);
});



socket.on("game-getWeapon", function (data) {
	var weapon_id = data.weapon_id;
	userInfo.money = data.user_money;
	if(data.newweapon == 1){
		game.inventory.push({type: "weapon", id_item: weapon_id, quantity: 1});
	} else {
		for(var i in game.inventory){
			if(game.inventory[i].id_item == weapon_id){
				game.inventory[i].quantity++;
			}
		}
	}
	if(userInfo.money - game.weapons[selecteditem].price >= 0){
		$("#button-buy-weapon").attr('disabled', false);
		$("#button-buy-weapon").attr('enable', true);
	} else {
		$("#button-buy-weapon").attr('enable', false);
		$("#button-buy-weapon").attr('disabled', true);
	}
	socket.emit("game-getShop");
	setTimeout("$(\"#buy-weapon\").show()",10);
});



socket.on("game-sellWeapon", function (data) {
	var weapon_id = data.weapon_id;
	userInfo.money = data.user_money;
	if(data.delweapon == 1){
		for(var i in game.inventory){
			if(game.inventory[i].id_item == weapon_id && game.inventory[i].type == 'weapon'){
				game.unset(game.inventory[i]);
			}
		}
	} else {
		for(var i in game.inventory){
			if(game.inventory[i].id_item == weapon_id && game.inventory[i].type == 'weapon'){
				game.inventory[i].quantity--;
			}
		}
	}
	if(userInfo.money - game.weapons[selecteditem].price >= 0){
		$("#button-sell-weapon").attr('disabled', false);
		$("#button-sell-weapon").attr('enable', true);
	} else {
		$("#button-sell-weapon").attr('enable', false);
		$("#button-sell-weapon").attr('disabled', true);
	}
	socket.emit("game-getShop");
});

socket.on("game-getCrop", function (data) {
	var crop_id = data.crop_id;
	userInfo.money = data.user_money;
	if(data.newcrop == 1){
		game.inventory.push({type: "crop", id_item: crop_id, quantity: 1});
	} else {
		for(var i in game.inventory){
			if(game.inventory[i].id_item == crop_id){
				game.inventory[i].quantity++;
			}
		}
	}
	if(userInfo.money - game.crops[selecteditem].price >= 0){
		$("#button-buy-crop").attr('disabled', false);
		$("#button-buy-crop").attr('enable', true);
	} else {
		$("#button-buy-crop").attr('enable', false);
		$("#button-buy-crop").attr('disabled', true);
	}
	socket.emit("game-getShop");
});




socket.on("game-sellCrop", function (data) {
	var crop_id = data.crop_id;
	userInfo.money = data.user_money;
	if(data.delcrop == 1){
		for(var i in game.inventory){
			if(game.inventory[i].id_item == crop_id && game.inventory[i].type == 'crop'){
				game.unset(game.inventory[i]);
			}
		}
	} else {
		for(var i in game.inventory){
			if(game.inventory[i].id_item == crop_id && game.inventory[i].type == 'crop'){
				game.inventory[i].quantity--;
			}
		}
	}
	if(userInfo.money - game.crops[selecteditem].price >= 0){
		$("#button-sell-crop").attr('disabled', false);
		$("#button-sell-crop").attr('enable', true);
	} else {
		$("#button-sell-crop").attr('enable', false);
		$("#button-sell-crop").attr('disabled', true);
	}
	socket.emit("game-getShop");
	
});


socket.on("game-getWeaponInfo", function (data) {
	weapons = data;
	for (var i in weapons) {
		id = "weapon-" + weapons[i].id;
		name = weapons[i].name;
		power = weapons[i].power;
		hitratio = weapons[i].hitratio;
		hps = weapons[i].hps;
		price = weapons[i].price;
		game.weapons[weapons[i].id] = {id: id, name: name, power: power, hitratio: hitratio, hps: hps, price: price};
	}
});

socket.on("game-getCropInfo", function (data) {
	crops = data;
	for (var i in crops) {
		id = "crop-" + crops[i].id;
		name = crops[i].name;
		price = crops[i].buy_price;
		game.crops[crops[i].id] = {id: id, name: name, price: price};
	}
});








socket.on('alliance-list', function (data) {
		ally = data;
		var html = "<table class=\"table\"><tr><th>Nom de l'alliance</th><th>Leader</th></tr>" ;
		for (var i in ally) {
			name = ally[i].allianceName;
			owner = ally[i].userName;
			id = ally[i].id
			if(userInfo.alliance != 0){
				html += "<tr><td>"+name+"</td><td>"+owner+"</td></tr>";
			} else {
				html += "<tr><td>"+name+"</td><td>"+owner+"</td><td><button class=\"btn\" onClick=\"joinAlliance('"+name+"-"+id+"')\">Join</button></td></tr>";
			}
		}
		html += "</table>";
		$("#alliance-list").html(html);
});

socket.on('alliance-getMembers', function (data) {
		ally = data;
		var html = "<table class=\"table\"><tr><th>Nom</th></tr>" ;
		for (var i in ally) {
			name = ally[i].login;
			html += "<tr><td>"+name+"</td></tr>";
		}
		html += "</table>";
		$("#alliance-members").html(html);
});


socket.on('alliance-join-waiting', function (data) {
		mydata = {alliancename: data.alliancename, id_alliance: data.id_alliance};
		allianceWaiting = true;
		var html = "<h2>Waiting for answer</h2>";
		html += "<p>You have sent a request to join "+data.alliancename+"</p>";
		html += "<button onClick=\"cancelAlliance('"+data.alliancename+"-"+data.id_alliance+"')\">Cancel</button>";
		$("#alliance-list").html(html);
});


socket.on('alliance-request', function (data) {
		ally = data;
		var html = "<table class=\"table\"><tr><th>Nom</th><td /></tr>" ;
		for (var i in ally) {
			name = ally[i].login;
			id = ally[i].id
			html += "<tr><td>"+name+"</td><td><button onClick=\"acceptAlliance('"+id+"')\">Accept</button></td><td><button onClick=\"refuseAlliance('"+id+"')\">Refuse</button></td></tr>";
		}
		html += "</table>";

		$("#alliance-request").html(html);
});

socket.on("alliance-quit", function (data) {
	userInfo.alliance = 0;
});


socket.on("alliance-setAlliance" , function(data) {
	userInfo.alliance = data;
});



socket.on("game-newTiles", function (data) {
 for (var i in data) {
	var tile = data[i];
	x = tile.x;
	y = tile.y;
	if (typeof game.tiles[x] == "undefined"){
	 game.tiles[x] = new Array();
	}
	game.tiles[x][y] = tile;
 }
});

















socket.on("error" , function(data){ 
	$("#ui-alert").addClass("alert-error").html(data).fadeIn().fadeOut(4000).removeClass("alert-error");
});

socket.on("success" , function(data){ 
	$("#ui-alert").addClass("alert-success").html(data).fadeIn().fadeOut(4000).removeClass("alert-success");
});






socket.on('game-useCrop', function (data) {
	console.log(data);
	if(data.delcrop == 1){
		for(var i in game.inventory){
			if(game.inventory[i].id_item == data.id_crop && game.inventory[i].type == 'crop'){
				game.unset(game.inventory[i]);
			}
		}
	} else {
		for(var i in game.inventory){
			if(game.inventory[i].id_item == data.id_crop && game.inventory[i].type == 'crop'){
				game.inventory[i].quantity--;
			}
		}
	}
	$("#inventory-crop").innerHTML = "";
	var html = "<table  class=\"table\"><tr><th>Crop</th><th>Quantity</th></tr>" ;
	for (var i in game.inventory) {
		if(game.inventory[i].type == "crop"){
			id = game.inventory[i].id_item;
				crop = game.crops[id];
				html += "<tr class=\"crop\" id="+id+"><td>"+crop.name+"</td><td>"+game.inventory[i].quantity+"</td><td><button onClick=\"useCrop('"+id+"')\">Use</button></td></tr>";
		}
	}
	html += "</table>";
	html += "<label id='label-money'>Money : "+userInfo.money+"</label>";

	$("#inventory-crop").html(html);
});

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
socket.on('game-growTile', function (data) {
	game.setTile(data);
});











socket.on("chat-newMessage" , function (data){
		$("#chat-messages").append('<div class="chat-message">'+data.user+' : '+data.message+'</div>');
});