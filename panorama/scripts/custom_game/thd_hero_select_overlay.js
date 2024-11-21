
function OnClickRandomButton() {
	$.Msg( "OnClickRandomButton()" );
}

function OnClickRepickButton() {
	$.Msg( "OnClickRepickButton()" );
}

var repickbuttonoverlay;
var randombuttonoverlay;

function SetRepickButtonVisible(keys){
	if (keys.val){
		repickbuttonoverlay.style.visibility = 'visible';
	} else {
		repickbuttonoverlay.style.visibility = 'collapse';
	}
}

function SetRandomButtonVisible(keys){
	if (keys.val){
		randombuttonoverlay.style.visibility = 'visible';
	} else {
		randombuttonoverlay.style.visibility = 'collapse';
	}
}

function Init() {
	// get topmostpanel
	var topmostpanel;
	if (!topmostpanel) {
		topmostpanel = $.GetContextPanel();
		while( topmostpanel.GetParent()!=null ) {
			topmostpanel = topmostpanel.GetParent();
		}
	}

	// get scoreboard panel
	var randombutton = topmostpanel.FindChildTraverse( 'RandomButton' );
	var repickbutton = topmostpanel.FindChildTraverse( 'RepickButton' );
	var rerandombutton = topmostpanel.FindChildTraverse( 'ReRandomButton' );
	
	randombutton.style.visibility = 'collapse';
	repickbutton.style.visibility = 'collapse';
	rerandombutton.style.visibility = 'collapse';
	
	var heropickcontrols = topmostpanel.FindChildTraverse( 'HeroPickControls' );
	
	//var repickbuttonoverlay = topmostpanel.FindChildTraverse( 'RepickButtonOverlay' );
	//var randombuttonoverlay = topmostpanel.FindChildTraverse( 'RandomButtonOverlay' );
	
	//randombuttonoverlay.setParent(heropickcontrols);
	//repickbuttonoverlay.setParent(heropickcontrols);
	
	repickbuttonoverlay = heropickcontrols.FindChildTraverse( `RepickButtonOverlay` );
	if (repickbuttonoverlay == null ) {
		repickbuttonoverlay = $.CreatePanel(`Button`, heropickcontrols, `RepickButtonOverlay`, {
			class: `PickButton`,
			onmouseactivate: `GameEvents.SendCustomGameEventToServer("THD_Player_Repick", {val: 0})`,
			//onmouseactivate: `$.Msg( "OnClickRepickButton()" )`,
		});
		
		$.CreatePanel(`Panel`, repickbuttonoverlay, `RepickButtonOverlayIcon`, {
			class: `CancelPickIcon RepickIcon`,
		});
		$.CreatePanel(`Label`, repickbuttonoverlay, `RepickButtonOverlayLabel`, {
			text: `重选`,
		});
		
	}
	
	
	randombuttonoverlay = heropickcontrols.FindChildTraverse( `RandomButtonOverlay` );
	if (randombuttonoverlay == null ) {
		randombuttonoverlay = $.CreatePanel(`Button`, heropickcontrols, `RandomButtonOverlay`, {
			class: `PickButton`,
			onmouseactivate: `GameEvents.SendCustomGameEventToServer("THD_Player_RandomPick", {val: 0})`,
			//onmouseactivate: `$.Msg( "OnClickRandomButton()" )`,
		});
		
		$.CreatePanel(`Panel`, randombuttonoverlay, `RandomButtonOverlayIcon`, {
			class: `CancelPickIcon RandomIcon`,
		});
		$.CreatePanel(`Label`, randombuttonoverlay, `RandomButtonOverlayLabel`, {
			text: `随机`,
		});
		
	}
	
	randombuttonoverlay.style.visibility = 'collapse';
	repickbuttonoverlay.style.visibility = 'collapse';
	
	//$.Msg( "ok!" );

}


//---------------------------------------------
// Init
(function() {
	
	
	$.Msg( "Hello from heroselect." );

	Init();
	
	GameEvents.Subscribe("set_repick_button_visible", SetRepickButtonVisible);
	GameEvents.Subscribe("set_random_button_visible", SetRandomButtonVisible);
	
	randombuttonoverlay.style.visibility = 'visible';
	
	
	
})();