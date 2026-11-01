"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

function usePrefersReducedMotion() {
  // Keep the poster until the visitor's motion preference is known.
  const [reduced, setReduced] = useState(true);

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
  const [videoPaused, setVideoPaused] = useState(false);

  const canAutoPlay = useMemo(() => !prefersReducedMotion, [prefersReducedMotion]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => setVideoReady(true);
    const onError = () => setVideoError(true);
    const onPlay = () => setVideoPaused(false);
    const onPause = () => setVideoPaused(true);

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    if (v.readyState >= 3) onCanPlay();

    if (canAutoPlay) {
      const p = v.play();
      p?.catch(() => setVideoError(true));
    }

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [canAutoPlay]);

  return (
    <section className={styles.hero} aria-label="FilmInHere hero">
      <div className={styles.poster} aria-hidden="true" />

      {!videoError && !prefersReducedMotion && (
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

      {videoReady && !videoError && !prefersReducedMotion && (
        <button type="button" className={styles.motionControl} onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) {
            setVideoPaused(false);
            video.play().catch(() => setVideoError(true));
          } else {
            video.pause();
            setVideoPaused(true);
          }
        }}>
          {videoPaused ? "Play background video" : "Pause background video"}
        </button>
      )}

      <div className={styles.content}>
        <h1>Find the space your story needs.</h1>

      <div className={styles.heroCta}>
     <Link className={styles.primaryBtn} href="/locations">
            Find Film Locations
     </Link>
     <Link className={styles.secondaryBtn} href="/host">
            Become a Host
     </Link>
      </div>

        <div className={styles.searchDock} role="search" aria-label="Search film locations">
          <form className={styles.searchForm} method="GET" action="/locations">
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
              City, state or ZIP
            </label>

            <input
              id="heroSearch"
              name="q"
              className={styles.searchInput}
              type="search"
              placeholder="City, state or ZIP"
              autoComplete="off"
              inputMode="search"
            />

            <button className={styles.searchBtn} type="submit">
              Find Locations
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
