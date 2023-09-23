"use strict";

function GetMouseCastTarget()
{
	var mouseEntities = GameUI.FindScreenEntities( GameUI.GetCursorPosition() );
	var localHeroIndex = Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() );
	// mouseEntities = mouseEntities.filter( function(e) { return e.entityIndex !== localHeroIndex; } );
	for ( var e of mouseEntities )
	{
		if ( !e.accurateCollision )
			continue;
		return e.entityIndex;
	}

	for ( var e of mouseEntities )
	{
		return e.entityIndex;
	}

	return -1;
}

function GetMouseCastPosition( abilityIndex )
{
	var localHeroIndex = Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() );
	var localHeroPosition = Entities.GetAbsOrigin( localHeroIndex );
	var position = GameUI.GetScreenWorldPosition( GameUI.GetCursorPosition() );
	var targetDelta = [ position[0] - localHeroPosition[0], position[1] - localHeroPosition[1] ];
	var targetDist = Math.sqrt( targetDelta[0] * targetDelta[0] + targetDelta[1] * targetDelta[1] );
	var abilityRange = Abilities.GetCastRange( abilityIndex );
	if ( targetDist > abilityRange && abilityRange > 0 )
	{
		position[0] = localHeroPosition[0] + targetDelta[0] * abilityRange / targetDist;
		position[1] = localHeroPosition[1] + targetDelta[1] * abilityRange / targetDist;
	}
	return position;
}

function OnExecuteAbilityButtonPressed( abi_index )
{
	$.Msg("OnExecuteAbilityButtonPressed")
	var order = {
        AbilityIndex : Entities.GetAbility( Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() ), 1 ),
		QueueBehavior : OrderQueueBehavior_t.DOTA_ORDER_QUEUE_NEVER,
		ShowEffects : false,
		OrderType : dotaunitorder_t.DOTA_UNIT_ORDER_CAST_NO_TARGET
	};
    $.Msg(abi_index)
    $.Msg(order.AbilityIndex)
    if (abi_index) {
        order.AbilityIndex = abi_index
    }
    $.Msg(abi_index)
	var abilityBehavior = Abilities.GetBehavior( order.AbilityIndex );

    $.Msg(Abilities.GetAbilityName(order.AbilityIndex));
    $.Msg(typeof(abilityBehavior));typeof
    $.Msg(typeof(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_NO_TARGET));
    $.Msg(abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_NO_TARGET);
    $.Msg(abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET);
    $.Msg(abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT);
    $.Msg(abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE);
    $.Msg("=========================");
	// if ( abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE )
	// {
    //     $.Msg("DOTA_ABILITY_BEHAVIOR_TOGGLE");
	// 	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_NO_TARGET;
	// }
	if ( abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET 
		&& GetMouseCastTarget() != -1 ){
		$.Msg("DOTA_UNIT_ORDER_CAST_TARGET");
		order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TARGET;
		order.TargetIndex  = GetMouseCastTarget();
		order.Position = GetMouseCastPosition( order.AbilityIndex );
	}else if ( abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT )
	{
        $.Msg("DOTA_UNIT_ORDER_CAST_POSITION");
		order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_POSITION;
		order.Position = GetMouseCastPosition( order.AbilityIndex );
	}
    

	Game.PrepareUnitOrders( order );
}

var nParticleIndex = -1;
function OnTestButtonPressed()
{
	$.Msg( "Test button pressed." );
	var localHeroIndex = Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() );
	nParticleIndex = Particles.CreateParticle( "particles/generic_gameplay/generic_stunned.vpcf", ParticleAttachment_t.PATTACH_OVERHEAD_FOLLOW, localHeroIndex );
}

function OnTestButtonReleased()
{
	$.Msg( "Test button released." ); 
	Particles.DestroyParticleEffect( nParticleIndex, true );
}

//定义全局变量，用来获取该玩家添加的技能index
//JS没法获取实体，只能通过技能和单位的index判定是什么东西
// var abi_index //小技能index
// var ultabi_index //大招index
// var normal_abi_isQuick
// var ultmate_abi_isQuick
// var hero_before_index

// //设置快速施法按钮初始化
// function normal_quickcast(params) {
// 	$.Msg("normal_quickcast")
//     var normal_panel = $("#key_bind_label_1")
//     //修改CSS样式
//     var key = $("#Entry_Ability").text
//     if (key == "空") {
//         key = "space"
//     }
//     if (normal_panel.BHasClass("quickcast_false")) {
//         normal_panel.RemoveClass("quickcast_false")
//         normal_panel.AddClass("quickcast_true")
//         normal_abi_isQuick = true
//     }else if (normal_panel.BHasClass("quickcast_true")) {
//         normal_panel.RemoveClass("quickcast_true")
//         normal_panel.AddClass("quickcast_false")
//         normal_abi_isQuick = false
//     }
//     //传递给Lua，赋值在hero.omd_add_ability下  （无需传递，有BUG，SendToConsole()不生效
//     GameEvents.SendCustomGameEventToServer("quickcast", {normal_abi_isQuick:normal_abi_isQuick})
// }
// function ultmate_quickcast(params) {
// 	$.Msg("ultmate_quickcast")
//     var ultmate_panel = $("#key_bind_label_2")
//     //修改CSS样式
//     var key = $("#Entry_ultAbility").text
//     if (key == "空") {
//         key = "space"
//     }
//     if (ultmate_panel.BHasClass("quickcast_false")) {
//         ultmate_panel.RemoveClass("quickcast_false")
//         ultmate_panel.AddClass("quickcast_true")
//         ultmate_abi_isQuick = true
//     }else if (ultmate_panel.BHasClass("quickcast_true")) {
//         ultmate_panel.RemoveClass("quickcast_true")
//         ultmate_panel.AddClass("quickcast_false")
//         ultmate_abi_isQuick = false
//     }
//     //传递给Lua，赋值在hero.omd_add_ability下  （无需传递，有BUG，SendToConsole()不生效
//     GameEvents.SendCustomGameEventToServer("quickcast", {ultmate_abi_isQuick:ultmate_abi_isQuick})
// }

// //点击普通施法，然后隐藏小技能快速施法栏和快速改键栏，同时显示普通改键栏
// function nor_execute() {
//     $("#key_Label_box_nor").visible = false
//     $("#Entry_Ability_quick").visible = false
//     $("#Entry_Ability").visible = true
//     $("#key_TextEntry_box_nor").visible = true
// }
// //点击普通施法，然后隐藏大招快速施法栏和快速改键栏，同时显示大招普通改键栏
// function ult_execute() {
//     $("#key_Label_box_ult").visible = false
//     $("#Entry_ultAbility_quick").visible = false
//     $("#Entry_ultAbility").visible = true
//     $("#key_TextEntry_box_ult").visible = true
// }