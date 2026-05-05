// useEffect — removed alongside the dead loadedCount useEffect that was the only consumer
import { useParams } from "react-router-dom";
import { SpanFragment } from "../../ui/spanElement";
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import { useCanvasContext } from "../../form-components/canva-data-provider/CanvasDataContextProvider";
// import { TextFragment } from "../../../../../../ui/LongText";
import { DivClass } from "../../ui/Div";
import { EditWindow } from "../../modify-data/EditWindow";
import { ModificationWindow } from "../../modify-data/ModificationWindow";

import "./image-data-styling.css";
import "../i-menu-selector.css";
import { toast } from "react-toastify";

export const ImageCluster = ({ data }: { data: any }) => {
  const { userid, canvaid } = useParams();
  const { imagecluster, _id, type } = data;

  const {
    modificationWindow,
    selectedComp,
    setSelectedComp,
    editState,
    moveFragment,

    setModificationWindow,
  } = useModificationContext();

  const { setRepositionWindow } = useCanvasContext();

  const selectFragmentId = (e: React.MouseEvent<HTMLButtonElement>) => {
    const dataFragmentId = String((e.target as HTMLElement).id);

    setSelectedComp({
      dataFragmentId: dataFragmentId,
      type: type,
      info: "",
    });

    moveFragment(e);
  };
  const findThisImage = async (imageClusterId: string, imageName: string) => {
    try {
      const url = `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}/images/${imageClusterId}/reveal`;
      const findImageResponse = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: imageName }),
      });
      if (!findImageResponse.ok) {
        toast.error(`Could not find image: ${imageName}`);
      } else {
        toast.success(`Opened ${imageName} in file explorer`);
      }
    } catch (err) {
      console.error(`Failed to find image:`, err);
    }
  };
  return (
    <>
      {/* Modification Window*/}
      {modificationWindow && selectedComp.dataFragmentId === _id && (
        <ModificationWindow componentData={data} />
      )}

      {/* Edit Window */}
      {editState && selectedComp.dataFragmentId === _id && (
        <EditWindow componentData={data} />
      )}

      {/* Fragment Container */}
      <DivClass className={"image-fragment-container"}>
        <div id={`${_id}`} className={"image-fragment"}>
          <SpanFragment
            id={`${data._id}`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              selectFragmentId(e);
              setRepositionWindow(false);
              setModificationWindow(true);
            }}
            className="i-note-drop-down"
          >
            i
          </SpanFragment>
          {imagecluster.map((img: any, index: number) => (
            <div key={index}>
              {/* Image Data */}
              <p className="image-file-name">{img.name}</p>
              {/* button uses a rest api call,sending along the name of the image and the id of the image cluster, finding the name of the file in the file system and opening its file location in fiile explorer on all OS systems(app is multi-platform) */}
              <button
                className="image-reveal-btn"
                onClick={() => findThisImage(_id, img.name)}
              >
                {">"}
              </button>
            </div>
          ))}
        </div>
      </DivClass>
    </>
  );
};
