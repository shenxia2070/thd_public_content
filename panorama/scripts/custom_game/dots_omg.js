//定义全局变量，用来获取该玩家添加的技能index
//JS没法获取实体，只能通过技能和单位的index判定是什么东西
var abi_index //小技能index
var ultabi_index //大招index
var normal_abi_isQuick
var ultmate_abi_isQuick
var hero_before_index
var hero_showed_list = {}


//确定按钮，更换选择的技能，hero.load42_reset = true，关闭Panel
function On_OMG_button_Enter_Pressed(event) {
    $.Msg("On_OMG_button_Pressed(event)");
    // ability_init($("#ability_1"));
    // var this_Button = $("#OMG_button_1");
    var select_abi_name = {}
    select_abi_name["select_ult_abi"] = return_seclect_abi($("#ult_abilities_1"));
    select_abi_name["select_abi"] = return_seclect_abi($("#abilities_1"));


    //hero_before_index是-4+2时确定的英雄实体，绑定技能添加在这个英雄实体上
    select_abi_name["hero_before_index"] = hero_before_index;


    GameEvents.SendCustomGameEventToServer("omg_change_ability", select_abi_name);
    //隐藏选技能栏
    $("#div_1").visible = false;
    
    //显示改键栏
    $("#key_bind_box_id").visible = true
}

//取消按钮，不变选择的技能，隐藏Panel
function On_OMG_button_Cancel_Pressed(event) {
    $.Msg("On_OMG_button_Cancel_Pressed(event)");
    // $("#div_1").visible = false;
    hero_before_index = Players.GetLocalPlayerPortraitUnit();
    hero_before_spawn =   Entities.GetUnitName(hero_before_index)
    $.Msg("hero_before_spawn")
    $.Msg(hero_before_spawn)
    $.Msg("hero_before_index")
    $.Msg(hero_before_index)
    
    GameEvents.SendCustomGameEventToServer("test_mod_js", {hero_before_index});

    var gameModePanel = $("#key_bind_box_id")
    // gameModePanel.BLoadLayout( "file://{resources}/layout/custom_game/game_mode.xml", false, false );
    // var game_panel = gameModePanel.FindChildTraverse("#SlantedContainerPanel");
    
}

//传递参数为选择的技能box，返回选择的那一个技能,若没选则随机返回一个技能
function return_seclect_abi(abi_list) {
    $.Msg("return_seclect_abi()")
    var abi_name
    var ult_abi_name
    for (let i = 0; i < 8; i++) {
        const element = abi_list.GetChild(i);
        // if (element.BHasClass("checkbox")) {
        if (element.checked == true ) {
            if (abi_list == $("#abilities_1")) {
                $.Msg(lua_data[1][i]);
                abi_name = lua_data[1][i]
                //返回选择的小技能
                return abi_name
            }
            if (abi_list == $("#ult_abilities_1")) {
                $.Msg(lua_data[2][i]);
                ult_abi_name = lua_data[2][i]
                //返回选择的终极技能
                return ult_abi_name
            }
        }
    }
    if (abi_name == null && abi_list == $("#abilities_1")) {
        //若没选择技能，则随机一个技能
        $.Msg("random_return==================")
        var random = Math.floor(Math.random() * 7);
        abi_name = lua_data[1][random]
        //返回选择的小技能
        return abi_name
    }
    if (ult_abi_name == null && abi_list == $("#ult_abilities_1")) {
        //若没选择技能，则随机一个技能
        $.Msg("random_return==================")
        var random = Math.floor(Math.random() * 7);
        ult_abi_name = lua_data[2][random]
        //返回选择的小技能
        return ult_abi_name
    }
    $.Msg("can't return seclect ability.");
    return "can't return seclect ability."
}

