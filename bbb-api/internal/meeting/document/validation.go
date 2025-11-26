package document

import (
	"fmt"
	"log/slog"
	"net"
	"net/url"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
)

// PresentationURLValidator is a bbbhttp.URLValidator implementation
// that ensures the validity of URLs that are to be used for remote
// presentation document download. A collection of supported internet
// protocols, e.g. HTTP and HTTPS, and blocked hosts are used to assist
// in determining the validity of provided addresses.
type PresentationURLValidator struct {
	SupportedProtocols []string
	BlockedHosts       []string
}

// ValidateURL ensures that the provided internet address is valid for
// use as a source of presentation document. A valid URL must use a
// protocol that is supported and not come from a host that is blocked.
// If localhost is blocked then the address must also not be a local or
// loopback address unless the presentation is the default presentation.
func (v *PresentationURLValidator) ValidateURL(address string) error {
	u, err := url.Parse(address)
	if err != nil {
		return err
	}

	validProtocol := false
	for _, p := range v.SupportedProtocols {
		if strings.EqualFold(p, u.Scheme) {
			validProtocol = true
			break
		}
	}

	var (
		oneSupportedProtocol  = len(v.SupportedProtocols) == 1
		allProtocolsSupported = strings.EqualFold(v.SupportedProtocols[0], "all")
	)

	if !validProtocol && oneSupportedProtocol && allProtocolsSupported {
		slog.Warn("Warning: All protocols are supported for presentation download. It is recommended to only allow HTTPS")
	} else if !validProtocol {
		return fmt.Errorf("invalid protocol: %s", u.Scheme)
	}

	host := u.Hostname()
	for _, blocked := range v.BlockedHosts {
		if strings.EqualFold(blocked, host) {
			return fmt.Errorf("host blocked: %s", host)
		}
	}

	ips, err := net.LookupIP(host)
	if err != nil {
		return fmt.Errorf("unknown host: %s", host)
	}
	localhostBlocked := false
	for _, blocked := range v.BlockedHosts {
		if strings.EqualFold(blocked, "localhost") {
			localhostBlocked = true
		}
	}
	for _, ip := range ips {
		if ip == nil {
			return fmt.Errorf("invalid address for host: %s", host)
		}
		cfg := config.DefaultConfig()
		defaultPresentation := !strings.EqualFold(address, cfg.DefaultPresentation())
		if localhostBlocked && !defaultPresentation && (ip.IsLoopback() || ip.IsUnspecified()) {
			return fmt.Errorf("address is a local or loopback address: %s", ip)
		}
	}

	return nil
}
