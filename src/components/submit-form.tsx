"use client";

import { useState } from "react";

const initialState = {
  name: "",
  location: "",
  email: "",
  title: "",
  letter: "",
};

export function SubmitForm() {
  const [values, setValues] = useState(initialState);
  const [consent, setConsent] = useState(false);
  const [appearance, setAppearance] = useState("full");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("location", values.location);
    formData.append("email", values.email);
    formData.append("title", values.title);
    formData.append("letter", values.letter);
    formData.append("appearance", appearance);
    formData.append("consent", String(consent));

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Submission failed.");
      }

      setStatus("success");
      setMessage(payload.message ?? "Your submission has been sent.");
      setValues(initialState);
      setConsent(false);
      setAppearance("full");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong sending the form.",
      );
    }
  }

  return (
    <form className="submit-form" onSubmit={handleSubmit} aria-describedby="submit-form-note">
      <p id="submit-form-note" className="dense-meta">
        Required fields are marked with *. We review every submission with care before publication.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span>Name or pseudonym <b>*</b></span>
          <input
            required
            autoComplete="name"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="e.g. Maya, N."
          />
        </label>
        <label className="space-y-2">
          <span>Location <b>*</b></span>
          <input
            required
            autoComplete="address-level2"
            value={values.location}
            onChange={(event) =>
              setValues((current) => ({ ...current, location: event.target.value }))
            }
            placeholder="City, town, or country"
          />
        </label>
      </div>
      <label className="space-y-2 block">
        <span>Email <b>*</b></span>
        <input
          required
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
          placeholder="you@example.com"
        />
      </label>
      <label className="space-y-2 block">
        <span>Title of your piece <b>*</b></span>
        <input
          required
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="e.g. The Sea Is Not a Border"
        />
      </label>
      <label className="space-y-2 block">
        <span>Your piece <b>*</b></span>
        <textarea
          required
          aria-describedby="letter-counter"
          value={values.letter}
          onChange={(event) =>
            setValues((current) => ({ ...current, letter: event.target.value }))
          }
          maxLength={5000}
          placeholder="Write your piece here..."
        />
      </label>
      <div id="letter-counter" className="-mt-4 flex justify-between dense-meta">
        <span>{values.letter.length} / 5000 characters</span>
        <span>Short pieces are welcome</span>
      </div>

      <div className="submit-form-lower">
        <label className="space-y-2">
          <span>Optional image (one file)</span>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" />
          <small>Photos, scans, or documents. Max 10MB, JPG, PNG, PDF.</small>
        </label>

        <fieldset>
          <legend>How would you like your piece to appear? <b>*</b></legend>
          {[
            ["full", "Publish with full name"],
            ["first", "First name only"],
            ["anonymous", "Anonymously"],
          ].map(([value, label]) => (
            <label key={value} className="radio-row">
              <input
                type="radio"
                name="appearance"
                value={value}
                checked={appearance === value}
                onChange={(event) => setAppearance(event.target.value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <label className="submit-consent">
        <input
          required
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          I have read and agree to the <a href="/submit">editorial guidelines</a>.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Submit Letter"}
      </button>
      {message ? (
        <p
          className="submit-form-status"
          data-status={status}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
