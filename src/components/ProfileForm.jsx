import React, { useState } from "react";

const STORAGE_KEY = "profileDraft_v1";

export default function ProfileForm() {
  const [draft, setDraft] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : { firstName: "", lastName: "", company: "" };
    } catch {
      return { firstName: "", lastName: "", company: "" };
    }
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  function onChange(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function validate() {
    const e = {};
    if (!draft.firstName.trim()) e.firstName = "First name is required";
    if (!draft.lastName.trim()) e.lastName = "Last name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      company: draft.company?.trim() || undefined,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSaved(true);
    } catch {
      // if storage is blocked or full, keep UX graceful
      alert("Could not save locally. Please check your browser settings.");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Your profile</h1>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Just the basics for now. Address & payments come in later cups ☕
      </p>

      <form onSubmit={onSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="firstName" style={{ display: "block", fontWeight: 600 }}>
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={draft.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
          />
          {errors.firstName && (
            <div id="firstName-error" style={{ color: "#b00020", marginTop: 4 }}>
              {errors.firstName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="lastName" style={{ display: "block", fontWeight: 600 }}>
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={draft.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
          />
          {errors.lastName && (
            <div id="lastName-error" style={{ color: "#b00020", marginTop: 4 }}>
              {errors.lastName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="company" style={{ display: "block", fontWeight: 600 }}>
            Company <span style={{ fontWeight: 400, color: "#777" }}>(optional)</span>
          </label>
          <input
            id="company"
            type="text"
            value={draft.company ?? ""}
            onChange={(e) => onChange("company", e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #222",
            background: "#111",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Save basics
        </button>
      </form>

      {saved && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            border: "1px solid #cde",
            borderRadius: 10,
            background: "#f6fbff",
          }}
        >
          <strong>Saved locally.</strong>
          <div style={{ marginTop: 6 }}>
            {draft.firstName} {draft.lastName}
            {draft.company ? ` · ${draft.company}` : ""}
          </div>
          <div style={{ color: "#555", marginTop: 4 }}>
            (We’ll sync to the backend in a later step.)
          </div>
        </div>
      )}
    </div>
  );
}
