// Package fakeredis is an in-memory redis for the runner's own tests: the
// read commands the tap uses, pub/sub, and Go methods to set keys and
// publish. It parses commands itself, written separately from the resp
// client, so the client is never tested against its own parser.
package fakeredis

import (
	"bufio"
	"fmt"
	"io"
	"net"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Server is the fake. Start it with Start.
type Server struct {
	Password string

	ln    net.Listener
	mu    sync.Mutex
	conns map[*conn]bool
	data  map[string]any // string, map[string]string (hash), map[string]bool (set) or []string (list)
	ttl   map[string]time.Time
	cmds  []string
}

type conn struct {
	nc     net.Conn
	wmu    sync.Mutex
	subs   map[string]bool
	authed bool
}

// Start listens on a free local port.
func Start() (*Server, error) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	s := &Server{ln: ln, conns: map[*conn]bool{}, data: map[string]any{}, ttl: map[string]time.Time{}}
	go s.accept()
	return s, nil
}

// Addr is the host:port to dial.
func (s *Server) Addr() string { return s.ln.Addr().String() }

// Close stops listening and drops every connection.
func (s *Server) Close() {
	s.ln.Close()
	s.Kill()
}

// Kill drops every connection, as a redis restart would.
func (s *Server) Kill() {
	s.mu.Lock()
	defer s.mu.Unlock()
	for c := range s.conns {
		c.nc.Close()
	}
}

// Commands lists the commands received, by name.
func (s *Server) Commands() []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]string(nil), s.cmds...)
}

// Subscribers counts the connections subscribed to channel.
func (s *Server) Subscribers(channel string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := 0
	for c := range s.conns {
		if c.subs[channel] {
			n++
		}
	}
	return n
}

// Publish sends payload to channel's subscribers and returns how many.
func (s *Server) Publish(channel, payload string) int {
	s.mu.Lock()
	var to []*conn
	for c := range s.conns {
		if c.subs[channel] {
			to = append(to, c)
		}
	}
	s.mu.Unlock()
	for _, c := range to {
		c.write(array("message", channel, payload))
	}
	return len(to)
}

// HSet sets hash fields: key, then field, value pairs.
func (s *Server) HSet(key string, fv ...string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	h, _ := s.data[key].(map[string]string)
	if h == nil {
		h = map[string]string{}
		s.data[key] = h
	}
	for i := 0; i+1 < len(fv); i += 2 {
		h[fv[i]] = fv[i+1]
	}
}

// SAdd adds set members.
func (s *Server) SAdd(key string, members ...string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	set, _ := s.data[key].(map[string]bool)
	if set == nil {
		set = map[string]bool{}
		s.data[key] = set
	}
	for _, m := range members {
		set[m] = true
	}
}

// RPush appends to a list.
func (s *Server) RPush(key string, items ...string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	l, _ := s.data[key].([]string)
	s.data[key] = append(l, items...)
}

// Set sets a string.
func (s *Server) Set(key, value string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[key] = value
}

// Expire gives a key a time to live.
func (s *Server) Expire(key string, d time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.ttl[key] = time.Now().Add(d)
}

// Del removes keys.
func (s *Server) Del(keys ...string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, k := range keys {
		delete(s.data, k)
		delete(s.ttl, k)
	}
}

func (s *Server) accept() {
	for {
		nc, err := s.ln.Accept()
		if err != nil {
			return
		}
		c := &conn{nc: nc, subs: map[string]bool{}}
		s.mu.Lock()
		s.conns[c] = true
		s.mu.Unlock()
		go s.serve(c)
	}
}

func (s *Server) serve(c *conn) {
	defer func() {
		s.mu.Lock()
		delete(s.conns, c)
		s.mu.Unlock()
		c.nc.Close()
	}()
	r := bufio.NewReader(c.nc)
	for {
		args, err := readCommand(r)
		if err != nil {
			return
		}
		if len(args) == 0 {
			continue
		}
		name := strings.ToUpper(args[0])
		s.mu.Lock()
		s.cmds = append(s.cmds, name)
		s.mu.Unlock()
		c.write(s.do(c, name, args[1:]))
	}
}

// readCommand reads one command: an array of bulk strings.
func readCommand(r *bufio.Reader) ([]string, error) {
	line, err := r.ReadString('\n')
	if err != nil {
		return nil, err
	}
	line = strings.TrimRight(line, "\r\n")
	if !strings.HasPrefix(line, "*") {
		return strings.Fields(line), nil // an inline command
	}
	n, err := strconv.Atoi(line[1:])
	if err != nil {
		return nil, err
	}
	args := make([]string, n)
	for i := range args {
		head, err := r.ReadString('\n')
		if err != nil {
			return nil, err
		}
		size, err := strconv.Atoi(strings.TrimRight(head, "\r\n")[1:])
		if err != nil {
			return nil, err
		}
		buf := make([]byte, size+2)
		if _, err := io.ReadFull(r, buf); err != nil {
			return nil, err
		}
		args[i] = string(buf[:size])
	}
	return args, nil
}

