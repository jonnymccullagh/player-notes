class LobbyPage_PlayerNotes extends LobbyPage
{
	constructor(...args)
	{
		super(...args);

		const playerList = this.lobbyPage.panels.playerList;
		this.lobbyPage.buttons.playerNotesButton = new PlayerNotesButton(
			playerList, this.lobbyPage.panels.profilePanel);
	}
}

LobbyPage = LobbyPage_PlayerNotes;
