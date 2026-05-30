import { useEffect, useState } from "react";
import { globalStyles } from "./styles";
import IntroScreen from "./components/IntroScreen";
import ShootingScreen from "./components/ShootingScreen";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultScreen from "./components/ResultScreen";

const SESSION_KEY = "photoframe_session_v1";

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [photos, setPhotos] = useState([]);
  const [filterKey, setFilterKey] = useState("natural");
  const [stripUrl, setStripUrl] = useState(null);
  const [frameKey, setFrameKey] = useState("classic");

  // Restore last result session after reload (temporary storage).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s || s.screen !== "result" || !s.stripUrl) return;
      setPhotos(Array.isArray(s.photos) ? s.photos : []);
      setFilterKey(typeof s.filterKey === "string" ? s.filterKey : "natural");
      setFrameKey(typeof s.frameKey === "string" ? s.frameKey : "classic");
      setStripUrl(s.stripUrl);
      setScreen("result");
    } catch {
      // ignore
    }
  }, []);

  // Persist session while on result screen.
  useEffect(() => {
    try {
      if (screen !== "result" || !stripUrl) return;
      const payload = { screen, photos, filterKey, frameKey, stripUrl };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota / blocked storage
    }
  }, [screen, photos, filterKey, frameKey, stripUrl]);

  const handleStart = () => setScreen("shoot");

  const handleComplete = (pics, fk) => {
    setPhotos(pics);
    setFilterKey(fk);
    setScreen("processing");
  };

  const handleStripReady = (url) => {
    setStripUrl(url);
    setScreen("result");
  };

  const handleNew = () => {
    setPhotos([]);
    setStripUrl(null);
    setFilterKey("natural");
    setFrameKey("classic");
    setScreen("intro");
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="noise-overlay" aria-hidden="true" />
      {screen === "intro" && <IntroScreen onStart={handleStart} />}
      {screen === "shoot" && <ShootingScreen onBack={() => setScreen("intro")} onComplete={handleComplete} />}
      {screen === "processing" && (
        <ProcessingScreen
          photos={photos}
          filterKey={filterKey}
          frameKey={frameKey}
          onDone={handleStripReady}
        />
      )}
      {screen === "result" && stripUrl && (
        <ResultScreen
          photos={photos}
          filterKey={filterKey}
          stripUrl={stripUrl}
          frameKey={frameKey}
          onFrameChange={setFrameKey}
          onStripUrlChange={setStripUrl}
          onNew={handleNew}
        />
      )}
    </>
  );
}
