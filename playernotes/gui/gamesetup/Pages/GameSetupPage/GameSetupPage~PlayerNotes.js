class SetupWindowPagesGameSetupPage_PlayerNotes extends SetupWindowPages.GameSetupPage
{
	constructor(...args)
	{
		super(...args);
		this.panelButtons.playerNotesButton = new PlayerNotesButton();
	}
}

SetupWindowPages.GameSetupPage = SetupWindowPagesGameSetupPage_PlayerNotes;
