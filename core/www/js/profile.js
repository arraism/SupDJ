function get_rooms(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=3",
		success: function(data){
			console.log(data);
			if(data.error == 0){
				var rooms = data.rooms;
				if(rooms != false){
					var html_rooms = "";
					//Ajout dans le menu de la room de l'utilisateur si elle existe
					data.user_room = JSON.parse(data.user_room);
					if(data.user_room != true){
						var menu_html = $('#menu_profile').html();
						menu_html = "<li><a href=\"/room?id_user="+sessionStorage.getItem("id_user")+"&id_room="+data.user_room.id+"\">"+data.user_room.name+"</a></li>"+menu_html;
						$('#menu_profile').html(menu_html);
						$('#btn_new_room').remove();
					}
				} else {
				}
			} else {
				
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function save_changes(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var new_login = $('#text_user_login').val();
	var new_password = $('#text_user_password').val();
	var new_email = $('#text_user_email').val();
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&new_login="+new_login+"&new_password="+new_password+"&new_email="+new_email+"&mode=13",
		success: function(data){
			console.log(data);
			if(data.error == 0){
				sessionStorage.setItem("login",data.user.login);
				sessionStorage.setItem("password",data.user.password);
				$('#success_settings').html("Saved");
				$('#success_settings').show(200);
				setTimeout("$('#success_settings').hide(200);",5000);
			} else {
				$('#danger_settings').html("Failed to save new settings.");
				$('#danger_settings').show(200);
				setTimeout("$('#danger_settings').hide(200);",5000);
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function get_user_settings(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=14",
		success: function(data){
			console.log(data);
			if(data.error == 0){
				var login = data.user.login;
				var password = data.user.password;
				var email = data.user.email;
				$('#text_user_login').val(login);
				$('#text_user_password').val(password);
				$('#text_user_email').val(email);
			} else {
				$('#danger_settings').html("Failed to save settings");
				$('#danger_settings').show(200);
				setTimeout("$('#danger_settings').hide(200);",5000);
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

$("#dialog-confirm").dialog({
	resizable: false,
	autoOpen: false,
	height:200,
	modal: true
});