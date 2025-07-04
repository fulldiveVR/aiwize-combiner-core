# AIWIZE Combiner CLI

The AIWIZE Combiner CLI (`aiwize-combiner`) is a powerful development tool for building and debugging vertical AI agents (modules) for the AIWIZE Browser ecosystem. It provides essential utilities for local development, module bootstrapping, and running a development backend server.

## 🚀 Quick Start

```bash
# Install the CLI globally
npm install -g aiwize-combiner

# Bootstrap a new module project
aiwize-combiner bootstrap

# Start the development backend server
aiwize-combiner serve
```

## 🛠️ Key Features

- **Module Bootstrapping**: Quickly create new AIWIZE modules with proper structure and dependencies
- **Development Backend**: Run a local backend server that replaces the browser's internal backend for development
- **Project Templates**: Generate modules using either base or bootstrap templates
- **Port Management**: Automatically manages port 22003 for browser-backend communication

## 📋 Commands

### `bootstrap`

Creates a new AIWIZE module project with the necessary structure and dependencies.

```bash
aiwize-combiner bootstrap [options]

Options:
  --type     Choose template type: 'base' or 'bootstrap' (default: 'bootstrap')
  --name     Name of your module
```

This command:
- Creates the module folder structure
- Downloads required dependencies
- Generates package.json and other config files
- Sets up development environment

### `serve`

Runs the development backend server on port 22003.

```bash
aiwize-combiner serve [options]

Options:
  --port     Specify custom port (default: 22003)
```

> **Important**: Ensure port 22003 is free before running this command. The AIWIZE Browser uses this port to detect and connect to the development backend.

## 🔄 Development Workflow

1. **Create New Module**
   ```bash
   aiwize-combiner bootstrap --name my-module
   cd my-module
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Backend**
   ```bash
   aiwize-combiner serve
   ```

4. **Launch AIWIZE Browser**
   - The browser will automatically detect and connect to your development backend
   - Your module will be loaded in the browser's panel system

## 📦 NPM Package Integration

The CLI is part of the AIWIZE ecosystem's NPM package family:

- `aiwize-combiner`: This CLI tool
- `aiwize-module-bootstrap`: Full-featured module template with RAG, billing, etc.
- `aiwize-module-base`: Basic module template for low-level browser API access

## 🤝 Contributing

We welcome contributions! Please check our [contribution guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.