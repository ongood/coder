import { css, type Interpolation, type Theme, useTheme } from "@emotion/react";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import { visuallyHidden } from "@mui/utils";
import { type FC, type ReactNode, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type * as TypesGen from "api/typesGenerated";
import { Abbr } from "components/Abbr/Abbr";
import { ExternalImage } from "components/ExternalImage/ExternalImage";
import { displayError } from "components/GlobalSnackbar/utils";
import { CoderIcon } from "components/Icons/CoderIcon";
import { Latency } from "components/Latency/Latency";
import { useAuthenticated } from "contexts/auth/RequireAuth";
import type { ProxyContextValue } from "contexts/ProxyContext";
import { BUTTON_SM_HEIGHT, navHeight } from "theme/constants";
import { UserDropdown } from "./UserDropdown/UserDropdown";

export const USERS_LINK = `/users?filter=${encodeURIComponent(
  "status:active",
)}`;

export interface NavbarViewProps {
  logo_url?: string;
  user?: TypesGen.User;
  buildInfo?: TypesGen.BuildInfoResponse;
  supportLinks?: readonly TypesGen.LinkConfig[];
  onSignOut: () => void;
  canViewAuditLog: boolean;
  canViewDeployment: boolean;
  canViewAllUsers: boolean;
  canViewHealth: boolean;
  proxyContextValue?: ProxyContextValue;
}

export const Language = {
  workspaces: "空间",
  templates: "模板",
  users: "用户",
  audit: "日志",
  deployment: "部署",
}

interface NavItemsProps {
  children?: ReactNode;
  className?: string;
  canViewAuditLog: boolean;
  canViewDeployment: boolean;
  canViewAllUsers: boolean;
  canViewHealth: boolean;
}

const NavItems: FC<NavItemsProps> = ({
  className,
  canViewAuditLog,
  canViewDeployment,
  canViewAllUsers,
  canViewHealth,
}) => {
  const location = useLocation();
  const theme = useTheme();

  return (
    <nav className={className}>
      <NavLink
        css={[
          styles.link,
          location.pathname.startsWith("/@") && {
            color: theme.palette.text.primary,
            fontWeight: 500,
          },
        ]}
        to="/workspaces"
      >
        {Language.workspaces}
      </NavLink>
      <NavLink css={styles.link} to="/templates">
        {Language.templates}
      </NavLink>
      {canViewAllUsers && (
        <NavLink css={styles.link} to={USERS_LINK}>
          {Language.users}
        </NavLink>
      )}
      {canViewAuditLog && (
        <NavLink css={styles.link} to="/audit">
          {Language.audit}
        </NavLink>
      )}
      {canViewDeployment && (
        <NavLink css={styles.link} to="/deployment/general">
          {Language.deployment}
        </NavLink>
      )}
      {canViewHealth && (
        <NavLink css={styles.link} to="/health">
          健康
        </NavLink>
      )}
    </nav>
  );
};

export const NavbarView: FC<NavbarViewProps> = ({
  user,
  logo_url,
  buildInfo,
  supportLinks,
  onSignOut,
  canViewAuditLog,
  canViewDeployment,
  canViewAllUsers,
  canViewHealth,
  proxyContextValue,
}) => {
  const theme = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <nav
      css={{
        height: navHeight,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <div css={styles.wrapper}>
        <IconButton
          aria-label="Open menu"
          css={styles.mobileMenuButton}
          onClick={() => {
            setIsDrawerOpen(true);
          }}
          size="large"
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="left"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <div css={{ width: 250 }}>
            <div css={styles.drawerHeader}>
              <div css={[styles.logo, styles.drawerLogo]}>
                {logo_url ? (
                  <ExternalImage src={logo_url} alt="Custom Logo" />
                ) : (
                  <CoderIcon />
                )}
              </div>
            </div>
            <NavItems
              canViewAuditLog={canViewAuditLog}
              canViewDeployment={canViewDeployment}
              canViewAllUsers={canViewAllUsers}
              canViewHealth={canViewHealth}
            />
          </div>
        </Drawer>

        <NavLink css={styles.logo} to="/workspaces">
          {logo_url ? (
            <ExternalImage src={logo_url} alt="Custom Logo" />
          ) : (
            <CoderIcon fill="white" opacity={1} width={125} />
          )}
        </NavLink>

        <NavItems
          css={styles.desktopNavItems}
          canViewAuditLog={canViewAuditLog}
          canViewDeployment={canViewDeployment}
          canViewAllUsers={canViewAllUsers}
          canViewHealth={canViewHealth}
        />

        <div css={styles.navMenus}>
          {proxyContextValue && (
            <ProxyMenu proxyContextValue={proxyContextValue} />
          )}
          {user && (
            <UserDropdown
              user={user}
              buildInfo={buildInfo}
              supportLinks={supportLinks}
              onSignOut={onSignOut}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

interface ProxyMenuProps {
  proxyContextValue: ProxyContextValue;
}

const ProxyMenu: FC<ProxyMenuProps> = ({ proxyContextValue }) => {
  const theme = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [refetchDate, setRefetchDate] = useState<Date>();
  const selectedProxy = proxyContextValue.proxy.proxy;
  const refreshLatencies = proxyContextValue.refetchProxyLatencies;
  const closeMenu = () => setIsOpen(false);
  const navigate = useNavigate();
  const latencies = proxyContextValue.proxyLatencies;
  const isLoadingLatencies = Object.keys(latencies).length === 0;
  const isLoading = proxyContextValue.isLoading || isLoadingLatencies;
  const { permissions } = useAuthenticated();

  const proxyLatencyLoading = (proxy: TypesGen.Region): boolean => {
    if (!refetchDate) {
      // Only show loading if the user manually requested a refetch
      return false;
    }

    // Only show a loading spinner if:
    //  - A latency exists. This means the latency was fetched at some point, so
    //    the loader *should* be resolved.
    //  - The proxy is healthy. If it is not, the loader might never resolve.
    //  - The latency reported is older than the refetch date. This means the
    //    latency is stale and we should show a loading spinner until the new
    //    latency is fetched.
    const latency = latencies[proxy.id];
    return proxy.healthy && latency !== undefined && latency.at < refetchDate;
  };

  // This endpoint returns a 404 when not using enterprise.
  // If we don't return null, then it looks like this is
  // loading forever!
  if (proxyContextValue.error) {
    return null;
  }

  if (isLoading) {
    return (
      <Skeleton
        width="110px"
        height={BUTTON_SM_HEIGHT}
        css={{ borderRadius: "9999px", transform: "none" }}
      />
    );
  }

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(true)}
        size="small"
        endIcon={<KeyboardArrowDownOutlined />}
        css={{
          borderRadius: "999px",
          "& .MuiSvgIcon-root": { fontSize: 14 },
        }}
      >
        <span css={{ ...visuallyHidden }}>
          延迟为 {selectedProxy?.display_name ?? "你的地区"}
        </span>

        {selectedProxy ? (
          <div css={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div css={{ width: 16, height: 16, lineHeight: 0 }}>
              <img
                // Empty alt text used because we don't want to double up on
                // screen reader announcements from visually-hidden span
                alt=""
                src={selectedProxy.icon_url}
                css={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>

            <Latency
              latency={latencies?.[selectedProxy.id]?.latencyMS}
              isLoading={proxyLatencyLoading(selectedProxy)}
            />
          </div>
        ) : (
          "选择代理"
        )}
      </Button>

      <Menu
        open={isOpen}
        anchorEl={buttonRef.current}
        onClick={closeMenu}
        onClose={closeMenu}
        css={{ "& .MuiMenu-paper": { paddingTop: 8, paddingBottom: 8 } }}
        // autoFocus here does not affect modal focus; it affects whether the
        // first item in the list will get auto-focus when the menu opens. Have
        // to turn this off because otherwise, screen readers will skip over all
        // the descriptive text and will only have access to the latency options
        autoFocus={false}
      >
        <div
          css={{
            width: "100%",
            maxWidth: "320px",
            fontSize: 14,
            padding: 16,
            lineHeight: "140%",
          }}
        >
          <h4
            autoFocus
            tabIndex={-1}
            css={{
              fontSize: "inherit",
              fontWeight: 600,
              lineHeight: "inherit",
              margin: 0,
              marginBottom: 4,
            }}
          >
            选择离您最近的地区
          </h4>

          <p
            css={{
              fontSize: 13,
              color: theme.palette.text.secondary,
              lineHeight: "inherit",
              marginTop: 0.5,
            }}
          >
            工作区代理改善了对工作区的终端和 Web 应用程序连接的性能，但不适用于{" "}
            <Abbr title="Command-Line Interface" pronunciation="initialism">
              CLI
            </Abbr>{" "}
            连接。您必须手动选择一个地区，否则将使用默认的主要地区。
          </p>
        </div>

        <Divider css={{ borderColor: theme.palette.divider }} />

        {proxyContextValue.proxies &&
          [...proxyContextValue.proxies]
            .sort((a, b) => {
              const latencyA = latencies?.[a.id]?.latencyMS ?? Infinity;
              const latencyB = latencies?.[b.id]?.latencyMS ?? Infinity;
              return latencyA - latencyB;
            })
            .map((proxy) => (
              <MenuItem
                key={proxy.id}
                selected={proxy.id === selectedProxy?.id}
                css={{ fontSize: 14 }}
                onClick={() => {
                  if (!proxy.healthy) {
                    displayError("请选择一个健康的工作区代理。");
                    closeMenu();
                    return;
                  }

                  proxyContextValue.setProxy(proxy);
                  closeMenu();
                }}
              >
                <div
                  css={{
                    display: "flex",
                    gap: 24,
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div css={{ width: 14, height: 14, lineHeight: 0 }}>
                    <img
                      src={proxy.icon_url}
                      alt=""
                      css={{
                        objectFit: "contain",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>

                  {proxy.display_name}

                  <Latency
                    latency={latencies?.[proxy.id]?.latencyMS}
                    isLoading={proxyLatencyLoading(proxy)}
                  />
                </div>
              </MenuItem>
            ))}

        <Divider css={{ borderColor: theme.palette.divider }} />

        {Boolean(permissions.editWorkspaceProxies) && (
          <MenuItem
            css={{ fontSize: 14 }}
            onClick={() => {
              navigate("/deployment/workspace-proxies");
            }}
          >
            代理设置
          </MenuItem>
        )}

        <MenuItem
          css={{ fontSize: 14 }}
          onClick={(e) => {
            // Stop the menu from closing
            e.stopPropagation();
            // Refresh the latencies.
            const refetchDate = refreshLatencies();
            setRefetchDate(refetchDate);
          }}
        >
          刷新延迟
        </MenuItem>
      </Menu>
    </>
  );
};

const styles = {
  desktopNavItems: (theme) => css`
    display: none;

    ${theme.breakpoints.up("md")} {
      display: flex;
    }
  `,
  mobileMenuButton: (theme) => css`
    ${theme.breakpoints.up("md")} {
      display: none;
    }
  `,
  navMenus: (theme) => ({
    display: "flex",
    gap: 16,
    alignItems: "center",
    paddingRight: 16,

    [theme.breakpoints.up("md")]: {
      marginLeft: "auto",
    },
  }),
  wrapper: (theme) => css`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;

    ${theme.breakpoints.up("md")} {
      justify-content: flex-start;
    }
  `,
  drawerHeader: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  logo: (theme) => css`
    align-items: center;
    display: flex;
    height: ${navHeight}px;
    color: ${theme.palette.text.primary};
    padding: 16px;

    // svg is for the Coder logo, img is for custom images
    & svg,
    & img {
      height: 100%;
      object-fit: contain;
    }
  `,
  drawerLogo: {
    padding: 0,
    maxHeight: 40,
  },
  link: (theme) => css`
    align-items: center;
    color: ${theme.palette.text.secondary};
    display: flex;
    flex: 1;
    font-size: 16px;
    padding: 12px 16px;
    text-decoration: none;
    transition: background-color 0.15s ease-in-out;

    &.active {
      color: ${theme.palette.text.primary};
      font-weight: 500;
    }

    &:hover {
      background-color: ${theme.experimental.l2.hover.background};
    }

    ${theme.breakpoints.up("md")} {
      height: ${navHeight}px;
      padding: 0 24px;
    }
  `,
} satisfies Record<string, Interpolation<Theme>>;
