// Package resp is a small RESP2 client: what the tap needs to read keys
// from the server's redis and to follow its pub/sub channels.
package resp

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// MaxBulk is the largest string reply read; bigger ones are refused.
const MaxBulk = 64 << 20

// Kind is a reply's type, by its RESP2 prefix.
type Kind byte

const (
	SimpleString Kind = '+'
	ErrorReply   Kind = '-'
	Integer      Kind = ':'
	BulkString   Kind = '$'
	Array        Kind = '*'
)

// Value is one reply. Null is a null bulk string or null array.
type Value struct {
	Kind  Kind
	Str   string // simple string, error or bulk string
	Int   int64
	Array []Value
	Null  bool
}

// Error is an error reply, such as WRONGTYPE or NOAUTH.
type Error struct{ Msg string }

func (e *Error) Error() string { return "redis: " + e.Msg }

// Strings returns an array reply's elements as strings.
func (v Value) Strings() []string {
	out := make([]string, len(v.Array))
	for i, e := range v.Array {
		out[i] = e.Str
	}
	return out
}

// Conn is one connection. It is not safe for concurrent use.
type Conn struct {
	c net.Conn
	r *bufio.Reader
	w *bufio.Writer
}

// Options say where redis is and how to log in.
type Options struct {
	Addr     string // host:port
	User     string
	Password string
	DB       int
}

// ParseURL reads redis://[user:password@]host[:port][/db]. Its errors
// don't repeat the URL, which may hold a password.
func ParseURL(s string) (Options, error) {
	u, err := url.Parse(s)
	if err != nil || u.Scheme != "redis" || u.Host == "" {
		return Options{}, errors.New("the redis URL must look like redis://[user:password@]host[:port][/db]")
	}
	o := Options{Addr: u.Host}
	if u.Port() == "" {
		o.Addr = net.JoinHostPort(u.Hostname(), "6379")
	}
	if u.User != nil {
		o.User = u.User.Username()
		o.Password, _ = u.User.Password()
		if _, set := u.User.Password(); !set {
			o.User, o.Password = "", u.User.Username() // redis://password@host
		}
	}
	if db := strings.Trim(u.Path, "/"); db != "" {
		if o.DB, err = strconv.Atoi(db); err != nil {
			return Options{}, fmt.Errorf("the redis URL's database must be a number, not %q", db)
		}
	}
	return o, nil
}

// Dial connects, logs in and selects the database.
func Dial(ctx context.Context, o Options) (*Conn, error) {
	nc, err := (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, "tcp", o.Addr)
	if err != nil {
		return nil, err
	}
	c := newConn(nc)
	if d, ok := ctx.Deadline(); ok {
		nc.SetDeadline(d)
		defer nc.SetDeadline(time.Time{})
	}
	if o.Password != "" {
		args := []string{"AUTH", o.Password}
		if o.User != "" {
			args = []string{"AUTH", o.User, o.Password}
		}
		if _, err := c.Do(args...); err != nil {
			nc.Close()
			return nil, err
		}
	}
	if o.DB != 0 {
		if _, err := c.Do("SELECT", strconv.Itoa(o.DB)); err != nil {
			nc.Close()
			return nil, err
		}
	}
	return c, nil
}

func newConn(nc net.Conn) *Conn {
	return &Conn{c: nc, r: bufio.NewReader(nc), w: bufio.NewWriter(nc)}
}

// Close closes the connection.
func (c *Conn) Close() error { return c.c.Close() }

// SetReadDeadline bounds the next reads.
func (c *Conn) SetReadDeadline(t time.Time) error { return c.c.SetReadDeadline(t) }

// Do sends a command and reads its reply. An error reply comes back as an
// *Error.
func (c *Conn) Do(args ...string) (Value, error) {
	if err := c.Send(args...); err != nil {
		return Value{}, err
	}
	v, err := c.Read()
	if err != nil {
		return Value{}, err
	}
	if v.Kind == ErrorReply {
		return v, &Error{v.Str}
	}
	return v, nil
}

