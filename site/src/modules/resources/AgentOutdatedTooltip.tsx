import { useTheme } from "@emotion/react";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import type { WorkspaceAgent } from "api/typesGenerated";
import {
	HelpTooltip,
	HelpTooltipAction,
	HelpTooltipContent,
	HelpTooltipLinksGroup,
	HelpTooltipText,
	HelpTooltipTitle,
} from "components/HelpTooltip/HelpTooltip";
import { PopoverTrigger } from "components/Popover/Popover";
import { Stack } from "components/Stack/Stack";
import type { FC } from "react";
import { agentVersionStatus } from "../../utils/workspace";

type AgentOutdatedTooltipProps = {
	agent: WorkspaceAgent;
	serverVersion: string;
	status: agentVersionStatus;
	onUpdate: () => void;
};

export const AgentOutdatedTooltip: FC<AgentOutdatedTooltipProps> = ({
	agent,
	serverVersion,
	status,
	onUpdate,
}) => {
	const theme = useTheme();
	const versionLabelStyles = {
		fontWeight: 600,
		color: theme.palette.text.primary,
	};
	const title =
		status === agentVersionStatus.Outdated
			? "代理已过期"
			: "代理已弃用";
	const opener =
		status === agentVersionStatus.Outdated
			? "此代理的版本早于 Coder 服务器。"
			: "此代理正在使用已弃用的 API 版本。";
	const text = `${opener} 这可能发生在您更新 Coder 时存在运行中的工作区。要解决此问题，您可以停止并重新启动工作区。`;

	return (
		<HelpTooltip>
			<PopoverTrigger>
				<span role="status" css={{ cursor: "pointer" }}>
					{status === agentVersionStatus.Outdated ? "已过期" : "已弃用"}
				</span>
			</PopoverTrigger>
			<HelpTooltipContent>
				<Stack spacing={1}>
					<div>
						<HelpTooltipTitle>{title}</HelpTooltipTitle>
						<HelpTooltipText>{text}</HelpTooltipText>
					</div>

					<Stack spacing={0.5}>
						<span css={versionLabelStyles}>代理版本</span>
						<span>{agent.version}</span>
					</Stack>

					<Stack spacing={0.5}>
						<span css={versionLabelStyles}>服务器版本</span>
						<span>{serverVersion}</span>
					</Stack>

					<HelpTooltipLinksGroup>
						<HelpTooltipAction
							icon={RefreshIcon}
							onClick={onUpdate}
							ariaLabel="Update workspace"
						>
							Update workspace
						</HelpTooltipAction>
					</HelpTooltipLinksGroup>
				</Stack>
			</HelpTooltipContent>
		</HelpTooltip>
	);
};
