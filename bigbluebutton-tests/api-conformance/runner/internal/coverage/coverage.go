// Package coverage summarises what the suite reaches of bbb-web, from the
// XML report JaCoCo's command line writes (make -C env coverage).
//
// A triage file (coverage/triage.yaml) says which packages are in scope,
// which generated methods to ignore, and what each method the suite doesn't
// reach is: behaviour a case should cover, code with no effect, or code left
// out with a reason. A baseline (coverage/baseline.json) holds the numbers a
// later run is compared with.
package coverage

import (
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"go.yaml.in/yaml/v3"
)

// Counter is a JaCoCo counter: how many items were covered and missed.
type Counter struct {
	Covered int `json:"covered"`
	Missed  int `json:"missed"`
}

func (c *Counter) add(o Counter) { c.Covered += o.Covered; c.Missed += o.Missed }

// Total is covered plus missed.
func (c Counter) Total() int { return c.Covered + c.Missed }

// Percent is the covered share, 0 to 100, and 100 for an empty counter.
func (c Counter) Percent() float64 {
	if c.Total() == 0 {
		return 100
	}
	return 100 * float64(c.Covered) / float64(c.Total())
}

// Method is one method JaCoCo reported.
type Method struct {
	Class   string // the class's name with dots: org.bigbluebutton.api.MeetingService, inner classes with $
	Package string // org.bigbluebutton.api
	Name    string
	Desc    string // the JVM descriptor, (Ljava/lang/String;)Z
	Line    int    // the first line, 0 if unknown
	Source  string // the source file's path from its package root, e.g. org/bigbluebutton/web/controllers/ApiController.groovy
	Reached bool
	// Branches are the method's own: a branch belongs to one method, so
	// they add up. Its line counter doesn't: see Report.Lines.
	Branches Counter
}

// ID names a method for people: Class#name, or Class#name(desc) when the
// name is overloaded.
func (m Method) ID(withDesc bool) string {
	if withDesc {
		return m.Class + "#" + m.Name + m.Desc
	}
	return m.Class + "#" + m.Name
}

// Report is the methods of one JaCoCo report, and its line counters per
// package.
type Report struct {
	Name    string
	Methods []Method
	// Lines holds JaCoCo's line counter for each package, by name with
	// dots. A source line two methods share (a lambda's, a Scala case
	// class's) counts once there; the methods' own line counters would
	// count it twice.
	Lines map[string]Counter
}

type xmlCounter struct {
	Type    string `xml:"type,attr"`
	Missed  int    `xml:"missed,attr"`
	Covered int    `xml:"covered,attr"`
}

type xmlMethod struct {
	Name     string       `xml:"name,attr"`
	Desc     string       `xml:"desc,attr"`
	Line     int          `xml:"line,attr"`
	Counters []xmlCounter `xml:"counter"`
}

type xmlClass struct {
	Name       string      `xml:"name,attr"`
	SourceFile string      `xml:"sourcefilename,attr"`
	Methods    []xmlMethod `xml:"method"`
}

type xmlPackage struct {
	Name     string       `xml:"name,attr"`
	Classes  []xmlClass   `xml:"class"`
	Counters []xmlCounter `xml:"counter"`
}

type xmlGroup struct {
	Groups   []xmlGroup   `xml:"group"`
	Packages []xmlPackage `xml:"package"`
}

type xmlReport struct {
	XMLName  xml.Name     `xml:"report"`
	Name     string       `xml:"name,attr"`
	Groups   []xmlGroup   `xml:"group"`
	Packages []xmlPackage `xml:"package"`
}

