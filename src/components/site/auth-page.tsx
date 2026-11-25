import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useProofly } from "../../hooks/use-proofly";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import "./auth-page.css";

type AuthPageProps = {
  mode: "login" | "register";
};

type AuthResponse = {
  access_token: string;
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
          typeof item?.msg === "string" ? item.msg : "Check the information you entered.",
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (isRegister && !name.trim()) {
      setErrorMessage("Enter your name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Enter your password.");
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
      } else {
        const response = (await api.post("/auth/login", {
          email: email.trim(),
          password,
        })) as AuthResponse;

        if (!response?.access_token) {
          throw new Error("The server did not return an access token. Please try again.");
        }

        authenticate(response.access_token);
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
        <Link className="auth-brand" to="/" aria-label="Proofly home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>proofly</span>
        </Link>
        <p className="auth-eyebrow">{isRegister ? "YOUR NEXT CHAPTER STARTS HERE" : "WELCOME BACK"}</p>
        <h1 id="auth-title">{isRegister ? "Create your account" : "Log in to Proofly"}</h1>
        <p className="auth-description">
          {isRegister
            ? "Build a page that brings everything you do together."
            : "Sign in to pick up where you left off."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <label>
              Your name
              <Input
                autoComplete="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
              />
            </label>
          )}
          <label>
            Email address
            <Input
              autoComplete="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <Input
              autoComplete={isRegister ? "new-password" : "current-password"}
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {errorMessage && <p className="auth-message auth-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-message auth-success" role="status">{successMessage}</p>}

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
        <Link className="auth-back" to="/">Back to Proofly</Link>
      </section>
    </main>
  );
}
