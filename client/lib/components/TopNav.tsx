import { useState } from "react";
import Link from "../ui/Link";

const TopNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 black-cover border-b border-[rgba(250,170,0,0.18)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link url="/" className="font-semibold tracking-wide">
          MindCanvas
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link url="/about" className="hover:underline">
            About
          </Link>
          <Link url="/trust" className="hover:underline">
            Trust
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden text-2xl leading-none px-2 cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-[rgba(250,170,0,0.18)] px-4 py-3 space-y-2 text-sm black-cover">
          <Link url="/about" className="block py-1">
            About
          </Link>
          <Link url="/trust" className="block py-1">
            Trust
          </Link>
        </div>
      )}
    </nav>
  );
};

export default TopNav;
