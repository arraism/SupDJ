function connexion(){
	var login = $("#text_connexion_login").val();
	var password = $("#text_connexion_password").val();
	if (login != "" && password != ""){
		$.ajax({
			url: "/login",
			method: "POST",
			data: "login="+login+"&password="+password,
			success: function(data){
				if(data.error == 1){
					$('#alert_login').html("Login or password invalid");
					$('#alert_login').show(200);
					setTimeout("$('#alert_login').hide(200);",5000);
				} else {
					sessionStorage.setItem("login",login);
					sessionStorage.setItem("password",password);
					sessionStorage.setItem("id_user",data.user.id_user);
					window.location = data.redirect;
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
};

function register(){
	var login=  $("#registerLogin").val();
	var password= $("#registerPassword").val();
	var mail= $("#registerEmail").val();
	if (login != "" && password != "" && mail != ""){
		$.ajax({
			url: "/register",
			method: "POST",
			data: "login="+login+"&password="+password+"&mail="+mail,
			success: function(data){
				if(data.error == 0){
					$('#success_register').html("Account created");
					$('#success_register').show(200);
					setTimeout("$('#success_register').hide(200);",5000);
				} else if(data.error == 1){
					$('#alert_register').html(data.libelle);
					$('#alert_register').show(200);
					setTimeout("$('#alert_register').hide(200);",5000);
				}
			},
			error: function(data){
				alert("an error was occured");
			}
		});
	} else {
		$('#alert_register').html("Please complete the form");
		$('#alert_register').show(200);
		setTimeout("$('#alert_register').hide(200);",5000);
	}
};

$("#dialog_login").dialog({
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
	height: 330,
	width: 400,
	modal: true
});

$("#dialog_register").dialog({
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
	height: 360,
	width: 400,
	modal: true
});