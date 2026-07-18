import { TextButton } from "./form-components/text/TextButton";
import { LinkButton } from "./form-components/link/LinkButton";
import { ImageButton } from "./form-components/image/ImageButton";
import { TableButton } from "./form-components/table/TableButton";
import { VideoButton } from "./form-components/video/VideoButton";
import Button from "./components/form-elements/Button";
import "./creation-fragments.css";

// Permanent Data Fragment dock, shown beneath the hamburger toggle icon.
// Each button mounts its input unit directly onto the Canvaspace on click —
// no intermediate hub window to open first.
const CreationFragments = () => {
  return (
    <div className="absolute top-8 left-0 creation-fragments-dock">
      {/*
        Help marker sits at the top of the dock — under the hamburger, above
        every input button — so first-time users see the affordance before
        they scan the icons below it. No handler wired yet; give it one when
        the help overlay lands.
      */}
      <Button
        id="help-mark-btn"
        className={"fragment-icon-btn help-mark"}
        title="Help"
      >
        <img src="/HelpMark.svg" alt="Help" className="fragment-icon" />
      </Button>
      <TextButton />
      <LinkButton />
      <ImageButton />
      <TableButton />
      <VideoButton />
    </div>
  );
};

export default CreationFragments;
