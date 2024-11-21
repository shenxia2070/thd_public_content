"use strict";
if (all_hero_data == null) {
    $.Msg("===============总表初始化================")
    var all_hero_data = {}   //总表，hero_data[id]里有[hero][abi][ult]三个参数，传到lua里直接通过id给玩家分配英雄和技能
    var hakurei_ban_data  = {} //私人client的临时table，每次点击后传到lua
    var moriya_ban_data  = {}
    var All_list = {} //存储所有的data，用来给没结束后选择的玩家随机
    var hakurei_team = {}
    var moriya_team = {}
    var hakurei_box_data = {}
    var moriya_box_data = {}
    var BP_state = 1 //bp阶段，1是ban人阶段，2是选人阶段 
    var First_init = true
}


GameEvents.Subscribe("OMG_CSX", OMG_CSX); //测试
GameEvents.Subscribe("OMG_c", OMG_c); //测试
// GameEvents.Subscribe("show_playerid", show_playerid); //测试
GameEvents.Subscribe("Send_change_Table", Send_change_Table);
GameEvents.Subscribe("OMG_player_connect_full", OMG_player_connect_full);
GameEvents.Subscribe("Add_ban_list", Add_ban_list);
GameEvents.Subscribe("other_flash", other_flash);
GameEvents.Subscribe("invis_aim_panel", invis_aim_panel);
GameEvents.Subscribe("Create_BP_UI", Create_BP_UI);
GameEvents.Subscribe("OMG_BP_player_init", OMG_BP_player_init);
GameEvents.Subscribe("Show_BP_display", Show_BP_display);
GameEvents.Subscribe("change_state", change_state);
GameEvents.Subscribe("close_BP_UI", close_BP_UI);
 

function OMG_player_connect_full(data) {
    $.Msg(`有玩家连接游戏，ID是${data[1]}，如果ID是-1，就说明是观战者`)
    $.Msg(data)
    //对重连的玩家进行面板的初始化。获取LUA储存的BP信息
    
    
}


function OMG_c(data) {
    $.Msg("Occccccccccccccccccccc");
    $.Msg(all_hero_data)
    $.Msg(hakurei_ban_data)
    $.Msg(moriya_ban_data)
    $.Msg(All_list)
    $.Msg(hakurei_team)
    $.Msg(moriya_team)
    $.Msg(hakurei_box_data)
    $.Msg(moriya_box_data)
    $.Msg(BP_state)
    Show_BP_display()
}

function OMG_CSX(data) {
    $.Msg("OMG_CSXOMG_CSXOMG_CSXOMG_CSXOMG_CSXOMG_CSX");
    $.Msg(all_hero_data)
    // $.Msg("显示队伍列表和名字");
    // for (let index = 1; index < 7; index++) {
    //     if (data[1]["Hakurei_id"][index] != null) {
    //         $.Msg(`博丽${index}号名字是 ：${Players.GetPlayerName(data[1]["Hakurei_id"][index])}`);
    //     }
    // }
    // for (let index = 1; index < 7; index++) {
    //     if (data[1]["Moriya_id"][index] != null) {
    //         $.Msg(`守矢${index}号名字是 ：${Players.GetPlayerName(data[1]["Moriya_id"][index])}`);
    //     }
    // }
    // $.Msg("显示JS里的队伍列表和名字");
    // for (let index = 1; index < 6; index++) {
    //     $.Msg(`博丽${index}号名字是 ：${Players.GetPlayerName(hakurei_team[index])}`);
    // }
    // for (let index = 1; index < 6; index++) {
    //     $.Msg(`守矢${index}号名字是 ：${Players.GetPlayerName(moriya_team[index])}`);
    // }
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    dotaHud.FindChildTraverse("HeaderCenter").visible = true
    dotaHud.FindChildTraverse("RadiantTeamPlayers").visible = false
    dotaHud.FindChildTraverse("DireTeamPlayers").visible = false
    dotaHud.FindChildTraverse("HeroModelLoadout").visible = false
    dotaHud.FindChildTraverse("SelectedHeroDetails").visible = false  
    dotaHud.FindChildTraverse("SelectedHeroAbilitiesHitTargets").visible = false  
    dotaHud.FindChildTraverse("HeroRelicsContainer").visible = false  
    dotaHud.FindChildTraverse("StrategyHeroBadge").visible = false  
    const test = dotaHud.FindChildTraverse("ContextMenuManager") //隐藏下拉菜单，禁止交换英雄
    test.visible = false
    $.Msg(test)
    // 延迟1秒隐藏下拉菜单，禁止交换英雄
    $.Schedule(2, function () {
        $.Msg("延迟1秒隐藏下拉菜单，禁止交换英雄")
    })
}



function change_state() {
    $.Msg("change_state()")
    BP_state = 2
    GameEvents.SendCustomGameEventToServer("change_state", {BP_state: BP_state});
    if (Game.GetLocalPlayerInfo() == null) {
        return
    }
    // 选人阶段,收集对方的BAN人数据，传递给自己的面板
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    var BP_HUD = dotaHud.FindChildTraverse("BP_HUD")
    const GameModeLabel = dotaHud.FindChildTraverse("GameModeLabel")
    GameModeLabel.text = "选人阶段"

    //若是博丽就传入守矢ban掉的数据，否则相反
    if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS) {
        //6个Player_box面板  index
        for (let index = 1; index < 6; index++) {
            for (let type = 1; type < 4; type++) {
                // $.Msg($("#div_1" + type))
                let div = $("#div_" + type + index);
                //首先清除自己ban掉的数据
                // $.Msg(div)
                for (let number = 1; number < div.GetChildCount(); number++) {
                    const element = div.GetChild(number);
                    element.checked = false
                    element.RemoveClass("banned")
                }
                if (moriya_ban_data[index][type] != null) {
                    div.GetChild(moriya_ban_data[index][type]).checked = true
                    div.GetChild(moriya_ban_data[index][type]).AddClass("banned")
                }
            }
        }
    }else if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_BADGUYS) {
        for (let index = 1; index < 6; index++) {
            for (let type = 1; type < 4; type++) {
                let div = $("#div_" + type + index);
                //首先清除自己ban掉的数据
                for (let number = 1; number < div.GetChildCount(); number++) {
                    const element = div.GetChild(number);
                    element.checked = false 
                    element.RemoveClass("banned")
                }
                if (hakurei_ban_data[index][type] != null) {
                    div.GetChild(hakurei_ban_data[index][type]).checked = true
                    div.GetChild(hakurei_ban_data[index][type]).AddClass("banned")
                }
            }
        }
    }else{
        return
    }
    //然后清除Player_show_box里残留的动画
    for (let index = 0; index < 6; index++) {
        const element = $("#show_box" + index)
        if (element) {
           $("#hero_img_box" + index).RemoveAndDeleteChildren()
           $("#hero_name_label" + index).text = ""
           $("#show_ability_box_1_" + index).RemoveAndDeleteChildren()
           $("#show_ability_box_2_" + index).RemoveAndDeleteChildren()
        }
    }
}

