// This is an example dd-Component that can be used as a basis for building custom dd-Components.
// It consists of:
// - acceptedDataTypes Array of Data Types the dd-Component advertises as accepted
// - componentInformation String that provides a very brief one-liner about the dd-Component's functionality
// - componentExplanation String or Element, going into much more detail about how the dd-Component works and whether or not special settings are available
// - componentName String that represents how the dd-Component is referred to in the Interface
// - componentIcon SVG that represents the dd-Component in the Interface
// - dataValidator Function that takes in data and spits out an array of all incompatible Sources
// - dataProcessor Function that takes in data and slotSettings and gives the data back in a format that renderComponent can use (optional)
// - renderComponent Function that takes in the encompassing Slot's uuid and slotSettings, as well as any data passed to it

// The return bundle also provides the following options:
// - customSettingsPane: Defining a custom Settings pane. Should none be defined, enter a falsy value or remove the key
// - settingsMapper: Defining a custom Function that will be able to generate an Array of Keys that the Default Settings Pane can use. (omittable like customSettingsPane)
// - generalSettings: Defining keys for general settings, which will be used should no customSettingsPane be defined
// - bypassEmpty: A boolean that allows dd-Component to be displayed without Sources

// dd-Components can also import things from libraries that are imported in the project

// region Component Information

const componentName = "Party Display";

const acceptedDataTypes = [["digitalDice*", "5eEncounter*", "5eParty"]];

const componentInformation = "source-based party overview";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources of the following
			Data Types in order to display a list of party members and whether
			or not they are currently hit:
		</p>
		<br />
		<ul className="space-x-1 space-y-4 text-sm flex flex-col bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<li>
				<code className="bg-gray-900/50 px-2 py-1 mr-1 rounded-lg">
					digitalDice
				</code>
				The Component will only respect one Source of this type and only
				use one of the dice stored within, so exlude all but one of the
				Sources and dice, if you want control over which one is used.
				Otherwise, the first Source and its first dice is used.
			</li>
			<li>
				<code className="bg-gray-900/50 px-2 py-1 mr-1 rounded-lg">
					5eEncounter
				</code>
				The Component will only respect one Source of this type, so
				exlude all but one of the Sources, if you want control over
				which one is used. Otherwise, the first Source is used.
			</li>
			<li>
				<code className="bg-gray-900/50 px-2 py-1 mr-1 rounded-lg">
					5eParty
				</code>
				No Limitations
			</li>
		</ul>
		<br />
		<p>
			It is possible to hide the titles by adding the following key to the
			exclude array:
		</p>
		<div className="space-x-1 text-sm flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<span className="bg-gray-900/50 px-2 rounded-lg">
				SOURCENAME/title
			</span>
		</div>
	</div>
);

// HEROICONS map
const componentIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		className="size-6"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
		/>
	</svg>
);

// region

