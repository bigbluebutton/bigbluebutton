package bbbhttp

import "net/url"

// A URLValidator is used to verify the authenticity
// and safety of a URL.
type URLValidator interface {
	ValidateURL(address string) error
}

// A DefaultURLValidator a URLValidator implementation
// that provides the most basic URL validation
// capabilities. More advanced URLValidator implementations
// should be used in favour of this one.
type DefaultURLValidator struct{}

// ValidateURL simply checks that the provided URL does not
// contain any unespecaped reserved characters.
func (v *DefaultURLValidator) ValidateURL(address string) error {
	_, err := url.Parse(address)
	if err != nil {
		return err
	}
	return nil
}