//单独为掉线玩家创建面板
function OMG_BP_player_init(data) {
    $.Msg("OMG_BP_player_init()")
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    $.Msg(data);
    $.Msg(data[2]);
    $.Msg(data[2]["hakurei_ban_data"]);
    $.Msg(data[2]["moriya_ban_data"]);
    $.Msg(data[2]["hakurei_pick_data"]);
    $.Msg(data[2]["moriya_pick_data"]); 
    const aim_panel =  dotaHud.FindChildTraverse("HeroPickScreenContents")
    const aim_panel_2 =  dotaHud.FindChildTraverse("FriendsAndFoes")
    const aim_panel_3 =  dotaHud.FindChildTraverse("PreMinimapContainer")
    dotaHud.FindChildTraverse("ContextMenuManager").visible = false
    aim_panel.visible = false
    aim_panel_2.visible = false
    aim_panel_3.visible = false
    const GameModeLabel = dotaHud.FindChildTraverse("GameModeLabel")
    GameModeLabel.text = "ban人阶段"

    //初始化BP_HUD,只创建一个面板，其余改变都用数据传输
    var BP_HUD = dotaHud.FindChildTraverse("BP_HUD")
    BP_HUD.AddClass("BP_HUD_box") 
    // BP_HUD.style.width = Game.GetScreenWidth() + "px"
    $.Msg(Game.GetScreenWidth())

    //判定双方玩家数量，分配玩家id，表单初始化
    for (let index = 1; index < 6; index++) {
        hakurei_ban_data[index] = data[2]["hakurei_ban_data"]
        moriya_ban_data[index] = data[2]["moriya_ban_data"]
        hakurei_box_data[index] = {}  //这个表是用来储存博丽盒子数据 hakurei_box_data[1,2,3,4,5]代表5个盒子，每个盒子装一个id，用来判断自己的队伍
        moriya_box_data[index] = {}  //这个表是用来储存守矢盒子数据
        All_list = data[1]              //存储所有的data，用来给没结束后选择的玩家随机

        if (data[2]["Hakurei_id"][index] != null) {
            hakurei_team[index] = data[2]["Hakurei_id"][index]
            hakurei_box_data[index] = data[2]["Hakurei_id"][index]
        }else{
            hakurei_team[index] = -1
        }
        if (data[2]["Moriya_id"][index] != null) {
            moriya_team[index] = data[2]["Moriya_id"][index]
            moriya_box_data[index] = data[2]["Moriya_id"][index]
        }else{
            moriya_team[index] = -1
        }
        // 为玩家创建一个版面，然后这个版面只能自己看到，通过别的玩家事件修改面板
        const element = data[1][index];
        // $.Msg(element)
        Player_box(BP_HUD,element,index,Game.GetLocalPlayerInfo().player_team_id)
    }
    
    all_hero_data = data[2]["all_hero_data"]

    //面板图片修改
    // 首先判断队伍
    var team = {}
    var ban_data = {}
    if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS) {
        team = hakurei_team
        ban_data = data[2]["hakurei_ban_data"]
    }else if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_BADGUYS){
        team = moriya_team
        ban_data = data[2]["moriya_ban_data"]
    }else{
        return
    }
    for (let index = 1; index < 6; index++) {
        //判断state
        if (BP_state == 1) {
            const hero_img_box = $("#hero_img_box" + index)
            const show_ability_box_1 = $("#show_ability_box_1_" + index)
            const show_ability_box_2 = $("#show_ability_box_2_" + index)
            const hero_element = data[1][index][ban_data[index]["1"]]
            const abi_element = data[1][index][ban_data[index]["2"]]
            const ult_element = data[1][index][ban_data[index]["3"]]
            hero_img_box.RemoveAndDeleteChildren()
            show_ability_box_1.RemoveAndDeleteChildren()
            show_ability_box_2.RemoveAndDeleteChildren()
            $.CreatePanel("DOTAHeroMovie", hero_img_box, "", {
                class: "hero_image_portrait",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                heroname: hero_element,
                heroimagestyle: "portrait"
            })

            // var movie = $.CreatePanel( 'DOTAHeroMovie', hero_img_box, '' );
            // $('#heroMovie').heroname = hero_element;



            // 修改hero_name里的英雄的信息
            $("#hero_name_label" + div_index).text = $.Localize(`#${hero_element}`)
            //修改小技能
            $.CreatePanel("DOTAAbilityImage", show_ability_box_1, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                abilityname: abi_element,
                onmouseover: "DOTAShowAbilityTooltip('" + abi_element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });
            //修改大招
            $.CreatePanel("DOTAAbilityImage", show_ability_box_2, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false", 
                abilityname: ult_element,
                onmouseover: "DOTAShowAbilityTooltip('" + ult_element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });
        }
    }
}

