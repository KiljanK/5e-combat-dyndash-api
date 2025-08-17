# 5e-combat-dyndash-api

This application enables users to create [DynDash](https://github.com/dd-framework/DynDash) Dashboards to assist during [5e](https://roll20.net/compendium/dnd5e/) combat encounters. It is not intended to be an entire combat tracker with hit points and abilities. I simply wanted to create a tool that would quickly give me an overview on the to-hit bonuses in relation to my players' armor classes.

The [express.js](https://expressjs.com) server scrapes information on [5e](https://roll20.net/compendium/dnd5e/) Characters and Creature Statblocks from simplified [Markdown](https://en.wikipedia.org/wiki/Markdown) files ([see why](#why-markdown-files)). It also harbors a digital dice object that can be interacted with through specific endpoints. All of this is served under the [API specification](https://github.com/dd-framework/DynDash/blob/main/example_provider/API_SPECIFICATION.md) that makes the data available to any connected [DynDash](https://github.com/dd-framework/DynDash) application.

---

## Structure

![Structure_Graph](/resources/5e_Combat_DynDash_API.png)

---

## Screenshots

The provided Component should be able to display Sources of the Data Type `digitalDice`, `5eParty`, and `5eEncounter`.

The Component allows for the selection of an active statblock from a list of loaded statblocks (bottom left). It also enables the addition of situational bonuses, advantage, and disadvantage.

It displays the result of the most recent roll(s) based on the selected statblock and other selected bonuses / settings (top left).

Finally, it lists all party members with information on whether or not the result has hit their AC (right). It also allows for the selection of situational bonuses for the individual party members.

![Component_Screenshot](/resources/Example_Screenshot.png)

I am strongly considering breaking up these three panes into separate Components for individual use, to allow for reordering them on the Dashboard, instead of confining them to this rigid structure (which kind of goes against the idea of flexible dashboarding).

---

## Installation

Run the following command for installation
```sh
npm install
```

You may need to extend the `safelist` of the [`tailwind.config.js`](https://github.com/dd-framework/DynDash/blob/main/tailwind.config.js) inside your DynDash application with the following lines, depending on the version of your installation:
```js
"w-[75%]",
"w-[10%]",
"w-[15%]",
"h-[75%]",
"h-[30%]",
"h-[65%]",
"translate-x-[70%]",
{
  pattern:
    /.*(translate|top|right|left|bottom|animate|w|h|items|justify|flex|rounded|px|py|p).*/,
},
```

---

## Setup

As previously mentioned, the application scrapes data from Markdown files ([see why](#why-markdown-files)). You need to define the correct folder paths in the [configuration file](/5e_combat_provider/config.json) of this application (ideally before running it, but it might work at runtime in some cases).

The `party-paths` object expects party names as keys that map to absolute paths of the respective party folders that are structured like this:

```
party_folder
├─ player_A.md
├─ player_B.md
└─ player_C.md
```

Each player file should be a Markdown file that contains a mandatory frontmatter property for `armor-class` and an optional property for potential `armor-bonuses` that stray from the common `+2` and `+5` bonuses related to cover.

Additionally, as seen in the example below, a player file might include an embedded image of the character. To allow the application to load these images, ensure that the linked image is only referred to by its direct file name (no prepended directories) and add the absolute path of its parent directory to the `image-paths` array inside of the [configuration file](/5e_combat_provider/config.json). The application checks for embedded images in the formats `![name](image_name.ext)` and `![[image_name.ext]]`. When using the latter, ensure that the wikilink does not have an alias (`![[image_name.ext|alias]]`).

```markdown
---
armor-class: 12
armor-bonuses:
  - "3"
  - "-4"
---

![[figure_a.png]]
```

The `encounter-paths` object works in the same way. However, it is also possible to load all encounters within a parent folder by adding the parent folder's absolute path to the `session-paths` array. In the latter case, the encounter names will be automatically generated from the folder names of each encounter.

```
session_folder_1
├─ encounter_devils
│  ├─ devil_large.md
│  └─ imp.md
└─ encounter_elementals
   ├─ fire_elemental.md
   ├─ water_elemental.md
   └─ ice_elemental.md
```

Each statblock file should be a Markdown file that contains a mandatory frontmatter property for `attack-bonus`:

```markdown
---
attack-bonus: 3
---
```

---

## Running the Application

Run the following command to start the application
```sh
npm start
```

Connect to a running [DynDash](https://github.com/dd-framework/DynDash) application by pasting the URL [`http://localhost:4453/`](http://localhost:4453/) into its [Config Editor](http://localhost:3002/) and hitting the `+` button, followed by the `Save` button. You should be able to select all of the things you want the application to provide (refresh the page if you aren't able to do so).

> [!NOTE]
> The Components of the [this application](https://github.com/KiljanK/5e-combat-dyndash-api) can be used in conjunction with the dice from the [pixels-dyndash-api](https://github.com/KiljanK/pixels-dyndash-api), since both providers use the same `digitalDice` Data Type.

---

## Why Markdown Files?

It may seem like a really weird choice to store the relevant data in [Markdown](https://en.wikipedia.org/wiki/Markdown) files. There is no denying that it is a little unconventional.

The motivation for doing it like this anyways is that I _already_ store my 5e Campaign notes and data in `.md` files and wanted to make use of the structures that were already in place.

From my understanding, many people use [Markdown](https://en.wikipedia.org/wiki/Markdown) files inside [Obsidian](http://obsidian.md) or [Logseq](https://logseq.com) vaults for this very purpose as well, so I felt like this would be an acceptable way of implementing it.

Additionally, the format is simple enough for people to quickly set their data up in the correct way. A good starting point for this is the [`/examples/`](/examples/README.md) directory.

---

## License

The project is licensed under the [GNU AGPL v3 License](https://www.gnu.org/licenses/agpl-3.0.de.html)

---