import { DivClass } from "../../../../../../lib/ui/Div";
import "./data-container.css";
import TextInputUnit from "../../../../../../lib/form-components/text/TextInputUnit";
import { useCanvasFragmentData } from "../../../../../../lib/canvas-data/CanvasFragmentDataContext";
import { useFormComponentToggle } from "../../../../../../lib/form-components/FormComponentToggleContext";
import CanvasData from "../../../../../../lib/canvas-data/CanvasData";
import ReadingPage from "../../../../../../lib/components/perception/ReadingPage";
// import AudioInputUnit from "./form-components/audio/AudioInputUnit";
import DoughnutChartInputUnit from "../../../../../../lib/form-components/chart/DoughnutChartInputUnit";
import TextLinkInputUnit from "../../../../../../lib/form-components/link/LinkInputUnit";
import VideoInputUnit from "../../../../../../lib/form-components/video/VideoInputUnit";
import ImageInputUnit from "../../../../../../lib/form-components/image/ImageInputUnit";
import TableInputUnit from "../../../../../../lib/form-components/table/TableInputUnit";
import { redirectToSignIn } from "../../../../../../lib/auth-redirect/AuthRedirectContext";
import CanvasViewport from "../../../../../../lib/CanvasHub/CanvasViewport/CanvasViewport";
// import { ImageQueueProvider } from "../../../../../../lib/Providers/ImageQueueContextProvider";
const CanvaContainer = () => {
  const { canvasData } = useCanvasFragmentData();
  const { dataScrollBoardRef } = useFormComponentToggle();
  if (canvasData.message === "Not Authenticated") {
    redirectToSignIn();
  } else {
    //no redirect required; render the canvas normally
  }
  return (
    <DivClass className={"data-container"}>
      <div className={"data-scroll-board"} ref={dataScrollBoardRef}>
        <ReadingPage />
        <CanvasViewport>
          {/* Form-component input units live inside the viewport so
              they inherit the world transform: they zoom + pan with
              the canvas and drag via world coordinates, matching the
              live fragments they will become on submit. */}
          <TextInputUnit />
          <DoughnutChartInputUnit />
          <TextLinkInputUnit />
          {/* <AudioInputUnit params={params} /> */}
          <ImageInputUnit />
          <VideoInputUnit />
          <TableInputUnit />

          <CanvasData />
        </CanvasViewport>
      </div>
    </DivClass>
  );
};

export default CanvaContainer;
