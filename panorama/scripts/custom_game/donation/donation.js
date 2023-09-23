
function CreateKeyBind (keys){
	Game.CreateCustomKeyBind( keys.key_val , keys.event )
}

function Cast_xianzhezhishi( msg ) {
	GameEvents.SendCustomGameEventToServer("Cast_xianzhezhishi", {val: 0});
}

;(function () {
	$("#DonationFrame").visible = false;
	
	if ($.Language() === "schinese") {
		$("#Html").RunJavascript(true)
		$("#Html").SetURL("https://avalondota2.com/donation?steamid=" + Game.GetLocalPlayerInfo().player_steamid + "&game=THD2")
	}

	$.Schedule(120, function () {
		$("#DonationFrame").visible = false;
		$("#Donation").visible = false;
	})
	
	GameEvents.Subscribe("custom_key_bind", CreateKeyBind)
	
	Game.AddCommand("xianzhezhishi", Cast_xianzhezhishi, "", 0);
	
})()