var event_playlist;

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
						var menu_html = $('#menu_myplaylists').html();
						menu_html = "<li><a href=\"/room?id_user="+sessionStorage.getItem("id_user")+"&id_room="+data.user_room.id+"\">"+data.user_room.name+"</a></li>"+menu_html;
						$('#menu_myplaylists').html(menu_html);
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

function get_playlist(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=5",
		success: function(data){
			console.log(data);
			if(data.error == 0){
				var my_playlists = data.my_playlists;
				var tab_playlists = document.getElementById("tab_my_playlists");
				var html_tbody = "";
				for( var i = 0 ; i < my_playlists.length ; i++){
					var playlist = my_playlists[i];
					if(playlist.nb_video == null) playlist.nb_video = 0;
					var html_action = "<a href=\"#\" onclick=\"show_edit_playlist('"+playlist.id_playlist+"','"+playlist.name+"');\"><img title=\"Edit\" src=\"img/editer.png\" width=\"20\" height=\"20\"/></a><a href=\"#\" onclick=\"$('#text_id_playlist').val('"+playlist.id_playlist+"');$('#dialog-confirm').dialog('open');\"><img title=\"Delete\" src=\"img/corbeille.png\" width=\"20\" height=\"20\"/></a>";
					html_tbody += "<tr><td style=\"display:none;\">"+playlist.id_playlist+"</td><td onclick=\"get_data_playlist(event,'"+playlist.id_playlist+"');\">"+playlist.name+"</td><td onclick=\"get_data_playlist(event,'"+playlist.id_playlist+"');\">"+playlist.nb_video+"</td><td>"+html_action+"</td></tr>";
				}
				tab_playlists.children[1].innerHTML = html_tbody;
			} else {
				
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function get_video_playlist(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var ligne = event_playlist.target.parentNode;
	var id_playlist = ligne.children[0].innerHTML;
	var name_playlist = ligne.children[1].innerHTML;
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=8&id_playlist="+id_playlist,
		success: function(data){
			console.log(data);
			if(data.error == 0){
				var video_playlist = data.video_playlist;
				var tab_links = document.getElementById("tab_links");
				var html_tbody = "";
				$('#h3_name_playlist').html(name_playlist);
				for(var i = 0 ; i < video_playlist.length ; i++){
					var video = video_playlist[i];
					var video_id = get_youtube_id_from_link(video.link);
					var html_action = "<a href=\"#\" onclick=\"delete_video('"+video.id_video+"')\"><img title=\"Delete\" src=\"img/corbeille.png\" width=\"20\" height=\"20\"/></a>";
					html_tbody += "<tr><td>"+video.name+"</td><td>"+video.duration+"</td><td>"+video.link+"</td><td>"+html_action+"</td></tr>";
				}
				tab_links.children[1].innerHTML = html_tbody;
				$('#div_links').show(200);
			} else {
				
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function new_playlist(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var playlist_name = $('#text_name_playlist').val();
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=6&playlist_name="+playlist_name,
		success: function(data){
			if(data.error == 0){
				$('#success_playlist').html("Playlist created");
				$('#success_playlist').show(200);
				setTimeout("$('#success_playlist').hide(200);",5000);
				get_playlist();
			} else {
				$('#danger_playlist').html("Fail to create playlist");
				$('#danger_playlist').show();
				setTimeout("$('#danger_playlist').hide();",5000);
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function edit_playlist(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var id_playlist = $('#text_id_playlist').val();
	var rename = $('#text_rename').val();
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=7&id_playlist="+id_playlist+"&rename="+rename,
		success: function(data){
			if(data.error == 0){
				$('#success_playlist').html("Playlist edited");
				$('#success_playlist').show(200);
				setTimeout("$('#success_playlist').hide(200);",5000);
				get_playlist();
			} else {
				$('#danger_playlist').html("Fail to rename playlist");
				$('#danger_playlist').show();
				setTimeout("$('#danger_playlist').hide();",5000);
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function delete_playlist(){
	$('#dialog-confirm').dialog("close");
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var id_playlist = $('#text_id_playlist').val();
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=10&id_playlist="+id_playlist,
		success: function(data){
			if(data.error == 0){
				$('#success_playlist').html("Playlist deleted");
				$('#success_playlist').show(200);
				setTimeout("$('#success_playlist').hide(200);",5000);
				get_playlist();
			} else {
				$('#danger_playlist').html("Fail to delete playlist");
				$('#danger_playlist').show();
				setTimeout("$('#danger_playlist').hide();",5000);
			}
		},
		error: function(data){
			alert("an error was occured");
		}
	});
};

function add_to_playlist(){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var id_playlist = $('#text_id_playlist').val();
	var link = $('#text_link').val();
	var video_id = get_youtube_id_from_link(link);
	$.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+video_id+'&key=AIzaSyC0Hf4nTficY89pI-e_4wtka3-iNA8sXiQ&part=snippet',function(data){
		var video_data = data.items[0].snippet;
		$.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+video_id+'&key=AIzaSyC0Hf4nTficY89pI-e_4wtka3-iNA8sXiQ&part=contentDetails',function(data){
			video_data.duration = convertISO8601ToSeconds(data.items[0].contentDetails.duration);
			$.ajax({
				url: "/web_service",
				method: "POST",
				data: "login="+login+"&password="+password+"&mode=9&id_playlist="+id_playlist+"&link="+link+"&name="+video_data.title+"&duration="+video_data.duration,
				success: function(data){
					if(data.error == 0){
						$('#success_video_playlist').html("Added to playlist");
						$('#success_video_playlist').show(200);
						setTimeout("$('#success_video_playlist').hide(200);",5000);
						document.getElementsByClassName("active_playlist")[0].children[2].innerHTML = parseInt(document.getElementsByClassName("active_playlist")[0].children[2].innerHTML)+1;
						get_video_playlist();
					} else {
						$('#danger_video_playlist').html(data.libelle);
						$('#danger_video_playlist').show();
						setTimeout("$('#danger_video_playlist').hide();",5000);
					}
				},
				error: function(data){
					alert("an error was occured");
				}
			});
		});
	});
};

function get_data_playlist(event,id_playlist){
	hide_edit_playlist();
	var ligne = event.target.parentNode;
	if(ligne.className == "active_playlist"){
		ligne.className = "";
		$('#div_links').hide(200);
	} else {
		event_playlist = event;
		$('.active_playlist').removeClass("active_playlist");
		$('#div_links').hide(200);
		ligne.className = "active_playlist";
		get_video_playlist();
		$('#text_id_playlist').val(id_playlist);
	}
};

function delete_video(id_video){
	var login = sessionStorage.getItem("login");
	var password = sessionStorage.getItem("password");
	var id_playlist = $('#text_id_playlist').val();
	$.ajax({
		url: "/web_service",
		method: "POST",
		data: "login="+login+"&password="+password+"&mode=11&id_playlist="+id_playlist+"&id_video="+id_video,
		success: function(data){
			if(data.error == 0){
				$('#success_video_playlist').html("Removed from playlist");
				$('#success_video_playlist').show(200);
				setTimeout("$('#success_video_playlist').hide(200);",5000);
				document.getElementsByClassName("active_playlist")[0].children[2].innerHTML = parseInt(document.getElementsByClassName("active_playlist")[0].children[2].innerHTML)-1;
				get_video_playlist();
			} else {
				$('#danger_video_playlist').html("Fail to rename playlist");
				$('#danger_video_playlist').show();
				setTimeout("$('#danger_video_playlist').hide();",5000);
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

function show_new_playlist(){
	if($('#text_name_playlist').is(":visible")){
		$('#text_name_playlist').hide(200);
		$('#div_btn_new_playlist').hide(200);
	} else {
		$('#text_name_playlist').val("");
		$('#text_name_playlist').show(200);
		$('#div_btn_new_playlist').show(200);
	}
};

function show_add_to_playlist(){
	if($('#text_link').is(":visible")){
		$('#text_link').hide(200);
		$('#div_btn_add_to_playlist').hide(200);
	} else {
		$('#text_link').val("");
		$('#text_link').show(200);
		$('#div_btn_add_to_playlist').show(200);
	}
};

function show_edit_playlist(id_playlist,name){
	$('#text_id_playlist').val(id_playlist);
	$('#text_rename').val(name);
	$('#form_edit_playlist').show();
	$('#success_edit_playlist').hide();
	$('#danger_edit_playlist').hide();
	$('#text_rename').focus();
};

function hide_edit_playlist(){
	$('#text_id_playlist').val("");
	$('#form_edit_playlist').hide();
};

function get_youtube_id_from_link(url){
	var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	return (url.match(p)) ? RegExp.$1 : false;
};

function convertISO8601ToSeconds(input) {
    var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var hours = 0, minutes = 0, seconds = 0, totalseconds;

    if (reptms.test(input)) {
        var matches = reptms.exec(input);
        if (matches[1]) hours = Number(matches[1]);
        if (matches[2]) minutes = Number(matches[2]);
        if (matches[3]) seconds = Number(matches[3]);
        totalseconds = hours * 3600  + minutes * 60 + seconds;
    }

    return (totalseconds);
};