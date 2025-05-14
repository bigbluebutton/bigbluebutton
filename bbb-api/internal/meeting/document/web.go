package document

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const (
	MaxRedirects = 5
)

func DownloadPresentation(url string) ([]byte, error) {
	finalURL, err := Follow(url, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to follow URL: %w", err)
	}

	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	resp, err := client.Get(finalURL)
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

func Follow(address string, count int) (string, error) {
	if count > MaxRedirects {
		return "", errors.New("maximum number of redirects reached")
	}

	// cfg := config.DefaultConfig()
	// err := ValidateURL(address, cfg.Presentation.Upload.Protocols, cfg.Presentation.Upload.BlockedHosts)
	// if err != nil {
	// 	return "", fmt.Errorf("invalid URL: %w", err)
	// }

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
		return Follow(next, count+1)

	case http.StatusOK:
		return address, nil

	default:
		return "", fmt.Errorf("unexpected HTTP response status: %d", resp.StatusCode)
	}
}
