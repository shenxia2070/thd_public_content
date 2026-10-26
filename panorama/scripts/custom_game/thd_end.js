"use strict";
// 结算界面（原生 Panorama，替代 omg_bp/thd_end_screen 的 React 版本）
// 每队行数按 end_table 里该队的实际玩家数生成，5v5 与 6v6 共用。Tab 切换显示。

var PVP_MAPS = { "maps/1_thdots_map.vpk": true, "maps/2_thdots_6v6.vpk": true };
var COLUMNS = [
	{ title: "RANK", cls: "col_score" },
	{ title: "本场称号", cls: "col_title" },
	{ title: "等级", cls: "col_lvl" },
	{ title: "组合", cls: "col_combo" },
	{ title: "K/D/A", cls: "col_kda" },
	{ title: "财产", cls: "col_gold" },
	{ title: "物品", cls: "col_items" },
	{ title: "输出", cls: "col_num" },
	{ title: "承受", cls: "col_num" },
	{ title: "治疗", cls: "col_num" },
	{ title: "GPM", cls: "col_num" },
	{ title: "XPM", cls: "col_num" }
];

var root = $.GetContextPanel();
var screen = null;

function Pad(n) { return (n < 10 ? "0" : "") + n; }

function Cell(row, cls) {
	var cell = $.CreatePanel("Panel", row, "");
	cell.AddClass("end_cell");
	cell.AddClass(cls);
	return cell;
}

function Text(parent, text, cls) {
	var label = $.CreatePanel("Label", parent, "");
	label.AddClass(cls || "end_text");
	label.text = text === undefined || text === null ? "" : String(text);
	return label;
}

function Values(obj) {
	var list = [];
	for (var k in obj || {}) list.push(obj[k]);
	return list;
}

function AddHeader(parent) {
	var row = $.CreatePanel("Panel", parent, "");
	row.AddClass("end_row");
	row.AddClass("end_header");
	Cell(row, "col_player");
	for (var i = 0; i < COLUMNS.length; i++) Text(Cell(row, COLUMNS[i].cls), COLUMNS[i].title, "end_head_text");
}

function AddPlayer(parent, player, titles) {
	var row = $.CreatePanel("Panel", parent, "");
	row.AddClass("end_row");
	row.SetHasClass("end_local", player.PlayerID == Game.GetLocalPlayerID());

	var who = Cell(row, "col_player");
	var avatar = $.CreatePanel("DOTAAvatarImage", who, "");
	avatar.AddClass("end_avatar");
	avatar.steamid = player.lid;
	var name = $.CreatePanel("DOTAUserName", who, "");
	name.AddClass("end_name");
	name.steamid = player.lid;

	Text(Cell(row, "col_score"), player.score);

	var titleCell = Cell(row, "col_title");
	for (var t = 0; t < titles.length; t++) {
		var image = $.CreatePanel("Image", titleCell, "");
		image.AddClass("end_title_image");
		image.SetImage("file://{resources}/images/hud/end/title_" + titles[t] + ".png");
	}

	Text(Cell(row, "col_lvl"), player.lvl);

	var combo = Cell(row, "col_combo");
	var hero = $.CreatePanel("Image", combo, "");
	hero.AddClass("end_hero");
	hero.SetImage("file://{images}/heroes/thd2_" + player.hero + ".png");
	hero.SetScaling("stretch-to-fit-preserve-aspect");
	var skills = [player.normalSkill, player.ultimateSkill];
	for (var s = 0; s < skills.length; s++) {
		if (!skills[s]) continue;
		var ability = $.CreatePanel("DOTAAbilityImage", combo, "");
		ability.AddClass("end_ability");
		ability.abilityname = skills[s];
		(function (panel, abilityName) {
			panel.SetPanelEvent("onmouseover", function () { $.DispatchEvent("DOTAShowAbilityTooltip", panel, abilityName); });
			panel.SetPanelEvent("onmouseout", function () { $.DispatchEvent("DOTAHideAbilityTooltip", panel); });
		})(ability, skills[s]);
	}

	Text(Cell(row, "col_kda"), player.kill + "/" + player.death + "/" + player.assist);
	Text(Cell(row, "col_gold"), player.gold);

	var items = Cell(row, "col_items");
	for (var i = 1; i <= 6; i++) {
		var item = $.CreatePanel("DOTAItemImage", items, "");
		item.AddClass("end_item");
		item.itemname = player.items ? player.items[String(i)] || "" : "";
	}
	var neutral = $.CreatePanel("DOTAItemImage", items, "");
	neutral.AddClass("end_item");
	neutral.AddClass("end_neutral");
	neutral.itemname = player.neutralItem || "";

	Text(Cell(row, "col_num"), player.doneDamage);
	Text(Cell(row, "col_num"), player.takeDamage);
	Text(Cell(row, "col_num"), Math.floor(player.heal || 0));
	Text(Cell(row, "col_num"), player.gpm);
	Text(Cell(row, "col_num"), player.xpm);
}

