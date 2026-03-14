import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AgentApproval } from './AgentApproval';
import type { AgentApprovalProps } from './types';

const baseProps: AgentApprovalProps = {
  action: {
    title: 'Delete customer record',
    description: 'This action permanently removes the selected record.',
    rationale: 'The customer requested data deletion after account closure.',
    riskLevel: 'destructive',
    agentName: 'Compliance Agent',
    requiresReason: true
  },
  arguments: {
    recordId: 'cus_123',
    dryRun: false
  },
  editable: true,
  status: 'idle',
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onEdit: vi.fn()
};

describe('AgentApproval', () => {
  it('renders action details and arguments', () => {
    render(<AgentApproval {...baseProps} />);

    expect(screen.getByText('Delete customer record')).toBeInTheDocument();
    expect(screen.getByText('Compliance Agent requests approval')).toBeInTheDocument();
    expect(screen.getByText('The customer requested data deletion after account closure.')).toBeInTheDocument();
    expect(screen.getByText('recordId')).toBeInTheDocument();
    expect(screen.getByText('cus_123')).toBeInTheDocument();
  });

  it('calls onApprove with the latest arguments', () => {
    const onApprove = vi.fn();

    render(<AgentApproval {...baseProps} onApprove={onApprove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(onApprove).toHaveBeenCalledWith({
      recordId: 'cus_123',
      dryRun: false
    });
  });

  it('supports editing parameters and emits onEdit only when applied', () => {
    const onEdit = vi.fn();
    const onApprove = vi.fn();

    render(<AgentApproval {...baseProps} onEdit={onEdit} onApprove={onApprove} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit Parameters' }));
    fireEvent.change(screen.getByLabelText('Parameters'), {
      target: {
        value: JSON.stringify(
          {
            recordId: 'cus_123',
            dryRun: true
          },
          null,
          2
        )
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Changes' }));

    expect(onEdit).toHaveBeenCalledWith({
      recordId: 'cus_123',
      dryRun: true
    });

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(onApprove).toHaveBeenCalledWith({
      recordId: 'cus_123',
      dryRun: true
    });
  });

  it('shows a validation error for invalid JSON', () => {
    render(<AgentApproval {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit Parameters' }));
    fireEvent.change(screen.getByLabelText('Parameters'), {
      target: { value: '{"broken": true' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Changes' }));

    expect(screen.getByText('Parameters must be valid JSON objects.')).toBeInTheDocument();
  });

  it('allows instant rejection even when a reason is requested', () => {
    const onReject = vi.fn();
    render(<AgentApproval {...baseProps} onReject={onReject} />);

    const rejectButton = screen.getByRole('button', { name: 'Reject' });
    expect(rejectButton).toBeEnabled();

    fireEvent.click(rejectButton);
    expect(onReject).toHaveBeenCalledWith(undefined);
  });

  it('sends a rejection reason when provided', () => {
    const onReject = vi.fn();
    render(<AgentApproval {...baseProps} onReject={onReject} />);

    fireEvent.change(screen.getByLabelText('Reason for rejection'), {
      target: { value: 'Needs legal review first.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

    expect(onReject).toHaveBeenCalledWith('Needs legal review first.');
  });

  it('disables actions while busy', () => {
    render(<AgentApproval {...baseProps} status="approving" />);

    expect(screen.getByRole('button', { name: 'Approving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
  });
});
