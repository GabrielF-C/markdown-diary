# Markdown Diary

## Requirements

Some or all of the extensions listed below may not be required for the system to work, this is just what I use.

- Visual Studio Code
- (extension) Markdown All in One

## How to setup

1. Open your markdown file in VSCode and add the following at the start of the file :
    ```html
    <head>
      <link rel="stylesheet" href="https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/css/global.css">
      <link rel="stylesheet" href="https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/css/logbook_toolbar.css">
      <script src="https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/js/logbook_toolbar.js"></script>
      <script src="https://raw.githubusercontent.com/GabrielF-C/markdown-diary/main/js/day_planner_btn.js"></script>
    </head>
    ```
2. `Ctrl`+`Shift`+`P` and run `Markdown: Change Preview Security Settings` (setting may only apply to the current workspace)
3. Select `Disable` ( :warning: **potential security risks, read about it [here](https://code.visualstudio.com/docs/languages/markdown#_markdown-preview-security)** :warning: )
4. With your markdown file still opened, `Ctrl`+`Shift`+`P` and run `Markdown: Open Preview to the Side`
5. Done (if the scripts are not being loaded, you may need to restart VSCode)

## How to use

WIP
