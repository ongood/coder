import data from "@emoji-mart/data/sets/14/twitter.json"
import Picker from "@emoji-mart/react"
import Button from "@material-ui/core/Button"
import InputAdornment from "@material-ui/core/InputAdornment"
import Popover from "@material-ui/core/Popover"
import { makeStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import { Template, UpdateTemplateMeta } from "api/typesGenerated"
import { OpenDropdown } from "components/DropdownArrows/DropdownArrows"
import { FormFooter } from "components/FormFooter/FormFooter"
import { Stack } from "components/Stack/Stack"
import { FormikContextType, FormikTouched, useFormik } from "formik"
import { FC, useRef, useState } from "react"
import { colors } from "theme/colors"
import { getFormHelpers, nameValidator, onChangeTrimmed } from "util/formUtils"
import * as Yup from "yup"

export const Language = {
  nameLabel: "名称",
  descriptionLabel: "描述",
  maxTtlLabel: "允许运行时长",
  iconLabel: "图标",
  formAriaLabel: "模板设置",
  selectEmoji: "选择表情符号",
  ttlMaxError:
    "请输入小于或等于 24000 小时（1000 天）的允许运行时长。",
  descriptionMaxError:
    "请输入不超过128个字符的描述。",
  ttlHelperText: (ttl: number): string =>
    `由此模板创建的工作区的总运行时长不得超过 ${ttl} 小时。`,
}

const MAX_DESCRIPTION_CHAR_LIMIT = 128
const MAX_TTL_DAYS = 1000
const MS_HOUR_CONVERSION = 3600000

export const validationSchema = Yup.object({
  name: nameValidator(Language.nameLabel),
  description: Yup.string().max(
    MAX_DESCRIPTION_CHAR_LIMIT,
    Language.descriptionMaxError,
  ),
  max_ttl_ms: Yup.number()
    .integer()
    .min(0)
    .max(24 * MAX_TTL_DAYS /* 7 days in hours */, Language.ttlMaxError),
})

export interface TemplateSettingsForm {
  template: Template
  onSubmit: (data: UpdateTemplateMeta) => void
  onCancel: () => void
  isSubmitting: boolean
  error?: unknown
  // Helpful to show field errors on Storybook
  initialTouched?: FormikTouched<UpdateTemplateMeta>
}

export const TemplateSettingsForm: FC<TemplateSettingsForm> = ({
  template,
  onSubmit,
  onCancel,
  error,
  isSubmitting,
  initialTouched,
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const form: FormikContextType<UpdateTemplateMeta> =
    useFormik<UpdateTemplateMeta>({
      initialValues: {
        name: template.name,
        description: template.description,
        // on display, convert from ms => hours
        max_ttl_ms: template.max_ttl_ms / MS_HOUR_CONVERSION,
        icon: template.icon,
      },
      validationSchema,
      onSubmit: (formData) => {
        // on submit, convert from hours => ms
        onSubmit({
          ...formData,
          max_ttl_ms: formData.max_ttl_ms
            ? formData.max_ttl_ms * MS_HOUR_CONVERSION
            : undefined,
        })
      },
      initialTouched,
    })
  const getFieldHelpers = getFormHelpers<UpdateTemplateMeta>(form, error)
  const styles = useStyles()
  const hasIcon = form.values.icon && form.values.icon !== ""
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <form onSubmit={form.handleSubmit} aria-label={Language.formAriaLabel}>
      <Stack>
        <TextField
          {...getFieldHelpers("name")}
          disabled={isSubmitting}
          onChange={onChangeTrimmed(form)}
          autoFocus
          fullWidth
          label={Language.nameLabel}
          variant="outlined"
        />

        <TextField
          {...getFieldHelpers("description")}
          multiline
          disabled={isSubmitting}
          fullWidth
          label={Language.descriptionLabel}
          variant="outlined"
          rows={2}
        />

        <div className={styles.iconField}>
          <TextField
            {...getFieldHelpers("icon")}
            disabled={isSubmitting}
            fullWidth
            label={Language.iconLabel}
            variant="outlined"
            InputProps={{
              endAdornment: hasIcon ? (
                <InputAdornment position="end">
                  <img
                    alt=""
                    src={form.values.icon}
                    className={styles.adornment}
                    // This prevent browser to display the ugly error icon if the
                    // image path is wrong or user didn't finish typing the url
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    onLoad={(e) => (e.currentTarget.style.display = "inline")}
                  />
                </InputAdornment>
              ) : undefined,
            }}
          />

          <Button
            fullWidth
            ref={emojiButtonRef}
            variant="outlined"
            size="small"
            endIcon={<OpenDropdown />}
            onClick={() => {
              setIsEmojiPickerOpen((v) => !v)
            }}
          >
            {Language.selectEmoji}
          </Button>

          <Popover
            id="emoji"
            open={isEmojiPickerOpen}
            anchorEl={emojiButtonRef.current}
            onClose={() => {
              setIsEmojiPickerOpen(false)
            }}
          >
            <Picker
              theme="dark"
              data={data}
              onEmojiSelect={(emojiData) => {
                // See: https://github.com/missive/emoji-mart/issues/51#issuecomment-287353222
                form.setFieldValue(
                  "icon",
                  `/emojis/${emojiData.unified.replace(/-fe0f$/, "")}.png`,
                )
                setIsEmojiPickerOpen(false)
              }}
            />
          </Popover>
        </div>

        <TextField
          {...getFieldHelpers("max_ttl_ms")}
          disabled={isSubmitting}
          fullWidth
          inputProps={{ min: 0, step: 1 }}
          label={Language.maxTtlLabel}
          variant="outlined"
          type="number"
        />
        {/* If a value for max_ttl_ms has been entered and
        there are no validation errors for that field, display helper text.
        We do not use the MUI helper-text prop because it overrides the validation error */}
        {form.values.max_ttl_ms && !form.errors.max_ttl_ms && (
          <Typography variant="subtitle2">
            {Language.ttlHelperText(form.values.max_ttl_ms)}
          </Typography>
        )}
      </Stack>

      <FormFooter onCancel={onCancel} isLoading={isSubmitting} />
    </form>
  )
}

const useStyles = makeStyles((theme) => ({
  "@global": {
    "em-emoji-picker": {
      "--rgb-background": theme.palette.background.paper,
      "--rgb-input": colors.gray[17],
      "--rgb-color": colors.gray[4],
    },
  },
  adornment: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  iconField: {
    paddingBottom: theme.spacing(0.5),
  },
}))
