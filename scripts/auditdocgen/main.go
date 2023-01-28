package main

import (
	"bytes"
	"flag"
	"log"
	"os"
	"sort"
	"strconv"
	"strings"

	"golang.org/x/xerrors"

	"github.com/coder/coder/enterprise/audit"
)

var (
	auditDocFile string
	dryRun       bool

	generatorPrefix = []byte("<!-- Code generated by 'make docs/admin/audit-logs.md'. DO NOT EDIT -->")
	generatorSuffix = []byte("<!-- End generated by 'make docs/admin/audit-logs.md'. -->")
)

/*
*
AuditableResourcesMap is derived from audit.AuditableResources
and has the following structure:

	{
		friendlyResourceName: {
			fieldName1: isTracked,
			fieldName2: isTracked,
			...
		},
		...
	}
*/
type AuditableResourcesMap map[string]map[string]bool

func main() {
	flag.StringVar(&auditDocFile, "audit-doc-file", "docs/admin/audit-logs.md", "Path to audit log doc file")
	flag.BoolVar(&dryRun, "dry-run", false, "Dry run")
	flag.Parse()

	auditableResourcesMap := readAuditableResources()

	doc, err := readAuditDoc()
	if err != nil {
		log.Fatal("can't read audit doc: ", err)
	}

	doc, err = updateAuditDoc(doc, auditableResourcesMap)
	if err != nil {
		log.Fatal("can't update audit doc: ", err)
	}

	if dryRun {
		log.Println(string(doc))
		return
	}

	err = writeAuditDoc(doc)
	if err != nil {
		log.Fatal("can't write updated audit doc: ", err)
	}
}

// Transforms audit.AuditableResources to AuditableResourcesMap,
// which uses friendlier language.
func readAuditableResources() AuditableResourcesMap {
	auditableResourcesMap := make(AuditableResourcesMap)

	for resourceName, resourceFields := range audit.AuditableResources {
		friendlyResourceName := strings.Split(resourceName, ".")[2]
		fieldNameMap := make(map[string]bool)
		for fieldName, action := range resourceFields {
			fieldNameMap[fieldName] = action != audit.ActionIgnore
			auditableResourcesMap[friendlyResourceName] = fieldNameMap
		}
	}

	return auditableResourcesMap
}

func readAuditDoc() ([]byte, error) {
	doc, err := os.ReadFile(auditDocFile)
	if err != nil {
		return nil, err
	}

	return doc, nil
}

// Writes a markdown table of audit log resources to a buffer
func updateAuditDoc(doc []byte, auditableResourcesMap AuditableResourcesMap) ([]byte, error) {
	// We must sort the resources to ensure table ordering
	sortedResourceNames := sortKeys(auditableResourcesMap)

	i := bytes.Index(doc, generatorPrefix)
	if i < 0 {
		return nil, xerrors.New("generator prefix tag not found")
	}
	tableStartIndex := i + len(generatorPrefix) + 1

	j := bytes.Index(doc[tableStartIndex:], generatorSuffix)
	if j < 0 {
		return nil, xerrors.New("generator suffix tag not found")
	}
	tableEndIndex := tableStartIndex + j

	var buffer bytes.Buffer
	buffer.Write(doc[:tableStartIndex])
	buffer.WriteByte('\n')

	buffer.WriteString("|<b>Resource<b>||\n")
	buffer.WriteString("|--|-----------------|\n")

	for _, resourceName := range sortedResourceNames {
		// Create a string of audit actions for each resource
		var auditActions []string
		for _, action := range audit.AuditActionMap[resourceName] {
			auditActions = append(auditActions, string(action))
		}
		auditActionsString := strings.Join(auditActions, ", ")

		// AuditableGroup is really a combination of Group and GroupMember resources
		// but we use the label 'Group' in our docs to avoid confusion.
		if resourceName == "AuditableGroup" {
			resourceName = "Group"
		}

		buffer.WriteString("|" + resourceName + "<br><i>" + auditActionsString + "</i>|<table><thead><tr><th>Field</th><th>Tracked</th></tr></thead><tbody>")

		// We must sort the field names to ensure sub-table ordering
		sortedFieldNames := sortKeys(auditableResourcesMap[resourceName])

		for _, fieldName := range sortedFieldNames {
			isTracked := auditableResourcesMap[resourceName][fieldName]
			buffer.WriteString("<tr><td>" + fieldName + "</td><td>" + strconv.FormatBool(isTracked) + "</td></tr>")
		}

		buffer.WriteString("</tbody></table>\n")
	}

	buffer.WriteString("\n")
	buffer.Write(doc[tableEndIndex:])
	return buffer.Bytes(), nil
}

func writeAuditDoc(doc []byte) error {
	// G306: Expect WriteFile permissions to be 0600 or less
	/* #nosec G306 */
	return os.WriteFile(auditDocFile, doc, 0644)
}

func sortKeys[T any](stringMap map[string]T) []string {
	var keyNames []string
	for key := range stringMap {
		keyNames = append(keyNames, key)
	}
	sort.Strings(keyNames)
	return keyNames
}