function Show_BP_display() {  
    $.Msg("Show_BP_display()")
    var local_team = Game.GetLocalPlayerInfo().player_team_id
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    // GameEvents.SendCustomGameEventToServer("transfer_OMG_data", hero_data);
    //测试按钮，测试时间到了以后给玩家选定的英雄，返回英雄
    //判断flag，执行一个面板操作
    const Final_playerID = Game.GetLocalPlayerID()
    if (Players.IsSpectator(Game.GetLocalPlayerID()) == true) {
        return
    }
    $.Msg(all_hero_data)
    if (all_hero_data[Final_playerID]["flag"]) {
        all_hero_data[Final_playerID]["flag"] = false
        var hero_data = {}
        hero_data = all_hero_data[Final_playerID]
        if (all_hero_data[Final_playerID] == null) {
            return
        }
        const load_data = {Final_playerID,hero_data}
        //先判断玩家处于哪一个盒子
        for (let index = 1; index < 6; index++) {
            if (hakurei_box_data[index] == Final_playerID) {
                //是博丽的第index个盒子
                for (let type = 1; type < 4; type++) {
                    if (hero_data[type] == null) {
                        let randomInt = Math.floor(Math.random() * 6) + 1;
                        // while (randomInt = hakurei_ban_data[index]) {
                        //     randomInt = Math.floor(Math.random() * 6) + 1;
                        // }
                        hero_data[type] = All_list[index][type][randomInt]
                    }
                }
            }else if (moriya_box_data[index] == Final_playerID) {
                $.Msg("是守矢的第index个盒子")
                //是守矢的第index个盒子
                for (let type = 1; type < 4; type++) {
                    if (hero_data[type] == null) {
                        let randomInt = Math.floor(Math.random() * 6) + 1;
                        // while (randomInt = moriya_ban_data[index]) {
                        //     randomInt = Math.floor(Math.random() * 6) + 1;
                        // }
                        hero_data[type] = All_list[index][type][randomInt]
                    }
                }
            }
         }
         //  新操作，隐藏选人界面，显示双方选人面板
        show_enemy_UI(all_hero_data)
         
         GameEvents.SendCustomGameEventToServer("_Player_set_hero", {load_data});
        //  dotaHud.FindChildTraverse("BP_HUD").visible = false
         dotaHud.FindChildTraverse("RadiantTeamPlayers").visible = false
         dotaHud.FindChildTraverse("DireTeamPlayers").visible = false
         dotaHud.FindChildTraverse("AvailableItemsContainer").visible = false
         $.Msg(`game.GetAllPlayerIDs() is ${Game.GetAllPlayerIDs()}`)
         $.Msg(`all_hero_data is ${all_hero_data}`)

    }

} 

function show_enemy_UI(data) {
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    const HUD = dotaHud.FindChildTraverse("BP_HUD")
    dotaHud.FindChildTraverse("RightContainerMain").visible = false
    dotaHud.FindChildTraverse("HeroModelLoadout").visible = false
    dotaHud.FindChildTraverse("SelectedHeroDetails").visible = false
    dotaHud.FindChildTraverse("SelectedHeroAbilitiesHitTargets").visible = false  
    dotaHud.FindChildTraverse("HeroRelicsContainer").visible = false  
    dotaHud.FindChildTraverse("StrategyHeroBadge").visible = false  
    dotaHud.FindChildTraverse("BacktoHeroGrid").visible = false  
    dotaHud.FindChildTraverse("SkipIntoGame").visible = false    
    for (let index = 1; index < 6; index++) {
        const select_box  = HUD.FindChildTraverse("select_box" + index)
        select_box.visible = false

        const enemy_show_box  = HUD.FindChildTraverse("enemy_show_box" + index)
        enemy_show_box.visible = true

        const my_player_data  = HUD.FindChildTraverse("my_player_data" + index)
        my_player_data.style.marginTop = "20%"

        const enemy_player_data  = HUD.FindChildTraverse("enemy_player_data" + index)
        enemy_player_data.style.marginTop = "15px"
    }
}

function close_BP_UI() {
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    dotaHud.FindChildTraverse("BP_HUD").visible = false
    dotaHud.FindChildTraverse("ContextMenuManager").visible = true
}

function invis_aim_panel() {
    $.Msg("invis_aim_panel()");
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    dotaHud.FindChildTraverse("HeroPickScreenContents").visible = false
    dotaHud.FindChildTraverse("FriendsAndFoes").visible = false
    dotaHud.FindChildTraverse("PreMinimapContainer").visible = false
    dotaHud.FindChildTraverse("ContextMenuManager").visible = false //隐藏右键菜单，禁止交换英雄
}

function Create_BP_UI(data) {
    $.Msg("Create_BP_UI(data)");
    $.Msg(Players.IsSpectator(Game.GetLocalPlayerID()));
    BP_state = data[2]["BP_state"]
    $.Msg("BP_state")
    $.Msg(BP_state)
    if (Players.IsSpectator(Game.GetLocalPlayerID()) == true) {
        return
    }
    invis_aim_panel()
    const dotaHud = $.GetContextPanel().GetParent().GetParent().GetParent().GetParent()
    const GameModeLabel = dotaHud.FindChildTraverse("GameModeLabel")
    GameModeLabel.text = "ban人阶段"

    //初始化BP_HUD,只创建一个面板，其余改变都用数据传输
    var BP_HUD = dotaHud.FindChildTraverse("BP_HUD")
    BP_HUD.AddClass("BP_HUD_box") 
    // BP_HUD.style.width = Game.GetScreenWidth() + "px"
    $.Msg(Game.GetScreenWidth())

    //判定双方玩家数量，分配玩家id，表单初始化
    for (let index = 1; index < 6; index++) {
        hakurei_ban_data[index] = {}
        moriya_ban_data[index] = {}
        hakurei_box_data[index] = {}  //这个表是用来储存博丽盒子数据 hakurei_box_data[1,2,3,4,5]代表5个盒子，每个盒子装一个id，用来判断自己的队伍
        moriya_box_data[index] = {}  //这个表是用来储存守矢盒子数据
        All_list = data[1]              //存储所有的data，用来给没结束后选择的玩家随机

        if (First_init) {
            //只执行一次
            // $.Msg("只执行一次")
            if (data[2]["Hakurei_id"][index] != null) {
                hakurei_team[index] = data[2]["Hakurei_id"][index]
                hakurei_box_data[index] = data[2]["Hakurei_id"][index]
            }else{
                hakurei_team[index] = -1
            }
            if (data[2]["Moriya_id"][index] != null) {
                moriya_team[index] = data[2]["Moriya_id"][index]
                moriya_box_data[index] = data[2]["Moriya_id"][index]
            }else{
                moriya_team[index] = -1
            }
            $.Msg(`博丽  ${index}号ID是${hakurei_team[index]}, 名字是 ：${Players.GetPlayerName(hakurei_team[index])}`);
            $.Msg(`守矢  ${index}号ID是${moriya_team[index]} ,名字是 ：${Players.GetPlayerName(moriya_team[index])}`);
        }
        
        // 为玩家创建一个版面，然后这个版面只能自己看到，通过别的玩家事件修改面板
        Player_box(BP_HUD,data[1][index],index,Game.GetLocalPlayerInfo().player_team_id)
    }
    First_init =false
    
    const all_ids = Game.GetAllPlayerIDs()
    for (let index = 0; index < all_ids.length; index++) {
        //总表初始化
        all_hero_data[all_ids[index]] = {}
        all_hero_data[all_ids[index]]["flag"] = true
    }
}

