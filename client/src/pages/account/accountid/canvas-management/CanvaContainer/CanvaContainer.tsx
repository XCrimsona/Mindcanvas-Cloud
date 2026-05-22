import { DivClass } from "../../../../../../lib/ui/Div";
import "./data-container.css";
import TextInputUnit from "../../../../../../lib/form-components/text/TextInputUnit";
import { useCanvasContext } from "../../../../../../lib/form-components/canva-data-provider/CanvasDataContextProvider";
import CanvasData from "../../../../../../lib/canvas-data/CanvasData";
import RepositionLiveData from "../../../../../../lib/form-components/mediaReposition/RepositionLiveData";
import ReadingPage from "../../../../../../lib/components/perception/ReadingPage";
// import AudioInputUnit from "./form-components/audio/AudioInputUnit";
import DoughnutChartInputUnit from "../../../../../../lib/form-components/chart/DoughnutChartInputUnit";
import TextLinkInputUnit from "../../../../../../lib/form-components/link/LinkInputUnit";
import VideoInputUnit from "../../../../../../lib/form-components/video/VideoInputUnit";
import ImageInputUnit from "../../../../../../lib/form-components/image/ImageInputUnit";
// import { ImageQueueProvider } from "../../../../../../lib/Providers/ImageQueueContextProvider";
const CanvaContainer = () => {
  const { dataScrollBoardRef, canvasData } = useCanvasContext();
  const canvaspaceSize = canvasData.data?.workspaceNameData?.canvaspace?.size;
  return (
    <DivClass className={"data-container"}>
      <div
        className={"data-scroll-board"}
        ref={dataScrollBoardRef}
        style={{
          width: `${canvaspaceSize?.width}px`,
          height: `${canvaspaceSize?.height}px`,
          transition: "height .2s ease-in-out, width .2s ease-in-out",
        }}
      >
        {/* Below InputUnits used for multi media submits */}
        <TextInputUnit />
        <DoughnutChartInputUnit />
        <TextLinkInputUnit />
        {/* <AudioInputUnit params={params} /> */}
        <ImageInputUnit />
        <VideoInputUnit />

        <RepositionLiveData />
        <ReadingPage />
        <CanvasData />
      </div>
    </DivClass>
  );
};

export default CanvaContainer;
