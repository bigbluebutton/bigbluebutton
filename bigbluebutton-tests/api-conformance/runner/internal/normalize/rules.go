// Package normalize turns a response into ordered, reviewable lines in
// which the values that change from run to run are masked, so two runs, or
// two implementations, can be compared line by line. diff uses it, and
// record mode stores its output as recordings.
package normalize

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"os"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
)

// Rules configure normalization.
type Rules struct {
	Masks     []Mask      `yaml:"masks"`
	Unordered []Unordered `yaml:"unordered"`
	Scope     []Scope     `yaml:"scope"`
	Drop      []Drop      `yaml:"drop"`
	// Headers are response headers to compare beyond the fixed set.
	Headers []string `yaml:"headers"`
}

// Mask rewrites the values of a field (an XML element or attribute, a JSON
// key, a query param or a header, at any depth) or of a path.
type Mask struct {
	Field   string `yaml:"field"`
	Path    string `yaml:"path"`
	As      string `yaml:"as"` // time | date | internal-id | user-id | random | token | regex
	Regex   string `yaml:"regex"`
	Replace string `yaml:"replace"`

	re   *regexp.Regexp
	path *regexp.Regexp
}

// Unordered sorts the repeated nodes a path names by Key: a child's name,
// "@attr", "#name" for the node's own name, or "" for the whole node.
type Unordered struct {
	Path string `yaml:"path"`
	Key  string `yaml:"key"`

	re *regexp.Regexp
}

// Scope drops the repeated nodes a path names whose Key value doesn't
// contain the case's ${uid} and isn't the internal ID of a meeting whose ID
// does: getMeetings and getSessions list every meeting on the server.
type Scope struct {
	Path string `yaml:"path"`
	Key  string `yaml:"key"`

	re *regexp.Regexp
}

// Drop removes the nodes a path names, only those with Value if it is
// given: lines that depend on something outside the case.
type Drop struct {
	Path  string `yaml:"path"`
	Value string `yaml:"value"`

	re *regexp.Regexp
}

var kinds = map[string]bool{"time": true, "date": true, "internal-id": true, "user-id": true, "random": true, "token": true, "regex": true}

