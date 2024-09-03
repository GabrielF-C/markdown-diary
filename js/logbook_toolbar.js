document.addEventListener("readystatechange", function handler() {
  document.removeEventListener("readystatechange", handler);

  const REGEX_VALID_ELEM_ID = /^[A-Za-z]+[\w\-\:\.]*$/;
  const msgElemId = generateUniqueElemId();
  const dateHeaderIds = [];
  const desiredDurationHours = 6;
  const totalPay = 14_000;
  const [
    topToolbar,
    datePicker,
    durationOutput,
    remainingDurationOutput,
    totalDurationOutput,
    toggleToolbarBtn,
    exportDataBtn,
  ] = createTopToolbar();
  addDateHeaderOnClick();
  fixDateHeaderIds();
  updateDurationOutput();
  updateTotalTime();

  function getCurrentDateStr() {
    let currDate = new Date();
    let [Y, M, D] = [
      currDate.getFullYear(),
      currDate.getMonth() + 1,
      currDate.getDate(),
    ];
    return `${Y}-${M.toString().padStart(2, "0")}-${D.toString().padStart(2, "0")}`;
  }

  function getDateHeadersSelector() {
    if (dateHeaderIds.length > 0) {
      return `#${dateHeaderIds.join(",#")}`;
    }
    return "h2";
  }

  function getDateHeaders() {
    return document.querySelectorAll(getDateHeadersSelector());
  }

  function getTargetDateHeaderId() {
    let dateHeaders = getDateHeaders();
    let targetHeaderId = null;
    for (let h of dateHeaders) {
      if (h.innerText.trim() === datePicker.value) {
        targetHeaderId = h.id;
        break;
      }
    }
    return targetHeaderId;
  }

  function toggleDisplayToolbar() {
    topToolbar.classList.toggle("hidden");
  }

  function exportData() {
    let dataStr = "date,start_time,end_time,break_count,total_time,notes\n";

    const dateHeaders = getDateHeaders();
    for (let dateHeader of dateHeaders) {
      let data = {};

      data.date = dateHeader.innerText;

      let timeValues = getTimeValuesForDateHeader(dateHeader.id);
      data.startTime = timeValues[0];
      data.endTime = timeValues[timeValues.length - 1];
      data.breakCount = timeValues.length - 2;

      let totalMs = getTotalTimeForDateHeader(dateHeader.id);
      data.time = toDisplayTime(totalMs);

      data.notes = getNotesForDateHeader(dateHeader.id);

      dataStr += `${data.date},${data.startTime},${data.endTime},${data.breakCount},${data.time},"${data.notes}"\n`;
    }

    if (dataStr) {
      displayMessage("Data exported to clipboard", ["info"], 5);
      navigator.clipboard.writeText(dataStr);
    } else {
      raiseError("Could not export data");
    }
  }

  function updateDurationOutput() {
    let targetHeaderId = getTargetDateHeaderId();
    if (targetHeaderId === null) {
      durationOutput.value = "could not get target date header";
      remainingDurationOutput.value = "N/A";
      return;
    }

    let totalMs = getTotalTimeForDateHeader(targetHeaderId);

    // Display the total time
    durationOutput.value = toDisplayTime(totalMs);

    let totalMin = totalMs / 1000 / 60;
    let remainingDesiredDurationMin = desiredDurationHours * 60 - totalMin;
    if (remainingDesiredDurationMin > 0) {
      let endDate = new Date();
      endDate.setMinutes(endDate.getMinutes() + remainingDesiredDurationMin);
      remainingDurationOutput.value = `Start now, finish at ${endDate.toLocaleTimeString(
        "en-GB"
      )}`;
    } else {
      remainingDurationOutput.value = `You are done !`;
    }
  }

  function updateTotalTime() {
    let dateHeaders = getDateHeaders();
    let totalMs = 0;
    for (let h of dateHeaders) {
      totalMs += getTotalTimeForDateHeader(h.id);
    }
    let totalHours = totalMs / 1000 / 60 / 60;
    let hourlyRate = (totalPay / totalHours).toPrecision(5);
    totalDurationOutput.value = toDisplayTime(totalMs) + ` (${hourlyRate}$/h)`;
  }

  function toDisplayTime(milliseconds) {
    let totalMin = milliseconds / 1000 / 60;
    let hours = Math.floor(totalMin / 60);
    let remainingMin = totalMin % 60;
    return (
      hours.toString().padStart(2, "0") +
      ":" +
      remainingMin.toString().padStart(2, "0")
    );
  }

  function getTimeValuesForDateHeader(targetHeaderId) {
    let targetListItems = document.querySelectorAll(
      `#${targetHeaderId} + ul li`
    );
    let timeValues = [];
    for (let li of targetListItems) {
      let itemStr = li.innerText;
      let timeStr = itemStr.slice(itemStr.indexOf(":") + 1).trim();
      let containsComma = timeStr.indexOf(", ") !== -1;
      if (containsComma) {
        timeValues.push(...timeStr.split(", "));
      } else {
        timeValues.push(timeStr);
      }
    }

    return timeValues;
  }

  /**
   * Total time is in ms
   *
   * @param {string} targetHeaderId
   * @returns
   */
  function getTotalTimeForDateHeader(targetHeaderId) {
    // Find the time values
    let timeValues = getTimeValuesForDateHeader(targetHeaderId);

    // Calculate the total time
    let totalMs = 0,
      from = null,
      to = null,
      startOfTheNextTimeSpan = null;
    for (let timeVal of timeValues) {
      let containsDash = timeVal.indexOf("-") !== -1;
      if (containsDash) {
        // It is a range to exclude, extract the time values
        let [t1, t2] = timeVal.split("-");
        if (from) {
          // The first value is the end of a time span
          to = t1;
          // The second value is the start of a new time span
          startOfTheNextTimeSpan = t2;
        } else {
          // The first value is the start of a time span
          from = t1;
          // The second value is the end of that time span
          to = t2;
        }
      } else if (from) {
        // It is the end of a time span
        to = timeVal;
      } else {
        // It is the start of a time span
        from = timeVal;
      }

      if (from && to) {
        let isFromValid = from.indexOf(":") !== -1;
        let isToValid = to.indexOf(":") !== -1;
        if (isFromValid && isToValid) {
          // Calculate the time span and add to total time
          let fromSplit = from.split(":"),
            toSplit = to.split(":");
          let d1 = new Date(),
            d2 = new Date();
          d1.setHours(parseInt(fromSplit[0]), parseInt(fromSplit[1]));
          d2.setHours(parseInt(toSplit[0]), parseInt(toSplit[1]));
          totalMs += d2 - d1;
        }
        // Reset the variables
        from = startOfTheNextTimeSpan;
        to = null;
        startOfTheNextTimeSpan = null;
      }
    }

    return totalMs;
  }

  function getNotesForDateHeader(targetHeaderId) {
    let notes = "";

    // Walk from this header to the next
    for (
      let elem = document.querySelector(
        `#${targetHeaderId} + ul`
      ).nextElementSibling;
      elem !== null &&
      elem.tagName !== "H2" &&
      !(elem.tagName === "A" && !elem.innerText);
      elem = elem.nextElementSibling
    ) {
      notes += elem.innerText.replace(/(\r\n|\n|\r)/gm, " ");
    }

    return notes;
  }

  function addDateHeaderOnClick() {
    let dateHeaders = getDateHeaders();
    for (let h of dateHeaders) {
      h.addEventListener("click", () => {
        datePicker.value = h.innerText.trim();
        datePicker.onchange();
      });
    }
  }

  function fixDateHeaderIds() {
    let dateHeaders = getDateHeaders();
    for (let h of dateHeaders) {
      if (!isValidElemId(h.id)) {
        let oldId = h.id;
        h.id = generateUniqueElemId();
        let a = document.createElement("a");
        a.id = oldId;
        h.before(a);

        dateHeaderIds.push(h.id);
      }
    }
  }

  function generateUniqueElemId() {
    let id;
    while (!id) {
      id = (Math.random() + 1).toString(36).substring(7);
      if (!isValidElemId(id) || document.getElementById(id)) {
        id = undefined;
      }
    }
    return id;
  }

  function isValidElemId(id) {
    return REGEX_VALID_ELEM_ID.test(id);
  }

  function createTopToolbar() {
    if (document.getElementById("topToolbar")) {
      throw raiseError("topToolbar already exists");
    }

    let topToolbar = document.createElement("div");
    topToolbar.id = "topToolbar";
    topToolbar.classList.add("hidden");

    let labelDatePicker = document.createElement("label");
    labelDatePicker.for = "datePicker";
    labelDatePicker.innerText = "Date (click date header)";
    topToolbar.appendChild(labelDatePicker);

    let labelDurationOutput = document.createElement("label");
    labelDurationOutput.for = "durationOutput";
    labelDurationOutput.innerText = "Total time for date";
    topToolbar.appendChild(labelDurationOutput);

    let labelRemainingDurationOutput = document.createElement("label");
    labelRemainingDurationOutput.for = "remainingDurationOutput";
    labelRemainingDurationOutput.innerText = `Reaching target (${desiredDurationHours}h)`;
    topToolbar.appendChild(labelRemainingDurationOutput);

    let labelTotalDurationOutput = document.createElement("label");
    labelTotalDurationOutput.for = "totalDurationOutput";
    labelTotalDurationOutput.innerText = "Total time for all entries";
    topToolbar.appendChild(labelTotalDurationOutput);

    let datePicker = document.createElement("input");
    datePicker.id = "datePicker";
    datePicker.type = "date";
    datePicker.min = "2022-05-10";
    datePicker.max = getCurrentDateStr();
    datePicker.value = getCurrentDateStr();
    datePicker.onchange = updateDurationOutput;
    topToolbar.appendChild(datePicker);

    let durationOutput = document.createElement("input");
    durationOutput.id = "durationOutput";
    durationOutput.readOnly = true;
    topToolbar.appendChild(durationOutput);

    let remainingDurationOutput = document.createElement("input");
    remainingDurationOutput.id = "remainingDurationOutput";
    remainingDurationOutput.readOnly = true;
    topToolbar.appendChild(remainingDurationOutput);

    let totalDurationOutput = document.createElement("input");
    totalDurationOutput.id = "totalDurationOutput";
    totalDurationOutput.readOnly = true;
    topToolbar.appendChild(totalDurationOutput);

    let toggleToolbarBtn = document.createElement("button");
    toggleToolbarBtn.id = "toggleToolbarBtn";
    toggleToolbarBtn.classList.add("floating-btn");
    toggleToolbarBtn.onclick = toggleDisplayToolbar;
    toggleToolbarBtn.innerText = "toolbar";

    let exportDataBtn = document.createElement("button");
    exportDataBtn.id = "exportDataBtn";
    exportDataBtn.classList.add("floating-btn");
    exportDataBtn.onclick = exportData;
    exportDataBtn.innerText = "export";

    document.body.prepend(toggleToolbarBtn);
    document.body.prepend(topToolbar);
    document.body.prepend(exportDataBtn);

    return [
      topToolbar,
      datePicker,
      durationOutput,
      remainingDurationOutput,
      totalDurationOutput,
      toggleToolbarBtn,
    ];
  }

  function raiseError(msg) {
    displayMessage(msg, ["error"]);
    return new Error(msg);
  }

  /**
   * @param {string} msg Message to display
   * @param {string[]} msgClasses Css classes to add to the message container
   * @param {number} duration Duration of the message in seconds (permanent if duration < 1)
   */
  function displayMessage(msg, msgClasses = ["info"], duration = 0) {
    let msgElem = document.getElementById(msgElemId);
    if (!msgElem) {
      msgElem = document.createElement("div");
      msgElem.id = msgElemId;
      msgElem.classList.add("msg-elem");
      document.body.prepend(msgElem);
    }

    let p = document.createElement("p");
    p.classList.add("p-5", ...msgClasses);
    p.innerText = msg;
    msgElem.appendChild(p);

    if (duration && duration > 0) {
      if (duration > 1) {
        setTimeout(() => {
          p.classList.add("fade-out");
        }, 1000);
      }

      setTimeout(() => {
        p.remove();
      }, duration * 1000);
    }
  }
});
