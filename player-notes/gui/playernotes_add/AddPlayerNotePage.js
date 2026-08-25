class AddPlayerNotePage
{
	constructor(selectedPlayer, currentPlayers, closePageCallback)
	{
		this.playerNoteStore = getPlayerNoteStore();
		this.selectedPlayer = selectedPlayer;
		this.currentPlayers = Array.isArray(currentPlayers) ? currentPlayers.slice() : [];
		this.closePageCallback = closePageCallback;

		this.nameInput = Engine.GetGUIObjectByName("addPlayerNoteNameInput");
		this.textInput = Engine.GetGUIObjectByName("addPlayerNoteTextInput");
		this.feedbackText = Engine.GetGUIObjectByName("addPlayerNoteFeedback");
		this.cancelButton = Engine.GetGUIObjectByName("addPlayerNoteCancelButton");
		this.saveButton = Engine.GetGUIObjectByName("addPlayerNoteSaveButton");

		this.nameInput.onTextEdit = this.onTextEdit.bind(this);
		this.nameInput.onTab = this.autocompletePlayerName.bind(this);
		this.nameInput.tooltip = colorizeAutocompleteHotkey();
		this.textInput.onTextEdit = this.onTextEdit.bind(this);
		this.textInput.onPress = this.saveNote.bind(this);
		this.cancelButton.onPress = this.closePage.bind(this, {});
		this.saveButton.onPress = this.saveNote.bind(this);

		this.openPage();
	}

	openPage()
	{
		this.nameInput.caption = this.selectedPlayer || "";
		this.textInput.caption = "";
		this.feedbackText.caption = "";
		this.render();

		if (this.nameInput.caption)
			this.textInput.focus();
		else
			this.nameInput.focus();
	}

	closePage(data)
	{
		this.closePageCallback(data);
	}

	getPlayerName()
	{
		return this.nameInput.caption.trim();
	}

	getResolvedPlayerName()
	{
		return this.playerNoteStore.resolvePlayerName(
			this.getPlayerName(),
			this.getLivePlayerNames());
	}

	getNoteText()
	{
		return this.textInput.caption.trim();
	}

	getLivePlayerNames()
	{
		if (this.currentPlayers.length)
			return this.currentPlayers.slice();

		return Engine.GetPlayerList().map(player => player.name);
	}

	autocompletePlayerName()
	{
		autoCompleteText(this.nameInput, this.getLivePlayerNames());
	}

	onTextEdit()
	{
		this.feedbackText.caption = "";
		this.render();
	}

	render()
	{
		this.saveButton.enabled = !!this.getPlayerName() && !!this.getNoteText();
	}

	saveNote()
	{
		const playerName = this.getResolvedPlayerName();
		const note = this.getNoteText();
		if (!playerName)
		{
			this.feedbackText.caption = translate("Please enter a player handle.");
			this.render();
			return;
		}

		if (!note)
		{
			this.feedbackText.caption = translate("Please enter a note.");
			this.render();
			return;
		}

		if (!this.playerNoteStore.addNote(playerName, note, this.getLivePlayerNames()))
		{
			this.feedbackText.caption = translate("Saving the note failed.");
			this.render();
			return;
		}

		this.closePage({
			"playerName": playerName
		});
	}
}
