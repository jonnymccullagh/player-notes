class PlayerName_PlayerNotes extends PlayerSettingControls.PlayerName
{
	constructor(...args)
	{
		super(...args);
		this.playerNoteStore = getPlayerNoteStore();
		this.playerName.tooltip_style = "onscreenToolTip";
		this.playerName.onMouseLeftPress = this.onPress.bind(this);
		this.updateNotesTooltip();
	}

	onPlayerAssignmentsChange()
	{
		super.onPlayerAssignmentsChange();
		this.updateNotesTooltip();
	}

	render()
	{
		super.render();
		this.updateNotesTooltip();
	}

	onPress()
	{
		const playerName = this.getAssignedPlayerName();
		if (!playerName)
			return;

		openGameSetupPlayerNotes(playerName);
	}

	getAssignedPlayerName()
	{
		return this.guid && g_PlayerAssignments[this.guid] ?
			g_PlayerAssignments[this.guid].name || "" :
			"";
	}

	updateNotesTooltip()
	{
		const playerName = this.getAssignedPlayerName();
		if (!playerName)
		{
			this.playerName.tooltip = "";
			return;
		}

		this.playerNoteStore.reload();
		const notesTooltip = this.playerNoteStore.formatTooltip(playerName);
		this.playerName.tooltip = notesTooltip ||
			sprintf(this.OpenTooltip, {
				"player": escapeText(playerName)
			});
	}
}

PlayerName_PlayerNotes.prototype.OpenTooltip =
	translate("Click to open local notes for %(player)s.");

PlayerSettingControls.PlayerName = PlayerName_PlayerNotes;
