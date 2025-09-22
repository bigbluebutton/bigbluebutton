package common

import (
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/coder/websocket"
	"github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
)

type QueryType string

const (
	Query                 QueryType = "query"
	Subscription          QueryType = "subscription"
	Streaming             QueryType = "streaming"
	SubscriptionAggregate QueryType = "subscription_aggregate"
	Mutation              QueryType = "mutation"
)

type GraphQlSubscription struct {
	Id                         string
	Message                    []byte
	Type                       QueryType
	OperationName              string
	StreamCursorField          string
	StreamCursorVariableName   string
	StreamCursorCurrValue      interface{}
	LastReceivedData           HasuraMessage
	LastReceivedDataChecksum   uint32
	JsonPatchSupported         bool   // indicate if client support Json Patch for this subscription
	LastSeenOnHasuraConnection string // id of the hasura connection that this query was active
}

type BrowserConnection struct {
	sync.RWMutex
	Id                                 string          // browser connection id
	Websocket                          *websocket.Conn // websocket of browser connection
	SessionToken                       string          // session token of this connection
	MeetingId                          string          // auth info provided by bbb-web
	UserId                             string          // auth info provided by bbb-web
	CurrentlyInMeeting                 bool
	BBBWebSessionVariables             map[string]string  // graphql session variables provided by akka-apps
	ClientSessionUUID                  string             // self-generated unique id for this client
	Context                            context.Context    // browser connection context
	ContextCancelFunc                  context.CancelFunc // function to cancel the browser context (and so, the browser connection)
	BrowserRequestCookies              []*http.Cookie
	ActiveSubscriptions                map[string]GraphQlSubscription // active subscriptions of this connection (start, but no stop)
	ActiveSubscriptionsMutex           sync.RWMutex                   // mutex to control the map usage
	ActiveStreamings                   map[string]string              // active streamings of this connection (start, but no stop)
	ActiveStreamingsMutex              sync.RWMutex                   // mutex to control the map usage
	ConnectionInitMessage              []byte                         // init message received in this connection (to be used on hasura reconnect)
	HasuraConnection                   *HasuraConnection              // associated hasura connection
	Disconnected                       bool                           // indicate if the connection is gone
	ConnAckSentToBrowser               bool                           // indicate if `connection_ack` msg was already sent to the browser
	GraphqlActionsContext              context.Context                // graphql actions context
	GraphqlActionsContextCancel        context.CancelFunc             // function to cancel the graphql actions context
	FromBrowserToHasuraChannel         *SafeChannelByte               // channel to transmit messages from Browser to Hasura
	FromBrowserToHasuraRateLimiter     *rate.Limiter                  // rate limiter to transmit messages from Browser to Hasura
	FromBrowserToGqlActionsChannel     *SafeChannelByte               // channel to transmit messages from Browser to Graphq-Actions
	FromBrowserToGqlActionsRateLimiter *rate.Limiter                  // rate limiter to transmit messages from Browser to Graphq-Actions
	FromHasuraToBrowserChannel         *SafeChannelByte               // channel to transmit messages from Hasura/GqlActions to Browser
	LastBrowserMessageTime             time.Time                      // stores the time of the last message to control browser idleness
	Logger                             *logrus.Entry                  // connection logger populated with connection info
}

type HasuraConnection struct {
	Id                  string                // hasura connection id
	BrowserConn         *BrowserConnection    // browser connection that originated this hasura connection
	Websocket           *websocket.Conn       // websocket used to connect to Hasura
	WebsocketCloseError *websocket.CloseError // closeError received from Hasura
	Context             context.Context       // hasura connection context (child of browser connection context)
	ContextCancelFunc   context.CancelFunc    // function to cancel the hasura context (and so, the hasura connection)
}

type HasuraMessage struct {
	Type    string `json:"type"`
	ID      string `json:"id"`
	Payload struct {
		Data map[string]json.RawMessage `json:"data"`
	} `json:"payload"`
}

type BrowserSubscribeMessage struct {
	Type    string `json:"type"`
	ID      string `json:"id"`
	Payload struct {
		Extensions    map[string]interface{} `json:"extensions"`
		OperationName string                 `json:"operationName"`
		Query         string                 `json:"query"`
		Variables     map[string]interface{} `json:"variables"`
	} `json:"payload"`
}

type RedisMessage struct {
	Core struct {
		Header struct {
			Name      string `json:"name"`
			MeetingId string `json:"meetingId"`
			UserId    string `json:"userId"`
		} `json:"header"`
		Body map[string]any `json:"body"`
	} `json:"core"`
}
