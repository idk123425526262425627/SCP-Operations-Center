
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed.");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to connect to the registration service.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-white/15 bg-[#090e14]/80 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#a64b50] focus:ring-2 focus:ring-[#a64b50]/20";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#090d12] font-sans text-white">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/foundation-register-background.jpg')",
        }}
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080b10]/95 via-[#080b10]/80 to-[#080b10]/65" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080b10]/90 via-transparent to-[#080b10]/35" />

      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 items-center gap-12 px-6 py-10 lg:grid-cols-[1fr_490px] lg:px-16">
        <section className="hidden max-w-2xl lg:block">
          <div className="mb-16 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#a64b50]/60 bg-[#85383e]/30 text-2xl font-black">
              S
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.2em]">
                SCP OPERATIONS CENTER
              </p>
              <p className="mt-1 text-[10px] tracking-[0.24em] text-white/50">
                FOUNDATION ADMINISTRATIVE SYSTEM
              </p>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#a64b50]" />
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#d17a7e]">
              FOUNDATION PERSONNEL ENROLLMENT
            </p>
          </div>

          <h1 className="max-w-xl text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">
            REGISTER WITH
            <span className="mt-2 block text-[#c46a70]">
              THE FOUNDATION.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-7 text-white/65">
            Create your Foundation account to request access to the
            SCP Operations Center and its authorized personnel systems.
          </p>

          <div className="mt-12 grid max-w-lg grid-cols-2 gap-3">
            <div className="rounded-md border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
              <p className="text-[9px] tracking-[0.2em] text-white/40">
                NETWORK
              </p>
              <p className="mt-2 text-xs font-semibold tracking-wide">
                FOUNDATION INTERNAL
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
              <p className="text-[9px] tracking-[0.2em] text-white/40">
                ENROLLMENT
              </p>
              <p className="mt-2 text-xs font-semibold tracking-wide">
                PERSONNEL REGISTRATION
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[490px]">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#85383e] text-xl font-black">
              S
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest">
                SCP OPERATIONS CENTER
              </p>
              <p className="mt-1 text-[9px] tracking-widest text-white/45">
                FOUNDATION ADMINISTRATIVE SYSTEM
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/15 bg-[#10161de8] shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="h-1 bg-gradient-to-r from-[#713237] via-[#b05258] to-[#713237]" />

            <div className="p-7 sm:p-9">
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-[0.22em] text-[#d17a7e]">
                    PERSONNEL ENROLLMENT
                  </p>
                  <span className="rounded border border-white/10 px-2 py-1 text-[8px] tracking-widest text-white/40">
                    REG-01
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Create your account
                </h2>
                <p className="mt-2 text-xs leading-5 text-white/45">
                  Enter your information to begin registration.
                </p>
              </div>

              {success ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
                  <p className="text-sm font-bold text-emerald-300">
                    Registration successful
                  </p>
                  <p className="mt-2 text-xs leading-6 text-emerald-100/70">
                    Your account has been created. Your initial personnel
                    classification and clearance are assigned automatically.
                  </p>
                  <Link
                    href="/sign-in"
                    className="mt-5 block rounded-md bg-[#85383e] px-4 py-3 text-center text-xs font-bold tracking-widest transition hover:bg-[#a04b51]"
                  >
                    PROCEED TO SIGN IN
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold tracking-widest text-white/65">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className={inputClass}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold tracking-widest text-white/65">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={inputClass}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold tracking-widest text-white/65">
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={inputClass}
                      placeholder="Minimum 12 characters"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold tracking-widest text-white/65">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className={inputClass}
                      placeholder="Re-enter your password"
                    />
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-md border border-[#c16b70]/40 bg-[#85383e] px-4 py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-[#85383e]/20 transition hover:bg-[#a04b51] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "REGISTERING..." : "REGISTER WITH THE FOUNDATION"}
                  </button>
                </form>
              )}

              <div className="mt-7 border-t border-white/10 pt-6 text-center">
                <p className="text-xs text-white/45">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="font-bold text-[#d17a7e] transition hover:text-white"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between px-1 text-[9px] tracking-widest text-white/35">
            <span>FOUNDATION INTERNAL NETWORK</span>
            <span>REGISTRATION PORTAL</span>
          </div>
        </section>
      </div>
    </main>
  );
}
