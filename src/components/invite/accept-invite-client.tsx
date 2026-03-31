"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AcceptInviteClientProps {
  token: string;
  orgName: string;
  email: string;
  role: string;
  isLoggedIn: boolean;
}

export function AcceptInviteClient({ token, orgName, role, isLoggedIn }: AcceptInviteClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    if (!isLoggedIn) {
      router.push(`/sign-in?redirect=/invite/${token}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("Failed to accept invitation");
      const data = await res.json();
      router.push(`/org/${data.orgId}/dashboard`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re invited!</h1>
        <p className="text-gray-500 mb-1">
          You&apos;ve been invited to join <strong>{orgName}</strong>
        </p>
        <p className="text-sm text-gray-400 mb-6">
          as a <span className="capitalize font-medium text-gray-600">{role}</span>
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Joining..." : isLoggedIn ? "Accept Invitation" : "Sign In to Accept"}
        </button>
        <p className="text-xs text-gray-400 mt-4">
          {isLoggedIn ? (
            <>Not you? <Link href="/sign-in" className="text-blue-600 hover:underline">Switch account</Link></>
          ) : (
            <>Don&apos;t have an account? <Link href={`/sign-up?redirect=/invite/${token}`} className="text-blue-600 hover:underline">Sign up</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
