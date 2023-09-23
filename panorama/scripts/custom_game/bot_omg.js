"use strict";
// mod_state是判定玩家选择的模式，

var hero_data  = {}
var local_hero_list = {}
var local_abi_list = {}
var local_ult_list = {}
var mod_state = 0

GameEvents.Subscribe("bot_create_UI", bot_create_UI);


// BOT模式，创建一个按钮，选择模式，如果是自选模式，则aim_panel.visible = true，不做任何修改
// 如果是随机模式，则创建版
function bot_create_UI (data){
    $.Msg("bot_create_UI")
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    const aim_panel =  dotaHud.FindChildTraverse("HeroPickScreenContents")
    const aim_panel_2 =  dotaHud.FindChildTraverse("FriendsAndFoes")
    const aim_panel_3 =  dotaHud.FindChildTraverse("PreMinimapContainer")
    aim_panel.visible = false
    aim_panel_2.visible = false
    aim_panel_3.visible = false
    
    const BOT_HUD = $("#BOT_HUD")
    BOT_HUD.style.width = Game.GetScreenWidth() + "px";
    
    // const Button_box_1 = $.CreatePanel("Panel", BOT_HUD, "Button_box_1")
    // Button_box_1.AddClass("Button_box")
    // const Button_box_2 = $.CreatePanel("Panel", BOT_HUD, "Button_box_2")
    // Button_box_2.AddClass("Button_box")
    
    // const UI_button_1 =  $.CreatePanel("Panel", Button_box_1, "UI_button_1")
    // UI_button_1.AddClass("UI_Button")
    // const UI_button_2 =  $.CreatePanel("Panel", Button_box_2, "UI_button_2")
    // UI_button_2.AddClass("UI_Button")
    
    // const UI_button_label_1 = $.CreatePanel("Label",UI_button_1,"UI_button_label_1")
    // UI_button_label_1.AddClass("sub_label")
    // UI_button_label_1.text = "自选模式"
    // const UI_button_label_2 = $.CreatePanel("Label",UI_button_2,"UI_button_label_2")
    // UI_button_label_2.AddClass("sub_label")
    // UI_button_label_2.text = "随机模式"
    
}
function OnButton_box_1() {
    $.Msg("OnButton_box_1")
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    const aim_panel =  dotaHud.FindChildTraverse("HeroPickScreenContents")
    const BOT_HUD = $("#BOT_HUD")
    // 自选模式，aim_panel.visible = true，不做任何修改
    aim_panel.visible = true
    BOT_HUD.visible = false
    const id = Game.GetLocalPlayerID()
    mod_state = 1 //不执行随机
    GameEvents.SendCustomGameEventToServer("OMG_UI_START", {id,mod_state});
}
function OnButton_box_2() {
    // 如果是随机模式，则返回id给lua。让lua执行正常创建版
    const BOT_HUD = $("#BOT_HUD")
    BOT_HUD.visible = false
    const id = Game.GetLocalPlayerID()
    mod_state = 0
    GameEvents.SendCustomGameEventToServer("OMG_UI_START", {id,mod_state});
}
