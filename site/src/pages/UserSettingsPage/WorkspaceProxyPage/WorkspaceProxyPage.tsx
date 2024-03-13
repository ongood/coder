import type { FC } from "react";
import { useProxy } from "contexts/ProxyContext";
import { Section } from "../Section";
import { WorkspaceProxyView } from "./WorkspaceProxyView";

export const WorkspaceProxyPage: FC = () => {
  const description =
    "工作区代理改善了对工作区的终端和 Web 应用程序连接的性能。";

  const {
    proxyLatencies,
    proxies,
    error: proxiesError,
    isFetched: proxiesFetched,
    isLoading: proxiesLoading,
    proxy,
  } = useProxy();

  return (
    <Section
      title="工作区代理"
      css={(theme) => ({
        "& code": {
          background: theme.palette.divider,
          fontSize: 12,
          padding: "2px 4px",
          color: theme.palette.text.primary,
          borderRadius: 2,
        },
      })}
      description={description}
      layout="fluid"
    >
      <WorkspaceProxyView
        proxyLatencies={proxyLatencies}
        proxies={proxies}
        isLoading={proxiesLoading}
        hasLoaded={proxiesFetched}
        getWorkspaceProxiesError={proxiesError}
        preferredProxy={proxy.proxy}
      />
    </Section>
  );
};

export default WorkspaceProxyPage;
