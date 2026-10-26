# @thepulseapi/mcp

The [PULSE developer documentation](https://developer.thepulseapi.com) as an MCP server, so an
agent can search and read it rather than recalling an endpoint that may not exist. And, with an
API key, the PULSE Decision API: which of these options meet what was asked for, and which the
evidence cannot tell. Part of [Open Pulse](https://github.com/mypulseapi/open-pulse).

An agent that can say "the evidence does not say" stops guessing. `resolve_products` never fills
in a fact the evidence does not state: it reports it as unknown, with what is missing.

```json
{
  "mcpServers": {
    "pulse": {
      "command": "npx",
      "args": ["-y", "@thepulseapi/mcp"]
    }
  }
}
```

## Tools

| Tool | What it does |
| --- | --- |
| `search_docs` | Full-text search across every page. Returns the matching section, its URL and a score |
| `get_page` | One page as Markdown, by path |
| `list_pages` | Every page with its title |
| `resolve_products` | Per requirement: meets, fails, unknown or conflicting; per option: fits, fails or cannot tell, and what is missing. Works for any options with attributes, not only products. Calls `POST /decide`; needs `PULSE_API_KEY` |

The three docs tools take a `lang` of `en` or `vi`.

```json
{
  "mcpServers": {
    "pulse": {
      "command": "npx",
      "args": ["-y", "@thepulseapi/mcp"],
      "env": { "PULSE_API_KEY": "pk_live_..." }
    }
  }
}
```

## Use it well

Tell the agent: *"Before recommending an option, call resolve_products, and never state an
attribute it marked unknown."* Generate presentation from verified evidence; never generate an
unverified fact.

## Notes

It runs on your machine and fetches the published index at startup, so it is current without a
republish. The docs tools send nothing about your prompts to us; `resolve_products` sends its own
input to the PULSE API, and only once a key is set. Set `PULSE_DOCS_ORIGIN` to read from a
different origin while working on the documentation itself.

Search is lexical rather than semantic on purpose: the caller is a language model that can read
three candidate sections and judge, and an agent asking about `/catalog/audit` wants the page
with that exact string.

MIT.
