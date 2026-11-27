import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { api } from "../../api.js";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import "./auth-page.css";
import { AuthAgreement } from "./auth-agreement";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [agreementError, setAgreementError] = useState("");

  function validateEmail(value: string): string {
    if (!value.trim()) {
      return "Enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Enter a valid email address.";
    }

    return "";
  }

  function handleAgreementChange(checked: boolean) {
    setAcceptedTerms(checked);

    if (checked) {
      setAgreementError("");
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value);

    if (emailError) {
      setEmailError(validateEmail(value));
    }

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateEmail(email);

    const termsError = !acceptedTerms
      ? "Please accept the Terms of Service and acknowledge the Privacy Policy."
      : "";

    setEmailError(validationError);
    setAgreementError(termsError);

    if (validationError || termsError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccessMessage(
        "If an account exists with this email, you will receive a password reset link.",
      );
    } catch {
      setErrorMessage("Unable to process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="proofly-auth">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-header">
          <Link className="auth-back" to="/" aria-label="Back to Proofly home">
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>

          <Link className="auth-brand" to="/" aria-label="Proofly home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>proofly</span>
          </Link>
        </div>

        <p className="auth-eyebrow">ACCOUNT RECOVERY</p>

        <h1 id="auth-title">Forgot your password?</h1>

        <p className="auth-description">
          Enter your registered email address and we'll send you a link to reset
          your password.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="forgot-email">
              <span>
                Email address
                <span className="auth-required" aria-hidden="true">
                  *
                </span>
              </span>
            </label>

            <Input
              id="forgot-email"
              autoComplete="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder="you@example.com"
              className={emailError ? "auth-input-error" : ""}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "forgot-email-error" : undefined}
              required
            />

            {emailError && (
              <p
                id="forgot-email-error"
                className="auth-field-error"
                role="alert"
              >
                {emailError}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="auth-message auth-error" role="alert">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <div className="auth-success-container" role="status">
              <p className="auth-message auth-success">{successMessage}</p>

              <p className="auth-expiry-note">
                <Clock size={14} aria-hidden="true" />
                This link will expire in 15 minutes.
              </p>
            </div>
          )}

          <AuthAgreement
            mode="forgot"
            checked={acceptedTerms}
            onChange={handleAgreementChange}
            error={agreementError}
          />

          <Button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="auth-switch">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