//创建5个竖版，然后建立10个序号，其中1-5是博丽，6-10是守矢
//10个玩家分别对应10个序号，在my_player_data里显示玩家的ID和名字
//在BAN人阶段，每次玩家点击都会返回一个数组到Lua,储存给游戏的Table
//然后分发给相同组的成员，修改他们的面板
//选人阶段也一样
//然后通过Table储存的数据给玩家分配英雄

// 创建一个模版，模版是player的竖版，里面有小盒子，然后分别在小盒子里放相应的东西
function Player_box(parent,data,index,team) {
    // $.Msg("Player_box()-------------------")

    // 创建一个Player_box,Player_box是单独的竖版
    var Player_box = $.CreatePanel("Panel",parent,"Player_box_" + index)
    Player_box.AddClass("Player_box") 
    const screen_width = Game.GetScreenWidth()
    const screen_height = Game.GetScreenHeight()
    const scale = screen_width / screen_height
    var margin_left = 22 * scale
    if (scale == 1.6) {
        margin_left = 10
    }else if (screen_width == 3440 && screen_height == 1440) {
        margin_left = 100
    }
    // $.Msg(`玩家${Players.GetPlayerName(Game.GetLocalPlayerID())}的分辨率是 ：${screen_width}*${screen_height},margin_left是${margin_left}`);  
    Player_box.style.marginLeft = margin_left + "px" // 根据屏幕分辨率设置间距
    Player_box.style.marginRight = margin_left + "px" // 根据屏幕分辨率设置间距

    Create_Player_box(Player_box,data,index,team)
}

/**
 * 创建Player_box,Player_box是竖版,里面有小盒子,分别在小盒子里放相应的东西
 * @param {Panel} parent Player_box的父级
 * @param {Array} data 传入的数据,小技能List = data[1],大招list = data[3]
 * @param {Number} index 传入的序号
 * @param {Number} team 传入的队伍
 */
