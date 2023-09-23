$.Msg("Mod_selection.js")

GameEvents.Subscribe("Mod_selection", Mod_selection); //为所有玩家建立模式面板
GameEvents.Subscribe("BOT_Mod_selection", BOT_Mod_selection); //为所有玩家建立BOT面板
// GameEvents.Subscribe("Mod_selection_Reset", Mod_selection_Reset); //为重连的玩家建立面板
GameEvents.Subscribe("Close_Game_Mod", Close_Game_Mod); //关闭面板

//建立一个面板，用来选择模式，包括普通模式和OMG模式，OMG模式下可以选择难度和最大玩家数，最大玩家数默认为5
function Mod_selection(data) {
    $.Msg("Mod_selection") 
    $.Msg(data) 
    //总面板
    var _Mod_Box = $.CreatePanel("Panel", $.GetContextPanel(), "Mod_Box")
    _Mod_Box.AddClass("Mod_box")
    _Mod_Box.style.width = "450px"
    _Mod_Box.style.height = "500px"
    _Mod_Box.style.marginTop = "30%"
    _Mod_Box.style.marginLeft = "46%"

    //模式面板
    var _Mod_Panel = $.CreatePanel("Panel", _Mod_Box, "Mod_Panel")
    _Mod_Panel.AddClass("Change_box") 
    _Mod_Panel.style.width = "200px"
    _Mod_Panel.style.height = "130px"
    _Mod_Panel.style.marginTop = "5%"
    _Mod_Panel.style.marginLeft = "5%"
    //普通模式
    var _normal_panel = $.CreatePanel("Panel", _Mod_Panel, "Normal_Panel")
    _normal_panel.AddClass("Select_box")    
    _normal_panel.style.margin= "5%"
    let _normal_label = $.CreatePanel("Label", _normal_panel, "Mod_Label")
    _normal_label.AddClass("Mod_Label")
    _normal_label.text = "普通模式"
    _normal_panel.SetPanelEvent("onactivate", function() {
        $.Msg("normal_panel")
        // 判断是否是HOST
        if (Game.GetLocalPlayerID() == 0) {
            _normal_label.text = "普通模式√"
            _normal_label.style.color = "#FF0000"
            _omg_label.text = "OMG模式"
            _omg_label.style.color = "#FFFFFF"
            GameEvents.SendCustomGameEventToServer("Change_Game_Mod", {mod: "normal"});
        }
    })
    // OMG模式
    let _omg_panel = $.CreatePanel("Panel", _Mod_Panel, "OMG_Panel")
    _omg_panel.AddClass("Select_box")
    _omg_panel.style.margin= "10px"
    let _omg_label = $.CreatePanel("Label", _omg_panel, "Mod_Label")
    _omg_label.AddClass("Mod_Label")
    _omg_label.text = "OMG模式√"
    _omg_label.style.color = "#FF0000"
    _omg_panel.SetPanelEvent("onactivate", function() {
        $.Msg("omg_panel")
        if (Game.GetLocalPlayerID() == 0) {
            _normal_label.text = "普通模式"
            _normal_label.style.color = "#FFFFFF"
            _omg_label.text = "OMG模式√"
            _omg_label.style.color = "#FF0000"
            GameEvents.SendCustomGameEventToServer("Change_Game_Mod", {mod: "omg"});
        }
    })
    // 数据初始化
    if (data[1].Mod == 1) {
        _normal_label.text = "普通模式√"
        _normal_label.style.color = "#FF0000"
        _omg_label.text = "OMG模式"
        _omg_label.style.color = "#FFFFFF"
    }else if (data[1].Mod == 2) { 
        _normal_label.text = "普通模式"
        _normal_label.style.color = "#FFFFFF"
        _omg_label.text = "OMG模式√"
        _omg_label.style.color = "#FF0000"
    }
}

function BOT_Mod_selection(data) {
    Bot_Mod_Set(data)
}

