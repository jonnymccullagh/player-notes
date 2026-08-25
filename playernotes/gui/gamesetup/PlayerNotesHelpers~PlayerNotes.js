function getGameSetupPlayerNames()
{
	return Object.values(g_PlayerAssignments)
		.filter(assignment => assignment && assignment.player != -1 && assignment.name)
		.map(assignment => assignment.name);
}

async function openGameSetupPlayerNotes(selectedPlayer = "", openAddNoteWhenEmpty = false)
{
	const currentPlayers = getGameSetupPlayerNames();
	const playerNoteStore = getPlayerNoteStore();
	playerNoteStore.reload();

	if (openAddNoteWhenEmpty && selectedPlayer && !playerNoteStore.getNotes(selectedPlayer).length)
		return Engine.OpenChildPage("page_playernotes_add.xml", {
			"selectedPlayer": selectedPlayer,
			"currentPlayers": currentPlayers
		});

	return Engine.OpenChildPage("page_playernotes.xml", {
		"selectedPlayer": selectedPlayer,
		"currentPlayers": currentPlayers
	});
}
