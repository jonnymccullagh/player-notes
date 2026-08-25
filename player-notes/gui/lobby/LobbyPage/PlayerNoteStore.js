class PlayerNoteStore
{
	constructor()
	{
		this.filename = "moddata/player-notes.json";
		this.notesByPlayer = this.load();
	}

	reload()
	{
		this.notesByPlayer = this.load();
	}

	load()
	{
		if (!Engine.FileExists(this.filename))
			return {};

		const data = Engine.ReadJSONFile(this.filename);
		if (!Array.isArray(data))
			return {};

		const notesByPlayer = {};
		for (const entry of data)
		{
			const playerName = this.sanitizePlayerName(entry?.username);
			if (!playerName)
				continue;

			const notes = Array.isArray(entry?.notes) ?
				entry.notes
					.map(note => this.sanitizeNote(note))
					.filter(note => !!note) :
				[];

			if (!notes.length)
				continue;

			notesByPlayer[this.playerKey(playerName)] = {
				"username": playerName,
				"notes": notes
			};
		}

		return notesByPlayer;
	}

	save()
	{
		Engine.WriteJSONFile(
			this.filename,
			Object.values(this.notesByPlayer).sort((playerA, playerB) =>
				playerA.username.localeCompare(playerB.username)));
	}

	playerKey(playerName)
	{
		return playerName.toLowerCase();
	}

	sanitizePlayerName(playerName)
	{
		return typeof playerName == "string" ? playerName.trim() : "";
	}

	sanitizeNote(note)
	{
		if (typeof note != "string")
			return "";

		return note
			.replace(/[\u0000-\u001F\u007F]/g, " ")
			.replace(/\s+/g, " ")
			.trim();
	}

	resolvePlayerName(playerName, candidatePlayerNames = [])
	{
		const sanitizedName = this.sanitizePlayerName(playerName);
		if (!sanitizedName)
			return "";

		const lowerName = this.playerKey(sanitizedName);

		const savedPlayerNames = Object.values(this.notesByPlayer).map(entry => entry.username);
		const playerNames = [...savedPlayerNames];
		for (const candidatePlayerName of candidatePlayerNames)
			if (playerNames.indexOf(candidatePlayerName) == -1)
				playerNames.push(candidatePlayerName);

		const exactMatch = playerNames.find(name => this.playerKey(name) == lowerName);
		if (exactMatch)
			return exactMatch;

		const prefixMatches = playerNames.filter(name => this.playerKey(name).startsWith(lowerName));
		if (prefixMatches.length == 1)
			return prefixMatches[0];

		return sanitizedName;
	}

	getEntry(playerName)
	{
		const resolvedName = this.resolvePlayerName(playerName);
		if (!resolvedName)
			return undefined;

		return this.notesByPlayer[this.playerKey(resolvedName)];
	}

	getNotes(playerName)
	{
		return this.getEntry(playerName)?.notes || [];
	}

	listPlayers()
	{
		return Object.values(this.notesByPlayer)
			.sort((playerA, playerB) =>
				playerA.username.toLowerCase().localeCompare(playerB.username.toLowerCase()) ||
				playerA.username.localeCompare(playerB.username))
			.map(entry => entry.username);
	}

	addNote(playerName, note, candidatePlayerNames = [])
	{
		const sanitizedName = this.resolvePlayerName(playerName, candidatePlayerNames);
		const sanitizedNote = this.sanitizeNote(note);

		if (!sanitizedName || !sanitizedNote)
			return false;

		const key = this.playerKey(sanitizedName);
		const entry = this.notesByPlayer[key] || {
			"username": sanitizedName,
			"notes": []
		};

		entry.username = sanitizedName;
		entry.notes.push(sanitizedNote);
		this.notesByPlayer[key] = entry;
		this.save();
		return true;
	}

	deleteNote(playerName, noteIndex)
	{
		const entry = this.getEntry(playerName);
		if (!entry || noteIndex < 0 || noteIndex >= entry.notes.length)
			return false;

		entry.notes.splice(noteIndex, 1);
		if (!entry.notes.length)
			delete this.notesByPlayer[this.playerKey(entry.username)];

		this.save();
		return true;
	}

	deletePlayer(playerName)
	{
		const entry = this.getEntry(playerName);
		if (!entry)
			return false;

		delete this.notesByPlayer[this.playerKey(entry.username)];
		this.save();
		return true;
	}

	formatNotes(playerName)
	{
		const sanitizedName = this.sanitizePlayerName(playerName);
		const notes = this.getNotes(sanitizedName);
		if (!notes.length)
		{
			return sprintf(translate("No local notes saved for %(player)s."), {
				"player": escapeText(sanitizedName)
			});
		}

		return sprintf(translate("Local notes for %(player)s:"), {
			"player": escapeText(sanitizedName)
		}) + "\n- " + notes.map(note => escapeText(note)).join("\n- ");
	}

	formatTooltip(playerName)
	{
		const notes = this.getNotes(playerName);
		if (!notes.length)
			return "";

		return setStringTags(translate("Local Notes"), this.TooltipHeaderTags) +
			"\n- " + notes.map(note => escapeText(note)).join("\n- ");
	}
}

PlayerNoteStore.prototype.TooltipHeaderTags = {
	"font": "sans-bold-14",
	"color": "237 227 167"
};

function getPlayerNoteStore()
{
	if (!globalThis.g_PlayerNoteStore)
		globalThis.g_PlayerNoteStore = new PlayerNoteStore();

	return globalThis.g_PlayerNoteStore;
}
