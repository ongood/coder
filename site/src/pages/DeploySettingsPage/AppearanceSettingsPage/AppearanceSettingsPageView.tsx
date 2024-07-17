import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import type { FC } from "react";
import type { UpdateAppearanceConfig } from "api/typesGenerated";
import {
  Badges,
  DisabledBadge,
  EnterpriseBadge,
  EntitledBadge,
} from "components/Badges/Badges";
import { PopoverPaywall } from "components/Paywall/PopoverPaywall";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "components/Popover/Popover";
import { getFormHelpers } from "utils/formUtils";
import { Fieldset } from "../Fieldset";
import { Header } from "../Header";
import { AnnouncementBannerSettings } from "./AnnouncementBannerSettings";

export type AppearanceSettingsPageViewProps = {
  appearance: UpdateAppearanceConfig;
  isEntitled: boolean;
  onSaveAppearance: (
    newConfig: Partial<UpdateAppearanceConfig>,
  ) => Promise<void>;
};

export const AppearanceSettingsPageView: FC<
  AppearanceSettingsPageViewProps
> = ({ appearance, isEntitled, onSaveAppearance }) => {
  const applicationNameForm = useFormik<{
    application_name: string;
  }>({
    initialValues: {
      application_name: appearance.application_name,
    },
    onSubmit: (values) => onSaveAppearance(values),
  });
  const applicationNameFieldHelpers = getFormHelpers(applicationNameForm);

  const logoForm = useFormik<{
    logo_url: string;
  }>({
    initialValues: {
      logo_url: appearance.logo_url,
    },
    onSubmit: (values) => onSaveAppearance(values),
  });
  const logoFieldHelpers = getFormHelpers(logoForm);

  return (
    <>
      <Header
        title="自定义界面"
        description="自定义Coder部署的界面。"
      />

      <Badges>
        {isEntitled ? <EntitledBadge /> : <DisabledBadge />}
        <Popover mode="hover">
          <PopoverTrigger>
            <span>
              <EnterpriseBadge />
            </span>
          </PopoverTrigger>
          <PopoverContent css={{ transform: "translateY(-28px)" }}>
            <PopoverPaywall
              message="Appearance"
              description="With an Enterprise license, you can customize the appearance of your deployment."
              documentationLink="https://coder.com/docs/admin/appearance"
            />
          </PopoverContent>
        </Popover>
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

      <AnnouncementBannerSettings
        isEntitled={isEntitled}
        announcementBanners={appearance.announcement_banners || []}
        onSubmit={(announcementBanners) =>
          onSaveAppearance({ announcement_banners: announcementBanners })
        }
      />
    </>
  );
};
