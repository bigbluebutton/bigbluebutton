package common

const (
	ReturnCodeSuccess = "SUCCESS"
	ReturnCodeFailure = "FAILED"

	UnknownErrorKey = "unknownError"
	UnknownErrorMsg = "An unknown error occurred"

	ValidationErrorKey string = "validationError"

	ChecksumErrorKey string = "checksumError"
	ChecksumErrorMsg string = "Checksums do not match."

	ContentTypeErrorKey string = "unsupportedContentType"
	ContentTypeErrorMsg string = "POST request Content-Type is missing or unsupported"
)
