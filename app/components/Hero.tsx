"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
      {/* Poster always visible */}
      <div className={styles.poster} aria-hidden="true" />

      {/* Video fades in only when ready */}
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

      {/* Readability overlay */}
      <div className={styles.overlay} />

      {/* Content */}
      
      <div className={styles.content}>
          <h1>Find the space your story needs.</h1>
          <p>Connecting people and spaces so stories can happen.</p>
      
      <div className={styles.heroCta}>
          <Link className={styles.primaryBtn} href="/producer/intake">
            Find Film Locations
          </Link>

          <Link className={styles.secondaryBtn} href="/host/intake">
            List My Property
          </Link>
      </div>
      </div>
    </section>
  );
}
