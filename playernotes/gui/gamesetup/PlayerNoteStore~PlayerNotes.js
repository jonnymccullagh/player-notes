if (!globalThis.getPlayerNoteStore)
{
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

				const key = this.playerKey(playerName);
				if (notesByPlayer[key])
					notesByPlayer[key].notes.push(...notes);
				else
					notesByPlayer[key] = {
						"username": playerName,
						"notes": notes
					};
			}

			return notesByPlayer;
		}

		playerKey(playerName)
		{
			return playerName.toLowerCase();
		}

		sanitizePlayerName(playerName)
		{
			if (typeof playerName != "string")
				return "";

			return splitRatingFromNick(playerName.trim()).nick;
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
			{
				const sanitizedCandidate = this.sanitizePlayerName(candidatePlayerName);
				if (sanitizedCandidate &&
				    playerNames.every(name => this.playerKey(name) != this.playerKey(sanitizedCandidate)))
					playerNames.push(sanitizedCandidate);
			}

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

		formatTooltip(playerName)
		{
			const notes = this.getNotes(playerName);
			if (!notes.length)
				return "";

			return "- " + notes.map(note => escapeText(note)).join("\n- ");
		}
	}

	globalThis.getPlayerNoteStore = function()
	{
		if (!globalThis.g_PlayerNoteStore)
			globalThis.g_PlayerNoteStore = new PlayerNoteStore();

		return globalThis.g_PlayerNoteStore;
	};
}
