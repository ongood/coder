import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import Button from "@mui/material/Button";
import type { Template } from "api/typesGenerated";
import { Avatar } from "components/Avatar/Avatar";
import { TableEmpty } from "components/TableEmpty/TableEmpty";
import { Link } from "react-router-dom";

export const WorkspacesEmpty = (props: {
  isUsingFilter: boolean;
  templates?: Template[];
  canCreateTemplate: boolean;
}) => {
  const { isUsingFilter, templates, canCreateTemplate } = props;
  const totalFeaturedTemplates = 6;
  const featuredTemplates = templates?.slice(0, totalFeaturedTemplates);
  const defaultTitle = "创建一个工作区";
  const defaultMessage =
    "一个工作区是您个人的、可定制的开发环境。";
  const defaultImage = (
    <div
      css={{
        maxWidth: "50%",
        height: 272,
        overflow: "hidden",
        marginTop: 48,
        opacity: 0.85,

        "& img": {
          maxWidth: "100%",
        },
      }}
    >
      <img src="/featured/workspaces.webp" alt="" />
    </div>
  );

  if (isUsingFilter) {
    return <TableEmpty message="没有与您的搜索匹配的结果" />;
  }

  if (templates && templates.length === 0 && canCreateTemplate) {
    return (
      <TableEmpty
        message={defaultTitle}
        description={`${defaultMessage} 要创建工作区，您首先需要创建一个模板。`}
        cta={
          <Button
            component={Link}
            to="/templates"
            variant="contained"
            startIcon={<ArrowForwardOutlined />}
          >
            返回到模板
          </Button>
        }
        css={{
          paddingBottom: 0,
        }}
        image={defaultImage}
      />
    );
  }

  if (templates && templates.length === 0 && !canCreateTemplate) {
    return (
      <TableEmpty
        message={defaultTitle}
        description={`${defaultMessage} 目前没有可用的模板，但一旦管理员添加了模板，您就会在这里看到它们。`}
        css={{
          paddingBottom: 0,
        }}
        image={defaultImage}
      />
    );
  }

  return (
    <TableEmpty
      message={defaultTitle}
      description={`${defaultMessage} 选择下面的一个模板开始。`}
      cta={
        <div>
          <div
            css={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 24,
              justifyContent: "center",
              maxWidth: "800px",
            }}
          >
            {featuredTemplates?.map((t) => (
              <Link
                to={`/templates/${t.name}/workspace`}
                key={t.id}
                css={(theme) => ({
                  width: "320px",
                  padding: 16,
                  borderRadius: 6,
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: "left",
                  display: "flex",
                  gap: 16,
                  textDecoration: "none",
                  color: "inherit",

                  "&:hover": {
                    backgroundColor: theme.palette.background.paper,
                  },
                })}
              >
                <div css={{ flexShrink: 0, paddingTop: 4 }}>
                  <Avatar
                    variant={t.icon ? "square" : undefined}
                    fitImage={Boolean(t.icon)}
                    src={t.icon}
                    size="sm"
                  >
                    {t.name}
                  </Avatar>
                </div>
                <div>
                  <h4 css={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {t.display_name.length > 0 ? t.display_name : t.name}
                  </h4>
                  <span
                    css={(theme) => ({
                      fontSize: 13,
                      color: theme.palette.text.secondary,
                      lineHeight: "0.5",
                    })}
                  >
                    {t.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {templates && templates.length > totalFeaturedTemplates && (
            <Button
              component={Link}
              to="/templates"
              variant="contained"
              startIcon={<ArrowForwardOutlined />}
            >
              查看所有模板
            </Button>
          )}
        </div>
      }
    />
  );
};
