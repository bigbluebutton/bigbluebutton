package normalize

import (
	"crypto/sha1"
	"encoding/hex"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
)

const base = "https://bbb.test"

func obs(status int, header map[string]string, body string) *observe.Observation {
	h := http.Header{}
	for k, v := range header {
		h.Add(k, v)
	}
	o := &observe.Observation{Status: status, Header: h, Body: []byte(body)}
	if loc := h.Get("Location"); loc != "" {
		o.Location, _ = url.Parse(loc)
	}
	return o
}

func sha(s string) string {
	h := sha1.Sum([]byte(s))
	return hex.EncodeToString(h[:])
}

func ctx(uid string) *Context {
	c := NewContext(uid, []string{base}, "/bigbluebutton/api/", "s4lt")
	c.AddSent(base+"/bigbluebutton/api/create?meetingID="+uid+"&name=N&attendeePW=ap", "", nil)
	return c
}

func check(t *testing.T, got []string, want string) {
	t.Helper()
	if g := strings.Join(got, "\n"); g != strings.TrimSpace(want) {
		t.Errorf("got:\n%s\nwant:\n%s", g, strings.TrimSpace(want))
	}
}

func TestCreateResponse(t *testing.T) {
	uid := "bbbc-1a2b3c"
	body := `<response><returncode>SUCCESS</returncode><meetingID>` + uid + `</meetingID>` +
		`<internalMeetingID>` + sha(uid) + `-1760000000001</internalMeetingID><parentMeetingID>bbb-none</parentMeetingID>` +
		`<attendeePW>ap</attendeePW><moderatorPW>Xy12Zq9w</moderatorPW><createTime>1760000000001</createTime>` +
		`<voiceBridge>71234</voiceBridge><createDate>Mon Oct 19 17:57:03 UTC 2026</createDate><hasUserJoined>false</hasUserJoined>` +
		`<messageKey/><message></message></response>`
	got := Response(obs(200, map[string]string{"Content-Type": "text/xml;charset=utf-8", "Content-Length": "999", "Date": "x"}, body), ctx(uid), Default())
	check(t, got, `
status 200
header Content-Type text/xml;charset=utf-8
body xml
/response/returncode "SUCCESS"
/response/meetingID "${uid}"
/response/internalMeetingID "<sha1(meetingID)>-<time>"
/response/parentMeetingID "bbb-none"
/response/attendeePW "ap"
/response/moderatorPW "<random>"
/response/createTime "<time>"
/response/voiceBridge "<random>"
/response/createDate "<date>"
/response/hasUserJoined "false"
/response/messageKey
/response/message`)
}

// A JSON list is scoped and sorted like the XML one it mirrors: its
// elements go by the list's path, and the list itself is never dropped.
func TestJSONListScope(t *testing.T) {
	uid := "bbbc-j1"
	body := `{"response":{"returncode":"SUCCESS","meetings":{"meeting":[{"meetingID":"other"},{"meetingID":"` + uid + `-b"},{"meetingID":"` + uid + `-a"}]}}}`
	got := Response(obs(200, map[string]string{"Content-Type": "application/json"}, body), ctx(uid), Default())
	check(t, got, `
status 200
header Content-Type application/json
body json
$.response.meetings.meeting[].meetingID "${uid}-a"
$.response.meetings.meeting[].meetingID "${uid}-b"
$.response.returncode "SUCCESS"`)
}

// A time of 0 is masked too: bbb-web sets startTime a moment after create
// answers, so getMeetingInfo right after create reads 0 or a time.
func TestZeroTime(t *testing.T) {
	got := Response(obs(200, nil, `<response><startTime>0</startTime><endTime>0</endTime></response>`), ctx("bbbc-u0"), Default())
	check(t, got, `
status 200
body xml
/response/startTime "<time>"
/response/endTime "<time>"`)
}

func TestSentValuesFromEarlierSteps(t *testing.T) {
	c := ctx("bbbc-u1")
	// getMeetingInfo sends no attendeePW, but create did.
	c.AddSent(base+"/bigbluebutton/api/getMeetingInfo?meetingID=bbbc-u1", "", nil)
	got := Response(obs(200, nil, `<response><attendeePW>ap</attendeePW><moderatorPW>zz</moderatorPW></response>`), c, Default())
	check(t, got, `
status 200
body xml
/response/attendeePW "ap"
/response/moderatorPW "<random>"`)
}

