import { DivClass } from "../../ui/Div";
import SVG from "../../SVG";
import { motion } from "framer-motion";
import Button from "../../components/form-elements/Button";
import ShortText from "../../ui/ShortText";
import "../comp-hub-data-components.css";
import { useComponentHub } from "../ComponentHubContextProvider";
import { TextButton } from "../../form-components/text/TextButton";
import { LinkButton } from "../../form-components/link/LinkButton";
// import { AudioButton } from "../live-components/audio/AudioButton";
// import { VideoButton } from "../live-components/video/VideoButton";
// import { ImageButton } from "../../lib/live-components/image/ImageButton";
import { VideoButton } from "../../form-components/video/VideoButton";
// import { DoughnutChartButton } from "../../form-components/chart/DoughnutChartButton";
import { ImageButton } from "../../form-components/image/ImageButton";
const ComponentHub = () => {
  const {
    visbilityState,
    toggleVisbilityState,
    animationState,
    toggleAnimationState,
  } = useComponentHub();

  return (
    visbilityState && (
      <>
        <motion.div
          initial={{ left: -320, opacity: 0, display: "block" }}
          animate={
            animationState
              ? { left: 320, opacity: 1, display: "block" }
              : { left: -320, opacity: 0 }
          }
          exit={{ left: -320, opacity: 0, display: "none" }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className={`comp-hub-data-fragment-container`}
        >
          <DivClass className={"center-comp-hub-component"}>
            <Button id="close-icon-wrapper" className={"close-icon-wrapper"}>
              <SVG
                className={"close-icon"}
                src="/close-icon.svg"
                alt="Close Icon"
                onClick={() => {
                  toggleAnimationState();
                  setTimeout(() => {
                    toggleVisbilityState();
                  }, 1500);
                }}
              />
            </Button>

            <motion.div
              // initial={{ x: 0, opacity: 0 }}
              // animate={{ x: 366, opacity: 1 }}
              // transition={{ duration: 0.5, ease: "easeInOut" }}
              className={"comp-hub-data-fragment-components"}
            >
              <ShortText className={"fragment-heading-text"}>
                Multi Media Fragments
              </ShortText>
              <TextButton />
              <LinkButton />
              <ImageButton />
              <ShortText className={"fragment-heading-text"}>
                Analytic Fragments - Track and visualize data
              </ShortText>
              {/* <DoughnutChartButton /> */}
              {/* <ImageButton /> */}
              {/* <AudioButton /> */}
              <ShortText className={"fragment-heading-text"}>
                Stream Fragments
              </ShortText>
              <VideoButton />
            </motion.div>
          </DivClass>
        </motion.div>
      </>
    )
  );
};

export default ComponentHub;