//图标方法绑定初始化-------------LUA
GameEvents.Subscribe("load_OMG_ability_to_js", OMG_load_ablity);
function OMG_load_ablity(data) {
    hero_before_index = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    // $("#key_bind_box_id").visible = false
    // $("#div_1").visible = true;//测试代码，正式上传之前要注释

    lua_data = data;
    var abi_box = $("#abilities_1")
    var ult_abi_box = $("#ult_abilities_1")

    //隐藏改键栏
    $("#key_bind_box_id").visible = false
    //隐藏输入栏
    //显示按钮
    $("#key_Label_box_nor").visible = true 
    $("#key_Label_box_execute_nor").visible = false
    $("#key_Label_box_ult").visible = true 
    $("#key_Label_box_execute_ult").visible = false
    $("#Entry_Ability_quick").visible = false
    $("#Entry_ultAbility_quick").visible = false
    $("#key_bind_text_panel").visible = false //隐藏提示栏
    

    //动态创建
    for (let i = 0; i < 8; i++) {
        // $.Msg(abi_box.GetChild(i));
        // 直接创建8个小技能panel，然后对每一个panel SetPanelEvent 事件
        // 父级元素abi_box ; ult_abi_box
        // abilityName 为 data[1][i]

        //为每一个技能委托事件，鼠标移上去显示技能信息
        var create_abi = $.CreatePanel("DOTAAbilityImage", abi_box, "", {
            "class": "ability",
            html: "true",
            selectionpos: "auto",
            hittest: "true",
            hittestchildren: "false",
            abilityname: data[1][i],
            onmouseover: "DOTAShowAbilityTooltip('" + data[1][i] + "')",
            onmouseout: "DOTAHideAbilityTooltip()",
        });
        var create_ult_abi = $.CreatePanel("DOTAAbilityImage", ult_abi_box, "", {
            "class": "ability",
            html: "true",
            selectionpos: "auto",
            hittest: "true",
            hittestchildren: "false",
            abilityname: data[2][i],
            onmouseover: "DOTAShowAbilityTooltip('" + data[2][i] + "')",
            onmouseout: "DOTAHideAbilityTooltip()",
        });
        if (create_abi) {
            //修改技能图标，但是图标未编译不生效
            abi_box.GetChild(i).SetPanelEvent("onactivate", function () {
                //鼠标点击添加边框，checked = ture；同时其他小技能取消边框 checked = false。
                for (let i = 0; i < 8; i++) {
                    abi_box.GetChild(i).RemoveClass("select_ability");
                    abi_box.GetChild(i).checked = false;
                }
                abi_box.GetChild(i).AddClass("select_ability");
                abi_box.GetChild(i).checked = true;
                $.Msg(data[1][i] + "is checked.");
            })
        }
        if (create_ult_abi) {
            ult_abi_box.GetChild(i).SetPanelEvent("onactivate", function () {
                //鼠标点击添加边框，checked = ture；同时其他小技能取消边框 checked = false。
                for (let i = 0; i < 8; i++) {
                    ult_abi_box.GetChild(i).RemoveClass("select_ability");
                    ult_abi_box.GetChild(i).checked = false;
                }
                ult_abi_box.GetChild(i).AddClass("select_ability");
                ult_abi_box.GetChild(i).checked = true;
                $.Msg(data[2][i] + "is checked.");
            })
        }
    }
}

//设置快速施法按钮初始化
function normal_quickcast(params) {
    $.Msg("normal_quickcast")
    var normal_panel = $("#key_bind_label_1")
    //修改CSS样式
    var key = $("#Entry_Ability").text
    if (key == "空") {
        key = "space"
    }
    if (normal_panel.BHasClass("quickcast_false")) {
        normal_panel.RemoveClass("quickcast_false")
        normal_panel.AddClass("quickcast_true")
        normal_abi_isQuick = true
    }else if (normal_panel.BHasClass("quickcast_true")) {
        normal_panel.RemoveClass("quickcast_true")
        normal_panel.AddClass("quickcast_false")
        normal_abi_isQuick = false
    }
    $.Msg(normal_abi_isQuick)
    //传递给Lua，赋值在hero.omd_add_ability下  （无需传递，有BUG，SendToConsole()不生效
    GameEvents.SendCustomGameEventToServer("quickcast", {normal_abi_isQuick:normal_abi_isQuick})
}
function ultmate_quickcast(params) {
    $.Msg("ultmate_quickcast")
    var ultmate_panel = $("#key_bind_label_2")
    //修改CSS样式
    var key = $("#Entry_ultAbility").text
    if (key == "空") {
        key = "space"
    }
    if (ultmate_panel.BHasClass("quickcast_false")) {
        ultmate_panel.RemoveClass("quickcast_false")
        ultmate_panel.AddClass("quickcast_true")
        ultmate_abi_isQuick = true
    }else if (ultmate_panel.BHasClass("quickcast_true")) {
        ultmate_panel.RemoveClass("quickcast_true")
        ultmate_panel.AddClass("quickcast_false")
        ultmate_abi_isQuick = false
    }
    $.Msg(ultmate_abi_isQuick)
    //传递给Lua，赋值在hero.omd_add_ability下  （无需传递，有BUG，SendToConsole()不生效
    GameEvents.SendCustomGameEventToServer("quickcast", {ultmate_abi_isQuick:ultmate_abi_isQuick})
}

