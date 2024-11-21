"use strict";
var hero_data  = {}
var local_hero_list = {}
var local_abi_list = {}
var local_ult_list = {}



// GameEvents.Subscribe("OMG_CSX", OMG_CSX);
GameEvents.Subscribe("aaa_test", aaa_test);
GameEvents.Subscribe("lua_to_js_to_lua", auto_add_hero_and_abilities);
function auto_add_hero_and_abilities() {
    // GameEvents.SendCustomGameEventToServer("transfer_OMG_data", hero_data);
    
    //测试按钮，测试时间到了以后给玩家选定的英雄，返回英雄
    const Final_playerID = Game.GetLocalPlayerID()
    const load_data = {Final_playerID,hero_data}
    // hero_data[1] = "npc_dota_hero_slark"
    // hero_data[2] = "ability_thdots_parsee01"
    // hero_data[3] = "ability_thdots_parsee04"
    if (hero_data[1] == null) {
        let randomInt = Math.floor(Math.random() * 6) + 1;
        hero_data[1] = local_hero_list[randomInt]
    }
    if (hero_data[2] == null) {
        let randomInt = Math.floor(Math.random() * 8) + 1;
        hero_data[2] = local_abi_list[randomInt]
    }
    if (hero_data[3] == null) {
        let randomInt = Math.floor(Math.random() * 8) + 1;
        hero_data[3] = local_ult_list[randomInt]
    }
    $.Msg(load_data)
    GameEvents.SendCustomGameEventToServer("_Player_set_hero", {load_data});
    $("#all_box").visible =false
}

function OMG_CSX(data) {
    // $.Msg(data);
    // $.Msg(Game.GetLocalPlayerInfo())
    $.Msg("OMG_CSXOMG_CSXOMG_CSXOMG_CSXOMG_CSXOMG_CSX");
    let queryUnit = Players.GetLocalPlayerPortraitUnit();
    // $.Msg(queryUnit)
    // $.Msg(ability_index)
    let cast_ability = Entities.GetAbility(queryUnit, 0);
    $.Msg(cast_ability)
    if (!Entities.IsControllableByPlayer(queryUnit, Players.GetLocalPlayer())) { return ;}
    //ExecuteAbility是激活技能的API，相当于鼠标左键点击一下技能
    Abilities.ExecuteAbility(cast_ability, queryUnit, true); 
}

function omg_load_hero() {
    $.Msg("omg_load_hero()");
    
    hero_data[1] = "npc_dota_hero_slark"
    hero_data[2] = "ability_thdots_parsee01"
    hero_data[3] = "ability_thdots_parsee04"
    // GameEvents.SendCustomGameEventToServer("omg_load_hero", hero_data);
    // $("#box_1").visible = false
    
}

function aaa_test (data){
    // GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ELEMENT_COUNT, false );
    $.Msg(data)
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    const aim_panel =  dotaHud.FindChildTraverse("HeroImageOverlay")
    $.Msg(aim_panel)
    
    
}

// 创建一个模版，模版是player的竖版，里面有小盒子，然后分别在小盒子里放相应的东西
function Player_box(data) {
    $.Msg("Player_box()==================")
    // 创建一个总板
    // const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    // const MyUI_OMG = $.CreatePanel("Panel", dotaHud, "")
    // MyUI_OMG.AddClass("all_box")
    var all_box = $.CreatePanel("Panel", $.GetContextPanel(), "all_box")
    all_box.AddClass("all_box")
    all_box.style.width = Game.GetScreenWidth() + "px"
    all_box.SetPanelEvent("onactivate", function () {
        // all_box.visible = false
    })

    // 创建一个Player_box,Player_box是单独的竖版
    var Player_box = $.CreatePanel("Panel",all_box,"Player_box_1")
    Player_box.AddClass("Player_box")
    Create_Player_box(Player_box,data)
}