function Bot_Mod_Set(data) {
    $.Msg("Bot_Mod_Set")
    let _Mod_Box = $("#Mod_Box")
    if (_Mod_Box == null) {
        return
    }
    let _omg_change_box = $.CreatePanel("Panel", _Mod_Box, "OMG_Change_Box")
    _omg_change_box.AddClass("Change_box")
    _omg_change_box.style.marginTop= "5%"
    _omg_change_box.style.marginLeft= "5%"


    let _omg_easy = $.CreatePanel("Panel", _omg_change_box, "OMG_Easy")
    _omg_easy.AddClass("Select_box")
    _omg_easy.style.marginTop= "10px"
    let _omg_easy_label = $.CreatePanel("Label", _omg_easy, "Mod_Label")
    _omg_easy_label.AddClass("Mod_Label")
    _omg_easy_label.text = "简单"

    let _omg_normal = $.CreatePanel("Panel", _omg_change_box, "OMG_Normal")
    _omg_normal.AddClass("Select_box")
    _omg_normal.style.marginTop= "10px"
    let _omg_normal_label = $.CreatePanel("Label", _omg_normal, "Mod_Label")
    _omg_normal_label.AddClass("Mod_Label")
    _omg_normal_label.text = "普通"

    let _omg_hard = $.CreatePanel("Panel", _omg_change_box, "OMG_Hard")
    _omg_hard.AddClass("Select_box")
    _omg_hard.style.marginTop= "10px"
    let _omg_hard_label = $.CreatePanel("Label", _omg_hard, "Mod_Label")
    _omg_hard_label.AddClass("Mod_Label")
    _omg_hard_label.text = "困难"

    let _omg_lunatic = $.CreatePanel("Panel", _omg_change_box, "OMG_Lunatic")
    _omg_lunatic.AddClass("Select_box")
    _omg_lunatic.style.marginTop= "10px"
    let _omg_lunatic_label = $.CreatePanel("Label", _omg_lunatic, "Mod_Label")
    _omg_lunatic_label.AddClass("Mod_Label")
    _omg_lunatic_label.text = "疯狂"

    // 数据初始化
    if (data[1].Difficulty == 1) {
        Click_Set(_omg_easy, _omg_easy_label)
    }else if (data[1].Difficulty == 2) {
        Click_Set(_omg_normal, _omg_normal_label)
    }else if (data[1].Difficulty == 3) {
        Click_Set(_omg_hard, _omg_hard_label)
    }else if (data[1].Difficulty == 4) {
        Click_Set(_omg_lunatic, _omg_lunatic_label)
    }

    
    // 对所有的panel增加点击事件
    _omg_easy.SetPanelEvent("onactivate", function() {
        $.Msg("omg_easy")
        if (Game.GetLocalPlayerID() == 0) {
            Click_Set(_omg_easy, _omg_easy_label)
        }
    })
    _omg_normal.SetPanelEvent("onactivate", function() {
        $.Msg("omg_normal")
        if (Game.GetLocalPlayerID() == 0) {
            Click_Set(_omg_normal, _omg_normal_label)
        }
    })
    _omg_hard.SetPanelEvent("onactivate", function() {
        $.Msg("omg_hard")
        if (Game.GetLocalPlayerID() == 0) {
            Click_Set(_omg_hard, _omg_hard_label)
        }
    })
    _omg_lunatic.SetPanelEvent("onactivate", function() {
        $.Msg("omg_lunatic")
        if (Game.GetLocalPlayerID() == 0) {
            Click_Set(_omg_lunatic, _omg_lunatic_label)
        }
    })
    
    function Click_Set(_click_panel, _click_label) {
        $.Msg("Click_Set")
        if (Game.GetLocalPlayerID() == 0) {
            
            let _spawn_text = _click_label.text
            // 只取前两个字符
            _spawn_text = _spawn_text.substring(0, 2)
            _omg_easy_label.text = "简单"
            _omg_easy_label.style.color = "#FFFFFF"
            _omg_normal_label.text = "普通"
            _omg_normal_label.style.color = "#FFFFFF"
            _omg_hard_label.text = "困难"
            _omg_hard_label.style.color = "#FFFFFF"
            _omg_lunatic_label.text = "疯狂"
            _omg_lunatic_label.style.color = "#FFFFFF"
            _click_label.style.color = "#FFFFFF"
            _click_label.style.color = "#FF0000"
            // 若_spawn_text有两个字符，则不执行+ "√"
            if (_spawn_text.length == 2) {
            }
            _click_label.text = _spawn_text + "√"
            let difficulty_number = 1
            if (_spawn_text == "简单") {
                difficulty_number = 1
            } else if (_spawn_text == "普通") {
                difficulty_number = 2
            } else if (_spawn_text == "困难") {
                difficulty_number = 3
            } else if (_spawn_text == "疯狂") {
                difficulty_number = 4
            }
            GameEvents.SendCustomGameEventToServer("Change_Game_Difficulty", {difficulty: difficulty_number});
        }   
    }

    // 最大玩家数
    let _omg_player_box = $.CreatePanel("Panel", _omg_change_box, "OMG_Player_Box")
    _omg_player_box.AddClass("MaxPlayer_box")
    let _omg_maxPlayer_label = $.CreatePanel("Label", _omg_player_box, "Mod_Label")
    _omg_maxPlayer_label.AddClass("Max_Label")
    _omg_maxPlayer_label.text = "最大玩家数"
    let _omg_maxPlayer_enter = $.CreatePanel("TextEntry", _omg_player_box, "OMG_MaxPlayer_Enter")
    _omg_maxPlayer_enter.AddClass("OMG_MaxPlayer_Enter")
    _omg_maxPlayer_enter.text = data[1].MaxPlayer
    // _omg_maxPlayer_enter修改事件
    _omg_maxPlayer_enter.SetPanelEvent("oninputsubmit", function() {
        $.Msg("oninputsubmit")
        if (Game.GetLocalPlayerID() == 0) {
            let _maxPlayer = _omg_maxPlayer_enter.text
            if (_maxPlayer == "") {
                _maxPlayer = _maxPlayer
            }
            GameEvents.SendCustomGameEventToServer("Change_Game_MaxPlayer", {maxPlayer: _maxPlayer});
        }
    })

}

function Close_Game_Mod(params) {
    $.Msg("Close_Game_Mod")
    let _Mod_Box = $("#Mod_Box")
    // 隐藏面板
    if (_Mod_Box) {
        _Mod_Box.visible = false
    }
}