//点击普通施法，然后隐藏小技能快速施法栏和快速改键栏，同时显示普通改键栏
function nor_execute() {
    // $("#key_Label_box_nor").visible = false
    // $("#Entry_Ability_quick").visible = false
    // $("#Entry_Ability").visible = true
    // $("#key_TextEntry_box_nor").visible = true
}
//点击普通施法，然后隐藏大招快速施法栏和快速改键栏，同时显示大招普通改键栏
function ult_execute() {
    // $("#key_Label_box_ult").visible = false
    // $("#Entry_ultAbility_quick").visible = false
    // $("#Entry_ultAbility").visible = true
    // $("#key_TextEntry_box_ult").visible = true
}

// 控制台命令修改快捷键绑定施法  **因为不知道怎么使用Lua的SendtoConsole()命令，所以搁置 **
// function EntryChange(params) {
//     var normal_abi_key = $("#Entry_Ability").text;
//     var ultmate_abi_key = $("#Entry_ultAbility").text;
//     if (normal_abi_key == " ") {
//         $("#Entry_Ability").text = "空"
//         normal_abi_key = "space"
//     }
//     if (ultmate_abi_key == " ") {
//         $("#Entry_ultAbility").text = "空"
//         ultmate_abi_key = "space"
//     }
//     //传递给Lua，赋值在hero.omd_add_ability下
//     GameEvents.SendCustomGameEventToServer("bind_key_set", {normal_abi_key:normal_abi_key,ultmate_abi_key:ultmate_abi_key})
// }

//改建 （小技能）
function EntryAbilityOnactivate() {
    // $.Msg("EntryAbilityOnactivate()");
    // $.Msg(Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()));
    // $.Msg(Players.GetLocalPlayer());
    var key = $("#Entry_Ability").text;
    $.Msg(key);
    if (key == " ") {
        $("#Entry_Ability").text = "空"
        $.Msg("space");
        key = "space"
    }
    // GameEvents.SendCustomGameEventToServer("BindNormalAbility", {key,abi_index,string_name});
    //下面是固定代码，绑定的函数必须不同名，所以要加上时间作为str。
    const command = "WheelButton" + Math.floor(Math.random() * 99999999);
    const AbilityIndex = Entities.GetAbility( Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() ), abi_index)
    // "+" 是按下的操作， "-" 是弹起的操作
    const abilityBehavior = Abilities.GetBehavior( AbilityIndex )
    $.Msg(abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE);
    $.Msg("abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE");
    Game.CreateCustomKeyBind(key,"+" + command);
    Game.AddCommand(
        "+" + command,
        () => {
            // do something 这个是按下的响应
            // $.Msg("+CreateCustomKeyBind");
            // bind_key_cast_ability(abi_index) 
            if (!normal_abi_isQuick || abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE) {
                bind_key_cast_nor_ability(abi_index)  //旧版本
            }else{
                OnExecuteAbilityButtonPressed(AbilityIndex) 
            }
        },
        ``,
        // 这个是必须的，否则保存js代码重载的时候会有 
        // FCVAR_LINKED_CONCOMMAND 的黄字报错
        1 << 32
        );
        Game.AddCommand(
            "-" + command,
            () => {
            $.Msg("-CreateCustomKeyBind");
            // do something 这个是弹起的响应
        },
        ``,
        1 << 32
        );
    }
    //改建 （大招）
    function EntryUltAbilityOnactivate() {
        var key = $("#Entry_ultAbility").text;
        if (key == " ") {
            $("#Entry_ultAbility").maxchars = "2"
            $("#Entry_ultAbility").text = "空格"
            $.Msg("space");
            key = "space"
        }
        const command = "WheelButton" + Math.floor(Math.random() * 99999999);
        const AbilityIndex = Entities.GetAbility( Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() ), ultabi_index)
        const abilityBehavior = Abilities.GetBehavior( AbilityIndex )
        $.Msg(abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE);
        $.Msg("abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE");
        Game.CreateCustomKeyBind(key,"+" + command);
        Game.AddCommand(
            "+" + command,
            () => {
                // do something 这个是按下的响应
                // bind_key_cast_ability(ultabi_index) 
                if (!ultmate_abi_isQuick || abilityBehavior & DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE) {
                    bind_key_cast_ult_ability(ultabi_index)  //旧版本
                }else{
                    OnExecuteAbilityButtonPressed(AbilityIndex) 
                }
        },
        ``,
        // 这个是必须的，否则保存js代码重载的时候会有 
        // FCVAR_LINKED_CONCOMMAND 的黄字报错
        1 << 32
        );
        Game.AddCommand(
            "-" + command,
            () => {
                $.Msg("-CreateCustomKeyBind");
                // do something 这个是弹起的响应
            },
        ``,
        1 << 32
    );
}

