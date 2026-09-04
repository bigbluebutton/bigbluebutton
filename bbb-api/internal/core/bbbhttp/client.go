package bbbhttp

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// A Client is an interface that wraps the basic HTTP functionality
// of following redirects from an initial URL and downloading
// remote resources.
type Client interface {
	Download(address string) ([]byte, error)
	Follow(address string, count, max int) (string, error)
	URLValidator
}

// A NoRedirectClient is a [Client] implementation that does not
// automatically follow redirects.
type NoRedirectClient struct {
	*http.Client
	URLValidator
}

// NewNoRedirectClient creates a new NoRedirectClient that uses the
// speified timeout for requests and a default validator for URLs.
func NewNoRedirectClient(timeout time.Duration) *NoRedirectClient {
	return &NoRedirectClient{
		Client: &http.Client{
			Timeout: timeout,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
		URLValidator: &DefaultURLValidator{},
	}
}

// Download sends a request to the provided address attempting to
// download any resources made available at that URL. Returns
// either the raw content bytes of the resource or an error if
// the request fails.
func (c *NoRedirectClient) Download(address string) ([]byte, error) {
	resp, err := c.Get(address)
	if err != nil {
		return nil, fmt.Errorf("presentation download request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected presentation download response status: %d", resp.StatusCode)
	}

	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read presentation content: %w", err)
	}

	return content, nil
}

// Follow recursively follows redirects starting from the provided address
// until one of the following occurs: a final non-redirect address is reached,
// the max number of redirects is reached, or one of the HTTP requests fails.
// Returns the final address if it is reached or an error otherwise.
func (c *NoRedirectClient) Follow(address string, count, max int) (string, error) {
	if count > max {
		return "", errors.New("maximum number of redirects reached")
	}

	err := c.ValidateURL(address)
	if err != nil {
		return "", fmt.Errorf("invalid URL: %w", err)
	}

	u, err := url.Parse(address)
	if err != nil {
		return "", fmt.Errorf("failed to parse address: %w", err)
	}

	client := &http.Client{
		Timeout: 60 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	req, err := http.NewRequest(http.MethodGet, u.String(), nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Accept-Language", "en-US,en;q=0.8")
	req.Header.Set("User-Agent", "Mozilla")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusMovedPermanently, http.StatusFound, http.StatusSeeOther:
		next := resp.Header.Get("Location")
		return c.Follow(next, count+1, max)

	case http.StatusOK:
		return address, nil

	default:
		return "", fmt.Errorf("unexpected HTTP response status: %d", resp.StatusCode)
	}
}
