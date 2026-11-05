"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./admin.module.css";
import LoadingDots from "@/components/LoadingDots/LoadingDots";
import DashboardLogin from "./components/DashboardLogin";

const CMSAccessForm = dynamic(() => import("./components/CmsAccessForm"), {
  ssr: false,
  loading: () => <LoadingDots tone="green" label="Loading form" />,
});

// The Dashboard Login tab is hidden for now — only the Sanity (News Admin) login is
// shown. Flip to `true` to bring the tab switcher and dashboard login back.
const SHOW_DASHBOARD_LOGIN = false;

type AdminClientProps = {
  initialTab: "cms" | "donation";
  error?: string;
};

export default function AdminClient({ initialTab, error }: AdminClientProps) {
  const [selectedTab, setActiveTab] = useState<"cms" | "donation">(initialTab);
  // With the dashboard login hidden, `?tab=donation` (still used by the middleware
  // redirect and the dashboard logout) falls back to the CMS form.
  const activeTab = SHOW_DASHBOARD_LOGIN ? selectedTab : "cms";
  // Held here, not in DashboardLogin — AnimatePresence remounts that form on every
  // tab switch, so a dismissal stored inside it would not survive the swap.
  const [redirectError, setRedirectError] = useState(
    error === "unauthorized" ? "Please login to access the dashboard." : "",
  );

  // The param has done its job once rendered; drop it so a reload does not re-seed
  // the message and the address bar is left clean.
  useEffect(() => {
    if (!error) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [error]);

  return (
    <div className={styles.portalContainer}>
      <div className={styles.bgOverlay}></div>
      <motion.div
        className={styles.portalCard}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {SHOW_DASHBOARD_LOGIN && (
          <div className={styles.tabSwitcher}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "cms" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("cms")}
            >
              News Admin
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "donation" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("donation")}
            >
              Dashboard Login
            </button>
          </div>
        )}

        <div className={styles.formWrapper}>
          <Suspense fallback={<LoadingDots tone="green" label="Loading form" />}>
            <AnimatePresence mode="wait">
              {activeTab === "cms" ? (
                <motion.div
                  key="cms"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5 }}
                >
                  <CMSAccessForm />
                </motion.div>
              ) : (
                <motion.div
                  key="donation"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  <DashboardLogin
                    redirectError={redirectError}
                    onDismissRedirectError={() => setRedirectError("")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
