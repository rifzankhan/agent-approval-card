import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AgentApproval } from '../src/AgentApproval';
import type { ApprovalStatus, JsonObject } from '../src/types';
import '../src/styles.css';

const meta = {
  title: 'Components/AgentApproval',
  component: AgentApproval,
  args: {
    action: {
      title: 'Send renewal email',
      description: 'The agent wants to notify the customer about an expiring subscription.',
      rationale: 'The account expires in 48 hours and the user has not responded to prior reminders.',
      riskLevel: 'medium',
      agentName: 'Retention Agent'
    },
    arguments: {
      customerId: 'cus_4821',
      templateId: 'renewal-reminder-v3',
      sendAt: '2026-03-14T15:30:00Z'
    },
    status: 'idle',
    editable: true,
    onApprove: async () => undefined,
    onReject: async () => undefined,
    onEdit: async () => undefined
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof AgentApproval>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    action: {
      title: 'Delete invoice and refund payment',
      description: 'This cannot be reversed once the transaction clears.',
      rationale: 'The invoice was generated in error and support confirmed the refund request.',
      riskLevel: 'destructive',
      agentName: 'Finance Agent',
      requiresReason: true
    },
    arguments: {
      invoiceId: 'inv_103',
      refundAmount: 199,
      currency: 'USD'
    }
  }
};

export const Approving: Story = {
  args: {
    status: 'approving',
    action: {
      title: 'Refund order and notify customer',
      description: 'The agent wants to issue a refund through the payment provider.',
      rationale: 'Support confirmed the shipment was lost and the refund is approved.',
      riskLevel: 'high',
      agentName: 'Support Agent'
    },
    arguments: {
      customerId: 'cus_4821',
      refundAmount: 199,
      notifyCustomer: true
    }
  }
};

export const Rejecting: Story = {
  args: {
    ...Approving.args,
    status: 'rejecting'
  }
};

export const LongPayload: Story = {
  args: {
    action: {
      title: 'Sync CRM contact',
      description: 'The agent wants to update several contact fields in the CRM.',
      rationale: 'A recent support conversation produced new contact metadata that should be reflected downstream.',
      riskLevel: 'low',
      agentName: 'Ops Agent'
    },
    arguments: {
      customerId: 'cus_9221',
      contact: {
        email: 'jane@example.com',
        phone: '+1-555-0100',
        preferences: {
          marketing: false,
          productUpdates: true
        }
      },
      tags: ['vip', 'renewal-q2']
    }
  }
};

export const Editing: Story = {
  args: {
    status: 'editing'
  }
};

export const Approved: Story = {
  args: {
    status: 'approved'
  }
};

export const InteractiveDemo: Story = {
  args: {
    action: {
      title: 'Delete invoice and refund payment',
      description: 'This cannot be reversed once the transaction clears.',
      rationale: 'The invoice was generated in error and support confirmed the refund request.',
      riskLevel: 'destructive',
      agentName: 'Finance Agent',
      requiresReason: true
    },
    arguments: {
      invoiceId: 'inv_103',
      refundAmount: 199,
      currency: 'USD'
    },
    status: 'idle',
    editable: true
  },
  render: (args) => {
    const [status, setStatus] = useState<ApprovalStatus>('idle');
    const [currentArgs, setCurrentArgs] = useState<JsonObject>(args.arguments);

    return (
      <AgentApproval
        {...args}
        arguments={currentArgs}
        status={status}
        onApprove={async (nextArgs) => {
          setCurrentArgs(nextArgs);
          setStatus('approving');
          await new Promise((resolve) => setTimeout(resolve, 1200));
          setStatus('approved');
        }}
        onReject={async () => {
          setStatus('rejecting');
          await new Promise((resolve) => setTimeout(resolve, 900));
          setStatus('rejected');
        }}
        onEdit={async (nextArgs) => {
          setCurrentArgs(nextArgs);
          setStatus('idle');
        }}
      />
    );
  }
};
