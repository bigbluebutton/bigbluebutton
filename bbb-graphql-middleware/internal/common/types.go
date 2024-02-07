package common

import (
	"context"
	"sync"

	"nhooyr.io/websocket"
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
	Message                    map[string]interface{}
	Type                       QueryType
	OperationName              string
	StreamCursorField          string
	StreamCursorVariableName   string
	StreamCursorCurrValue      interface{}
	LastReceivedDataChecksum   uint32
	JsonPatchSupported         bool   // indicate if client support Json Patch for this subscription
	LastSeenOnHasuraConnection string // id of the hasura connection that this query was active
}

type BrowserConnection struct {
	Id                       string                         // browser connection id
	SessionToken             string                         // session token of this connection
	Context                  context.Context                // browser connection context
	ActiveSubscriptions      map[string]GraphQlSubscription // active subscriptions of this connection (start, but no stop)
	ActiveSubscriptionsMutex sync.RWMutex                   // mutex to control the map usage
	ConnectionInitMessage    map[string]interface{}         // init message received in this connection (to be used on hasura reconnect)
	HasuraConnection         *HasuraConnection              // associated hasura connection
	Disconnected             bool                           // indicate if the connection is gone
	ConnAckSentToBrowser     bool                           // indicate if `connection_ack` msg was already sent to the browser
}

type HasuraConnection struct {
	Id                     string             // hasura connection id
	Browserconn            *BrowserConnection // browser connection that originated this hasura connection
	Websocket              *websocket.Conn    // websocket used to connect to hasura
	Context                context.Context    // hasura connection context (child of browser connection context)
	ContextCancelFunc      context.CancelFunc // function to cancel the hasura context (and so, the hasura connection)
	MsgReceivingActiveChan *SafeChannel       // indicate that it's waiting for the return of mutations before closing connection
}