// 绑定的技能释放
function bind_key_cast_ability(ability_index) {
    $.Msg("bind_key_cast_ability")
    let queryUnit = Players.GetLocalPlayerPortraitUnit();
    // $.Msg(queryUnit)
    // $.Msg(ability_index)
    let cast_ability = Entities.GetAbility(queryUnit, ability_index);
    if (!Entities.IsControllableByPlayer(queryUnit, Players.GetLocalPlayer())) { return ;}
    //ExecuteAbility是激活技能的API，相当于鼠标左键点击一下技能
    if ($("#key_bind_label_1").BHasClass("quickcast_false")) {
        Abilities.ExecuteAbility(cast_ability, queryUnit, false); 
    }
}

// 绑定的小技能释放 ability_index是技能栏的位置
function bind_key_cast_nor_ability(ability_index) {
    $.Msg("bind_key_cast_nor_ability")
    let queryUnit = Players.GetLocalPlayerPortraitUnit();
    // $.Msg(queryUnit)
    $.Msg(ability_index)
    let cast_ability = Entities.GetAbility(queryUnit, ability_index);
    if (!Entities.IsControllableByPlayer(queryUnit, Players.GetLocalPlayer())) { return ;}
    //ExecuteAbility是激活技能的API，相当于鼠标左键点击一下技能
    Abilities.ExecuteAbility(cast_ability, queryUnit, false); 
}
// 绑定的大招释放
function bind_key_cast_ult_ability(ability_index) {
    $.Msg("bind_key_cast_ult_ability")
    let queryUnit = Players.GetLocalPlayerPortraitUnit();
    // $.Msg(queryUnit)
    $.Msg(ability_index)
    let cast_ability = Entities.GetAbility(queryUnit, ability_index);
    if (!Entities.IsControllableByPlayer(queryUnit, Players.GetLocalPlayer())) { return ;}
    //ExecuteAbility是激活技能的API，相当于鼠标左键点击一下技能
    Abilities.ExecuteAbility(cast_ability, queryUnit, false); 
}

//获取lua添加两个技能后的技能index位置，0就是第1个技能
GameEvents.Subscribe("omg_add_ability", Get_omg_add_ability);
function Get_omg_add_ability(params) {
    $.Msg("Get_omg_add_ability=====================---------------");
    $.Msg(params);
    abi_index = params["1"];
    ultabi_index = params["2"];
    $("#key_bind_box_id").visible = true
    $.Msg(abi_index);
    $.Msg(ultabi_index);
}

//隐藏技能按钮
function OnKeyBindButtonPressed(event) {
    var key_bind_hud = $("#key_bind_box_id")
    var key_bind_normal = $("#key_bind_box_normal")
    var key_bind_ultmate = $("#key_bind_box_ultmate")
    var visible_flag =  key_bind_normal.visible
    key_bind_normal.visible = !visible_flag
    key_bind_ultmate.visible = !visible_flag
}

