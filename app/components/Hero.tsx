"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const canAutoPlay = useMemo(() => !prefersReducedMotion, [prefersReducedMotion]);

  // ✅ Keep this HERE (after hooks, before useEffect/return)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") || "").trim();
    const url = q ? `/locations?q=${encodeURIComponent(q)}` : `/locations`;
    window.location.href = url;
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => setVideoReady(true);
    const onError = () => setVideoError(true);

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);

    if (canAutoPlay) {
      const p = v.play();
      p?.catch(() => setVideoError(true));
    }

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, [canAutoPlay]);

  return (
    <section className={styles.hero} aria-label="FilmInHere hero">
      <div className={styles.poster} aria-hidden="true" />

      {!videoError && (
        <video
          ref={videoRef}
          className={`${styles.video} ${videoReady ? styles.videoOn : ""}`}
          muted
          playsInline
          loop
          preload="metadata"
          autoPlay={canAutoPlay}
          aria-hidden="true"
        >
          <source src="/media/filminhere-intro.mp4" type="video/mp4" />
        </video>
      )}

      <div className={styles.overlay} />

      <div className={styles.content}>
<header className={styles.topHeader} aria-label="Primary">
  <Link href="/" className={styles.brand}>
    <span className={styles.brandMark} aria-hidden="true">📍</span>
    <span className={styles.brandText}>FilmInHere</span>
  </Link>

  <nav className={styles.topNav} aria-label="Main navigation">
    <Link href="/locations" className={styles.navLink}>Explore</Link>
    <Link href="/host/intake" className={styles.navLink}>List a Space</Link>
    <Link href="/me/requests" className={styles.navLink}>My Requests</Link>
  </nav>

  <button className={styles.menuBtn} type="button" aria-label="Open menu">
    ☰
  </button>
</header>

        <h1>Find the space your story needs.</h1>
        <p>Connecting people and spaces so stories can happen.</p>

      <div className={styles.heroCta}>
     <Link className={styles.primaryBtn} href="/locations">
            Find Film Locations
     </Link>
     <Link className={styles.secondaryBtn} href="/host/intake">
            List My Property
     </Link>
      </div>

        {/* ✅ INSERT SEARCH DOCK HERE (after CTAs, still inside .content) */}
        <div className={styles.searchDock} role="search" aria-label="Search film locations">
          <form className={styles.searchForm} onSubmit={onSubmit}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
                <path
                  d="M10 18a8 8 0 1 1 5.293-14.01A8 8 0 0 1 10 18Zm11 3-5.2-5.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <label className={styles.srOnly} htmlFor="heroSearch">
              Search film-ready locations
            </label>

            <input
              id="heroSearch"
              name="q"
              className={styles.searchInput}
              type="search"
              placeholder="Search film-ready locations"
              autoComplete="off"
              inputMode="search"
            />

            <button className={styles.searchBtn} type="submit">
              Find Locations
            </button>
          </form>

          <div className={styles.searchHint}>Homes • Studios • Warehouses • Outdoor spaces</div>
        </div>
      </div>
    </section>
  );
}
