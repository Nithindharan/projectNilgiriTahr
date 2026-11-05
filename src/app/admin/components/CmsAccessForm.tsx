"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LoadingDots from "@/components/LoadingDots/LoadingDots";
import "./cms-access.css";

export default function CMSAccessForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Set once the password is accepted. The Studio bundle is large, so the
  // navigation can take several seconds; the form stays locked until it lands.
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    let data;

    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      try {
        data = await res.json();
      } catch {
        data = { success: false, message: "Server returned invalid response" };
      }

      if (res.ok && data.success) {
        // Keep `loading` true — this component unmounts when /studio renders.
        setRedirecting(true);
        router.push("/studio");
      } else {
        setLoading(false);
        setError(data.message || "Access denied");
      }
    } catch (err) {
      setLoading(false);
      setError("Network error or invalid request");
    }
  };

  return (
    <>
      <motion.div
        className="cms-card"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <motion.h1
          className="cms-title"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Admin Access Portal
        </motion.h1>

        <motion.p
          className="cms-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Authorized users only
        </motion.p>

        <motion.form
          onSubmit={handleAccess}
          className="cms-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <input
            type="password"
            placeholder="Enter access password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cms-input"
            disabled={loading}
          />
          <motion.button
            whileHover={loading ? undefined : { scale: 1.05 }}
            whileTap={loading ? undefined : { scale: 0.96 }}
            type="submit"
            className="button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="button-loading">
                <LoadingDots
                  tone="light"
                  size="sm"
                  label={redirecting ? "Opening Studio" : "Verifying"}
                />
                <span aria-hidden="true">
                  {redirecting ? "Opening Studio…" : "Verifying…"}
                </span>
              </span>
            ) : (
              "Login"
            )}
          </motion.button>
        </motion.form>

        {error && (
          <motion.p
            className="cms-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </>
  );
}
