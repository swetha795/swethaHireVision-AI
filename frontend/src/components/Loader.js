// Signature loading indicator styled as an "on-air" recording light
import React from "react";

const Loader = ({ label = "Loading" }) => (
  <div className="flex items-center gap-3 py-8 justify-center text-studio-muted font-mono text-sm">
    <span className="on-air-dot"></span>
    {label}...
  </div>
);

export default Loader;
