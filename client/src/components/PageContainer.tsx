import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = "100%",
  style = {},
}) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: maxWidth,
        margin: "0 auto",
        padding: "24px 32px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
