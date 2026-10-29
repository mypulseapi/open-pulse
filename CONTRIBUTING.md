# Contributing

Thank you for helping. A few rules keep this easy for everyone.

## Before you start

1. **Open an issue first** for anything larger than a typo: a bug, a language the SDK or parser
   misreads, an adapter you need. Agreeing on the change before the code saves your time.
2. **Keep pull requests small**, one change each, with a test or a reproduction.

## Branches and pull requests

- Open pull requests against **`develop`**, the default branch. `main` holds what has been
  released and only takes pull requests from `develop`.
- A pull request into `develop` needs CI to pass on Node 20 and 22, the CLA box ticked, and a
  review from a maintainer. Pull requests are squashed when merged.
- Pull requests from forks run CI after a maintainer approves the run, so expect a short wait.
- Packages are published to npm only from `main`.

## The Contributor License Agreement

Contributions are accepted under the [PULSE Contributor License Agreement](CLA.md). It lets Resolve
Labs use your contribution in this MIT-licensed project and in its commercial service, while you
keep the copyright. Agree to it by ticking the box in the pull request template; we cannot
merge a pull request without it. Maintainers of the repository do not need to.

## Development

```bash
npm install
npm run ci
```

Node 20 or later. Each package has its own README.

## Style

- TypeScript, strict. No new runtime dependency in the SDK: it ships to every storefront.
- Explain why in comments, not what.
- No secrets, keys or customer data anywhere, including tests and examples.

## Reporting a security issue

Do not open a public issue. Report it privately through
[a security advisory](https://github.com/mypulseapi/open-pulse/security/advisories/new), as
described in [SECURITY.md](SECURITY.md).

## Code of conduct

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).
