import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import type { UpdateAppearanceConfig } from "api/typesGenerated";
import {
	Badges,
	EnterpriseBadge,
	PremiumBadge,
} from "components/Badges/Badges";
import { Button } from "components/Button/Button";
import { PopoverPaywall } from "components/Paywall/PopoverPaywall";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "components/SettingsHeader/SettingsHeader";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "components/Tooltip/Tooltip";
import { useFormik } from "formik";
import type { FC } from "react";
import { getFormHelpers } from "utils/formUtils";
import { Fieldset } from "../Fieldset";
import { AnnouncementBannerSettings } from "./AnnouncementBannerSettings";

const Language = {
	appearanceTitle: "外观",
	appearanceDescription: "自定义您的 Coder 部署的外观和感觉。",
	applicationNameTitle: "应用名称",
	applicationNameSubtitle: "指定在登录页面上显示的自定义应用名称。",
	applicationNamePlaceholder: '留空以显示 "Coder"。',
	applicationNameAriaLabel: "应用名称",
	logoUrlTitle: "Logo URL",
	logoUrlSubtitle: "为您的 Logo 指定自定义 URL，将在登录页面和仪表板左上角显示。",
	logoUrlPlaceholder: "留空以显示 Coder Logo。",
	logoUrlAriaLabel: "Logo URL",
	enterpriseOnlyFeature: "这是仅限企业版的功能。",
	logoBestPractices: "具有透明度和宽高比为 3:1 或更小的图像效果最佳。",
	submitButton: "提交",
};

type AppearanceSettingsPageViewProps = {
	appearance: UpdateAppearanceConfig;
	isEntitled: boolean;
	isPremium: boolean;
	onSaveAppearance: (
		newConfig: Partial<UpdateAppearanceConfig>,
	) => Promise<void>;
};

export const AppearanceSettingsPageView: FC<
	AppearanceSettingsPageViewProps
> = ({ appearance, isEntitled, isPremium, onSaveAppearance }) => {
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
			<SettingsHeader>
				<SettingsHeaderTitle>{Language.appearanceTitle}</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					{Language.appearanceDescription}
				</SettingsHeaderDescription>
			</SettingsHeader>

			<Badges>
				<TooltipProvider>
					<Tooltip delayDuration={0}>
						{isEntitled && !isPremium ? (
							<EnterpriseBadge />
						) : (
							<TooltipTrigger asChild>
								<span>
									<PremiumBadge />
								</span>
							</TooltipTrigger>
						)}

						<TooltipContent
							sideOffset={-28}
							collisionPadding={16}
							className="p-0"
						>
							<PopoverPaywall
								message="Appearance"
								description="With a Premium license, you can customize the appearance and branding of your deployment."
								documentationLink="https://coder.com/docs/admin/appearance"
							/>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</Badges>

			<Fieldset
				title={Language.applicationNameTitle}
				subtitle={Language.applicationNameSubtitle}
				validation={!isEntitled ? Language.enterpriseOnlyFeature : ""}
				onSubmit={applicationNameForm.handleSubmit}
				button={!isEntitled && <Button disabled>{Language.submitButton}</Button>}
			>
				<TextField
					{...applicationNameFieldHelpers("application_name")}
					defaultValue={appearance.application_name}
					fullWidth
					placeholder={Language.applicationNamePlaceholder}
					disabled={!isEntitled}
					inputProps={{
						"aria-label": Language.applicationNameAriaLabel,
					}}
				/>
			</Fieldset>

			<Fieldset
				title={Language.logoUrlTitle}
				subtitle={Language.logoUrlSubtitle}
				validation={
					isEntitled
						? Language.logoBestPractices
						: Language.enterpriseOnlyFeature
				}
				onSubmit={logoForm.handleSubmit}
				button={!isEntitled && <Button disabled>{Language.submitButton}</Button>}
			>
				<TextField
					{...logoFieldHelpers("logo_url")}
					defaultValue={appearance.logo_url}
					fullWidth
					placeholder={Language.logoUrlPlaceholder}
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
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
									onLoad={(e) => {
										e.currentTarget.style.display = "inline";
									}}
								/>
							</InputAdornment>
						),
					}}
					inputProps={{
						"aria-label": Language.logoUrlAriaLabel,
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
