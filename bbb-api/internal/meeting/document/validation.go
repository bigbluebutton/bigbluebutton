package document

import (
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/url"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
)

var (
	supportedContentTypes = map[string]struct{}{
		bbbhttp.ContentTypeXLS: {}, bbbhttp.ContentTypeXLSX: {}, bbbhttp.ContentTypeDOC: {},
		bbbhttp.ContentTypeDOCX: {}, bbbhttp.ContentTypePPT: {}, bbbhttp.ContentTypePPTX: {},
		bbbhttp.ContentTypeODT: {}, bbbhttp.ContentTypeRTF: {}, bbbhttp.ContentTypeTXT: {},
		bbbhttp.ContentTypeODS: {}, bbbhttp.ContentTypeODP: {}, bbbhttp.ContentTypeODG: {},
		bbbhttp.ContentTypePDF: {}, bbbhttp.ContentTypeJPEG: {}, bbbhttp.ContentTypePNG: {},
		bbbhttp.ContentTypeSVG: {}, bbbhttp.ContentTypeTikaMSOffice: {},
		bbbhttp.ContentTypeTikaMSOfficeX: {}, bbbhttp.ContentTypeWEBP: {},
	}
)

func ValidateContentType(contentType, fileExt string) error {
	if contentType == "" {
		return errors.New("no content type provided")
	}
	if _, ok := supportedContentTypes[contentType]; !ok {
		return fmt.Errorf("content type %s is not supported", contentType)
	}
	if !FileExtMatchesContentType(fileExt, contentType) {
		return fmt.Errorf("file extension %s does not match content type %s", fileExt, contentType)
	}
	return nil
}

type PresentationURLValidator struct {
	SupportedProtocols []string
	BlockedHosts       []string
}

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
	if !validProtocol && len(v.SupportedProtocols) == 0 {
		return fmt.Errorf("invalid protocol: %s", u.Scheme)
	}

	var (
		oneSupportedProtocol  = len(v.SupportedProtocols) == 1
		allProtocolsSupported = strings.EqualFold(v.SupportedProtocols[0], "all")
	)

	if !validProtocol && oneSupportedProtocol && allProtocolsSupported {
		slog.Warn("Warning: All protocols are supported for presentation download. It is recommended to only allow HTTPS")
	}

	host := u.Hostname()
	for _, blocked := range v.BlockedHosts {
		if strings.EqualFold(blocked, host) {
			return fmt.Errorf("host blocked: %s", host)
		}
	}

	ips, err := net.LookupIP(host)
	if err != nil {
		return fmt.Errorf("unknown ost: %s", host)
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
