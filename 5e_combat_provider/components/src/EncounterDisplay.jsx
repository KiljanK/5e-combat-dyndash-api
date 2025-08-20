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

const componentName = "Encounter Display";

const acceptedDataTypes = ["5eEncounter"];

const componentInformation = "source-based encounter controls";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources of the Data Type{" "}
			<code className="bg-gray-900/50 px-2 py-1 mr-1 rounded-lg">
				5eEncounter
			</code>
			in order to display the related data and render controls for
			modifying the state of the encounters listed in the data.
		</p>
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
};

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let listOfEncounters = [];

	for (let sourceName in data) {
		if (slotSettings?.exclude?.includes(sourceName)) continue;

		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("5eEncounter")) continue;

			let currentEncounter = data[sourceName][propertyName];

			// Getting base information from the digitalDice rolls and 5eEncounter information
			let e_meta = currentEncounter?.["_meta"];
			let available_bonuses = e_meta?.["bonuses"];
			let active_bonuses_i = e_meta?.["active-bonuses-indices"];
			let active_custom_bonuses_values =
				e_meta?.["active-custom-bonuses"] || [];
			let active_statblock = e_meta?.["active-statblock"];
			let advantage = e_meta?.["advantage"];
			let disadvantage = e_meta?.["disadvantage"];
			if (advantage && disadvantage) {
				disadvantage = false;
				advantage = false;
			}

			// region rC: Encounter Elements

			// Base Information
			let statblocksURL = e_meta?.toggle;
			let baseButtonClasses =
				"px-4 text-white rounded-md transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400";
			let toggleButtonClasses = "w-fit h-fit py-2";
			let statblockClasses =
				"w-[90%] h-fit py-3 flex flex-row justify-between";

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

			let getStatblockClass = (activeBoolean) => {
				return `${getClass(activeBoolean, [
					baseButtonClasses,
					statblockClasses,
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
								`Combat Display Component received an error response!`
							);
						}
					} catch {
						console.log(
							`Combat Display Component failed to get a response!`
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

			let getBonusString = (input) => {
				let bonusString = `${input}`;
				if (
					!bonusString.startsWith("+") &&
					!bonusString.startsWith("-")
				) {
					bonusString = `+${bonusString}`;
				}
				return bonusString;
			};

			// Actual Buttons, we need to use the e_meta here, since this needs to use the actual values, not the logical values calculated before
			let advantageClass = getToggleClass(e_meta?.["advantage"]);
			let advantageClick = getOnClick(statblocksURL, {
				encounter: sourceName,
				advantage: true,
			});
			let advantageButton = getButton(
				"A",
				advantageClass,
				advantageClick,
				"advantage-button"
			);

			let disadvantageClass = getToggleClass(e_meta?.["disadvantage"]);
			let disadvantageClick = getOnClick(statblocksURL, {
				encounter: sourceName,
				disadvantage: true,
			});
			let disadvantageButton = getButton(
				"D",
				disadvantageClass,
				disadvantageClick,
				"disadvantage-button"
			);

			// Bonus Buttons, these work very similarly to the Advantage and Disadvantage ones
			let encounter_buttons = [];

			if (available_bonuses?.length > 0) {
				for (let i = 0; i < available_bonuses?.length; i++) {
					let bonusValue = available_bonuses[i];
					let isActive = active_bonuses_i?.includes(i);

					let buttonClass = getToggleClass(isActive);
					let buttonClick = getOnClick(statblocksURL, {
						encounter: sourceName,
						bonus_index: i,
					});

					let bonusButton = getButton(
						`${bonusValue}`,
						buttonClass,
						buttonClick,
						`statblock-bonus-${i}`
					);
					encounter_buttons.push(bonusButton);
				}
			}

			// Adding removal-buttons for custom bonuses
			if (active_custom_bonuses_values.length > 0) {
				for (let i = 0; i < active_custom_bonuses_values.length; i++) {
					let bonusValue = active_custom_bonuses_values[i];
					let isActive = true;
					let bonusString = getBonusString(bonusValue);

					let buttonClass = getToggleClass(isActive);
					let buttonClick = getOnClick(statblocksURL, {
						encounter: sourceName,
						custom_bonus_object: {
							action: "delete",
							index: i,
						},
					});

					let bonusButton = getButton(
						bonusString,
						buttonClass,
						buttonClick,
						`custom-bonus-${sourceName}-index-${i}`
					);

					encounter_buttons.push(bonusButton);
				}
			}

			// Adding a singular creation button for all custom Bonuses
			let buttonClass = getToggleClass(false);
			let buttonClick = async (e) => {
				e.stopPropagation();

				let input = prompt("Enter a custom attack-bonus value:", 0);
				let bonus = Number(input);
				if (!bonus) {
					return;
				}

				let forward = getOnClick(statblocksURL, {
					encounter: sourceName,
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
				`x-bonus-${sourceName}`
			);

			encounter_buttons.push(bonusButton);

			let buttonPanel = (
				<span
					className="w-full h-fit p-2 flex flex-row flex-wrap space-x-2 space-y-2 justify-around items-center bg-gray-300/10 rounded-lg"
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					{advantageButton}
					{disadvantageButton}
					{encounter_buttons}
				</span>
			);

			// Statblocks

			let statblocks = [];

			for (let statblock of Object.keys(currentEncounter)) {
				if (statblock === "_meta") continue;

				let isExcluded = slotSettings?.exclude?.includes(
					`${sourceName}/${statblock}`
				);
				if (isExcluded) continue;

				let attack_bonus =
					currentEncounter[statblock]?.["attack-bonus"];
				let bonusString = getBonusString(attack_bonus);

				let isActive = statblock === active_statblock;

				let buttonClass = getStatblockClass(isActive);
				let buttonClick = getOnClick(statblocksURL, {
					encounter: sourceName,
					active_statblock: statblock,
				});

				let statblockButton = getButton(
					[
						<p>{statblock}</p>,
						<p className="opacity-50">{bonusString}</p>,
					],
					buttonClass,
					buttonClick,
					`statblock-${statblock}`
				);
				statblocks.push(statblockButton);
			}

			let encounterTitle = <p className="py-2 text-xl">{sourceName}</p>;

			if (slotSettings?.exclude?.includes(`${sourceName}/title`)) {
				encounterTitle = null;
			}

			let statblockList = (
				<div
					className="w-full h-fit bg-gray-300/10 rounded-lg py-4"
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					{encounterTitle}
					<ul className="flex flex-col items-center space-y-2">
						{statblocks}
					</ul>
				</div>
			);

			// Building the Content for the Encounter-Pane
			let encounterPane = (
				<div className="flex flex-col w-full h-fit space-y-4 p-2 justify-around items-center">
					{buttonPanel}
					{statblockList}
				</div>
			);

			listOfEncounters.push(encounterPane);
		}
	}

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
			<div className="w-full h-full rounded-md">{listOfEncounters}</div>
		</div>
	);
};

// region dataValidator

const dataValidator = (data) => {
	let returnArray = [];
	for (let sourceName in data) {
		// This is where it is determined whether or not the data object holds a property of the type that this dd-Component seeks to use
		let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
			return key.includes("5eEncounter");
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
			if (!propertyName.includes("5eEncounter")) continue;

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
	generalSettings: ["background"],
	dataValidator: dataValidator,
	renderFunction: renderComponent,
};

export default bundle;
