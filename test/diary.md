<script>
  (function () {
    function loadFile(url, onLoad) {
      let req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.addEventListener("load", (e) => onLoad(req));
      req.send();
    }
    function loadStyle(url) {
      loadFile(url, (req) => {
        let styleElem = document.createElement("style");
        styleElem.innerText = req.responseText;
        document.head.appendChild(styleElem);
      });
    }
    function loadScript(url) {
      loadFile(url, (req) => {
        let scriptElem = document.createElement("script");
        scriptElem.innerText = req.responseText;
        document.body.appendChild(scriptElem);
      });
    }

    let styles = [
      "https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/css/global.css",
      "https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/css/logbook_toolbar.css",
    ];
    let scripts = [
      "https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/js/logbook_toolbar.js",
      "https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/js/day_planner_btn.js",
    ];

    styles.forEach((url) => loadStyle(url));
    scripts.forEach((url) => loadScript(url));
  })();
</script>

# Diary

## 2024-08-31

- Test : 10:00
- Test : 11:00

askdjasdokij