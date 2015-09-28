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
						var menu_html = $('#menu_dashboard').html();
						menu_html = "<li><a href=\"/room?id_user="+sessionStorage.getItem("id_user")+"&id_room="+data.user_room.id+"\">"+data.user_room.name+"</a></li>"+menu_html;
						console.log(menu_html);
						$('#menu_dashboard').html(menu_html);
						$('#btn_new_room').remove();
					}
					for(var i = 0 ; i < rooms.length ; i++){
						var room = rooms[i];
						var room_description = "";
						var room_img = "";
						var html_password = "";
						var room_password = ""
						if(room.password != undefined){
							var html_password = "<span style=\"float: right; padding-top: 5px;\" class=\"glyphicon glyphicon-lock\" aria-hidden=\"true\"></span>";
							room_password = room.password;
						}
						if(room.queue.length == 0){
							room_description = "Pas de lecture en cours";
						} else {
							room_description = room.queue[0].data_link.title;
							room_img = "<img width=\"300\" height=\"230\" src=\""+room.queue[0].data_link.thumbnails.high.url+"\">";
						}
						var html_nb_users = "<span style=\"float: right; padding-top: 5px; color: white;\" class=\"glyphicon glyphicon-headphones\" aria-hidden=\"true\">&nbsp;"+room.users.length+"</span>";
						var html_info = "<p class=\"titre_room\">"+room.name+"</p>"+room_img+"<p>"+room_description+"</p>";
						var html_join = "<form id=\"form_join_"+room.id+"\" method=\"POST\" action=\"/room\"><input type=\"hidden\" name=\"id_room\" value=\""+room.id+"\"><input type=\"hidden\" name=\"id_user\" value=\""+sessionStorage.getItem("id_user")+"\"><button type=\"button\" onclick=\"check_password('"+room_password+"','"+room.id+"')\" class=\"btn btn-primary\">Join</button></form>";
						var room_html = "<div class=\"col-md-4 room\">"+html_nb_users+"   "+html_password+html_info+html_join+"</div>";
						html_rooms += room_html;
					}
					$('#rooms').html(html_rooms);
				} else {
					$('#rooms').html("No room for the moment.");
				}
			} else {
				
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function join_room(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var id_room = $('#text_id_room').val();
	var room_password = $('#text_password').val();
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=2&id_room="+id_room+"&room_password="+room_password,
		success: function(data){
			if(data.error == 0){
				$('#form_join_'+id_room).submit();
			} else {
				$('#danger_password').show(200);
				setTimeout("$('#danger_password').hide(200);",5000);
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function check_password(password_room,id_room){
	if(password_room != ""){
		$('#text_id_room').val(id_room);
		$("#dialog-password").dialog("open");
	} else {
		$('#form_join_'+id_room).submit();
	}
};

$("#form_new_room").dialog({
	resizable: false,
	autoOpen: false,
	show: {
		effect: "clip",
		duration: 200
	},
	hide: {
		effect: "clip",
		duration: 200
	},
	height: 430,
	width: 700,
	modal: true
});

$("#dialog-password").dialog({
	autoOpen: false,
	height: 350,
	width: 450,
	modal: true,
	show: {
		effect: "clip",
		duration: 200
	},
	hide: {
		effect: "clip",
		duration: 200
	}
});

function show_form_new_room(){
	$('#text_room_name').val("");
	$('#text_room_password').val("");
	//$('#form_new_room').show(200);
	$('#text_room_name').focus();
	$("#form_new_room").dialog("open");
};

function hide_form_new_room(){
	$("#form_new_room").dialog("close");
	//$('#form_new_room').hide(200);
};

function activate_password(){
	if($('#text_room_password').prop('disabled') == true){
		$('#text_room_password').prop('disabled', false);
		$('#text_room_password').value = "";
	} else {
		$('#text_room_password').prop('disabled', true);
	}
};

function check_form_room(){
	if($.isNumeric($('#text_room_max_length_queue').val()) && $('#text_room_name').val() != ""){
		$('#myform_new_room').submit();
	} else {
		alert("Please complete all value");
	}
};