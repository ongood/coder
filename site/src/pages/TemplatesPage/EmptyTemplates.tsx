import type { Interpolation, Theme } from "@emotion/react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import type { FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { TemplateExample } from "api/typesGenerated";
import { CodeExample } from "components/CodeExample/CodeExample";
import { Stack } from "components/Stack/Stack";
import { TableEmpty } from "components/TableEmpty/TableEmpty";
import { TemplateExampleCard } from "modules/templates/TemplateExampleCard/TemplateExampleCard";
import { docs } from "utils/docs";

// Those are from https://github.com/coder/coder/tree/main/examples/templates
const featuredExampleIds = [
  "docker",
  "kubernetes",
  "aws-linux",
  "aws-windows",
  "gcp-linux",
  "gcp-windows",
];

const findFeaturedExamples = (examples: TemplateExample[]) => {
  const featuredExamples: TemplateExample[] = [];

  // We loop the featuredExampleIds first to keep the order
  featuredExampleIds.forEach((exampleId) => {
    examples.forEach((example) => {
      if (exampleId === example.id) {
        featuredExamples.push(example);
      }
    });
  });

  return featuredExamples;
};

interface EmptyTemplatesProps {
  canCreateTemplates: boolean;
  examples: TemplateExample[];
}

export const EmptyTemplates: FC<EmptyTemplatesProps> = ({
  canCreateTemplates,
  examples,
}) => {
  const featuredExamples = findFeaturedExamples(examples);

  if (canCreateTemplates) {
    return (
      <TableEmpty
        message="创建您的第一个模板"
        description={
          <>
             模板是用 Terraform 编写的，描述工作区的基础架构。您可以从下面开始使用一个入门模板，或者{" "}
            <Link
              href={docs("/templates/tutorial")}
              target="_blank"
              rel="noreferrer"
            >
              创建您自己的
            </Link>
            .
          </>
        }
        cta={
          <Stack alignItems="center" spacing={4}>
            <div css={styles.featuredExamples}>
              {featuredExamples.map((example) => (
                <TemplateExampleCard example={example} key={example.id} />
              ))}
            </div>

            <Button
              size="small"
              component={RouterLink}
              to="/starter-templates"
              css={{ borderRadius: 9999 }}
            >
              查看所有的入门模板
            </Button>
          </Stack>
        }
      />
    );
  }

  return (
    <TableEmpty
      css={styles.withImage}
      message="Create a Template"
      description="Contact your Coder administrator to create a template. You can share the code below."
      cta={<CodeExample secret={false} code="coder templates init" />}
      image={
        <div css={styles.emptyImage}>
          <img src="/featured/templates.webp" alt="" />
        </div>
      }
    />
  );
};

const styles = {
  withImage: {
    paddingBottom: 0,
  },

  emptyImage: {
    maxWidth: "50%",
    height: 320,
    overflow: "hidden",
    opacity: 0.85,

    "& img": {
      maxWidth: "100%",
    },
  },

  featuredExamples: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
} satisfies Record<string, Interpolation<Theme>>;
