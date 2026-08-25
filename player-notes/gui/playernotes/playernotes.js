function init(data)
{
	return new Promise(closePageCallback =>
		new PlayerNotesPage(
			data?.dialog,
			data?.selectedPlayer,
			data?.currentPlayers,
			closePageCallback));
}
