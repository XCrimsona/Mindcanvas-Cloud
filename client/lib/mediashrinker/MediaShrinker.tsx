import { useState } from "react";
import { useParams } from "react-router-dom";
// import io from "socket.io-client";

export const MediaShrinkUI = () => {
  const [type, setType] = useState("video");
  const [path, setPath] = useState("");
  const [status, setStatus] = useState("Idle");
  const progress = "";

  const { userId, canvasId } = useParams();
  // useEffect(() => {
  // const socket = io("http://localhost:5176");
  // socket.on("shrink-progress", (data: any) => {
  //   setStatus("Processing...");
  //   setProgress(data.stats); // You can regex this for % if needed
  // });
  // return () => socket.disconnect();
  // }, []);

  const shrinkProcess = async () => {
    setStatus("Initializing...");
    const res = await fetch(
      `http://localhost:5176/api/account/${userId}/canvas-management/${canvasId}/media-shrink`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, filePath: path }),
      },
    );
    const data = await res.json();
    if (data.success) setStatus("Complete: " + data.newPath);
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ color: "#FABB00", marginBottom: "15px" }}>
        Media Shrink Utility
      </h3>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={inputStyle}
      >
        <option value="video">Video (Top Voice/Sight)</option>
        <option value="audio">Audio (Top Voice)</option>
        <option value="image">Image Cluster (WebP/AVIF)</option>
      </select>

      <input
        type="text"
        placeholder="Full OS Path to File..."
        value={path}
        onChange={(e) => setPath(e.target.value)}
        style={inputStyle}
      />

      <button onClick={shrinkProcess} style={buttonStyle}>
        Execute Shrink
      </button>

      <div style={statusStyle}>
        <p style={{ color: "rgba(250, 187, 0, 0.8)" }}>Status: {status}</p>
        <code style={{ fontSize: "10px", color: "#555" }}>
          {progress.substring(0, 100)}...
        </code>
      </div>
    </div>
  );
};

// --- AESTHETIC STYLES ---
const containerStyle = {
  backgroundColor: "#000000",
  padding: "20px",
  zIndex: 4,
  border: "2px solid rgba(250, 187, 0, 0.25)",
  boxShadow: "0px 0px 4px 2px rgba(250, 187, 0, 0.25)",
  borderRadius: "4px",
  display: "flex",
  gap: "10px",
  width: "350px",
};

const inputStyle = {
  backgroundColor: "#111",
  border: "1px solid rgba(250, 187, 0, 0.5)",
  color: "white",
  padding: "8px",
  borderRadius: "4px",
};

const buttonStyle = {
  backgroundColor: "rgba(250, 187, 0, 0.2)",
  color: "#FABB00",
  border: "1px solid #FABB00",
  padding: "10px",
  cursor: "pointer",
  borderRadius: "4px",
  fontWeight: "bold",
};

const statusStyle = {
  marginTop: "10px",
  padding: "10px",
  borderTop: "1px solid #333",
};
