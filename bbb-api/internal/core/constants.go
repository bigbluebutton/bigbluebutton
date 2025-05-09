package core

import "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"

const (
	ChecksumParam = "checksum"

	SHA1   = "sha-1"
	SHA256 = "sha-256"
	SHA384 = "sha-384"
	SHA512 = "sha-512"

	// Context keys
	ParamsKey            pipeline.ContextKey = "params"
	ProcessXMLModulesKey pipeline.ContextKey = "processXMLModules"
	RequestBodyKey       pipeline.ContextKey = "requestBody"
)
