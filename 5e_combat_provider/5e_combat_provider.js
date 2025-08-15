// region Config

const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 4453;
const clients = new Map();

app.use(express.json());
app.use(cors());

let dataTypes = require("./types.json");
let sources = require("./sources.json");
let data = require("./data.json");

let components = {};

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

// readComponentsFromDisk();

// region REST Routes

app.use("/icon", express.static(path.join(__dirname, "icon.svg")));

app.use("/info", (req, res) => {
	res.json({
		name: "5eCombatProvider",
		info: "This is a Provider that is capable of lading 5e Combat data out of markdown files and serving them to the DynDash application",
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

// region Business Logic - Web Application

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

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

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

// region Servers and WebSockets

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
