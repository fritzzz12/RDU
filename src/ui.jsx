import React, { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, ChevronLeft, X } from "lucide-react";

export const pageLabels = {
  Overview: "Home",
  "Pending actions": "Things to do",
  Notifications: "Messages",
  "Research projects": "Research projects",
  "Document submissions": "Submitted documents",
  "Review & approvals": "Review documents",
  "Research archive": "Completed research",
  "Faculty profiles": "Faculty members",
  "Reports & analytics": "Reports",
  "News & announcements": "News and opportunities",
  "Research assistant": "Research help",
  "User management": "Manage accounts",
  "Roles & permissions": "Access and permissions",
  "Audit history": "Activity history",
  "System settings": "Settings",
};
export const statusLabels = {
  Ongoing: "In progress",
  "Pending Review": "Waiting for review",
  "Needs Revision": "Changes needed",
  Missing: "Not submitted",
  Rejected: "Not accepted",
  Superseded: "Earlier version",
  Pending: "Waiting for approval",
  "Not Applicable": "Not needed",
};
export const statusLabel = (value) => statusLabels[value] || value;
export const phaseDescriptions = [
  "Proposal and initial review",
  "Prepare the study",
  "Carry out and share the research",
];
export const phaseLabel = (name) =>
  name
    ?.replace(/^(I+\.|IV\.)\s*/, "")
    .replace(" PHASE", "")
    .toLowerCase()
    .replace(/^./, (s) => s.toUpperCase());
