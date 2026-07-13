import { useCanvasFragmentData } from "./CanvasFragmentDataContext";
import { Text } from "../live-components/text/Text";
// import { ImmutableList } from "../absolute-data-components/TextList";
// import { ImmutableAudio } from "../absolute-data-components/TextAudio";
// import { Image } from "../absolute-data-components/Image";
// import { ImmutableVideo } from "../absolute-data-components/Text/Video";
import ShortText from "../ui/ShortText";
import DoughnutChart from "../live-components/doughnutchart/DoughnutChart";
import TextLink from "../live-components/link/TextLink";
import { Video } from "../live-components/video/Video";
import { ImageCluster } from "../live-components/image/Image";
import { Table } from "../live-components/table/Table";
import DraggableFragment from "./DraggableFragment";
const CanvasData = () => {
  // Display all workspace data including text, list, audio, image, video once submitted
  const { canvasData } = useCanvasFragmentData();

  const renderDataByComponentType = (data: any) => {
    switch (data.type) {
      case "Text":
        return <Text data={data} />;
      case "TextLink":
        return <TextLink data={data} />;
      // case "list":
      //   return <ImmutableList data={data} />;
      // case "listitem":
      //   return <ImmutableList data={data} />;
      case "Images":
        return <ImageCluster data={data} />;
      case "Video":
        return <Video data={data} />;
      // case "Audio":
      // return <Audio data={data} />;

      case "Table":
        return <Table data={data} />;
      //Analytic Data Structures
      case "DoughnutChart":
        return <DoughnutChart data={data} />;
      default:
        return (
          <ShortText className={"unsupported-type-text"}>
            Unsupported Type
          </ShortText>
        );
    }
  };
  const workspaceInformation =
    canvasData && canvasData.data?.workspaceNameData?.workspaceData;
  //separate the data for easier code management and put them into a single array known as components and loop once
  const textData = workspaceInformation?.texts || [];
  const chartData = workspaceInformation?.charts || [];
  const linkData = workspaceInformation?.links || [];
  const videoData = workspaceInformation?.videos || [];
  const imageData = workspaceInformation?.images || [];
  const tableData = workspaceInformation?.tables || [];

  //old code that needs to be refactored to accomodate new data structure for charts and other components. Refactor this in one day max including testing.
  const components = [
    ...textData,
    ...chartData,
    ...linkData,
    ...videoData,
    ...imageData,
    ...tableData,
  ];
  const userData = components.map((data: any) => {
    return (
      <DraggableFragment key={data._id} data={data}>
        {renderDataByComponentType(data)}
      </DraggableFragment>
    );
  });
  const noWorkspaceData = canvasData?.code === "NO_EXISTING_DATA" && (
    // add the chartcontext here which will track which draggable chart is selected ??????????
    <p>{canvasData?.message}</p>
  );
  return <div>{canvasData?.length === 0 ? noWorkspaceData : userData}</div>;
};

export default CanvasData;
