import { useId } from "react";

type AuthAgreementProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  mode: "login" | "register" | "forgot" | "reset";
};

export function AuthAgreement({
  checked,
  onChange,
  error,
  mode,
}: AuthAgreementProps) {
  const id = useId();

  const agreementText = {
    login: "By logging in",
    register: "By creating an account",
    forgot: "By requesting a password reset",
    reset: "By resetting my password",
  };

  return (
    <div className="auth-agreement">
      <div className="auth-agreement-row">
        <input
          id={id}
          name="acceptedTerms"
          type="checkbox"
          className="auth-agreement-checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />

        <div className="auth-agreement-text">
          <label htmlFor={id}>{agreementText[mode]}, I agree to the </label>
          <a
            href="/legal/terms-of-service.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>
          {" and "}
          <a
            href="/legal/privacy-policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="auth-message auth-error text-[13px]!"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
