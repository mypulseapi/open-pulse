# Jev and Open Pulse

Both give AI agents and software a decision instead of a paragraph. They answer different
questions, and they work well together. This page is factual: Jev is described from TypeSafe AI's
own announcement, [*Introducing System One Models and Jev*](https://typesafe.ai/blog/introducing-system-one-models-and-jev),
and Open Pulse from this repository and the [PULSE API](https://developer.thepulseapi.com/api).
Jev is a trademark of TypeSafe AI; this project is not affiliated with it.

## In one line each

- **Jev:** *"a frontier-intelligence function call: unstructured state in, typed probabilistic
  decisions out."* (TypeSafe AI)
- **Open Pulse:** requirements and evidence in, a verdict per option out: **fits, fails or cannot
  tell, with what is missing.**

## Side by side

| | Jev | Open Pulse |
| --- | --- | --- |
| **What it is** | A model class trained for automated decisions | A decision call over declared requirements and the evidence each option carries |
| **Input** | Unstructured state, such as JSON, text and context | Requirements (`ram >= 16`, `ip_rating = IP67`), options with their fields and text, an optional plain-language request |
| **Output** | Typed answers with calibrated probabilities | A verdict per option and requirement: meets, fails or unknown, with the value and its source |
| **When the information is not there** | A probability, with confidence reported | An explicit `cannot_tell` and the list of missing attributes |
| **What it is grounded in** | The model's judgement, calibrated against strong reference models, per the announcement | Only what the option's own evidence states; a stated field beats text read off the page |
| **How it decides** | A trained model, sampled in parallel | Deterministic rules over the evidence, so the same input always gives the same answer |
| **Learns from outcomes** | Not described | In commerce, PULSE's Promotion Audit and return-aware ranking are measured against the merchant's own orders and returns |
| **Domains** | General | Any domain whose options have attributes: products, suppliers, hotels, plans |
| **For AI agents** | An API | An MCP server (`@thepulseapi/mcp`) and an HTTP API |
| **Open source** | The model is closed; an unofficial community reconstruction exists ([open-jev](https://github.com/kyegomez/open-jev), Apache 2.0, untrained) | Client code MIT here; the decision engine runs behind the PULSE API |
| **Access** | Early access, per the announcement | API key from the PULSE dashboard |

## Choose by the question

| The question you have | Better fit |
| --- | --- |
| "Read this ticket, email or record and classify, route or score it" | **Jev** |
| "From this messy state, what should the software do next, and how sure is it?" | **Jev** |
| "Which of these options meet these requirements, and which can't the evidence settle?" | **Open Pulse** |
| "An agent must not state a fact the source never stated" | **Open Pulse** |
| "What should the owner publish so the next answer is decidable?" | **Open Pulse** (`missing`) |

## Using both

They compose. A model like Jev can turn a request in plain words into typed requirements; Open
Pulse then checks those requirements against each option's evidence and refuses to guess where the
evidence is silent.

```text
"a waterproof 24V sensor I can get within two weeks"
        │
        ▼  a typed-decision model reads the request
requirements: ip_rating = IP67, voltage = 24V, lead_time_days <= 14
        │
        ▼  POST /decide with the candidate suppliers
acme fits · borealis fails · corvid fails, missing ip_rating
```

## What we do not claim

We have not benchmarked Open Pulse against Jev, and this page makes no claim that one is faster,
cheaper or more accurate than the other. Where the two overlap, try both on your own data.
