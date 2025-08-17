// region Config

const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const yamlFront = require("yaml-front-matter");
const app = express();
const PORT = process.env.PORT || 4453;
const clients = new Map();

app.use(express.json());
app.use(cors());

let config = require("./config.json");

let dataTypes = require("./types.json");
let sources = require("./sources.json");
let data = require("./data.json");

let components = {};

// region Scraper - Components

let readComponentsFromDisk = async () => {
	let dist = path.join(__dirname, "components", "dist");
	let files = [];

	try {
		files = fs.readdirSync(dist);
	} catch (error) {
		console.log("An error occurred while trying to find directory.");
		return;
	}

	for (let file of files) {
		let filePath = path.join(dist, file);
		let stat = fs.statSync(filePath);

		if (stat.isFile() && path.extname(file) === ".js") {
			try {
				const componentName = file.replace(".js", "");
				const readComponent = fs.readFileSync(filePath, "utf8");
				components[componentName] = readComponent;
			} catch (err) {
				console.error(`Error reading file ${file}:`, err);
			}
		}
	}
};

// region Scraper - Config

let readConfig = async () => {
	let config_path = path.join(__dirname, "config.json");

	try {
		const readConfig = fs.readFileSync(config_path, "utf8");
		config = JSON.parse(readConfig);
	} catch (err) {
		console.error(`Error reading config file:`, err);
	}
};

// region Scraper - Images

let readImages = async () => {
	readConfig();

	let image_directory_paths = config["image-paths"];
	let temp_directory = path.join(__dirname, "temp");

	fs.mkdirSync(temp_directory, { recursive: true });

	for (let image_directory_path of image_directory_paths) {
		try {
			const files = fs.readdirSync(image_directory_path);

			for (let file of files) {
				const sourcePath = path.join(image_directory_path, file);
				if (/\.(jpg|jpeg|png|gif|bmp|svg|webp|tiff|tif)$/i.test(file)) {
					const destPath = path.join(temp_directory, file);
					fs.copyFileSync(sourcePath, destPath);
				}
			}
		} catch (error) {
			console.error(
				`Error reading directory ${image_directory_path}:`,
				error
			);
		}
	}
};

// region Scraper - Party

let readParties = async () => {
	readConfig();
	readImages();
	for (let party_name of Object.keys(config["party-paths"])) {
		try {
			let party_path = config["party-paths"][party_name];
			let source_name = `party-${party_name}`
				.toLowerCase()
				.replaceAll(" ", "-");

			let party_object = {
				_meta: {
					toggle: "http://localhost:4453/party/toggle/",
				},
			};
			let player_files = [];
			let player_count = 0;
			let player_names = [];

			try {
				player_files = fs.readdirSync(party_path);
			} catch (error) {
				console.log(
					`An error occurred while trying to find directory ${party_path}`
				);
			}

			players: for (let player_file of player_files) {
				let player_file_path = path.join(party_path, player_file);
				let stat = fs.statSync(player_file_path);

				if (!stat.isFile() || !`${player_file}`.endsWith(".md")) {
					continue players;
				}

				// Getting the player information
				try {
					let player_name = player_file.replace(".md", "");
					let player_file_content = fs.readFileSync(
						player_file_path,
						"utf8"
					);

					let player_images = [];
					let player_image = "player_placeholder.png";

					player_images = player_file_content?.match(
						/!\[([^\]]+?)\]\(([^)]+\.(?:jpg|jpeg|png|gif|bmp|svg|webp|tiff|tif))\)|!\[\[([^\]]+\.(?:jpg|jpeg|png|gif|bmp|svg|webp|tiff|tif))\]\]|\!\[\[([^\]]+?)\|([^\]]+?)\]\]/g
					);

					if (player_images?.length > 0) {
						let likely_player_image = player_images[0];

						let filename_regex =
							/(?<=\(|\[\[)([^)\[]+?\.(?:jpg|jpeg|png|gif|bmp|svg|webp|tiff|tif))(?!\|)/;

						let actual_filename =
							likely_player_image.match(filename_regex);

						if (actual_filename?.length > 0) {
							player_image = actual_filename[0] || player_image;
						}
					}

					let player_yaml = yamlFront.loadFront(player_file_content);

					let player_bonuses = player_yaml?.["armor-bonuses"] || [];

					let player_object = {
						"image-link": `http://localhost:4453/${player_image}`,
						"base-ac": player_yaml?.["armor-class"],
						bonuses:
							config["standard-bonuses"].concat(player_bonuses),
						"active-bonuses-indices": [], // list of indices related to "bonuses"
						"active-custom-bonuses": [], // just the straight up values
					};

					party_object[player_name] = player_object;

					player_count++;
					player_names.push(player_name);
				} catch (err) {
					console.error(`Error reading file ${player_file}:`, err);
					continue players;
				}
			}

			data[source_name] = { "5eParty": party_object };

			sources[source_name] = {
				name: party_name,
				information: `player information for a party of ${player_count}`,
				explanation: `Player information of the ${player_count}-player party "${party_name}" (${player_names.join(
					", "
				)})`,
				dataTypes: ["5eParty"],
				connection: {
					protocol: "WS",
					address: "ws://localhost:4453/sources/data",
					endpoint: source_name,
				},
			};
		} catch {
			continue;
		}
	}
};

