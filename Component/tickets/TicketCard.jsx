import React from "react";
import Badge from "../ui/Badge";
import "./TicketCard.css";

const getRequestType = (t) => t?.requestType ?? t?.request_type ?? "—";
const getPriority = (t) => t?.priority ?? "—";
const getStatus = (t) => t?.status ?? "—";

/** Relative time: "Just now", "5m ago", "2 days ago", or "in 2 days" for future. */
function formatRelative(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);
  const future = diffMs > 0;
  const abs = (n) => (n < 0 ? -n : n);

  if (abs(diffSec) < 60) return future ? "Soon" : "Just now";
  if (abs(diffMin) < 60) return future ? `in ${diffMin}m` : `${abs(diffMin)}m ago`;
  if (abs(diffHr) < 24) return future ? `in ${diffHr}h` : `${abs(diffHr)}h ago`;
  if (abs(diffDay) < 7) return future ? `in ${diffDay}d` : `${abs(diffDay)}d ago`;
  if (abs(diffDay) < 30) return future ? `in ${Math.round(abs(diffDay) / 7)}w` : `${Math.round(abs(diffDay) / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

const TicketCard = ({
  ticket,
  titleLabel = "",
  showDescription = false,
  descriptionMaxLength = 120,
  statusSelectValue,
  statusOptions = [],
  onStatusChange,
  actions,
  children,
}) => {
  const id = ticket?.id;
  const title = ticket?.title ?? "Untitled";
  const status = getStatus(ticket);
  const priority = getPriority(ticket);
  const requestType = getRequestType(ticket);
  const assignedTo = ticket?.assignedTo?.name ?? "—";
  const createdRelative = formatRelative(ticket?.createdAt);
  const dueRelative = formatRelative(ticket?.dueDate);
  const createdFull = ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
  const dueFull = ticket?.dueDate ? new Date(ticket.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
  const description = ticket?.description
    ? ticket.description.length > descriptionMaxLength
      ? ticket.description.slice(0, descriptionMaxLength) + "..."
      : ticket.description
    : "No description";

  return (
    <div className="ticket-card" data-ticket-id={id}>
      <div className="ticket-card__inner">
        <div className="ticket-card__header">
          <span className="ticket-card__id">#{id}</span>
          <div className="ticket-card__chips">
            <Badge variant="status" value={status}>
              {status}
            </Badge>
            <Badge variant="priority" value={priority}>
              {priority}
            </Badge>
            <span className="ticket-card__chip">{requestType}</span>
          </div>
        </div>

        <h3 className="ticket-card__title">
          {titleLabel ? <span className="ticket-card__title-label">{titleLabel} </span> : null}
          {title}
        </h3>

        {showDescription && (
          <p className="ticket-card__description">{description}</p>
        )}

        <div className="ticket-card__meta">
          <span className="ticket-card__meta-item">
            <span className="ticket-card__meta-key">Assigned to</span>
            <span className="ticket-card__meta-value">{assignedTo}</span>
          </span>
        </div>

        <div className="ticket-card__dates">
          <span className="ticket-card__date" title={createdFull}>
            <span className="ticket-card__meta-key">Created</span>
            <span className="ticket-card__date-value">{createdRelative}</span>
          </span>
          <span className="ticket-card__date" title={dueFull}>
            <span className="ticket-card__meta-key">Due</span>
            <span className="ticket-card__date-value">{dueRelative}</span>
          </span>
        </div>

        {(onStatusChange && statusOptions?.length > 0) || actions || children ? (
          <div className="ticket-card__footer">
            {onStatusChange && statusOptions.length > 0 && (
              <select
                className="ticket-card__status-select"
                value={statusSelectValue ?? status}
                onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
            {actions ? <div className="ticket-card__actions">{actions}</div> : null}
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TicketCard;
