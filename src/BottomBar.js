// src/BottomBar.js
import React from "react";
import { Github, Info, Users } from "lucide-react";

export default function BottomBar() {
  return (
    <footer className="bottom-bar">
      {/* Our GitHub */}
      <div className="bottom-box">
        <h3>
          <a
            href="https://github.com/HtetAungLwinn/ESC_Project"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Our GitHub"
          >
            <Github size={32} />
          </a>
        </h3>
        <p>Check out our source code.</p>
      </div>

      {/* Project Info */}
      <div className="bottom-box">
        <h3>
          <a
            href="https://docs.google.com/document/d/1on8n1vYThtapSlQAqC93wsbAQoGy2fpL/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Project Information"
          >
            <Info size={32} />
          </a>
        </h3>
        <p>Project details, architecture, and docs.</p>
      </div>

      {/* Team */}
      <div className="bottom-box">
        <h3>
          <a
            href="https://docs.google.com/document/d/1-KWtZ7HPM20iWpeU0BRj78FDFrNoFd4QDiyKzwcR8Gw/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Team"
          >
            <Users size={32} />
          </a>
        </h3>
        <p>Website development plans and team details.</p>
      </div>
    </footer>
  );
}
