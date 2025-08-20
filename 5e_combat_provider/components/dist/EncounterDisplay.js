// component_compiler/src/EncounterDisplay.jsx
var componentName = "Encounter Display";
var acceptedDataTypes = ["5eEncounter"];
var componentInformation = "source-based encounter controls";
var componentExplanation = /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("p", null, "This is a DynDash Component that takes in Sources of the Data Type", " ", /* @__PURE__ */ React.createElement("code", { className: "bg-gray-900/50 px-2 py-1 mr-1 rounded-lg" }, "5eEncounter"), "in order to display the related data and render controls for modifying the state of the encounters listed in the data."), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("p", null, "It is possible to hide the titles by adding the following key to the exclude array:"), /* @__PURE__ */ React.createElement("div", { className: "space-x-1 text-sm flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gray-900/50 px-2 rounded-lg" }, "SOURCENAME/title")));
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
var renderComponent = (uuid, data, slotSettings) => {
  let listOfEncounters = [];
  for (let sourceName in data) {
    if (slotSettings?.exclude?.includes(sourceName)) continue;
    for (let propertyName in data[sourceName]) {
      if (!propertyName.includes("5eEncounter")) continue;
      let currentEncounter = data[sourceName][propertyName];
      let e_meta = currentEncounter?.["_meta"];
      let available_bonuses = e_meta?.["bonuses"];
      let active_bonuses_i = e_meta?.["active-bonuses-indices"];
      let active_custom_bonuses_values = e_meta?.["active-custom-bonuses"] || [];
      let active_statblock = e_meta?.["active-statblock"];
      let advantage = e_meta?.["advantage"];
      let disadvantage = e_meta?.["disadvantage"];
      if (advantage && disadvantage) {
        disadvantage = false;
        advantage = false;
      }
      let statblocksURL = e_meta?.toggle;
      let baseButtonClasses = "px-4 text-white rounded-md transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400";
      let toggleButtonClasses = "w-fit h-fit py-2";
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
      let getOnClick = (requestURL, sendObject) => {
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
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            className: `rounded-md ${classes} z-[2]`,
            onClick,
            key: `${uuid}-${text}-${optionalKey}`
          },
          text
        );
      };
      let getBonusString = (input) => {
        let bonusString = `${input}`;
        if (!bonusString.startsWith("+") && !bonusString.startsWith("-")) {
          bonusString = `+${bonusString}`;
        }
        return bonusString;
      };
      let advantageClass = getToggleClass(e_meta?.["advantage"]);
      let advantageClick = getOnClick(statblocksURL, {
        encounter: sourceName,
        advantage: true
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
        disadvantage: true
      });
      let disadvantageButton = getButton(
        "D",
        disadvantageClass,
        disadvantageClick,
        "disadvantage-button"
      );
      let encounter_buttons = [];
      if (available_bonuses?.length > 0) {
        for (let i = 0; i < available_bonuses?.length; i++) {
          let bonusValue = available_bonuses[i];
          let isActive = active_bonuses_i?.includes(i);
          let buttonClass2 = getToggleClass(isActive);
          let buttonClick2 = getOnClick(statblocksURL, {
            encounter: sourceName,
            bonus_index: i
          });
          let bonusButton2 = getButton(
            `${bonusValue}`,
            buttonClass2,
            buttonClick2,
            `statblock-bonus-${i}`
          );
          encounter_buttons.push(bonusButton2);
        }
      }
      if (active_custom_bonuses_values.length > 0) {
        for (let i = 0; i < active_custom_bonuses_values.length; i++) {
          let bonusValue = active_custom_bonuses_values[i];
          let isActive = true;
          let bonusString = getBonusString(bonusValue);
          let buttonClass2 = getToggleClass(isActive);
          let buttonClick2 = getOnClick(statblocksURL, {
            encounter: sourceName,
            custom_bonus_object: {
              action: "delete",
              index: i
            }
          });
          let bonusButton2 = getButton(
            bonusString,
            buttonClass2,
            buttonClick2,
            `custom-bonus-${sourceName}-index-${i}`
          );
          encounter_buttons.push(bonusButton2);
        }
      }
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
            value: bonus
          }
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
      let buttonPanel = /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "w-full h-fit p-2 flex flex-row flex-wrap space-x-2 space-y-2 justify-around items-center bg-gray-300/10 rounded-lg",
          onClick: (e) => {
            e.stopPropagation();
          }
        },
        advantageButton,
        disadvantageButton,
        encounter_buttons
      );
      let statblocks = [];
      for (let statblock of Object.keys(currentEncounter)) {
        if (statblock === "_meta") continue;
        let isExcluded = slotSettings?.exclude?.includes(
          `${sourceName}/${statblock}`
        );
        if (isExcluded) continue;
        let attack_bonus = currentEncounter[statblock]?.["attack-bonus"];
        let bonusString = getBonusString(attack_bonus);
        let isActive = statblock === active_statblock;
        let buttonClass2 = getStatblockClass(isActive);
        let buttonClick2 = getOnClick(statblocksURL, {
          encounter: sourceName,
          active_statblock: statblock
        });
        let statblockButton = getButton(
          [
            /* @__PURE__ */ React.createElement("p", null, statblock),
            /* @__PURE__ */ React.createElement("p", { className: "opacity-50" }, bonusString)
          ],
          buttonClass2,
          buttonClick2,
          `statblock-${statblock}`
        );
        statblocks.push(statblockButton);
      }
      let encounterTitle = /* @__PURE__ */ React.createElement("p", { className: "py-2 text-xl" }, sourceName);
      if (slotSettings?.exclude?.includes(`${sourceName}/title`)) {
        encounterTitle = null;
      }
      let statblockList = /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "w-full h-fit bg-gray-300/10 rounded-lg py-4",
          onClick: (e) => {
            e.stopPropagation();
          }
        },
        encounterTitle,
        /* @__PURE__ */ React.createElement("ul", { className: "flex flex-col items-center space-y-2" }, statblocks)
      );
      let encounterPane = /* @__PURE__ */ React.createElement("div", { className: "flex flex-col w-full h-fit space-y-4 p-2 justify-around items-center" }, buttonPanel, statblockList);
      listOfEncounters.push(encounterPane);
    }
  }
  let backgroundColor = slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-row items-center overflow-auto",
      style: {
        backgroundColor
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-full h-full rounded-md" }, listOfEncounters)
  );
};
var dataValidator = (data) => {
  let returnArray = [];
  for (let sourceName in data) {
    let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
      return key.includes("5eEncounter");
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
      if (!propertyName.includes("5eEncounter")) continue;
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
  generalSettings: ["background"],
  dataValidator,
  renderFunction: renderComponent
};
var EncounterDisplay_default = bundle;
export {
  EncounterDisplay_default as default
};