func TestURLsInValues(t *testing.T) {
	uid := "bbbc-u2"
	body := `{"response":{"returncode":"SUCCESS","url":"` + base + `/bigbluebutton/api/join?&fullName=Bob&meetingID=` + uid +
		`&existingUserID=w_abcdefghijkl&role=VIEWER&checksum=0123abcd"},"n":12,"ok":true,"none":null,"createTime":1760000000001}`
	got := Response(obs(200, map[string]string{"Content-Type": "application/json"}, body), ctx(uid), Default())
	check(t, got, `
status 200
header Content-Type application/json
body json
$.createTime "<time>"
$.n 12
$.none null
$.ok true
$.response.returncode "SUCCESS"
$.response.url "${baseUrl}${apiPrefix}join?checksum=<token>&existingUserID=w_<id>&fullName=Bob&meetingID=${uid}&role=VIEWER"`)
}

func TestWebsocketURL(t *testing.T) {
	body := `<response><returncode>SUCCESS</returncode><graphqlWebsocketUrl>wss://bbb.test/graphql</graphqlWebsocketUrl>` +
		`<graphqlApiUrl>https://bbb.test/api/rest</graphqlApiUrl></response>`
	got := Response(obs(200, map[string]string{"Content-Type": "text/xml"}, body), ctx("bbbc-u3"), Default())
	check(t, got, `
status 200
header Content-Type text/xml
body xml
/response/returncode "SUCCESS"
/response/graphqlWebsocketUrl "${wsBaseUrl}/graphql"
/response/graphqlApiUrl "${baseUrl}/api/rest"`)
	if got := wsBase("http://h:8090"); got != "ws://h:8090" {
		t.Errorf("wsBase(http) = %q", got)
	}
}

func TestLocationAndCookies(t *testing.T) {
	o := obs(302, map[string]string{
		"Location":   base + "/html5client/join?sessionToken=abc123&b=2",
		"Set-Cookie": "JSESSIONID=XYZ; Path=/bigbluebutton; Secure; HttpOnly",
	}, `<a href="x">Found</a>`)
	got := Response(o, ctx("bbbc-u0u0u0"), Default())
	check(t, got, `
status 302
header Set-Cookie JSESSIONID=<token>; HttpOnly; Path=/bigbluebutton; Secure
location ${baseUrl}/html5client/join?b=2&sessionToken=<token>
body (redirect)`)
}

func TestUnorderedAndScope(t *testing.T) {
	uid := "bbbc-u3"
	m := func(id, name string) string {
		return `<meeting><meetingID>` + id + `</meetingID><meetingName>` + name + `</meetingName><metadata><b>2</b><a>1</a></metadata></meeting>`
	}
	one := `<response><meetings>` + m(uid+"-b", "B") + m("someone-else", "X") + m(uid+"-a", "A") + `</meetings></response>`
	two := `<response><meetings>` + m(uid+"-a", "A") + m(uid+"-b", "B") + `</meetings></response>`
	a := Response(obs(200, nil, one), ctx(uid), Default())
	b := Response(obs(200, nil, two), ctx(uid), Default())
	check(t, a, strings.Join(b, "\n"))
	check(t, a, `
status 200
body xml
/response/meetings/meeting/meetingID "${uid}-a"
/response/meetings/meeting/meetingName "A"
/response/meetings/meeting/metadata/a "1"
/response/meetings/meeting/metadata/b "2"
/response/meetings/meeting/meetingID "${uid}-b"
/response/meetings/meeting/meetingName "B"
/response/meetings/meeting/metadata/a "1"
/response/meetings/meeting/metadata/b "2"`)

	stuns := func(order string) []string {
		return Response(obs(200, map[string]string{"Content-Type": "application/json"}, `{"stunServers":[`+order+`],"turnServers":[{"username":"1760000000:w_abcdefghijkl","password":"h+m/ac=","url":"turn:t"}]}`), ctx(uid), Default())
	}
	x, y := stuns(`{"url":"stun:b"},{"url":"stun:a"}`), stuns(`{"url":"stun:a"},{"url":"stun:b"}`)
	check(t, x, strings.Join(y, "\n"))
	if !strings.Contains(strings.Join(x, "\n"), `$.turnServers[].username "<expiry>:w_abcdefghijkl"`) || !strings.Contains(strings.Join(x, "\n"), `$.turnServers[].password "<token>"`) {
		t.Errorf("TURN credentials not masked:\n%s", strings.Join(x, "\n"))
	}
}

