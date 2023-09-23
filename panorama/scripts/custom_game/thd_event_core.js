
function SetCameraYaw(keys){
	GameUI.SetCameraYaw( keys.key_val )
}

function GetCameraYaw(keys){
	GameEvents.SendCustomGameEventToServer("get_camera_yaw_callback", {val: GameUI.GetCameraYaw()});
}


;(function () {
	
	GameEvents.Subscribe("set_camera_yaw", SetCameraYaw)
	GameEvents.Subscribe("get_camera_yaw", GetCameraYaw)
	
})()
