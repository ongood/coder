import RefreshIcon from "@material-ui/icons/Refresh"
import { FC } from "react"
import {
  HelpTooltip,
  HelpTooltipAction,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "./HelpTooltip"

export const Language = {
  outdatedLabel: "过时",
  versionTooltipText:
    "此工作区版本已过时，有新版本可用。",
  updateVersionLabel: "更新版本",
}

interface TooltipProps {
  onUpdateVersion: () => void
  ariaLabel?: string
}

export const OutdatedHelpTooltip: FC<React.PropsWithChildren<TooltipProps>> = ({
  onUpdateVersion,
  ariaLabel,
}) => {
  return (
    <HelpTooltip size="small">
      <HelpTooltipTitle>{Language.outdatedLabel}</HelpTooltipTitle>
      <HelpTooltipText>{Language.versionTooltipText}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipAction
          icon={RefreshIcon}
          onClick={onUpdateVersion}
          ariaLabel={ariaLabel}
        >
          {Language.updateVersionLabel}
        </HelpTooltipAction>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  )
}
