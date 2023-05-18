import { TemplateVersionParameter } from "api/typesGenerated"
import { FormSection, FormFields } from "components/Form/Form"
import {
  RichParameterInput,
  RichParameterInputProps,
} from "components/RichParameterInput/RichParameterInput"
import { ComponentProps, FC } from "react"

export type TemplateParametersSectionProps = {
  templateParameters: TemplateVersionParameter[]
  getInputProps: (
    parameter: TemplateVersionParameter,
    index: number,
  ) => Omit<RichParameterInputProps, "parameter" | "index">
} & Pick<ComponentProps<typeof FormSection>, "classes">

export const MutableTemplateParametersSection: FC<
  TemplateParametersSectionProps
> = ({ templateParameters, getInputProps, ...formSectionProps }) => {
  const hasMutableParameters =
    templateParameters.filter((p) => p.mutable).length > 0

  return (
    <>
      {hasMutableParameters && (
        <FormSection
          {...formSectionProps}
          title="参数"
          description="这些参数由您的模板的 Terraform 配置提供，并可以在创建工作区后进行更改。"
        >
          <FormFields>
            {templateParameters.map(
              (parameter, index) =>
                parameter.mutable && (
                  <RichParameterInput
                    {...getInputProps(parameter, index)}
                    index={index}
                    key={parameter.name}
                    parameter={parameter}
                  />
                ),
            )}
          </FormFields>
        </FormSection>
      )}
    </>
  )
}

export const ImmutableTemplateParametersSection: FC<
  TemplateParametersSectionProps
> = ({ templateParameters, getInputProps, ...formSectionProps }) => {
  const hasImmutableParameters =
    templateParameters.filter((p) => !p.mutable).length > 0

  return (
    <>
      {hasImmutableParameters && (
        <FormSection
          {...formSectionProps}
          title="Immutable parameters"
          description={
            <>
              These parameters are also provided by your Terraform configuration
              but they{" "}
              <strong>cannot be changed after creating the workspace.</strong>
            </>
          }
        >
          <FormFields>
            {templateParameters.map(
              (parameter, index) =>
                !parameter.mutable && (
                  <RichParameterInput
                    {...getInputProps(parameter, index)}
                    index={index}
                    key={parameter.name}
                    parameter={parameter}
                  />
                ),
            )}
          </FormFields>
        </FormSection>
      )}
    </>
  )
}
