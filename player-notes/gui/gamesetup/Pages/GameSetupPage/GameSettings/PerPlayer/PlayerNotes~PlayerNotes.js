PlayerSettingControls.PlayerNotes = class PlayerNotes extends GameSettingControl
{
	constructor(...args)
	{
		super(...args);

		this.button = Engine.GetGUIObjectByName("playerNotesButton[" + this.playerIndex + "]");
		this.button.onPress = this.onPress.bind(this);
		this.playerNoteStore = getPlayerNoteStore();
		this.guid = undefined;

		g_GameSettings.playerCount.watch(this.updateVisibility.bind(this), ["nbPlayers"]);
		this.updateVisibility();
	}

	onPlayerAssignmentsChange()
	{
		this.guid = undefined;

		for (const guid in g_PlayerAssignments)
			if (g_PlayerAssignments[guid].player == this.playerIndex + 1)
			{
				this.guid = guid;
				break;
			}

		this.updateVisibility();
	}

	async onPress()
	{
		const playerName = this.getAssignedPlayerName();
		if (playerName)
			await openGameSetupPlayerNotes(playerName, true);

		this.updateVisibility();
	}

	getAssignedPlayerName()
	{
		return this.guid && g_PlayerAssignments[this.guid] ?
			g_PlayerAssignments[this.guid].name || "" :
			"";
	}

	updateVisibility()
	{
		if (!this.button)
			return;

		const playerName = this.getAssignedPlayerName();
		this.button.hidden = this.hidden ||
			this.playerIndex >= g_GameSettings.playerCount.nbPlayers || !playerName;
		if (this.button.hidden)
			return;

		this.playerNoteStore.reload();
		this.button.tooltip = this.playerNoteStore.formatTooltip(playerName) ||
			sprintf(this.Tooltip, {
				"player": escapeText(playerName)
			});
	}
};

PlayerSettingControls.PlayerNotes.prototype.Tooltip =
	translate("Open local notes for %(player)s.");
