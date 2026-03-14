import { useState } from 'react';
import { AgentApproval, type ApprovalStatus, type JsonObject } from 'agent-approval-card';
import 'agent-approval-card/styles.css';

const INITIAL_ARGUMENTS: JsonObject = {
  orderId: 'ord_9182',
  refundAmount: 85,
  notifyCustomer: true
};

export default function App() {
  const [status, setStatus] = useState<ApprovalStatus>('idle');
  const [args, setArgs] = useState<JsonObject>(INITIAL_ARGUMENTS);

  return (
    <main className="example-shell">
      <div className="example-shell__intro">
        <p>Drop-in human approval for irreversible agent actions.</p>
        <h1>AgentApproval</h1>
      </div>
      <AgentApproval
        action={{
          title: 'Refund order and notify customer',
          description: 'The agent wants to issue a refund through the payment provider.',
          rationale:
            'Support confirmed the shipment was lost. A refund is the fastest path to resolution.',
          riskLevel: 'high',
          agentName: 'Support Agent',
          requiresReason: true
        }}
        arguments={args}
        editable
        status={status}
        onApprove={async (nextArgs) => {
          setStatus('approving');
          await new Promise((resolve) => setTimeout(resolve, 800));
          setArgs(nextArgs);
          setStatus('approved');
        }}
        onReject={async () => {
          setStatus('rejecting');
          await new Promise((resolve) => setTimeout(resolve, 500));
          setStatus('rejected');
        }}
        onEdit={async (nextArgs) => {
          setArgs(nextArgs);
          setStatus('idle');
        }}
      />
    </main>
  );
}
