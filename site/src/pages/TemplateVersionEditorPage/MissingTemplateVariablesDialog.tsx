import { css } from "@emotion/css";
import type { Interpolation, Theme } from "@emotion/react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { type FC, useEffect, useState } from "react";
import type {
  TemplateVersionVariable,
  VariableValue,
} from "api/typesGenerated";
import type { DialogProps } from "components/Dialogs/Dialog";
import { FormFields, VerticalForm } from "components/Form/Form";
import { Loader } from "components/Loader/Loader";
import { VariableInput } from "pages/CreateTemplatePage/VariableInput";

export type MissingTemplateVariablesDialogProps = Omit<
  DialogProps,
  "onSubmit"
> & {
  onClose: () => void;
  onSubmit: (values: VariableValue[]) => void;
  missingVariables?: TemplateVersionVariable[];
};

export const MissingTemplateVariablesDialog: FC<
  MissingTemplateVariablesDialogProps
> = ({ missingVariables, onSubmit, ...dialogProps }) => {
  const [variableValues, setVariableValues] = useState<VariableValue[]>([]);

  // Pre-fill the form with the default values when missing variables are loaded
  useEffect(() => {
    if (!missingVariables) {
      return;
    }
    setVariableValues(
      missingVariables.map((v) => ({ name: v.name, value: v.value })),
    );
  }, [missingVariables]);

  return (
    <Dialog
      {...dialogProps}
      scroll="body"
      aria-labelledby="update-build-parameters-title"
      maxWidth="xs"
      data-testid="dialog"
    >
      <DialogTitle
        id="update-build-parameters-title"
        classes={{ root: classNames.root }}
      >
          模板变量
      </DialogTitle>
      <DialogContent css={styles.content}>
        <DialogContentText css={styles.info}>
          有一些缺少的模板变量值，请填写它们。
        </DialogContentText>
        <VerticalForm
          css={styles.form}
          id="updateVariables"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(variableValues);
          }}
        >
          {missingVariables ? (
            <FormFields>
              {missingVariables.map((variable, index) => {
                return (
                  <VariableInput
                    defaultValue={variable.value}
                    variable={variable}
                    key={variable.name}
                    onChange={async (value) => {
                      setVariableValues((prev) => {
                        prev[index] = {
                          name: variable.name,
                          value,
                        };
                        return [...prev];
                      });
                    }}
                  />
                );
              })}
            </FormFields>
          ) : (
            <Loader />
          )}
        </VerticalForm>
      </DialogContent>
      <DialogActions disableSpacing css={styles.dialogActions}>
        <Button color="primary" fullWidth type="submit" form="updateVariables">
          提交
        </Button>
        <Button fullWidth type="button" onClick={dialogProps.onClose}>
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const classNames = {
  root: css`
    padding: 24px 40px;

    & h2 {
      font-size: 20px;
      font-weight: 400;
    }
  `,
};

const styles = {
  content: {
    padding: "0 40px",
  },

  info: {
    margin: 0,
  },

  form: {
    paddingTop: 32,
  },

  dialogActions: {
    padding: 40,
    flexDirection: "column",
    gap: 8,
  },
} satisfies Record<string, Interpolation<Theme>>;
