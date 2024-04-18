import { css } from "@emotion/css";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { FormikContextType } from "formik";
import { type FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormFields,
  FormSection,
  FormFooter,
  HorizontalForm,
} from "components/Form/Form";
import { Stack } from "components/Stack/Stack";
import { onChangeTrimmed, getFormHelpers } from "utils/formUtils";
import {
  NANO_HOUR,
  type CreateTokenData,
  determineDefaultLtValue,
  filterByMaxTokenLifetime,
  customLifetimeDay,
} from "./utils";

dayjs.extend(utc);

interface CreateTokenFormProps {
  form: FormikContextType<CreateTokenData>;
  maxTokenLifetime?: number;
  formError: unknown;
  setFormError: (arg0: unknown) => void;
  isCreating: boolean;
  creationFailed: boolean;
}

export const CreateTokenForm: FC<CreateTokenFormProps> = ({
  form,
  maxTokenLifetime,
  formError,
  setFormError,
  isCreating,
  creationFailed,
}) => {
  const navigate = useNavigate();

  const [expDays, setExpDays] = useState<number>(1);
  const [lifetimeDays, setLifetimeDays] = useState<number | string>(
    determineDefaultLtValue(maxTokenLifetime),
  );

  useEffect(() => {
    if (lifetimeDays !== "custom") {
      void form.setFieldValue("lifetime", lifetimeDays);
    } else {
      void form.setFieldValue("lifetime", expDays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adding form will cause an infinite loop
  }, [lifetimeDays, expDays]);

  const getFieldHelpers = getFormHelpers<CreateTokenData>(form, formError);

  return (
    <HorizontalForm onSubmit={form.handleSubmit}>
      <FormSection
        title="名称"
        description="这个令牌是用来做什么的？"
        classes={{ sectionInfo: classNames.sectionInfo }}
      >
        <FormFields>
          <TextField
            {...getFieldHelpers("name")}
            label="名称"
            required
            onChange={onChangeTrimmed(form, () => setFormError(undefined))}
            autoFocus
            fullWidth
          />
        </FormFields>
      </FormSection>
      <FormSection
        title="过期"
        description={
          form.values.lifetime
            ? `此令牌将在${dayjs()
                .add(form.values.lifetime, "days")
                .utc()
                .format("YYYY年M月D日")}过期。`
            : "请设置令牌过期时间。"
        }
        classes={{ sectionInfo: classNames.sectionInfo }}
      >
        <FormFields>
          <Stack direction="row">
            <TextField
              select
              label="生命周期"
              required
              defaultValue={determineDefaultLtValue(maxTokenLifetime)}
              onChange={(event) => {
                void setLifetimeDays(event.target.value);
              }}
              fullWidth
            >
              {filterByMaxTokenLifetime(maxTokenLifetime).map((lt) => (
                <MenuItem key={lt.label} value={lt.value}>
                  {lt.label}
                </MenuItem>
              ))}
              <MenuItem
                key={customLifetimeDay.label}
                value={customLifetimeDay.value}
              >
                {customLifetimeDay.label}
              </MenuItem>
            </TextField>

            {lifetimeDays === "custom" && (
              <TextField
                data-chromatic="ignore"
                type="date"
                label="到期时间"
                defaultValue={dayjs().add(expDays, "day").format("YYYY-MM-DD")}
                onChange={(event) => {
                  const lt = Math.ceil(
                    dayjs(event.target.value).diff(dayjs(), "day", true),
                  );
                  setExpDays(lt);
                }}
                inputProps={{
                  min: dayjs().add(1, "day").format("YYYY-MM-DD"),
                  max: maxTokenLifetime
                    ? dayjs()
                        .add(maxTokenLifetime / NANO_HOUR / 24, "day")
                        .format("YYYY-MM-DD")
                    : undefined,
                  required: true,
                }}
                fullWidth
                InputLabelProps={{
                  required: true,
                }}
              />
            )}
          </Stack>
        </FormFields>
      </FormSection>
      <FormFooter
        onCancel={() => navigate("/settings/tokens")}
        isLoading={isCreating}
        submitLabel={creationFailed ? "重试" : "创建令牌"}
      />
    </HorizontalForm>
  );
};

const classNames = {
  sectionInfo: css`
    min-width: 300px;
  `,
};