export function friendlyError(message) {
  if (/already has an ongoing project/.test(message))
    return "This researcher already has a study in progress. Complete that study before adding another one.";
  if (/Program does not belong/.test(message))
    return "Choose an academic program that belongs to the selected department.";
  if (/valid PDF|\.pdf filename/.test(message))
    return "This file could not be accepted. Choose a valid PDF document ending in .pdf, then try again.";
  if (/exceeds.*(MB|maximum)/i.test(message))
    return "This PDF is too large. Choose a PDF smaller than the upload limit shown beside the file field.";
  if (/Feedback must/.test(message))
    return "Explain what needs to be corrected in Review feedback before saving this decision.";
  if (/active demo session|Only active demo accounts/.test(message))
    return "You cannot use this account right now. Ask an administrator to check that it is approved and active, then sign in again.";
  if (/Failed to fetch|NetworkError|Load failed/.test(message))
    return "We could not connect. Check your connection and try again. Your entries are still here.";
  return (
    message ||
    "We could not complete this action. Please check your entries and try again."
  );
}
const nodeText = (node) =>
  React.Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : React.isValidElement(child)
          ? nodeText(child.props.children)
          : "",
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
export function RecordTable({ children, label = "Records" }) {
  const sections = React.Children.toArray(children);
  const head = sections.find((s) => s.type === "thead");
  const headingRow = React.Children.toArray(head?.props.children).find(
    (s) => s.type === "tr",
  );
  const labels = React.Children.toArray(headingRow?.props.children).map(
    (c) => nodeText(c.props.children) || "Action",
  );
  return (
    <table aria-label={label}>
      {sections.map((section, index) => {
        if (!React.isValidElement(section)) return section;
        return React.cloneElement(
          section,
          { key: section.key || index },
          React.Children.map(section.props.children, (row) => {
            if (!React.isValidElement(row) || row.type !== "tr") return row;
            return React.cloneElement(
              row,
              {},
              React.Children.toArray(row.props.children).map((cell, i) =>
                React.isValidElement(cell)
                  ? React.cloneElement(cell, {
                      key: cell.key || i,
                      ...(cell.type === "th"
                        ? { scope: "col" }
                        : { "data-label": labels[i] || "Action" }),
                    })
                  : cell,
              ),
            );
          }),
        );
      })}
    </table>
  );
}
function summarize(form) {
  return Array.from(form.elements)
    .filter(
      (el) =>
        el.name &&
        !el.disabled &&
        !["submit", "button", "hidden"].includes(el.type),
    )
    .map((el) => {
      const label =
        el.labels?.[0]?.textContent
          ?.replace(/\((Required|Optional)\)/g, "")
          .trim() || el.name;
      const value =
        el.type === "file"
          ? Array.from(el.files || [])
              .map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`)
              .join(", ")
          : el.tagName === "SELECT"
            ? el.selectedOptions?.[0]?.textContent
            : el.value;
      return { label, value: value || "Not provided" };
    });
}
export function SafeForm({
  children,
  onSubmit,
  context,
  busy = false,
  confirmLabel = "Confirm and save",
  note = "Check the details below. Nothing is saved until you confirm.",
  validate,
  ...props
}) {
  const formRef = useRef(null),
    reviewRef = useRef(null),
    [review, setReview] = useState(false),
    [summary, setSummary] = useState([]),
    [localError, setLocalError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    if (review) reviewRef.current?.focus();
  }, [review]);
  function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const issue = validate?.(new FormData(form));
    if (issue) {
      setLocalError(issue);
      return;
    }
    setLocalError("");
    setSummary(summarize(form));
    setReview(true);
  }
  async function confirm() {
    if (saving || busy) return;
    setSaving(true);
    try {
      await onSubmit({ preventDefault() {}, currentTarget: formRef.current });
    } catch (e) {
      setLocalError(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      {...props}
      ref={formRef}
      className={"confirmation-form " + (props.className || "")}
      onSubmit={submit}
      onChange={(e) => {
        e.currentTarget.dataset.dirty = "true";
        setLocalError("");
        props.onChange?.(e);
      }}
    >
      <p className="form-progress">
        {review
          ? "Step 2 of 2 — Check and confirm"
          : "Step 1 of 2 — Enter the details"}
      </p>
      {localError && (
        <div className="error-message" role="alert">
          <AlertCircle size={20} />
          {localError}
        </div>
      )}
      <div className="form-fields" hidden={review}>
        {children}
      </div>
      <section
        className="form-review"
        hidden={!review}
        aria-label="Check before saving"
      >
        <h3 ref={reviewRef} tabIndex={-1}>
          Check before saving
        </h3>
        {context && <p className="review-context">{context}</p>}
        <p className="review-note">{note}</p>
        <dl>
          {summary.map(({ label, value }, i) => (
            <React.Fragment key={i}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </React.Fragment>
          ))}
        </dl>
        <div className="review-actions">
          <button
            type="button"
            className="button secondary"
            disabled={busy || saving}
            onClick={() => {
              setReview(false);
              requestAnimationFrame(() =>
                formRef.current
                  ?.querySelector(
                    ".form-fields input,.form-fields select,.form-fields textarea",
                  )
                  ?.focus(),
              );
            }}
          >
            <ChevronLeft size={18} />
            Go back and edit
          </button>
          <button
            type="button"
            className="button"
            disabled={busy || saving}
            onClick={confirm}
          >
            <Check size={18} />
            {busy || saving ? "Saving. Please wait…" : confirmLabel}
          </button>
        </div>
      </section>
    </form>
  );
}
export function ConfirmForms({
  children,
  busy,
  context,
  confirmLabel,
  note,
  validate,
}) {
  function walk(nodes, inForm = false) {
    const mapped = React.Children.map(nodes, (node) => {
      if (!React.isValidElement(node)) return node;
      if (node.type === "form")
        return (
          <SafeForm
            {...node.props}
            busy={busy}
            context={context}
            confirmLabel={confirmLabel}
            note={note}
            validate={validate}
          >
            {walk(node.props.children, true)}
          </SafeForm>
        );
      if (
        inForm &&
        node.type === "button" &&
        (!node.props.type || node.props.type === "submit")
      )
        return React.cloneElement(
          node,
          { type: "submit" },
          "Review before saving",
          <ArrowRight size={18} />,
        );
      return node.props.children
        ? React.cloneElement(node, {}, walk(node.props.children, inForm))
        : node;
    });
    return Array.isArray(nodes) ? mapped : (mapped?.[0] ?? null);
  }
  return walk(children);
}
const focusable = (element) =>
  Array.from(
    element.querySelectorAll(
      'a[href],button,input,select,textarea,iframe,[tabindex="0"]',
    ),
  ).filter(
    (e) =>
      !e.disabled &&
      !e.closest("[hidden],[inert]") &&
      e.getClientRects().length,
  );
export function ModalFrame({
  title,
  children,
  onClose,
  error,
  busy,
  wide = false,
}) {
  const ref = useRef(null),
    id = useId(),
    [discard, setDiscard] = useState(false);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.querySelector(".modal-header button")?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
      else document.querySelector("main h1")?.focus();
    };
  }, []);
  useEffect(() => {
    if (discard) ref.current?.querySelector(".discard-prompt button")?.focus();
  }, [discard]);
  function close() {
    if (busy) return;
    if (ref.current?.querySelector('form[data-dirty="true"]')) setDiscard(true);
    else onClose();
  }
  function keydown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      if (discard) setDiscard(false);
      else close();
    }
    if (e.key === "Tab") {
      const nodes = focusable(ref.current),
        first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={ref}
        className={"modal " + (wide ? "wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        onKeyDown={keydown}
      >
        <div className="modal-header">
          <h2 id={id}>{title}</h2>
          <button
            className="button secondary"
            type="button"
            disabled={busy}
            onClick={close}
          >
            <X size={19} />
            Close
          </button>
        </div>
        {discard && (
          <div className="discard-prompt" role="alert">
            <h3>Leave without saving?</h3>
            <p>
              Your entries have not been saved. You can keep editing or leave
              this form.
            </p>
            <div className="review-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setDiscard(false)}
              >
                Keep editing
              </button>
              <button type="button" className="button danger" onClick={onClose}>
                Leave without saving
              </button>
            </div>
          </div>
        )}
        {error && (
          <div className="error-message modal-error" role="alert">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        <div className="modal-body" inert={discard}>
          {children}
        </div>
      </section>
    </div>
  );
}
