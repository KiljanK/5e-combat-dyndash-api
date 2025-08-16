// component_compiler/src/CombatDisplay.jsx
var componentName = "CombatDisplay";
var acceptedDataTypes = [["digitalDice*", "5eEncounter*", "5eParty"]];
var componentInformation = "source-based encounter overview";
var componentExplanation = /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("p", null, "This is a DynDash Component that takes in Sources of the following Data Types:"), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("ul", { className: "space-x-1 space-y-4 text-sm flex flex-col bg-gray-600 text-white p-2 rounded-md overflow-auto" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("code", { className: "bg-gray-900/50 px-2 py-1 mr-1 rounded-lg" }, "digitalDice"), "The Component will only respect one Source of this type and only use one of the dice stored within, so exlude all but one of the Sources and dice, if you want control over which one is used. Otherwise, the first Source and its first dice is used."), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("code", { className: "bg-gray-900/50 px-2 py-1 mr-1 rounded-lg" }, "5eEncounter"), "The Component will only respect one Source of this type, so exlude all but one of the Sources, if you want control over which one is used. Otherwise, the first Source is used."), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("code", { className: "bg-gray-900/50 px-2 py-1 mr-1 rounded-lg" }, "5eParty"), "No Limitations")), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("p", null, "It is possible to hide the titles by adding the following key to the exclude array:"), /* @__PURE__ */ React.createElement("div", { className: "space-x-1 text-sm flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gray-900/50 px-2 rounded-lg" }, "SOURCENAME/title")));
var componentIcon = /* @__PURE__ */ React.createElement(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: "size-6"
  },
  /* @__PURE__ */ React.createElement(
    "path",
    {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
    }
  )
);
var settingsMapper = (sourceData) => {
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
var renderComponent = (uuid, data, slotSettings) => {
  let foundDice = void 0;
  let foundEncounter = void 0;
  let foundEncounterName = void 0;
  for (let sourceName in data) {
    if (slotSettings?.exclude?.includes(sourceName)) continue;
    for (let propertyName in data[sourceName]) {
      if (!propertyName.includes("digitalDice")) continue;
      let digitalDice = data[sourceName][propertyName];
      let diceIDs = Object.keys(digitalDice);
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
  for (let sourceName in data) {
    if (slotSettings?.exclude?.includes(sourceName)) continue;
    for (let propertyName in data[sourceName]) {
      if (!propertyName.includes("5eEncounter")) continue;
      foundEncounter = data[sourceName][propertyName];
      foundEncounterName = sourceName;
      break;
    }
    if (foundEncounter) break;
  }
  let e_meta = foundEncounter?.["_meta"];
  let available_bonuses = e_meta?.["bonuses"];
  let active_bonuses = e_meta?.["active-bonuses"];
  let e_bonuses = active_bonuses?.map((index) => available_bonuses[index]) || [];
  let active_statblock = e_meta?.["active-statblock"];
  let statblock_bonus = active_statblock ? foundEncounter[active_statblock]?.["attack-bonus"] : 0;
  let advantage = e_meta?.["advantage"];
  let disadvantage = e_meta?.["disadvantage"];
  if (advantage && disadvantage) {
    disadvantage = false;
    advantage = false;
  }
  let rollCount = foundDice?.rolls?.length;
  let previousRoll = foundDice?.rolls[foundDice?.rolls?.length - 2];
  let currentRoll = foundDice?.rolls[foundDice?.rolls?.length - 1];
  let choiceFunction = void 0;
  let chosenRoll = 0;
  let shownRolls = [];
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
      shownRolls.push(
        /* @__PURE__ */ React.createElement(
          "code",
          {
            className: `bg-gray-500 p-1 rounded-md ${chosenRoll !== previousRoll ? "opacity-50 line-through" : ""}`
          },
          `${previousRoll}`
        ),
        /* @__PURE__ */ React.createElement(
          "code",
          {
            className: `bg-gray-500 p-1 rounded-md ${chosenRoll !== currentRoll ? "opacity-50 line-through" : ""}`
          },
          `${currentRoll}`
        )
      );
    } else {
      chosenRoll = currentRoll;
      shownRolls.push(
        /* @__PURE__ */ React.createElement(
          "code",
          {
            className: `bg-gray-500 p-1 rounded-md`
          },
          `${chosenRoll}`
        )
      );
    }
  }
  let finalRollResult = 0;
  finalRollResult += chosenRoll;
  finalRollResult += e_bonuses.reduce((accumulator, currentValue) => {
    return Number(accumulator) + Number(currentValue);
  }, 0);
  finalRollResult += statblock_bonus;
  let resultAddends = [];
  if (foundDice) {
    resultAddends.push(
      /* @__PURE__ */ React.createElement("div", { className: "text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "space-x-1" }, shownRolls), /* @__PURE__ */ React.createElement("p", null, foundDice["info"]["name"]))
    );
  }
  if (e_bonuses) {
    for (let e_bonus of e_bonuses) {
      let bonusString = `${e_bonus}`;
      if (!bonusString.startsWith("+") && !bonusString.startsWith("-")) {
        bonusString = `+${bonusString}`;
      }
      let e_bonus_element = /* @__PURE__ */ React.createElement(
        "code",
        {
          className: `bg-gray-500 p-1 rounded-md`
        },
        `${e_bonus}`
      );
      resultAddends.push(
        /* @__PURE__ */ React.createElement("div", { className: "text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "space-x-1" }, e_bonus_element), /* @__PURE__ */ React.createElement("p", null, "Encounter"))
      );
    }
  }
  if (statblock_bonus) {
    let bonusString = `${statblock_bonus}`;
    if (!bonusString.startsWith("+") && !bonusString.startsWith("-")) {
      bonusString = `+${bonusString}`;
    }
    let statblock_bonus_element = /* @__PURE__ */ React.createElement("code", { className: `bg-gray-500 p-1 rounded-md` }, bonusString);
    resultAddends.push(
      /* @__PURE__ */ React.createElement("div", { className: "text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "space-x-1" }, statblock_bonus_element), /* @__PURE__ */ React.createElement("p", null, active_statblock))
    );
  }
  let rollPane = /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col space-y-2 justify-center items-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-6xl" }, finalRollResult), /* @__PURE__ */ React.createElement("span", { className: "flex space-x-2" }, resultAddends));
  let encounterElements = [];
  if (!foundEncounter) {
    encounterElements.push(
      /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-300/30 p-2 rounded-md" }, "No Encounter found!")
    );
  } else {
    let requestURL = e_meta?.toggle;
    let baseButtonClasses = "px-4 text-white rounded-md transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400";
    let toggleButtonClasses = "w-fit h-[60%] py-2";
    let statblockClasses = "w-[90%] h-fit py-3 flex flex-row justify-between";
    let getClass = (activeBoolean, classes) => {
      return `${activeBoolean ? "bg-blue-600/70 hover:bg-blue-600" : "bg-gray-600/70 hover:bg-gray-600"} ${classes.join(" ")}`;
    };
    let getToggleClass = (activeBoolean) => {
      return `${getClass(activeBoolean, [
        baseButtonClasses,
        toggleButtonClasses
      ])}`;
    };
    let getStatblockClass = (activeBoolean) => {
      return `${getClass(activeBoolean, [
        baseButtonClasses,
        statblockClasses
      ])}`;
    };
    let getOnClick = (sendObject) => {
      return async (e) => {
        e.stopPropagation();
        let requestBody = JSON.stringify(sendObject);
        let requestObject = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody
        };
        try {
          const response = await fetch(requestURL, requestObject);
          if (!response.ok) {
            console.log(
              `CombatDisplay Component received an error response!`
            );
          }
        } catch {
          console.log(
            `CombatDisplay Component failed to get a response!`
          );
        }
      };
    };
    let getButton = (text, classes, onClick) => {
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          className: `rounded-md ${classes}`,
          onClick,
          key: text
        },
        text
      );
    };
    let advantageClass = getToggleClass(e_meta?.["advantage"]);
    let advantageClick = getOnClick({
      encounter: foundEncounterName,
      advantage: true
    });
    let advantageButton = getButton("A", advantageClass, advantageClick);
    let disadvantageClass = getToggleClass(e_meta?.["disadvantage"]);
    let disadvantageClick = getOnClick({
      encounter: foundEncounterName,
      disadvantage: true
    });
    let disadvantageButton = getButton(
      "D",
      disadvantageClass,
      disadvantageClick
    );
    let bonusButtons = [];
    if (available_bonuses?.length > 0) {
      for (let i = 0; i < available_bonuses?.length; i++) {
        let bonusValue = available_bonuses[i];
        let isActive = active_bonuses?.includes(i);
        let buttonClass = getToggleClass(isActive);
        let buttonClick = getOnClick({
          encounter: foundEncounterName,
          bonus_index: i
        });
        let bonusButton = getButton(
          `${bonusValue}`,
          buttonClass,
          buttonClick
        );
        bonusButtons.push(bonusButton);
      }
    }
    let buttonPanel = /* @__PURE__ */ React.createElement("span", { className: "w-full h-[20%] flex flex-row justify-around items-center bg-gray-700/10 rounded-lg" }, advantageButton, disadvantageButton, bonusButtons);
    let statblocks = [];
    for (let statblock of Object.keys(foundEncounter)) {
      if (statblock === "_meta") continue;
      let attack_bonus = foundEncounter[statblock]?.["attack-bonus"];
      let bonusString = `${attack_bonus}`;
      if (!bonusString.startsWith("+") && !bonusString.startsWith("-")) {
        bonusString = `+${bonusString}`;
      }
      let isActive = statblock === active_statblock;
      let buttonClass = getStatblockClass(isActive);
      let buttonClick = getOnClick({
        encounter: foundEncounterName,
        active_statblock: statblock
      });
      let statblockButton = getButton(
        [
          /* @__PURE__ */ React.createElement("p", null, statblock),
          /* @__PURE__ */ React.createElement("p", { className: "opacity-50" }, bonusString)
        ],
        buttonClass,
        buttonClick
      );
      statblocks.push(statblockButton);
    }
    let statblockList = /* @__PURE__ */ React.createElement("div", { className: "w-full h-[75%] overflow-scroll bg-gray-700/10 rounded-lg" }, /* @__PURE__ */ React.createElement("p", { className: "py-2 text-xl" }, foundEncounterName), /* @__PURE__ */ React.createElement("ul", { className: "flex flex-col items-center space-y-2" }, statblocks));
    encounterElements.push(buttonPanel, statblockList);
  }
  let encounterPane = /* @__PURE__ */ React.createElement("div", { className: "flex flex-col w-full h-full justify-between items-center" }, encounterElements);
  let backgroundColor = slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";
  let backgroundColorRoll = slotSettings?.colors?.["general/roll"] || "rgb(71, 72, 81)";
  let backgroundColorEncounter = slotSettings?.colors?.["general/encounter"] || "rgb(71, 72, 81)";
  let backgroundColorParty = slotSettings?.colors?.["general/party"] || "rgb(71, 72, 81)";
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-row items-center overflow-auto",
      style: {
        backgroundColor
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-col w-1/2 h-full p-4 justify-between" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-full h-[30%] rounded-md",
        style: {
          backgroundColor: backgroundColorRoll
        }
      },
      rollPane
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-full h-[65%] rounded-md p-2",
        style: {
          backgroundColor: backgroundColorEncounter
        }
      },
      encounterPane
    )),
    /* @__PURE__ */ React.createElement("div", { className: "w-1/2 h-full p-4" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-full h-full rounded-md",
        style: {
          backgroundColor: backgroundColorParty
        }
      },
      "Player Field"
    ))
  );
};
var dataValidator = (data) => {
  let returnArray = [];
  for (let sourceName in data) {
    let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
      return key.includes("digitalDice") || key.includes("5eEncounter") || key.includes("5eParty");
    });
    let property = void 0;
    if (compatibleProperty) {
      property = data[sourceName][compatibleProperty];
    }
    if (!property) {
      returnArray.push(sourceName);
      continue;
    }
    let correctDataArray = [];
    for (let propertyName in data[sourceName]) {
      if (!propertyName.includes("digitalDice") && !propertyName.includes("5eEncounter") && !propertyName.includes("5eParty"))
        continue;
      let existence = data[sourceName][propertyName] && Object.keys(data[sourceName][propertyName])?.length !== 0;
      if (!existence) continue;
      let compatibility = data[sourceName]?.[propertyName] && typeof data[sourceName][propertyName] === "object";
      let compatibilityString = compatibility ? "compatible" : "incompatible";
      correctDataArray.push(compatibilityString);
    }
    if (!correctDataArray.includes("compatible")) {
      returnArray.push(sourceName);
    }
  }
  return returnArray;
};
var bundle = {
  name: componentName,
  icon: componentIcon,
  information: componentInformation,
  explanation: componentExplanation,
  dataTypes: acceptedDataTypes,
  customSettingsPane: false,
  settingsMapper,
  generalSettings: ["background", "roll", "encounter", "party"],
  dataValidator,
  renderFunction: renderComponent
};
var CombatDisplay_default = bundle;
export {
  CombatDisplay_default as default
};
