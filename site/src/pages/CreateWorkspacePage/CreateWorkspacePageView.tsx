import { type Interpolation, type Theme } from "@emotion/react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import { FormikContextType, useFormik } from "formik";
import { type FC, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import type * as TypesGen from "api/typesGenerated";
import {
  getFormHelpers,
  nameValidator,
  onChangeTrimmed,
} from "utils/formUtils";
import {
  FormFields,
  FormSection,
  FormFooter,
  HorizontalForm,
} from "components/Form/Form";
import { UserAutocomplete } from "components/UserAutocomplete/UserAutocomplete";
import {
  AutofillBuildParameter,
  AutofillSource,
  getInitialRichParameterValues,
  useValidationSchemaForRichParameters,
} from "utils/richParameters";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Stack } from "components/Stack/Stack";
import { Alert } from "components/Alert/Alert";
import { Margins } from "components/Margins/Margins";
import { Avatar } from "components/Avatar/Avatar";
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderSubtitle,
} from "components/PageHeader/PageHeader";
import { Pill } from "components/Pill/Pill";
import { RichParameterInput } from "components/RichParameterInput/RichParameterInput";
import { generateWorkspaceName } from "modules/workspaces/generateWorkspaceName";
import {
  CreateWorkspaceMode,
  ExternalAuthPollingState,
} from "./CreateWorkspacePage";
import { ExternalAuthBanner } from "./ExternalAuthBanner/ExternalAuthBanner";
import { CreateWSPermissions } from "./permissions";

export const Language = {
  duplicationWarning:
    "复制工作区只会复制其参数。不会复制旧工作区的状态。",
} as const;

export interface CreateWorkspacePageViewProps {
  mode: CreateWorkspaceMode;
  error: unknown;
  resetMutation: () => void;
  defaultName?: string | null;
  defaultOwner: TypesGen.User;
  template: TypesGen.Template;
  versionId?: string;
  externalAuth: TypesGen.TemplateVersionExternalAuth[];
  externalAuthPollingState: ExternalAuthPollingState;
  startPollingExternalAuth: () => void;
  parameters: TypesGen.TemplateVersionParameter[];
  autofillParameters: AutofillBuildParameter[];
  permissions: CreateWSPermissions;
  creatingWorkspace: boolean;
  onCancel: () => void;
  onSubmit: (
    req: TypesGen.CreateWorkspaceRequest,
    owner: TypesGen.User,
  ) => void;
}

