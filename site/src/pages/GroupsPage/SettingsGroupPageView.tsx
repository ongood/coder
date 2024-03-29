import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import type { FC } from "react";
import * as Yup from "yup";
import type { Group } from "api/typesGenerated";
import { FormFooter } from "components/FormFooter/FormFooter";
import { FullPageForm } from "components/FullPageForm/FullPageForm";
import { IconField } from "components/IconField/IconField";
import { Loader } from "components/Loader/Loader";
import { Margins } from "components/Margins/Margins";
import { Stack } from "components/Stack/Stack";
import {
  getFormHelpers,
  nameValidator,
  onChangeTrimmed,
} from "utils/formUtils";
import { isEveryoneGroup } from "utils/groups";

type FormData = {
  name: string;
  display_name: string;
  avatar_url: string;
  quota_allowance: number;
};

const validationSchema = Yup.object({
  name: nameValidator("Name"),
  quota_allowance: Yup.number().required().min(0).integer(),
});

interface UpdateGroupFormProps {
  group: Group;
  errors: unknown;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const UpdateGroupForm: FC<UpdateGroupFormProps> = ({
  group,
  errors,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const form = useFormik<FormData>({
    initialValues: {
      name: group.name,
      display_name: group.display_name,
      avatar_url: group.avatar_url,
      quota_allowance: group.quota_allowance,
    },
    validationSchema,
    onSubmit,
  });
  const getFieldHelpers = getFormHelpers<FormData>(form, errors);

  return (
    <FullPageForm title="用户组设置">
      <form onSubmit={form.handleSubmit}>
        <Stack spacing={2.5}>
          <TextField
            {...getFieldHelpers("name")}
            onChange={onChangeTrimmed(form)}
            autoComplete="name"
            autoFocus
            fullWidth
            label="名称"
            disabled={isEveryoneGroup(group)}
          />
          {isEveryoneGroup(group) ? (
            <></>
          ) : (
            <>
              <TextField
                {...getFieldHelpers("display_name", {
                  helperText: "可选：保留为空以使用默认名称。",
                })}
                onChange={onChangeTrimmed(form)}
                autoComplete="display_name"
                autoFocus
                fullWidth
                label="显示名称"
                disabled={isEveryoneGroup(group)}
              />
              <IconField
                {...getFieldHelpers("avatar_url")}
                onChange={onChangeTrimmed(form)}
                fullWidth
                label="Avatar URL"
                onPickEmoji={(value) => form.setFieldValue("avatar_url", value)}
              />
            </>
          )}
          <TextField
            {...getFieldHelpers("quota_allowance", {
              helperText: `该群组向每个成员提供 ${form.values.quota_allowance} 配额积分。`,
            })}
            onChange={onChangeTrimmed(form)}
            autoFocus
            fullWidth
            type="number"
            label="配额积分"
          />
        </Stack>

        <FormFooter onCancel={onCancel} isLoading={isLoading} />
      </form>
    </FullPageForm>
  );
};

export type SettingsGroupPageViewProps = {
  onCancel: () => void;
  onSubmit: (data: FormData) => void;
  group: Group | undefined;
  formErrors: unknown;
  isLoading: boolean;
  isUpdating: boolean;
};

export const SettingsGroupPageView: FC<SettingsGroupPageViewProps> = ({
  onCancel,
  onSubmit,
  group,
  formErrors,
  isLoading,
  isUpdating,
}) => {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <Margins>
      <UpdateGroupForm
        group={group!}
        onCancel={onCancel}
        errors={formErrors}
        isLoading={isUpdating}
        onSubmit={onSubmit}
      />
    </Margins>
  );
};

export default SettingsGroupPageView;
