package cli

import (
	"fmt"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

func templateList() *cobra.Command {
	var (
		columns []string
	)
	cmd := &cobra.Command{
		Use:     "list",
		Short:   "List all the templates available for the organization",
		Aliases: []string{"ls"},
		RunE: func(cmd *cobra.Command, args []string) error {
			client, err := CreateClient(cmd)
			if err != nil {
				return err
			}
			organization, err := CurrentOrganization(cmd, client)
			if err != nil {
				return err
			}
			templates, err := client.TemplatesByOrganization(cmd.Context(), organization.ID)
			if err != nil {
				return err
			}

			if len(templates) == 0 {
				_, _ = fmt.Fprintf(cmd.ErrOrStderr(), "%s No templates found in %s! Create one:\n\n", Caret, color.HiWhiteString(organization.Name))
				_, _ = fmt.Fprintln(cmd.ErrOrStderr(), color.HiMagentaString("  $ coder templates create <directory>\n"))
				return nil
			}

			out, err := displayTemplates(columns, templates...)
			if err != nil {
				return err
			}

			_, err = fmt.Fprintln(cmd.OutOrStdout(), out)
			return err
		},
	}
	cmd.Flags().StringArrayVarP(&columns, "column", "c", []string{"name", "last_updated", "used_by"},
		"Specify a column to filter in the table.")
	return cmd
}
