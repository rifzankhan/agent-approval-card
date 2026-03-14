import type { ReactNode } from 'react';

export type ApprovalStatus =
  | 'idle'
  | 'approving'
  | 'rejecting'
  | 'editing'
  | 'error'
  | 'approved'
  | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high' | 'destructive';

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}

export interface AgentAction {
  title: string;
  description?: string;
  rationale?: string;
  riskLevel?: RiskLevel;
  agentName?: string;
  requiresReason?: boolean;
}

export interface AgentApprovalLabels {
  approve: string;
  reject: string;
  edit: string;
  saveEdit: string;
  cancelEdit: string;
  parameters: string;
  rationale: string;
  rejectionReason: string;
  invalidJson: string;
  statusApproved: string;
  statusRejected: string;
  statusError: string;
}

export interface AgentApprovalProps {
  action: AgentAction;
  arguments: JsonObject;
  status: ApprovalStatus;
  editable?: boolean;
  className?: string;
  theme?: 'light' | 'dark' | 'system';
  labels?: Partial<AgentApprovalLabels>;
  renderArgumentValue?: (key: string, value: JsonValue) => ReactNode;
  onApprove: (args: JsonObject) => void | Promise<void>;
  onReject: (reason?: string) => void | Promise<void>;
  onEdit?: (nextArgs: JsonObject) => void | Promise<void>;
}