// region Scraper - Encounter

// I know that this is very repetetive code, but i'm just trying to get this to work as fast as possible

let readEncounters = async (encounter_paths) => {
	readConfig();
	for (let encounter_name of Object.keys(encounter_paths)) {
		try {
			let encounter_path = encounter_paths[encounter_name];
			let source_name = `encounter-${encounter_name}`
				.toLowerCase()
				.replaceAll(" ", "-");

			let encounter_object = {
				_meta: {
					"active-statblock": undefined,
					bonuses: config["standard-bonuses"],
					"active-bonuses-indices": [],
					advantage: false,
					disadvantage: false,
					toggle: "http://localhost:4453/encounter/toggle/",
				},
			};
			let statblock_files = [];
			let statblock_count = 0;
			let statblock_names = [];

			try {
				statblock_files = fs.readdirSync(encounter_path);
			} catch (error) {
				console.log(
					`An error occurred while trying to find directory ${encounter_path}`
				);
			}

			statblocks: for (let statblock_file of statblock_files) {
				let statblock_file_path = path.join(
					encounter_path,
					statblock_file
				);
				let stat = fs.statSync(statblock_file_path);

				if (
					!stat.isFile() ||
					!`${statblock_file}`.endsWith(".md") ||
					statblock_file === "_meta"
				) {
					continue statblocks;
				}

				try {
					let statblock_name = statblock_file.replace(".md", "");
					let statblock_file_content = fs.readFileSync(
						statblock_file_path,
						"utf8"
					);

					let statblock_yaml = yamlFront.loadFront(
						statblock_file_content
					);

					let statblock_bonus = statblock_yaml?.["attack-bonus"] || 0;

					encounter_object[statblock_name] = {
						"attack-bonus": statblock_bonus,
					};

					statblock_count++;
					statblock_names.push(statblock_name);
				} catch (err) {
					console.error(`Error reading file ${player_file}:`, err);
					continue statblocks;
				}
			}

			data[source_name] = { "5eEncounter": encounter_object };

			sources[source_name] = {
				name: encounter_name,
				information: `encounter information with ${statblock_count} statblock${
					statblock_count > 1 ? "s" : ""
				}`,
				explanation: `Encounter information of the ${statblock_count}-statblock encounter "${encounter_name}" (${statblock_names.join(
					", "
				)})`,
				dataTypes: ["5eEncounter"],
				connection: {
					protocol: "WS",
					address: "ws://localhost:4453/sources/data",
					endpoint: source_name,
				},
			};
		} catch {
			continue;
		}
	}
};

let readAllEncounters = async () => {
	readConfig();
	let encounter_paths = {};
	let session_paths = config["session-paths"];

	for (let session_path of session_paths) {
		let session_encounter_names = [];

		try {
			try {
				session_encounter_names = fs.readdirSync(session_path);
			} catch (error) {
				console.log(
					`An error occurred while trying to find directory ${session_path}`
				);
			}

			encounters: for (let session_encounter_name of session_encounter_names) {
				let session_encounter_path = path.join(
					session_path,
					session_encounter_name
				);
				let stat = fs.statSync(session_encounter_path);

				if (!stat.isDirectory()) {
					continue encounters;
				}

				encounter_paths[session_encounter_name] =
					session_encounter_path;
			}
		} catch {
			continue;
		}
	}

	let all_encounter_paths = {
		...config["encounter-paths"],
		...encounter_paths,
	};

	readEncounters(all_encounter_paths);
};

// readComponentsFromDisk();
readParties();
readAllEncounters();

// region REST Routes

app.use("/icon", express.static(path.join(__dirname, "icon.svg")));

app.use("/info", (req, res) => {
	res.json({
		name: "5eCombatProvider",
		info: "This is a Provider that is capable of lading 5e Combat data out of markdown files and serving them to the DynDash application. It also houses a singular simulated dice that can be changed through API calls.",
		provides: {
			dashboards: false,
			components: false,
			sources: true,
			types: true,
		},
	});
});