// Send writes a command as an array of bulk strings.
func (c *Conn) Send(args ...string) error {
	c.c.SetWriteDeadline(time.Now().Add(10 * time.Second))
	fmt.Fprintf(c.w, "*%d\r\n", len(args))
	for _, a := range args {
		fmt.Fprintf(c.w, "$%d\r\n%s\r\n", len(a), a)
	}
	return c.w.Flush()
}

// Read reads one reply.
func (c *Conn) Read() (Value, error) { return read(c.r) }

func read(r *bufio.Reader) (Value, error) {
	line, err := r.ReadString('\n')
	if err != nil {
		return Value{}, err
	}
	if len(line) < 3 || line[len(line)-2] != '\r' {
		return Value{}, fmt.Errorf("redis: a reply line doesn't end in CRLF: %q", line)
	}
	kind, rest := Kind(line[0]), line[1:len(line)-2]
	switch kind {
	case SimpleString, ErrorReply:
		return Value{Kind: kind, Str: rest}, nil
	case Integer:
		n, err := strconv.ParseInt(rest, 10, 64)
		if err != nil {
			return Value{}, fmt.Errorf("redis: bad integer %q", rest)
		}
		return Value{Kind: kind, Int: n}, nil
	case BulkString:
		n, err := strconv.Atoi(rest)
		switch {
		case err != nil || n < -1:
			return Value{}, fmt.Errorf("redis: bad bulk length %q", rest)
		case n == -1:
			return Value{Kind: kind, Null: true}, nil
		case n > MaxBulk:
			return Value{}, fmt.Errorf("redis: a %d-byte reply is over %d", n, MaxBulk)
		}
		buf := make([]byte, n+2) // the payload may hold CRLF itself
		if _, err := io.ReadFull(r, buf); err != nil {
			return Value{}, err
		}
		if buf[n] != '\r' || buf[n+1] != '\n' {
			return Value{}, errors.New("redis: a bulk string doesn't end in CRLF")
		}
		return Value{Kind: kind, Str: string(buf[:n])}, nil
	case Array:
		n, err := strconv.Atoi(rest)
		switch {
		case err != nil || n < -1:
			return Value{}, fmt.Errorf("redis: bad array length %q", rest)
		case n == -1:
			return Value{Kind: kind, Null: true}, nil
		}
		v := Value{Kind: kind, Array: make([]Value, 0, min(n, 1024))}
		for i := 0; i < n; i++ {
			e, err := read(r)
			if err != nil {
				return Value{}, err
			}
			v.Array = append(v.Array, e)
		}
		return v, nil
	}
	return Value{}, fmt.Errorf("redis: unknown reply type %q", line[0])
}

// Subscribe subscribes to channels and waits until redis confirms each.
// From then on the connection only receives.
func (c *Conn) Subscribe(channels ...string) error {
	if err := c.Send(append([]string{"SUBSCRIBE"}, channels...)...); err != nil {
		return err
	}
	pending := map[string]bool{}
	for _, ch := range channels {
		pending[ch] = true
	}
	for len(pending) > 0 {
		v, err := c.Read()
		if err != nil {
			return err
		}
		if v.Kind == ErrorReply {
			return &Error{v.Str}
		}
		if len(v.Array) == 3 && v.Array[0].Str == "subscribe" {
			delete(pending, v.Array[1].Str)
		}
	}
	return nil
}

// Message is one pub/sub delivery, or the answer to a PING.
type Message struct {
	Channel string
	Payload string
	Pong    bool
}

// Receive reads the next message on a subscribed connection.
func (c *Conn) Receive() (Message, error) {
	for {
		v, err := c.Read()
		if err != nil {
			return Message{}, err
		}
		switch {
		case v.Kind == ErrorReply:
			return Message{}, &Error{v.Str}
		case len(v.Array) == 3 && v.Array[0].Str == "message":
			return Message{Channel: v.Array[1].Str, Payload: v.Array[2].Str}, nil
		case len(v.Array) == 4 && v.Array[0].Str == "pmessage":
			return Message{Channel: v.Array[2].Str, Payload: v.Array[3].Str}, nil
		case len(v.Array) >= 1 && v.Array[0].Str == "pong":
			return Message{Pong: true}, nil
		}
		// subscribe and unsubscribe confirmations: nothing to deliver
	}
}
