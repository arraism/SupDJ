var youtube_player;

function onYouTubePlayerAPIReady() {
	youtube_player = new YT.Player('youtube_player', {
		height: '390',
		width: '640',
		videoId: '',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}, 
		playerVars: {
			'controls': 0
		}
	});
}

// autoplay video
function onPlayerReady(event) {
	//event.target.playVideo();
}

// when video ends
function onPlayerStateChange(event) {
	/*if(event.data === 0 && Me.is_admin == 1) {
		socket.emit("next_video" , {
			user: {id_user: ME.id, login: ME.login, password: ME.password, is_admin: ME.is_admin},
			id_room: ROOM.id
		});
		ROOM.queue.shift();
		if(ROOM.queue.length > 0){
			youtube_player.cueVideoById(get_youtube_id_from_link(ROOM.queue[0]),0,"");
		}
	}*/
}