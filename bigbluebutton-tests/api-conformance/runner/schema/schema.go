// Package schema embeds the JSON Schema of the case format, so the runner
// and editors check cases against the same file.
package schema

import _ "embed"

// Case is case.schema.json. It describes a case after variant expansion.
//
//go:embed case.schema.json
var Case []byte

// CaseURL is the schema's $id.
const CaseURL = "https://github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/schema/case.schema.json"
