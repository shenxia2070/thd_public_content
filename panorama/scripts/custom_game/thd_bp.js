"use strict";
// BP 面板（原生 Panorama，替代 omg_bp 的 React 版本）
// 席位数取自 react_table.bp_list_all 的组数，5v5 与 6v6 共用。
// 自己的盒子：点击即 ban / pick；队友的盒子：点击为“建议”，在图标右下角显示自己的小头像，再点一次取消。

var PVP_MAPS = { "maps/1_thdots_map.vpk": true, "maps/2_thdots_6v6.vpk": true };
var KEYS = ["hero", "abi", "ult"];
var KEY_TITLE = { hero: "少女", abi: "普通技能", ult: "大招" };
var KEY_LIST = { hero: "hero_list", abi: "abi_list", ult: "ult_list" };
var KEY_COUNT = { hero: 6, abi: 8, ult: 8 };

var root = $.GetContextPanel();
var built = null; // 已构建的 bp_list_all 指纹
var boxes = {};   // index -> 面板引用
var refreshQueued = false;

function TeamTags() {
	var team = Game.GetLocalPlayerInfo() ? Game.GetLocalPlayerInfo().player_team_id : -1;
	if (team == DOTATeam_t.DOTA_TEAM_GOODGUYS) return { team: team, my: "hakurei", enemy: "moriya" };
	if (team == DOTATeam_t.DOTA_TEAM_BADGUYS) return { team: team, my: "moriya", enemy: "hakurei" };
	return null;
}

function Table(key) {
	return CustomNetTables.GetTableValue("react_table", key);
}

function State() {
	var s = Table("react_table_state");
	return s ? s["1"] : 1;
}

function SteamID(pid) {
	var info = Game.GetPlayerInfo(pid);
	return info ? info.player_steamid : "";
}

function PlayerName(pid) {
	var info = Game.GetPlayerInfo(pid);
	return info ? info.player_name : "未知玩家";
}

function DotaHud() {
	var p = root;
	while (p.GetParent()) p = p.GetParent();
	return p;
}

function HideDefault(ids) {
	var hud = DotaHud();
	for (var i = 0; i < ids.length; i++) {
		var panel = hud.FindChildTraverse(ids[i]);
		if (panel) panel.visible = false;
	}
}

function SetModeLabel(state) {
	var label = DotaHud().FindChildTraverse("GameModeLabel");
	if (!label) return;
	label.text = state == 1 ? "BAN人时间" : state == 2 ? "选人时间" : "决策时间";
}

// ---------- 构建 ----------

function MakeIcon(parent, index, key, i, name) {
	var cell = $.CreatePanel("Panel", parent, "");
	cell.AddClass("bp_icon");
	cell.AddClass(key == "hero" ? "bp_icon_hero" : "bp_icon_ability");
	var image;
	if (key == "hero") {
		image = $.CreatePanel("Image", cell, "");
		image.SetImage("file://{images}/heroes/thd2_" + name + ".png");
		image.SetScaling("stretch-to-fit-preserve-aspect");
	} else {
		image = $.CreatePanel("DOTAAbilityImage", cell, "");
		image.abilityname = name;
		image.SetPanelEvent("onmouseover", function () { $.DispatchEvent("DOTAShowAbilityTooltip", image, name); });
		image.SetPanelEvent("onmouseout", function () { $.DispatchEvent("DOTAHideAbilityTooltip", image); });
	}
	image.AddClass("bp_icon_image");
	image.hittest = false;
	var suggest = $.CreatePanel("Panel", cell, "");
	suggest.AddClass("bp_suggest");
	suggest.hittest = false;
	cell.SetPanelEvent("onactivate", function () { OnIconClick(index, key, i); });
	return { cell: cell, suggest: suggest, avatars: "" };
}

function MakeShow(parent) {
	var show = $.CreatePanel("Panel", parent, "");
	show.AddClass("bp_show");
	var movie = $.CreatePanel("DOTAHeroMovie", show, "");
	movie.AddClass("bp_show_movie");
	var info = $.CreatePanel("Panel", show, "");
	info.AddClass("bp_show_info");
	var name = $.CreatePanel("Label", info, "");
	name.AddClass("bp_show_name");
	var row = $.CreatePanel("Panel", info, "");
	row.AddClass("bp_show_abilities");
	var abi = $.CreatePanel("DOTAAbilityImage", row, "");
	abi.AddClass("bp_show_ability");
	var ult = $.CreatePanel("DOTAAbilityImage", row, "");
	ult.AddClass("bp_show_ability");
	return { panel: show, movie: movie, name: name, abi: abi, ult: ult, hero: null };
}

function MakeHeader(parent) {
	var header = $.CreatePanel("Panel", parent, "");
	header.AddClass("bp_header");
	var avatar = $.CreatePanel("DOTAAvatarImage", header, "");
	avatar.AddClass("bp_header_avatar");
	var name = $.CreatePanel("Label", header, "");
	name.AddClass("bp_header_name");
	return { panel: header, avatar: avatar, name: name, pid: null };
}

