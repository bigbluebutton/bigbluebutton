package bbbhttp

import "net/url"

type URLValidator interface {
	ValidateURL(address string) error
}

type DefaultURLValidator struct{}

func (v *DefaultURLValidator) ValidateURL(address string) error {
	_, err := url.Parse(address)
	if err != nil {
		return err
	}
	return nil
}