// ParseXML reads JaCoCo's XML report. Its DOCTYPE isn't fetched.
func ParseXML(r io.Reader) (*Report, error) {
	var x xmlReport
	dec := xml.NewDecoder(r)
	dec.Strict = true
	if err := dec.Decode(&x); err != nil {
		return nil, fmt.Errorf("JaCoCo XML report: %w", err)
	}
	rep := &Report{Name: x.Name, Lines: map[string]Counter{}}
	var walk func(groups []xmlGroup, pkgs []xmlPackage)
	walk = func(groups []xmlGroup, pkgs []xmlPackage) {
		for _, p := range pkgs {
			pkg := strings.ReplaceAll(p.Name, "/", ".")
			// Groups could split a package; their counters add up.
			lines := rep.Lines[pkg]
			for _, ctr := range p.Counters {
				if ctr.Type == "LINE" {
					lines.add(Counter{ctr.Covered, ctr.Missed})
				}
			}
			rep.Lines[pkg] = lines
			for _, c := range p.Classes {
				class := strings.ReplaceAll(c.Name, "/", ".")
				src := ""
				if c.SourceFile != "" {
					src = p.Name + "/" + c.SourceFile
				}
				for _, m := range c.Methods {
					mm := Method{Class: class, Package: pkg, Name: m.Name, Desc: m.Desc, Line: m.Line, Source: src}
					for _, ctr := range m.Counters {
						switch ctr.Type {
						case "METHOD":
							mm.Reached = ctr.Covered > 0
						case "BRANCH":
							mm.Branches = Counter{ctr.Covered, ctr.Missed}
						}
					}
					rep.Methods = append(rep.Methods, mm)
				}
			}
		}
		for _, g := range groups {
			walk(g.Groups, g.Packages)
		}
	}
	walk(x.Groups, x.Packages)
	return rep, nil
}

// closureClass matches a Groovy closure's class: its outer class, then
// $_closureN for a closure in a field (def create = {...}), or
// $_method_closureN for one in a method, then $_closureN per level of
// nesting.
var closureClass = regexp.MustCompile(`^(.*?)\$_(?:(\w+?)_)?closure\d+(?:\$_closure\d+)*$`)

// classDecl matches the line that declares a Groovy class (or interface,
// trait, enum).
var classDecl = regexp.MustCompile(`^\s*(?:@\w+(?:\([^)]*\))?\s+)*(?:(?:public|protected|private|abstract|final|static)\s+)*(?:class|interface|trait|enum)\s+\w`)

// bodyIndent finds a Groovy class body's indent (bbb-web's sources use two
// spaces or a tab): that of the first line of code after a class's opening
// brace. That line is at member level whatever it declares, so a typed
// method (String helper() {) is as good as a def, and a declaration inside
// a member never sets it. An empty class (class Empty {}) has no such line,
// so the next class sets it. It is "" when no class does.
func bodyIndent(lines []string) string {
	for i := range lines {
		if !classDecl.MatchString(lines[i]) {
			continue
		}
		j := i
		for j < len(lines) && !strings.Contains(lines[j], "{") {
			j++
		}
		for j++; j < len(lines); j++ {
			code := strings.TrimSpace(lines[j])
			if code != "" && !strings.HasPrefix(code, "//") && !strings.HasPrefix(code, "/*") && !strings.HasPrefix(code, "*") {
				break
			}
		}
		if j < len(lines) {
			if indent := lines[j][:len(lines[j])-len(strings.TrimLeft(lines[j], " \t"))]; indent != "" {
				return indent
			}
		}
	}
	return ""
}

// memberDecl matches the start of a Groovy class's member at the class
// body's indent: a closure field (def create = {) or a method (private def
// foo(...)). Field constants and statements inside members don't match.
func memberDecl(indent string) *regexp.Regexp {
	return regexp.MustCompile("^" + regexp.QuoteMeta(indent) + `(?:@\w+(?:\([^)]*\))?\s+)*(?:(?:[\w.<>\[\],]+)\s+)*?(\w+)\s*(?:=\s*\{|\()`)
}

// lambdaMethod matches a Java lambda's method, lambda$member$N, and
// scalaFun a Scala anonymous function's, $anonfun$member$N: the compiler
// numbers both per class.
var (
	lambdaMethod = regexp.MustCompile(`^lambda\$(.+)\$\d+$`)
	scalaFun     = regexp.MustCompile(`^\$anonfun\$(.+?)\$\d+$`)
	closureNums  = regexp.MustCompile(`closure(\d+)`)
)

