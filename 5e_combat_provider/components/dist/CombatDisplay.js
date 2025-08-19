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
  let getBonusString = (input) => {
    let bonusString = `${input}`;
    if (!bonusString.startsWith("+") && !bonusString.startsWith("-")) {
      bonusString = `+${bonusString}`;
    }
    return bonusString;
  };
  let criticalFailureColor = slotSettings?.colors?.[`general/diceCriticalFailure`] || "rgba(219, 50, 50, 1)";
  let criticalSuccessColor = slotSettings?.colors?.[`general/diceCriticalSuccess`] || "rgba(89, 211, 83, 1)";
  let iconColor = "rgba(255, 255, 255)";
  let e_meta = foundEncounter?.["_meta"];
  let available_bonuses = e_meta?.["bonuses"];
  let active_bonuses_i = e_meta?.["active-bonuses-indices"];
  let e_bonuses = active_bonuses_i?.map((index) => available_bonuses[index]) || [];
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
  let previousColor = iconColor;
  let currentColor = iconColor;
  if (previousRoll === 20) {
    previousColor = criticalSuccessColor;
  } else if (previousRoll === 1) {
    previousColor = criticalFailureColor;
  }
  if (currentRoll === 20) {
    currentColor = criticalSuccessColor;
  } else if (currentRoll === 1) {
    currentColor = criticalFailureColor;
  }
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
            className: `bg-gray-500 p-1 rounded-md ${chosenRoll !== previousRoll ? "opacity-50 line-through" : ""}`,
            style: { color: previousColor }
          },
          `${previousRoll}`
        ),
        /* @__PURE__ */ React.createElement(
          "code",
          {
            className: `bg-gray-500 p-1 rounded-md ${chosenRoll !== currentRoll ? "opacity-50 line-through" : ""}`,
            style: { color: currentColor }
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
            className: `bg-gray-500 p-1 rounded-md`,
            style: { color: currentColor }
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
  if (chosenRoll === 20) {
    iconColor = criticalSuccessColor;
  } else if (chosenRoll === 1) {
    iconColor = criticalFailureColor;
  }
  let diceIcon = /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 1000 1000", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement(
    "path",
    {
      id: "d20",
      fill: iconColor,
      fillRule: "evenodd",
      stroke: "none",
      d: "M 500.534546 936.913269 L 491.717255 936.085815 L 489.588928 934.945679 L 484.116119 932.847656 L 480.163513 930.339294 L 478.439819 929.61615 L 476.007416 928.423828 L 133.868652 731.417725 L 130.569183 728.71814 L 127.982819 727.121948 L 125.725487 725.962891 L 123.516273 722.841553 L 121.319908 719.63269 L 119.033592 716.38147 L 117.893425 712.540161 L 116.981285 710.703491 L 116.786789 289.14447 L 119.962166 283.767761 L 127.362617 274.052673 L 485.028229 66.730042 L 489.892975 63.770874 L 499.622437 63.086731 L 509.351868 63.802002 L 860.828369 266.208618 L 867.669434 269.822083 L 874.724121 275.030273 L 880.881042 283.225647 L 883.17572 290.789978 L 885 500.965973 L 884.087891 707.054932 L 883.17572 709.612244 L 880.881042 716.774414 L 874.683472 724.934692 L 868.996948 729.605103 L 521.855835 929.829834 L 516.953003 932.843262 L 511.480194 934.945679 L 509.351868 936.085815 Z M 479.867065 897.46936 L 482.926849 896.094238 L 485.932434 892.031738 L 486.209534 841.42627 L 483.227722 790.995667 L 477.842804 786.831726 L 228.370361 744.308533 L 225.190247 743.823853 L 223.701218 746.525269 L 226.665665 751.39624 L 476.296753 895.867126 L 478.673035 896.827393 Z M 521.969788 896.300842 L 777.181396 750.485718 L 779.005615 746.306824 L 773.71936 743.703857 L 521.551575 786.770264 L 516.886597 790.121704 L 514.672668 831.666687 L 513.745056 887.442261 L 514.885254 891.741394 L 517.409058 895.626526 Z M 468.638397 756.310303 L 471.490234 754.89563 L 470.198242 751.475159 L 266.478546 399.893066 L 264.747009 396.928589 L 262.986969 399.893066 L 151.499374 697.585632 L 150.878784 701.234192 L 155.757477 703.554504 L 461.312714 754.486023 L 466.329437 755.398132 Z M 529.821106 756.310303 L 531.54718 755.398132 L 842.129578 705.230652 L 843.625305 704.318481 L 846.332703 702.72229 L 847.573425 696.391113 L 846.690308 691.092529 L 737.233948 399.132935 L 736.158936 397.134949 L 734.106628 399.263245 L 532.71875 747.075012 L 529.110779 753.185486 L 528.042358 755.693848 Z M 500.923462 745.614258 L 502.453888 743.081543 L 711.694092 380.510132 L 712.606262 378.685913 L 499.546387 376.861633 L 286.835266 377.545715 L 287.984894 380.054077 L 496.898071 740.734741 L 498.94223 744.702087 Z M 149.058075 619.489868 L 151.648087 617.4375 L 240.119339 379.141968 L 241.031479 374.040955 L 238.006363 366.569702 L 148.726425 313.709961 L 146.218048 312.526123 L 145.865601 618.881775 Z M 851.779541 619.489868 L 853.987366 466.707031 L 852.619141 313.924194 L 851.250977 314.737488 L 764.29718 364.017822 L 761.861633 366.9823 L 760.949463 368.652405 L 760.037354 375.493408 L 760.949463 382.334412 L 848.9729 616.763916 Z M 500.078491 344.024719 C 566.374268 343.426758 698.924194 341.404358 698.924194 341.404358 L 507.998108 105.169861 L 500.840668 101.677795 L 491.413208 106.790344 L 295.322327 344.966675 C 295.322327 344.966675 431.828583 344.64032 500.078491 344.024719 Z M 745.617371 341.207703 L 748.63562 340.37616 L 834.376465 291.120789 L 837.970703 288.775269 L 840.024597 286.94635 L 837.342468 284.829285 L 832.552185 282.05603 L 828.064331 279.221497 L 578.262573 135.202454 L 573.909058 135.704712 L 573.441162 140.215393 L 578.111023 146.098083 L 733.998901 335.356995 L 739.515625 339.155396 Z M 253.469086 339.4104 L 261.584747 338.157104 L 268.612457 332.456238 L 424.727661 142.884766 L 427.107605 138.968506 L 425.804565 135.536438 L 423.26947 134.233398 L 420.722626 136.057678 L 160.961365 287.040161 L 163.697769 290.110596 L 243.919907 336.499573 L 246.048218 338.270264 Z"
    }
  ));
  let displayNumber = finalRollResult;
  let iconClasses = "";
  if (foundDice?.info?.state === "rolling") {
    displayNumber = foundDice?.info?.face;
    iconClasses = "animate-spin";
  }
  let rollIcon = /* @__PURE__ */ React.createElement("div", { className: `w-24 h-24 relative ${iconClasses}` }, diceIcon, /* @__PURE__ */ React.createElement(
    "p",
    {
      className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg",
      style: { color: iconColor }
    },
    displayNumber
  ));
  let resultAddends = [];
  if (foundDice) {
    resultAddends.push(
      /* @__PURE__ */ React.createElement("div", { className: "flex flex-col justify-end text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "space-x-1" }, shownRolls), /* @__PURE__ */ React.createElement("p", null, foundDice["info"]["name"]))
    );
  }
  if (e_bonuses) {
    for (let e_bonus of e_bonuses) {
      let bonusString = getBonusString(e_bonus);
      let e_bonus_element = /* @__PURE__ */ React.createElement(
        "code",
        {
          className: `bg-gray-500 p-1 rounded-md`
        },
        `${bonusString}`
      );
      resultAddends.push(
        /* @__PURE__ */ React.createElement("div", { className: "flex flex-col justify-end text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "space-x-1" }, e_bonus_element), /* @__PURE__ */ React.createElement("p", null, "Encounter"))
      );
    }
  }
  if (statblock_bonus) {
    let bonusString = getBonusString(statblock_bonus);
    let statblock_bonus_element = /* @__PURE__ */ React.createElement("code", { className: `bg-gray-500 p-1 rounded-md` }, bonusString);
    resultAddends.push(
      /* @__PURE__ */ React.createElement("div", { className: "flex flex-col justify-end text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "space-x-1" }, statblock_bonus_element), /* @__PURE__ */ React.createElement("p", null, active_statblock))
    );
  }
  let rollPane = /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col space-y-2 justify-center items-center" }, rollIcon, /* @__PURE__ */ React.createElement("span", { className: "flex space-x-2" }, resultAddends));
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
  let encounterElements = [];
  if (!foundEncounter) {
    encounterElements.push(
      /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-300/30 p-2 rounded-md" }, "No Encounter found!")
    );
  } else {
    let advantageClass = getToggleClass(e_meta?.["advantage"]);
    let advantageClick = getOnClick(statblocksURL, {
      encounter: foundEncounterName,
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
      encounter: foundEncounterName,
      disadvantage: true
    });
    let disadvantageButton = getButton(
      "D",
      disadvantageClass,
      disadvantageClick,
      "disadvantage-button"
    );
    let bonusButtons = [];
    if (available_bonuses?.length > 0) {
      for (let i = 0; i < available_bonuses?.length; i++) {
        let bonusValue = available_bonuses[i];
        let isActive = active_bonuses_i?.includes(i);
        let buttonClass = getToggleClass(isActive);
        let buttonClick = getOnClick(statblocksURL, {
          encounter: foundEncounterName,
          bonus_index: i
        });
        let bonusButton = getButton(
          `${bonusValue}`,
          buttonClass,
          buttonClick,
          `statblock-bonus-${i}`
        );
        bonusButtons.push(bonusButton);
      }
    }
    let buttonPanel = /* @__PURE__ */ React.createElement("span", { className: "w-full h-[20%] flex flex-row justify-around items-center bg-gray-700/10 rounded-lg" }, advantageButton, disadvantageButton, bonusButtons);
    let statblocks = [];
    for (let statblock of Object.keys(foundEncounter)) {
      if (statblock === "_meta") continue;
      let attack_bonus = foundEncounter[statblock]?.["attack-bonus"];
      let bonusString = getBonusString(attack_bonus);
      let isActive = statblock === active_statblock;
      let buttonClass = getStatblockClass(isActive);
      let buttonClick = getOnClick(statblocksURL, {
        encounter: foundEncounterName,
        active_statblock: statblock
      });
      let statblockButton = getButton(
        [
          /* @__PURE__ */ React.createElement("p", null, statblock),
          /* @__PURE__ */ React.createElement("p", { className: "opacity-50" }, bonusString)
        ],
        buttonClass,
        buttonClick,
        `statblock-${statblock}`
      );
      statblocks.push(statblockButton);
    }
    let statblockList = /* @__PURE__ */ React.createElement("div", { className: "w-full h-[75%] overflow-scroll bg-gray-700/10 rounded-lg" }, /* @__PURE__ */ React.createElement("p", { className: "py-2 text-xl" }, foundEncounterName), /* @__PURE__ */ React.createElement("ul", { className: "flex flex-col items-center space-y-2" }, statblocks));
    encounterElements.push(buttonPanel, statblockList);
  }
  let encounterPane = /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "flex flex-col w-full h-full justify-between items-center",
      onClick: (e) => {
        e.stopPropagation();
      }
    },
    encounterElements
  );
  let hitColor = slotSettings?.colors?.["general/hit"] || "rgba(64, 172, 83, 1)";
  let partyElements = [];
  for (let sourceName in data) {
    if (slotSettings?.exclude?.includes(sourceName)) continue;
    for (let propertyName in data[sourceName]) {
      if (!propertyName.includes("5eParty")) continue;
      let memberElements = [];
      let party = data[sourceName][propertyName];
      let party_members = Object.keys(party);
      let partyURL = party["_meta"]?.toggle;
      if (party_members?.length === 0) break;
      for (let party_member_name of party_members) {
        let nameIsExcluded = slotSettings?.exclude?.includes(
          `${sourceName}/${party_member_name}`
        );
        if (nameIsExcluded || party_member_name === "_meta") {
          continue;
        }
        let party_member = data[sourceName][propertyName][party_member_name];
        let pm_icon = party_member?.["image-link"];
        let pm_bonuses = party_member?.["bonuses"] || [];
        let pm_active_bonuses_i = party_member?.["active-bonuses-indices"] || [];
        let pm_active_bonus_values = pm_active_bonuses_i?.map((index) => pm_bonuses[index]) || [];
        let pm_c_active_bonuses_values = party_member?.["active-custom-bonuses"] || [];
        let pm_external_bonuses = party_member?.["external-bonuses"] || {};
        let pm_external_bonuses_names = Object.keys(pm_external_bonuses);
        let pm_external_bonuses_values = Object.values(pm_external_bonuses);
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
        let customHitColor = slotSettings?.colors?.[`${sourceName}/${party_member_name}`] || hitColor;
        let member_color = isHitBy >= 0 ? customHitColor : "rgba(66, 66, 66, 0.33)";
        let member_buttons = [];
        let member_externals = [];
        if (pm_bonuses.length > 0) {
          for (let i = 0; i < pm_bonuses.length; i++) {
            let bonusValue = pm_bonuses[i];
            let isActive = pm_active_bonuses_i?.includes(i);
            let bonusString = getBonusString(bonusValue);
            let buttonClass2 = getToggleClass(isActive);
            let buttonClick2 = getOnClick(partyURL, {
              party: sourceName,
              player: party_member_name,
              bonus_index: i
            });
            let bonusButton2 = getButton(
              bonusString,
              buttonClass2,
              buttonClick2,
              `regular-bonus-${party_member_name}-index-${i}`
            );
            member_buttons.push(bonusButton2);
          }
        }
        if (pm_c_active_bonuses_values.length > 0) {
          for (let i = 0; i < pm_c_active_bonuses_values.length; i++) {
            let bonusValue = pm_c_active_bonuses_values[i];
            let isActive = true;
            let bonusString = getBonusString(bonusValue);
            let buttonClass2 = getToggleClass(isActive);
            let buttonClick2 = getOnClick(partyURL, {
              party: sourceName,
              player: party_member_name,
              custom_bonus_object: {
                action: "delete",
                index: i
              }
            });
            let bonusButton2 = getButton(
              bonusString,
              buttonClass2,
              buttonClick2,
              `custom-bonus-${party_member_name}-index-${i}`
            );
            member_buttons.push(bonusButton2);
          }
        }
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
              value: bonus
            }
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
            /* @__PURE__ */ React.createElement("li", { className: "flex flex-col text-sm rounded-md px-4 text-white rounded-md bg-gray-500/50 shadow-md" }, /* @__PURE__ */ React.createElement("p", null, value), /* @__PURE__ */ React.createElement("p", null, pm_external_bonus))
          );
        }
        let member_element = /* @__PURE__ */ React.createElement(
          "li",
          {
            className: "relative w-[90%] h-fit flex flex-row items-center justify-start py-4 rounded-md shadow-lg ",
            style: { backgroundColor: member_color }
          },
          /* @__PURE__ */ React.createElement("span", { className: "flex flex-row w-[15%] flex items-center px-4 justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "h-20 w-fit relative" }, /* @__PURE__ */ React.createElement(
            "img",
            {
              src: pm_icon,
              alt: `Icon for Player ${party_member_name}`,
              className: "h-full object-contain"
            }
          ), /* @__PURE__ */ React.createElement(
            "code",
            {
              className: `absolute bottom-0 right-0 translate-x-1/2 bg-gray-500 p-1 text-xs rounded-md`
            },
            finalAC
          ))),
          /* @__PURE__ */ React.createElement("p", { className: "w-[10%] text-left" }, party_member_name),
          /* @__PURE__ */ React.createElement("ul", { className: "w-[75%] flex flex-wrap px-6 py-2 justify-end space-x-2" }, member_externals, member_buttons),
          isHitBy > 0 ? /* @__PURE__ */ React.createElement(
            "p",
            {
              className: "absolute text-xs px-2 py-1 top-1/2 right-0 translate-x-[70%] -translate-y-1/2 rounded-r-full z-[1]",
              style: {
                backgroundColor: member_color
              }
            },
            isHitBy
          ) : null
        );
        memberElements.push(member_element);
      }
      let partyElement = /* @__PURE__ */ React.createElement("div", { className: "w-full h-fit py-4 bg-gray-700/10 rounded-lg" }, /* @__PURE__ */ React.createElement("p", { className: "py-2 text-xl" }, sourceName), /* @__PURE__ */ React.createElement("ul", { className: "flex flex-col items-center space-y-2" }, memberElements));
      partyElements.push(partyElement);
    }
  }
  let partyPane = /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "flex flex-col w-full h-full overflow-scroll space-y-4 p-2 justify-around items-center",
      onClick: (e) => {
        e.stopPropagation();
      }
    },
    partyElements
  );
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
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-col w-1/3 h-full p-4 justify-between" }, /* @__PURE__ */ React.createElement(
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
    /* @__PURE__ */ React.createElement("div", { className: "w-2/3 h-full p-4" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-full h-full rounded-md",
        style: {
          backgroundColor: backgroundColorParty
        }
      },
      partyPane
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
  generalSettings: [
    "background",
    "roll",
    "encounter",
    "party",
    "hit",
    "diceCriticalFailure",
    "diceCriticalSuccess"
  ],
  dataValidator,
  renderFunction: renderComponent
};
var CombatDisplay_default = bundle;
export {
  CombatDisplay_default as default
};
