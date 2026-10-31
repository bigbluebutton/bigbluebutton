package spec

// The known capabilities and tags. A typo in a case would otherwise
// silently skip it or leave it out of CI.

var knownCapabilities = set(
	"akka", "presence", "recordings-fs", "callbacks", "presentation-conversion",
	"bus", "fs", "redis", "clamav", "full-stack",
)

// KnownCapabilities lists the capabilities cases can require, sorted.
func KnownCapabilities() []string { return sortedKeys(knownCapabilities) }

var knownTags = set("ci", "slow", "disruptive", "full-stack", "presence", "conversion", "serial", "triage")

// builtinVars are always defined at run time.
var builtinVars = set("uid", "salt", "baseUrl", "sinkUrl", "fixtureUrl")

// targetURLs are the built-in variables a target may leave unset.
var targetURLs = set("sinkUrl", "fixtureUrl")

// stepKeys maps each key that names a step type to its kind.
var stepKeys = map[string]StepKind{
	"call": KindCall, "route": KindCall, "url": KindCall,
	"wait": KindWait, "presence": KindPresence, "graphql": KindGraphQL,
	"bus": KindBus, "fs": KindFS, "redis": KindRedis, "sink": KindSink, "env": KindEnv,
}

// stepKeyOrder is stepKeys in the order messages list them.
var stepKeyOrder = []string{"call", "route", "url", "wait", "presence", "graphql", "bus", "fs", "redis", "sink", "env"}

var bodyKinds = []string{"xml", "xmlFile", "form", "json", "raw", "multipart"}

func set(names ...string) map[string]bool {
	m := make(map[string]bool, len(names))
	for _, n := range names {
		m[n] = true
	}
	return m
}
