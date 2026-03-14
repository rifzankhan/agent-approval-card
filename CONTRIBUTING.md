# Contributing

Thanks for contributing to Agent Approval Card.

## Development

Install dependencies:

```bash
pnpm install
```

Useful commands:

```bash
pnpm storybook
pnpm example
pnpm test
pnpm typecheck
pnpm build
```

## Project expectations

- keep the component stateless with respect to workflow and backend orchestration
- avoid coupling the library to a specific agent framework
- preserve the v1 contract unless there is a strong compatibility reason to change it
- prefer small, focused changes over broad redesigns

## Pull requests

Good PRs usually include:

- a clear problem statement
- screenshots or Storybook changes for UI updates
- tests for behavior changes
- notes about API or styling impact

## Scope

The project is intentionally narrow.

In scope:

- approval-card UX
- accessibility
- parameter review and editing
- theming and documentation

Out of scope for now:

- backend pause or resume logic
- approval queues
- persistence or audit systems
- framework-specific adapters unless they stay optional
