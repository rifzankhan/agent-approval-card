import { useEffect, useId, useRef, useState } from 'react';
import type {
  AgentApprovalLabels,
  AgentApprovalProps,
  JsonObject,
  JsonValue,
  RiskLevel
} from './types';

const DEFAULT_LABELS: AgentApprovalLabels = {
  approve: 'Approve',
  reject: 'Reject',
  edit: 'Edit Parameters',
  saveEdit: 'Apply Changes',
  cancelEdit: 'Cancel',
  parameters: 'Parameters',
  rationale: 'Why the agent wants this',
  rejectionReason: 'Reason for rejection',
  invalidJson: 'Parameters must be valid JSON objects.',
  statusApproved: 'Approved',
  statusRejected: 'Rejected',
  statusError: 'Action failed'
};

const RISK_COPY: Record<RiskLevel, string> = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
  destructive: 'Destructive'
};

const STATUS_COPY = {
  approved: 'Approved',
  rejected: 'Rejected',
  error: 'Error'
} as const;

function joinClassNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function formatValue(value: JsonValue): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function prettyPrintArgs(args: JsonObject): string {
  return JSON.stringify(args, null, 2);
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function AgentApproval({
  action,
  arguments: initialArguments,
  status,
  editable = false,
  className,
  theme = 'system',
  labels,
  renderArgumentValue,
  onApprove,
  onReject,
  onEdit
}: AgentApprovalProps) {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const [isEditing, setIsEditing] = useState(status === 'editing');
  const [draftArguments, setDraftArguments] = useState<JsonObject>(initialArguments);
  const [editorValue, setEditorValue] = useState(prettyPrintArgs(initialArguments));
  const [editorError, setEditorError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const editorId = useId();
  const reasonId = useId();
  const lastPropArguments = useRef(initialArguments);

  useEffect(() => {
    if (lastPropArguments.current !== initialArguments && !isEditing) {
      setDraftArguments(initialArguments);
      setEditorValue(prettyPrintArgs(initialArguments));
      setEditorError(null);
      lastPropArguments.current = initialArguments;
    }
  }, [initialArguments, isEditing]);

  useEffect(() => {
    if (status === 'editing') {
      setIsEditing(true);
      return;
    }

    if (status === 'idle' || status === 'approved' || status === 'rejected') {
      setIsEditing(false);
    }
  }, [status]);

  const riskLevel = action.riskLevel ?? 'medium';
  const busy = status === 'approving' || status === 'rejecting';
  const disableActions = busy || status === 'approved' || status === 'rejected';

  const handleApprove = async () => {
    if (disableActions || editorError) {
      return;
    }

    await onApprove(draftArguments);
  };

  const handleReject = async () => {
    if (disableActions) {
      return;
    }

    const reason = rejectionReason.trim();
    await onReject(reason.length > 0 ? reason : undefined);
  };

  const handleStartEdit = () => {
    if (!editable || disableActions) {
      return;
    }

    setEditorValue(prettyPrintArgs(draftArguments));
    setEditorError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditorValue(prettyPrintArgs(draftArguments));
    setEditorError(null);
    setIsEditing(false);
  };

  const handleApplyEdit = async () => {
    try {
      const parsed = JSON.parse(editorValue) as JsonValue;

      if (!isJsonObject(parsed)) {
        setEditorError(mergedLabels.invalidJson);
        return;
      }

      setDraftArguments(parsed);
      setEditorError(null);
      setIsEditing(false);
      await onEdit?.(parsed);
    } catch {
      setEditorError(mergedLabels.invalidJson);
    }
  };

  return (
    <section
      className={joinClassNames(
        'agent-approval-card',
        `agent-approval-card--${riskLevel}`,
        `agent-approval-card--theme-${theme}`,
        className
      )}
      aria-live="polite"
      data-status={status}
    >
      <header className="agent-approval-card__header">
        <div>
          <p className="agent-approval-card__eyebrow">
            {action.agentName ? `${action.agentName} requests approval` : 'Agent approval requested'}
          </p>
          <h2 className="agent-approval-card__title">{action.title}</h2>
          {action.description ? (
            <p className="agent-approval-card__description">{action.description}</p>
          ) : null}
        </div>
        <div className="agent-approval-card__badges">
          <span className="agent-approval-card__badge agent-approval-card__badge--risk">
            {RISK_COPY[riskLevel]}
          </span>
          {status in STATUS_COPY ? (
            <span className="agent-approval-card__badge agent-approval-card__badge--status">
              {STATUS_COPY[status as keyof typeof STATUS_COPY]}
            </span>
          ) : null}
        </div>
      </header>

      {action.rationale ? (
        <div className="agent-approval-card__section">
          <p className="agent-approval-card__section-label">{mergedLabels.rationale}</p>
          <p className="agent-approval-card__rationale">{action.rationale}</p>
        </div>
      ) : null}

      <div className="agent-approval-card__section">
        <div className="agent-approval-card__section-heading">
          <p className="agent-approval-card__section-label">{mergedLabels.parameters}</p>
          {editable && !isEditing ? (
            <button
              type="button"
              className="agent-approval-card__text-button"
              onClick={handleStartEdit}
              disabled={disableActions}
            >
              {mergedLabels.edit}
            </button>
          ) : null}
        </div>

        {isEditing ? (
          <div className="agent-approval-card__editor">
            <label htmlFor={editorId} className="agent-approval-card__sr-only">
              {mergedLabels.parameters}
            </label>
            <textarea
              id={editorId}
              className="agent-approval-card__textarea"
              value={editorValue}
              onChange={(event) => {
                setEditorValue(event.target.value);
                if (editorError) {
                  setEditorError(null);
                }
              }}
              rows={12}
              spellCheck={false}
            />
            {editorError ? <p className="agent-approval-card__error">{editorError}</p> : null}
            <div className="agent-approval-card__editor-actions">
              <button
                type="button"
                className="agent-approval-card__button agent-approval-card__button--secondary"
                onClick={handleCancelEdit}
              >
                {mergedLabels.cancelEdit}
              </button>
              <button
                type="button"
                className="agent-approval-card__button agent-approval-card__button--primary"
                onClick={handleApplyEdit}
              >
                {mergedLabels.saveEdit}
              </button>
            </div>
          </div>
        ) : (
          <dl className="agent-approval-card__arguments">
            {Object.entries(draftArguments).map(([key, value]) => (
              <div key={key} className="agent-approval-card__argument-row">
                <dt>{key}</dt>
                <dd>{renderArgumentValue ? renderArgumentValue(key, value) : formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {action.requiresReason ? (
        <div className="agent-approval-card__section">
          <label htmlFor={reasonId} className="agent-approval-card__section-label">
            {mergedLabels.rejectionReason}
          </label>
          <textarea
            id={reasonId}
            className="agent-approval-card__textarea agent-approval-card__textarea--reason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={3}
            placeholder="Required before rejecting"
          />
        </div>
      ) : null}

      {status === 'error' ? (
        <p className="agent-approval-card__error agent-approval-card__error--status">
          {mergedLabels.statusError}
        </p>
      ) : null}
      {status === 'approved' ? (
        <p className="agent-approval-card__success">{mergedLabels.statusApproved}</p>
      ) : null}
      {status === 'rejected' ? (
        <p className="agent-approval-card__muted">{mergedLabels.statusRejected}</p>
      ) : null}

      <footer className="agent-approval-card__actions">
        <button
          type="button"
          className="agent-approval-card__button agent-approval-card__button--secondary"
          onClick={handleReject}
          disabled={disableActions || (action.requiresReason && rejectionReason.trim().length === 0)}
        >
          {status === 'rejecting' ? 'Rejecting...' : mergedLabels.reject}
        </button>
        <button
          type="button"
          className="agent-approval-card__button agent-approval-card__button--primary"
          onClick={handleApprove}
          disabled={disableActions || isEditing || Boolean(editorError)}
        >
          {status === 'approving' ? 'Approving...' : mergedLabels.approve}
        </button>
      </footer>
    </section>
  );
}