const settingsMapper = (sourceData) => {
	if (sourceData?.["digitalDice"]) {
		try {
			let dice = sourceData?.["digitalDice"];
			let keys = dice ? Object.keys(dice) : [];
			if (keys?.length > 0) return keys;
		} catch {
			return [];
		}
	}

	if (sourceData?.["5eEncounter"]) {
		try {
			let statblocks = sourceData?.["5eEncounter"];
			let keys = statblocks ? Object.keys(statblocks) : [];
			keys.splice(keys.indexOf("_meta"), 1);
			if (keys?.length > 0) return keys;
		} catch {
			return [];
		}
	}

	if (sourceData?.["5eParty"]) {
		try {
			let players = sourceData?.["5eParty"];
			let keys = players ? Object.keys(players) : [];
			keys.splice(keys.indexOf("_meta"), 1);
			if (keys?.length > 0) return keys;
		} catch {
			return [];
		}
	}
};

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	// let elements = [];

	let foundDice = undefined;
	let foundEncounter = undefined;

	// Finding the first viable digitalDice Source
	for (let sourceName in data) {
		if (slotSettings?.exclude?.includes(sourceName)) continue;

		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("digitalDice")) continue;

			let digitalDice = data[sourceName][propertyName];
			let diceIDs = Object.keys(digitalDice);

			// If there are no dice, this source isn't it.
			if (diceIDs?.length === 0) break;

			for (let diceID of diceIDs) {
				let idIsExcluded = slotSettings?.exclude?.includes(
					`${sourceName}/${diceID}`
				);

				if (idIsExcluded) {
					continue;
				} else {
					foundDice = data[sourceName][propertyName][diceID];
				}
			}

			if (foundDice) break;
		}

		if (foundDice) break;
	}

	// Finding the first viable 5eEncounter Source
	for (let sourceName in data) {
		if (slotSettings?.exclude?.includes(sourceName)) continue;

		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("5eEncounter")) continue;

			foundEncounter = data[sourceName][propertyName];
			break;
		}

		if (foundEncounter) break;
	}

	// Doing some setup that will be used in various places

	let getBonusString = (input) => {
		let bonusString = `${input}`;
		if (!bonusString.startsWith("+") && !bonusString.startsWith("-")) {
			bonusString = `+${bonusString}`;
		}
		return bonusString;
	};

	// region rC: Roll Calculation

	// Getting base information from the digitalDice rolls and 5eEncounter information
	let e_meta = foundEncounter?.["_meta"];
	let available_bonuses = e_meta?.["bonuses"];
	let active_bonuses_i = e_meta?.["active-bonuses-indices"];
	let e_bonuses =
		active_bonuses_i?.map((index) => available_bonuses[index]) || [];
	let active_custom_bonuses_values = e_meta?.["active-custom-bonuses"] || [];
	let active_statblock = e_meta?.["active-statblock"];
	let statblock_bonus = active_statblock
		? foundEncounter[active_statblock]?.["attack-bonus"]
		: 0;
	let advantage = e_meta?.["advantage"];
	let disadvantage = e_meta?.["disadvantage"];
	if (advantage && disadvantage) {
		disadvantage = false;
		advantage = false;
	}
	let rollCount = foundDice?.rolls?.length;
	let previousRoll = foundDice?.rolls[foundDice?.rolls?.length - 2];
	let currentRoll = foundDice?.rolls[foundDice?.rolls?.length - 1];

	// Doing the roll-based calculations and deciding on the shown Elements
	let choiceFunction = undefined;
	let chosenRoll = 0;

	if (advantage && !disadvantage) {
		choiceFunction = Math.max;
	} else if (!advantage && disadvantage) {
		choiceFunction = Math.min;
	} else if (advantage && disadvantage) {
		choiceFunction = (a, b) => {
			return b;
		};
	}

	if (rollCount > 0) {
		if ((advantage || disadvantage) && rollCount > 1) {
			chosenRoll = choiceFunction(previousRoll, currentRoll);
		} else {
			chosenRoll = currentRoll;
		}
	}

	// Doing the final result calculations
	let finalRollResult = 0;

	let encounter_bonuses = e_bonuses.concat(active_custom_bonuses_values);

	finalRollResult += chosenRoll;
	finalRollResult += encounter_bonuses.reduce((accumulator, currentValue) => {
		return Number(accumulator) + Number(currentValue);
	}, 0);
	finalRollResult += statblock_bonus;

	// region rC: Encounter Elements

	// Base Information
	let baseButtonClasses =
		"px-4 text-white rounded-md transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400";
	let toggleButtonClasses = "w-fit h-fit py-2";

	// Getter Functions
	let getClass = (activeBoolean, classes) => {
		return `${
			activeBoolean
				? "bg-blue-600/70 hover:bg-blue-600"
				: "bg-gray-600/70 hover:bg-gray-600"
		} ${classes.join(" ")}`;
	};

	let getToggleClass = (activeBoolean) => {
		return `${getClass(activeBoolean, [
			baseButtonClasses,
			toggleButtonClasses,
		])}`;
	};

	let getOnClick = (requestURL, sendObject) => {
		return async (e) => {
			e.stopPropagation();

			let requestBody = JSON.stringify(sendObject);

			let requestObject = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: requestBody,
			};

			try {
				const response = await fetch(requestURL, requestObject);

				if (!response.ok) {
					console.log(
						`Party Display Component received an error response!`
					);
				}
			} catch {
				console.log(
					`Party Display Component failed to get a response!`
				);
			}
		};
	};

	let getButton = (text, classes, onClick, optionalKey = "") => {
		return (
			<button
				className={`rounded-md ${classes} z-[2]`}
				onClick={onClick}
				key={`${uuid}-${text}-${optionalKey}`}
			>
				{text}
			</button>
		);
	};

	// region rC: Party Elements

	let hitColor =
		slotSettings?.colors?.["general/hit"] || "rgba(64, 172, 83, 1)";

	let partyElements = [];

	// Cycling through all 5eParty Sources
	for (let sourceName in data) {
		if (slotSettings?.exclude?.includes(sourceName)) continue;

		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("5eParty")) continue;

			let memberElements = [];

			let party = data[sourceName][propertyName];
			let party_members = Object.keys(party);
			let partyURL = party["_meta"]?.toggle;

			// If there are no dice, this source isn't it.
			if (party_members?.length === 0) break;

			for (let party_member_name of party_members) {
				let nameIsExcluded = slotSettings?.exclude?.includes(
					`${sourceName}/${party_member_name}`
				);

				if (nameIsExcluded || party_member_name === "_meta") {
					continue;
				}

				let party_member =
					data[sourceName][propertyName][party_member_name];

				let pm_icon = party_member?.["image-link"];

				let pm_bonuses = party_member?.["bonuses"] || [];
				let pm_active_bonuses_i =
					party_member?.["active-bonuses-indices"] || [];

				let pm_active_bonus_values =
					pm_active_bonuses_i?.map((index) => pm_bonuses[index]) ||
					[];

				let pm_c_active_bonuses_values =
					party_member?.["active-custom-bonuses"] || [];

				let pm_external_bonuses =
					party_member?.["external-bonuses"] || {};

				let pm_external_bonuses_names =
					Object.keys(pm_external_bonuses);

				let pm_external_bonuses_values =
					Object.values(pm_external_bonuses);

				let finalAC = party_member?.["base-ac"] || 0;
				finalAC += pm_active_bonus_values.reduce(
					(accumulator, currentValue) => {
						return Number(accumulator) + Number(currentValue);
					},
					0
				);
				finalAC += pm_c_active_bonuses_values.reduce(
					(accumulator, currentValue) => {
						return Number(accumulator) + Number(currentValue);
					},
					0
				);
				finalAC += pm_external_bonuses_values.reduce(
					(accumulator, currentValue) => {
						return Number(accumulator) + Number(currentValue);
					},
					0
				);

				let isHitBy = finalRollResult - finalAC;

				let isHit = isHitBy >= 0;

				if (chosenRoll === 1) {
					isHit = false;
				} else if (chosenRoll === 20) {
					isHit = true;
				}

				let customHitColor =
					slotSettings?.colors?.[
						`${sourceName}/${party_member_name}`
					] || hitColor;

				let member_color = isHit
					? customHitColor
					: "rgba(66, 66, 66, 0.33)";

				let member_buttons = [];
				let member_externals = [];

				// Adding buttons for the regular bonuses
				if (pm_bonuses.length > 0) {
					for (let i = 0; i < pm_bonuses.length; i++) {
						let bonusValue = pm_bonuses[i];
						let isActive = pm_active_bonuses_i?.includes(i);
						let bonusString = getBonusString(bonusValue);

						let buttonClass = getToggleClass(isActive);
						let buttonClick = getOnClick(partyURL, {
							party: sourceName,
							player: party_member_name,
							bonus_index: i,
						});

						let bonusButton = getButton(
							bonusString,
							buttonClass,
							buttonClick,
							`regular-bonus-${party_member_name}-index-${i}`
						);

						member_buttons.push(bonusButton);
					}
				}

				// Adding removal-buttons for custom bonuses
				if (pm_c_active_bonuses_values.length > 0) {
					for (
						let i = 0;
						i < pm_c_active_bonuses_values.length;
						i++
					) {
						let bonusValue = pm_c_active_bonuses_values[i];
						let isActive = true;
						let bonusString = getBonusString(bonusValue);

						let buttonClass = getToggleClass(isActive);
						let buttonClick = getOnClick(partyURL, {
							party: sourceName,
							player: party_member_name,
							custom_bonus_object: {
								action: "delete",
								index: i,
							},
						});

						let bonusButton = getButton(
							bonusString,
							buttonClass,
							buttonClick,
							`custom-bonus-${party_member_name}-index-${i}`
						);

						member_buttons.push(bonusButton);
					}
				}

				// Adding a singular creation button for all custom Bonuses
				let buttonClass = getToggleClass(false);
				let buttonClick = async (e) => {
					e.stopPropagation();

					let input = prompt("Enter a custom AC-bonus value:", 0);
					let bonus = Number(input);
					if (!bonus) {
						return;
					}

					let forward = getOnClick(partyURL, {
						party: sourceName,
						player: party_member_name,
						custom_bonus_object: {
							action: "create",
							value: bonus,
						},
					});

					forward(e);
				};

				let bonusButton = getButton(
					`+X`,
					buttonClass,
					buttonClick,
					`x-bonus-${party_member_name}`
				);

				member_buttons.push(bonusButton);

				for (let pm_external_bonus of pm_external_bonuses_names) {
					let value = pm_external_bonuses[pm_external_bonus];
					member_externals.push(
						<li className="flex flex-col text-sm rounded-md px-4 text-white rounded-md bg-gray-500/50 shadow-md">
							<p>{value}</p>
							<p>{pm_external_bonus}</p>
						</li>
					);
				}

				let member_element = (
					<li
						className="relative w-[90%] h-fit flex flex-row items-center justify-start py-1 rounded-md shadow-lg "
						style={{ backgroundColor: member_color }}
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<span className="flex flex-row w-[15%] flex items-center px-4 justify-between">
							<div className="h-20 flex items-center w-fit relative">
								<img
									src={pm_icon}
									alt={`Icon for Player ${party_member_name}`}
									className="h-[90%] object-contain"
								/>
								<code
									className={`absolute bottom-0 right-0 translate-x-1/2 bg-gray-500 p-1 text-xs rounded-md`}
								>
									{finalAC}
								</code>
							</div>
						</span>
						<p className="w-[10%] text-left">{party_member_name}</p>

						<ul className="w-[75%] flex flex-wrap px-6 py-2 justify-end space-x-2">
							{member_externals}
							{member_buttons}
						</ul>
						{isHit && isHitBy > 0 ? (
							<p
								className="absolute text-xs px-2 py-1 top-1/2 right-0 translate-x-[70%] -translate-y-1/2 rounded-r-full z-[1]"
								style={{
									backgroundColor: member_color,
								}}
							>
								{isHitBy}
							</p>
						) : null}
					</li>
				);

				memberElements.push(member_element);
			}

			let partyTitle = <p className="py-2 text-xl">{sourceName}</p>;

			if (slotSettings?.exclude?.includes(`${sourceName}/title`)) {
				partyTitle = null;
			}

			let partyElement = (
				<div className="w-full h-fit py-4 bg-gray-300/10 rounded-lg">
					{partyTitle}
					<ul className="flex flex-col items-center space-y-2">
						{memberElements}
					</ul>
				</div>
			);

			partyElements.push(partyElement);
		}
	}

	let partyPane = (
		<div className="flex flex-col w-full h-full overflow-scroll space-y-4 p-2 justify-around items-center">
			{partyElements}
		</div>
	);

	// region rC: General Rendering
	let backgroundColor =
		slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";

	return (
		<div
			className="select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-row items-center overflow-auto"
			style={{
				backgroundColor: backgroundColor,
			}}
		>
			<div className="w-full h-full rounded-md">{partyPane}</div>
		</div>
	);
};

