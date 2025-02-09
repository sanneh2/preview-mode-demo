import { useEffect } from "react";
import CancelSvg from "../svgs/cancel";
import ShareSvg from "../svgs/share";
import styles from "./index.module.css";

export default function Cancel({ onCancel, onShare, isSharing }) {
  useEffect(() => {
    function listener(e: KeyboardEvent) {
      if (e.metaKey && e.key === "Enter") {
        onShare();
      }
    }
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [onShare]);

  return (
    <div className={styles.group}>
      {!isSharing && (
        <div className={styles.cancel} onClick={onCancel}>
          <CancelSvg />
        </div>
      )}
      <div
        className={`${styles.share} ${isSharing ? styles["pending-bg"] : ""}`}
        onClick={onShare}
        style={isSharing ? { pointerEvents: "none" } : {}}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12"
          />
        </svg>
      </div>
    </div>
  );
}
