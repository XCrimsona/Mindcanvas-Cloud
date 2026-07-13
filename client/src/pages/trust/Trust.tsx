import { DivClass } from "../../../lib/ui/Div";
import HeadingOne from "../../../lib/ui/HeadingOne";
import "../../../lib/components/Header";
import ShortText from "../../../lib/ui/ShortText";
import "../home/home.css";
import "../home/tailwind-style.css";
import { useEffect } from "react";
import Footer from "../../../lib/components/Footer";
import TopNav from "../../../lib/components/TopNav";
import Link from "../../../lib/ui/Link";

const Trust = () => {
  useEffect(() => {
    document.title = "Trust & Data — MindCanvas";
  }, []);

  return (
    <DivClass className="page">
      <TopNav />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-24 pb-16 space-y-16">

        {/* HERO */}
        <section className="text-center lg:text-left">
          <HeadingOne id="heading-one" className="heading-one">
            Trust &amp; Data
          </HeadingOne>
          <p className="mt-3 text-lg max-w-2xl mx-auto lg:mx-0">
            How MindCanvas handles your data today, what it does not do, and
            what is on the way. No marketing words — just the model.
          </p>
        </section>

        {/* 1. WHERE YOUR DATA LIVES */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">Where your data lives</h2>
          <p className="max-w-3xl mx-auto">
            MindCanvas is local-first. The MongoDB database that holds your
            canvaspaces runs on your own machine, not on a server we control.
            Think of it as an external hard drive that happens to speak to a
            web interface — when your computer is off, the database is off.
            Nothing syncs in the background. Nothing leaves unless you
            explicitly export it.
          </p>
        </section>

        {/* 2. HOW ACCOUNTS ARE PROTECTED */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-4">How accounts are protected</h2>
          <ul className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            <li>
              <strong>Password hashing</strong>
              <p className="mt-1 text-sm">
                Passwords are hashed with Argon2id before they touch the
                database. The stored value cannot be reversed back to your
                password.
              </p>
            </li>
            <li>
              <strong>No third-party sign-in</strong>
              <p className="mt-1 text-sm">
                No Meta, Apple, Google or Microsoft OAuth. Your identity is
                not shared with any platform you did not choose.
              </p>
            </li>
            <li>
              <strong>Single-device sessions</strong>
              <p className="mt-1 text-sm">
                One device cannot hold two simultaneous sign-ins. To use a
                second account you switch deliberately — the way Instagram or
                Meta handle account switching.
              </p>
            </li>
            <li>
              <strong>Session boundary on actions</strong>
              <p className="mt-1 text-sm">
                Exporting, sharing or moving canvaspaces requires an
                authenticated session. Closed tab does not equal logged in.
              </p>
            </li>
          </ul>
        </section>

        {/* 3. ON ENCRYPTION */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">On encryption</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            <p>
              Encryption is the same mechanism Word documents, banking apps
              and serious productivity tools use to keep data unreadable to
              anyone who shouldn't see it. It protects people, companies and
              sensitive material — and that is exactly why it belongs here.
            </p>
            <p>
              MindCanvas does not yet encrypt data at rest. It is on the
              roadmap, and it is being built deliberately rather than wired in
              from a tutorial. The reason is the same as why the auth model
              avoids third-party sign-in: when you control the mechanism, you
              control the trust model.
            </p>
            <p>
              Until at-rest encryption ships, see the final section for what
              kinds of material are not yet appropriate to store in the app.
            </p>
          </div>
        </section>

        {/* 4. THE ROADMAP */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-4">What is coming</h2>
          <ul className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            <li>
              <strong>At-rest encryption</strong>
              <p className="mt-1 text-sm">
                Stored canvaspace data encrypted on disk. Standard kind, not
                a marketing word.
              </p>
            </li>
            <li>
              <strong>JSON canvaspace export</strong>
              <p className="mt-1 text-sm">
                Export a whole canvaspace as a JSON file. Travels offline.
                Only useful to someone running MindCanvas — privacy through
                infrastructure, not just permission.
              </p>
            </li>
            <li>
              <strong>PDF &amp; image export</strong>
              <p className="mt-1 text-sm">
                Authenticated export options inside each canvaspace.
              </p>
            </li>
          </ul>
        </section>

        {/* 5. WHAT YOU SHOULD AND SHOULDN'T DO */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">What you should and shouldn't do</h2>
          <ul className="list-disc pl-6 max-w-3xl mx-auto space-y-2 text-sm">
            <li>
              Do not store sensitive material (financial, legal, medical,
              credentials) in MindCanvas until at-rest encryption ships.
            </li>
            <li>
              Do not share your sign-in credentials with anyone, ever. The
              single-device session model protects you only if your password
              stays yours.
            </li>
            <li>
              If a canvaspace contains work you cannot afford to lose, back
              up the underlying files separately. Local-first means the
              backup story is also yours.
            </li>
            <li>
              For important long-term data, wait for the full version with
              at-rest encryption in place.
            </li>
          </ul>
        </section>

        {/* 6. BACK TO HOME CTA */}
        <section className="text-center">
          <h2 className="box-heading pb-3">Ready to try MindCanvas?</h2>
          <div className="mt-2 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <button className="accent-button black-cover gold-brown-border-shadow w-full sm:w-auto px-8 py-3 rounded-full cursor-pointer">
              <Link url="/signup-portal" className="block underline">
                Get Started
              </Link>
            </button>
            <Link url="/" className="underline text-sm self-center">
              Back to home
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

export default Trust;
