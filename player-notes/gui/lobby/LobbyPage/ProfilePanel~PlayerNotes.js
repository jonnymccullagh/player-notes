class ProfilePanel_PlayerNotes extends ProfilePanel
{
	constructor(...args)
	{
		super(...args);
		this.playerNoteStore = getPlayerNoteStore();
		this.playerNotesLabel = Engine.GetGUIObjectByName("playerNotesLabel");
		this.playerNotesText = Engine.GetGUIObjectByName("playerNotesText");
	}

	requestProfile(playerName)
	{
		super.requestProfile(playerName);
		this.updateNotes(playerName);
	}

	onProfile()
	{
		super.onProfile();
		this.updateNotes(this.requestedPlayer);
	}

	updateNotes(playerName)
	{
		this.playerNoteStore.reload();
		const notes = this.playerNoteStore.getNotes(playerName);
		this.playernameText.tooltip = this.playerNoteStore.formatTooltip(playerName);
		this.playerNotesLabel.hidden = !notes.length;
		this.playerNotesText.hidden = !notes.length;
		this.playerNotesText.caption = "- " + notes.map(note => escapeText(note)).join("\n- ");
	}
}

ProfilePanel = ProfilePanel_PlayerNotes;
