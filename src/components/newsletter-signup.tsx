"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("email", email);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Subscription failed.");
      }

      setStatus("success");
      setMessage(payload.message ?? "You are on the list.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong with the subscription.",
      );
    }
  }

  return (
    <form
      className="newsletter-form"
      onSubmit={handleSubmit}
      aria-label="Subscribe to Lebanese Academic dispatches"
      aria-busy={status === "loading"}
      data-status={status}
    >
      <label htmlFor="newsletter-email">
        <span className="sr-only">Email address</span>
        <Mail size={18} strokeWidth={1.7} aria-hidden="true" />
        <input
          id="newsletter-email"
          name="email"
          required
          type="email"
          autoComplete="email"
          value={email}
          disabled={status === "loading"}
          aria-invalid={status === "error"}
          aria-describedby={message ? "newsletter-status" : undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
          placeholder="your@email.com"
        />
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send me Sundays"}
      </button>
      {message ? (
        <p
          id="newsletter-status"
          className="newsletter-form-status"
          data-status={status}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
