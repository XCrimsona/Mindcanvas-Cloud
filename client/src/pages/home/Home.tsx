import { DivClass } from "../../../lib/ui/Div";
import "../../../lib/components/Header";
import ShortText from "../../../lib/ui/ShortText";
import "./home.css";
import "./tailwind-style.css";
import "./home-media-queries.css";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, type MotionProps } from "framer-motion";
import Footer from "../../../lib/components/Footer";
import TopNav from "../../../lib/components/TopNav";
import Link from "../../../lib/ui/Link";

// const revealUp = {
//   initial: { opacity: 0, y: 45 },
//   whileInView: { opacity: 1, y: 0 },
//   viewport: { once: true, amount: 0.7 },
//   transition: { duration: 0.5, ease: "easeOut" },
// } as const;

type RevealDirection = "up" | "down" | "left" | "right" | "none";

type RevealOptions = {
  // seconds — how long the entrance animation runs
  duration?: number;
  // seconds — wait before starting (useful for staggering siblings)
  delay?: number;
  // framer-motion easing: named string or cubic-bezier tuple
  ease?: "easeOut" | "easeIn" | "easeInOut" | "linear";
  // 0–1: how much of the element must be visible before firing
  amount?: number;
  // false = re-trigger every time it re-enters the viewport
  once?: boolean;
};

// Convention: the direction names where the element ENTERS FROM.
//   "up"    → starts below, rises up into place
//   "down"  → starts above, drops down into place
//   "left"  → starts to the left, slides right into place
//   "right" → starts to the right, slides left into place
//   "none"  → fade only, no movement
// All params are optional — reveal(), reveal(60), and reveal(60, "left") all
// work. Return is typed as MotionProps so spreading into any motion.* element
// type-checks cleanly.
const reveal = (
  distance: number = 60,
  direction: RevealDirection = "up",
  opts: RevealOptions = {},
): MotionProps => {
  // Always declare BOTH axes on `initial`, zeroing the one we don't move.
  // Guarantees an "up" tile can't drift horizontally and vice versa.
  const offset =
    direction === "up"
      ? { x: 0, y: distance }
      : direction === "down"
        ? { x: 0, y: -distance }
        : direction === "left"
          ? { x: -distance, y: 0 }
          : direction === "right"
            ? { x: distance, y: 0 }
            : { x: 0, y: 0 };

  const {
    duration = 0.5,
    delay = 0,
    ease = "easeOut",
    amount = 0.5,
    once = true,
  } = opts;

  return {
    initial: { opacity: 0, ...offset },
    whileInView: { opacity: 1, x: 0, y: 0 },
    viewport: { once, amount },
    transition: { duration, delay, ease },
  };
};

// Example usage — element slides in from the left instead of from below.
// No React event is involved: reveal() is just called inline and its
// returned props are spread onto the motion element, same as {...revealUp}.
// <motion.section
//   className="text-left lg:text-left py-70 h-screen snap-section"
//   {...reveal(45, "left")}
// >
//   ...
// </motion.section>

// Example — hooking custom logic to the moment the reveal actually fires.
// Framer Motion doesn't use a DOM event for this; it exposes its own
// onViewportEnter/onViewportLeave callback props on motion.* components,
// fired by the IntersectionObserver it sets up internally for whileInView.
// <motion.section
//   {...reveal(45, "right")}
//   onViewportEnter={() => console.log("hero revealed")}
// >
//   ...
// </motion.section>

// Reveal-direction responsiveness.
// ------------------------------------------------------------------
// The `reveal()` helper takes a direction ("up" | "down" | "left" |
// "right" | "none") that was chosen for the DESKTOP layout. On
// narrower viewports those sideways slides look wrong — a tile that
// enters from the left on a 375px phone crosses the entire content
// column and reads as chaotic. We want:
//
//   mobile   (< 600px)   → force every reveal to "up"
//   tablet   (600–1023)  → keep desktop direction (side slides still
//                          make sense when there's horizontal room)
//   desktop  (≥ 1024)    → keep desktop direction (author's intent)
//
// One `useBreakpoint` hook + one `dir()` mapper is enough. We do NOT
// rewrite reveal() itself — the mapper is just applied at each call
// site: `reveal(80, dir("left"))` instead of `reveal(80, "left")`.
type Breakpoint = "mobile" | "tablet" | "desktop";

