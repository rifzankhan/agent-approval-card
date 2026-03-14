# Agent Approval Card

A React component for human-in-the-loop approval flows in AI apps.

`AgentApproval` is built for the frontend gap most agent frameworks leave behind: the moment when an agent wants to do something risky, expensive, or irreversible, and a human needs to review it before it happens.

It gives you a clean approval UI without forcing a queue system, backend protocol, or orchestration model.

## Why this exists

Most agent frameworks help with backend pause-and-resume logic. Very few give you a reusable approval interface that is good enough to drop into a real product.

This package focuses on that missing layer:

- explain what the agent wants to do
- show the exact parameters it plans to use
- let a human approve, reject, or edit those parameters
- surface risk clearly for destructive actions

## What you get

- A polished `<AgentApproval />` React component
- Controlled async workflow owned by the host app
- Explicit rationale support so the card can explain intent
- Risk-level styling for sensitive actions
- Inline JSON-object editing for v1 parameter review
- Bundled CSS with theme variables
- TypeScript-first API

## What it intentionally does not do

This package is only the UI layer.

- It does not pause or resume agents
- It does not manage approval queues
- It does not persist decisions
- It does not enforce audit logging
- It does not define a transport contract between frontend and backend

The host application owns execution, persistence, security checks, retries, and irreversible-action safeguards.

## Good fit for

- agent dashboards
- internal ops tools
- approval steps before payments, emails, deletions, or external API calls
- LangGraph, CopilotKit, custom tool-calling agents, or any app with a pending-action review step

## Install

```bash
pnpm add agent-approval-card
pnpm add react react-dom
```

## Quick Start

```tsx
import { useState } from 'react';
import {
  AgentApproval,
  type ApprovalStatus,
  type JsonObject
} from 'agent-approval-card';
import 'agent-approval-card/styles.css';

const initialArgs: JsonObject = {
  customerId: 'cus_4821',
  refundAmount: 199,
  notifyCustomer: true
};

export function RefundApprovalCard() {
  const [status, setStatus] = useState<ApprovalStatus>('idle');
  const [args, setArgs] = useState<JsonObject>(initialArgs);

  return (
    <AgentApproval
      action={{
        title: 'Refund order and notify customer',
        description: 'The agent wants to issue a refund through the payment provider.',
        rationale: 'Support confirmed the shipment was lost and the refund is approved.',
        riskLevel: 'high',
        agentName: 'Support Agent',
        requiresReason: true
      }}
      arguments={args}
      editable
      status={status}
      onApprove={async (nextArgs) => {
        setStatus('approving');
        await submitApproval(nextArgs);
        setArgs(nextArgs);
        setStatus('approved');
      }}
      onReject={async (reason) => {
        setStatus('rejecting');
        await submitRejection(reason);
        setStatus('rejected');
      }}
      onEdit={async (nextArgs) => {
        setArgs(nextArgs);
        setStatus('idle');
      }}
    />
  );
}

async function submitApproval(args: JsonObject) {
  console.log('approved', args);
}

async function submitRejection(reason?: string) {
  console.log('rejected', reason);
}
```

## Design Rules

The v1 API is intentionally strict:

- the host owns approval state and all async side effects
- the component owns only temporary UI draft state while editing
- parameters are treated as a JSON object, not a schema-driven form system
- `onEdit` fires only when the user explicitly applies changes
- `onApprove` receives the latest applied argument object

That keeps the component easy to adopt and avoids locking the library into a backend-specific workflow too early.

## API Overview

### `AgentApproval`

Core props:

- `action: AgentAction`
- `arguments: JsonObject`
- `status: ApprovalStatus`
- `editable?: boolean`
- `className?: string`
- `theme?: 'light' | 'dark' | 'system'`
- `labels?: Partial<AgentApprovalLabels>`
- `renderArgumentValue?: (key: string, value: JsonValue) => ReactNode`
- `onApprove: (args: JsonObject) => void | Promise<void>`
- `onReject: (reason?: string) => void | Promise<void>`
- `onEdit?: (nextArgs: JsonObject) => void | Promise<void>`

### `AgentAction`

- `title: string`
- `description?: string`
- `rationale?: string`
- `riskLevel?: 'low' | 'medium' | 'high' | 'destructive'`
- `agentName?: string`
- `requiresReason?: boolean`

### `ApprovalStatus`

```ts
'idle' | 'approving' | 'rejecting' | 'editing' | 'error' | 'approved' | 'rejected'
```

## Styling

Import the bundled stylesheet once:

```ts
import 'agent-approval-card/styles.css';
```

The component uses CSS custom properties so you can change the visual language without rewriting its structure:

```css
:root {
  --agent-approval-primary: #0f766e;
  --agent-approval-primary-hover: #115e59;
  --agent-approval-radius: 20px;
}
```

## Local Development

```bash
pnpm install
pnpm storybook
```

Useful commands:

```bash
pnpm example
pnpm test
pnpm typecheck
pnpm build
pnpm pack:check
```

## Repo Status

This is a tightly scoped early version. The current goal is to make the approval card solid and reusable before expanding into headless state, queue primitives, or framework-specific adapters.

## Contributing

Contributions are welcome, especially around:

- UX polish for risky/destructive actions
- accessibility improvements
- better parameter-editing ergonomics
- docs and real-world examples

See [CONTRIBUTING.md](./CONTRIBUTING.md).
