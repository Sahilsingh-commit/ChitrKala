import React, { useState, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function ListingForm({ onGenerateListing, isLoading }) {
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [enhanceLighting, setEnhanceLighting] = useState("true");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [buildTime, setBuildTime] = useState("1–3 days");
  const [isHandmade, setIsHandmade] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          setVoiceStatus("done");
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setVoiceStatus("recording");
      } catch (err) {
        setVoiceStatus("error");
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((tTrack) => tTrack.stop());
      }
      setIsRecording(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile && !audioBlob) {
      alert(t("provideImageOrVoice"));
      return;
    }
    onGenerateListing({ imageFile, audioBlob, bgColor, enhanceLighting, expectedPrice, buildTime, isHandmade });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">{t("newListingTitle")}</div>
          <div className="card-subtitle">
            {t("newListingSubtitle")}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          {/* ── Left Column ── */}
          <div>
            <p className="section-label">{t("productPhoto") || "Product Photo"}</p>

            {/* Image Upload */}
            <div className="field">
              <label className="field-label">{t("photo") || "Photo"}</label>
              {previewUrl ? (
                <div>
                  <div className="image-preview-container" style={{ marginBottom: 10 }}>
                    <img src={previewUrl} alt="Product preview" />
                  </div>
                  <label
                    htmlFor="imageInput"
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: "pointer" }}
                  >
                    {t("changePhoto")}
                  </label>
                </div>
              ) : (
                <label htmlFor="imageInput" className="file-upload-label">
                  <span className="upload-icon">📷</span>
                  <span style={{ fontWeight: 600 }}>{t("dropPhoto") || "Drop product photo here"}</span>
                  <span style={{ fontSize: "0.75rem" }}>JPG, PNG up to 25MB</span>
                </label>
              )}
              <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} />
            </div>

            <p className="section-label" style={{ marginTop: 8 }}>{t("studioSettings") || "Studio Settings"}</p>

            <div className="field">
              <label className="field-label">{t("background")}</label>
              <select value={bgColor} onChange={(e) => setBgColor(e.target.value)}>
                <option value="#FFFFFF">{t("pureWhite")}</option>
                <option value="#FAFAF7">{t("warmCream")}</option>
                <option value="transparent">{t("transparentPng")}</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">{t("lighting")}</label>
              <select value={enhanceLighting} onChange={(e) => setEnhanceLighting(e.target.value)}>
                <option value="true">{t("studioEnhancement")}</option>
                <option value="false">{t("originalLighting")}</option>
              </select>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div>
            <p className="section-label">{t("voiceDescription") || "Voice Description"}</p>

            {/* Recorder */}
            <div className="field">
              <label className="field-label">{t("voiceNoteLabel") || "Voice Note (Any Regional Language)"}</label>
              <div className={`recorder-box${isRecording ? " recording" : ""}`}>
                {isRecording ? (
                  <>
                    <div className="recorder-visualizer">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="recorder-bar recording-bar" />
                      ))}
                    </div>
                    <div className="recorder-status" style={{ color: "#ef4444" }}>
                      Listening... speak in Hindi, Marathi, or any language
                    </div>
                  </>
                ) : voiceStatus === "done" ? (
                  <div style={{ fontSize: "0.8125rem", color: "var(--success)", fontWeight: 600 }}>
                    ✓ Voice note captured
                  </div>
                ) : (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Press record and describe your product
                  </div>
                )}

                <button
                  type="button"
                  className={`btn ${isRecording ? "btn-recording" : "btn-secondary"} btn-sm`}
                  style={{ marginTop: 12 }}
                  onClick={handleToggleRecording}
                >
                  {isRecording ? `⏹ ${t("stopRecord")}` : `⏺ ${t("recordVoice")}`}
                </button>
              </div>

              {audioUrl && (
                <audio src={audioUrl} controls style={{ width: "100%", marginTop: 10, height: 36 }} />
              )}
            </div>

            <p className="section-label" style={{ marginTop: 8 }}>{t("pricingSignals") || "Pricing Signals"}</p>

            <div className="field">
              <label className="field-label">{t("expectedPrice")}</label>
              <input
                type="number"
                placeholder="Optional — e.g. 5000"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                min="0"
              />
              <div className="field-hint">{t("expectedPriceHint")}</div>
            </div>

            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field">
                <label className="field-label">{t("buildTime")}</label>
                <select value={buildTime} onChange={(e) => setBuildTime(e.target.value)}>
                  <option value="Under 1 day">Under 1 day</option>
                  <option value="1–3 days">1–3 days</option>
                  <option value="4–7 days">4–7 days</option>
                  <option value="Over 1 week">Over 1 week</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">{t("craftsmanship")}</label>
                <div
                  className={`toggle-wrapper${isHandmade ? " active" : ""}`}
                  onClick={() => setIsHandmade((v) => !v)}
                >
                  <div className="toggle-switch" />
                  <span className="toggle-text">
                    {isHandmade ? t("fullyHandmade") : t("machineAssisted")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="hr" />

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner" />
              {t("generatingBtn")}
            </>
          ) : (
            t("generateBtn")
          )}
        </button>
      </form>
    </div>
  );
}
