import React, { useState } from "react";
import "./index.css";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";

export default function App() {
  const [selected, setSelected] = useState(null); // { name, idx }

  function handleSelect(name, idx) {
    setSelected({ name, idx });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {selected ? (
        <Profile
          name={selected.name}
          paletteIdx={selected.idx}
          onBack={handleBack}
        />
      ) : (
        <Dashboard onSelect={handleSelect} />
      )}
    </>
  );
}
