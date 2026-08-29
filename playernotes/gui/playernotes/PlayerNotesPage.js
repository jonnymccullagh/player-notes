class PlayerNotesPage
{
	constructor(dialog, selectedPlayer, currentPlayers, closePageCallback)
	{
		this.playerNoteStore = getPlayerNoteStore();
		this.selectedPlayer = selectedPlayer;
		this.currentPlayers = Array.isArray(currentPlayers) ? currentPlayers.slice() : [];
		this.selectedNoteIndex = -1;
		this.selectedPlayerIndex = -1;
		this.savedPlayers = [];
		this.closePageCallback = closePageCallback;

		this.playerList = Engine.GetGUIObjectByName("playerNotesPlayerList");
		this.playerListFeedback = Engine.GetGUIObjectByName("playerNotesPlayerListFeedback");
		this.notesList = Engine.GetGUIObjectByName("playerNotesList");
		this.notesListFeedback = Engine.GetGUIObjectByName("playerNotesListFeedback");
		this.closeButton = Engine.GetGUIObjectByName("playerNotesCloseButton");
		this.deletePlayerButton = Engine.GetGUIObjectByName("playerNotesDeletePlayerButton");
		this.deleteNoteButton = Engine.GetGUIObjectByName("playerNotesDeleteNoteButton");
		this.addNoteButton = Engine.GetGUIObjectByName("playerNotesAddButton");

		this.playerList.onSelectionChange = this.onPlayerSelectionChange.bind(this);
		this.notesList.onSelectionChange = this.onNoteSelectionChange.bind(this);
		this.closeButton.onPress = this.closePage.bind(this);
		this.deletePlayerButton.onPress = this.deletePlayer.bind(this);
		this.deleteNoteButton.onPress = this.deleteSelectedNote.bind(this);
		this.addNoteButton.onPress = this.openAddNotePage.bind(this);

		this.openPage();
	}

	openPage()
	{
		this.refreshPanels();
	}

	refreshPanels()
	{
		this.playerNoteStore.reload();
		this.savedPlayers = this.sortPlayers(this.playerNoteStore.listPlayers());
		this.selectedPlayerIndex = this.findSelectedPlayerIndex();
		this.selectedNoteIndex = -1;
		this.renderPlayers();
		this.renderNotes();
		this.render();
	}

	closePage()
	{
		this.closePageCallback({});
	}

	findSelectedPlayerIndex()
	{
		if (!this.selectedPlayer)
			return this.savedPlayers.length ? 0 : -1;

		const selectedPlayer = this.playerNoteStore.resolvePlayerName(
			this.selectedPlayer,
			this.getLivePlayerNames());
		const index = this.savedPlayers.indexOf(selectedPlayer);
		return index != -1 ? index : (this.savedPlayers.length ? 0 : -1);
	}

	onPlayerSelectionChange()
	{
		this.selectedPlayerIndex = this.playerList.selected;
		this.selectedPlayer = this.savedPlayers[this.selectedPlayerIndex] || this.selectedPlayer;
		this.selectedNoteIndex = -1;
		this.renderNotes();
		this.render();
	}

	onNoteSelectionChange()
	{
		this.selectedNoteIndex = this.notesList.selected;
		this.render();
	}

	getResolvedPlayerName()
	{
		return this.savedPlayers[this.selectedPlayerIndex] ||
			this.playerNoteStore.resolvePlayerName(
				this.selectedPlayer,
				this.getLivePlayerNames());
	}

	getNotes()
	{
		return this.playerNoteStore.getNotes(this.getResolvedPlayerName());
	}

	getLivePlayerNames()
	{
		if (this.currentPlayers.length)
			return this.currentPlayers.slice();

		return Engine.GetPlayerList().map(player => player.name);
	}

	getCurrentPlayerKeys()
	{
		return new Set(this.getLivePlayerNames()
			.map(playerName => this.playerNoteStore.sanitizePlayerName(playerName).toLowerCase())
			.filter(playerName => !!playerName));
	}

	isCurrentPlayer(playerName)
	{
		const playerKey = this.playerNoteStore.sanitizePlayerName(playerName).toLowerCase();
		return this.getCurrentPlayerKeys().has(playerKey);
	}

	sortPlayers(playerNames)
	{
		const currentPlayerKeys = this.getCurrentPlayerKeys();
		return playerNames.slice().sort((playerA, playerB) =>
		{
			const playerAIsCurrent = currentPlayerKeys.has(playerA.toLowerCase());
			const playerBIsCurrent = currentPlayerKeys.has(playerB.toLowerCase());

			if (playerAIsCurrent != playerBIsCurrent)
				return playerAIsCurrent ? -1 : 1;

			return playerA.toLowerCase().localeCompare(playerB.toLowerCase()) ||
				playerA.localeCompare(playerB);
		});
	}

	renderPlayers()
	{
		this.playerList.hidden = !this.savedPlayers.length;
		this.playerListFeedback.hidden = !!this.savedPlayers.length;
		this.playerList.list_player = this.savedPlayers.map(playerName =>
			this.isCurrentPlayer(playerName) ?
				setStringTags(escapeText(playerName), this.CurrentPlayerTags) :
				escapeText(playerName));
		this.playerList.list = this.savedPlayers.map((playerName, index) => String(index));
		this.playerList.list_data = this.savedPlayers.map(playerName => playerName);
		this.playerList.selected = this.selectedPlayerIndex;
	}

	renderNotes()
	{
		const notes = this.getNotes();

		this.notesList.hidden = !notes.length;
		this.notesListFeedback.hidden = !!notes.length;
		this.notesList.list_note = notes.map(note => escapeText(note));
		this.notesList.list = notes.map((note, index) => String(index));
		this.notesList.list_data = notes.map((note, index) => String(index));

		if (this.selectedNoteIndex >= notes.length)
			this.selectedNoteIndex = notes.length - 1;

		this.notesList.selected = this.selectedNoteIndex;
	}

	render()
	{
		const playerName = this.getResolvedPlayerName();
		const notes = this.getNotes();
		const selectedNote =
			this.selectedNoteIndex >= 0 ? notes[this.selectedNoteIndex] : undefined;

		this.addNoteButton.enabled = true;
		this.deletePlayerButton.enabled = !!notes.length;
		this.deleteNoteButton.enabled = this.selectedNoteIndex >= 0;
		this.notesListFeedback.caption = playerName ?
			translate("No notes saved for this player.") :
			translate("Select a player on the left.");
	}

	async openAddNotePage()
	{
		const data = await Engine.OpenChildPage("page_playernotes_add.xml", {
			"selectedPlayer": this.selectedPlayer,
			"currentPlayers": this.getLivePlayerNames()
		});
		if (!data || !data.playerName)
			return;

		this.selectedPlayer = data.playerName;
		this.refreshPanels();
		this.selectedPlayerIndex = this.findSelectedPlayerIndex();
		this.selectedNoteIndex = this.getNotes().length - 1;
		this.renderPlayers();
		this.renderNotes();
		this.render();
	}

	async deleteSelectedNote()
	{
		const playerName = this.getResolvedPlayerName();
		const notes = this.getNotes();
		const selectedNote = notes[this.selectedNoteIndex];
		if (!selectedNote)
			return;

		const buttonIndex = await messageBox(
			500, 220,
			sprintf(translate("Delete the selected note for %(player)s?"), {
				"player": escapeText(playerName)
			}),
			translate("Delete Note"),
			[translate("Cancel"), translate("Delete")]);
		if (buttonIndex !== 1)
			return;

		if (!this.playerNoteStore.deleteNote(playerName, this.selectedNoteIndex))
		{
			this.render();
			return;
		}

		this.savedPlayers = this.playerNoteStore.listPlayers();
		this.selectedPlayerIndex = this.findSelectedPlayerIndex();
		this.renderPlayers();
		this.renderNotes();
		this.render();
	}

	async deletePlayer()
	{
		const playerName = this.getResolvedPlayerName();
		if (!playerName || !this.getNotes().length)
			return;

		const buttonIndex = await messageBox(
			500, 220,
			sprintf(translate("Delete all saved notes for %(player)s?"), {
				"player": escapeText(playerName)
			}),
			translate("Delete Player Notes"),
			[translate("Cancel"), translate("Delete")]);
		if (buttonIndex !== 1)
			return;

		if (!this.playerNoteStore.deletePlayer(playerName))
		{
			this.render();
			return;
		}

		this.savedPlayers = this.playerNoteStore.listPlayers();
		this.selectedPlayer = this.savedPlayers[0] || "";
		this.selectedPlayerIndex = this.findSelectedPlayerIndex();
		this.selectedNoteIndex = -1;
		this.renderPlayers();
		this.renderNotes();
		this.render();
	}
}

PlayerNotesPage.prototype.CurrentPlayerTags = {
	"color": "0 200 0"
};
