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
	// Uses lists the target URLs it refers to, sinkUrl and fixtureUrl,
	// in its steps or its fixtures: a target that sets none skips it.
	Uses     []string
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

	Call     *CallStep     // KindCall
	Wait     time.Duration // KindWait
	Presence *PresenceStep // KindPresence
	GraphQL  *GraphQLStep  // KindGraphQL
	Bus      *BusStep      // KindBus
	FS       *FSStep       // KindFS
	Redis    *RedisStep    // KindRedis

	// Config is the step-type mapping of the kinds implemented by later
	// tickets (sink, env), as plain values. Their tickets give them types.
	Config map[string]any
	// RawExpect is the expect mapping of those kinds.
	RawExpect map[string]any

	Expect  *Expect // every kind but wait, sink and env
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

// PresenceStep makes a headless user join a meeting, leave it, drop their
// connection or reconnect. A join comes from exactly one of JoinURL, Args
// and SessionToken.
type PresenceStep struct {
	Action       string // join | leave | disconnect | reconnect
	As           string // the user's handle; a call step's client of that name shares its cookies
	JoinURL      string
	Args         []KV // join params, signed like a call step's
	SessionToken string
	Timeout      time.Duration
}

// GraphQLStep runs one GraphQL operation as a user who joined.
type GraphQLStep struct {
	As         string
	Op         *Operation
	Variables  any // ordered: maps are []Member, lists []any
	Timeout    time.Duration
	Eventually *Eventually
}

// BusStep looks for a message on the server's redis bus, through the
// target's tap.
type BusStep struct {
	Name      string
	Channel   string // any of the tap's channels when empty
	MeetingID string // the internal meeting ID; may be empty in serial cases
	Within    time.Duration
}

// FSStep looks for a file under the server's data directory, through the
// target's tap.
type FSStep struct {
	Path   string // relative, may be a glob
	Within time.Duration
}

// RedisStep reads a key from the server's redis, through the target's tap.
type RedisStep struct {
	Key    string
	Within time.Duration
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
	Mode     string // valid | uppercase | bad | duplicate | none | wrong-length | reencode
	Position string // first | middle | last
	Call     string // sign as this call name instead of the step's own
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

// Eventually polls a call or a GraphQL query until Until passes or Within
// runs out.
type Eventually struct {
	Within, Every time.Duration
	Until         *Expect
}

// Expect is what to check about an HTTP response, or about the document a
// presence or graphql step returns.
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
	Errors     *Matcher // graphql: matched against each error message

	// For bus, fs and redis steps.
	Absent     bool     // nothing matches during the whole window
	Exists     *bool    // fs, redis: false means gone at some point in the window
	Count      *Matcher // bus: how many messages match by the window's end
	Contents   *Matcher // fs
	Hash       []NamedMatcher
	Members    []string // redis: the exact set, in any order
	HasMembers bool
	TTL        *Matcher // redis
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