// Default returns the built-in rules.
func Default() *Rules {
	r := &Rules{
		Masks: []Mask{
			{Field: "createTime", As: "time"},
			{Field: "startTime", As: "time"},
			{Field: "endTime", As: "time"},
			{Field: "createDate", As: "date"},
			{Field: "internalMeetingID", As: "internal-id"},
			{Field: "meeting_id", As: "internal-id"},
			{Field: "parentMeetingID", As: "internal-id"},
			{Field: "recordID", As: "internal-id"},
			{Field: "userID", As: "user-id"},
			{Field: "user_id", As: "user-id"},
			{Field: "internalUserID", As: "user-id"},
			{Field: "existingUserID", As: "user-id"},
			// GraphQL's names for them, in presence and graphql steps.
			{Field: "userId", As: "user-id"},
			{Field: "extId", As: "user-id"},
			{Field: "meetingId", As: "internal-id"},
			{Field: "parentMeetingId", As: "internal-id"},
			{Field: "registeredOn", As: "time"},
			{Field: "registeredAt", As: "time"},
			// What changes from run to run in bus messages, redis values
			// and files: the side-effect steps' documents.
			{Field: "timestamp", As: "time"},
			{Field: "createdTime", As: "time"},
			{Field: "createdDate", As: "date"},
			{Field: "intId", As: "internal-id"},
			{Field: "parentId", As: "internal-id"},
			{Field: "internalId", As: "internal-id"},
			{Field: "breakoutMeetingId", As: "internal-id"},
			{Field: "moderatorPass", As: "random"},
			{Field: "viewerPass", As: "random"},
			{Field: "voiceConf", As: "random"},
			{Field: "telVoice", As: "random"},
			{Path: "$/ttl", As: "regex", Regex: `^[1-9][0-9]*$`, Replace: "<set>"},
			{Path: "$/path", As: "regex", Regex: `^(learning-dashboard/[^/]+/)[^/]+/`, Replace: "${1}<token>/"},
			{Field: "attendeePW", As: "random"},
			{Field: "moderatorPW", As: "random"},
			{Field: "moderatorPw", As: "random"},
			{Field: "voiceBridge", As: "random"},
			{Field: "session_token", As: "token"},
			{Field: "sessionToken", As: "token"},
			{Field: "auth_token", As: "token"},
			{Field: "authToken", As: "token"},
			{Field: "learningDashboardAccessToken", As: "token"},
			{Field: "replaceSessionToken", As: "token"},
			{Field: "checksum", As: "token"},
			{Field: "JSESSIONID", As: "token"},
			// stuns: TURN credentials are "<expiry>:<user>" and an HMAC of it.
			{Path: "turnServers[]/username", As: "regex", Regex: `^\d+:`, Replace: "<expiry>:"},
			{Path: "turnServers[]/password", As: "token"},
		},
		Unordered: []Unordered{
			{Path: "meetings/meeting", Key: "meetingID"},
			{Path: "recordings/recording", Key: "recordID"},
			{Path: "metadata/*", Key: "#name"},
			{Path: "attendees/attendee", Key: "userID"},
			{Path: "sessions/meeting", Key: ""},
			{Path: "stunServers[]", Key: ""},
			{Path: "turnServers[]", Key: ""},
			{Path: "remoteIceCandidates[]", Key: ""},
		},
		Scope: []Scope{
			{Path: "meetings/meeting", Key: "meetingID"},
			// getSessions names a session's meeting by its internal ID.
			{Path: "sessions/meeting", Key: "meetingID"},
		},
		// getMeetings says noMeetings only when the whole server has none,
		// which other cases decide, and getSessions noSessions likewise. A
		// case's own view is its scoped list. Unanchored, like the scope
		// rule, so they match XML and JSON.
		Drop: []Drop{
			{Path: "response/messageKey", Value: "noMeetings"},
			{Path: "response/message", Value: "no meetings were found on this server"},
			{Path: "response/messageKey", Value: "noSessions"},
			{Path: "response/message", Value: "no sessions were found on this server"},
		},
	}
	if err := r.compile(); err != nil {
		panic(err) // the built-in rules are fixed
	}
	return r
}

// Load reads a rules file and puts its rules before the built-in ones, so a
// file's mask for a field wins over the default.
func Load(name string) (*Rules, error) {
	data, err := os.ReadFile(name)
	if err != nil {
		return nil, err
	}
	extra := &Rules{}
	dec := yaml.NewDecoder(bytes.NewReader(data))
	dec.KnownFields(true)
	if err := dec.Decode(extra); err != nil && err.Error() != "EOF" {
		return nil, fmt.Errorf("%s: %w", name, err)
	}
	if err := extra.compile(); err != nil {
		return nil, fmt.Errorf("%s: %w", name, err)
	}
	def := Default()
	return &Rules{
		Masks:     append(extra.Masks, def.Masks...),
		Unordered: append(extra.Unordered, def.Unordered...),
		Scope:     append(extra.Scope, def.Scope...),
		Drop:      append(extra.Drop, def.Drop...),
		Headers:   append(extra.Headers, def.Headers...),
	}, nil
}

func (r *Rules) compile() error {
	for i := range r.Masks {
		m := &r.Masks[i]
		if (m.Field == "") == (m.Path == "") {
			return fmt.Errorf("masks[%d]: give field or path", i)
		}
		if !kinds[m.As] {
			return fmt.Errorf("masks[%d]: unknown kind %q", i, m.As)
		}
		if m.As == "regex" {
			re, err := regexp.Compile(m.Regex)
			if err != nil || m.Regex == "" {
				return fmt.Errorf("masks[%d]: bad regex %q", i, m.Regex)
			}
			m.re = re
		}
		if m.Path != "" {
			m.path = pathPattern(m.Path)
		}
	}
	for i := range r.Unordered {
		if r.Unordered[i].Path == "" {
			return fmt.Errorf("unordered[%d]: path is required", i)
		}
		r.Unordered[i].re = pathPattern(r.Unordered[i].Path)
	}
	for i := range r.Scope {
		if r.Scope[i].Path == "" || r.Scope[i].Key == "" {
			return fmt.Errorf("scope[%d]: path and key are required", i)
		}
		r.Scope[i].re = pathPattern(r.Scope[i].Path)
	}
	for i := range r.Drop {
		if r.Drop[i].Path == "" {
			return fmt.Errorf("drop[%d]: path is required", i)
		}
		r.Drop[i].re = pathPattern(r.Drop[i].Path)
	}
	return nil
}

