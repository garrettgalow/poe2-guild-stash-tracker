import { jsxs, jsx } from "react/jsx-runtime";
import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { useDropzone } from "react-dropzone";
function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      console.log("Upload successful:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"]
    },
    multiple: false
  });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ...getRootProps(),
      className: `p-8 border-2 border-dashed rounded-lg text-center
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`,
      children: [
        /* @__PURE__ */ jsx("input", { ...getInputProps() }),
        uploading ? /* @__PURE__ */ jsx("p", { children: "Uploading..." }) : isDragActive ? /* @__PURE__ */ jsx("p", { children: "Drop the CSV file here..." }) : /* @__PURE__ */ jsx("p", { children: "Drag and drop a CSV file here, or click to select one" }),
        error && /* @__PURE__ */ jsx("p", { className: "text-red-500 mt-2", children: error })
      ]
    }
  );
}
function App() {
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", children: "PoE2 Stash Analytics" }),
    /* @__PURE__ */ jsx(FileUpload, {})
  ] });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(App, {}) })
);