function Create_Player_box(parent,data,index,team){
    // $.Msg(parent)

    //初始化模版
    var my_player_data = $.CreatePanel("Panel",parent,"my_player_data" + index)
    my_player_data.AddClass("my_player_data")

    var show_box = $.CreatePanel("Panel",parent,"show_box" + index)
    show_box.AddClass("show_box")

    var select_box = $.CreatePanel("Panel",parent,"select_box" + index)
    select_box.AddClass("select_box")

    // var swap_button = $.CreatePanel("Panel",parent,"swap_button" + index)
    // swap_button.AddClass("swap_button")

    var enemy_player_data = $.CreatePanel("Panel",parent,"enemy_player_data" + index)
    enemy_player_data.AddClass("enemy_player_data")

    var enemy_show_box = $.CreatePanel("Panel",parent,"enemy_show_box" + index)
    enemy_show_box.AddClass("show_box")
    enemy_show_box.visible = false
    

    //初始化my_player_data和enemy_player_data
    Create_player_data(parent,my_player_data,enemy_player_data,index)//初始化my_player_data
    Create_show_box(show_box,index)//初始化show_box
    Create_select_box(select_box,data,index)//初始化select_box
    Create_enemy_show_box(enemy_show_box,index)//初始化enemy_show_box
    // Create_swap_button(swap_button,data,index)//给Button绑定交换函数

    // my_player_data版初始化,显示玩家的头像与ID,先判断玩家的队伍，根据index号box，显示数组内的玩家
    function Create_player_data(parent,my_player_data,enemy_player_data,index) {
        // 获取id
        // $.Msg("Create_player_data获取id") 

        //直接hakurei_box_data和moriya_box_data诶个放,用local判断，如果local队伍是博丽，则hakurei放上面，反之守矢放上面
        if (team == DOTATeam_t.DOTA_TEAM_GOODGUYS) {
            if (hakurei_team[index] != -1) {
                Create_player_data_init(my_player_data,index,hakurei_team[index])
            }
            if (moriya_team[index] != -1) {
                Create_player_data_init(enemy_player_data,index,moriya_team[index])
            } 
        }else if (team == DOTATeam_t.DOTA_TEAM_BADGUYS) {
            if (moriya_team[index] != -1) {
                Create_player_data_init(my_player_data,index,moriya_team[index])
            }
            if (hakurei_team[index] != -1) {
                Create_player_data_init(enemy_player_data,index,hakurei_team[index])
            }
        }else{
            return
        }

        //player_data盒子初始化
        function Create_player_data_init(parent,index,player_id) {
            // $.Msg("Create_player_data_init")
            // $.Msg(typeof(player_id))
            // $.Msg(typeof(player_id) == "object")
            if (typeof(player_id) == "object") {
                return
            }
            const player_steamid = Game.GetPlayerInfo(player_id).player_steamid
            
            //先删除旧children
            parent.RemoveAndDeleteChildren()
            //获取头像
            var avatar = $.CreatePanel("DOTAAvatarImage", parent, "username_player_" + player_steamid);
            avatar.steamid = player_steamid;
            avatar.AddClass("AvatarImage");
            // avatar.style.className = "AvatarImage";
            
            // 获取名字
            if (player_steamid != 0) {
                var usernamePanel = $.CreatePanel("DOTAUserName", parent, " ");
                usernamePanel.AddClass("Player_box_element");
                usernamePanel.steamid = player_steamid;
                
            }else{
                const hero_name_label = $.CreatePanel("Label",parent,"bot_name_label" + index)
                hero_name_label.AddClass("sub_label")
                hero_name_label.text = Players.GetPlayerName(player_id)
            }
            
        }
    }

    // show_box板初始化
    function Create_show_box(parent,index){

        //先删除旧children
        parent.RemoveAndDeleteChildren()
        // hero_img_box放英雄头像，英雄被点击的时候需要更换
        var hero_img_box = $.CreatePanel("Panel",parent,"hero_img_box" + index)
        hero_img_box.AddClass("hero_img_box")

        // ability_info英雄名称和选中技能
        var ability_info = $.CreatePanel("Panel",parent,"ability_info" + index)
        ability_info.AddClass("ability_info")
        //ability_info初始化
        Create_ability_info(ability_info)
    }
    // enemy_show_box板初始化
    function Create_enemy_show_box(parent,index){

        //先删除旧children
        parent.RemoveAndDeleteChildren()
        // hero_img_box放英雄头像，英雄被点击的时候需要更换
        var enemy_hero_img_box = $.CreatePanel("Panel",parent,"enemy_hero_img_box" + index)
        enemy_hero_img_box.AddClass("hero_img_box")

        // ability_info英雄名称和选中技能
        var enemy_ability_info = $.CreatePanel("Panel",parent,"enemy_ability_info" + index)
        enemy_ability_info.AddClass("ability_info")
        //ability_info初始化
        Create_ability_info(enemy_ability_info)
        Create_enemy_ability_info(enemy_ability_info)
    }

    // ability_info板初始化
    function Create_ability_info(parent){

        parent.RemoveAndDeleteChildren()
        var hero_name = $.CreatePanel("Panel",parent,"hero_name" + index)
        hero_name.AddClass("hero_name")
        const hero_name_label = $.CreatePanel("Label",hero_name,"hero_name_label" + index)
        hero_name_label.AddClass("sub_label")


        var show_ability_box = $.CreatePanel("Panel",parent,"show_ability_box" + index)
        show_ability_box.AddClass("show_ability_box")
        const show_ability_box_1 =  $.CreatePanel("Panel", show_ability_box, "show_ability_box_1_" + index)
        const show_ability_box_2 =  $.CreatePanel("Panel", show_ability_box, "show_ability_box_2_" + index)
        show_ability_box_1.AddClass("ability")
        show_ability_box_2.AddClass("ability")
    }
    function Create_enemy_ability_info(parent){

        parent.RemoveAndDeleteChildren()
        var enemy_hero_name = $.CreatePanel("Panel",parent,"enemy_hero_name" + index)
        enemy_hero_name.AddClass("hero_name")
        const enemy_hero_name_label = $.CreatePanel("Label",enemy_hero_name,"enemy_hero_name_label" + index)
        enemy_hero_name_label.AddClass("sub_label")


        var enemy_show_ability_box = $.CreatePanel("Panel",parent,"enemy_show_ability_box" + index)
        enemy_show_ability_box.AddClass("show_ability_box")
        const enemy_show_ability_box_1 =  $.CreatePanel("Panel", enemy_show_ability_box, "enemy_show_ability_box_1_" + index)
        const enemy_show_ability_box_2 =  $.CreatePanel("Panel", enemy_show_ability_box, "enemy_show_ability_box_2_" + index)
        enemy_show_ability_box_1.AddClass("ability")
        enemy_show_ability_box_2.AddClass("ability")
    }

    // select_box板初始化
    function Create_select_box(parent,data,index){
        var div_1 = $.CreatePanel("Panel",parent,"div_1" + index)
        div_1.AddClass("div_1")
        var div_2 = $.CreatePanel("Panel",parent,"div_2" + index)
        div_2.AddClass("div_2")
        var div_3 = $.CreatePanel("Panel",parent,"div_3" + index)
        div_3.AddClass("div_3")

        //传入英雄List = data[1],小技能List = data[2],大招list = data[3]
        craete_div_1(div_1,data[1])
        craete_div_2(div_2,data[2])
        craete_div_3(div_3,data[3])
    }

    //英雄头像初始化
    function craete_div_1(parent,hero_list) {
        // $.Msg("craete_div_1")
    
        const Label = $.CreatePanel("Label",parent,"")
        Label.AddClass("sub_label")
        Label.text = "少女";
    
        for (let int = 1; int < 7; int++) {
            const element = hero_list[int];
            //随机让玩家选一个
            const create_hero_img = $.CreatePanel("Image", parent, "");
			create_hero_img.SetImage(`s2r://panorama/images/heroes/thd2_${element}_png.vtex`);
            create_hero_img.AddClass("hero_image")
            if (create_hero_img) {
                //修改英雄图标，但是图标未编译不生效
                // $.Msg(int);
                create_hero_img.SetPanelEvent("onactivate", function () {
                    //鼠标点击checked = ture；同时其他英雄checked = false。
                    //由于是公共面板，所以可以直接在这里修改样式
                    //首先判断是不是ban人时间,1是ban，2是pick
                    const local_id = Game.GetLocalPlayerID()
                    const hero_img_box = $("#hero_img_box" + index)
                    if (BP_state == 1) {
                        $.Msg("ban人");
                        if (Player_Click_IsOwn(Game.GetLocalPlayerID(),parent)){
                            GameEvents.SendCustomGameEventToAllClients("Send_change_Table", ["div_1" + index,int,local_id,element])
                            GameEvents.SendCustomGameEventToAllClients("Add_ban_list", [index,1,int,local_id])
                        }else{
                            // other_flash("div_1" + index,int)
                            GameEvents.SendCustomGameEventToAllClients("other_flash", ["div_1" + index,int,local_id])

                        }
                        //ban人
                    }else if (BP_state == 2) {
                        $.Msg("选人");
                        //选人
                        if (create_hero_img.checked == true) {
                            //表示被ban，不执行操作
                            return
                        }
                        if (Player_Click_IsOwn(Game.GetLocalPlayerID(),parent)){
                            GameEvents.SendCustomGameEventToAllClients("Send_change_Table", ["div_1" + index,int,local_id,element])
                            all_hero_data[Game.GetLocalPlayerID()][1] = element //收集玩家选择的英雄
                        }else{
                            GameEvents.SendCustomGameEventToAllClients("other_flash", ["div_1" + index,int,local_id])
                        }
                    }
                })
            }
        }
    }

    //小技能面板初始化
    function craete_div_2(parent,abi_list) {
        // $.Msg("craete_div_2")
        const Label = $.CreatePanel("Label",parent,"")
        Label.AddClass("sub_label")
        Label.text = "普通技能";
        for (let int = 1; int < 9; int++) {
            const element = abi_list[int];
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
                    const local_id = Game.GetLocalPlayerID()
                    const show_ability_box_1 = $("#show_ability_box_1_" + index)
                    if (BP_state == 1) {
                        $.Msg("ban人");
                        //ban人
                        if (Player_Click_IsOwn(Game.GetLocalPlayerID(),parent)){
                            GameEvents.SendCustomGameEventToAllClients("Send_change_Table", ["div_2" + index,int,local_id,element])
                            GameEvents.SendCustomGameEventToAllClients("Add_ban_list", [index,2,int,local_id])
                        }else{
                            GameEvents.SendCustomGameEventToAllClients("other_flash", ["div_2" + index,int,local_id])

                        }
                    }else if (BP_state == 2) {
                        if (create_abi.checked == true) {
                            //表示被ban，不执行操作
                            return
                        }
                        if (Player_Click_IsOwn(Game.GetLocalPlayerID(),parent)){
                            GameEvents.SendCustomGameEventToAllClients("Send_change_Table", ["div_2" + index,int,local_id,element])
                            all_hero_data[Game.GetLocalPlayerID()][2] = element  //收集玩家选择的小技能
                        }else{
                            GameEvents.SendCustomGameEventToAllClients("other_flash", ["div_2" + index,int,local_id])
                        }
                    }
                })
            }
        }
    }

    //大招面板初始化
    function craete_div_3(parent,ult_list) {
        // $.Msg("craete_div_3")
        const Label = $.CreatePanel("Label",parent,"")
        Label.AddClass("sub_label")
        Label.text = "终极技能";
        for (let int = 1; int < 9; int++) {
            const element = ult_list[int];
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
                    const local_id = Game.GetLocalPlayerID()
                    const show_ability_box_2 = $("#show_ability_box_2_" + index)
                    if (BP_state == 1) {
                        $.Msg("ban人");
                        //ban人
                        if (Player_Click_IsOwn(Game.GetLocalPlayerID(),parent)){
                            show_ability_box_2.RemoveAndDeleteChildren()
                            $.CreatePanel("DOTAAbilityImage", show_ability_box_2, "", {
                                "class": "ability",
                                html: "true",
                                selectionpos: "auto",
                                hittest: "true",
                                hittestchildren: "false", 
                                abilityname: element,
                                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                                onmouseout: "DOTAHideAbilityTooltip()",
                            });


                            // Send_change_Table("div_3" + index,int)
                            // Add_ban_list(index,3,int)
                            GameEvents.SendCustomGameEventToAllClients("Send_change_Table", ["div_3" + index,int,local_id,element])
                            GameEvents.SendCustomGameEventToAllClients("Add_ban_list", [index,3,int,local_id])
                        }else{
                            // other_flash("div_3" + index,int)
                            GameEvents.SendCustomGameEventToAllClients("other_flash", ["div_3" + index,int,local_id])

                        }
                    }else if (BP_state == 2) {
                        if (create_abi.checked == true) {
                            //表示被ban，不执行操作
                            return
                        }
                        if (Player_Click_IsOwn(Game.GetLocalPlayerID(),parent)){
                            show_ability_box_2.RemoveAndDeleteChildren()
                            $.CreatePanel("DOTAAbilityImage", show_ability_box_2, "", {
                                "class": "ability",
                                html: "true",
                                selectionpos: "auto",
                                hittest: "true",
                                hittestchildren: "false", 
                                abilityname: element,
                                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                                onmouseout: "DOTAHideAbilityTooltip()",
                            });
                            all_hero_data[Game.GetLocalPlayerID()][3] = element  //收集玩家选择的大招
                            // Send_change_Table("div_3" + index,int)
                            GameEvents.SendCustomGameEventToAllClients("Send_change_Table", ["div_3" + index,int,local_id,element])
                        }else{
                            // other_flash("div_3" + index,int)
                            GameEvents.SendCustomGameEventToAllClients("other_flash", ["div_3" + index,int,local_id])
                        }
                    }
                })
            }
        } 
    }
}


