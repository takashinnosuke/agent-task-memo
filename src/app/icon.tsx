import { ImageResponse } from "next/og";

export const size = {
  width: 96,
  height: 96,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 30% 30%, #f97316, #1f2937)",
          color: "#f9fafb",
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        AM
      </div>
    ),
    {
      ...size,
    }
  );
}
