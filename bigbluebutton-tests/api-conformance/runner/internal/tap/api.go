package tap

import (
	"encoding/json"
	"time"
)

// What the tap's HTTP API answers. Every answer is JSON; errors are
// {"error": "..."} with a 4xx or 5xx status.

// Info describes a running tap: GET /info.
type Info struct {
	Instance   string   `json:"instance"`
	Channels   []string `json:"channels"`
	Subscribed bool     `json:"subscribed"`
	Redis      string   `json:"redis"`
	RedisError string   `json:"redisError,omitempty"`
	DataDir    string   `json:"dataDir,omitempty"`
	Watch      string   `json:"watch"`              // inotify or none
	Watching   []string `json:"watching,omitempty"` // the directories asked for that are watched now, with all below them
	WatchDirs  int      `json:"watchDirs,omitempty"`
	WatchError string   `json:"watchError,omitempty"`
	Seq        int64    `json:"seq"`
}

// Mark is where a case starts looking: GET /mark. Later queries pass
// both back: Seq as after, Instance so a restarted tap, whose numbers
// start again, can't be asked about the wrong window.
type Mark struct {
	Instance string `json:"instance"`
	Seq      int64  `json:"seq"`
}

// BusMessage is one message the tap saw.
type BusMessage struct {
	Seq     int64           `json:"seq"`
	At      time.Time       `json:"at"`
	Channel string          `json:"channel"`
	Message json.RawMessage `json:"message"` // as published; a string if it wasn't JSON
}

// BusResult answers GET /bus: the matching messages after the given seq,
// up to Seq, the last entry looked at, which is where to continue from.
// Gap says the tap may have missed messages in that span (redis was
// unreachable); Truncated that some of it was already dropped.
type BusResult struct {
	Seq       int64        `json:"seq"`
	Gap       bool         `json:"gap,omitempty"`
	Truncated bool         `json:"truncated,omitempty"`
	Messages  []BusMessage `json:"messages"`
}

// RedisValue answers GET /redis: a key's type, time to live (-1 for
// none, -2 when the key doesn't exist) and value: an object for a hash,
// a sorted list for a set, a list for a list, a string, or null.
type RedisValue struct {
	Key       string `json:"key"`
	Type      string `json:"type"`
	TTL       int64  `json:"ttl"`
	Value     any    `json:"value"`
	Truncated bool   `json:"truncated,omitempty"`
}

// File is a file that exists, with its contents (base64 when they aren't
// UTF-8 text, cut at MaxFile).
type File struct {
	Path      string `json:"path"`
	Size      int64  `json:"size"`
	Contents  string `json:"contents"`
	Encoding  string `json:"encoding,omitempty"`
	Truncated bool   `json:"truncated,omitempty"`
}

// Appeared is a file the watcher saw created after the given seq, though
// it may be gone since.
type Appeared struct {
	Path string    `json:"path"`
	Seq  int64     `json:"seq"`
	At   time.Time `json:"at"`
}

// FSResult answers GET /fs: the files matching a glob now, and those
// that appeared after the given seq. Watched says the tap sees the files
// that come and go where the glob can match, so Appeared lists them;
// without it only Files counts. WatchError says why not, when the tap was
// asked to watch there. Gap says it may have missed file events.
type FSResult struct {
	Seq        int64      `json:"seq"`
	Watched    bool       `json:"watched"`
	WatchError string     `json:"watchError,omitempty"`
	Gap        bool       `json:"gap,omitempty"`
	Truncated  bool       `json:"truncated,omitempty"`
	Files      []File     `json:"files"`
	Appeared   []Appeared `json:"appeared"`
}

// MaxFile is the most of a file the tap sends.
const MaxFile = 1 << 20