func (c *conn) write(b string) {
	c.wmu.Lock()
	defer c.wmu.Unlock()
	io.WriteString(c.nc, b)
}

func (s *Server) do(c *conn, name string, args []string) string {
	if s.Password != "" && !c.authed && name != "AUTH" {
		return "-NOAUTH Authentication required.\r\n"
	}
	if len(c.subs) > 0 && name != "SUBSCRIBE" && name != "UNSUBSCRIBE" && name != "PING" {
		return "-ERR Can't execute '" + strings.ToLower(name) + "': only (P|S)SUBSCRIBE / (P|S)UNSUBSCRIBE / PING / QUIT / RESET are allowed in this context\r\n"
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.expire()
	switch name {
	case "AUTH":
		if args[len(args)-1] != s.Password {
			return "-WRONGPASS invalid username-password pair or user is disabled.\r\n"
		}
		c.authed = true
		return "+OK\r\n"
	case "SELECT":
		return "+OK\r\n"
	case "PING":
		if len(c.subs) > 0 {
			return array("pong", "")
		}
		return "+PONG\r\n"
	case "SUBSCRIBE":
		var b strings.Builder
		for _, ch := range args {
			c.subs[ch] = true
			fmt.Fprintf(&b, "*3\r\n$9\r\nsubscribe\r\n%s:%d\r\n", bulk(ch), len(c.subs))
		}
		return b.String()
	case "EXISTS":
		n := 0
		for _, k := range args {
			if _, ok := s.data[k]; ok {
				n++
			}
		}
		return fmt.Sprintf(":%d\r\n", n)
	case "TYPE":
		switch s.data[args[0]].(type) {
		case string:
			return "+string\r\n"
		case map[string]string:
			return "+hash\r\n"
		case map[string]bool:
			return "+set\r\n"
		case []string:
			return "+list\r\n"
		}
		return "+none\r\n"
	case "TTL":
		if _, ok := s.data[args[0]]; !ok {
			return ":-2\r\n"
		}
		if at, ok := s.ttl[args[0]]; ok {
			return fmt.Sprintf(":%d\r\n", int(time.Until(at).Seconds()+0.999))
		}
		return ":-1\r\n"
	case "GET":
		v, ok := s.data[args[0]].(string)
		if !ok {
			return s.typed(args[0], "$-1\r\n")
		}
		return bulk(v)
	case "HGETALL":
		h, ok := s.data[args[0]].(map[string]string)
		if !ok {
			return s.typed(args[0], "*0\r\n")
		}
		keys := make([]string, 0, len(h))
		for k := range h {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		var kv []string
		for _, k := range keys {
			kv = append(kv, k, h[k])
		}
		return array(kv...)
	case "SMEMBERS":
		set, ok := s.data[args[0]].(map[string]bool)
		if !ok {
			return s.typed(args[0], "*0\r\n")
		}
		var ms []string
		for m := range set {
			ms = append(ms, m)
		}
		sort.Strings(ms)
		return array(ms...)
	case "LLEN":
		l, ok := s.data[args[0]].([]string)
		if !ok {
			return s.typed(args[0], ":0\r\n")
		}
		return fmt.Sprintf(":%d\r\n", len(l))
	case "LRANGE":
		l, ok := s.data[args[0]].([]string)
		if !ok {
			return s.typed(args[0], "*0\r\n")
		}
		start, _ := strconv.Atoi(args[1])
		stop, _ := strconv.Atoi(args[2])
		if stop < 0 {
			stop += len(l)
		}
		if stop >= len(l) {
			stop = len(l) - 1
		}
		if start > stop {
			return "*0\r\n"
		}
		return array(l[start : stop+1]...)
	}
	return "-ERR unknown command '" + name + "'\r\n"
}

// typed answers empty for a missing key, and WRONGTYPE for another type.
func (s *Server) typed(key, empty string) string {
	if _, ok := s.data[key]; ok {
		return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n"
	}
	return empty
}

func (s *Server) expire() {
	for k, at := range s.ttl {
		if time.Now().After(at) {
			delete(s.data, k)
			delete(s.ttl, k)
		}
	}
}

func bulk(v string) string { return fmt.Sprintf("$%d\r\n%s\r\n", len(v), v) }

func array(items ...string) string {
	var b strings.Builder
	fmt.Fprintf(&b, "*%d\r\n", len(items))
	for _, it := range items {
		b.WriteString(bulk(it))
	}
	return b.String()
}