// ResolveClosures gives the code the compilers number per class a name
// that survives code being added elsewhere in the class: a Groovy
// closure's body, a Java lambda and a Scala anonymous function are named
// after the member they are in, and the ones a member holds are numbered in
// line order in desc: {1}, {2}, ...
//
//   - The doCall of ApiController$_closure2 becomes ApiController#create{}:
//     a closure in a method carries the method's name in its class's name;
//     one in a field (def create = {...}, static mappings = {...}) is placed
//     under the nearest member declared above its first line, from the
//     sources under roots (each a package root, as JaCoCo's --sourcefiles
//     takes).
//   - MeetingService#lambda$start$2 becomes MeetingService#start->.
//   - MsgBuilder#$anonfun$build$1 becomes MsgBuilder#build=>.
//
// It returns how many closures it couldn't place, which keep their class
// names.
func ResolveClosures(rep *Report, roots []string) int {
	type source struct {
		lines []string
		decl  *regexp.Regexp // nil when the file isn't found or has no members
	}
	files := map[string]source{}
	read := func(name string) source {
		if src, ok := files[name]; ok {
			return src
		}
		var src source
		for _, r := range roots {
			if data, err := os.ReadFile(r + "/" + name); err == nil {
				src.lines = strings.Split(string(data), "\n")
				break
			}
		}
		if indent := bodyIndent(src.lines); indent != "" {
			src.decl = memberDecl(indent)
		}
		files[name] = src
		return src
	}
	type member struct{ class, name string } // name with its kind: create{}, start->, build=>
	byMember := map[member][]int{}
	unresolved := 0
	for i := range rep.Methods {
		m := &rep.Methods[i]
		if lm := lambdaMethod.FindStringSubmatch(m.Name); lm != nil {
			key := member{m.Class, lm[1] + "->"}
			byMember[key] = append(byMember[key], i)
			continue
		}
		if sf := scalaFun.FindStringSubmatch(m.Name); sf != nil {
			key := member{m.Class, sf[1] + "=>"}
			byMember[key] = append(byMember[key], i)
			continue
		}
		cm := closureClass.FindStringSubmatch(m.Class)
		if cm == nil || m.Name != "doCall" {
			continue
		}
		// A closure in a method carries the method's name; one in a
		// field, an instance one ($_closureN) or a static one
		// ($__clinit__closureN), is placed by its first line.
		name := cm[2]
		if name == "_clinit_" || name == "_init_" {
			name = ""
		}
		if src := read(m.Source); name == "" && src.decl != nil {
			for l := m.Line - 1; l >= 0 && l < len(src.lines); l-- {
				if d := src.decl.FindStringSubmatch(src.lines[l]); d != nil {
					name = d[1]
					break
				}
			}
		}
		if name == "" {
			unresolved++
			continue
		}
		key := member{cm[1], name + "{}"}
		byMember[key] = append(byMember[key], i)
	}
	for key, idx := range byMember {
		sort.SliceStable(idx, func(a, b int) bool {
			ma, mb := rep.Methods[idx[a]], rep.Methods[idx[b]]
			if ma.Line != mb.Line {
				return ma.Line < mb.Line
			}
			return compilerOrder(ma, mb)
		})
		for n, i := range idx {
			m := &rep.Methods[i]
			m.Class, m.Name, m.Desc = key.class, key.name, fmt.Sprintf("{%d}", n+1)
		}
	}
	return unresolved
}

// compilerOrder orders two closures or functions on one line as the
// compiler numbered them: by their numbers as numbers, level by level, so
// $_closure9 comes before $_closure10 and an outer closure before the ones
// in it.
func compilerOrder(a, b Method) bool {
	na, nb := numbers(a), numbers(b)
	for i := 0; i < len(na) && i < len(nb); i++ {
		if na[i] != nb[i] {
			return na[i] < nb[i]
		}
	}
	return len(na) < len(nb)
}

func numbers(m Method) []int {
	var out []int
	for _, g := range closureNums.FindAllStringSubmatch(m.Class, -1) {
		n, _ := strconv.Atoi(g[1])
		out = append(out, n)
	}
	if i := strings.LastIndex(m.Name, "$"); i >= 0 {
		if n, err := strconv.Atoi(m.Name[i+1:]); err == nil {
			out = append(out, n)
		}
	}
	return out
}

