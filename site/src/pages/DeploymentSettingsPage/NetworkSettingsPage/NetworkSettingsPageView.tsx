import type { SerpentOption } from "api/typesGenerated";
import { Badges, DisabledBadge, EnabledBadge } from "components/Badges/Badges";
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
	networkTitle: "网络",
	networkDescription: "配置您的部署连接性。",
	portForwardingTitle: "端口转发",
	portForwardingDescription: "端口转发让开发者能够从本地机器安全地访问其 Coder 工作区上的进程。",
};

type NetworkSettingsPageViewProps = {
	options: SerpentOption[];
};

export const NetworkSettingsPageView: FC<NetworkSettingsPageViewProps> = ({
	options,
}) => (
	<Stack direction="column" spacing={6}>
		<div>
			<SettingsHeader
				actions={<SettingsHeaderDocsLink href={docs("/admin/networking")} />}
			>
				<SettingsHeaderTitle>{Language.networkTitle}</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					{Language.networkDescription}
				</SettingsHeaderDescription>
			</SettingsHeader>

			<OptionsTable
				options={options.filter((o) =>
					deploymentGroupHasParent(o.group, "Networking"),
				)}
			/>
		</div>

		<div>
			<SettingsHeader
				actions={
					<SettingsHeaderDocsLink
						href={docs("/admin/networking/port-forwarding")}
					/>
				}
			>
				<SettingsHeaderTitle level="h2" hierarchy="secondary">
					{Language.portForwardingTitle}
				</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					{Language.portForwardingDescription}
				</SettingsHeaderDescription>
			</SettingsHeader>

			<Badges>
				{useDeploymentOptions(options, "Wildcard Access URL")[0].value !==
				"" ? (
					<EnabledBadge />
				) : (
					<DisabledBadge />
				)}
			</Badges>
		</div>
	</Stack>
);
