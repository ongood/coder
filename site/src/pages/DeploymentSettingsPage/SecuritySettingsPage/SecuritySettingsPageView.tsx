import type { SerpentOption } from "api/typesGenerated";
import {
	Badges,
	DisabledBadge,
	EnabledBadge,
	PremiumBadge,
} from "components/Badges/Badges";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderDocsLink,
	SettingsHeaderTitle,
} from "components/SettingsHeader/SettingsHeader";
import { Stack } from "components/Stack/Stack";
import type { FC } from "react";
import {
	deploymentGroupHasParent,
	useDeploymentOptions,
} from "utils/deployOptions";
import { docs } from "utils/docs";
import OptionsTable from "../OptionsTable";

const Language = {
	securityTitle: "安全",
	securityDescription: "确保您的 Coder 部署安全。",
	browserOnlyTitle: "仅浏览器连接",
	browserOnlyDescription: "阻止所有通过 SSH、端口转发和其他非浏览器连接的工作区访问。",
	tlsTitle: "TLS",
	tlsDescription: "确保为您的 Coder 部署正确配置 TLS。",
};

type SecuritySettingsPageViewProps = {
	options: SerpentOption[];
	featureBrowserOnlyEnabled: boolean;
};

export const SecuritySettingsPageView: FC<SecuritySettingsPageViewProps> = ({
	options,
	featureBrowserOnlyEnabled,
}) => {
	const tlsOptions = options.filter((o) =>
		deploymentGroupHasParent(o.group, "TLS"),
	);

	return (
		<Stack direction="column" spacing={6}>
			<div>
				<SettingsHeader>
					<SettingsHeaderTitle>Security</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						Ensure your Coder deployment is secure.
					</SettingsHeaderDescription>
				</SettingsHeader>

				<OptionsTable
					options={useDeploymentOptions(
						options,
						"SSH Keygen Algorithm",
						"Secure Auth Cookie",
						"Disable Owner Workspace Access",
					)}
				/>
			</div>

			<div>
				<SettingsHeader
					actions={
						<SettingsHeaderDocsLink
							href={docs("/admin/networking#browser-only-connections")}
						/>
					}
				>
					<SettingsHeaderTitle level="h2" hierarchy="secondary">
						{Language.browserOnlyTitle}
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						{Language.browserOnlyDescription}
					</SettingsHeaderDescription>
				</SettingsHeader>

				<Badges>
					{featureBrowserOnlyEnabled ? <EnabledBadge /> : <DisabledBadge />}
					<PremiumBadge />
				</Badges>
			</div>

			{tlsOptions.length > 0 && (
				<div>
					<SettingsHeader>
						<SettingsHeaderTitle level="h2" hierarchy="secondary">
							TLS
						</SettingsHeaderTitle>
						<SettingsHeaderDescription>
							Ensure TLS is properly configured for your Coder deployment.
						</SettingsHeaderDescription>
					</SettingsHeader>

					<OptionsTable options={tlsOptions} />
				</div>
			)}
		</Stack>
	);
};
