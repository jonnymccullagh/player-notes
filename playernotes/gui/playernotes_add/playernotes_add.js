function init(data)
{
	return new Promise(closePageCallback =>
		new AddPlayerNotePage(data?.selectedPlayer, data?.currentPlayers, closePageCallback));
}