// Config is a triage file.
type Config struct {
	// Scope lists packages; each covers its subpackages too.
	Scope []string `yaml:"scope"`
	// Ignore leaves out methods the compilers generate.
	Ignore []IgnoreRule `yaml:"ignore"`
	// Methods says what each unreached method is.
	Methods []Entry `yaml:"methods"`

	ignore []compiledRule
}

// IgnoreRule leaves out the methods whose name matches Methods in the
// classes that match Classes, a glob over dotted class names: * stays within
// one name segment, ** doesn't.
type IgnoreRule struct {
	Classes string `yaml:"classes"`
	Methods string `yaml:"methods"`
	Reason  string `yaml:"reason"`
}

type compiledRule struct {
	classes, methods *regexp.Regexp
}

// Outcomes a triage entry can have.
const (
	OutcomeCase     = "case"     // behaviour the suite misses: Ref names the case or ticket to add it in
	OutcomeLeftover = "leftover" // code with no effect: Ref names its PLAN §3 entry
	OutcomeExcluded = "excluded" // left out of the suite: Reason says why
)

// Entry is one unreached method's triage.
type Entry struct {
	Class   string `yaml:"class"`
	Method  string `yaml:"method"`
	Desc    string `yaml:"desc,omitempty"` // only when the name is overloaded
	Outcome string `yaml:"outcome"`
	Ref     string `yaml:"ref,omitempty"`
	Reason  string `yaml:"reason,omitempty"`
	Note    string `yaml:"note,omitempty"`
}

func (e Entry) id() string {
	if e.Desc != "" {
		return e.Class + "#" + e.Method + e.Desc
	}
	return e.Class + "#" + e.Method
}

// LoadConfig reads a triage file, refusing unknown keys, and checks it on
// its own; Summarize checks it against a report.
func LoadConfig(name string) (*Config, error) {
	data, err := os.ReadFile(name)
	if err != nil {
		return nil, err
	}
	dec := yaml.NewDecoder(strings.NewReader(string(data)))
	dec.KnownFields(true)
	var c Config
	if err := dec.Decode(&c); err != nil && !errors.Is(err, io.EOF) {
		return nil, fmt.Errorf("%s: %w", name, err)
	}
	var probs []string
	if len(c.Scope) == 0 {
		probs = append(probs, "scope: name at least one package")
	}
	for i, r := range c.Ignore {
		where := fmt.Sprintf("ignore[%d]", i)
		cls, err := globRegexp(r.Classes)
		if err != nil {
			probs = append(probs, fmt.Sprintf("%s.classes: %v", where, err))
			continue
		}
		if r.Methods == "" {
			probs = append(probs, where+".methods: give a regular expression")
			continue
		}
		meth, err := regexp.Compile("^(?:" + r.Methods + ")$")
		if err != nil {
			probs = append(probs, fmt.Sprintf("%s.methods: %v", where, err))
			continue
		}
		if strings.TrimSpace(r.Reason) == "" {
			probs = append(probs, where+".reason: say why these methods don't count")
		}
		c.ignore = append(c.ignore, compiledRule{cls, meth})
	}
	for i, e := range c.Methods {
		where := fmt.Sprintf("methods[%d] (%s)", i, e.id())
		switch {
		case e.Class == "" || e.Method == "":
			probs = append(probs, fmt.Sprintf("methods[%d]: give class and method", i))
		case e.Outcome == OutcomeCase || e.Outcome == OutcomeLeftover:
			if strings.TrimSpace(e.Ref) == "" {
				probs = append(probs, where+": a "+e.Outcome+" needs ref")
			}
		case e.Outcome == OutcomeExcluded:
			if strings.TrimSpace(e.Reason) == "" {
				probs = append(probs, where+": excluded needs reason")
			}
		default:
			probs = append(probs, fmt.Sprintf("%s: outcome %q isn't one of case, leftover, excluded", where, e.Outcome))
		}
	}
	if len(probs) > 0 {
		return nil, fmt.Errorf("%s:\n  %s", name, strings.Join(probs, "\n  "))
	}
	return &c, nil
}

