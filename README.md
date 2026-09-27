# Taskflow — To-do List Web App

A responsive, accessible to-do list built with **HTML, CSS, and vanilla JavaScript**. Tasks are stored in your browser with `localStorage`, so they remain after refreshing or reopening the same browser.

## Features

- Add, edit, complete, and delete tasks
- Filter tasks by All, Active, and Completed
- Clear all completed tasks at once
- Completion progress and remaining-task count
- Persistent browser storage (`localStorage`)
- Responsive layout, keyboard-friendly controls, and accessible labels
- No framework, build step, or backend required

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For a local development server, you can use VS Code's **Live Server** extension, or run:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Publish with GitHub Pages

1. Create a new GitHub repository (for example, `taskflow-todo`).
2. Upload the contents of this project to the repository's root folder. Make sure `index.html`, `styles.css`, and `script.js` are at the top level.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then click **Save**.
6. Wait for the deployment to finish. Your site will be available at the Pages URL shown there.

## Storage note

The app saves data in the current browser and device. `localStorage` is not synced between devices or different browsers. Clearing browser site data may remove saved tasks.

## Project structure

```text
taskflow-todo/
├── index.html
├── styles.css
├── script.js
├── README.md
└── .gitignore
```

## License

MIT — see `LICENSE`.