// region dataValidator

const dataValidator = (data) => {
	let returnArray = [];
	for (let sourceName in data) {
		// This is where it is determined whether or not the data object holds a property of the type that this dd-Component seeks to use
		let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
			return (
				key.includes("digitalDice") ||
				key.includes("5eEncounter") ||
				key.includes("5eParty")
			);
		});
		let property = undefined;

		if (compatibleProperty) {
			property = data[sourceName][compatibleProperty];
		}

		if (!property) {
			returnArray.push(sourceName);
			continue;
		}

		// This is where it is determined whether or not any of the properties of the matching type are actually holding the type of data needed
		let correctDataArray = [];

		for (let propertyName in data[sourceName]) {
			if (
				!propertyName.includes("digitalDice") &&
				!propertyName.includes("5eEncounter") &&
				!propertyName.includes("5eParty")
			)
				continue;

			let existence =
				data[sourceName][propertyName] &&
				Object.keys(data[sourceName][propertyName])?.length !== 0;

			if (!existence) continue;

			// This is where custom compatibility logic would have to be implemented
			let compatibility =
				data[sourceName]?.[propertyName] &&
				typeof data[sourceName][propertyName] === "object";

			let compatibilityString = compatibility
				? "compatible"
				: "incompatible";

			correctDataArray.push(compatibilityString);
		}

		// If not a single one of the properties matching that are the type are compatible, then the entire source is incompatible
		if (!correctDataArray.includes("compatible")) {
			returnArray.push(sourceName);
		}
	}
	return returnArray;
};

// region Exports

const bundle = {
	name: componentName,
	icon: componentIcon,
	information: componentInformation,
	explanation: componentExplanation,
	dataTypes: acceptedDataTypes,
	customSettingsPane: false,
	settingsMapper: settingsMapper,
	generalSettings: [
		"background",
		"hit",
		"diceCriticalFailure",
		"diceCriticalSuccess",
	],
	dataValidator: dataValidator,
	renderFunction: renderComponent,
};

export default bundle;