function Build(listAll) {
	root.RemoveAndDeleteChildren();
	boxes = {};
	var container = $.CreatePanel("Panel", root, "BPContainer");
	container.AddClass("bp_container");
	var count = 0;
	for (var k in listAll) count++;
	container.SetHasClass("bp_six", count >= 6);
	for (var index = 1; index <= count; index++) {
		var group = listAll[String(index)];
		var box = $.CreatePanel("Panel", container, "");
		box.AddClass("bp_box");
		var refs = { panel: box, icons: {} };
		refs.header = MakeHeader(box);
		refs.show = MakeShow(box);
		refs.grids = $.CreatePanel("Panel", box, "");
		refs.grids.AddClass("bp_grids");
		for (var g = 0; g < KEYS.length; g++) {
			var key = KEYS[g];
			var title = $.CreatePanel("Label", refs.grids, "");
			title.AddClass("bp_grid_title");
			title.text = KEY_TITLE[key];
			var grid = $.CreatePanel("Panel", refs.grids, "");
			grid.AddClass("bp_grid");
			refs.icons[key] = {};
			var list = group[KEY_LIST[key]] || {};
			for (var i = 1; i <= KEY_COUNT[key]; i++) {
				if (list[String(i)]) refs.icons[key][i] = MakeIcon(grid, index, key, i, list[String(i)]);
			}
		}
		refs.enemyHeader = MakeHeader(box);
		refs.enemyHeader.panel.AddClass("bp_enemy");
		refs.enemyShow = MakeShow(box);
		refs.enemyShow.panel.AddClass("bp_enemy");
		refs.swap = $.CreatePanel("TextButton", box, "");
		refs.swap.AddClass("bp_swap_button");
		refs.swap.text = "交换位置";
		(function (boxIndex) {
			refs.swap.SetPanelEvent("onactivate", function () { OnSwap(boxIndex); });
		})(index);
		refs.requests = $.CreatePanel("Panel", box, "");
		refs.requests.AddClass("bp_requests");
		refs.requestKey = null;
		boxes[index] = refs;
	}
}

// ---------- 刷新 ----------

function SetHeader(header, pid) {
	if (header.pid === pid) return;
	header.pid = pid;
	var sid = SteamID(pid);
	header.avatar.steamid = sid;
	header.name.text = sid != "" ? PlayerName(pid) : "空位";
}

function SetShow(show, group, choice) {
	var hero = choice && choice.hero ? group.hero_list[String(choice.hero)] : null;
	var abi = choice && choice.abi ? group.abi_list[String(choice.abi)] : null;
	var ult = choice && choice.ult ? group.ult_list[String(choice.ult)] : null;
	if (show.hero !== hero) {
		show.hero = hero;
		show.movie.heroname = hero || "";
		show.name.text = hero ? $.Localize("#" + hero) : "";
	}
	show.abi.abilityname = abi || "";
	show.abi.visible = !!abi;
	show.ult.abilityname = ult || "";
	show.ult.visible = !!ult;
}

function SetSuggest(icon, list) {
	var pids = [];
	for (var pid in list || {}) pids.push(pid);
	pids.sort();
	var keyText = pids.join(",");
	if (icon.avatars === keyText) return;
	icon.avatars = keyText;
	icon.suggest.RemoveAndDeleteChildren();
	for (var i = 0; i < pids.length; i++) {
		var avatar = $.CreatePanel("DOTAAvatarImage", icon.suggest, "");
		avatar.AddClass("bp_suggest_avatar");
		avatar.steamid = SteamID(Number(pids[i]));
		avatar.hittest = false;
	}
	icon.cell.SetHasClass("suggested", pids.length > 0);
}

function Refresh() {
	refreshQueued = false;
	var tags = TeamTags();
	var listAll = Table("bp_list_all");
	var result = Table("bp_list_result");
	if (!tags || !listAll || !result || !result[tags.my] || !result[tags.enemy]) return;
	var print = JSON.stringify(listAll);
	if (built !== print) {
		built = print;
		Build(listAll);
	}
	var state = State();
	SetModeLabel(state);
	root.SetHasClass("state_ban", state == 1);
	root.SetHasClass("state_pick", state == 2);
	root.SetHasClass("state_show", state == 3);
	if (state == 3) HideDefault(["StrategyScreen", "RadiantTeamPlayers", "DireTeamPlayers"]);

	var localID = Game.GetLocalPlayerID();
	var localBox = null;
	for (var b in boxes) {
		if (result[tags.my][b] && result[tags.my][b].PlayerID == localID) localBox = Number(b);
	}
	var suggestAll = Table("suggest_" + tags.my) || {};

	for (var index in boxes) {
		var refs = boxes[index];
		var group = listAll[index];
		var mine = result[tags.my][index];
		var enemy = result[tags.enemy][index];
		if (!mine || !enemy) continue;
		var isLocal = mine.PlayerID == localID;
		refs.panel.SetHasClass("bp_local", isLocal);
		SetHeader(refs.header, mine.PlayerID);
		SetHeader(refs.enemyHeader, enemy.PlayerID);
		SetShow(refs.show, group, state == 1 ? mine.BanList : mine.PickList);
		SetShow(refs.enemyShow, group, enemy.PickList);

		for (var g = 0; g < KEYS.length; g++) {
			var key = KEYS[g];
			for (var i in refs.icons[key]) {
				var icon = refs.icons[key][i];
				var n = Number(i);
				var myBan = mine.BanList && mine.BanList[key] == n;
				var enemyBan = enemy.BanList && enemy.BanList[key] == n;
				var myPick = mine.PickList && mine.PickList[key] == n;
				// ban 阶段只看到自己 ban 的；pick 阶段看到对面 ban 掉的和自己选的
				icon.cell.SetHasClass("banned", state == 1 ? myBan : enemyBan);
				icon.cell.SetHasClass("picked", state == 2 && myPick);
				SetSuggest(icon, state == 3 ? null : suggestAll[index + "_" + key + "_" + n]);
			}
		}

		refs.swap.visible = !isLocal && state != 3 && localBox != null;
		var requests = [];
		for (var r in mine.ChangeReceiveList || {}) requests.push(mine.ChangeReceiveList[r]);
		var requestKey = state == 3 ? "" : requests.join(",") + "|" + (localBox == Number(index));
		if (refs.requestKey !== requestKey) {
			refs.requestKey = requestKey;
			refs.requests.RemoveAndDeleteChildren();
			if (state != 3) {
				for (var q = 0; q < requests.length; q++) {
					AddRequest(refs.requests, Number(index), requests[q], result[tags.my], localBox == Number(index));
				}
			}
		}
	}
}