//重置改建按钮
GameEvents.Subscribe("OMG_key_bind_hud_reset", OMG_key_bind_hud_reset);
function OMG_key_bind_hud_reset(params) {
    var key_bind_hud = $("#key_bind_box_id")
    var MyUI_OMG = $("#MyUI_OMG")
    abi_index = params["1"];
    ultabi_index = params["2"];
    MyUI_OMG.visible = false
    key_bind_hud.visible = true
    //隐藏输入栏
    // $("#key_TextEntry_box_nor").visible = false
    // $("#key_TextEntry_box_ult").visible = false
    $("#Entry_Ability_quick").visible = false
    $("#Entry_ultAbility_quick").visible = false
    $("#key_bind_text_panel").visible = false //隐藏提示栏
    //显示按钮
    $("#key_Label_box_nor").visible = true 
    $("#key_Label_box_execute_nor").visible = false
    $("#key_Label_box_ult").visible = true 
    $("#key_Label_box_execute_ult").visible = false
    //切换快速施法按钮颜色 
    $("#key_bind_label_1").RemoveClass("quickcast_false")
    $("#key_bind_label_1").AddClass("quickcast_true")
    $("#key_bind_label_2").RemoveClass("quickcast_false")
    $("#key_bind_label_2").AddClass("quickcast_true")

    
}

//绑定按键的快速施法模式
GameEvents.Subscribe("omg_bind_key_q", omg_bind_key_q);
function omg_bind_key_q(params) {
    var hero = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    var normal_abi = params[1]
    var ultmate_abi = params[2]
    $.Msg(`params[1] is ${params[1]}`)
    $.Msg(`params[2] is ${params[2]}`)
    $.Msg(b)
    $.Msg(`bind x dota_ability_quickcast${params[1]}1`)
    Game.ServerCmd('unbind x')
    Game.ServerCmd('unbind x')
    Game.ServerCmd('bind ' + x + ' dota_ability_quickcast'+ normal_abi + '1')
    Game.ServerCmd('bind ' + f + ' dota_ability_quickcast'+ ultmate_abi + '1')
}


// 隐藏CloseTextPanel()
function CloseTextPanel() {
    $.Msg("CloseTextPanel")
    $("#key_bind_text_panel").visible = false
}

// 点击以后隐藏普通施法按钮和普通输入栏，然后弹出玩家输入控制台的方法 
// function normal_quickcast(params) {
//     $("#key_Label_box_execute_nor").visible = false //隐藏普通施法按钮
//     $("#Entry_Ability").visible = false             //隐藏普通施法输入栏
//     $("#Entry_Ability_quick").visible = true       //显示快速施法输入栏
//     $("#key_TextEntry_box_nor").visible = true      //显示输入栏
//     var normal_panel = $("#key_bind_label_1")
//     //修改CSS样式
//     var key = $("#Entry_Ability_quick").text
//     if (key == " ") {
//         key = "space"
//         $("#Entry_Ability_quick").text = "空"
//     }else if (key == "") {
//         key = "按键"
//     }
//     if (normal_panel.BHasClass("quickcast_false")) {
//         normal_panel.RemoveClass("quickcast_false")
//         normal_panel.AddClass("quickcast_true")
//         // normal_abi_isQuick = true
//         $("#key_bind_text_panel").visible = true
//         $("#key_bind_text_label").text = "复制下列代码输入控制台(开启小技能快速施法)"
//         // $("#key_bind_TextEntry_1").text = "bind " + key + " dota_ability_quickcast " + abi_index + " 1"
//         $("#key_bind_TextEntry_1").text = `bind ${key} dota_ability_quickcast ${abi_index} 1`
//     }else if (normal_panel.BHasClass("quickcast_true")) {
//         normal_panel.RemoveClass("quickcast_true")
//         normal_panel.AddClass("quickcast_false")
//         // normal_abi_isQuick = false
//         $("#key_bind_text_panel").visible = true
//         $("#key_bind_text_label").text = "复制下列代码输入控制台(关闭小技能快速施法)"
//         $("#key_bind_TextEntry_1").text = "unbind " + key
//     }
// }
// function ultmate_quickcast(params) {
//     $("#key_Label_box_execute_ult").visible = false //隐藏大招普通施法按钮
//     $("#Entry_ultAbility").visible = false          //隐藏大招普通施法输入栏
//     $("#Entry_ultAbility_quick").visible = true    //显示大招快速施法输入栏
//     $("#key_TextEntry_box_ult").visible = true      //显示大招输入栏
//     var ultmate_panel = $("#key_bind_label_2")
//     //修改CSS样式
//     var key = $("#Entry_ultAbility_quick").text
//     if (key == " " || key == "空") {
//         key = "space"
//         $("#Entry_ultAbility_quick").text = "空"
//     }else if (key == "") {
//         key = "按键"
//     }
//     if (ultmate_panel.BHasClass("quickcast_false")) {
//         ultmate_panel.RemoveClass("quickcast_false")
//         ultmate_panel.AddClass("quickcast_true")
//         ultmate_abi_isQuick = true
//         $("#key_bind_text_panel").visible = true
//         $("#key_bind_text_label").text = "复制下列代码输入控制台(开启大招快速施法)"
//         // $("#key_bind_TextEntry_1").text = "bind " + key + " dota_ability_quickcast " + ultabi_index + " 1"
//         $("#key_bind_TextEntry_1").text = `bind ${key} dota_ability_quickcast ${ultabi_index} 1`
//     }else if (ultmate_panel.BHasClass("quickcast_true")) {
//         ultmate_panel.RemoveClass("quickcast_true")
//         ultmate_panel.AddClass("quickcast_false")
//         ultmate_abi_isQuick = false
//         $("#key_bind_text_panel").visible = true
//         $("#key_bind_text_label").text = "复制下列代码输入控制台(关闭大招快速施法)"
//         $("#key_bind_TextEntry_1").text = "unbind " + key
//     }
// }



