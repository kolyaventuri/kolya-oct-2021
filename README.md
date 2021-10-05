# Amplify + Typescript Template
_Template repository for AWS Amplify apps using Typescript and NextJS_

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
---

# Overview
Run fast with a new [AWS Amplify](https://aws.amazon.com/amplify/) project using a quick and dirty TypeScript stack! Really built for single page web apps, but do with this what you want.

# Stack
- Frontend
  - [NextJS](https://nextjs.org/)
  - [React](https://reactjs.org)
  - [SASS](https://sass-lang.com/)
  - [TypeScript](https://www.typescriptlang.org/)
- Testing
  - [AVA](https://github.com/avajs/ava) (test runner)
  - [XO](https://github.com/xojs/xo) (code linting) 
  - [stylelint](https://stylelint.io/) (SASS linting)

# How to use
1) Create a new repository using this as a template
2) `npm i` to get the dependencies installed
3) Modify the `package.json` and this readme to fit your project
4) Run the local build with `npm run dev`! (App will start on port `4000`)
5) Deploy your app on Amplify! See their [docs](https://docs.amplify.aws/) for more information on your specific deployment strategy.

# Q + A
### Why AVA? Why not Jest?
- Personal preference. I find Jest clunky in comparison, but it has its merits. Feel free to swap it out.
### Why use such a strict linter?
- I like clean code, and personally it forces me to write more readable code. The style is automagically enforced by Prettier anyways.