//修改所有玩家显示技能的函数，每次玩家点击都会调用
//如果玩家点击的box与自己的id一样，则返回修改
//如果点击的box与自己的不一样，则在Js里调用高亮，暂定为图标闪一下
function Player_Click_IsOwn(LocalPlayerID,parent) {
    // $.Msg("Player_Click_IsOwn")
    const Player_box = parent.GetParent().GetParent()
    const Player_box_index = Player_box.id[Player_box.id.length - 1] //盒子编号
    // $.Msg(LocalPlayerID)
    //若玩家是博丽方，判断盒子id与index是否符合
    if (LocalPlayerID == hakurei_box_data[Player_box_index]) {
        // $.Msg("是自己的盒子")
        return true
    }else if (LocalPlayerID == moriya_box_data[Player_box_index]){
        // $.Msg("是自己的盒子")
        return true
    }else {
        // $.Msg("是别人的盒子")
        //点击别人的盒子，向面板发送闪光
        return false
    }
}

//发送Table给Lua
function SendTableToLua(data) {
    //发送所有储存的数据给Lua
    GameEvents.SendCustomGameEventToServer("SendTableToLua", {all_hero_data,hakurei_ban_data,moriya_ban_data});
}

//count 是第几个盒子，type是"div_" + type + count, index是第几个技能
function Add_ban_list(data) {
    // $.Msg("Add_ban_list(data) : ")
    // $.Msg(data)
    //此处已经判断过点击的是自己的盒子
    // const Player_box = parent.GetParent().GetParent()
    // const Player_box_index = Player_box.id[Player_box.id.length - 1]
    //若玩家是博丽方的，则向hakurei_ban_data里添加
    //若玩家是IsSpectator，则不执行
    if (Players.IsSpectator(Game.GetLocalPlayerID()) && data == null) {
        return
    }
    const count = data[0]
    const type = data[1]
    const index = data[2]
    const send_id = data[3]
    if (Game.GetPlayerInfo(send_id).player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS ) {
        hakurei_ban_data[count][type] = index 
        // $.Msg(hakurei_ban_data)
    }else if (Game.GetPlayerInfo(send_id).player_team_id == DOTATeam_t.DOTA_TEAM_BADGUYS) {
        moriya_ban_data[count][type] = index
        // $.Msg(moriya_ban_data)
    }else{
        return
    }

    //然后把数据发送到lua储存
    SendTableToLua()
}

