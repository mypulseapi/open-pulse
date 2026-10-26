# PULSE open source

The open-source packages for [PULSE](https://thepulseapi.com), by Resolve Labs. MIT licensed.

| Package | What it is | npm |
| --- | --- | --- |
| [`@thepulseapi/sdk`](packages/sdk) | The browser SDK: send signals, rank a catalogue for each shopper, measure what was shown | [![npm](https://img.shields.io/npm/v/@thepulseapi/sdk)](https://www.npmjs.com/package/@thepulseapi/sdk) |
| [`@thepulseapi/mcp`](packages/mcp) | An MCP server for Claude, ChatGPT and other agents: search the PULSE docs, and with an API key, ask which products meet a shopper's requirements | publishing |

## What is open, and what is not

The code that runs on your storefront or your machine is here, so you can read exactly what it does.
What decides which product fix or promotion is worth its cost, and proves it worked, is the
[PULSE API](https://developer.thepulseapi.com/api). **Finding problems is open; deciding is the API.**

Planned for this repository: a query parser that turns a shopper's words into requirements, shared
formats for buying requirements, product evidence and order outcomes, and a return-reason taxonomy.
See [thepulseapi.com/opensource](https://thepulseapi.com/opensource).

## Develop

```bash
npm install
npm run ci        # build, type-check, syntax-check
```

## Contribute

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first: contributions
are accepted under the [Contributor License Agreement](CLA.md).

## Licence

[MIT](LICENSE). Copyright (c) 2026 Resolve Labs.