// globRegexp turns a class glob into an anchored regular expression.
func globRegexp(glob string) (*regexp.Regexp, error) {
	if glob == "" {
		return nil, errors.New("give a class glob")
	}
	var b strings.Builder
	b.WriteString("^")
	for i := 0; i < len(glob); i++ {
		switch {
		case strings.HasPrefix(glob[i:], "**"):
			b.WriteString(".*")
			i++
		case glob[i] == '*':
			b.WriteString(`[^.]*`)
		default:
			b.WriteString(regexp.QuoteMeta(glob[i : i+1]))
		}
	}
	b.WriteString("$")
	return regexp.Compile(b.String())
}

func (c *Config) inScope(pkg string) bool {
	for _, s := range c.Scope {
		if pkg == s || strings.HasPrefix(pkg, s+".") {
			return true
		}
	}
	return false
}

func (c *Config) ignored(m Method) bool {
	for _, r := range c.ignore {
		if r.classes.MatchString(m.Class) && r.methods.MatchString(m.Name) {
			return true
		}
	}
	return false
}

// Row is one package's numbers, or the total.
type Row struct {
	Package   string
	Methods   Counter
	Lines     Counter
	Branches  Counter
	Triaged   map[string]int // unreached methods by outcome
	Untriaged int
}

// Summary is a report seen through a triage file.
type Summary struct {
	Packages  []Row
	Total     Row
	Ignored   int
	Untriaged []Method // unreached methods with no entry
	Stale     []string // entries for methods the suite now reaches
}

// Summarize keeps the methods in scope and not ignored, counts them and
// their branches per package, and matches the triage entries with the
// unreached ones. A package's lines are JaCoCo's count for it: all its
// code, generated methods too, with a line two methods share counted once.
// It returns the problems with the entries: one that names no method in
// scope, an overloaded name without desc, an entry for an ignored method,
// and an entry given twice.
func Summarize(rep *Report, cfg *Config) (*Summary, []string) {
	type key struct{ class, name string }
	byName := map[key][]Method{}
	var kept []Method
	s := &Summary{}
	ignoredIDs := map[key]bool{}
	ignoredFull := map[string]bool{} // method ID with desc
	for _, m := range rep.Methods {
		if !cfg.inScope(m.Package) {
			continue
		}
		if cfg.ignored(m) {
			s.Ignored++
			ignoredIDs[key{m.Class, m.Name}] = true
			ignoredFull[m.ID(true)] = true
			continue
		}
		kept = append(kept, m)
		byName[key{m.Class, m.Name}] = append(byName[key{m.Class, m.Name}], m)
	}
	// Each entry claims one method, or all of a name's overloads when the
	// name isn't overloaded, and no method is claimed twice.
	var probs []string
	triage := map[string]string{}  // method ID with desc -> outcome
	claimed := map[string]string{} // method ID with desc -> the entry that claims it
	for _, e := range cfg.Methods {
		ms := byName[key{e.Class, e.Method}]
		switch {
		case e.Desc != "" && ignoredFull[e.Class+"#"+e.Method+e.Desc]:
			probs = append(probs, e.id()+": an ignore rule already leaves this method out")
			continue
		case len(ms) == 0 && ignoredIDs[key{e.Class, e.Method}]:
			probs = append(probs, e.id()+": an ignore rule already leaves this method out")
			continue
		case len(ms) == 0:
			probs = append(probs, e.id()+": no such method in scope in the report")
			continue
		case e.Desc == "" && len(ms) > 1:
			probs = append(probs, e.id()+": the name is overloaded; give desc")
			continue
		}
		matched := false
		for _, m := range ms {
			if e.Desc != "" && m.Desc != e.Desc {
				continue
			}
			matched = true
			if by, ok := claimed[m.ID(true)]; ok {
				probs = append(probs, e.id()+": "+m.ID(true)+" is claimed by an earlier entry too, "+by)
				continue
			}
			claimed[m.ID(true)] = e.id()
			if m.Reached {
				s.Stale = append(s.Stale, e.id())
				continue
			}
			triage[m.ID(true)] = e.Outcome
		}
		if !matched {
			probs = append(probs, e.id()+": no overload has this desc")
		}
	}
	rows := map[string]*Row{}
	for _, m := range kept {
		r := rows[m.Package]
		if r == nil {
			r = &Row{Package: m.Package, Lines: rep.Lines[m.Package], Triaged: map[string]int{}}
			rows[m.Package] = r
		}
		if m.Reached {
			r.Methods.Covered++
		} else {
			r.Methods.Missed++
			if o, ok := triage[m.ID(true)]; ok {
				r.Triaged[o]++
			} else {
				r.Untriaged++
				s.Untriaged = append(s.Untriaged, m)
			}
		}
		r.Branches.add(m.Branches)
	}
	s.Total = Row{Package: "total", Triaged: map[string]int{}}
	for _, r := range rows {
		s.Packages = append(s.Packages, *r)
		s.Total.Methods.add(r.Methods)
		s.Total.Lines.add(r.Lines)
		s.Total.Branches.add(r.Branches)
		s.Total.Untriaged += r.Untriaged
		for o, n := range r.Triaged {
			s.Total.Triaged[o] += n
		}
	}
	sort.Slice(s.Packages, func(i, j int) bool { return s.Packages[i].Package < s.Packages[j].Package })
	sort.Slice(s.Untriaged, func(i, j int) bool {
		a, b := s.Untriaged[i], s.Untriaged[j]
		if a.Class != b.Class {
			return a.Class < b.Class
		}
		if a.Name != b.Name {
			return a.Name < b.Name
		}
		return a.Desc < b.Desc
	})
	sort.Strings(s.Stale)
	return s, probs
}