//在Js内修改相同队伍的面板，获取各种数据，然后修改自己的面板，直接改
function Send_change_Table(data) {
    // $.Msg("Send_change_Table(div_name) : ")
    // $.Msg(data)
    //若玩家是IsSpectator，则不执行
    if (Players.IsSpectator(Game.GetLocalPlayerID())) {
        return
    }
    const div_name = data[0]
    const div = $("#" + div_name)
    if (div == null) {
        return
    }
    const div_index = div.id[div.id.length - 1]
    const div_type = div.id[div.id.length - 2]
    const int = data[1]
    const send_id = data[2]
    const hero_img_box = $("#hero_img_box" + div_index)
    const show_ability_box_1 = $("#show_ability_box_1_" + div_index)
    const show_ability_box_2 = $("#show_ability_box_2_" + div_index)
    const element = data[3]
    // $.Msg(div_name)
    // $.Msg(int)
    // $.Msg(hero_img_box)
    // $.Msg(element)
    const enemy_hero_img_box = $("#enemy_hero_img_box" + div_index)
    const enemy_show_ability_box_1 = $("#enemy_show_ability_box_1_" + div_index)
    const enemy_show_ability_box_2 = $("#enemy_show_ability_box_2_" + div_index)
    //首先判断队伍,然后判断state，是ban人还是选人
    const BP_HUD = $("#BP_HUD")
    const send_team = Players.GetTeam(send_id)
    var class_name = "banned"
    if (BP_state == 2) {
        class_name = "select_ability"
    }
    if (send_team == DOTATeam_t.DOTA_TEAM_GOODGUYS) {
        //这是博丽方传递的信息，如果localPlayer是守矢就retrun
        // $.Msg("send_team是博丽队伍")
        if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_BADGUYS) {
            // $.Msg("守矢方接收博丽的信息")
            // 对守矢方的enemy_show_box修改信息
            if (div_type == 1) {
                enemy_hero_img_box.RemoveAndDeleteChildren()
                $.CreatePanel("DOTAHeroMovie", enemy_hero_img_box, "", {
                    class: "hero_image_portrait",
                    html: "true",
                    selectionpos: "auto",
                    hittest: "true",
                    hittestchildren: "false",
                    heroname: element,
                    heroimagestyle: "portrait"
                })
                $("#enemy_hero_name_label" + div_index).text = $.Localize(`#${element}`)
            }else if (div_type == 2) {
                //是小技能，修改博丽方enemy_show_ability_box_1的信息
                enemy_show_ability_box_1.RemoveAndDeleteChildren()
                $.CreatePanel("DOTAAbilityImage", enemy_show_ability_box_1, "", {
                    "class": "ability",
                    html: "true",
                    selectionpos: "auto",
                    hittest: "true",
                    hittestchildren: "false",
                    abilityname: element,
                    onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                    onmouseout: "DOTAHideAbilityTooltip()",
                });
            }else if (div_type == 3) {
                //是大招，修改博丽方enemy_show_ability_box_2的信息
                // $.Msg("是大招，修改博丽方show_ability_box_2的信息")
                enemy_show_ability_box_2.RemoveAndDeleteChildren()
                $.CreatePanel("DOTAAbilityImage", enemy_show_ability_box_2, "", {
                    "class": "ability",
                    html: "true",
                    selectionpos: "auto",
                    hittest: "true",
                    hittestchildren: "false", 
                    abilityname: element,
                    onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                    onmouseout: "DOTAHideAbilityTooltip()",
                });
            }
            return
        }
        //对所有博丽成员修改面板，单项修改
        div.GetChild(int)
        for (let index = 1; index < div.GetChildCount(); index++) {
            // $.Msg(div.GetChild(index))
            div.GetChild(index).RemoveClass(class_name);
            if (BP_state == 1) {
                div.GetChild(index).checked = false;
            }
        }
        if (BP_state == 1) {
            div.GetChild(int).checked = true;
            // $.Msg(div.GetChild(int) + " is checked.");
        }
        div.GetChild(int).AddClass(class_name);
        
        
        if (div_type == 1) {
            //是英雄选择，修改博丽方hero_img_box里的信息
            // $.Msg("是英雄选择，修改博丽方hero_img_box里的信息")
            hero_img_box.RemoveAndDeleteChildren()
            // 修改hero_name里的英雄的信息
            $("#hero_name_label" + div_index).text = $.Localize(`#${element}`)
            $.CreatePanel("DOTAHeroMovie", hero_img_box, "", {
                class: "hero_image_portrait",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                heroname: element,
                heroimagestyle: "portrait"
            })

            // enemy_hero_img_box.RemoveAndDeleteChildren()
            //     $.CreatePanel("DOTAHeroMovie", enemy_hero_img_box, "", {
            //         class: "hero_image_portrait",
            //         html: "true",
            //         selectionpos: "auto",
            //         hittest: "true",
            //         hittestchildren: "false",
            //         heroname: element,
            //         heroimagestyle: "portrait"
            // })
            // $("#enemy_hero_name_label" + div_index).text = $.Localize(`#${element}`)


        }else if (div_type == 2) {
            //是小技能，修改博丽方show_ability_box_1的信息
            // $.Msg("是小技能，修改博丽方show_ability_box_1的信息")
            show_ability_box_1.RemoveAndDeleteChildren()
            $.CreatePanel("DOTAAbilityImage", show_ability_box_1, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                abilityname: element,
                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });

            // enemy_show_ability_box_1.RemoveAndDeleteChildren()
            //     $.CreatePanel("DOTAAbilityImage", enemy_show_ability_box_1, "", {
            //         "class": "ability",
            //         html: "true",
            //         selectionpos: "auto",
            //         hittest: "true",
            //         hittestchildren: "false",
            //         abilityname: element,
            //         onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
            //         onmouseout: "DOTAHideAbilityTooltip()",
            // });
            

        }else if (div_type == 3) {
            //是大招，修改博丽方show_ability_box_2的信息
            // $.Msg("是大招，修改博丽方show_ability_box_2的信息")
            show_ability_box_2.RemoveAndDeleteChildren()
            $.CreatePanel("DOTAAbilityImage", show_ability_box_2, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false", 
                abilityname: element,
                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });

            // enemy_show_ability_box_2.RemoveAndDeleteChildren()
            // $.CreatePanel("DOTAAbilityImage", enemy_show_ability_box_2, "", {
            //     "class": "ability",
            //     html: "true",
            //     selectionpos: "auto",
            //     hittest: "true",
            //     hittestchildren: "false", 
            //     abilityname: element,
            //     onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
            //     onmouseout: "DOTAHideAbilityTooltip()",
            // });

        }
    }else if (send_team == DOTATeam_t.DOTA_TEAM_BADGUYS){
        // $.Msg("send_team是守矢队伍")
        if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS) {
            // $.Msg("博丽方接收守矢的信息")
            if (div_type == 1) {
                enemy_hero_img_box.RemoveAndDeleteChildren()
                $.CreatePanel("DOTAHeroMovie", enemy_hero_img_box, "", {
                    class: "hero_image_portrait",
                    html: "true",
                    selectionpos: "auto",
                    hittest: "true",
                    hittestchildren: "false",
                    heroname: element,
                    heroimagestyle: "portrait"
                })
                $("#enemy_hero_name_label" + div_index).text = $.Localize(`#${element}`)
            }else if (div_type == 2) {
                //是小技能，修改守矢方enemy_show_ability_box_1的信息
                enemy_show_ability_box_1.RemoveAndDeleteChildren()
                $.CreatePanel("DOTAAbilityImage", enemy_show_ability_box_1, "", {
                    "class": "ability",
                    html: "true",
                    selectionpos: "auto",
                    hittest: "true",
                    hittestchildren: "false",
                    abilityname: element,
                    onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                    onmouseout: "DOTAHideAbilityTooltip()",
                });
            }else if (div_type == 3) {
                //是大招，修改守矢方enemy_show_ability_box_2的信息
                // $.Msg("是大招，修改守矢方show_ability_box_2的信息")
                enemy_show_ability_box_2.RemoveAndDeleteChildren()
                $.CreatePanel("DOTAAbilityImage", enemy_show_ability_box_2, "", {
                    "class": "ability",
                    html: "true",
                    selectionpos: "auto",
                    hittest: "true",
                    hittestchildren: "false", 
                    abilityname: element,
                    onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                    onmouseout: "DOTAHideAbilityTooltip()",
                });
            }
            return
        }
        //对所有守矢成员修改面板，单项修改
        // $.Msg(div.GetChild(int))
        div.GetChild(int)
        for (let index = 1; index < div.GetChildCount(); index++) {
            div.GetChild(index).RemoveClass(class_name);
            if (BP_state == 1) {
                div.GetChild(index).checked = false;
            }
        }
        if (BP_state == 1) {
            div.GetChild(int).checked = true;
            // $.Msg(div.GetChild(int) + " is checked.");
        }
        div.GetChild(int).AddClass(class_name);

        if (div_type == 1) {
            //是英雄选择，修改守矢方hero_img_box里的信息
            // $.Msg("是英雄选择，修改守矢方hero_img_box里的信息")
            hero_img_box.RemoveAndDeleteChildren()
            $.CreatePanel("DOTAHeroMovie", hero_img_box, "", {
                class: "hero_image_portrait",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                heroname: element,
                heroimagestyle: "portrait"
            })
            // const create_hero_img = $.CreatePanel("Image", hero_img_box, "");
			// create_hero_img.SetImage(`s2r://panorama/images/heroes/selection/thd2_${element}_png.vtex`);
            // create_hero_img.AddClass("hero_image_portrait")

            // 修改hero_name里的英雄的信息
            // $.Msg(element)
            // $.Msg(typeof(element))
            $("#hero_name_label" + div_index).text = $.Localize(`#${element}`)
        }else if (div_type == 2) {
            //是小技能，修改守矢方show_ability_box_1的信息
            // $.Msg("是小技能，修改守矢方show_ability_box_1的信息")
            show_ability_box_1.RemoveAndDeleteChildren()
            $.CreatePanel("DOTAAbilityImage", show_ability_box_1, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto",
                hittest: "true",
                hittestchildren: "false",
                abilityname: element,
                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });
        }else if (div_type == 3) {
            //是大招，修改守矢方show_ability_box_2的信息
            // $.Msg("是大招，修改守矢方show_ability_box_2的信息")
            show_ability_box_2.RemoveAndDeleteChildren()
            $.CreatePanel("DOTAAbilityImage", show_ability_box_2, "", {
                "class": "ability",
                html: "true",
                selectionpos: "auto", 
                hittest: "true",
                hittestchildren: "false", 
                abilityname: element,
                onmouseover: "DOTAShowAbilityTooltip('" + element + "')",
                onmouseout: "DOTAHideAbilityTooltip()",
            });
        }

        
    }else {
        $.Msg("change_Table没有队伍")
        return
    }

    //然后把数据发送到lua储存
    SendTableToLua()
}

