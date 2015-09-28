var admin_password = "";

function check_password_admin(password){
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "password="+password+"&mode=1",
		success: function(data){
			if(data.error == 0){
				admin_password = data.password;
			} else {
				window.location = "/index";
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function get_liste_user(){
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "password="+password+"&mode=4",
		success: function(data){
			console.log(data);
			if(data.error == 0){
				var tab_user = document.getElementById('tab_user');
				tab_user.children[1].innerHTML = "";
				var users = data.users;
				for (var i = 0 ; i < users.length ; i++){
					var user = users[i];
					var id = user.id_user;
					var login = user.login;
					var password = user.password;
					var nb_playlist = user.nb_playlist;
					var action_icone = "<a href=\"#\" onclick=\"show_edit_user('"+id+"','"+login+"','"+password+"');\"><img title=\"Editer\" src=\"img/editer.png\" width=\"20\" height=\"20\"/></a><a href=\"#\" onclick=\"delete_user(\'"+id+"\')\"><img title=\"Supprimer\" src=\"img/corbeille.png\" width=\"20\" height=\"20\"/></a>";
					tab_user.children[1].innerHTML += "<tr><td>"+id+"</td><td>"+login+"</td><td>"+password+"</td><td>"+nb_playlist+"</td><td>"+action_icone+"</td></tr>";
				}
			} else {
				
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

$("#dialog_new_user").dialog({
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
	buttons: {
		"Create": function(event) {
			var login = $("#text_new_login").val();
			var password = $("#text_new_password").val();
			var mail = $("#text_new_email").val();
			if (login != "" && password != ""){
				$.ajax({
					url: "/login",
					method: "POST",
					data: "login="+login+"&password="+password+"&mail="+mail+"&mode=12",
					success: function(data){
						if(data.error == 0){
							$('#success_new_user').html("Account created");
							$('#success_new_user').show(200);
							setTimeout("$('#success_new_user').hide(200);",5000);
						} else if(data.error == 1){
							$('#alert_new_user').html(data.libelle);
							$('#alert_new_user').show(200);
							setTimeout("$('#alert_new_user').hide(200);",5000);
						}
					},
					error: function(data){
						alert("an error was occured");
					}
				});
			} else {
				$('#alert_login').html("Please enter login and password");
				$('#alert_login').show(200);
				setTimeout("$('#alert_login').hide(200);",5000);
			}
		},
		"Cancel": function() {
			$('#dialog_new_user').dialog('close');
		}
	},
	height: 370,
	width: 400,
	modal: true
});


function show_new_user(){
	document.getElementById("text_login_new").value = "";
	document.getElementById("text_password_new").value = "";
	$('#form_new_user').show(200);
	$('#success_new_user').hide();
    $('#danger_new_user').hide();
	document.getElementById("text_login_new").focus();
};

function hide_new_user(){
	$('#form_new_user').hide(200);
};

function show_edit_user(id_user,login,password){
	document.getElementById("text_id_user").value = id_user;
	document.getElementById("text_login").value = login;
	document.getElementById("text_password").value = password;
	$('#form_edit_user').show(200);
	$('#success_edit_user').hide();
    $('#danger_edit_user').hide();
	document.getElementById("text_login").focus();
};

function hide_edit_user(){
	document.getElementById("text_id_user").value = "";
	$('#form_edit_user').hide(200);
};