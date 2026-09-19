class PlayerNotesButton
{
	constructor()
	{
		this.button = Engine.GetGUIObjectByName("playerNotesButton");
		if (!this.button)
			return;

		this.button.hidden = !g_IsNetworked;
		this.button.tooltip = this.Tooltip;
		this.button.onPress = this.onPress.bind(this);
	}

	onPress()
	{
		openGameSetupPlayerNotes();
	}
}

PlayerNotesButton.prototype.Tooltip =
	translate("Show local notes for players in this match.");
