import LoadingDots from "@/components/LoadingDots/LoadingDots";
import styles from "./loading.module.css";

// Shown while the Sanity Studio bundle downloads after a successful CMS login.
export default function StudioLoading() {
  return (
    <div className={styles.overlay}>
      <LoadingDots tone="green" size="lg" label="Opening Sanity Studio" />
      <p className={styles.text} aria-hidden="true">
        Opening Sanity Studio…
      </p>
    </div>
  );
}
