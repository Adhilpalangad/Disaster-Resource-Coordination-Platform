import React from "react";

interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  count?: number;
  style?: React.CSSProperties;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  height = "20px",
  width = "100%",
  count = 1,
  style = {},
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width,
            backgroundColor: "#E2E8F0",
            borderRadius: "8px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;