//在dota_hud_TopBarHeroImage下面显示添加的技能
GameEvents.Subscribe("OMG_Show_Add_Abilities", OMG_Show_Add_Abilities);
function OMG_Show_Add_Abilities(params) {
    //params[1]是数据table，params[2]是英雄显示技能总数
    $.Msg("=============================")
    $.Msg(params)
    // $.Msg(params[1])
    // $.Msg(params[1][0])
    // $.Msg(params[1][0].hero_name)
    // $.Msg(params[1][0].nor_abi_name)
    // $.Msg(params[1][0].ult_abi_name)
    //循环params[2]次，有几个英雄就循环几次
    for (let index = 1; index <= params[2]; index++) {
        $.Msg(params[1][index])
        const player_id = params[1][index];
        var hero = params[1][index -1 ].hero_name
        var hero_id = params[1][index -1 ].hero_id
        var hero_name = hero.substring(14)
        var nor_abi_name = params[1][index -1 ].nor_abi_name
        var ult_abi_name = params[1][index -1 ].ult_abi_name
        var dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
        var dotaHud_child = dotaHud.FindChildrenWithClassTraverse("TopBarPlayerSlot")
        for (let index = 0; index < dotaHud_child.length; index++) {
            var element = dotaHud_child[index];
            var element_id = -1
            if (element.id[0] == "R") {
                //是博丽
                element_id = element.id[13]
            }else if (element.id[0] == "D") {
                //是守矢
                element_id = element.id[10]
            }
            if (element.BHasClass("NoTier") && hero_id == element_id) {
                var Hero_image = element.FindChildrenWithClassTraverse("TopBarHeroImage")
                var hero_image_panel = Hero_image[1]
                $.Msg(hero_image_panel.heroname)
                if (hero_name == hero_image_panel.heroname ) {
                    var nor_abi = $.CreatePanel("DOTAAbilityImage", hero_image_panel, "", {
                        "class":"",
                        html: "true",
                        selectionpos: "auto",
                        hittest: "true",
                        hittestchildren: "false",
                        abilityname: nor_abi_name,
                        onmouseover: "DOTAShowAbilityTooltip('" + nor_abi_name + "')",
                        onmouseout: "DOTAHideAbilityTooltip()",
                    });
                    nor_abi.style.marginTop = "20px"
                    nor_abi.style.marginLeft = "5px"
                    nor_abi.style.border = "1px solid #ffffff"
                    var ult_abi = $.CreatePanel("DOTAAbilityImage", hero_image_panel, "", {
                        "class":"",
                        html: "true",
                        selectionpos: "auto",
                        hittest: "true",
                        hittestchildren: "false",
                        abilityname: ult_abi_name,
                        onmouseover: "DOTAShowAbilityTooltip('" + ult_abi_name + "')",
                        onmouseout: "DOTAHideAbilityTooltip()",
                    });
                    ult_abi.style.marginTop = "20px"
                    ult_abi.style.marginLeft = "47px"
                    ult_abi.style.border = "1px solid #ffffff"
                    break
                }
            }
        }
    }
}

