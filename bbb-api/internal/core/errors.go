package core

import (
	"fmt"
)

// A BBBError is a BigBlueButton specific error that
// may be surfaced when using a BBB API.
type BBBError struct {
	Key string
	Msg string
}

// Error returns a string containing information about
// the BBB error.
func (e *BBBError) Error() string {
	return fmt.Sprintf("%s:%s", e.Key, e.Msg)
}

// NewBBBError creates a new BigBlueButton error with the
// given error key and error message.
func NewBBBError(key string, msg string) *BBBError {
	return &BBBError{
		Key: key,
		Msg: msg,
	}
}