// getMeetings says noMeetings only when no case has a meeting, so a case
// whose own list is empty must read the same whatever else is running.
func TestGetMeetingsOwnView(t *testing.T) {
	uid := "bbbc-u4"
	empty := `<response><returncode>SUCCESS</returncode><meetings/><messageKey>noMeetings</messageKey>` +
		`<message>no meetings were found on this server</message></response>`
	others := `<response><returncode>SUCCESS</returncode><meetings><meeting><meetingID>someone-else</meetingID></meeting>` +
		`<meeting><meetingID>another</meetingID></meeting></meetings></response>`
	a := Response(obs(200, nil, empty), ctx(uid), Default())
	b := Response(obs(200, nil, others), ctx(uid), Default())
	check(t, b, strings.Join(a, "\n"))
	check(t, a, `
status 200
body xml
/response/returncode "SUCCESS"
/response/meetings`)

	// The same holds for JSON answers.
	jsonEmpty := obs(200, map[string]string{"Content-Type": "application/json"},
		`{"response":{"returncode":"SUCCESS","messageKey":"noMeetings","message":"no meetings were found on this server"}}`)
	check(t, Response(jsonEmpty, ctx(uid), Default()), `
status 200
header Content-Type application/json
body json
$.response.returncode "SUCCESS"`)

	// JSON lists and objects emptied by dropping read as [] and {}.
	r, err := Load(writeMasks(t, "drop: [{path: \"list[]\"}, {path: obj/a}]\n"))
	if err != nil {
		t.Fatal(err)
	}
	o := obs(200, map[string]string{"Content-Type": "application/json"}, `{"list":[1,2],"obj":{"a":1},"keep":true}`)
	check(t, Response(o, ctx(uid), r), `
status 200
header Content-Type application/json
body json
$.keep true
$.list []
$.obj {}`)
}

// getSessions names meetings by internal ID only. A case's view keeps the
// sessions of the meetings it created, sorted, and reads the same whatever
// else is running.
func TestGetSessionsOwnView(t *testing.T) {
	uid := "bbbc-u5"
	s := func(meetingID, user string) string {
		return `<meeting><meetingID>` + meetingID + `</meetingID><meetingName>N</meetingName><userName>` + user + `</userName></meeting>`
	}
	own := sha(uid) + "-1760000000001"
	other := sha("bbbc-other") + "-1760000000002"
	a := Response(obs(200, nil, `<response><returncode>SUCCESS</returncode><sessions>`+
		s(own, "Bob")+s(other, "Eve")+s(own, "Ann")+`</sessions></response>`), ctx(uid), Default())
	b := Response(obs(200, nil, `<response><returncode>SUCCESS</returncode><sessions>`+
		s(own, "Ann")+s(own, "Bob")+`</sessions></response>`), ctx(uid), Default())
	check(t, a, strings.Join(b, "\n"))
	check(t, a, `
status 200
body xml
/response/returncode "SUCCESS"
/response/sessions/meeting/meetingID "<sha1(meetingID)>-<time>"
/response/sessions/meeting/meetingName "N"
/response/sessions/meeting/userName "Ann"
/response/sessions/meeting/meetingID "<sha1(meetingID)>-<time>"
/response/sessions/meeting/meetingName "N"
/response/sessions/meeting/userName "Bob"`)

	// With none of its own, a case reads the same whether the server has
	// other sessions or none.
	none := Response(obs(200, nil, `<response><returncode>SUCCESS</returncode><sessions/>`+
		`<messageKey>noSessions</messageKey><message>no sessions were found on this server</message></response>`), ctx(uid), Default())
	others := Response(obs(200, nil, `<response><returncode>SUCCESS</returncode><sessions>`+
		s(other, "Eve")+`</sessions></response>`), ctx(uid), Default())
	check(t, others, strings.Join(none, "\n"))
	check(t, none, `
status 200
body xml
/response/returncode "SUCCESS"
/response/sessions`)
}