// pathPattern matches node paths. A pattern starting with / or $ is
// anchored; any other matches a path's last segments. * matches one segment.
func pathPattern(p string) *regexp.Regexp {
	var b strings.Builder
	switch {
	case strings.HasPrefix(p, "/"), strings.HasPrefix(p, "$"):
		b.WriteString("^")
	default:
		b.WriteString(`(^|/)`)
	}
	for _, c := range p {
		if c == '*' {
			b.WriteString(`[^/]+`)
			continue
		}
		b.WriteString(regexp.QuoteMeta(string(c)))
	}
	b.WriteString("$")
	return regexp.MustCompile(b.String())
}

// maskFor returns the first mask for a node with this name and path.
func (r *Rules) maskFor(name, path string) *Mask {
	for i := range r.Masks {
		m := &r.Masks[i]
		if (m.Field != "" && m.Field == name) || (m.path != nil && m.path.MatchString(path)) {
			return m
		}
	}
	return nil
}

var (
	internalIDRe = regexp.MustCompile(`^([0-9a-f]{40})-([0-9]+)$`)
	userIDRe     = regexp.MustCompile(`^w_[a-z0-9]{12}$`)
	digitsRe     = regexp.MustCompile(`^[0-9]+$`)
	isoTimeRe    = regexp.MustCompile(`^[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}(:?[0-9]{2})?)?$`)
	javaDateRe   = regexp.MustCompile(`^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} [A-Z][A-Za-z0-9+:-]{1,9} [0-9]{4}$`)
	anyDigitRe   = regexp.MustCompile(`[0-9]`)
)

// apply masks one raw value.
func (m *Mask) apply(v string, ctx *Context) string {
	if v == "" {
		return v
	}
	switch m.As {
	case "time":
		// 0 too: startTime turns from 0 to a time a moment after create
		// answers, so a step may read either. Check that a running
		// meeting's endTime is 0 with expect.
		if digitsRe.MatchString(v) || isoTimeRe.MatchString(v) {
			return "<time>"
		}
	case "date":
		if javaDateRe.MatchString(v) {
			return "<date>"
		}
		return anyDigitRe.ReplaceAllString(v, "9")
	case "internal-id":
		if g := internalIDRe.FindStringSubmatch(v); g != nil {
			return "<sha1(" + ctx.preimage(g[1]) + ")>-<time>"
		}
		if len(v) == 40 && isHex(v) {
			return "<sha1(" + ctx.preimage(v) + ")>"
		}
	case "user-id":
		if userIDRe.MatchString(v) {
			return "w_<id>"
		}
	case "random":
		if _, sent := ctx.Sent[v]; !sent {
			return "<random>"
		}
	case "token":
		return "<token>"
	case "regex":
		return m.re.ReplaceAllString(v, m.Replace)
	}
	return v
}

func isHex(s string) bool {
	_, err := hex.DecodeString(s)
	return err == nil
}

// preimage names the sent param whose SHA-1 is sum, or "?".
func (c *Context) preimage(sum string) string {
	if _, name := c.sentWithSHA1(sum); name != "" {
		return name
	}
	return "?"
}

// sentWithSHA1 returns the sent value whose SHA-1 is sum and the param that
// carried it, or two empty strings.
func (c *Context) sentWithSHA1(sum string) (value, name string) {
	for v, n := range c.Sent {
		h := sha1.Sum([]byte(v))
		if hex.EncodeToString(h[:]) == sum {
			return v, n
		}
	}
	return "", ""
}
