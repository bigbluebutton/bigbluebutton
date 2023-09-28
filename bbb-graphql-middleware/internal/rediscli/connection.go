package rediscli

import "github.com/redis/go-redis/v9"

var redisClient = redis.NewClient(&redis.Options{
	Addr:     "127.0.0.1:6379",
	Password: "",
	DB:       0,
})

func GetRedisConn() *redis.Client {
	return redisClient
}
