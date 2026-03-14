# Agent Approval Card

A polished React component for human-in-the-loop approval flows in AI apps.

`AgentApproval` is built for the gap most agent frameworks leave to the frontend: showing a proposed action, its parameters, and a clear approval decision without forcing you into a backend protocol or queue implementation.

## What it does

- Renders an approval card for an agent-proposed action
- Explains the action with title, description, and explicit rationale
- Highlights risk level for sensitive or irreversible operations
- Supports `Approve`, `Reject`, and inline `Edit Parameters`
- Keeps workflow state controlled by the host app
- Ships with default CSS and theme variables

## What it does not do

This package is intentionally scoped to the UI layer.

- It does not pause or resume agents
- It does not manage approval queues
- It does not persist decisions or audit logs
- It does not define a backend transport contract

The host app owns async state, side effects, security checks, and irreversible-action enforcement.

## Install

```bash
pnpm add agent-approval-card
```

You also need compatible React peer dependencies:

```bash
pnpm add react react-dom
```

## Usage

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

## API

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

## Editing behavior

Parameter editing is intentionally generic in v1:

- The component treats `arguments` as a JSON object
- Edit mode uses a temporary local draft inside the component
- `onEdit` fires only when the user explicitly applies the edited object
- `onApprove` receives the latest applied parameter object

This keeps the API stable without locking the library into a schema-driven form system too early.

## Styling

Import the bundled stylesheet once:

```ts
import 'agent-approval-card/styles.css';
```

The default theme is driven by CSS custom properties, so you can override the visual system without rewriting the component:

```css
:root {
  --agent-approval-primary: #0f766e;
  --agent-approval-primary-hover: #115e59;
  --agent-approval-radius: 20px;
}
```

## Local development

```bash
pnpm install
pnpm storybook
```

Other useful commands:

```bash
pnpm example
pnpm test
pnpm typecheck
pnpm build
pnpm pack:check
```

## Publishing checklist

Before publishing publicly, confirm:

- the npm package name is available
- `package.json` has your final repository metadata
- Storybook and the example app reflect your preferred branding
- the generated `dist/` contents are what you want to ship

## License

MIT
