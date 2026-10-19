// Package spec loads and checks test cases.
//
// Loading a file resolves YAML anchors and merge keys, expands variants,
// checks each expanded case against schema/case.schema.json, then decodes it
// into the types below and checks what the schema can't: templates,
// variables, XPath and JSONPath expressions, regexes and fixture files.
//
// String fields keep their ${...} templates; the runner expands them per run.
package spec

import "time"

// Case is one test case, after variant expansion.
type Case struct {
	ID       string
	Title    string
	Endpoint string
	Class    string // contract | compat | defect
	Tags     []string
	// Requires lists the capabilities the target must declare, including the
	// ones the case's step types imply (see StepKind.Capability).
	Requires []string
	Profile  string
	Variant  string            // the variant ID, or "" for a case without variants
	Vars     map[string]string // the variant's vars; null vars are absent
	Steps    []Step
	Teardown []Step
	File     string
	Line     int
}

// StepKind is a step type.
type StepKind string

const (
	KindCall     StepKind = "call"
	KindWait     StepKind = "wait"
	KindPresence StepKind = "presence"
	KindGraphQL  StepKind = "graphql"
	KindBus      StepKind = "bus"
	KindFS       StepKind = "fs"
	KindRedis    StepKind = "redis"
	KindSink     StepKind = "sink"
	KindEnv      StepKind = "env"
)

// Capability returns the target capability a step type needs, or "".
func (k StepKind) Capability() string {
	switch k {
	case KindPresence, KindGraphQL:
		return "presence"
	case KindBus:
		return "bus"
	case KindFS:
		return "fs"
	case KindRedis:
		return "redis"
	case KindSink:
		return "callbacks"
	}
	return ""
}

// Step is one step of a case.
type Step struct {
	Kind StepKind
	Line int

	Call *CallStep     // KindCall
	Wait time.Duration // KindWait

	// Config is the step-type mapping of the kinds implemented by later
	// tickets (presence, graphql, bus, fs, redis, sink, env), as plain
	// values. Their tickets give them types.
	Config map[string]any
	// RawExpect is the expect mapping of those kinds.
	RawExpect map[string]any

	Expect  *Expect // KindCall
	Capture []Capture
	Golden  string // compare | document | off; "" means the default
}

// CallStep is an HTTP request and what to check about the response.
type CallStep struct {
	// Exactly one of Call (an API call name, "" for the version endpoint),
	// Route or URL is set; HasCall tells an empty Call from no Call.
	Call       string
	HasCall    bool
	Route      string
	PathParams []KV
	URL        string

	Method          string // GET when not given
	Sign            Sign
	Params          []KV
	RawQuery        string
	HasRawQuery     bool
	Headers         []Header
	Body            *Body
	Client          string
	FollowRedirects bool
	Timeout         time.Duration
	IgnoreResult    bool
	Eventually      *Eventually
}

// KV is one ordered key/value pair. Values are kept as written.
type KV struct {
	Key, Value string
}

// Header is a request header. Remove means "don't send the default".
type Header struct {
	Name, Value string
	Remove      bool
}

// Sign says how to sign a call. Empty fields mean "use the default".
type Sign struct {
	Alg      string // sha1 | sha256 | sha384 | sha512
	Mode     string // valid | uppercase | bad | duplicate | none
	Position string // first | middle | last
	Set      bool   // the case gave sign explicitly
}

// Body is a request body. Kind is xml, xmlFile, form, json, raw or multipart.
type Body struct {
	Kind        string
	Text        string // xml and raw
	Path        string // xmlFile, under the fixtures directory
	Form        []KV
	JSON        any // ordered: maps are []Member, lists []any
	Multipart   *Multipart
	ContentType string
	Chunked     bool
}

// Member is one key of a JSON object, in order.
type Member struct {
	Key   string
	Value any
}

// Multipart is a multipart/form-data body.
type Multipart struct {
	Fields []KV
	Files  []File
}

// File is one file part. Exactly one of Path and Content is set.
type File struct {
	Field       string
	Path        string
	Content     string
	HasContent  bool
	Filename    string
	ContentType string
}

// Eventually polls a call until Until passes or Within runs out.
type Eventually struct {
	Within, Every time.Duration
	Until         *Expect
}

// Expect is what to check about an HTTP response.
type Expect struct {
	Status     *Matcher
	Headers    []NamedMatcher
	Format     string // xml | json | text
	Returncode *Matcher
	MessageKey *Matcher
	Message    *Matcher
	XPath      []NamedMatcher
	JSONPath   []NamedMatcher
	Body       *Matcher
	Redirect   *RedirectExpect
	Schema     string
}

// RedirectExpect checks the parsed Location header.
type RedirectExpect struct {
	Host, Path *Matcher
	Query      []NamedMatcher
}

// Matcher compares one value. Op is eq, exists, absent, regex, type, oneOf,
// count or contains. Arg and Args may hold templates.
type Matcher struct {
	Op   string
	Arg  string
	Args []string
	N    int
	Line int
}

// NamedMatcher applies a matcher to the value Key selects.
type NamedMatcher struct {
	Key  string
	M    Matcher
	Line int
}

// Capture stores what Expr selects as variable Name.
type Capture struct {
	Name, Expr string
	Line       int
}
