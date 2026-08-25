class PlayerAssignmentItemClient_PlayerNotes extends PlayerAssignmentItem.Client
{
	createItem(...args)
	{
		const item = super.createItem(...args);
		const guid = args[0];
		const playerName = g_PlayerAssignments[guid]?.name;

		if (!playerName)
			return item;

		const playerNoteStore = getPlayerNoteStore();
		if (!playerNoteStore.getNotes(playerName).length)
			return item;

		return {
			...item,
			"Caption": setStringTags(this.NoteMarker, this.NoteMarkerTags) + item.Caption
		};
	}
}

PlayerAssignmentItemClient_PlayerNotes.prototype.NoteMarker = g_NotesSymbol + " ";

PlayerAssignmentItemClient_PlayerNotes.prototype.NoteMarkerTags = {
	"color": "237 227 167"
};

PlayerAssignmentItem.Client = PlayerAssignmentItemClient_PlayerNotes;

class PlayerAssignment_PlayerNotes extends PlayerSettingControls.PlayerAssignment
{
	rebuildList()
	{
		getPlayerNoteStore().reload();
		super.rebuildList();
	}

	onPlayerAssignmentsChange()
	{
		super.onPlayerAssignmentsChange();
		this.updateNotesTooltip();
	}

	render()
	{
		super.render();
		this.updateNotesTooltip();
	}

	onHoverChange()
	{
		this.updateNotesTooltip(this.dropdown.list_data[this.dropdown.hovered]);
	}

	updateNotesTooltip(value = undefined)
	{
		const playerNoteStore = getPlayerNoteStore();
		playerNoteStore.reload();

		const hoveredPlayerName = this.getPlayerNameForValue(value);
		const assignedPlayerName = this.getPlayerNameForValue(this.assignedGUID);
		const playerName = hoveredPlayerName || assignedPlayerName;
		const tooltip = playerName ?
			playerNoteStore.formatTooltip(playerName) || this.Tooltip :
			this.Tooltip;

		this.dropdown.tooltip = tooltip;
		if (this.label)
			this.label.tooltip = tooltip;
	}

	getPlayerNameForValue(value)
	{
		if (!value || !g_PlayerAssignments[value])
			return "";

		return g_PlayerAssignments[value].name || "";
	}
}

PlayerSettingControls.PlayerAssignment = PlayerAssignment_PlayerNotes;