export const CreateWorkspacePageView: FC<CreateWorkspacePageViewProps> = ({
  mode,
  error,
  resetMutation,
  defaultName,
  defaultOwner,
  template,
  versionId,
  externalAuth,
  externalAuthPollingState,
  startPollingExternalAuth,
  parameters,
  autofillParameters,
  permissions,
  creatingWorkspace,
  onSubmit,
  onCancel,
}) => {
  const [owner, setOwner] = useState(defaultOwner);
  const [searchParams] = useSearchParams();
  const disabledParamsList = searchParams?.get("disable_params")?.split(",");
  const requiresExternalAuth = externalAuth.some((auth) => !auth.authenticated);
  const [suggestedName, setSuggestedName] = useState(() =>
    generateWorkspaceName(),
  );

  const rerollSuggestedName = useCallback(() => {
    setSuggestedName(() => generateWorkspaceName());
  }, []);

  const form: FormikContextType<TypesGen.CreateWorkspaceRequest> =
    useFormik<TypesGen.CreateWorkspaceRequest>({
      initialValues: {
        name: defaultName ?? "",
        template_id: template.id,
        rich_parameter_values: getInitialRichParameterValues(
          parameters,
          autofillParameters,
        ),
      },
      validationSchema: Yup.object({
        name: nameValidator("工作区名称"),
        rich_parameter_values: useValidationSchemaForRichParameters(parameters),
      }),
      enableReinitialize: true,
      onSubmit: (request) => {
        if (requiresExternalAuth) {
          return;
        }

        onSubmit(request, owner);
      },
    });

  useEffect(() => {
    if (error) {
      window.scrollTo(0, 0);
    }
  }, [error]);

  const getFieldHelpers = getFormHelpers<TypesGen.CreateWorkspaceRequest>(
    form,
    error,
  );

  const autofillSources = useMemo(() => {
    return autofillParameters.reduce(
      (acc, param) => {
        acc[param.name] = param.source;
        return acc;
      },
      {} as Record<string, AutofillSource>,
    );
  }, [autofillParameters]);

  return (
    <Margins size="medium">
      <PageHeader actions={<Button onClick={onCancel}>取消</Button>}>
        <Stack direction="row" spacing={3} alignItems="center">
          {template.icon !== "" ? (
            <Avatar size="xl" src={template.icon} variant="square" fitImage />
          ) : (
            <Avatar size="xl">{template.name}</Avatar>
          )}

          <div>
            <PageHeaderTitle>
              {template.display_name.length > 0
                ? template.display_name
                : template.name}
            </PageHeaderTitle>

            <PageHeaderSubtitle condensed>新工作区</PageHeaderSubtitle>
          </div>

          {template.deprecated && <Pill type="warning">已废弃</Pill>}
        </Stack>
      </PageHeader>

      {requiresExternalAuth ? (
        <ExternalAuthBanner
          providers={externalAuth}
          pollingState={externalAuthPollingState}
          onStartPolling={startPollingExternalAuth}
        />
      ) : (
        <HorizontalForm
          name="create-workspace-form"
          onSubmit={form.handleSubmit}
          css={{ padding: "16px 0" }}
        >
          {Boolean(error) && <ErrorAlert error={error} />}

          {mode === "duplicate" && (
            <Alert severity="info" dismissible>
              {Language.duplicationWarning}
            </Alert>
          )}

          {/* General info */}
          <FormSection
            title="常规"
            description={
              permissions.createWorkspaceForUser
                ? "工作区的名称及其所有者。只有管理员可以为其他用户创建工作区。"
                : "您的新工作区的名称"
            }
          >
            <FormFields>
              {versionId && versionId !== template.active_version_id && (
                <Stack spacing={1} css={styles.hasDescription}>
                  <TextField
                    disabled
                    fullWidth
                    value={versionId}
                    label="版本 ID"
                  />
                  <span css={styles.description}>
                    这个参数已经预设，无法修改。
                  </span>
                </Stack>
              )}
              <div>
                <TextField
                  {...getFieldHelpers("name")}
                  disabled={creatingWorkspace}
                  // resetMutation facilitates the clearing of validation errors
                  onChange={onChangeTrimmed(form, resetMutation)}
                  fullWidth
                  label="工作区名称"
                />
                <FormHelperText data-chromatic="ignore">
                  需要建议吗？{" "}
                  <Button
                    variant="text"
                    css={styles.nameSuggestion}
                    onClick={async () => {
                      await form.setFieldValue("name", suggestedName);
                      rerollSuggestedName();
                    }}
                  >
                    {suggestedName}
                  </Button>
                </FormHelperText>
              </div>

              {permissions.createWorkspaceForUser && (
                <UserAutocomplete
                  value={owner}
                  onChange={(user) => {
                    setOwner(user ?? defaultOwner);
                  }}
                  label="拥有者"
                  size="medium"
                />
              )}
            </FormFields>
          </FormSection>

          {parameters.length > 0 && (
            <FormSection
              title="参数"
              description="这些是模板使用的设置。请注意，一旦工作区创建后，不可更改的参数无法修改。"
            >
              {/*
                Opted not to use FormFields in order to increase spacing.
                This decision was made because rich parameter inputs are more visually dense than standard text fields.
              */}
              <div css={{ display: "flex", flexDirection: "column", gap: 36 }}>
                {parameters.map((parameter, index) => {
                  const parameterField = `rich_parameter_values.${index}`;
                  const parameterInputName = `${parameterField}.value`;
                  const isDisabled =
                    disabledParamsList?.includes(
                      parameter.name.toLowerCase().replace(/ /g, "_"),
                    ) || creatingWorkspace;

                  return (
                    <RichParameterInput
                      {...getFieldHelpers(parameterInputName)}
                      onChange={async (value) => {
                        await form.setFieldValue(parameterField, {
                          name: parameter.name,
                          value,
                        });
                      }}
                      autofillSource={autofillSources[parameter.name]}
                      key={parameter.name}
                      parameter={parameter}
                      disabled={isDisabled}
                    />
                  );
                })}
              </div>
            </FormSection>
          )}

          <FormFooter
            onCancel={onCancel}
            isLoading={creatingWorkspace}
            submitLabel="创建工作区"
          />
        </HorizontalForm>
      )}
    </Margins>
  );
};

const styles = {
  nameSuggestion: (theme) => ({
    color: theme.roles.info.fill.solid,
    padding: "4px 8px",
    lineHeight: "inherit",
    fontSize: "inherit",
    height: "unset",
  }),
  hasDescription: {
    paddingBottom: 16,
  },
  description: (theme) => ({
    fontSize: 13,
    color: theme.palette.text.secondary,
  }),
} satisfies Record<string, Interpolation<Theme>>;