// Baseline is the numbers a later run is compared with.
type Baseline struct {
	Tool     string            `json:"tool"`
	Scope    []string          `json:"scope"`
	Packages map[string]Totals `json:"packages"`
	Total    Totals            `json:"total"`
}

// Totals are one package's counters, or the whole scope's.
type Totals struct {
	Methods  Counter `json:"methods"`
	Lines    Counter `json:"lines"`
	Branches Counter `json:"branches"`
}

// Tool names what measured, for the baseline.
const Tool = "jacoco 0.8.13"

// Baseline returns s's numbers as a baseline.
func (s *Summary) Baseline(scope []string) Baseline {
	b := Baseline{Tool: Tool, Scope: scope, Packages: map[string]Totals{},
		Total: Totals{s.Total.Methods, s.Total.Lines, s.Total.Branches}}
	for _, r := range s.Packages {
		b.Packages[r.Package] = Totals{r.Methods, r.Lines, r.Branches}
	}
	return b
}

// LoadBaseline reads a baseline file.
func LoadBaseline(name string) (*Baseline, error) {
	data, err := os.ReadFile(name)
	if err != nil {
		return nil, err
	}
	dec := json.NewDecoder(strings.NewReader(string(data)))
	dec.DisallowUnknownFields()
	var b Baseline
	if err := dec.Decode(&b); err != nil {
		return nil, fmt.Errorf("%s: %w", name, err)
	}
	return &b, nil
}

// WriteBaseline writes b as indented JSON.
func WriteBaseline(w io.Writer, b Baseline) error {
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	return enc.Encode(b)
}

// Drop is a package, or the total, whose share of reached methods fell.
type Drop struct {
	Package  string
	Was, Now Counter
}

// Compare returns the packages, and the total, whose share of reached
// methods is more than tolerance percentage points below the baseline's. A
// package new since the baseline can't drop; one gone from the report
// counts as a drop to nothing, unless cfg no longer has it in scope.
func Compare(b *Baseline, s *Summary, cfg *Config, tolerance float64) []Drop {
	now := map[string]Counter{}
	for _, r := range s.Packages {
		now[r.Package] = r.Methods
	}
	var drops []Drop
	names := make([]string, 0, len(b.Packages))
	for n := range b.Packages {
		names = append(names, n)
	}
	sort.Strings(names)
	for _, n := range names {
		if !cfg.inScope(n) {
			continue
		}
		was := b.Packages[n].Methods
		cur, ok := now[n]
		if !ok {
			cur = Counter{Missed: was.Total()}
		}
		if cur.Percent() < was.Percent()-tolerance {
			drops = append(drops, Drop{n, was, cur})
		}
	}
	if s.Total.Methods.Percent() < b.Total.Methods.Percent()-tolerance {
		drops = append(drops, Drop{"total", b.Total.Methods, s.Total.Methods})
	}
	return drops
}