const readBreakpoint = (): Breakpoint => {
  // Guarded for safety even though this project is Vite-only (no SSR).
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 600) return "mobile";
  else if (w < 1024) return "tablet";
  else return "desktop";
};

const useBreakpoint = (): Breakpoint => {
  const [bp, setBp] = useState<Breakpoint>(readBreakpoint);
  useEffect(() => {
    const onResize = () => setBp(readBreakpoint());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
};

const Home = () => {
  const bp = useBreakpoint();
  // Ref attached to the "Ready to try it" section. We use framer-motion's
  // useInView to detect when that section enters/leaves the viewport, so
  // the footer can pin itself only during that moment.
  //
  // WHY: with `scroll-snap-type: y mandatory` on <html>, each h-screen
  // section takes over the viewport as it snaps. A regular footer sitting
  // at the end of the flow can't be reached — snap parks on the last
  // section instead. Fix: take the footer OUT of the snap flow (fix it to
  // the bottom of the viewport with position:fixed) and only reveal it
  // when the final CTA section is on screen. Otherwise it hides.
  //
  // useInView options:
  //   amount: 0.5 → fire when at least 50% of the section is visible
  //   once: false → toggle every time the section enters/leaves, so the
  //                 footer can re-appear if the user scrolls back down
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const finalCtaInView = useInView(finalCtaRef, {
    amount: 0.5,
    once: false,
  });

  useEffect(() => {
    document.title =
      "MindCanvas — One canvas. Your data. No subscription stack.";
  }, []);

  // Scroll-snap is desktop-only.
  // ------------------------------------------------------------------
  // On mobile/tablet, sections often contain more content than a
  // single viewport can hold. With `scroll-snap-type: y mandatory` on
  // <html>, the browser force-snaps each section to viewport top — so
  // anything taller than 100vh gets clipped by the next snap point
  // and reads as "overlapping". The fix: enable snap ONLY when we
  // know every section fits inside 100vh, i.e. on desktop.
  //
  // We watch `bp` (not just mount) so a user resizing from desktop →
  // mobile drops out of snap cleanly, no reload needed. The paired
  // CSS override in home-media-queries.css lifts `h-screen` to
  // `min-height:100vh` below 1024px so sections grow with content.
  useEffect(() => {
    if (bp === "desktop") {
      document.documentElement.classList.add("snap-home");
    } else {
      document.documentElement.classList.remove("snap-home");
    }
    return () => document.documentElement.classList.remove("snap-home");
  }, [bp]);

  return (
    <DivClass className="page">
      <TopNav />
      <div className="home-shell">
        {/* 1. HERO */}
        <motion.section
          className="hero-section snap-section"
          {...reveal(0, "up", {
            duration: 0.5,
            delay: 0,
            ease: "easeOut",
            amount: 0.55,
            once: true,
          })}
        >
          <p className="hero-headline hero-size">
            Stacked documents on your desk introduce cluttered workflow that
            hold you back from accomplishing the peak performance for your work.
          </p>
          <p className="hero-subtext">Take back your energy and workflow.</p>
          <div className="hero-cta-row">
            <button className="accent-button black-cover gold-brown-border-shadow cta-button">
              <Link url="/signup-portal" className="cta-link">
                Get Started
              </Link>
            </button>
          </div>
          <p className="hero-microcopy">
            No plugins. No setup. Just drop things in.
          </p>
        </motion.section>

        <motion.section
          className="pill-section snap-section"
          {...reveal(60, "up")}
        >
          <section>
            <p className="pill-lead">A private workspace where</p>
            <section className="pill-row">
              <section className="info-container pill-tag">text</section>
              <section className="info-container pill-tag">images</section>
              <section className="info-container pill-tag">video</section>
              <section className="info-container pill-tag">list</section>
              <section className="info-container pill-tag">links</section>
            </section>
            <p className="pill-close">
              come together on the same canvas. The workspace scales as your
              ideas grow in visual size, giving every data-fragment room to
              breathe and keeping your workflow effortless.
            </p>
          </section>
        </motion.section>

        {/* 4. WHAT YOU CAN DO */}
        <motion.section
          className="what-section snap-section"
          {...reveal(60, "up")}
        >
          <section>
            <h2 className="box-heading section-heading">What you can do</h2>
            <ul className="feature-grid">
              <motion.li
                className="feature-tile feature-item"
                {...reveal(80, "up", { delay: 0.2 })}
              >
                <strong>Think spatially, not vertically</strong>
                <p className="feature-body">
                  Lay ideas out until the picture clicks, instead of scrolling a
                  long document trying to hold it all in your head.
                </p>
              </motion.li>
              <motion.li
                className="feature-tile feature-item"
                {...reveal(80, "up", { delay: 0.1 })}
              >
                <strong>
                  Follow your train of thought without app-switching
                </strong>
                <p className="feature-body">
                  Stay inside one workspace from first spark to finished idea —
                  no context lost between five tabs and three tools.
                </p>
              </motion.li>
              <motion.li
                className="feature-tile feature-item"
                {...reveal(80, "up", { delay: 0.2 })}
              >
                <strong>Keep separate parts of your life separated</strong>
                <p className="feature-body">
                  A canvas per project, client or side idea — nothing bleeds
                  into the wrong context or clutters unrelated work.
                </p>
              </motion.li>
              <motion.li
                className="feature-tile feature-item"
                {...reveal(80, "up", { delay: 0.2 })}
              >
                <strong>Grow without pruning</strong>
                <p className="feature-body">
                  Start with one thought and keep adding — the workspace
                  stretches to fit, so nothing has to be deleted to make room.
                </p>
              </motion.li>
              <motion.li
                className="feature-tile feature-item"
                {...reveal(80, "up", { delay: 0.2 })}
              >
                <strong>Hand off a slice, not the whole desk</strong>
                <p className="feature-body">
                  Coming soon — share the exact fragment or canvas that matters
                  to someone else, and keep the rest of your workspace private.
                </p>
              </motion.li>
              <motion.li
                className="feature-tile feature-item"
                {...reveal(80, "up", { delay: 0.2 })}
              >
                <strong>Pick up exactly where you left off</strong>
                <p className="feature-body">
                  Your last arrangement is your next starting point — no
                  re-opening tabs, no rebuilding the setup you had yesterday.
                </p>
              </motion.li>
            </ul>
          </section>
        </motion.section>

        {/* 5. WHY MINDCANVAS */}
        <motion.section className="why-section snap-section">
          <section>
            <motion.h2
              className="box-heading section-heading section-heading--tight"
              {...reveal(60, "up")}
            >
              Why MindCanvas
            </motion.h2>
            <motion.ul className="why-grid" {...reveal(60, "up")}>
              <motion.li
                className="info-container why-item"
                {...reveal(60, "up")}
              >
                <strong className="why-item-title">
                  Your work belongs to you.
                </strong>
                <p className="why-item-body">
                  Nothing you make gets parked on someone else's server, so
                  nobody can lock it away, ration it, or mine it later.
                </p>
              </motion.li>
              <motion.li
                className="info-container why-item"
                {...reveal(60, "up")}
              >
                <strong className="why-item-title">
                  No account you don't own.
                </strong>
                <p className="why-item-body">
                  Sign in with your own credentials — not Google, Apple, Meta or
                  Microsoft. Nobody outside gets a record of what you do here.
                </p>
              </motion.li>
              <motion.li
                className="info-container why-item"
                {...reveal(60, "up")}
              >
                <strong className="why-item-title">
                  Room to actually think.
                </strong>
                <p className="why-item-body">
                  No AI shortcut writing over your process — the work stays
                  yours, and so does the understanding you build along the way.
                </p>
              </motion.li>
              <motion.li
                className="info-container why-item"
                {...reveal(60, "up")}
              >
                <strong className="why-item-title">
                  One place, not a monthly bill for five.
                </strong>
                <p className="why-item-body">
                  Notes app, whiteboard, moodboard, file dump — one workspace
                  covers the ground four subscriptions used to.
                </p>
              </motion.li>
            </motion.ul>
          </section>
        </motion.section>

        {/* 5b. MID-PAGE CTA — placed after "Why MindCanvas" (medium trust:
             reader has seen the value prop and the principles). Verb here
             is more direct than the hero, per CTA Engine Phase 3b. Microcopy
             shifts from reassurance to specificity — no more "no setup"
             hand-holding; instead, names the outcome. */}
        <motion.section
          className="mid-cta-section snap-section"
          {...reveal(60, "up")}
        >
          <h2 className="box-heading cta-heading">
            The canvas is ready when you are.
          </h2>
          <div className="cta-button-row">
            <button className="accent-button black-cover gold-brown-border-shadow cta-button">
              <Link url="/signup-portal" className="cta-link">
                Create My Account
              </Link>
            </button>
          </div>
          <p className="mid-cta-note">One workspace on your device.</p>
        </motion.section>

        {/* 6. HONEST NOTES */}
        <motion.section
          className="notes-section snap-section"
          {...reveal(60, "up")}
        >
          <section>
            <motion.h2
              className="box-heading notes-heading"
              {...reveal(60, "up")}
            >
              Honest notes
            </motion.h2>
            <motion.ul className="notes-list">
              <motion.li
                className="info-container notes-item"
                {...reveal(60, "up", { delay: 0.1 })}
              >
                Designed for large screens. Mobile-Screen layouts are in
                progress.
              </motion.li>
              <motion.li
                className="info-container notes-item"
                {...reveal(60, "up")}
              >
                At-rest encryption is on the roadmap — for now, avoid storing
                sensitive material.
              </motion.li>
              <motion.li
                className="info-container notes-item"
                {...reveal(60, "up", { delay: 0.1 })}
              >
                Chart fragments, A4 reading mode, PDF and JSON canvaspace export
                are planned next.
              </motion.li>
            </motion.ul>
          </section>
        </motion.section>

        {/* 7. FINAL CTA */}
        <motion.section
          ref={finalCtaRef}
          className="final-cta-section snap-section"
          {...reveal(60, "up")}
        >
          <section>
            <h2 className="box-heading cta-heading">Ready to try it?</h2>
            <div className="cta-button-row">
              <button className="accent-button black-cover gold-brown-border-shadow cta-button">
                <Link url="/signup-portal" className="cta-link-underlined">
                  Get MindCanvas
                </Link>
              </button>
              <Link url="/signin-portal" className="alt-login-link">
                Already have an account? Log in
              </Link>
            </div>
            <p className="final-cta-note">Open source. Local. Yours.</p>
          </section>
        </motion.section>
      </div>

      {/* Footer — pinned to the viewport bottom (position:fixed) and
          revealed only while the final CTA section is on screen.
          --------------------------------------------------------------
          WHY THIS WRAPPER EXISTS:
          The <Footer/> component itself was originally positioned
          absolute/bottom-0. With scroll-snap enabled, snap parks on the
          last h-screen section and never scrolls far enough for an
          in-flow footer to render — the user never sees it.

          The fix takes the footer OUT of the snap flow entirely by
          wrapping it in a motion.div that is fixed to the viewport, and
          gates its opacity + pointer-events on `finalCtaInView`
          (the boolean returned by useInView on the Ready-to-try section).

          Framer-motion attributes used:
            initial={false}          → don't play the entrance on mount;
                                       start in the state `animate` picks.
            animate={{...}}          → target values that change with state.
                                       When finalCtaInView flips, the object
                                       changes, framer tweens between them.
            transition={{...}}       → controls how long the fade takes and
                                       what easing curve is used.

          CSS attributes used and why:
            position:fixed           → sits relative to the viewport, not
                                       relative to the snap flow. Required.
            bottom-0 left-0 right-0  → pin to the bottom edge, full width.
            z-50                     → above the snap sections so the last
                                       section can't overlap it.
            pointerEvents            → 'none' while hidden so invisible
                                       links can't be clicked accidentally.

          If you remove `pointerEvents: "none"` the footer's github link
          would still be clickable while faded out — subtle bug, but the
          user would tab-focus an element they can't see.

          Optional tweaks:
            - Change duration in transition to slow/quicken the fade.
            - Swap ease for "easeInOut" if the current easeOut feels abrupt.
            - Add a translateY(20px)→0 to the animate targets for a
              slide-up-into-place effect (currently pure fade). */}
      <motion.div
        initial={false}
        animate={{
          opacity: finalCtaInView ? 1 : 0,
          pointerEvents: finalCtaInView ? "auto" : "none",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="home-footer-pin"
      >
        <Footer id="home-footer" className={"home-footer black-cover"}>
          <DivClass className={"project-creator"}>
            <ShortText className={"creator"}>Maintained by XCrimsona</ShortText>
          </DivClass>
        </Footer>
      </motion.div>
    </DivClass>
  );
};

export default Home;
