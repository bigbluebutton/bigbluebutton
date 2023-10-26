export interface RedisMessageRouting {
    meetingId: String,
    userId: String
}

export interface RedisMessage {
    eventName: String;
    routing: RedisMessageRouting;
    header: Record<string, unknown>;
    body: Record<string, unknown>;
}