function Render() {
	var end = CustomNetTables.GetTableValue("end_table", "keys");
	if (!end) return;
	root.RemoveAndDeleteChildren();
	screen = $.CreatePanel("Panel", root, "thd_end_screen");
	screen.AddClass("end_screen");

	var winnerName = end.winner == DOTATeam_t.DOTA_TEAM_GOODGUYS ? "博丽" : "守矢";
	Text(screen, winnerName + "获胜", "end_winner");
	var now = new Date();
	var date = now.getFullYear() + "/" + Pad(now.getMonth() + 1) + "/" + Pad(now.getDate()) + " " + Pad(now.getHours()) + ":" + Pad(now.getMinutes());
	Text(screen, "日期: " + date + "  时长: " + Math.floor((end.time || 0) / 60) + " 分钟", "end_info");

	// 称号：chenghao[称号编号] = PlayerID
	var titlesByPlayer = {};
	for (var key in end.chenghao || {}) {
		var pid = end.chenghao[key];
		if (pid === -1 || pid === undefined) continue;
		(titlesByPlayer[pid] = titlesByPlayer[pid] || []).push(key);
	}

	var table = $.CreatePanel("Panel", screen, "");
	table.AddClass("end_table");
	var teams = [
		{ id: DOTATeam_t.DOTA_TEAM_GOODGUYS, name: "博丽", kills: end.hakureiKills },
		{ id: DOTATeam_t.DOTA_TEAM_BADGUYS, name: "守矢", kills: end.moriyaKills }
	];
	var players = Values(end.players);
	for (var t = 0; t < teams.length; t++) {
		var title = $.CreatePanel("Panel", table, "");
		title.AddClass("end_team_title");
		title.SetHasClass("end_team_winner", end.winner == teams[t].id);
		Text(title, teams[t].name + "  " + (teams[t].kills || 0), "end_team_name");
		AddHeader(table);
		for (var p = 0; p < players.length; p++) {
			if (players[p].teamnumber == teams[t].id) AddPlayer(table, players[p], titlesByPlayer[players[p].PlayerID] || []);
		}
	}

	var finish = $.CreatePanel("TextButton", screen, "");
	finish.AddClass("ButtonBevel");
	finish.AddClass("end_finish");
	finish.text = "结束";
	finish.SetPanelEvent("onactivate", function () { Game.FinishGame(); });
}

(function () {
	if (!PVP_MAPS[Game.GetMapInfo().map_name]) return;
	var p = root;
	while (p.GetParent()) p = p.GetParent();
	var defaultEnd = p.FindChildTraverse("GameEndContainer");
	if (defaultEnd) defaultEnd.visible = false;
	GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ENDGAME, true);

	CustomNetTables.SubscribeNetTableListener("end_table", Render);
	Render();

	// Tab 切换结算面板
	var command = "ThdEndToggle" + Math.floor(Math.random() * 99999999);
	Game.CreateCustomKeyBind("Tab", command);
	Game.AddCommand(command, function () {
		if (screen) screen.visible = !screen.visible;
	}, "", 0);
})();
