var ROOM = new Room();
var ME = new User();
var MY_PLAYLISTS;
var WAITING_PLAYLIST;
var TIMER = 0;

function register_socket(){
	socket.emit("register_socket" , {
		user: {id_user: ME.id_user, login: ME.login, password: ME.password, is_admin: ME.is_admin},
		id_room: ROOM.id
	});
};

function get_queue(){
	socket.emit("get_queue" , {
		user: {id_user: ME.id_user, login: ME.login, password: ME.password, is_admin: ME.is_admin},
		id_room: ROOM.id
	});
};

function change_volume(){
	var volume = $('#slider_volume').val();
	$('#slider_volume').title = volume;
	youtube_player.setVolume(volume);
};

function play(){
	if(ROOM.queue.length > 0){
		$('#youtube_player').show();
		youtube_player.cueVideoById(get_youtube_id_from_link(ROOM.queue[0].link),TIMER,"");
		youtube_player.playVideo();
		TIMER = 0;
		//$('#frame_video').prop("src",ROOM.queue[0]+"&autoplay=1");
	}
};

function get_my_playlist(){
	socket.emit("get_my_playlist" , {
		user: {id_user: ME.id_user, login: ME.login, password: ME.password, is_admin: ME.is_admin}
	});	
};

function select_playlist(event){
	var ligne = event.target;
	var playlist = ligne.innerHTML;
	document.getElementById('btn_playlist').innerHTML = playlist+" <span class=\"caret\"></span>";
};

function select_playlist_1(event){
	var ligne = event.target;
	var playlist = ligne.innerHTML;
	document.getElementById('btn_get_current_video').innerHTML = playlist+" <span class=\"caret\"></span>";
};

function add_playlist_to_queue(){
	var playlist_name = $('#btn_playlist').html(); 
	playlist_name = playlist_name.split("<span");
	playlist_name = playlist_name[0].trim();
	//Get playlist from name
	for(var i = 0 ; i < MY_PLAYLISTS.length ; i++){
		var playlist = MY_PLAYLISTS[i];
		if(playlist != undefined){
			if(playlist.name == playlist_name){
				WAITING_PLAYLIST = playlist;
				play_waiting_playlist();
			}
		}
	}
};

function play_waiting_playlist(){
	if(WAITING_PLAYLIST != undefined && check_user_queue() == false){
		var video_id = get_youtube_id_from_link(WAITING_PLAYLIST.videos[0].link);
		$.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+video_id+'&key=AIzaSyC0Hf4nTficY89pI-e_4wtka3-iNA8sXiQ&part=snippet',function(data){
			var video_data = data.items[0].snippet;
			$.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+video_id+'&key=AIzaSyC0Hf4nTficY89pI-e_4wtka3-iNA8sXiQ&part=contentDetails',function(data){
				video_data.duration = convertISO8601ToSeconds(data.items[0].contentDetails.duration);
				socket.emit("add_to_queue" , {
					id_user: ME.id_user,
					id_room: ROOM.id,
					link: WAITING_PLAYLIST.videos[0].link,
					data_link: video_data
				});
			});
		});
	}
};

function add_to_queue(){
	//http://www.youtube.com/oembed?url={videoUrlHere}&format=json
	/*
		$.getJSON('https://www.googleapis.com/youtube/v3/videos?id={videoId}&key={myApiKey}&part=snippet&callback=?',function(data){

		 if (typeof(data.items[0]) != "undefined") {
		     console.log('video exists ' + data.items[0].snippet.title);
		   } else {
		     console.log('video not exists');
		 }
		});
	*/
	if(ROOM.queue.length == ROOM.max_length_queue){
		$('#text_link').popover({
			title: "NOPE",
			trigger: "manual",
			content: "Queue is full",
			placement: 'bottom'
		});
		$('#text_link').popover('toggle');
		setTimeout("$('#text_link').popover('hide');",5000);
	} else if(check_user_queue() == true){
		$('#text_link').popover({
			title: "NOPE",
			trigger: "manual",
			content: "You already have a video in the queue",
			placement: 'bottom'
		});
		$('#text_link').popover('toggle');
		setTimeout("$('#text_link').popover('hide');",5000);
	} else {
		var link = $('#text_link').val();
		var video_id = get_youtube_id_from_link(link);
		var ok = urlExists("https://www.googleapis.com/youtube/v3/videos?id="+video_id+"&key=AIzaSyC0Hf4nTficY89pI-e_4wtka3-iNA8sXiQ&part=snippet");
		if(video_id != false && ok){
			$.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+video_id+'&key=AIzaSyC0Hf4nTficY89pI-e_4wtka3-iNA8sXiQ&part=snippet',function(data){
				var video_data = data.items[0].snippet;
				$.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+video_id+'&key=AIzaSyC0Hf4nTficY89pI-e_4wtka3-iNA8sXiQ&part=contentDetails',function(data){
					video_data.duration = convertISO8601ToSeconds(data.items[0].contentDetails.duration);
					socket.emit("add_to_queue" , {
						id_user: ME.id_user,
						id_room: ROOM.id,
						link: link,
						data_link: video_data
					});
				});
			});
		} else {
			alert("Link invalid");
		}
	}
};

function get_current_video(){
	if(ROOM.queue.length >= 1){
		var playlist_name = $('#btn_get_current_video').html(); 
		playlist_name = playlist_name.split("<span");
		playlist_name = playlist_name[0].trim();
		//Get playlist from name
		for(var i = 0 ; i < MY_PLAYLISTS.length ; i++){
			var playlist = MY_PLAYLISTS[i];
			if(playlist != undefined){
				if(playlist.name == playlist_name){
					socket.emit("get_current_video",{
						id_user: ME.id_user,
						data_link: ROOM.queue[0].data_link,
						link: ROOM.queue[0].link,
						id_playlist: playlist.id_playlist
					});
				}
			}
		}
	}
};

