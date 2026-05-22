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

const About = () => {
  useEffect(() => {
    document.title = "About — MindCanvas";
  }, []);

  return (
    <DivClass className="page">
      <TopNav />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-24 pb-16 space-y-16">

        {/* HERO */}
        <section className="text-center lg:text-left">
          <HeadingOne id="heading-one" className="heading-one">
            About MindCanvas
          </HeadingOne>
          <p className="mt-3 text-lg max-w-2xl mx-auto lg:mx-0">
            Built by one developer who got tired of paying five subscriptions
            to do one job. This is the story of why MindCanvas exists and how
            it is being built.
          </p>
        </section>

        {/* 1. THE THESIS */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">The thesis</h2>
          <p className="max-w-3xl mx-auto">
            Most productivity tools solve one slice of a workflow extremely
            well — and stop there. The result is a stack of subscriptions
            that each ask for your attention, your data and your money, and
            none of them talk to each other. MindCanvas is built on the
            opposite conviction: one workspace that can hold text, images,
            audio, video, lists and links on the same surface, owned by the
            person who creates the content.
          </p>
        </section>

        {/* 2. THE JOURNEY */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">The journey</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            <p>
              MindCanvas is the eighth project. The first seven did not ship
              the way I wanted them to — each one taught something the next
              one needed. I am not hiding that history; it is the reason this
              version exists.
            </p>
            <p>
              The first version began in April 2025 as a way to demonstrate
              full-stack engineering skill. By October 2025 it had grown into
              something I actually wanted to use every day — and decided to
              treat as a real product rather than a portfolio piece.
            </p>
            <p>
              The public demo of an earlier version still exists, intentionally
              unfixed, so anyone can see the foundation MindCanvas was built
              from. This current version is the one I use myself.
            </p>
          </div>
        </section>

        {/* 3. HOW IT'S BUILT */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-4">How it's built</h2>
          <ul className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            <li>
              <strong>MERN stack</strong>
              <p className="mt-1 text-sm">
                MongoDB, Express, React, Node — chosen for control over every
                layer, not because it was trendy.
              </p>
            </li>
            <li>
              <strong>TypeScript end-to-end</strong>
              <p className="mt-1 text-sm">
                Type safety across the client and the components that matter
                most.
              </p>
            </li>
            <li>
              <strong>SCSS, CSS, Tailwind</strong>
              <p className="mt-1 text-sm">
                Three styling tools, used where each is strongest. Migration to
                Tailwind v4 is in progress.
              </p>
            </li>
            <li>
              <strong>Bcrypt auth, Argon2 next</strong>
              <p className="mt-1 text-sm">
                Password hashing today. Stronger hashing on the way. No
                third-party sign-in, ever.
              </p>
            </li>
            <li>
              <strong>React-draggable fragments</strong>
              <p className="mt-1 text-sm">
                The drag-to-organize canvas is built on a deliberately simple
                primitive that the rest of the app extends.
              </p>
            </li>
            <li>
              <strong>Local-first MongoDB</strong>
              <p className="mt-1 text-sm">
                Your database runs on your machine. The trust model starts
                there, not in a settings page.
              </p>
            </li>
          </ul>
        </section>

        {/* 4. THE PRINCIPLE */}
        <section className="info-container px-4 sm:px-6 py-6">
          <h2 className="box-heading text-center pb-3">The principle</h2>
          <p className="max-w-3xl mx-auto">
            MindCanvas does not have AI inside it. That is a choice, not an
            oversight. The point of the tool is to give the person using it
            more room to think, not to hide the thinking behind a generated
            answer. Features ship when they are built properly, not when they
            are demo-able. If that means the roadmap is slower than the AI-first
            tools, that is the trade I am making on purpose.
          </p>
        </section>

        {/* 5. CTA */}
        <section className="text-center">
          <h2 className="box-heading pb-3">Want to try what's been built?</h2>
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

export default About;
