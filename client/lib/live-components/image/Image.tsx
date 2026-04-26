import { useState } from "react";
import { useParams } from "react-router-dom";
import { SpanFragment } from "../../ui/spanElement";
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import { useCanvasContext } from "../../form-components/canva-data-provider/CanvasDataContextProvider";
// import { TextFragment } from "../../../../../../ui/LongText";
import { DivClass } from "../../ui/Div";
import { EditWindow } from "../../modify-data/EditWindow";
import { ModificationWindow } from "../../modify-data/ModificationWindow";

import "./image-data-styling.css";
// import Button from "../../../../../../components/form-elements/Button";
import { toast } from "react-toastify";

export const ImageCluster = ({ data }: { data: any }) => {
  const { userid, canvaid } = useParams();
  const { imagecluster, _id, type } = data;

  // Single state object to track all loaded blob URLs for this cluster
  const [blobRegistry, setBlobRegistry] = useState<{ [key: string]: string }>(
    {},
  );

  // NEW: Master loading state for the entire cluster window
  const [isClusterLoading, setIsClusterLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Track if data has been fetched
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

  // ===============================
  // MANUAL LOAD HANDLER
  // ===============================
  const handleManualLoad = async (clusterId: string) => {
    // Prevent double-firing if already loading or loaded
    if (isClusterLoading || isLoaded) return;

    // console.log(`Starting manual I/O for Cluster: ${clusterId}`);
    setIsClusterLoading(true);

    const batchSize = 6;
    const items = [...imagecluster];

    //CHECK POINT----media must first be shrinked before they get processed in the streams
    //If is not not done, then browser load workers hit loading caps fast and throw errors in loading the videos and images
    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const currentBatch = items.slice(i, i + batchSize);

        await Promise.all(
          currentBatch.map(async (img: any) => {
            const url = `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}/images/${img._id}`;

            const response = await fetch(url, { credentials: "include" });
            if (!response.ok) throw new Error("Fetch failed");

            const blob = await response.blob();
            const localUrl = URL.createObjectURL(blob);

            const tempImg = new Image();
            tempImg.src = localUrl;
            await tempImg.decode();

            setBlobRegistry((prev) => ({ ...prev, [img._id]: localUrl }));
          }),
        );
      }
      setIsLoaded(true);
    } catch (e: any) {
      console.log(e.message);

      console.error("Manual load failed", e.message);
      toast.error("Cluster load failed: ", e.message);
    } finally {
      setIsClusterLoading(false);
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
        <div
          id={`${_id}`}
          className={
            "image-fragment flex flex-wrap justify-start gap-0.5 rounded"
          }
        >
          {/* FEATURE ADDED: Manual Trigger Overlay */}
          {/* Logic: If not loaded, show this layer. Inside, toggle between the Button and the Spinner */}
          {!isLoaded && (
            <div className="absolute inset-0 z-6 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded animate-in fade-in duration-200">
              {isClusterLoading ? (
                /* The Loading Spinner (Your existing structure) */
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-white text-xs font-medium tracking-widest uppercase">
                    Streaming...
                  </span>
                </div>
              ) : (
                /* The Manual Load Button (New Trigger) */
                <button
                  onClick={() => handleManualLoad(_id)}
                  className="bg-neutral-800 border border-neutral-600 text-white px-3 py-1 text-[10px] uppercase tracking-wider hover:bg-neutral-700 transition-colors rounded"
                >
                  Load {imagecluster.length} Images
                </button>
              )}
            </div>
          )}
          <SpanFragment
            id={`${data._id}`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              selectFragmentId(e);
              setRepositionWindow(false);
              setModificationWindow(true);
              //style={{
              //  problem with below line: once toggle all would be fixed. Id ref require dto make fixed position
              //  position: `${pinnedText === true ? "fixed" : "absolute"}`,
              //}}
            }}
            className="i-note-drop-down"
          >
            i
          </SpanFragment>
          {/* <div className="flex flex-1 flex-wrap overflow-y-auto gap-1 rounded"> */}
          {imagecluster.map((img: any, index: number) => (
            <div key={index}>
              {/* Actual Video */}
              {blobRegistry[img._id] ? (
                <img
                  src={blobRegistry[img._id]}
                  className={`w-50 object-cover animate-in duration-300 transition-all`}
                  alt=""
                  loading="lazy"
                />
              ) : (
                /* FEATURE ADDED: Placeholder box to maintain grid shape before load */
                <div className="w-50 h-7.5 bg-neutral-900/50 border border-neutral-800 flex items-center justify-center">
                  <span className="text-[8px] text-neutral-600">...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </DivClass>
    </>
  );
};
