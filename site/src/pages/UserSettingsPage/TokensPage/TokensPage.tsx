import { FC, PropsWithChildren, useState } from "react"
import { Section } from "components/SettingsLayout/Section"
import { TokensPageView } from "./TokensPageView"
import makeStyles from "@mui/styles/makeStyles"
import { useTranslation } from "react-i18next"
import { useTokensData } from "./hooks"
import { ConfirmDeleteDialog } from "./components"
import { Stack } from "components/Stack/Stack"
import Button from "@mui/material/Button"
import { Link as RouterLink } from "react-router-dom"
import AddIcon from "@mui/icons-material/AddOutlined"
import { APIKeyWithOwner } from "api/typesGenerated"

export const TokensPage: FC<PropsWithChildren<unknown>> = () => {
  const styles = useStyles()
  const { t } = useTranslation("tokensPage")

  const cliCreateCommand = "coder tokens create"

  const TokenActions = () => (
    <Stack direction="row" justifyContent="end" className={styles.tokenActions}>
      <Button startIcon={<AddIcon />} component={RouterLink} to="new">
        {t("添加令牌")}
      </Button>
    </Stack>
  )

  const [tokenToDelete, setTokenToDelete] = useState<
    APIKeyWithOwner | undefined
  >(undefined)

  const {
    data: tokens,
    error: getTokensError,
    isFetching,
    isFetched,
    queryKey,
  } = useTokensData({
    // we currently do not show all tokens in the UI, even if
    // the user has read all permissions
    include_all: false,
  })

  return (
    <>
      <Section
        title={t("title")}
        className={styles.section}
        description={
          <>
            使用令牌与 Coder API 进行身份验证。您可以使用 Coder CLI 的<code>{cliCreateCommand}</code>{" "}命令创建一个令牌。
          </>
        }
        layout="fluid"
      >
        <TokenActions />
        <TokensPageView
          tokens={tokens}
          isLoading={isFetching}
          hasLoaded={isFetched}
          getTokensError={getTokensError}
          onDelete={(token) => {
            setTokenToDelete(token)
          }}
        />
      </Section>
      <ConfirmDeleteDialog
        queryKey={queryKey}
        token={tokenToDelete}
        setToken={setTokenToDelete}
      />
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  section: {
    "& code": {
      background: theme.palette.divider,
      fontSize: 12,
      padding: "2px 4px",
      color: theme.palette.text.primary,
      borderRadius: 2,
    },
  },
  tokenActions: {
    marginBottom: theme.spacing(1),
  },
}))

export default TokensPage
