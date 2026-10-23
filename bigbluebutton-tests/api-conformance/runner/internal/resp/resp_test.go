package resp

import (
	"bufio"
	"context"
	"errors"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"testing/iotest"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakeredis"
)

func parse(t *testing.T, wire string) (Value, error) {
	t.Helper()
	return read(bufio.NewReader(iotest.OneByteReader(strings.NewReader(wire))))
}

func TestRead(t *testing.T) {
	big := strings.Repeat("x", 1<<20)
	for _, tt := range []struct {
		wire string
		want Value
	}{
		{"+OK\r\n", Value{Kind: SimpleString, Str: "OK"}},
		{"-WRONGTYPE nope\r\n", Value{Kind: ErrorReply, Str: "WRONGTYPE nope"}},
		{":-2\r\n", Value{Kind: Integer, Int: -2}},
		{"$7\r\na\r\nb\r\nc\r\n", Value{Kind: BulkString, Str: "a\r\nb\r\nc"}},
		{"$0\r\n\r\n", Value{Kind: BulkString}},
		{"$-1\r\n", Value{Kind: BulkString, Null: true}},
		{"*-1\r\n", Value{Kind: Array, Null: true}},
		{"*2\r\n*1\r\n:1\r\n$1\r\nx\r\n", Value{Kind: Array, Array: []Value{{Kind: Array, Array: []Value{{Kind: Integer, Int: 1}}}, {Kind: BulkString, Str: "x"}}}},
		{"$1048576\r\n" + big + "\r\n", Value{Kind: BulkString, Str: big}},
	} {
		got, err := parse(t, tt.wire)
		if err != nil || !reflect.DeepEqual(got, tt.want) {
			t.Errorf("%.40q: got %+v, %v", tt.wire, got, err)
		}
	}
	for _, wire := range []string{"+OK\n", "?x\r\n", ":one\r\n", "$5\r\nab\r\n", "$2\r\nabcd", "*1\r\n"} {
		if _, err := parse(t, wire); err == nil {
			t.Errorf("%q: no error", wire)
		}
	}
}

func TestParseURL(t *testing.T) {
	for in, want := range map[string]Options{
		"redis://127.0.0.1:6379":  {Addr: "127.0.0.1:6379"},
		"redis://localhost":       {Addr: "localhost:6379"},
		"redis://:secret@h:1/2":   {Addr: "h:1", Password: "secret", DB: 2},
		"redis://user:secret@h:1": {Addr: "h:1", User: "user", Password: "secret"},
		"redis://secret@h:1":      {Addr: "h:1", Password: "secret"},
	} {
		if got, err := ParseURL(in); err != nil || got != want {
			t.Errorf("%s: %+v, %v", in, got, err)
		}
	}
	for _, in := range []string{"http://h:1", "redis://", "redis://h:1/x", "redis://secret@h:port", "redis://:secret@h:1/x"} {
		if _, err := ParseURL(in); err == nil {
			t.Errorf("%s: no error", in)
		} else if strings.Contains(err.Error(), "secret") {
			t.Errorf("%s: the error shows the password: %v", in, err)
		}
	}
}

func start(t *testing.T) *fakeredis.Server {
	t.Helper()
	s, err := fakeredis.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	return s
}

func dial(t *testing.T, o Options) *Conn {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	c, err := Dial(ctx, o)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { c.Close() })
	return c
}

func TestCommands(t *testing.T) {
	s := start(t)
	s.Password = "pw"
	s.HSet("meeting:info:m1", "meetingName", "Room", "isBreakout", "false")
	s.SAdd("rooms", "b", "a")
	s.RPush("list", "1", "2", "3")
	s.Expire("rooms", time.Hour)

	if _, err := Dial(context.Background(), Options{Addr: s.Addr(), Password: "wrong"}); err == nil || !strings.Contains(err.Error(), "WRONGPASS") {
		t.Errorf("a wrong password: %v", err)
	}
	c := dial(t, Options{Addr: s.Addr(), Password: "pw"})
	check := func(args []string, want string) {
		t.Helper()
		v, err := c.Do(args...)
		got := v.Str
		switch v.Kind {
		case Integer:
			got = strconv.FormatInt(v.Int, 10)
		case Array:
			got = strings.Join(v.Strings(), ",")
		}
		if v.Null {
			got = "<null>"
		}
		if err != nil {
			got = "error: " + err.Error()
		}
		if got != want {
			t.Errorf("%v = %q, want %q", args, got, want)
		}
	}
	check([]string{"TYPE", "meeting:info:m1"}, "hash")
	check([]string{"HGETALL", "meeting:info:m1"}, "isBreakout,false,meetingName,Room")
	check([]string{"SMEMBERS", "rooms"}, "a,b")
	check([]string{"LRANGE", "list", "0", "-1"}, "1,2,3")
	check([]string{"TTL", "meeting:info:m1"}, "-1")
	check([]string{"TTL", "nope"}, "-2")
	check([]string{"GET", "nope"}, "<null>")
	check([]string{"EXISTS", "rooms"}, "1")
	check([]string{"GET", "rooms"}, "error: redis: WRONGTYPE Operation against a key holding the wrong kind of value")
	var re *Error
	if _, err := c.Do("GET", "rooms"); !errors.As(err, &re) {
		t.Errorf("an error reply isn't an *Error: %v", err)
	}
	check([]string{"PING"}, "PONG") // the connection survives an error reply
}

func TestSubscribe(t *testing.T) {
	s := start(t)
	c := dial(t, Options{Addr: s.Addr()})
	if err := c.Subscribe("a", "b"); err != nil {
		t.Fatal(err)
	}
	if s.Subscribers("a") != 1 || s.Subscribers("b") != 1 {
		t.Fatal("not subscribed")
	}
	s.Publish("b", `{"envelope":{"name":"X"}}`)
	s.Publish("c", "not subscribed")
	m, err := c.Receive()
	if err != nil || m != (Message{Channel: "b", Payload: `{"envelope":{"name":"X"}}`}) {
		t.Fatalf("%+v, %v", m, err)
	}
	if err := c.Send("PING"); err != nil {
		t.Fatal(err)
	}
	if m, err := c.Receive(); err != nil || !m.Pong {
		t.Errorf("PING while subscribed: %+v, %v", m, err)
	}
	s.Kill()
	c.SetReadDeadline(time.Now().Add(2 * time.Second))
	if _, err := c.Receive(); err == nil {
		t.Error("no error after the server dropped the connection")
	}
}
