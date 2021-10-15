# CryptoFacilities Order Book Example
_Example WebSocket app, reading off the CryptoFacilities WS API_

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![CICD Status](https://github.com/kolyaventuri/kolya-oct-2021/actions/workflows/node.js.yml/badge.svg)](https://github.com/kolyaventuri/kolya-oct-2021/actions/workflows/node.js.yml)
---

# Overview
Renders an order book for XBTUSD or ETHUSD, using the CryptoFacilities WebSocket API.

# Stack
- Frontend
  - [NextJS](https://nextjs.org/)
  - [React](https://reactjs.org)
  - [TypeScript](https://www.typescriptlang.org/)
  - [TailwindCSS](https://tailwindcss.com/)
- Testing
  - [AVA](https://github.com/avajs/ava) (test runner)
  - [XO](https://github.com/xojs/xo) (code linting) 
  - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

# Setup + Running
- Clone the repo and `npm i` to install dependencies
- Run with one of the following
  - Use `npm run dev` to run locally, with a live connection to CryptoFacilities
  - Use `npm run local` to run locally, with a **mocked** local websocket
- App will run on `http://localhost:4000`

# Deployment
Steps TBD