function close_room(){
	socket.emit("close_room" , {
		user: {id_user: ME.id_user, login: ME.login, password: ME.password, is_admin: ME.is_admin},
		id_room: ROOM.id
	});
	$("#dialog-confirm").dialog("close");
};

function check_user_queue(){
	//Check si l'utilisateur n'a pas déjà une video dans la queue
	for(var i = 0 ; i < ROOM.queue.length ; i++){
		if(ROOM.queue[i].id_user == ME.id_user){
			return true;
		}
	}
	return false;
}

function show_group_add_to_queue(){
	if($('#group_add_to_queue').css("display") == "none"){
		$('#group_add_to_queue').show();
		$('#group_add_playlist_to_queue').hide();
		$('#group_get_current_video').hide();
	} else {
		$('#group_add_to_queue').hide();
	}
};

function show_group_add_playlist_to_queue(){
	if($('#group_add_playlist_to_queue').css("display") == "none"){
		$('#group_add_playlist_to_queue').show();
		$('#group_get_current_video').hide();
		$('#group_add_to_queue').hide();
	} else {
		$('#group_add_playlist_to_queue').hide();
	}
};

function show_group_get_current_video(){
	if($('#group_get_current_video').css("display") == "none"){
		$('#group_get_current_video').show();
		$('#group_add_playlist_to_queue').hide();
		$('#group_add_to_queue').hide();
	} else {
		$('#group_get_current_video').hide();
	}
};

function get_youtube_id_from_link(url){
	var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	return (url.match(p)) ? RegExp.$1 : false;
};

function show_add_to_queue(){
	if($('#text_link').is(":visible")){
		$('#text_link').hide(200);
		$('#div_btn_add_to_queue').hide(200);
	} else {
		$('#text_link').val("");
		$('#text_link').show(200);
		$('#div_btn_add_to_queue').show(200);
	}
};

urlExists = function(url){
    return $.ajax({
        type: 'HEAD',
        url : url
    });
};

$('#btn_chat_message').on("click", function(event){
	var message = $('#text_chat_message').val();
	socket.emit("chat_message" , {
		user: {id_user: ME.id_user, login: ME.login, password: ME.password, is_admin: ME.is_admin},
		message: message,
		id_room: ROOM.id
	});
	$('#text_chat_message').val("");
});

$('#text_chat_message').keypress(function(e) {
    if(e.which == 13) {
    	event.preventDefault();
        var message = $('#text_chat_message').val();
		socket.emit("chat_message" , {
			user: {id_user: ME.id_user, login: ME.login, password: ME.password, is_admin: ME.is_admin},
			message: message,
			id_room: ROOM.id
		});
		$('#text_chat_message').val("");
    }
});

function skip_video(){
	if(ROOM.queue.length >= 1){
		if(ME.is_admin == 1){
			socket.emit("skip_video" , {
				user: {id_user: ME.id_user, login: ME.login, password: ME.password, is_admin: ME.is_admin},
				id_room: ROOM.id
			});
		} else {
			alert("GTFO");
		}
	}
};

function insert_emote(message){
	message = message.replace(/4Head/g,"<img src=\"/img/chat_emote/4Head.png\">");
	message = message.replace(/BabyRage/g,"<img src=\"/img/chat_emote/BabyRage.png\">");
	message = message.replace(/BibleThump/g,"<img src=\"/img/chat_emote/BibleThump.png\">");
	message = message.replace(/BrokeBack/g,"<img src=\"/img/chat_emote/BrokeBack.png\">");
	message = message.replace(/DansGame/g,"<img src=\"/img/chat_emote/DansGame.png\">");
	message = message.replace(/EleGiggle/g,"<img src=\"/img/chat_emote/EleGiggle.png\">");
	message = message.replace(/FailFish/g,"<img src=\"/img/chat_emote/FailFish.png\">");
	message = message.replace(/FrankerZ/g,"<img src=\"/img/chat_emote/FrankerZ.png\">");
	message = message.replace(/Kappa/g,"<img src=\"/img/chat_emote/Kappa.png\">");
	message = message.replace(/Keepo/g,"<img src=\"/img/chat_emote/Keepo.png\">");
	message = message.replace(/Kreygasm/g,"<img src=\"/img/chat_emote/Kreygasm.png\">");
	message = message.replace(/MrDestructoid/g,"<img src=\"/img/chat_emote/MrDestructoid.png\">");
	message = message.replace(/OpieOP/g,"<img src=\"/img/chat_emote/OpieOP.png\">");
	message = message.replace(/PogChamp/g,"<img src=\"/img/chat_emote/PogChamp.png\">");
	message = message.replace(/ResidentSleeper/g,"<img src=\"/img/chat_emote/ResidentSleeper.png\">");
	message = message.replace(/SMOrc/g,"<img src=\"/img/chat_emote/SMOrc.png\">");
	message = message.replace(/SwiftRage/g,"<img src=\"/img/chat_emote/SwiftRage.png\">");
	message = message.replace(/TriHard/g,"<img src=\"/img/chat_emote/TriHard.png\">");
	message = message.replace(/WinWaker/g,"<img src=\"/img/chat_emote/WinWaker.png\">");
	message = message.replace(/WutFace/g,"<img src=\"/img/chat_emote/WutFace.png\">");
	return message;
};

function clear_message(message){
	message = message.replace(/fuck/g,"***");
	return message;
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