import { useTheme } from "@emotion/react";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import Button from "@mui/material/Button";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { useFormik } from "formik";
import type { FC } from "react";
import { useQuery } from "react-query";
import { API } from "api/api";
import type {
  TemplateVersionParameter,
  Workspace,
  WorkspaceBuildParameter,
} from "api/typesGenerated";
import { FormFields } from "components/Form/Form";
import { TopbarButton } from "components/FullPageLayout/Topbar";
import {
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "components/HelpTooltip/HelpTooltip";
import { Loader } from "components/Loader/Loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  usePopover,
} from "components/Popover/Popover";
import { RichParameterInput } from "components/RichParameterInput/RichParameterInput";
import { docs } from "utils/docs";
import { getFormHelpers } from "utils/formUtils";
import {
  type AutofillBuildParameter,
  getInitialRichParameterValues,
} from "utils/richParameters";

interface BuildParametersPopoverProps {
  workspace: Workspace;
  disabled?: boolean;
  onSubmit: (buildParameters: WorkspaceBuildParameter[]) => void;
  label: string;
}

export const BuildParametersPopover: FC<BuildParametersPopoverProps> = ({
  workspace,
  disabled,
  label,
  onSubmit,
}) => {
  const { data: parameters } = useQuery({
    queryKey: ["workspace", workspace.id, "parameters"],
    queryFn: () => API.getWorkspaceParameters(workspace),
  });
  const ephemeralParameters = parameters
    ? parameters.templateVersionRichParameters.filter((p) => p.ephemeral)
    : undefined;

  return (
    <Popover>
      <PopoverTrigger>
        <TopbarButton
          data-testid="build-parameters-button"
          disabled={disabled}
          color="neutral"
          css={{ paddingLeft: 0, paddingRight: 0, minWidth: "28px !important" }}
        >
          <ExpandMoreOutlined css={{ fontSize: 14 }} />
          <span css={{ ...visuallyHidden }}>{label}</span>
        </TopbarButton>
      </PopoverTrigger>
      <PopoverContent
        horizontal="right"
        css={{ ".MuiPaper-root": { width: 304 } }}
      >
        <BuildParametersPopoverContent
          ephemeralParameters={ephemeralParameters}
          buildParameters={parameters?.buildParameters}
          onSubmit={onSubmit}
        />
      </PopoverContent>
    </Popover>
  );
};

interface BuildParametersPopoverContentProps {
  ephemeralParameters?: TemplateVersionParameter[];
  buildParameters?: WorkspaceBuildParameter[];
  onSubmit: (buildParameters: WorkspaceBuildParameter[]) => void;
}

const BuildParametersPopoverContent: FC<BuildParametersPopoverContentProps> = ({
  ephemeralParameters,
  buildParameters,
  onSubmit,
}) => {
  const theme = useTheme();
  const popover = usePopover();

  return (
    <>
      {buildParameters && ephemeralParameters ? (
        ephemeralParameters.length > 0 ? (
          <>
            <div
              css={{
                color: theme.palette.text.secondary,
                padding: 20,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <HelpTooltipTitle>构建选项</HelpTooltipTitle>
              <HelpTooltipText>
                这些参数仅适用于单个工作区启动。
              </HelpTooltipText>
            </div>
            <div css={{ padding: 20 }}>
              <Form
                onSubmit={(buildParameters) => {
                  onSubmit(buildParameters);
                  popover.setOpen(false);
                }}
                ephemeralParameters={ephemeralParameters}
                buildParameters={buildParameters.map(
                  (p): AutofillBuildParameter => ({
                    ...p,
                    source: "active_build",
                  }),
                )}
              />
            </div>
          </>
        ) : (
          <div
            css={{
              color: theme.palette.text.secondary,
              padding: 20,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <HelpTooltipTitle>构建选项</HelpTooltipTitle>
            <HelpTooltipText>
              此模板没有临时构建选项。
            </HelpTooltipText>
            <HelpTooltipLinksGroup>
              <HelpTooltipLink
                href={docs("/templates/parameters#ephemeral-parameters")}
              >
                阅读文档
              </HelpTooltipLink>
            </HelpTooltipLinksGroup>
          </div>
        )
      ) : (
        <Loader />
      )}
    </>
  );
};

interface FormProps {
  ephemeralParameters: TemplateVersionParameter[];
  buildParameters: AutofillBuildParameter[];
  onSubmit: (buildParameters: WorkspaceBuildParameter[]) => void;
}

const Form: FC<FormProps> = ({
  ephemeralParameters,
  buildParameters,
  onSubmit,
}) => {
  const form = useFormik({
    initialValues: {
      rich_parameter_values: getInitialRichParameterValues(
        ephemeralParameters,
        buildParameters,
      ),
    },
    onSubmit: (values) => {
      onSubmit(values.rich_parameter_values);
    },
  });
  const getFieldHelpers = getFormHelpers(form);

  return (
    <form onSubmit={form.handleSubmit} data-testid="build-parameters-form">
      <FormFields>
        {ephemeralParameters.map((parameter, index) => {
          return (
            <RichParameterInput
              {...getFieldHelpers("rich_parameter_values[" + index + "].value")}
              key={parameter.name}
              parameter={parameter}
              size="small"
              onChange={async (value) => {
                await form.setFieldValue(`rich_parameter_values[${index}]`, {
                  name: parameter.name,
                  value: value,
                });
              }}
            />
          );
        })}
      </FormFields>
      <div css={{ paddingTop: "24px", paddingBottom: "8px" }}>
        <Button
          data-testid="build-parameters-submit"
          type="submit"
          variant="contained"
          color="primary"
          css={{ width: "100%" }}
        >
          构建工作区
        </Button>
      </div>
    </form>
  );
};
