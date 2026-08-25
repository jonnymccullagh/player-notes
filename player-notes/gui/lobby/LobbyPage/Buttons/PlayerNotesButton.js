class PlayerNotesButton
{
	constructor(playerList, profilePanel)
	{
		this.playerList = playerList;
		this.profilePanel = profilePanel;
		this.button = Engine.GetGUIObjectByName("playerNotesButton");

		this.button.onPress = this.onPress.bind(this);
		playerList.registerSelectionChangeHandler(this.onPlayerSelectionChange.bind(this));

		this.update();
	}

	onPlayerSelectionChange()
	{
		this.update();
	}

	async onPress()
	{
		await Engine.OpenChildPage("page_playernotes.xml", {
			"dialog": true,
			"selectedPlayer": this.playerList.selectedPlayer
		});
		this.playerList.rebuildPlayerList();
		this.profilePanel.updateNotes(this.playerList.selectedPlayer);
	}

	update()
	{
		const selectedPlayer = this.playerList.selectedPlayer;
		this.button.caption = translate("Notes");
		this.button.tooltip = selectedPlayer ?
			sprintf(translate("Manage local notes for %(player)s."), {
				"player": escapeText(selectedPlayer)
			}) :
			translate("Manage local lobby notes.");
	}
}
