import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CameraModal — opens the device's webcam, lets you take a snapshot,
 * and returns it as a File object via onCapture(file, previewUrl).
 *
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   onCapture — (file: File, previewUrl: string) => void
 */
const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [captured, setCaptured] = useState(null); // data URL after snapshot
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("user"); // user = front, environment = back

  // ── Start camera when modal opens ─────────────────────────────────────────
  const startCamera = async (facing = facingMode) => {
    setError("");
    setCaptured(null);
    setReady(false);
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setReady(true);
        };
      }
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "❌ Camera permission denied. Please allow camera access in browser settings."
          : err.name === "NotFoundError"
          ? "❌ No camera found on this device."
          : `❌ Camera error: ${err.message}`
      );
    }
  };

  // ── Stop camera ────────────────────────────────────────────────────────────
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setReady(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setCaptured(null);
      setError("");
    }
    return () => stopCamera();
  }, [isOpen]);

  // ── Take snapshot ──────────────────────────────────────────────────────────
  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Mirror front camera so the preview matches natural orientation
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
  };

  // ── Retake ─────────────────────────────────────────────────────────────────
  const retake = () => {
    setCaptured(null);
    startCamera(facingMode);
  };

  // ── Flip camera ────────────────────────────────────────────────────────────
  const flipCamera = async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await startCamera(next);
  };

  // ── Confirm: convert canvas data URL → File, pass to parent ───────────────
  const confirmPhoto = () => {
    canvasRef.current.toBlob(
      (blob) => {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        onCapture(file, captured);
        stopCamera();
        onClose();
      },
      "image/jpeg",
      0.92
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) { stopCamera(); onClose(); } }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-black italic text-slate-800 text-lg">📷 Take Photo</h2>
            <button
              onClick={() => { stopCamera(); onClose(); }}
              className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none"
            >
              ✕
            </button>
          </div>

          {/* Camera view */}
          <div className="relative bg-black aspect-video flex items-center justify-center">
            {error ? (
              <div className="text-center px-6 py-10 text-white space-y-3">
                <p className="text-sm italic">{error}</p>
                <button onClick={() => startCamera(facingMode)} className="btn-gold text-sm">
                  Try Again
                </button>
              </div>
            ) : captured ? (
              /* Snapshot preview */
              <img src={captured} alt="snapshot" className="w-full h-full object-contain" />
            ) : (
              /* Live camera feed */
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Hidden canvas for snapshot */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-50">
            {captured ? (
              /* After snapshot: Retake or Use Photo */
              <>
                <button
                  onClick={retake}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-sm font-bold italic hover:bg-slate-300 transition"
                >
                  ↺ Retake
                </button>
                <button onClick={confirmPhoto} className="btn-gold px-8 py-2.5 text-sm">
                  ✓ Use This Photo
                </button>
              </>
            ) : (
              /* Live: Flip + Capture */
              <>
                <button
                  onClick={flipCamera}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-sm font-bold italic hover:bg-slate-300 transition"
                  title="Flip camera"
                >
                  🔄 Flip
                </button>
                <button
                  onClick={takeSnapshot}
                  disabled={!ready}
                  className="w-16 h-16 rounded-full bg-white border-4 border-slate-800 flex items-center justify-center shadow-lg hover:scale-105 transition disabled:opacity-40"
                  title="Take photo"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800" />
                </button>
                <div className="w-16" /> {/* spacer */}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraModal;
