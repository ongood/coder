import { useTheme } from "@emotion/react";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { type FC, useState } from "react";
import { BlockPicker } from "react-color";
import type { UpdateAppearanceConfig } from "api/typesGenerated";
import {
  Badges,
  DisabledBadge,
  EnterpriseBadge,
  EntitledBadge,
} from "components/Badges/Badges";
import { Stack } from "components/Stack/Stack";
import colors from "theme/tailwindColors";
import { getFormHelpers } from "utils/formUtils";
import { Fieldset } from "../Fieldset";
import { Header } from "../Header";

export type AppearanceSettingsPageViewProps = {
  appearance: UpdateAppearanceConfig;
  isEntitled: boolean;
  onSaveAppearance: (
    newConfig: Partial<UpdateAppearanceConfig>,
    preview: boolean,
  ) => void;
};

const fallbackBgColor = colors.neutral[500];

export const AppearanceSettingsPageView: FC<
  AppearanceSettingsPageViewProps
> = ({ appearance, isEntitled, onSaveAppearance }) => {
  const theme = useTheme();

  const applicationNameForm = useFormik<{
    application_name: string;
  }>({
    initialValues: {
      application_name: appearance.application_name,
    },
    onSubmit: (values) => onSaveAppearance(values, false),
  });
  const applicationNameFieldHelpers = getFormHelpers(applicationNameForm);

  const logoForm = useFormik<{
    logo_url: string;
  }>({
    initialValues: {
      logo_url: appearance.logo_url,
    },
    onSubmit: (values) => onSaveAppearance(values, false),
  });
  const logoFieldHelpers = getFormHelpers(logoForm);

  const serviceBannerForm = useFormik<UpdateAppearanceConfig["service_banner"]>(
    {
      initialValues: {
        message: appearance.service_banner.message,
        enabled: appearance.service_banner.enabled,
        background_color:
          appearance.service_banner.background_color ?? fallbackBgColor,
      },
      onSubmit: (values) =>
        onSaveAppearance(
          {
            service_banner: values,
          },
          false,
        ),
    },
  );
  const serviceBannerFieldHelpers = getFormHelpers(serviceBannerForm);

  const [backgroundColor, setBackgroundColor] = useState(
    serviceBannerForm.values.background_color,
  );

  return (
    <>
      <Header
        title="自定义界面"
        description="自定义Coder部署的界面。"
      />

      <Badges>
        {isEntitled ? <EntitledBadge /> : <DisabledBadge />}
        <EnterpriseBadge />
      </Badges>

      <Fieldset
        title="应用名称"
        subtitle="在登录页面上指定自定义应用程序名称。"
        validation={!isEntitled ? "此功能仅适用于企业版。" : ""}
        onSubmit={applicationNameForm.handleSubmit}
        button={!isEntitled && <Button disabled>提交</Button>}
      >
        <TextField
          {...applicationNameFieldHelpers("application_name")}
          defaultValue={appearance.application_name}
          fullWidth
          placeholder='留空显示 "Coder"。'
          disabled={!isEntitled}
          inputProps={{
            "aria-label": "Application name",
          }}
        />
      </Fieldset>

      <Fieldset
        title="Logo URL"
        subtitle="指定您的标志的自定义 URL，以在登录页面和仪表板左上角显示。"
        validation={
          isEntitled
            ? "我们建议使用长宽比为3:1的透明图像。"
            : "这是企业版独有的功能。"
        }
        onSubmit={logoForm.handleSubmit}
        button={!isEntitled && <Button disabled>提交</Button>}
      >
        <TextField
          {...logoFieldHelpers("logo_url")}
          defaultValue={appearance.logo_url}
          fullWidth
          placeholder="留空以显示Coder徽标。"
          disabled={!isEntitled}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                css={{
                  width: 24,
                  height: 24,

                  "& img": {
                    maxWidth: "100%",
                  },
                }}
              >
                <img
                  alt=""
                  src={logoForm.values.logo_url}
                  // This prevent browser to display the ugly error icon if the
                  // image path is wrong or user didn't finish typing the url
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  onLoad={(e) => (e.currentTarget.style.display = "inline")}
                />
              </InputAdornment>
            ),
          }}
          inputProps={{
            "aria-label": "Logo URL",
          }}
        />
      </Fieldset>

      <Fieldset
        title="服务横幅"
        subtitle="配置一个横幅，向所有用户显示一条消息。"
        onSubmit={serviceBannerForm.handleSubmit}
        button={
          !isEntitled && (
            <Button
              onClick={() => {
                onSaveAppearance(
                  {
                    service_banner: {
                      message:
                        "👋 这是一个服务横幅。横幅的颜色和文本可以进行编辑。",
                      background_color: "#004852",
                      enabled: true,
                    },
                  },
                  true,
                );
              }}
            >
              显示预览
            </Button>
          )
        }
        validation={
          !isEntitled && (
            <p>
              您的许可证不包含服务横幅。请通过<Link href="mailto:sales@coder.com">sales@coder.com</Link>联系销售部门了解更多信息。
            </p>
          )
        }
      >
        {isEntitled && (
          <Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={serviceBannerForm.values.enabled}
                  onChange={async () => {
                    const newState = !serviceBannerForm.values.enabled;
                    const newBanner = {
                      ...serviceBannerForm.values,
                      enabled: newState,
                    };
                    onSaveAppearance(
                      {
                        service_banner: newBanner,
                      },
                      false,
                    );
                    await serviceBannerForm.setFieldValue("enabled", newState);
                  }}
                  data-testid="switch-service-banner"
                />
              }
              label="启用"
            />
            <Stack spacing={0}>
              <TextField
                {...serviceBannerFieldHelpers("message", {
                  helperText:
                  "支持 Markdown 的加粗、斜体和链接。",
                })}
                fullWidth
                label="消息"
                multiline
                inputProps={{
                  "aria-label": "Message",
                }}
              />
            </Stack>

            <Stack spacing={0}>
              <h3>{"背景颜色"}</h3>
              <BlockPicker
                color={backgroundColor}
                onChange={async (color) => {
                  setBackgroundColor(color.hex);
                  await serviceBannerForm.setFieldValue(
                    "background_color",
                    color.hex,
                  );
                  onSaveAppearance(
                    {
                      service_banner: {
                        ...serviceBannerForm.values,
                        background_color: color.hex,
                      },
                    },
                    true,
                  );
                }}
                triangle="hide"
                colors={["#004852", "#D65D0F", "#4CD473", "#D94A5D", "#5A00CF"]}
                styles={{
                  default: {
                    input: {
                      color: "white",
                      backgroundColor: theme.palette.background.default,
                    },
                    body: {
                      backgroundColor: "black",
                      color: "white",
                    },
                    card: {
                      backgroundColor: "black",
                    },
                  },
                }}
              />
            </Stack>
          </Stack>
        )}
      </Fieldset>
    </>
  );
};
