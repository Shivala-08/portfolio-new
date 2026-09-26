import { ImageResponse } from "next/og";

/**
 * Generated social card (1200×630). Drawn with system fonts only so the build
 * never depends on fetching webfonts — the card renders offline, deterministically.
 */
export const runtime = "edge";

export const alt = "47 Tabs Open — portfolio of Pallav Dholariya, AI/ML Engineer and Systems Builder";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "80px 96px",
          backgroundColor: "#f4f1ea",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8c3b2e",
          }}
        >
          47 tabs open
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 84,
            lineHeight: 1.05,
            color: "#26231f",
          }}
        >
          Pallav Dholariya
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            color: "#6b6459",
          }}
        >
          AI/ML Engineer · Systems Builder
        </div>
        <div
          style={{
            marginTop: 36,
            fontFamily: "monospace",
            fontSize: 24,
            color: "#8a8478",
          }}
        >
          deployment infra · custom webgl · measured numbers
        </div>
      </div>
    ),
    { ...size },
  );
}