app.get("/components", async (req, res) => {
	// if (Object.keys(components)?.length === 0) {
	// 	await readComponentsFromDisk();
	// }
	// res.json(components);
	res.json({});
});

app.get("/types", (req, res) => {
	res.json(dataTypes);
});

app.get("/sources", (req, res) => {
	res.json(sources);
});

app.get("/sources/data", (req, res) => {
	res.json(data);
});

app.get("/sources/data/:key(*)", (req, res) => {
	let key = req.params.key;

	if (sources[key] && data[key]) {
		res.status(200).send(JSON.stringify(data[key])).end();
	} else {
		res.status(404);
	}
});

// region broadcastUpdates

function broadcastUpdates(source, updatedData, append = []) {
	for (const [ws, requestedSource] of clients.entries()) {
		// Only send updates to clients that requested this source
		if (requestedSource === source && ws.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({
					status: "updated",
					source: source,
					data: updatedData,
					append: append, // append can be filled with Data Type names of any array-based Data Types in updatedData. This will cause their contents to be appended to the Data in the DynDash, instead of replacing it.
				})
			);
		}
	}
}

// region Business Logic - Dice

let nextType = {
	unknown: "d20",
	d4: "d6",
	d6: "d8",
	d8: "d10",
	d10: "d00",
	d00: "d12",
	d12: "d20",
	d20: "d6fudge",
	d6fudge: "d4",
};

let rollFunctions = {
	unknown: () => Math.floor(Math.random() * 20) + 1,
	d4: () => Math.floor(Math.random() * 4) + 1,
	d6: () => Math.floor(Math.random() * 6) + 1,
	d8: () => Math.floor(Math.random() * 8) + 1,
	d10: () => Math.floor(Math.random() * 10) + 1,
	d00: () => Math.floor(Math.random() * 10) * 10,
	d12: () => Math.floor(Math.random() * 12) + 1,
	d20: () => Math.floor(Math.random() * 20) + 1,
	d6fudge: () => Math.floor(Math.random() * 3) - 1,
};

app.use(express.static(path.join(__dirname, "public")));

app.post("/dice/cycle", (req, res) => {
	let currentType =
		data["simulated-dice"]["digitalDice"]["0000000_D?"]["info"]["type"];

	data["simulated-dice"]["digitalDice"]["0000000_D?"]["info"]["type"] =
		nextType[currentType];
	data["simulated-dice"]["digitalDice"][req?.body?.id]["info"]["face"] = 1;
	broadcastUpdates("simulated-dice", data["simulated-dice"]);
	res.status(200).end();
});

app.post("/dice/roll", (req, res) => {
	let rollFunction =
		rollFunctions[
			data["simulated-dice"]["digitalDice"][req?.body?.id]["info"]["type"]
		];

	let result = rollFunction();

	broadcastUpdates("simulated-dice", data["simulated-dice"]);

	let roll = () => {
		result = rollFunction();

		data["simulated-dice"]["digitalDice"][req?.body?.id]["info"]["face"] =
			result;
		data["simulated-dice"]["digitalDice"][req?.body?.id]["info"]["state"] =
			"rolling";

		broadcastUpdates("simulated-dice", data["simulated-dice"]);
	};

	let makeRolled = () => {
		data["simulated-dice"]["digitalDice"][req?.body?.id]["info"]["state"] =
			"rolled";

		data["simulated-dice"]["digitalDice"][req?.body?.id]["rolls"].push(
			result
		);

		broadcastUpdates("simulated-dice", data["simulated-dice"]);
	};

	setTimeout(roll, 100);
	setTimeout(roll, 200);
	setTimeout(roll, 300);
	setTimeout(roll, 400);
	setTimeout(makeRolled, 410);

	res.status(200).end();
});

app.post("/dice/undo", (req, res) => {
	data["simulated-dice"]["digitalDice"][req?.body?.id]["rolls"].pop();
	broadcastUpdates("simulated-dice", data["simulated-dice"]);
	res.status(200).end();
});

// region Business Logic - Party

app.post("/party/load", (req, res) => {
	readParties();
	responseObject = {
		dispatch: { ddSources: null },
	};

	res.json(responseObject).end();
});