// Player_box板初始化
function Create_Player_box(parent,data){
    // $.Msg(parent)

    var playerid = Game.GetLocalPlayerID()
    var player_box_index = playerid
    var my_player_data = $.CreatePanel("Panel",parent,"my_player_data" + player_box_index)
    my_player_data.AddClass("my_player_data")
    var show_box = $.CreatePanel("Panel",parent,"show_box" + player_box_index)
    show_box.AddClass("show_box")
    var select_box = $.CreatePanel("Panel",parent,"select_box" + player_box_index)
    select_box.AddClass("select_box")
    // var swap_button = $.CreatePanel("Button",parent,"swap_button" + player_box_index) //绑定交换英雄按钮
    // swap_button.AddClass("swap_button")
    var enemy_player_data = $.CreatePanel("Panel",parent,"enemy_player_data" + player_box_index)
    enemy_player_data.AddClass("enemy_player_data")


    Create_my_player_data(my_player_data)//初始化my_player_data
    Create_show_box(show_box)//初始化show_box
    Create_select_box(select_box,data)//初始化select_box
    // Create_swap_button(swap_button,data)//给Button绑定交换函数
    
    // my_player_data版初始化,显示玩家的头像与ID
    function Create_my_player_data(parent) {
        // 获取id
        const player_steamid = Game.GetLocalPlayerInfo().player_steamid

        //获取头像
        var avatar = $.CreatePanel("DOTAAvatarImage", parent, "username_player_" + player_steamid);
        avatar.steamid = player_steamid;
        avatar.AddClass("AvatarImage");
        // avatar.style.className = "AvatarImage";
        
        // 获取名字
        var usernamePanel = $.CreatePanel("DOTAUserName", parent, " ");
        usernamePanel.AddClass("Player_box_element");
        usernamePanel.steamid = player_steamid;
    }


    // show_box板初始化
    function Create_show_box(parent){
        // hero_img_box放英雄头像，英雄被点击的时候需要更换
        var hero_img_box = $.CreatePanel("Panel",parent,"hero_img_box" + player_box_index)
        hero_img_box.AddClass("hero_img_box")

        // ability_info英雄名称和选中技能
        var ability_info = $.CreatePanel("Panel",parent,"ability_info" + player_box_index)
        ability_info.AddClass("ability_info")
        //ability_info初始化
        Create_ability_info(ability_info)


        // $.CreatePanel("DOTAHeroImage", hero_img_box, "", {
        //     "class": "hero_image_portrait",
        //     html: "true",
        //     selectionpos: "auto",
        //     hittest: "true",
        //     hittestchildren: "false",
        //     heroname: "npc_dota_hero_axe",
        //     heroimagestyle: "portrait",
        //     // onmouseover: element,
        //     // onmouseout: element,
        // })



    }
    // ability_info板初始化
    function Create_ability_info(parent){
        var hero_name = $.CreatePanel("Panel",parent,"hero_name" + player_box_index)
        hero_name.AddClass("hero_name")
        const hero_name_label = $.CreatePanel("Label",hero_name,"hero_name_label" + player_box_index)
        hero_name_label.AddClass("sub_label")


        var show_ability_box = $.CreatePanel("Panel",parent,"show_ability_box" + player_box_index)
        show_ability_box.AddClass("show_ability_box")
        const show_ability_box_1 =  $.CreatePanel("Panel", show_ability_box, "show_ability_box_1_" + player_box_index)
        const show_ability_box_2 =  $.CreatePanel("Panel", show_ability_box, "show_ability_box_2_" + player_box_index)
        show_ability_box_1.AddClass("ability")
        show_ability_box_2.AddClass("ability")
        // Create_show_ability_box(parent)
        // show_ability_box初始化

        // hero_img_box切换show_ability_box初始化   
    }
    
    // select_box板初始化
    function Create_select_box(parent,data){
        var div_1 = $.CreatePanel("Panel",parent,"div_1" + player_box_index)
        div_1.AddClass("div_1")
        var div_2 = $.CreatePanel("Panel",parent,"div_2" + player_box_index)
        div_2.AddClass("div_2")
        var div_3 = $.CreatePanel("Panel",parent,"div_3" + player_box_index)
        div_3.AddClass("div_3")

        //传入英雄List,小技能List,大招list
        craete_div_1(div_1,data[1])
        craete_div_2(div_2,data[2])
        craete_div_3(div_3,data[3])
    }
    // swap_button交换英雄按钮
    function Create_swap_button(button) {
        const Label = $.CreatePanel("Label", button , "button_Label")
        Label.text = "交换英雄"
        
        button.SetPanelEvent("onactivate", function () {
            //点击以后首先确认按钮id的状态，如果正在交换中，则return，如果未交换，则弹出是否交换按钮

        })
    }
    
    
    // 简单的初始化点击
    $.Msg("初始化点击")
    // var test_panel = $("#show_ability_box" + player_box_index)
    // create_abi_img(test_panel,"ability_thdots_hina01")
    // create_abi_img(test_panel,"ability_thdots_hina04")
    // var test_hero_name = $("#hero_name" + player_box_index)
    // var test_label_text = "null"
    // var hero_name_label = $.CreatePanel("Label",test_hero_name,"hero_name_label" + player_box_index)
    // hero_name_label.text = test_label_text
    function create_abi_img(parent,ability_name) {
        const create_abi = $.CreatePanel("DOTAAbilityImage", parent, "", {
            "class": "ability",
            html: "true",
            selectionpos: "auto",
            hittest: "true",
            hittestchildren: "false",
            abilityname: ability_name,
            onmouseover: "DOTAShowAbilityTooltip('" + ability_name + "')",
            onmouseout: "DOTAHideAbilityTooltip()",
        });
        return create_abi
    }
    
    function craete_div_1(parent,hero_list) {
        $.Msg("craete_div_1")
        $.Msg(hero_list[1])
    
        const Label = $.CreatePanel("Label",parent,"")
        Label.AddClass("sub_label")
        Label.text = "少女";
    
        for (let int = 1; int < 7; int++) {
            const element = hero_list[int];
            local_hero_list[int] = element
            // $.Msg(element)
            const create_hero_img = $.CreatePanel("DOTAHeroImage", parent, "", {
                "class": "hero_image",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                heroname: element,
                heroimagestyle: "landscape",
                // onmouseover: element,
                // onmouseout: element,
            });
            if (create_hero_img) {
                //修改英雄图标，但是图标未编译不生效
                // $.Msg(int);
                create_hero_img.SetPanelEvent("onactivate", function () {
                    //鼠标点击添加边框，checked = ture；同时其他小英雄取消边框 checked = false。
                    for (let index = 1; index < 7; index++) {
                        
                        // $.Msg(index);
                        parent.GetChild(index).RemoveClass("select_hero");
                        parent.GetChild(index).checked = false;
                    }
                    create_hero_img.AddClass("select_hero");
                    // parent.GetChild(int).checked = true;
                    $.Msg(element + " is checked.");
                    // 点击修改hero_img_box里的图片
                    const hero_img_box = $("#hero_img_box" + player_box_index)
                    hero_img_box.RemoveAndDeleteChildren()
                    $.CreatePanel("DOTAHeroImage", hero_img_box, "", {
                        "class": "hero_image_portrait",
                        html: "true",
                        selectionpos: "auto",
                        hittest: "true",
                        hittestchildren: "false",
                        heroname: element,
                        heroimagestyle: "portrait"
                    })
                    // 修改hero_name里的英雄的信息
                    $("#hero_name_label" + player_box_index).text = $.Localize(`#${element}`)
                    hero_data[1] = element
                })
            }
        }
    }
    
    
    // hero_img_box切换英雄头像方法
    // function change_hero_img_box(hero_img_box,element) {
    //     hero_img_box.RemoveAndDeleteChildren()
    //     var notification = $.CreatePanel("DOTAHeroImage", hero_img_box, "hero_img_box" + player_box_index)
    //     notification.heroimagestyle = "portrait";
    //     notification.heroname = element;
    //     notification.hittest = true;
    
    // }
    
    function craete_div_2(parent,abi_list) {
        // $.Msg("craete_div_2")
        const Label = $.CreatePanel("Label",parent,"")
        Label.AddClass("sub_label")
        Label.text = "普通技能";
        for (let int = 1; int < 9; int++) {
            const element = abi_list[int];
            local_abi_list[int] = element
            // $.Msg(element);
            const create_abi = $.CreatePanel("DOTAAbilityImage", parent, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                abilityname: element,
                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });
            if (create_abi) {
                //修改技能图标，但是图标未编译不生效
                // $.Msg(int);
                create_abi.SetPanelEvent("onactivate", function () {
                    //鼠标点击添加边框，checked = ture；同时其他小技能取消边框 checked = false。
                    for (let index = 1; index < 9; index++) {
                        
                        // $.Msg(index);
                        parent.GetChild(index).RemoveClass("select_ability");
                        parent.GetChild(index).checked = false;
                    }
                    create_abi.AddClass("select_ability");
                    // parent.GetChild(int).checked = true;
                    $.Msg(element + "is checked.");
                    // 点击修改hero_img_box里的图片
                    const show_ability_box_1_ = $("#show_ability_box_1_" + player_box_index)
                    show_ability_box_1_.RemoveAndDeleteChildren()
                    $.CreatePanel("DOTAAbilityImage", show_ability_box_1_, "", {
                        "class": "ability",
                        html: "true",
                        selectionpos: "auto",
                        hittest: "true",
                        hittestchildren: "false",
                        abilityname: element,
                        onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                        onmouseout: "DOTAHideAbilityTooltip()",
                    });
                    hero_data[2] = element
                })
            }
        }
    }
    
    function craete_div_3(parent,ult_list) {
        // $.Msg("craete_div_3")
        const Label = $.CreatePanel("Label",parent,"")
        Label.AddClass("sub_label")
        Label.text = "终极技能";
        for (let int = 1; int < 9; int++) {
            const element = ult_list[int];
            local_ult_list[int] = element
            // $.Msg(element);
            const create_abi = $.CreatePanel("DOTAAbilityImage", parent, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                abilityname: element,
                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });
            if (create_abi) {
                //修改技能图标，但是图标未编译不生效
                // $.Msg(int);
                create_abi.SetPanelEvent("onactivate", function () {
                    //鼠标点击添加边框，checked = ture；同时其他小技能取消边框 checked = false。
                    for (let index = 1; index < 9; index++) {
                        
                        // $.Msg(index);
                        parent.GetChild(index).RemoveClass("select_ability");
                        parent.GetChild(index).checked = false;
                    }
                    create_abi.AddClass("select_ability");
                    // parent.GetChild(int).checked = true;
                    $.Msg(element + "is checked.");
                    // 点击修改hero_img_box里的图片
                    const show_ability_box_2_ = $("#show_ability_box_2_" + player_box_index)
                    show_ability_box_2_.RemoveAndDeleteChildren()
                    $.CreatePanel("DOTAAbilityImage", show_ability_box_2_, "", {
                        "class": "ability",
                        html: "true",
                        selectionpos: "auto",
                        hittest: "true",
                        hittestchildren: "false",
                        abilityname: element,
                        onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                        onmouseout: "DOTAHideAbilityTooltip()",
                    });
                    hero_data[3] = element
                })
            }
        }
    }
    
}


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
        var hero_name = hero.substring(14)
        var nor_abi_name = params[1][index -1 ].nor_abi_name
        var ult_abi_name = params[1][index -1 ].ult_abi_name
        var dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
        var dotaHud_child = dotaHud.FindChildrenWithClassTraverse("TopBarPlayerSlot")
        for (let index = 0; index < dotaHud_child.length; index++) {
            var element = dotaHud_child[index];
            if (element.BHasClass("NoTier")) {
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
                }
            }
        }
    }
}



