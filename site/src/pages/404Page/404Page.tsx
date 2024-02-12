import { type FC } from "react";

export const NotFoundPage: FC = () => {
  return (
    <div
      css={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        css={(theme) => ({
          margin: 8,
          padding: 8,
          borderRight: theme.palette.divider,
        })}
      >
        <h4>404</h4>
      </div>
      <p>该页面不存在。</p>
    </div>
  );
};

export default NotFoundPage;