function AddRequest(parent, boxIndex, fromIndex, teamResult, canAgree) {
	var row = $.CreatePanel("Panel", parent, "");
	row.AddClass("bp_request");
	var from = teamResult[String(fromIndex)];
	var label = $.CreatePanel("Label", row, "");
	label.AddClass("bp_request_label");
	label.text = (from ? PlayerName(from.PlayerID) : "未知玩家") + " 发起交换";
	if (canAgree) {
		var button = $.CreatePanel("TextButton", row, "");
		button.AddClass("bp_swap_button");
		button.text = "同意交换";
		button.SetPanelEvent("onactivate", function () {
			GameEvents.SendCustomGameEventToServer("AgreeReceive", {
				data: { Player_box_index: boxIndex, index: fromIndex, team: TeamTags().team }
			});
		});
	}
}

function QueueRefresh() {
	if (refreshQueued) return;
	refreshQueued = true;
	$.Schedule(0.03, Refresh);
}

// ---------- 交互 ----------

function OnIconClick(index, key, i) {
	var tags = TeamTags();
	var result = Table("bp_list_result");
	var state = State();
	if (!tags || !result || state == 3) return;
	var mine = result[tags.my][String(index)];
	var enemy = result[tags.enemy][String(index)];
	if (!mine) return;
	if (mine.PlayerID != Game.GetLocalPlayerID()) {
		GameEvents.SendCustomGameEventToServer("BPSuggest", {
			data: { Player_box_index: index, key_string: key, index: i }
		});
		return;
	}
	var tag = state == 1 ? "BanList" : "PickList";
	if (state == 2 && enemy && enemy.BanList && enemy.BanList[key] == i) return; // 被对面 ban 掉的不能选
	var data = {};
	var old = mine[tag] || {};
	for (var k in old) data[k] = old[k];
	data[key] = i;
	GameEvents.SendCustomGameEventToServer("ChangeResult", { data: { PlayerData: data, team: tags.team } });
}

function OnSwap(boxIndex) {
	var tags = TeamTags();
	var result = Table("bp_list_result");
	if (!tags || !result) return;
	var localBox = null;
	for (var b in result[tags.my]) {
		if (result[tags.my][b].PlayerID == Game.GetLocalPlayerID()) localBox = Number(b);
	}
	if (localBox == null) return;
	GameEvents.SendCustomGameEventToServer("ChangeReceive", {
		data: { Player_box_index: boxIndex, team: tags.team, LocalPlayerBoxIndex: localBox }
	});
}

// ---------- 入口 ----------

(function () {
	if (!PVP_MAPS[Game.GetMapInfo().map_name]) return;
	root.AddClass("bp_root");
	if (!TeamTags()) {
		// 观战者只显示阶段
		var label = $.CreatePanel("Label", root, "");
		label.AddClass("bp_spectator");
		var update = function () {
			var s = State();
			label.text = s == 1 ? "BAN人时间" : s == 2 ? "选人时间" : "决策时间";
			$.Schedule(0.5, update);
		};
		update();
		return;
	}
	HideDefault(["HeroPickScreenContents", "FriendsAndFoes", "PreMinimapContainer"]);
	CustomNetTables.SubscribeNetTableListener("react_table", QueueRefresh);
	GameEvents.Subscribe("React_BP_Init", QueueRefresh);
	GameEvents.Subscribe("React_Change_State", QueueRefresh);
	GameEvents.Subscribe("LuaDataToReact", QueueRefresh);
	// 重连时让服务器重发初始化
	GameEvents.SendCustomGameEventToServer("ReactToLua", { data: "init" });
	QueueRefresh();
})();
