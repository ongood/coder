import {
	type CSSObject,
	type Interpolation,
	type Theme,
	css,
	useTheme,
} from "@emotion/react";
import Link from "@mui/material/Link";
import { Expander } from "components/Expander/Expander";
import { Pill } from "components/Pill/Pill";
import { type FC, useState } from "react";

export const Language = {
  licenseIssue: "许可证问题",
  licenseIssues: (num: number): string => `${num} 许可证问题`,
  upgrade: "联系我们升级您的许可证。",
  exceeded: "您似乎超出了许可证的某些限制。",
  lessDetails: "少于",
  moreDetails: "多于",
};

const styles = {
	leftContent: {
		marginRight: 8,
		marginLeft: 8,
	},
} satisfies Record<string, Interpolation<Theme>>;

export interface LicenseBannerViewProps {
	errors: readonly string[];
	warnings: readonly string[];
}

export const LicenseBannerView: FC<LicenseBannerViewProps> = ({
	errors,
	warnings,
}) => {
	const theme = useTheme();
	const [showDetails, setShowDetails] = useState(false);
	const isError = errors.length > 0;
	const messages = [...errors, ...warnings];
	const type = isError ? "error" : "warning";

	const containerStyles = css`
    ${theme.typography.body2 as CSSObject}

    display: flex;
    align-items: center;
    padding: 12px;
    background-color: ${theme.roles[type].background};
  `;

	const textColor = theme.roles[type].text;

	if (messages.length === 1) {
		return (
			<div css={containerStyles}>
				<Pill type={type}>{Language.licenseIssue}</Pill>
				<div css={styles.leftContent}>
					<span>{messages[0]}</span>
					&nbsp;
					<Link
						color={textColor}
						fontWeight="medium"
						href="mailto:sales@coder.com"
					>
						{Language.upgrade}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div css={containerStyles}>
			<Pill type={type}>{Language.licenseIssues(messages.length)}</Pill>
			<div css={styles.leftContent}>
				<div>
					{Language.exceeded}
					&nbsp;
					<Link
						color={textColor}
						fontWeight="medium"
						href="mailto:sales@coder.com"
					>
						{Language.upgrade}
					</Link>
				</div>
				<Expander expanded={showDetails} setExpanded={setShowDetails}>
					<ul css={{ padding: 8, margin: 0 }}>
						{messages.map((message) => (
							<li css={{ margin: 4 }} key={message}>
								{message}
							</li>
						))}
					</ul>
				</Expander>
			</div>
		</div>
	);
};
