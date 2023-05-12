import { useState } from "react"
import { Header } from "components/DeploySettingsLayout/Header"
import {
  Badges,
  DisabledBadge,
  EnterpriseBadge,
  EntitledBadge,
} from "components/DeploySettingsLayout/Badges"
import InputAdornment from "@mui/material/InputAdornment"
import { Fieldset } from "components/DeploySettingsLayout/Fieldset"
import { getFormHelpers } from "utils/formUtils"
import Button from "@mui/material/Button"
import FormControlLabel from "@mui/material/FormControlLabel"
import { BlockPicker } from "react-color"
import { useTranslation } from "react-i18next"
import makeStyles from "@mui/styles/makeStyles"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import { UpdateAppearanceConfig } from "api/typesGenerated"
import { Stack } from "components/Stack/Stack"
import { useFormik } from "formik"
import { useTheme } from "@mui/styles"
import Link from "@mui/material/Link"

export type AppearanceSettingsPageViewProps = {
  appearance: UpdateAppearanceConfig
  isEntitled: boolean
  updateAppearance: (
    newConfig: Partial<UpdateAppearanceConfig>,
    preview: boolean,
  ) => void
}
export const AppearanceSettingsPageView = ({
  appearance,
  isEntitled,
  updateAppearance,
}: AppearanceSettingsPageViewProps): JSX.Element => {
  const styles = useStyles()
  const theme = useTheme()
  const [t] = useTranslation("appearanceSettings")
  const logoForm = useFormik<{
    logo_url: string
  }>({
    initialValues: {
      logo_url: appearance.logo_url,
    },
    onSubmit: (values) => updateAppearance(values, false),
  })
  const logoFieldHelpers = getFormHelpers(logoForm)

  const serviceBannerForm = useFormik<UpdateAppearanceConfig["service_banner"]>(
    {
      initialValues: {
        message: appearance.service_banner.message,
        enabled: appearance.service_banner.enabled,
        background_color: appearance.service_banner.background_color,
      },
      onSubmit: (values) =>
        updateAppearance(
          {
            service_banner: values,
          },
          false,
        ),
    },
  )
  const serviceBannerFieldHelpers = getFormHelpers(serviceBannerForm)
  const [backgroundColor, setBackgroundColor] = useState(
    serviceBannerForm.values.background_color,
  )
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
        title="徽标网址"
        subtitle="指定一个自定义的URL，用于在仪表板左上角显示您的徽标。"
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
              <InputAdornment position="end" className={styles.logoAdornment}>
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
                updateAppearance(
                  {
                    service_banner: {
                      message:
                        "👋 这是一个服务横幅。横幅的颜色和文本可以进行编辑。",
                      background_color: "#004852",
                      enabled: true,
                    },
                  },
                  true,
                )
              }}
            >
              {t("showPreviewLabel")}
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
                    const newState = !serviceBannerForm.values.enabled
                    const newBanner = {
                      ...serviceBannerForm.values,
                      enabled: newState,
                    }
                    updateAppearance(
                      {
                        service_banner: newBanner,
                      },
                      false,
                    )
                    await serviceBannerForm.setFieldValue("enabled", newState)
                  }}
                />
              }
              label="启用"
            />
            <Stack spacing={0}>
              <TextField
                {...serviceBannerFieldHelpers(
                  "message",
                  t("messageHelperText"),
                )}
                fullWidth
                label="Message"
                multiline
              />
            </Stack>

            <Stack spacing={0}>
              <h3>{"背景颜色"}</h3>
              <BlockPicker
                color={backgroundColor}
                onChange={async (color) => {
                  setBackgroundColor(color.hex)
                  await serviceBannerForm.setFieldValue(
                    "background_color",
                    color.hex,
                  )
                  updateAppearance(
                    {
                      service_banner: {
                        ...serviceBannerForm.values,
                        background_color: color.hex,
                      },
                    },
                    true,
                  )
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
  )
}

const useStyles = makeStyles((theme) => ({
  form: {
    maxWidth: "500px",
  },
  logoAdornment: {
    width: theme.spacing(3),
    height: theme.spacing(3),

    "& img": {
      maxWidth: "100%",
    },
  },
}))
