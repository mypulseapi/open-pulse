# PULSE for AI agents

Give an agent the PULSE MCP server and it can do two things it otherwise guesses at: read the
current PULSE documentation, and ask which products actually meet a shopper's requirements.

## Connect it

[`mcp.json`](mcp.json) is the whole configuration. Where it goes:

| Client | File |
| --- | --- |
| Claude Code | `.mcp.json` in your project, or `claude mcp add pulse -- npx -y @thepulseapi/mcp` |
| Claude Desktop | `claude_desktop_config.json` |
| Cursor | `.cursor/mcp.json` |
| Codex CLI and other stdio MCP clients | their MCP server list, same command and args |

The server runs on your machine over stdio. ChatGPT's web app connects only to remote MCP servers,
which this is not yet.

Leave out `PULSE_API_KEY` and the documentation tools still work; only `resolve_products` needs it.

## The tools

| Tool | Needs a key | What it returns |
| --- | --- | --- |
| `search_docs` | no | Matching sections of the PULSE docs, with URLs |
| `get_page` | no | One docs page as Markdown |
| `list_pages` | no | Every page and its title |
| `resolve_products` | yes | Per product and requirement: meets, fails, or cannot tell, and what is missing |

## How an agent should use `resolve_products`

1. Turn the shopper's request into `requirements` (`ram >= 16`) and pass their words as `query`,
   which picks up a budget on its own.
2. Pass every candidate with the fields and text you have: `title`, `description`, `price`,
   `attributes`.
3. Answer from the verdicts:
   - `fits`: recommend it, citing the values in `requirements`.
   - `fails`: say which requirement it fails.
   - `cannot_tell`: **say the listing does not state** the attributes in `missing`. Do not guess
     them and do not drop the product silently.

A system prompt line that works: *"Before recommending a product, call resolve_products. Never
state a product attribute that resolve_products marked unknown."*

## Example conversation

> **Shopper:** Which of these laptops has 16GB of RAM and costs under $1,500?
>
> **Agent** calls `resolve_products` with `query: "under $1,500"`,
> `requirements: [{ attribute: "ram", op: "gte", value: 16 }]` and the three listings, then answers:
>
> The ASUS Vivobook 14 fits: 16GB RAM and $1,200. The Dell XPS 15 has 32GB but costs $1,700, over
> your budget. The Lenovo IdeaPad Slim 5 is within budget, but its listing does not state the RAM,
> so I cannot tell whether it fits.

The same request over HTTP, without MCP, is [`../decide.mjs`](../decide.mjs).
