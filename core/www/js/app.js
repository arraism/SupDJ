var socket; // Socket.IO

// Configuration: toutes les constantes seront déclarées ici





$(document).ready(function(){
/*
	if (userInfo.alliance == 0){
		$(".menu-item.noAlliance").show();
	} else {
		$(".menu-item.hasAlliance").show();
	} */
});

// Click sur les menus en haut (topbar)
$(".ui-menu").on("click", function(event){
	event.preventDefault();
	var $this = $(this);
	var data = $this.attr("data-window");
	if ($this.attr("data-event") != undefined){
		socket.emit($(this).attr("data-event"));
	}
    $("#ui-window-"+data).dialog({
	 	autoOpen: false,
		height: 500,
		width: 600,
		modal: false,
		title: $this.html() 	
    }).dialog("open");
});

// Menu dans
$(".menu-item").on("click", function(event){
	event.preventDefault();
	$(".ui-subwindow").hide();
	var $that = $(this);
	if ($that.attr("data-event") != undefined){
		socket.emit($(this).attr("data-event"));
	}
	$($that.attr("href")).show();
});

$("#alliance-create-form").on("submit" , function(event){
	event.preventDefault();
	socketEmitWithId("alliance-create" , $("#alliance-create-form-name").val());
});




$(".ui-menu[data-window=inventory]").on("click",function (event) {
  event.preventDefault();
  var weapon;
  var crop;
    var html = "<table class=\"table\"><tr><th>Weapon</th><th>Power</th><th>Hit ratio</th><th>Hit per second</th><th>Quantity</th></tr>" ;
    for (var i in game.inventory) {
      if(game.inventory[i].type == "weapon"){
        id = game.inventory[i].id_item;
          weapon = game.weapons[id];
          html += "<tr id="+id+"><td>"+weapon.name+"</td><td>"+weapon.power+"</td><td>"+weapon.hitratio+"</td><td>"+weapon.hps+"</td><td>"+game.inventory[i].quantity+"</td><td><button onClick=\"useWeapon('"+id+"')\">Use</button></td></tr>";
      }
    }
    html += "</table>";
    html += "<label id='label-money'>Money : "+userInfo.money+"</label>";
    $("#inventory-weapon").html(html);


    // Crops
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


function useCrop(id){
      for (var i in game.inventory) {
      if(game.inventory[i].type == "crop" && game.inventory[i].id_item == id){
        quantity = game.inventory[i].quantity;
      }
    }
  var data = {id_user: userInfo.id, x: userInfo.x, y: userInfo.y, id_crop: id, quantity: quantity};
  socket.emit("game-useCrop", data);
}



function acceptAlliance(id){
	socket.emit("alliance-request-accept", {id_user: id, id_alliance: userInfo.alliance});
}


function refuseAlliance(id){
	socket.emit("alliance-request-refuse", {id_user: id, id_alliance: userInfo.alliance});
}

$("#get-members").on("click", function(event){
	event.preventDefault();
	if(userInfo.alliance != 0) {
		socket.emit("alliance-getMembers", {id_alliance: userInfo.alliance, id_user: userInfo.id});
	}
});
$("#alliance-quit-btn").on("click", function(event){
	event.preventDefault();
	if(userInfo.alliance != 0) {
		if (confirm("Do you really want to quit your alliance ?")){
			socket.emit("alliance-quit", userInfo.id);
		}
	}
});

function joinAlliance(data) {
	var array=data.split("-");
	var id = array[1];
	var name = array[0];
	socket.emit("alliance-join", {id_alliance: id, id_user: userInfo.id, alliancename: name });
}
function cancelAlliance(data){
	var array=data.split("-");
	var id = array[1];
	var name = array[0];
	socket.emit("alliance-cancel", {id_alliance: id, id_user: userInfo.id, alliancename: name});
}






$("#chat-form").on("submit",function(event){
	event.preventDefault();
	socketEmitWithId("chat-newMessage", $("#chat-form input[name=message]").val());
});