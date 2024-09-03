document.addEventListener("readystatechange", function handler() {
  document.removeEventListener("readystatechange", handler);

  let dayPlannerBtn = document.createElement("button");
  dayPlannerBtn.id = "dayPlannerBtn";
  dayPlannerBtn.classList.add("floating-btn");
  dayPlannerBtn.style.bottom = 0;
  dayPlannerBtn.style.right = 0;
  dayPlannerBtn.onclick = () =>
    navigator.clipboard.writeText(getDayPlannerText());
  dayPlannerBtn.innerText = "copy day planner";
  document.body.prepend(dayPlannerBtn);

  function getDayPlannerText() {
    const rows = [
      "### Plan de la journée\n",
      "| Heure | Tâches                      |",
      "| :---- | :-------------------------- |",
      { task: "Planification de la journée", duration: 30 },
      null,
      { task: "Pause", duration: 15 },
      null,
      null,
      { task: "Dîner" },
      null,
      { task: "Pause", duration: 15 },
      { duration: 90 },
      { time: { hours: 16, minutes: 45 }, task: "Retour sur la journée" },
    ];

    try {
      return buildDayPlannerText(rows) + "| 17:00 | Souper |";
    } catch (e) {
      return e;
    }
  }

  function buildDayPlannerText(rows) {
    const now = new Date();
    // Round the minutes up so we have a nice round number (i.e. 10, 20, 30...)
    now.setMinutes(Math.ceil(now.getMinutes() / 10) * 10);

    const lastRow = rows[rows.length - 1];

    const nowTimeObj = { hours: now.getHours(), minutes: now.getMinutes() };
    if (toMinutes(nowTimeObj) >= toMinutes(lastRow.time)) {
      throw `Error: Not enough time left in the day`;
    }

    let time = null;
    let prevRow = null;
    let dayPlannerText = "";

    for (let row of rows) {
      if (typeof row === "string") {
        dayPlannerText += row;
      } else {
        if (time) {
          time = offsetMinutes(time, prevRow?.duration ?? 60);
        } else {
          time = nowTimeObj;
        }

        if (toMinutes(time) >= toMinutes(lastRow.time)) {
          if (row !== lastRow) {
            continue;
          }
          time.minutes = lastRow.time.minutes;
          time.hours = lastRow.time.hours;
        }

        let displayTime = toDisplayTime(time.hours, time.minutes);
        dayPlannerText += `| ${displayTime} | ${row?.task ?? ""} |`;
      }

      dayPlannerText += "\n";
      prevRow = row;
    }

    return dayPlannerText;
  }

  function offsetMinutes(timeObj, offsetMinutes = 0) {
    timeObj.minutes += offsetMinutes;
    if (timeObj.minutes >= 60) {
      timeObj.hours += Math.floor(timeObj.minutes / 60);
    }
    timeObj.minutes %= 60;
    timeObj.hours %= 24;
    return timeObj;
  }

  function toMinutes(timeObj) {
    return timeObj.hours * 60 + timeObj.minutes;
  }

  function toDisplayTime(hours, minutes) {
    return (
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0")
    );
  }
});
