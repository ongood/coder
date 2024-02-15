import { css } from "@emotion/react";
import { type FC } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { DeploymentValues, ExternalAuthConfig } from "api/typesGenerated";
import { Alert } from "components/Alert/Alert";
import { EnterpriseBadge } from "components/Badges/Badges";
import { Header } from "../Header";
import { docs } from "utils/docs";

export type ExternalAuthSettingsPageViewProps = {
  config: DeploymentValues;
};

export const ExternalAuthSettingsPageView: FC<
  ExternalAuthSettingsPageViewProps
> = ({ config }) => {
  return (
    <>
      <Header
        title="外部验证"
        description="Coder 与 GitHub、GitLab、BitBucket、Azure Repos 和 OpenID Connect 集成，可与外部服务对开发者进行身份验证。"
        docsHref={docs("/admin/external-auth")}
      />

      <video
        autoPlay
        muted
        loop
        playsInline
        src="/external-auth.mp4"
        style={{
          maxWidth: "100%",
          borderRadius: 4,
        }}
      />

      <div
        css={{
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        <Alert severity="info" actions={<EnterpriseBadge key="enterprise" />}>
          与多个外部身份验证提供商集成是企业版功能。
        </Alert>
      </div>

      <TableContainer>
        <Table
          css={css`
            & td {
              padding-top: 24px;
              padding-bottom: 24px;
            }

            & td:last-child,
            & th:last-child {
              padding-left: 32px;
            }
          `}
        >
          <TableHead>
            <TableRow>
              <TableCell width="25%">ID</TableCell>
              <TableCell width="25%">客户端 ID</TableCell>
              <TableCell width="25%">匹配</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {((config.external_auth === null ||
              config.external_auth?.length === 0) && (
              <TableRow>
                <TableCell colSpan={999}>
                  <div css={{ textAlign: "center" }}>
                    尚未配置任何提供商！
                  </div>
                </TableCell>
              </TableRow>
            )) ||
              config.external_auth?.map((git: ExternalAuthConfig) => {
                const name = git.id || git.type;
                return (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{git.client_id}</TableCell>
                    <TableCell>{git.regex || "Not Set"}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