func TestOtherBodies(t *testing.T) {
	c := ctx("bbbc-u0u0u0")
	check(t, Response(obs(500, map[string]string{"Content-Type": "text/html"}, "<html><head><title>HTTP Status 500 – Internal Server Error</title></head></html>"), c, Default()), `
status 500
header Content-Type text/html
body text "HTTP Status 500 – Internal Server Error"`)
	check(t, Response(obs(200, nil, ""), c, Default()), "status 200\nbody empty")
	got := Response(obs(200, map[string]string{"Content-Type": "text/xml"}, "<response><createDate>2026-10-19T17:57:03Z</createDate></response>"), c, Default())
	if !strings.Contains(strings.Join(got, "\n"), `/response/createDate "9999-99-99T99:99:99Z"`) {
		t.Errorf("a non-Java date should keep its shape:\n%s", strings.Join(got, "\n"))
	}
	got = Response(obs(200, map[string]string{"Content-Type": "text/xml"}, "<response><a>"), c, Default())
	if !strings.Contains(got[len(got)-1], "body xml unparsable") {
		t.Errorf("got %q", got)
	}
}

func TestLoad(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "masks.yaml")
	body := "masks:\n  - {field: meetingName, as: token}\n  - {field: voiceBridge, as: time}\nunordered:\n  - {path: list/item, key: \"@id\"}\n" +
		"drop:\n  - {path: /response/version}\n  - {path: flag, value: \"on\"}\nheaders: [User-Id]\n"
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	r, err := Load(p)
	if err != nil {
		t.Fatal(err)
	}
	o := obs(200, map[string]string{"User-Id": "w_abcdefghijkl"}, `<response><meetingName>Secret</meetingName><voiceBridge>71234</voiceBridge><list><item id="b"/><item id="a"/></list>`+
		`<version>4.0.1</version><flag>on</flag><other><flag>off</flag></other></response>`)
	check(t, Response(o, ctx("bbbc-u0u0u0"), r), `
status 200
header User-Id w_abcdefghijkl
body xml
/response/meetingName "<token>"
/response/voiceBridge "<time>"
/response/list/item/@id "a"
/response/list/item
/response/list/item/@id "b"
/response/list/item
/response/other/flag "off"`)
	for body, want := range map[string]string{
		"masks: [{field: a, as: nope}]\n":                "unknown kind",
		"masks: [{as: token}]\n":                         "give field or path",
		"masks: [{field: a, as: regex, regex: \"(\"}]\n": "bad regex",
		"unordred: []\n":                                 "unordred",
		"drop: [{value: x}]\n":                           "path is required",
	} {
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
		if _, err := Load(p); err == nil || !strings.Contains(err.Error(), want) {
			t.Errorf("Load(%q) error = %v, want %q", body, err, want)
		}
	}
}

func TestSuiteMasksFileLoads(t *testing.T) {
	if _, err := Load("../../../masks.yaml"); err != nil {
		t.Fatal(err)
	}
}

func TestHeadersUntouchedAndCookies(t *testing.T) {
	o := obs(200, map[string]string{
		"Access-Control-Allow-Origin": base,
		"Set-Cookie":                  "PREF=17-abc; Expires=Mon, 19 Oct 2026 18:00:00 GMT; Path=/",
	}, "")
	r, err := Load(writeMasks(t, "masks: [{field: PREF, as: regex, regex: '^\\d+-', replace: '<n>-'}]\n"))
	if err != nil {
		t.Fatal(err)
	}
	got := Response(o, ctx("bbbc-u0u0u0"), r)
	if o.Header.Get("Access-Control-Allow-Origin") != base {
		t.Errorf("normalizing must not change the response's headers: %q", o.Header.Get("Access-Control-Allow-Origin"))
	}
	check(t, got, `
status 200
header Access-Control-Allow-Origin ${baseUrl}
header Set-Cookie PREF=<n>-abc; Expires=<date>; Path=/
body empty`)
}

