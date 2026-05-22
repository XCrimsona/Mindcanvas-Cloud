import { DivClass } from "../../../lib/ui/Div";
import HeadingOne from "../../../lib/ui/HeadingOne";
import "../../../lib/components/Header";
import ShortText from "../../../lib/ui/ShortText";
import "./home.css";
import "./tailwind-style.css";
import { useEffect } from "react";
import Footer from "../../../lib/components/Footer";
import TopNav from "../../../lib/components/TopNav";
import Link from "../../../lib/ui/Link";

const Home = () => {
  useEffect(() => {
    document.title =
      "MindCanvas — One canvas. Your data. No subscription stack.";
  }, []);

  return (
    <DivClass className="page">
      <TopNav />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-24 pb-16 space-y-16">
        {/* 1. HERO */}
        <section className="text-center lg:text-left">
          <HeadingOne id="heading-one" className="heading-one">
            MindCanvas
          </HeadingOne>
          <p className="mt-3 text-lg max-w-2xl mx-auto lg:mx-0">
            One canvas for text, images, audio, video and lists — so you stop
            paying for five tools to do one job.
          </p>
          <p className="mt-2 text-sm opacity-75 max-w-2xl mx-auto lg:mx-0">
            Local-first · No trackers · No AI shortcuts
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center lg:justify-start">
            <button className="accent-button black-cover gold-brown-border-shadow w-full sm:w-auto px-8 py-3 rounded-full cursor-pointer">
              <Link url="/signup-portal" className="block underline">
                Get Started
              </Link>
            </button>
            <Link
              url="/signin-portal"
              className="underline text-base self-center ml-10 mr-10"
            >
              Log in &#10095;
            </Link>
          </div>
        </section>

        {/* 2. THE PROBLEM */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">
            The tool-sprawl problem
          </h2>
          <p className="max-w-3xl mx-auto text-center">
            Most apps solve one slice — notes here, diagrams there, spreadsheets
            in a third tab. You end up paying for five subscriptions and
            switching between them all day, losing context every time.
          </p>
        </section>

        {/* 3. THE ANSWER */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">What MindCanvas is</h2>
          <p className="max-w-3xl mx-auto text-center">
            A private workspace where text, images, audio, video, lists and
            links live on the same canvas. Drag to organize. Share fragments
            when you want to. Your database stays on your device.
          </p>
        </section>

        {/* 4. WHAT YOU CAN DO */}
        <section>
          <h2 className="box-heading text-center pb-6">What you can do</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li className="feature-tile px-4 py-4">
              <strong>Multi-media fragments</strong>
              <p className="mt-1 text-sm">
                Text, image, audio, video, list and link — all on one canvas.
              </p>
            </li>
            <li className="feature-tile px-4 py-4">
              <strong>Drag-to-organize</strong>
              <p className="mt-1 text-sm">
                Rearrange fragments freely. Make sense of complex data visually.
              </p>
            </li>
            <li className="feature-tile px-4 py-4">
              <strong>Unlimited Canvaspaces</strong>
              <p className="mt-1 text-sm">
                Create as many spaces as you need. No artificial caps.
              </p>
            </li>
            <li className="feature-tile px-4 py-4">
              <strong>Fragment sharing</strong>
              <p className="mt-1 text-sm">
                Share a canvaspace without exposing the underlying data.
              </p>
            </li>
            <li className="feature-tile px-4 py-4">
              <strong>Local-first storage</strong>
              <p className="mt-1 text-sm">
                Your database runs on your machine. Nothing leaves unless you
                export it.
              </p>
            </li>
            <li className="feature-tile px-4 py-4">
              <strong>Single-device sessions</strong>
              <p className="mt-1 text-sm">
                One device cannot hold two simultaneous sign-ins — switch
                accounts deliberately, never accidentally.
              </p>
            </li>
          </ul>
        </section>

        {/* 5. WHY MINDCANVAS */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-4">Why MindCanvas</h2>
          <ul className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            <li>
              <strong>Local-first.</strong>
              <p className="mt-1 text-sm">
                Your database runs on your device. Not someone else's cloud.
              </p>
            </li>
            <li>
              <strong>Privacy-first.</strong>
              <p className="mt-1 text-sm">
                Zero third-party sign-ins. No Meta, Apple, Google or Microsoft.
              </p>
            </li>
            <li>
              <strong>Depth over speed.</strong>
              <p className="mt-1 text-sm">
                Flexibility for real thinking — not AI shortcuts that hide the
                work.
              </p>
            </li>
            <li>
              <strong>One tool, not ten.</strong>
              <p className="mt-1 text-sm">
                Built so you can cancel the other subscriptions you barely use.
              </p>
            </li>
          </ul>
        </section>

        {/* 6. HONEST NOTES */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">Honest notes</h2>
          <ul className="list-disc pl-6 max-w-3xl mx-auto space-y-1 text-sm">
            <li>
              Designed for large screens. Small-screen layouts are in progress.
            </li>
            <li>
              At-rest encryption is on the roadmap — for now, avoid storing
              sensitive material.
            </li>
            <li>
              Chart fragments, A4 reading mode, PDF and JSON canvaspace export
              are planned next.
            </li>
          </ul>
          <p className="text-center mt-4 text-sm space-x-4">
            <Link url="/trust" className="underline">
              See the full privacy &amp; data model &#10095;
            </Link>
            <Link url="/about" className="underline">
              Read the story behind MindCanvas &#10095;
            </Link>
          </p>
        </section>

        {/* 7. FINAL CTA */}
        <section className="text-center">
          <h2 className="box-heading pb-3">Ready to try it?</h2>
          <div className="mt-2 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <button className="accent-button black-cover gold-brown-border-shadow w-full sm:w-auto px-8 py-3 rounded-full cursor-pointer">
              <Link url="/signup-portal" className="block underline">
                Get Started
              </Link>
            </button>
            <Link
              url="/signin-portal"
              className="underline text-sm self-center"
            >
              Already have an account? Log in
            </Link>
          </div>
        </section>
      </div>

      <Footer
        id="home-footer"
        className={"absolute text-center pt-2 pb-2 bottom-0 w-full black-cover"}
      >
        <DivClass className={"project-creator"}>
          <ShortText className={"creator"}>
            Maintained by XCrimsona · Github: XCrimsona
          </ShortText>
        </DivClass>
      </Footer>
    </DivClass>
  );
};

export default Home;
