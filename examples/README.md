# Pre-Built Examples

This directory serves as an example for a minimal setup spanning a couple of characters and statblocks.

You need to choose the folders you want to use and copy their absolute paths into the [configuration file](/5e_combat_provider/config.json). To figure out which folders are intended for which potential configuration option, check the [README](/README.md#setup).

Your [configuration file](/5e_combat_provider/config.json) may look like this (with the correct paths inserted, obviously):

```json
{
	"party-paths": {
		"Main Party": "PASTE YOUR ABSOLUTE PATH TO THE FOLDER /examples/parties/party_folder HERE FOR TESTING, OR CHOOSE YOUR OWN FOLDER",
		"Backups": "PASTE YOUR ABSOLUTE PATH TO THE FOLDER /examples/parties/backup_characters HERE FOR TESTING, OR CHOOSE YOUR OWN FOLDER"
	},

	"encounter-paths": {
		"Next Session Preview": "PASTE YOUR ABSOLUTE PATH TO THE FOLDER /examples/session_folder_2/encounter_birds HERE FOR TESTING, OR CHOOSE YOUR OWN FOLDER"
	},

	"session-paths": [
		"PASTE YOUR ABSOLUTE PATH TO THE FOLDER /examples/session_folder_1 HERE FOR TESTING, OR CHOOSE YOUR OWN FOLDER"
	],

	"image-paths": [
		"PASTE YOUR ABSOLUTE PATH TO THE FOLDER /examples/images_a HERE FOR TESTING, OR CHOOSE YOUR OWN FOLDER",
		"PASTE YOUR ABSOLUTE PATH TO THE FOLDER /examples/images_b HERE FOR TESTING, OR CHOOSE YOUR OWN FOLDER",
	],

	"standard-bonuses": ["+2", "+5"]
}

```