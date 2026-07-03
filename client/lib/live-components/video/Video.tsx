import { useState, useEffect } from "react";
import { SpanFragment } from "../../ui/spanElement";
import { DivClass } from "../../ui/Div";
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import { useCanvasContext } from "../../form-components/canva-data-provider/CanvasDataContextProvider";
import { EditWindow } from "../../modify-data/EditWindow";
import { ModificationWindow } from "../../modify-data/ModificationWindow";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./video-data-styling.css";
import "../i-menu-selector.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

export const Video = ({ data }: { data: any }) => {
  const { userid, canvaid } = useParams();
  const { _id, type } = data;

  // ===============================
  // NEW CODE — Manual load state (mirrors ImageCluster pattern).
  // Three state variables control the full load lifecycle:
  // blobUrl    = the finished object URL assigned to <video src> once downloaded.
  //              null until the user triggers a load. Cleaned up on unmount.
  // isVideoLoading = true while the fetch is in-flight. Shows the spinner overlay.
  // isLoaded   = true once the blob is ready. Collapses the overlay, reveals the player.
  //              Also acts as a guard to prevent double-firing on repeated clicks.
  // ===============================
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    modificationWindow,
    selectedComp,
    setSelectedComp,
    editState,
    moveFragment,
    setModificationWindow,
  } = useModificationContext();

  const { setRepositionWindow } = useCanvasContext();

  // ===============================
  // NEW CODE — Blob URL cleanup on unmount.
  // When this Video component is removed from the DOM (canvas navigated away,
  // fragment deleted, etc.), we revoke the object URL to free the memory it holds.
  // Without this, every loaded video leaves an unreleased Blob in browser memory
  // for the lifetime of the tab.
  // ===============================
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

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
  // NEW CODE — Manual load handler (mirrors ImageCluster's handleManualLoad).
  //
  // OLD APPROACH — what the browser did automatically and why it caused starvation:
  // The old <video src="${import.meta.env.VITE_API_URL}/..." crossOrigin="use-credentials" preload="metadata">
  // tag fired a browser-native HTTP request the moment the component mounted.
  // The browser opened a PERSISTENT range-stream connection (HTTP 206) to support
  // scrubbing, and held that connection slot open for the entire lifetime of the player.
  // With the browser's 6-connection-per-origin limit, even 2 videos on a canvas
  // could silently consume slots outside the ImageQueueContextProvider's control,
  // leaving fewer slots available for the image queue workers — starving ImageCluster
  // loads and causing large clusters (e.g. 66 images) to stall or partially fail.
  //
  // NEW APPROACH — what this function does instead:
  // Nothing fires on render. The user sees a "Load Video" button (same pattern as
  // ImageCluster's "Load X Images" button). On click:
  //   1. fetch() is called with credentials: "include" — this is the JavaScript-level
  //      equivalent of crossOrigin="use-credentials". The JWT cookie travels with the
  //      request identically. The server auth middleware sees no difference.
  //   2. The server streams the full file (HTTP 200, no range header sent).
  //   3. The connection closes naturally after the transfer completes — slot freed.
  //   4. A Blob object URL is created locally and assigned to <video src>.
  //      The browser plays and scrubs the video from the blob entirely — no further
  //      server connections needed at all. Zero slots held after load completes.
  // ===============================
  const handleManualLoad = async () => {
    // Guard: prevent double-firing if already loading or already done
    if (isVideoLoading || isLoaded) return;

    setIsVideoLoading(true);

    const url = `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}/video/${_id}`;

    try {
      // credentials: "include" sends the session cookie — same auth as crossOrigin="use-credentials"
      // but in fetch() form, matching how ImageCluster authenticates its image requests
      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "Not Authenticated") redirectToSignIn();

        toast.error(`${response.status}`);
      }
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);

      setBlobUrl(localUrl);
      setIsLoaded(true);
    } catch (e: any) {
      console.error("Video load failed:", e.message);
      toast.error("Video load failed: " + e.message);
    } finally {
      // Always release the loading state whether success or failure
      setIsVideoLoading(false);
    }
  };

  return (
    <>
      {/* Modification + Edit Windows */}
      {modificationWindow && selectedComp.dataFragmentId === _id && (
        <ModificationWindow componentData={data} />
      )}

      {editState && selectedComp.dataFragmentId === _id && (
        <EditWindow componentData={data} />
      )}

      {/* Fragment Container */}
      <DivClass className={"video-fragment-container"}>
        <div id={`${_id}`} className={"video-fragment"}>
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

          {/* ===============================
              OLD CODE — The original video element and why it was replaced:

              <video
                crossOrigin="use-credentials"
                className="video-element"
                controls
                preload="metadata"
                src={`${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}/video/${_id}`}
              />

              crossOrigin="use-credentials" — told the browser to include cookies on the
                request it fired automatically. Replaced by credentials: "include" in fetch().
              preload="metadata" — triggered an immediate browser-native connection on mount,
                before any user interaction. This is the slot-starvation entry point.
              src={direct URL} — handed control to the browser, which opened a persistent
                range-stream (HTTP 206) and held a connection slot open indefinitely.
              =============================== */}

          {/* NEW CODE — Manual trigger overlay (identical pattern to ImageCluster).
              If not loaded: show the overlay. Inside the overlay, toggle between
              the Load button (idle) and the Spinner (in-flight). */}
          {!isLoaded && (
            <div className="absolute inset-0 z-6 flex items-center h-40 w-65 justify-center bg-black/60 backdrop-blur-sm border border-[#FAAA0040] rounded-md animate-in fade-in duration-200">
              {isVideoLoading ? (
                /* Spinner — shown while fetch is in-flight */
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white text-xs font-medium tracking-widest uppercase">
                    Streaming...
                  </span>
                </div>
              ) : (
                /* Load button — shown on initial render, triggers the fetch */
                <button
                  onClick={handleManualLoad}
                  className="bg-neutral-800 border border-neutral-600 text-white px-3 py-1 text-[10px] uppercase tracking-wider hover:bg-neutral-700 transition-colors rounded"
                >
                  Load Video
                </button>
              )}
            </div>
          )}

          {/* Video player — only rendered once the blob URL is ready.
              src={blobUrl} means the browser plays entirely from local memory.
              No server connection is held. Scrubbing works natively on blob URLs. */}
          {isLoaded && blobUrl && (
            <video className="video-element" controls src={blobUrl} />
          )}
        </div>
      </DivClass>
    </>
  );
};