// Mismatch says how a baseline was measured differently from this run:
// by another tool, or over another scope, so its numbers compare loosely.
// It is "" when they match.
func (b *Baseline) Mismatch(cfg *Config) string {
	if b.Tool != Tool {
		return fmt.Sprintf("the baseline was measured with %s, this run with %s", b.Tool, Tool)
	}
	was, now := append([]string{}, b.Scope...), append([]string{}, cfg.Scope...)
	sort.Strings(was)
	sort.Strings(now)
	if strings.Join(was, ",") != strings.Join(now, ",") {
		return fmt.Sprintf("the baseline's scope is %s, the triage file's %s", strings.Join(was, ", "), strings.Join(now, ", "))
	}
	return ""
}

// errWriter keeps the first error of a series of writes, and skips the
// writes after it.
type errWriter struct {
	w   io.Writer
	err error
}

func (e *errWriter) printf(format string, args ...any) {
	if e.err == nil {
		_, e.err = fmt.Fprintf(e.w, format, args...)
	}
}

// WriteMarkdown writes the summary for a job summary: one row per package,
// then the drops and stale entries, if any.
func WriteMarkdown(out io.Writer, s *Summary, drops []Drop, baseline bool) error {
	w := &errWriter{w: out}
	w.printf("# bbb-web coverage\n\n")
	w.printf("The suite reached %s of the methods in scope and %s of their branches, and %s of the lines in their packages (JaCoCo's count, generated code included).\n\n",
		pct(s.Total.Methods), pct(s.Total.Branches), pct(s.Total.Lines))
	w.printf("- Methods not reached: %d (triaged: %d; untriaged: %d)\n- Generated methods ignored: %d\n\n",
		s.Total.Methods.Missed, s.Total.Methods.Missed-s.Total.Untriaged, s.Total.Untriaged, s.Ignored)
	w.printf("| Package | Methods | Lines | Branches | Untriaged |\n|---|---|---|---|---|\n")
	for _, r := range append(append([]Row{}, s.Packages...), s.Total) {
		name := "`" + r.Package + "`"
		if r.Package == "total" {
			name = "**Total**"
		}
		w.printf("| %s | %s | %s | %s | %d |\n", name, frac(r.Methods), frac(r.Lines), frac(r.Branches), r.Untriaged)
	}
	switch {
	case len(drops) > 0:
		w.printf("\n## Below the baseline\n\n| Package | Baseline | Now |\n|---|---|---|\n")
		for _, d := range drops {
			w.printf("| `%s` | %s | %s |\n", d.Package, frac(d.Was), frac(d.Now))
		}
	case baseline:
		w.printf("\nNo package is below the baseline.\n")
	}
	if len(s.Stale) > 0 {
		w.printf("\n## Triage entries for methods the suite now reaches\n\n")
		for _, id := range s.Stale {
			w.printf("- `%s`\n", id)
		}
	}
	return w.err
}

// WriteUntriaged lists the unreached methods with no triage entry, one per
// line: class, name, descriptor and first line.
func WriteUntriaged(out io.Writer, s *Summary) error {
	w := &errWriter{w: out}
	for _, m := range s.Untriaged {
		w.printf("%s#%s%s line %d\n", m.Class, m.Name, m.Desc, m.Line)
	}
	return w.err
}

func pct(c Counter) string { return fmt.Sprintf("%.1f%%", c.Percent()) }

func frac(c Counter) string {
	return fmt.Sprintf("%d/%d (%.1f%%)", c.Covered, c.Total(), c.Percent())
}