function Get_change_Table(div_name,int) {
    
}



function other_flash(data) {
    // $.Msg("other_flash(data)  : ")
    // $.Msg(data)
    //首先判断队伍
    // const BP_HUD = $("#BP_HUD")
    //若玩家是IsSpectator，则不执行
    if (Players.IsSpectator(Game.GetLocalPlayerID())) {
        return
    }
    const div_name = data[0]
    const int = data[1]
    const send_id = data[2]
    const div = $("#" + div_name)
    // $.Msg(div)
    // const Player_box_index = div.id[Player_box.id.length - 1]
    const send_team = Players.GetTeam(send_id)
    if (send_team == DOTATeam_t.DOTA_TEAM_GOODGUYS) {
        // $.Msg("other_flash是博丽队伍")
        if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_BADGUYS) {
            // $.Msg("守矢方接收博丽的信息")
            return
        }
        //对所有博丽成员修改面板，单项修改
        // $.Msg(div.GetChild(int))
        div.GetChild(int)
        div.GetChild(int).RemoveClass("flash");
        // $.Msg("other_flash.AddClass(flash)")
        div.GetChild(int).AddClass("flash");
    }else if (send_team == DOTATeam_t.DOTA_TEAM_BADGUYS){
        // $.Msg("other_flash是守矢队伍")
        if (Game.GetLocalPlayerInfo().player_team_id == DOTATeam_t.DOTA_TEAM_GOODGUYS) {
            // $.Msg("博丽方接收守矢的信息")
            return
        }
        //对所有守矢成员修改面板，单项修改
        // $.Msg(div.GetChild(int))
        div.GetChild(int)
        div.GetChild(int).RemoveClass("flash");
        // $.Msg("other_flash.AddClass(flash)")
        div.GetChild(int).AddClass("flash");
    }else {
        $.Msg("other_flash没有队伍")
        return
    }
}
//显示玩家id的函数，每次交换头像都会调用，传入参数为box序号和玩家id


/**
 * swap_button交换英雄按钮
 * @param {Panel} swap_button - Button的Panel
 * @param {Array} data - 传入的数据
 * @param {Number} index - 传入的序号
 */
function Create_swap_button(swap_button,data,index) {
    const Label = $.CreatePanel("Label", swap_button , "button_Label")
    Label.text = " " //Button的Label
    if (hakurei_team[index] == Game.GetLocalPlayerID() || moriya_team[index] == Game.GetLocalPlayerID()) {
        swap_button.visible = false
    }
    swap_button.SetPanelEvent("onactivate", function () {
        //点击以后首先确认按钮id的状态，如果正在交换中，则return，如果未交换，则弹出是否交换按钮
        $.Msg("  id   ")
        $.Msg(hakurei_team[index] == Game.GetLocalPlayerID())
    })
}