func writeMasks(t *testing.T, body string) string {
	t.Helper()
	p := filepath.Join(t.TempDir(), "masks.yaml")
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestSplit(t *testing.T) {
	for line, want := range map[string][2]string{
		"status 302": {"status", "302"},
		"header Content-Type text/xml;charset=utf-8":   {"header Content-Type", "text/xml;charset=utf-8"},
		"header Set-Cookie JSESSIONID=<token>; Path=/": {"header Set-Cookie", "JSESSIONID=<token>; Path=/"},
		"location ${baseUrl}/x?a=1":                    {"location", "${baseUrl}/x?a=1"},
		"body (redirect)":                              {"body", "(redirect)"},
		`/response/returncode "SUCCESS"`:               {"/response/returncode", `"SUCCESS"`},
		`/response/message "a "quoted" b"`:             {"/response/message", `"a "quoted" b"`},
		`/response/x/@id "7"`:                          {"/response/x/@id", `"7"`},
		"/response/messageKey":                         {"/response/messageKey", ""},
		"$.response.count 3":                           {"$.response.count", "3"},
		"$.list []":                                    {"$.list", "[]"},
	} {
		if k, v := Split(line); k != want[0] || v != want[1] {
			t.Errorf("Split(%q) = %q, %q; want %q, %q", line, k, v, want[0], want[1])
		}
	}
}

// What presence and graphql steps return is normalized like a JSON body,
// with GraphQL's names for the values that change from run to run.
func TestDocument(t *testing.T) {
	doc := `{"userId":"w_wvtrhafk0cny","extId":"w_wvtrhafk0cny","name":"Ann","sessionToken":"cvzzlfshg759rsff","joined":true,` +
		`"joinErrorCode":null,"data":{"user_current":[{"registeredAt":"2026-10-20T16:13:30.947+00:00","registeredOn":1792512810947,"meetingId":"` + sha("bbbc-u5") + `-1792512810221"}]}}`
	check(t, Document([]byte(doc), ctx("bbbc-u5"), Default()), `
$.data.user_current[].meetingId "<sha1(meetingID)>-<time>"
$.data.user_current[].registeredAt "<time>"
$.data.user_current[].registeredOn "<time>"
$.extId "w_<id>"
$.joinErrorCode null
$.joined true
$.name "Ann"
$.sessionToken "<token>"
$.userId "w_<id>"`)
	check(t, Document([]byte("not json"), ctx("bbbc-u5"), Default()), `document unparsable: 8 bytes, sha256 7ccfa1fbf394`)
}

// The side-effect steps' documents: a bus message, a redis key and a
// file, with what changes from run to run masked, internal IDs inside
// strings included.
func TestSideEffectDocuments(t *testing.T) {
	uid := "bbbc-u6"
	intID := sha(uid) + "-1792520978099"
	bus := `{"channel":"from-akka-apps-redis-channel","envelope":{"name":"MeetingCreatedEvtMsg","timestamp":1792520978101},` +
		`"core":{"body":{"props":{"meetingProp":{"intId":"` + intID + `","extId":"` + uid + `"},` +
		`"durationProps":{"createdTime":1792520978099,"createdDate":"Tue Oct 20 18:29:38 UTC 2026"},` +
		`"password":{"moderatorPass":"Xy12","viewerPass":"ap"},"voiceProp":{"voiceConf":"92410","telVoice":"92410","muteOnStart":true}}}}}`
	check(t, Document([]byte(bus), ctx(uid), Default()), `
$.channel "from-akka-apps-redis-channel"
$.core.body.props.durationProps.createdDate "<date>"
$.core.body.props.durationProps.createdTime "<time>"
$.core.body.props.meetingProp.extId "${uid}"
$.core.body.props.meetingProp.intId "<sha1(meetingID)>-<time>"
$.core.body.props.password.moderatorPass "<random>"
$.core.body.props.password.viewerPass "ap"
$.core.body.props.voiceProp.muteOnStart true
$.core.body.props.voiceProp.telVoice "<random>"
$.core.body.props.voiceProp.voiceConf "<random>"
$.envelope.name "MeetingCreatedEvtMsg"
$.envelope.timestamp "<time>"`)
	key := `{"key":"meeting:info:` + intID + `","type":"string","ttl":3600,"value":"x"}`
	check(t, Document([]byte(key), ctx(uid), Default()), `
$.key "meeting:info:<sha1(meetingID)>-<time>"
$.ttl "<set>"
$.type "string"
$.value "x"`)
	file := `{"path":"learning-dashboard/` + intID + `/zq8wmu1b2c3d/learning_dashboard_data.json","found":true}`
	check(t, Document([]byte(file), ctx(uid), Default()), `
$.found true
$.path "learning-dashboard/<sha1(meetingID)>-<time>/<token>/learning_dashboard_data.json"`)
}
