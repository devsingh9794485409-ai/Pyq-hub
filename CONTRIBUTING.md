# 🤝 Contributing to PYQ Hub

Thank you for your interest in contributing to **PYQ Hub**! All contributions — bug fixes, features, docs, and ideas — are welcome.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Pyq-hub.git
   cd Pyq-hub
   ```
3. **Set up** the project following the instructions in [README.md](./README.md).
4. Create a new **branch** for your work:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Development Workflow

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

Both servers support **hot-reload** during development.

---

## Code Style

- **JavaScript / JSX** — Follow the ESLint rules already configured in the project. Run `npx eslint .` before committing.
- **Naming** — Use `camelCase` for variables/functions, `PascalCase` for React components and classes.
- **Imports** — Group imports: third-party libraries first, then internal modules.
- **Comments** — Write comments for non-obvious logic; avoid over-commenting trivial code.

---

## Commit Message Guidelines

We follow **Conventional Commits**:

```
<type>(optional scope): short description

[optional body]
```

| Type       | When to use                              |
|------------|------------------------------------------|
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `docs`     | Documentation changes                    |
| `style`    | Formatting, missing semicolons, etc.     |
| `refactor` | Code refactoring without feature change  |
| `chore`    | Build process, dependency updates, etc.  |
| `test`     | Adding or fixing tests                   |

**Examples:**
```
feat(auth): add refresh token support
fix(upload): handle empty file name edge case
docs: add CONTRIBUTING guide
```

---

## Pull Request Process

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Make sure linting passes: `npx eslint .`
3. Open a PR against the `main` branch with a clear title and description.
4. Link any related issue in the PR description (e.g., `Closes #42`).
5. Wait for a review — be ready to make requested changes.

---

## Reporting Issues

If you find a bug or have a feature request, please [open an issue](https://github.com/devsingh9794485409-ai/Pyq-hub/issues) and include:

- A clear, descriptive title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots or logs if applicable

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
