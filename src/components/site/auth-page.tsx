import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useProofly } from "../../hooks/use-proofly";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import "./auth-page.css";
import { AuthAgreement } from "./auth-agreement";

type AuthPageProps = {
  mode: "login" | "register";
};

type AuthResponse = {
  access_token: string;
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  acceptedTerms?: string;
};

function getApiErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  try {
    const details: unknown = JSON.parse(error.message);

    if (Array.isArray(details)) {
      return details
        .map((item) =>
          typeof item?.msg === "string"
            ? item.msg
            : "Check the information you entered.",
        )
        .join(" ");
    }
  } catch {
    return error.message;
  }

  return error.message;
}

export function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { authenticate } = useProofly();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Clear validation when switching between login and register.
  useEffect(() => {
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setPassword("");
    setShowPassword(false);
    setAcceptedTerms(false);
  }, [mode]);

  function validateField(
    field: keyof FieldErrors,
    value: string,
  ): string | undefined {
    switch (field) {
      case "name":
        if (isRegister && !value.trim()) {
          return "Enter your name.";
        }
        break;

      case "email":
        if (!value.trim()) {
          return "Enter your email address.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Enter a valid email address.";
        }
        break;

      case "password":
        if (!value) {
          return "Enter your password.";
        }
        break;
    }

    return undefined;
  }

  function validateForm(): boolean {
    const errors: FieldErrors = {};

    if (isRegister) {
      errors.name = validateField("name", name);
    }

    errors.email = validateField("email", email);
    errors.password = validateField("password", password);

    if (!acceptedTerms) {
      errors.acceptedTerms =
        "Please accept the Terms of Service and acknowledge the Privacy Policy.";
    }

    setFieldErrors(errors);

    return !Object.values(errors).some(Boolean);
  }

  function handleAgreementChange(checked: boolean) {
    setAcceptedTerms(checked);

    setFieldErrors((previous) => ({
      ...previous,
      acceptedTerms: checked ? undefined : previous.acceptedTerms,
    }));
  }

  function handleFieldChange(field: keyof FieldErrors, value: string) {
    switch (field) {
      case "name":
        setName(value);
        break;

      case "email":
        setEmail(value);
        break;

      case "password":
        setPassword(value);
        break;
    }

    // Revalidate only the field that currently has an error.
    setFieldErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      return {
        ...previous,
        [field]: validateField(field, value),
      };
    });

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // Validate all fields before calling the API.
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await api.post("/auth/register", {
          name: name.trim(),
          email: email.trim(),
          password,
        });

        setSuccessMessage("Your account is ready. Sign in to continue.");

        setPassword("");
        setShowPassword(false);
        setFieldErrors({});
      } else {
        const response = (await api.post("/auth/login", {
          email: email.trim(),
          password,
        })) as AuthResponse;

        if (!response?.access_token) {
          throw new Error(
            "The server did not return an access token. Please try again.",
          );
        }

        authenticate(response.access_token, email.trim());
        navigate("/app", { replace: true });
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
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
        <p className="auth-eyebrow">
          {isRegister ? "YOUR NEXT CHAPTER STARTS HERE" : "WELCOME BACK"}
        </p>
        <h1 id="auth-title">
          {isRegister ? "Create your account" : "Log in to Proofly"}
        </h1>
        <p className="auth-description">
          {isRegister
            ? "Build a page that brings everything you do together."
            : "Sign in to pick up where you left off."}
        </p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Name field */}
          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-name">
                <span>
                  Your name
                  <span className="auth-required" aria-hidden="true">
                    *
                  </span>
                </span>
              </label>

              <Input
                id="auth-name"
                autoComplete="name"
                name="name"
                value={name}
                onChange={(event) =>
                  handleFieldChange("name", event.target.value)
                }
                placeholder="Your name"
                className={fieldErrors.name ? "auth-input-error" : ""}
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                required
              />

              {fieldErrors.name && (
                <p id="name-error" className="auth-field-error" role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          {/* Email field */}
          <div className="auth-field">
            <label htmlFor="auth-email">
              <span>
                Email address
                <span className="auth-required" aria-hidden="true">
                  *
                </span>
              </span>
            </label>

            <Input
              id="auth-email"
              autoComplete="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                handleFieldChange("email", event.target.value)
              }
              placeholder="you@example.com"
              className={fieldErrors.email ? "auth-input-error" : ""}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              required
            />

            {fieldErrors.email && (
              <p id="email-error" className="auth-field-error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="auth-field">
            <label htmlFor="auth-password">
              <span>
                Password
                <span className="auth-required" aria-hidden="true">
                  *
                </span>
              </span>
            </label>

            <div className="auth-password-wrapper">
              <Input
                id="auth-password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  handleFieldChange("password", event.target.value)
                }
                placeholder="Enter your password"
                className={fieldErrors.password ? "auth-input-error" : ""}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {fieldErrors.password && (
              <p id="password-error" className="auth-field-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Forgot password - login only */}
          {!isRegister && (
            <div className="auth-forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          )}

          {/* Backend API error */}
          {errorMessage && (
            <p className="auth-message auth-error" role="alert">
              {errorMessage}
            </p>
          )}

          {/* Success message */}
          {successMessage && (
            <p className="auth-message auth-success" role="status">
              {successMessage}
            </p>
          )}
          <AuthAgreement
            mode={isRegister ? "register" : "login"}
            checked={acceptedTerms}
            onChange={handleAgreementChange}
            error={fieldErrors.acceptedTerms}
          />
          <Button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Log in"}
          </Button>
        </form>
        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to Proofly?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
