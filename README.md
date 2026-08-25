# Player Notes Mod

Player Notes is a [0 A.D.](https://play0ad.com) mod for keeping private notes about other online player.
This is useful to keep track of players that like to rush early or that lag frequently.

![Player Notes](notes-icon.png)

## Features

- Add, view and delete notes for multiplayer players from the `Notes` button in the online lobby
- Mark players with saved notes using a ◊ next to their name
- Show saved notes immediately when hovering over a player in the lobby
- Open a player's notes directly from Game Setup by clicking their name or the notes icon
- Keep all notes on your own computer; they are not sent to other players or included in the match data

## Installation

Copy the contents of the `player-notes` folder to your 0 A.D. mods directory. On Linux this is normally:

```
/home/$USER/.local/share/0ad/mods
```

Then enable **Player Notes** in the 0 A.D. Mod Selection screen. Load it after `0ad` when using a development build.

## Usage

In the online lobby, select a player and press `Notes` to add or manage their notes. A ◊ beside a player's name means you have one or more saved notes for them; hover their name to read them.

In Game Setup, click an assigned player's name or the notes icon to open their notes. This is useful for checking your notes before starting a match.

## Where are my notes?

Player Notes stores its data locally as JSON at `moddata/player-notes.json` in your 0 A.D. user-data directory. The file is private to your local installation and can be backed up with the rest of your 0 A.D. user data.
