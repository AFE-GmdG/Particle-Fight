# Particle Fight

[![GitHub issues](https://img.shields.io/github/issues/afe-gmdg/particle-fight.svg?style=flat)](https://github.com/afe-gmdg/particle-fight/issues)
[![GitHub license button](https://img.shields.io/github/license/afe-gmdg/particle-fight.svg?style=flat)](https://github.com/afe-gmdg/particle-fight/blob/master/LICENSE)
[![GitHub package version](https://img.shields.io/github/package-json/v/afe-gmdg/particle-fight.svg?style=flat)](https://github.com/afe-gmdg/particle-fight)

This is a research, learn and demonstration project for web specific technologies
- WebSocket
- WebRTC

The project is supposed to use with `yarn`:
- Initialize the project: `yarn`
- Remove all auto generated or downloaded files: `yarn clean`
- Create a release build: `yarn build`
- Create and start a debug build: `yarn start`

The project contains a VS Code Workspace file: [particle-fight.code-workspace](./particle-fight.code-workspace). It contains the workspace and debugging settings. The folder `.vscode` isn't necessary.

To start a debug session right from VS Code open the project with the code-workspace file and use the `Debug Particle Fight (Workspace)` item of the execute tab within the workspace. This starts 2 parallel debug sessions, one backend and one frontend session.

You have to install the [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) extension. You should additionally install and activate the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension.
