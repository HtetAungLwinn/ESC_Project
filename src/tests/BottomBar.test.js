// src/tests/BottomBar.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import BottomBar from "../component/BottomBar";


describe("BottomBar link tests", () => {
  test("GitHub link is correct", () => {
    render(<BottomBar />);
    const link = screen.getByLabelText(/Our GitHub/i);
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/HtetAungLwinn/ESC_Project"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("Project Info link is correct", () => {
    render(<BottomBar />);
    const link = screen.getByLabelText(/Project Information/i);
    expect(link).toHaveAttribute(
      "href",
      "https://docs.google.com/document/d/1on8n1vYThtapSlQAqC93wsbAQoGy2fpL/edit?tab=t.0"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("Team link is correct", () => {
    render(<BottomBar />);
    const link = screen.getByLabelText(/Team/i);
    expect(link).toHaveAttribute(
      "href",
      "https://docs.google.com/document/d/1-KWtZ7HPM20iWpeU0BRj78FDFrNoFd4QDiyKzwcR8Gw/edit?tab=t.0"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });
});