app.post("/party/toggle/", (req, res) => {
	let bonus_index = req?.body?.bonus_index;
	let custom_bonus_object = req?.body?.custom_bonus_object;

	let active_bonuses_i =
		data[req?.body?.party]["5eParty"][req?.body?.player][
			"active-bonuses-indices"
		];

	let active_custom_bonuses =
		data[req?.body?.party]["5eParty"][req?.body?.player][
			"active-custom-bonuses"
		];

	// If it's about toggling the party member's bonuses
	if (bonus_index !== undefined) {
		if (active_bonuses_i.includes(bonus_index)) {
			active_bonuses_i.splice(active_bonuses_i.indexOf(bonus_index), 1);
		} else {
			active_bonuses_i.push(bonus_index);
		}

		data[req?.body?.party]["5eParty"][req?.body?.player][
			"active-bonuses-indices"
		] = active_bonuses_i;
	}

	// If it's about creating or deleting the party member's custom bonuses
	if (custom_bonus_object !== undefined) {
		let { action, index, value } = custom_bonus_object;

		// This might cause issues when multiple people quickly call this
		// repeatedly while their Component's data is out of sync

		if (action === "create" && value !== undefined) {
			active_custom_bonuses.push(value);
		} else if (action === "delete" && index !== undefined) {
			if (index <= active_custom_bonuses?.length - 1) {
				active_custom_bonuses.splice(index, 1);
			}
		}

		data[req?.body?.party]["5eParty"][req?.body?.player][
			"active-custom-bonuses"
		] = active_custom_bonuses;
	}

	broadcastUpdates(`${req?.body?.party}`, data[req?.body?.party]);
	res.status(200).end();
});

// region Business Logic - Encounter

app.post("/encounter/load", (req, res) => {
	readAllEncounters();
	responseObject = {
		dispatch: { ddSources: null },
	};

	res.json(responseObject).end();
});

app.post("/encounter/toggle/", (req, res) => {
	let bonus_index = req?.body?.bonus_index;
	let advantage = req?.body?.advantage;
	let disadvantage = req?.body?.disadvantage;
	let active_statblock = req?.body?.active_statblock;

	// If it's about toggling the encounter's bonuses...
	if (bonus_index !== undefined) {
		let active_bonuses_i =
			data[req?.body?.encounter]["5eEncounter"]["_meta"][
				"active-bonuses-indices"
			];

		if (active_bonuses_i.includes(bonus_index)) {
			active_bonuses_i.splice(active_bonuses_i.indexOf(bonus_index), 1);
		} else {
			active_bonuses_i.push(bonus_index);
		}

		data[req?.body?.encounter]["5eEncounter"]["_meta"][
			"active-bonuses-indices"
		] = active_bonuses_i;
	}

	// If it's about toggling the encounter's advantage
	if (advantage !== undefined) {
		data[req?.body?.encounter]["5eEncounter"]["_meta"]["advantage"] =
			!data[req?.body?.encounter]["5eEncounter"]["_meta"]["advantage"];
	}

	// If it's about toggling the encounter's disadvantage
	if (disadvantage !== undefined) {
		data[req?.body?.encounter]["5eEncounter"]["_meta"]["disadvantage"] =
			!data[req?.body?.encounter]["5eEncounter"]["_meta"]["disadvantage"];
	}

	// If it's about toggling the encounter's active statblock
	if (active_statblock !== undefined) {
		let next = undefined;
		let prev =
			data[req?.body?.encounter]["5eEncounter"]["_meta"][
				"active-statblock"
			];

		if (prev !== active_statblock) {
			next = active_statblock;
		}

		data[req?.body?.encounter]["5eEncounter"]["_meta"]["active-statblock"] =
			next;
	}

	broadcastUpdates(`${req?.body?.encounter}`, data[req?.body?.encounter]);
	res.status(200).end();
});

// region Servers and WebSockets

app.use(express.static(path.join(__dirname, "temp")));

let restServer = app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}`)
);

let wsServer = new WebSocket.Server({ server: restServer });

wsServer.on("connection", (ws) => {
	console.log("New WebSocket connection");

	ws.on("message", (message) => {
		try {
			const { source } = JSON.parse(message);

			if (sources[source]) {
				if (data[source]) {
					console.log(`Client requested source: ${source}`);
					clients.set(ws, source);

					ws.send(
						JSON.stringify({
							status: "connected",
							source,
							data: data[source],
						})
					);
				} else {
					ws.send(
						JSON.stringify({
							error: `No data available for source "${source}".`,
						})
					);
				}
			} else {
				ws.send(
					JSON.stringify({
						error: `Source "${source}" not found.`,
					})
				);
			}
		} catch (err) {
			console.error("Invalid message format:", err);
			ws.send(JSON.stringify({ error: "Invalid message format." }));
		}
	});

	ws.on("close", () => {
		console.log("WebSocket connection closed");
		clients.delete(ws);
	});
});
