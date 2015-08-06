// goal: read JSON metadata for packages and create the mocks
// DEPENDS ON GLOBAL OBJECT: 'ComponentMocker'

var packageMetadata = {
  "standard-app-packages": {},
  "coffeescript": {},
  "mrt:redis": {
    "redis": {
      "type": "object",
      "members": {
        "RedisClient": {
          "type": "function",
          "members": {
            "super_": {
              "type": "function",
              "members": {
                "listenerCount": {
                  "type": "function"
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "setMaxListeners": {
                      "type": "function",
                      "refID": 6
                    },
                    "emit": {
                      "type": "function",
                      "refID": 8
                    },
                    "addListener": {
                      "type": "function",
                      "refID": 10
                    },
                    "on": {
                      "ref": 10
                    },
                    "once": {
                      "type": "function",
                      "refID": 12
                    },
                    "removeListener": {
                      "type": "function",
                      "refID": 14
                    },
                    "removeAllListeners": {
                      "type": "function",
                      "refID": 16
                    },
                    "listeners": {
                      "type": "function",
                      "refID": 18
                    }
                  }
                }
              }
            },
            "prototype": {
              "type": "object",
              "members": {
                "initialize_retry_vars": {
                  "type": "function"
                },
                "flush_and_error": {
                  "type": "function"
                },
                "on_error": {
                  "type": "function"
                },
                "do_auth": {
                  "type": "function"
                },
                "on_connect": {
                  "type": "function"
                },
                "init_parser": {
                  "type": "function"
                },
                "on_ready": {
                  "type": "function"
                },
                "on_info_cmd": {
                  "type": "function"
                },
                "ready_check": {
                  "type": "function"
                },
                "send_offline_queue": {
                  "type": "function"
                },
                "connection_gone": {
                  "type": "function"
                },
                "on_data": {
                  "type": "function"
                },
                "return_error": {
                  "type": "function"
                },
                "return_reply": {
                  "type": "function"
                },
                "send_command": {
                  "type": "function"
                },
                "pub_sub_command": {
                  "type": "function"
                },
                "end": {
                  "type": "function"
                },
                "get": {
                  "type": "function",
                  "refID": 55
                },
                "GET": {
                  "ref": 55
                },
                "set": {
                  "type": "function",
                  "refID": 57
                },
                "SET": {
                  "ref": 57
                },
                "setnx": {
                  "type": "function",
                  "refID": 59
                },
                "SETNX": {
                  "ref": 59
                },
                "setex": {
                  "type": "function",
                  "refID": 61
                },
                "SETEX": {
                  "ref": 61
                },
                "append": {
                  "type": "function",
                  "refID": 63
                },
                "APPEND": {
                  "ref": 63
                },
                "strlen": {
                  "type": "function",
                  "refID": 65
                },
                "STRLEN": {
                  "ref": 65
                },
                "del": {
                  "type": "function",
                  "refID": 67
                },
                "DEL": {
                  "ref": 67
                },
                "exists": {
                  "type": "function",
                  "refID": 69
                },
                "EXISTS": {
                  "ref": 69
                },
                "setbit": {
                  "type": "function",
                  "refID": 71
                },
                "SETBIT": {
                  "ref": 71
                },
                "getbit": {
                  "type": "function",
                  "refID": 73
                },
                "GETBIT": {
                  "ref": 73
                },
                "setrange": {
                  "type": "function",
                  "refID": 75
                },
                "SETRANGE": {
                  "ref": 75
                },
                "getrange": {
                  "type": "function",
                  "refID": 77
                },
                "GETRANGE": {
                  "ref": 77
                },
                "substr": {
                  "type": "function",
                  "refID": 79
                },
                "SUBSTR": {
                  "ref": 79
                },
                "incr": {
                  "type": "function",
                  "refID": 81
                },
                "INCR": {
                  "ref": 81
                },
                "decr": {
                  "type": "function",
                  "refID": 83
                },
                "DECR": {
                  "ref": 83
                },
                "mget": {
                  "type": "function",
                  "refID": 85
                },
                "MGET": {
                  "ref": 85
                },
                "rpush": {
                  "type": "function",
                  "refID": 87
                },
                "RPUSH": {
                  "ref": 87
                },
                "lpush": {
                  "type": "function",
                  "refID": 89
                },
                "LPUSH": {
                  "ref": 89
                },
                "rpushx": {
                  "type": "function",
                  "refID": 91
                },
                "RPUSHX": {
                  "ref": 91
                },
                "lpushx": {
                  "type": "function",
                  "refID": 93
                },
                "LPUSHX": {
                  "ref": 93
                },
                "linsert": {
                  "type": "function",
                  "refID": 95
                },
                "LINSERT": {
                  "ref": 95
                },
                "rpop": {
                  "type": "function",
                  "refID": 97
                },
                "RPOP": {
                  "ref": 97
                },
                "lpop": {
                  "type": "function",
                  "refID": 99
                },
                "LPOP": {
                  "ref": 99
                },
                "brpop": {
                  "type": "function",
                  "refID": 101
                },
                "BRPOP": {
                  "ref": 101
                },
                "brpoplpush": {
                  "type": "function",
                  "refID": 103
                },
                "BRPOPLPUSH": {
                  "ref": 103
                },
                "blpop": {
                  "type": "function",
                  "refID": 105
                },
                "BLPOP": {
                  "ref": 105
                },
                "llen": {
                  "type": "function",
                  "refID": 107
                },
                "LLEN": {
                  "ref": 107
                },
                "lindex": {
                  "type": "function",
                  "refID": 109
                },
                "LINDEX": {
                  "ref": 109
                },
                "lset": {
                  "type": "function",
                  "refID": 111
                },
                "LSET": {
                  "ref": 111
                },
                "lrange": {
                  "type": "function",
                  "refID": 113
                },
                "LRANGE": {
                  "ref": 113
                },
                "ltrim": {
                  "type": "function",
                  "refID": 115
                },
                "LTRIM": {
                  "ref": 115
                },
                "lrem": {
                  "type": "function",
                  "refID": 117
                },
                "LREM": {
                  "ref": 117
                },
                "rpoplpush": {
                  "type": "function",
                  "refID": 119
                },
                "RPOPLPUSH": {
                  "ref": 119
                },
                "sadd": {
                  "type": "function",
                  "refID": 121
                },
                "SADD": {
                  "ref": 121
                },
                "srem": {
                  "type": "function",
                  "refID": 123
                },
                "SREM": {
                  "ref": 123
                },
                "smove": {
                  "type": "function",
                  "refID": 125
                },
                "SMOVE": {
                  "ref": 125
                },
                "sismember": {
                  "type": "function",
                  "refID": 127
                },
                "SISMEMBER": {
                  "ref": 127
                },
                "scard": {
                  "type": "function",
                  "refID": 129
                },
                "SCARD": {
                  "ref": 129
                },
                "spop": {
                  "type": "function",
                  "refID": 131
                },
                "SPOP": {
                  "ref": 131
                },
                "srandmember": {
                  "type": "function",
                  "refID": 133
                },
                "SRANDMEMBER": {
                  "ref": 133
                },
                "sinter": {
                  "type": "function",
                  "refID": 135
                },
                "SINTER": {
                  "ref": 135
                },
                "sinterstore": {
                  "type": "function",
                  "refID": 137
                },
                "SINTERSTORE": {
                  "ref": 137
                },
                "sunion": {
                  "type": "function",
                  "refID": 139
                },
                "SUNION": {
                  "ref": 139
                },
                "sunionstore": {
                  "type": "function",
                  "refID": 141
                },
                "SUNIONSTORE": {
                  "ref": 141
                },
                "sdiff": {
                  "type": "function",
                  "refID": 143
                },
                "SDIFF": {
                  "ref": 143
                },
                "sdiffstore": {
                  "type": "function",
                  "refID": 145
                },
                "SDIFFSTORE": {
                  "ref": 145
                },
                "smembers": {
                  "type": "function",
                  "refID": 147
                },
                "SMEMBERS": {
                  "ref": 147
                },
                "zadd": {
                  "type": "function",
                  "refID": 149
                },
                "ZADD": {
                  "ref": 149
                },
                "zincrby": {
                  "type": "function",
                  "refID": 151
                },
                "ZINCRBY": {
                  "ref": 151
                },
                "zrem": {
                  "type": "function",
                  "refID": 153
                },
                "ZREM": {
                  "ref": 153
                },
                "zremrangebyscore": {
                  "type": "function",
                  "refID": 155
                },
                "ZREMRANGEBYSCORE": {
                  "ref": 155
                },
                "zremrangebyrank": {
                  "type": "function",
                  "refID": 157
                },
                "ZREMRANGEBYRANK": {
                  "ref": 157
                },
                "zunionstore": {
                  "type": "function",
                  "refID": 159
                },
                "ZUNIONSTORE": {
                  "ref": 159
                },
                "zinterstore": {
                  "type": "function",
                  "refID": 161
                },
                "ZINTERSTORE": {
                  "ref": 161
                },
                "zrange": {
                  "type": "function",
                  "refID": 163
                },
                "ZRANGE": {
                  "ref": 163
                },
                "zrangebyscore": {
                  "type": "function",
                  "refID": 165
                },
                "ZRANGEBYSCORE": {
                  "ref": 165
                },
                "zrevrangebyscore": {
                  "type": "function",
                  "refID": 167
                },
                "ZREVRANGEBYSCORE": {
                  "ref": 167
                },
                "zcount": {
                  "type": "function",
                  "refID": 169
                },
                "ZCOUNT": {
                  "ref": 169
                },
                "zrevrange": {
                  "type": "function",
                  "refID": 171
                },
                "ZREVRANGE": {
                  "ref": 171
                },
                "zcard": {
                  "type": "function",
                  "refID": 173
                },
                "ZCARD": {
                  "ref": 173
                },
                "zscore": {
                  "type": "function",
                  "refID": 175
                },
                "ZSCORE": {
                  "ref": 175
                },
                "zrank": {
                  "type": "function",
                  "refID": 177
                },
                "ZRANK": {
                  "ref": 177
                },
                "zrevrank": {
                  "type": "function",
                  "refID": 179
                },
                "ZREVRANK": {
                  "ref": 179
                },
                "hset": {
                  "type": "function",
                  "refID": 181
                },
                "HSET": {
                  "ref": 181
                },
                "hsetnx": {
                  "type": "function",
                  "refID": 183
                },
                "HSETNX": {
                  "ref": 183
                },
                "hget": {
                  "type": "function",
                  "refID": 185
                },
                "HGET": {
                  "ref": 185
                },
                "hmset": {
                  "type": "function",
                  "refID": 187
                },
                "HMSET": {
                  "ref": 187
                },
                "hmget": {
                  "type": "function",
                  "refID": 189
                },
                "HMGET": {
                  "ref": 189
                },
                "hincrby": {
                  "type": "function",
                  "refID": 191
                },
                "HINCRBY": {
                  "ref": 191
                },
                "hdel": {
                  "type": "function",
                  "refID": 193
                },
                "HDEL": {
                  "ref": 193
                },
                "hlen": {
                  "type": "function",
                  "refID": 195
                },
                "HLEN": {
                  "ref": 195
                },
                "hkeys": {
                  "type": "function",
                  "refID": 197
                },
                "HKEYS": {
                  "ref": 197
                },
                "hvals": {
                  "type": "function",
                  "refID": 199
                },
                "HVALS": {
                  "ref": 199
                },
                "hgetall": {
                  "type": "function",
                  "refID": 201
                },
                "HGETALL": {
                  "ref": 201
                },
                "hexists": {
                  "type": "function",
                  "refID": 203
                },
                "HEXISTS": {
                  "ref": 203
                },
                "incrby": {
                  "type": "function",
                  "refID": 205
                },
                "INCRBY": {
                  "ref": 205
                },
                "decrby": {
                  "type": "function",
                  "refID": 207
                },
                "DECRBY": {
                  "ref": 207
                },
                "getset": {
                  "type": "function",
                  "refID": 209
                },
                "GETSET": {
                  "ref": 209
                },
                "mset": {
                  "type": "function",
                  "refID": 211
                },
                "MSET": {
                  "ref": 211
                },
                "msetnx": {
                  "type": "function",
                  "refID": 213
                },
                "MSETNX": {
                  "ref": 213
                },
                "randomkey": {
                  "type": "function",
                  "refID": 215
                },
                "RANDOMKEY": {
                  "ref": 215
                },
                "select": {
                  "type": "function",
                  "refID": 217
                },
                "SELECT": {
                  "ref": 217
                },
                "move": {
                  "type": "function",
                  "refID": 219
                },
                "MOVE": {
                  "ref": 219
                },
                "rename": {
                  "type": "function",
                  "refID": 221
                },
                "RENAME": {
                  "ref": 221
                },
                "renamenx": {
                  "type": "function",
                  "refID": 223
                },
                "RENAMENX": {
                  "ref": 223
                },
                "expire": {
                  "type": "function",
                  "refID": 225
                },
                "EXPIRE": {
                  "ref": 225
                },
                "expireat": {
                  "type": "function",
                  "refID": 227
                },
                "EXPIREAT": {
                  "ref": 227
                },
                "keys": {
                  "type": "function",
                  "refID": 229
                },
                "KEYS": {
                  "ref": 229
                },
                "dbsize": {
                  "type": "function",
                  "refID": 231
                },
                "DBSIZE": {
                  "ref": 231
                },
                "auth": {
                  "type": "function",
                  "refID": 233
                },
                "AUTH": {
                  "ref": 233
                },
                "ping": {
                  "type": "function",
                  "refID": 235
                },
                "PING": {
                  "ref": 235
                },
                "echo": {
                  "type": "function",
                  "refID": 237
                },
                "ECHO": {
                  "ref": 237
                },
                "save": {
                  "type": "function",
                  "refID": 239
                },
                "SAVE": {
                  "ref": 239
                },
                "bgsave": {
                  "type": "function",
                  "refID": 241
                },
                "BGSAVE": {
                  "ref": 241
                },
                "bgrewriteaof": {
                  "type": "function",
                  "refID": 243
                },
                "BGREWRITEAOF": {
                  "ref": 243
                },
                "shutdown": {
                  "type": "function",
                  "refID": 245
                },
                "SHUTDOWN": {
                  "ref": 245
                },
                "lastsave": {
                  "type": "function",
                  "refID": 247
                },
                "LASTSAVE": {
                  "ref": 247
                },
                "type": {
                  "type": "function",
                  "refID": 249
                },
                "TYPE": {
                  "ref": 249
                },
                "multi": {
                  "type": "function"
                },
                "MULTI": {
                  "type": "function"
                },
                "exec": {
                  "type": "function",
                  "refID": 255
                },
                "EXEC": {
                  "ref": 255
                },
                "discard": {
                  "type": "function",
                  "refID": 257
                },
                "DISCARD": {
                  "ref": 257
                },
                "sync": {
                  "type": "function",
                  "refID": 259
                },
                "SYNC": {
                  "ref": 259
                },
                "flushdb": {
                  "type": "function",
                  "refID": 261
                },
                "FLUSHDB": {
                  "ref": 261
                },
                "flushall": {
                  "type": "function",
                  "refID": 263
                },
                "FLUSHALL": {
                  "ref": 263
                },
                "sort": {
                  "type": "function",
                  "refID": 265
                },
                "SORT": {
                  "ref": 265
                },
                "info": {
                  "type": "function",
                  "refID": 267
                },
                "INFO": {
                  "ref": 267
                },
                "monitor": {
                  "type": "function",
                  "refID": 269
                },
                "MONITOR": {
                  "ref": 269
                },
                "ttl": {
                  "type": "function",
                  "refID": 271
                },
                "TTL": {
                  "ref": 271
                },
                "persist": {
                  "type": "function",
                  "refID": 273
                },
                "PERSIST": {
                  "ref": 273
                },
                "slaveof": {
                  "type": "function",
                  "refID": 275
                },
                "SLAVEOF": {
                  "ref": 275
                },
                "debug": {
                  "type": "function",
                  "refID": 277
                },
                "DEBUG": {
                  "ref": 277
                },
                "config": {
                  "type": "function",
                  "refID": 279
                },
                "CONFIG": {
                  "ref": 279
                },
                "subscribe": {
                  "type": "function",
                  "refID": 281
                },
                "SUBSCRIBE": {
                  "ref": 281
                },
                "unsubscribe": {
                  "type": "function",
                  "refID": 283
                },
                "UNSUBSCRIBE": {
                  "ref": 283
                },
                "psubscribe": {
                  "type": "function",
                  "refID": 285
                },
                "PSUBSCRIBE": {
                  "ref": 285
                },
                "punsubscribe": {
                  "type": "function",
                  "refID": 287
                },
                "PUNSUBSCRIBE": {
                  "ref": 287
                },
                "publish": {
                  "type": "function",
                  "refID": 289
                },
                "PUBLISH": {
                  "ref": 289
                },
                "watch": {
                  "type": "function",
                  "refID": 291
                },
                "WATCH": {
                  "ref": 291
                },
                "unwatch": {
                  "type": "function",
                  "refID": 293
                },
                "UNWATCH": {
                  "ref": 293
                },
                "cluster": {
                  "type": "function",
                  "refID": 295
                },
                "CLUSTER": {
                  "ref": 295
                },
                "restore": {
                  "type": "function",
                  "refID": 297
                },
                "RESTORE": {
                  "ref": 297
                },
                "migrate": {
                  "type": "function",
                  "refID": 299
                },
                "MIGRATE": {
                  "ref": 299
                },
                "dump": {
                  "type": "function",
                  "refID": 301
                },
                "DUMP": {
                  "ref": 301
                },
                "object": {
                  "type": "function",
                  "refID": 303
                },
                "OBJECT": {
                  "ref": 303
                },
                "client": {
                  "type": "function",
                  "refID": 305
                },
                "CLIENT": {
                  "ref": 305
                },
                "eval": {
                  "type": "function",
                  "refID": 307
                },
                "EVAL": {
                  "ref": 307
                },
                "evalsha": {
                  "type": "function",
                  "refID": 309
                },
                "EVALSHA": {
                  "ref": 309
                },
                "bitcount": {
                  "type": "function",
                  "refID": 311
                },
                "BITCOUNT": {
                  "ref": 311
                },
                "bitop": {
                  "type": "function",
                  "refID": 313
                },
                "BITOP": {
                  "ref": 313
                },
                "hincrbyfloat": {
                  "type": "function",
                  "refID": 315
                },
                "HINCRBYFLOAT": {
                  "ref": 315
                },
                "incrbyfloat": {
                  "type": "function",
                  "refID": 317
                },
                "INCRBYFLOAT": {
                  "ref": 317
                },
                "pexpire": {
                  "type": "function",
                  "refID": 319
                },
                "PEXPIRE": {
                  "ref": 319
                },
                "pexpireat": {
                  "type": "function",
                  "refID": 321
                },
                "PEXPIREAT": {
                  "ref": 321
                },
                "psetex": {
                  "type": "function",
                  "refID": 323
                },
                "PSETEX": {
                  "ref": 323
                },
                "pttl": {
                  "type": "function",
                  "refID": 325
                },
                "PTTL": {
                  "ref": 325
                },
                "quit": {
                  "type": "function",
                  "refID": 327
                },
                "QUIT": {
                  "ref": 327
                },
                "script": {
                  "type": "function",
                  "refID": 329
                },
                "SCRIPT": {
                  "ref": 329
                },
                "slowlog": {
                  "type": "function",
                  "refID": 331
                },
                "SLOWLOG": {
                  "ref": 331
                },
                "time": {
                  "type": "function",
                  "refID": 333
                },
                "TIME": {
                  "ref": 333
                },
                "setMaxListeners": {
                  "ref": 6
                },
                "emit": {
                  "ref": 8
                },
                "addListener": {
                  "ref": 10
                },
                "on": {
                  "ref": 10
                },
                "once": {
                  "ref": 12
                },
                "removeListener": {
                  "ref": 14
                },
                "removeAllListeners": {
                  "ref": 16
                },
                "listeners": {
                  "ref": 18
                }
              }
            }
          }
        },
        "Multi": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "get": {
                  "type": "function",
                  "refID": 337
                },
                "GET": {
                  "ref": 337
                },
                "set": {
                  "type": "function",
                  "refID": 339
                },
                "SET": {
                  "ref": 339
                },
                "setnx": {
                  "type": "function",
                  "refID": 341
                },
                "SETNX": {
                  "ref": 341
                },
                "setex": {
                  "type": "function",
                  "refID": 343
                },
                "SETEX": {
                  "ref": 343
                },
                "append": {
                  "type": "function",
                  "refID": 345
                },
                "APPEND": {
                  "ref": 345
                },
                "strlen": {
                  "type": "function",
                  "refID": 347
                },
                "STRLEN": {
                  "ref": 347
                },
                "del": {
                  "type": "function",
                  "refID": 349
                },
                "DEL": {
                  "ref": 349
                },
                "exists": {
                  "type": "function",
                  "refID": 351
                },
                "EXISTS": {
                  "ref": 351
                },
                "setbit": {
                  "type": "function",
                  "refID": 353
                },
                "SETBIT": {
                  "ref": 353
                },
                "getbit": {
                  "type": "function",
                  "refID": 355
                },
                "GETBIT": {
                  "ref": 355
                },
                "setrange": {
                  "type": "function",
                  "refID": 357
                },
                "SETRANGE": {
                  "ref": 357
                },
                "getrange": {
                  "type": "function",
                  "refID": 359
                },
                "GETRANGE": {
                  "ref": 359
                },
                "substr": {
                  "type": "function",
                  "refID": 361
                },
                "SUBSTR": {
                  "ref": 361
                },
                "incr": {
                  "type": "function",
                  "refID": 363
                },
                "INCR": {
                  "ref": 363
                },
                "decr": {
                  "type": "function",
                  "refID": 365
                },
                "DECR": {
                  "ref": 365
                },
                "mget": {
                  "type": "function",
                  "refID": 367
                },
                "MGET": {
                  "ref": 367
                },
                "rpush": {
                  "type": "function",
                  "refID": 369
                },
                "RPUSH": {
                  "ref": 369
                },
                "lpush": {
                  "type": "function",
                  "refID": 371
                },
                "LPUSH": {
                  "ref": 371
                },
                "rpushx": {
                  "type": "function",
                  "refID": 373
                },
                "RPUSHX": {
                  "ref": 373
                },
                "lpushx": {
                  "type": "function",
                  "refID": 375
                },
                "LPUSHX": {
                  "ref": 375
                },
                "linsert": {
                  "type": "function",
                  "refID": 377
                },
                "LINSERT": {
                  "ref": 377
                },
                "rpop": {
                  "type": "function",
                  "refID": 379
                },
                "RPOP": {
                  "ref": 379
                },
                "lpop": {
                  "type": "function",
                  "refID": 381
                },
                "LPOP": {
                  "ref": 381
                },
                "brpop": {
                  "type": "function",
                  "refID": 383
                },
                "BRPOP": {
                  "ref": 383
                },
                "brpoplpush": {
                  "type": "function",
                  "refID": 385
                },
                "BRPOPLPUSH": {
                  "ref": 385
                },
                "blpop": {
                  "type": "function",
                  "refID": 387
                },
                "BLPOP": {
                  "ref": 387
                },
                "llen": {
                  "type": "function",
                  "refID": 389
                },
                "LLEN": {
                  "ref": 389
                },
                "lindex": {
                  "type": "function",
                  "refID": 391
                },
                "LINDEX": {
                  "ref": 391
                },
                "lset": {
                  "type": "function",
                  "refID": 393
                },
                "LSET": {
                  "ref": 393
                },
                "lrange": {
                  "type": "function",
                  "refID": 395
                },
                "LRANGE": {
                  "ref": 395
                },
                "ltrim": {
                  "type": "function",
                  "refID": 397
                },
                "LTRIM": {
                  "ref": 397
                },
                "lrem": {
                  "type": "function",
                  "refID": 399
                },
                "LREM": {
                  "ref": 399
                },
                "rpoplpush": {
                  "type": "function",
                  "refID": 401
                },
                "RPOPLPUSH": {
                  "ref": 401
                },
                "sadd": {
                  "type": "function",
                  "refID": 403
                },
                "SADD": {
                  "ref": 403
                },
                "srem": {
                  "type": "function",
                  "refID": 405
                },
                "SREM": {
                  "ref": 405
                },
                "smove": {
                  "type": "function",
                  "refID": 407
                },
                "SMOVE": {
                  "ref": 407
                },
                "sismember": {
                  "type": "function",
                  "refID": 409
                },
                "SISMEMBER": {
                  "ref": 409
                },
                "scard": {
                  "type": "function",
                  "refID": 411
                },
                "SCARD": {
                  "ref": 411
                },
                "spop": {
                  "type": "function",
                  "refID": 413
                },
                "SPOP": {
                  "ref": 413
                },
                "srandmember": {
                  "type": "function",
                  "refID": 415
                },
                "SRANDMEMBER": {
                  "ref": 415
                },
                "sinter": {
                  "type": "function",
                  "refID": 417
                },
                "SINTER": {
                  "ref": 417
                },
                "sinterstore": {
                  "type": "function",
                  "refID": 419
                },
                "SINTERSTORE": {
                  "ref": 419
                },
                "sunion": {
                  "type": "function",
                  "refID": 421
                },
                "SUNION": {
                  "ref": 421
                },
                "sunionstore": {
                  "type": "function",
                  "refID": 423
                },
                "SUNIONSTORE": {
                  "ref": 423
                },
                "sdiff": {
                  "type": "function",
                  "refID": 425
                },
                "SDIFF": {
                  "ref": 425
                },
                "sdiffstore": {
                  "type": "function",
                  "refID": 427
                },
                "SDIFFSTORE": {
                  "ref": 427
                },
                "smembers": {
                  "type": "function",
                  "refID": 429
                },
                "SMEMBERS": {
                  "ref": 429
                },
                "zadd": {
                  "type": "function",
                  "refID": 431
                },
                "ZADD": {
                  "ref": 431
                },
                "zincrby": {
                  "type": "function",
                  "refID": 433
                },
                "ZINCRBY": {
                  "ref": 433
                },
                "zrem": {
                  "type": "function",
                  "refID": 435
                },
                "ZREM": {
                  "ref": 435
                },
                "zremrangebyscore": {
                  "type": "function",
                  "refID": 437
                },
                "ZREMRANGEBYSCORE": {
                  "ref": 437
                },
                "zremrangebyrank": {
                  "type": "function",
                  "refID": 439
                },
                "ZREMRANGEBYRANK": {
                  "ref": 439
                },
                "zunionstore": {
                  "type": "function",
                  "refID": 441
                },
                "ZUNIONSTORE": {
                  "ref": 441
                },
                "zinterstore": {
                  "type": "function",
                  "refID": 443
                },
                "ZINTERSTORE": {
                  "ref": 443
                },
                "zrange": {
                  "type": "function",
                  "refID": 445
                },
                "ZRANGE": {
                  "ref": 445
                },
                "zrangebyscore": {
                  "type": "function",
                  "refID": 447
                },
                "ZRANGEBYSCORE": {
                  "ref": 447
                },
                "zrevrangebyscore": {
                  "type": "function",
                  "refID": 449
                },
                "ZREVRANGEBYSCORE": {
                  "ref": 449
                },
                "zcount": {
                  "type": "function",
                  "refID": 451
                },
                "ZCOUNT": {
                  "ref": 451
                },
                "zrevrange": {
                  "type": "function",
                  "refID": 453
                },
                "ZREVRANGE": {
                  "ref": 453
                },
                "zcard": {
                  "type": "function",
                  "refID": 455
                },
                "ZCARD": {
                  "ref": 455
                },
                "zscore": {
                  "type": "function",
                  "refID": 457
                },
                "ZSCORE": {
                  "ref": 457
                },
                "zrank": {
                  "type": "function",
                  "refID": 459
                },
                "ZRANK": {
                  "ref": 459
                },
                "zrevrank": {
                  "type": "function",
                  "refID": 461
                },
                "ZREVRANK": {
                  "ref": 461
                },
                "hset": {
                  "type": "function",
                  "refID": 463
                },
                "HSET": {
                  "ref": 463
                },
                "hsetnx": {
                  "type": "function",
                  "refID": 465
                },
                "HSETNX": {
                  "ref": 465
                },
                "hget": {
                  "type": "function",
                  "refID": 467
                },
                "HGET": {
                  "ref": 467
                },
                "hmset": {
                  "type": "function",
                  "refID": 469
                },
                "HMSET": {
                  "ref": 469
                },
                "hmget": {
                  "type": "function",
                  "refID": 471
                },
                "HMGET": {
                  "ref": 471
                },
                "hincrby": {
                  "type": "function",
                  "refID": 473
                },
                "HINCRBY": {
                  "ref": 473
                },
                "hdel": {
                  "type": "function",
                  "refID": 475
                },
                "HDEL": {
                  "ref": 475
                },
                "hlen": {
                  "type": "function",
                  "refID": 477
                },
                "HLEN": {
                  "ref": 477
                },
                "hkeys": {
                  "type": "function",
                  "refID": 479
                },
                "HKEYS": {
                  "ref": 479
                },
                "hvals": {
                  "type": "function",
                  "refID": 481
                },
                "HVALS": {
                  "ref": 481
                },
                "hgetall": {
                  "type": "function",
                  "refID": 483
                },
                "HGETALL": {
                  "ref": 483
                },
                "hexists": {
                  "type": "function",
                  "refID": 485
                },
                "HEXISTS": {
                  "ref": 485
                },
                "incrby": {
                  "type": "function",
                  "refID": 487
                },
                "INCRBY": {
                  "ref": 487
                },
                "decrby": {
                  "type": "function",
                  "refID": 489
                },
                "DECRBY": {
                  "ref": 489
                },
                "getset": {
                  "type": "function",
                  "refID": 491
                },
                "GETSET": {
                  "ref": 491
                },
                "mset": {
                  "type": "function",
                  "refID": 493
                },
                "MSET": {
                  "ref": 493
                },
                "msetnx": {
                  "type": "function",
                  "refID": 495
                },
                "MSETNX": {
                  "ref": 495
                },
                "randomkey": {
                  "type": "function",
                  "refID": 497
                },
                "RANDOMKEY": {
                  "ref": 497
                },
                "select": {
                  "type": "function",
                  "refID": 499
                },
                "SELECT": {
                  "ref": 499
                },
                "move": {
                  "type": "function",
                  "refID": 501
                },
                "MOVE": {
                  "ref": 501
                },
                "rename": {
                  "type": "function",
                  "refID": 503
                },
                "RENAME": {
                  "ref": 503
                },
                "renamenx": {
                  "type": "function",
                  "refID": 505
                },
                "RENAMENX": {
                  "ref": 505
                },
                "expire": {
                  "type": "function",
                  "refID": 507
                },
                "EXPIRE": {
                  "ref": 507
                },
                "expireat": {
                  "type": "function",
                  "refID": 509
                },
                "EXPIREAT": {
                  "ref": 509
                },
                "keys": {
                  "type": "function",
                  "refID": 511
                },
                "KEYS": {
                  "ref": 511
                },
                "dbsize": {
                  "type": "function",
                  "refID": 513
                },
                "DBSIZE": {
                  "ref": 513
                },
                "auth": {
                  "type": "function",
                  "refID": 515
                },
                "AUTH": {
                  "ref": 515
                },
                "ping": {
                  "type": "function",
                  "refID": 517
                },
                "PING": {
                  "ref": 517
                },
                "echo": {
                  "type": "function",
                  "refID": 519
                },
                "ECHO": {
                  "ref": 519
                },
                "save": {
                  "type": "function",
                  "refID": 521
                },
                "SAVE": {
                  "ref": 521
                },
                "bgsave": {
                  "type": "function",
                  "refID": 523
                },
                "BGSAVE": {
                  "ref": 523
                },
                "bgrewriteaof": {
                  "type": "function",
                  "refID": 525
                },
                "BGREWRITEAOF": {
                  "ref": 525
                },
                "shutdown": {
                  "type": "function",
                  "refID": 527
                },
                "SHUTDOWN": {
                  "ref": 527
                },
                "lastsave": {
                  "type": "function",
                  "refID": 529
                },
                "LASTSAVE": {
                  "ref": 529
                },
                "type": {
                  "type": "function",
                  "refID": 531
                },
                "TYPE": {
                  "ref": 531
                },
                "multi": {
                  "type": "function",
                  "refID": 533
                },
                "MULTI": {
                  "ref": 533
                },
                "exec": {
                  "type": "function",
                  "refID": 535
                },
                "EXEC": {
                  "ref": 535
                },
                "discard": {
                  "type": "function",
                  "refID": 537
                },
                "DISCARD": {
                  "ref": 537
                },
                "sync": {
                  "type": "function",
                  "refID": 539
                },
                "SYNC": {
                  "ref": 539
                },
                "flushdb": {
                  "type": "function",
                  "refID": 541
                },
                "FLUSHDB": {
                  "ref": 541
                },
                "flushall": {
                  "type": "function",
                  "refID": 543
                },
                "FLUSHALL": {
                  "ref": 543
                },
                "sort": {
                  "type": "function",
                  "refID": 545
                },
                "SORT": {
                  "ref": 545
                },
                "info": {
                  "type": "function",
                  "refID": 547
                },
                "INFO": {
                  "ref": 547
                },
                "monitor": {
                  "type": "function",
                  "refID": 549
                },
                "MONITOR": {
                  "ref": 549
                },
                "ttl": {
                  "type": "function",
                  "refID": 551
                },
                "TTL": {
                  "ref": 551
                },
                "persist": {
                  "type": "function",
                  "refID": 553
                },
                "PERSIST": {
                  "ref": 553
                },
                "slaveof": {
                  "type": "function",
                  "refID": 555
                },
                "SLAVEOF": {
                  "ref": 555
                },
                "debug": {
                  "type": "function",
                  "refID": 557
                },
                "DEBUG": {
                  "ref": 557
                },
                "config": {
                  "type": "function",
                  "refID": 559
                },
                "CONFIG": {
                  "ref": 559
                },
                "subscribe": {
                  "type": "function",
                  "refID": 561
                },
                "SUBSCRIBE": {
                  "ref": 561
                },
                "unsubscribe": {
                  "type": "function",
                  "refID": 563
                },
                "UNSUBSCRIBE": {
                  "ref": 563
                },
                "psubscribe": {
                  "type": "function",
                  "refID": 565
                },
                "PSUBSCRIBE": {
                  "ref": 565
                },
                "punsubscribe": {
                  "type": "function",
                  "refID": 567
                },
                "PUNSUBSCRIBE": {
                  "ref": 567
                },
                "publish": {
                  "type": "function",
                  "refID": 569
                },
                "PUBLISH": {
                  "ref": 569
                },
                "watch": {
                  "type": "function",
                  "refID": 571
                },
                "WATCH": {
                  "ref": 571
                },
                "unwatch": {
                  "type": "function",
                  "refID": 573
                },
                "UNWATCH": {
                  "ref": 573
                },
                "cluster": {
                  "type": "function",
                  "refID": 575
                },
                "CLUSTER": {
                  "ref": 575
                },
                "restore": {
                  "type": "function",
                  "refID": 577
                },
                "RESTORE": {
                  "ref": 577
                },
                "migrate": {
                  "type": "function",
                  "refID": 579
                },
                "MIGRATE": {
                  "ref": 579
                },
                "dump": {
                  "type": "function",
                  "refID": 581
                },
                "DUMP": {
                  "ref": 581
                },
                "object": {
                  "type": "function",
                  "refID": 583
                },
                "OBJECT": {
                  "ref": 583
                },
                "client": {
                  "type": "function",
                  "refID": 585
                },
                "CLIENT": {
                  "ref": 585
                },
                "eval": {
                  "type": "function",
                  "refID": 587
                },
                "EVAL": {
                  "ref": 587
                },
                "evalsha": {
                  "type": "function",
                  "refID": 589
                },
                "EVALSHA": {
                  "ref": 589
                },
                "bitcount": {
                  "type": "function",
                  "refID": 591
                },
                "BITCOUNT": {
                  "ref": 591
                },
                "bitop": {
                  "type": "function",
                  "refID": 593
                },
                "BITOP": {
                  "ref": 593
                },
                "hincrbyfloat": {
                  "type": "function",
                  "refID": 595
                },
                "HINCRBYFLOAT": {
                  "ref": 595
                },
                "incrbyfloat": {
                  "type": "function",
                  "refID": 597
                },
                "INCRBYFLOAT": {
                  "ref": 597
                },
                "pexpire": {
                  "type": "function",
                  "refID": 599
                },
                "PEXPIRE": {
                  "ref": 599
                },
                "pexpireat": {
                  "type": "function",
                  "refID": 601
                },
                "PEXPIREAT": {
                  "ref": 601
                },
                "psetex": {
                  "type": "function",
                  "refID": 603
                },
                "PSETEX": {
                  "ref": 603
                },
                "pttl": {
                  "type": "function",
                  "refID": 605
                },
                "PTTL": {
                  "ref": 605
                },
                "quit": {
                  "type": "function",
                  "refID": 607
                },
                "QUIT": {
                  "ref": 607
                },
                "script": {
                  "type": "function",
                  "refID": 609
                },
                "SCRIPT": {
                  "ref": 609
                },
                "slowlog": {
                  "type": "function",
                  "refID": 611
                },
                "SLOWLOG": {
                  "ref": 611
                },
                "time": {
                  "type": "function",
                  "refID": 613
                },
                "TIME": {
                  "ref": 613
                }
              }
            }
          }
        },
        "createClient": {
          "type": "function"
        },
        "print": {
          "type": "function"
        }
      }
    }
  },
  "arunoda:npm": {
    "Async": {
      "type": "object",
      "members": {
        "runSync": {
          "type": "function"
        },
        "wrap": {
          "type": "function"
        }
      }
    }
  },
  "amplify": {},
  "json": {},
  "base64": {
    "Base64": {
      "type": "object",
      "members": {
        "encode": {
          "type": "function"
        },
        "newBinary": {
          "type": "function"
        },
        "decode": {
          "type": "function"
        }
      }
    }
  },
  "ejson": {
    "EJSON": {
      "type": "object",
      "members": {
        "addType": {
          "type": "function"
        },
        "toJSONValue": {
          "type": "function"
        },
        "fromJSONValue": {
          "type": "function"
        },
        "stringify": {
          "type": "function"
        },
        "parse": {
          "type": "function"
        },
        "isBinary": {
          "type": "function"
        },
        "equals": {
          "type": "function"
        },
        "clone": {
          "type": "function"
        },
        "newBinary": {
          "type": "function"
        }
      }
    },
    "EJSONTest": {
      "type": "object"
    }
  },
  "logging": {
    "Log": {
      "type": "function",
      "members": {
        "outputFormat": {
          "type": "constant",
          "value": "json"
        },
        "debug": {
          "type": "function"
        },
        "info": {
          "type": "function"
        },
        "warn": {
          "type": "function"
        },
        "error": {
          "type": "function"
        },
        "parse": {
          "type": "function"
        },
        "format": {
          "type": "function"
        },
        "objFromText": {
          "type": "function"
        }
      }
    }
  },
  "routepolicy": {
    "RoutePolicy": {
      "type": "object",
      "members": {
        "urlPrefixTypes": {
          "type": "object",
          "members": {
            "/sockjs/": {
              "type": "constant",
              "value": "network"
            }
          }
        },
        "urlPrefixMatches": {
          "type": "function"
        },
        "checkType": {
          "type": "function"
        },
        "checkUrlPrefix": {
          "type": "function"
        },
        "checkForConflictWithStatic": {
          "type": "function"
        },
        "declare": {
          "type": "function"
        },
        "isValidUrl": {
          "type": "function"
        },
        "classify": {
          "type": "function"
        },
        "urlPrefixesFor": {
          "type": "function"
        }
      }
    },
    "RoutePolicyTest": {
      "type": "object",
      "members": {
        "Constructor": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "urlPrefixMatches": {
                  "type": "function"
                },
                "checkType": {
                  "type": "function"
                },
                "checkUrlPrefix": {
                  "type": "function"
                },
                "checkForConflictWithStatic": {
                  "type": "function"
                },
                "declare": {
                  "type": "function"
                },
                "isValidUrl": {
                  "type": "function"
                },
                "classify": {
                  "type": "function"
                },
                "urlPrefixesFor": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    }
  },
  "tracker": {
    "Tracker": {
      "type": "object",
      "members": {
        "currentComputation": {
          "type": "null",
          "value": null
        },
        "Computation": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onInvalidate": {
                  "type": "function"
                },
                "invalidate": {
                  "type": "function"
                },
                "stop": {
                  "type": "function"
                }
              }
            }
          }
        },
        "Dependency": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "depend": {
                  "type": "function"
                },
                "changed": {
                  "type": "function"
                },
                "hasDependents": {
                  "type": "function"
                }
              }
            }
          }
        },
        "flush": {
          "type": "function"
        },
        "autorun": {
          "type": "function"
        },
        "nonreactive": {
          "type": "function"
        },
        "onInvalidate": {
          "type": "function"
        },
        "afterFlush": {
          "type": "function"
        },
        "depend": {
          "type": "function"
        }
      }
    },
    "Deps": {
      "type": "object",
      "members": {
        "currentComputation": {
          "type": "null",
          "value": null
        },
        "Computation": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onInvalidate": {
                  "type": "function"
                },
                "invalidate": {
                  "type": "function"
                },
                "stop": {
                  "type": "function"
                }
              }
            }
          }
        },
        "Dependency": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "depend": {
                  "type": "function"
                },
                "changed": {
                  "type": "function"
                },
                "hasDependents": {
                  "type": "function"
                }
              }
            }
          }
        },
        "flush": {
          "type": "function"
        },
        "autorun": {
          "type": "function"
        },
        "nonreactive": {
          "type": "function"
        },
        "onInvalidate": {
          "type": "function"
        },
        "afterFlush": {
          "type": "function"
        },
        "depend": {
          "type": "function"
        }
      }
    }
  },
  "deps": {
    "Tracker": {
      "type": "object",
      "members": {
        "currentComputation": {
          "type": "null",
          "value": null
        },
        "Computation": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onInvalidate": {
                  "type": "function"
                },
                "invalidate": {
                  "type": "function"
                },
                "stop": {
                  "type": "function"
                }
              }
            }
          }
        },
        "Dependency": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "depend": {
                  "type": "function"
                },
                "changed": {
                  "type": "function"
                },
                "hasDependents": {
                  "type": "function"
                }
              }
            }
          }
        },
        "flush": {
          "type": "function"
        },
        "autorun": {
          "type": "function"
        },
        "nonreactive": {
          "type": "function"
        },
        "onInvalidate": {
          "type": "function"
        },
        "afterFlush": {
          "type": "function"
        },
        "depend": {
          "type": "function"
        }
      }
    },
    "Deps": {
      "type": "object",
      "members": {
        "currentComputation": {
          "type": "null",
          "value": null
        },
        "Computation": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onInvalidate": {
                  "type": "function"
                },
                "invalidate": {
                  "type": "function"
                },
                "stop": {
                  "type": "function"
                }
              }
            }
          }
        },
        "Dependency": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "depend": {
                  "type": "function"
                },
                "changed": {
                  "type": "function"
                },
                "hasDependents": {
                  "type": "function"
                }
              }
            }
          }
        },
        "flush": {
          "type": "function"
        },
        "autorun": {
          "type": "function"
        },
        "nonreactive": {
          "type": "function"
        },
        "onInvalidate": {
          "type": "function"
        },
        "afterFlush": {
          "type": "function"
        },
        "depend": {
          "type": "function"
        }
      }
    }
  },
  "htmljs": {
    "HTML": {
      "type": "object",
      "members": {
        "Visitor": {
          "type": "function",
          "members": {
            "def": {
              "type": "function",
              "refID": 2
            },
            "extend": {
              "type": "function",
              "refID": 4
            },
            "prototype": {
              "type": "object",
              "members": {
                "visit": {
                  "type": "function",
                  "refID": 7
                },
                "visitNull": {
                  "type": "function"
                },
                "visitPrimitive": {
                  "type": "function"
                },
                "visitArray": {
                  "type": "function"
                },
                "visitComment": {
                  "type": "function"
                },
                "visitCharRef": {
                  "type": "function"
                },
                "visitRaw": {
                  "type": "function"
                },
                "visitTag": {
                  "type": "function"
                },
                "visitObject": {
                  "type": "function"
                },
                "visitFunction": {
                  "type": "function",
                  "refID": 25
                }
              }
            }
          }
        },
        "TransformingVisitor": {
          "type": "function",
          "members": {
            "extend": {
              "ref": 4
            },
            "def": {
              "ref": 2
            },
            "prototype": {
              "type": "object",
              "members": {
                "visitNull": {
                  "type": "function",
                  "refID": 29
                },
                "visitPrimitive": {
                  "ref": 29
                },
                "visitArray": {
                  "type": "function"
                },
                "visitComment": {
                  "ref": 29
                },
                "visitCharRef": {
                  "ref": 29
                },
                "visitRaw": {
                  "ref": 29
                },
                "visitObject": {
                  "ref": 29
                },
                "visitFunction": {
                  "ref": 29
                },
                "visitTag": {
                  "type": "function"
                },
                "visitChildren": {
                  "type": "function"
                },
                "visitAttributes": {
                  "type": "function"
                },
                "visitAttribute": {
                  "type": "function"
                },
                "visit": {
                  "ref": 7
                }
              }
            }
          }
        },
        "ToTextVisitor": {
          "type": "function",
          "members": {
            "extend": {
              "ref": 4
            },
            "def": {
              "ref": 2
            },
            "prototype": {
              "type": "object",
              "members": {
                "visitNull": {
                  "type": "function"
                },
                "visitPrimitive": {
                  "type": "function"
                },
                "visitArray": {
                  "type": "function"
                },
                "visitComment": {
                  "type": "function"
                },
                "visitCharRef": {
                  "type": "function"
                },
                "visitRaw": {
                  "type": "function"
                },
                "visitTag": {
                  "type": "function"
                },
                "visitObject": {
                  "type": "function"
                },
                "toHTML": {
                  "type": "function"
                },
                "visit": {
                  "ref": 7
                },
                "visitFunction": {
                  "ref": 25
                }
              }
            }
          }
        },
        "ToHTMLVisitor": {
          "type": "function",
          "members": {
            "extend": {
              "ref": 4
            },
            "def": {
              "ref": 2
            },
            "prototype": {
              "type": "object",
              "members": {
                "visitNull": {
                  "type": "function"
                },
                "visitPrimitive": {
                  "type": "function"
                },
                "visitArray": {
                  "type": "function"
                },
                "visitComment": {
                  "type": "function"
                },
                "visitCharRef": {
                  "type": "function"
                },
                "visitRaw": {
                  "type": "function"
                },
                "visitTag": {
                  "type": "function"
                },
                "visitObject": {
                  "type": "function"
                },
                "toText": {
                  "type": "function"
                },
                "visit": {
                  "ref": 7
                },
                "visitFunction": {
                  "ref": 25
                }
              }
            }
          }
        },
        "Tag": {
          "type": "function",
          "members": {
            "htmljsType": {
              "type": "array",
              "refID": 82
            },
            "prototype": {
              "type": "object",
              "members": {
                "tagName": {
                  "type": "constant",
                  "value": ""
                },
                "attrs": {
                  "type": "null",
                  "value": null
                },
                "children": {
                  "type": "array",
                  "refID": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "Attrs": {
          "type": "function"
        },
        "getTag": {
          "type": "function"
        },
        "ensureTag": {
          "type": "function"
        },
        "isTagEnsured": {
          "type": "function"
        },
        "getSymbolName": {
          "type": "function"
        },
        "knownElementNames": {
          "type": "array"
        },
        "knownSVGElementNames": {
          "type": "array"
        },
        "voidElementNames": {
          "type": "array"
        },
        "isKnownElement": {
          "type": "function"
        },
        "isKnownSVGElement": {
          "type": "function"
        },
        "isVoidElement": {
          "type": "function"
        },
        "A": {
          "type": "function",
          "refID": 104,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 104
                },
                "tagName": {
                  "type": "constant",
                  "value": "a"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ABBR": {
          "type": "function",
          "refID": 106,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 106
                },
                "tagName": {
                  "type": "constant",
                  "value": "abbr"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ACRONYM": {
          "type": "function",
          "refID": 108,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 108
                },
                "tagName": {
                  "type": "constant",
                  "value": "acronym"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ADDRESS": {
          "type": "function",
          "refID": 110,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 110
                },
                "tagName": {
                  "type": "constant",
                  "value": "address"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "APPLET": {
          "type": "function",
          "refID": 112,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 112
                },
                "tagName": {
                  "type": "constant",
                  "value": "applet"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "AREA": {
          "type": "function",
          "refID": 114,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 114
                },
                "tagName": {
                  "type": "constant",
                  "value": "area"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ARTICLE": {
          "type": "function",
          "refID": 116,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 116
                },
                "tagName": {
                  "type": "constant",
                  "value": "article"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ASIDE": {
          "type": "function",
          "refID": 118,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 118
                },
                "tagName": {
                  "type": "constant",
                  "value": "aside"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "AUDIO": {
          "type": "function",
          "refID": 120,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 120
                },
                "tagName": {
                  "type": "constant",
                  "value": "audio"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "B": {
          "type": "function",
          "refID": 122,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 122
                },
                "tagName": {
                  "type": "constant",
                  "value": "b"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BASE": {
          "type": "function",
          "refID": 124,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 124
                },
                "tagName": {
                  "type": "constant",
                  "value": "base"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BASEFONT": {
          "type": "function",
          "refID": 126,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 126
                },
                "tagName": {
                  "type": "constant",
                  "value": "basefont"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BDI": {
          "type": "function",
          "refID": 128,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 128
                },
                "tagName": {
                  "type": "constant",
                  "value": "bdi"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BDO": {
          "type": "function",
          "refID": 130,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 130
                },
                "tagName": {
                  "type": "constant",
                  "value": "bdo"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BIG": {
          "type": "function",
          "refID": 132,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 132
                },
                "tagName": {
                  "type": "constant",
                  "value": "big"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BLOCKQUOTE": {
          "type": "function",
          "refID": 134,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 134
                },
                "tagName": {
                  "type": "constant",
                  "value": "blockquote"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BODY": {
          "type": "function",
          "refID": 136,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 136
                },
                "tagName": {
                  "type": "constant",
                  "value": "body"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BR": {
          "type": "function",
          "refID": 138,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 138
                },
                "tagName": {
                  "type": "constant",
                  "value": "br"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "BUTTON": {
          "type": "function",
          "refID": 140,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 140
                },
                "tagName": {
                  "type": "constant",
                  "value": "button"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CANVAS": {
          "type": "function",
          "refID": 142,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 142
                },
                "tagName": {
                  "type": "constant",
                  "value": "canvas"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CAPTION": {
          "type": "function",
          "refID": 144,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 144
                },
                "tagName": {
                  "type": "constant",
                  "value": "caption"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CENTER": {
          "type": "function",
          "refID": 146,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 146
                },
                "tagName": {
                  "type": "constant",
                  "value": "center"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CITE": {
          "type": "function",
          "refID": 148,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 148
                },
                "tagName": {
                  "type": "constant",
                  "value": "cite"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CODE": {
          "type": "function",
          "refID": 150,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 150
                },
                "tagName": {
                  "type": "constant",
                  "value": "code"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "COL": {
          "type": "function",
          "refID": 152,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 152
                },
                "tagName": {
                  "type": "constant",
                  "value": "col"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "COLGROUP": {
          "type": "function",
          "refID": 154,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 154
                },
                "tagName": {
                  "type": "constant",
                  "value": "colgroup"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "COMMAND": {
          "type": "function",
          "refID": 156,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 156
                },
                "tagName": {
                  "type": "constant",
                  "value": "command"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DATA": {
          "type": "function",
          "refID": 158,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 158
                },
                "tagName": {
                  "type": "constant",
                  "value": "data"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DATAGRID": {
          "type": "function",
          "refID": 160,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 160
                },
                "tagName": {
                  "type": "constant",
                  "value": "datagrid"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DATALIST": {
          "type": "function",
          "refID": 162,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 162
                },
                "tagName": {
                  "type": "constant",
                  "value": "datalist"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DD": {
          "type": "function",
          "refID": 164,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 164
                },
                "tagName": {
                  "type": "constant",
                  "value": "dd"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DEL": {
          "type": "function",
          "refID": 166,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 166
                },
                "tagName": {
                  "type": "constant",
                  "value": "del"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DETAILS": {
          "type": "function",
          "refID": 168,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 168
                },
                "tagName": {
                  "type": "constant",
                  "value": "details"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DFN": {
          "type": "function",
          "refID": 170,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 170
                },
                "tagName": {
                  "type": "constant",
                  "value": "dfn"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DIR": {
          "type": "function",
          "refID": 172,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 172
                },
                "tagName": {
                  "type": "constant",
                  "value": "dir"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DIV": {
          "type": "function",
          "refID": 174,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 174
                },
                "tagName": {
                  "type": "constant",
                  "value": "div"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DL": {
          "type": "function",
          "refID": 176,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 176
                },
                "tagName": {
                  "type": "constant",
                  "value": "dl"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DT": {
          "type": "function",
          "refID": 178,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 178
                },
                "tagName": {
                  "type": "constant",
                  "value": "dt"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "EM": {
          "type": "function",
          "refID": 180,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 180
                },
                "tagName": {
                  "type": "constant",
                  "value": "em"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "EMBED": {
          "type": "function",
          "refID": 182,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 182
                },
                "tagName": {
                  "type": "constant",
                  "value": "embed"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "EVENTSOURCE": {
          "type": "function",
          "refID": 184,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 184
                },
                "tagName": {
                  "type": "constant",
                  "value": "eventsource"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FIELDSET": {
          "type": "function",
          "refID": 186,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 186
                },
                "tagName": {
                  "type": "constant",
                  "value": "fieldset"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FIGCAPTION": {
          "type": "function",
          "refID": 188,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 188
                },
                "tagName": {
                  "type": "constant",
                  "value": "figcaption"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FIGURE": {
          "type": "function",
          "refID": 190,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 190
                },
                "tagName": {
                  "type": "constant",
                  "value": "figure"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FONT": {
          "type": "function",
          "refID": 192,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 192
                },
                "tagName": {
                  "type": "constant",
                  "value": "font"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FOOTER": {
          "type": "function",
          "refID": 194,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 194
                },
                "tagName": {
                  "type": "constant",
                  "value": "footer"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FORM": {
          "type": "function",
          "refID": 196,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 196
                },
                "tagName": {
                  "type": "constant",
                  "value": "form"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FRAME": {
          "type": "function",
          "refID": 198,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 198
                },
                "tagName": {
                  "type": "constant",
                  "value": "frame"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FRAMESET": {
          "type": "function",
          "refID": 200,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 200
                },
                "tagName": {
                  "type": "constant",
                  "value": "frameset"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "H1": {
          "type": "function",
          "refID": 202,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 202
                },
                "tagName": {
                  "type": "constant",
                  "value": "h1"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "H2": {
          "type": "function",
          "refID": 204,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 204
                },
                "tagName": {
                  "type": "constant",
                  "value": "h2"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "H3": {
          "type": "function",
          "refID": 206,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 206
                },
                "tagName": {
                  "type": "constant",
                  "value": "h3"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "H4": {
          "type": "function",
          "refID": 208,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 208
                },
                "tagName": {
                  "type": "constant",
                  "value": "h4"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "H5": {
          "type": "function",
          "refID": 210,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 210
                },
                "tagName": {
                  "type": "constant",
                  "value": "h5"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "H6": {
          "type": "function",
          "refID": 212,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 212
                },
                "tagName": {
                  "type": "constant",
                  "value": "h6"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "HEAD": {
          "type": "function",
          "refID": 214,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 214
                },
                "tagName": {
                  "type": "constant",
                  "value": "head"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "HEADER": {
          "type": "function",
          "refID": 216,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 216
                },
                "tagName": {
                  "type": "constant",
                  "value": "header"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "HGROUP": {
          "type": "function",
          "refID": 218,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 218
                },
                "tagName": {
                  "type": "constant",
                  "value": "hgroup"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "HR": {
          "type": "function",
          "refID": 220,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 220
                },
                "tagName": {
                  "type": "constant",
                  "value": "hr"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "HTML": {
          "type": "function",
          "refID": 222,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 222
                },
                "tagName": {
                  "type": "constant",
                  "value": "html"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "I": {
          "type": "function",
          "refID": 224,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 224
                },
                "tagName": {
                  "type": "constant",
                  "value": "i"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "IFRAME": {
          "type": "function",
          "refID": 226,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 226
                },
                "tagName": {
                  "type": "constant",
                  "value": "iframe"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "IMG": {
          "type": "function",
          "refID": 228,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 228
                },
                "tagName": {
                  "type": "constant",
                  "value": "img"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "INPUT": {
          "type": "function",
          "refID": 230,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 230
                },
                "tagName": {
                  "type": "constant",
                  "value": "input"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "INS": {
          "type": "function",
          "refID": 232,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 232
                },
                "tagName": {
                  "type": "constant",
                  "value": "ins"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ISINDEX": {
          "type": "function",
          "refID": 234,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 234
                },
                "tagName": {
                  "type": "constant",
                  "value": "isindex"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "KBD": {
          "type": "function",
          "refID": 236,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 236
                },
                "tagName": {
                  "type": "constant",
                  "value": "kbd"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "KEYGEN": {
          "type": "function",
          "refID": 238,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 238
                },
                "tagName": {
                  "type": "constant",
                  "value": "keygen"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "LABEL": {
          "type": "function",
          "refID": 240,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 240
                },
                "tagName": {
                  "type": "constant",
                  "value": "label"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "LEGEND": {
          "type": "function",
          "refID": 242,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 242
                },
                "tagName": {
                  "type": "constant",
                  "value": "legend"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "LI": {
          "type": "function",
          "refID": 244,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 244
                },
                "tagName": {
                  "type": "constant",
                  "value": "li"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "LINK": {
          "type": "function",
          "refID": 246,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 246
                },
                "tagName": {
                  "type": "constant",
                  "value": "link"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "MAIN": {
          "type": "function",
          "refID": 248,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 248
                },
                "tagName": {
                  "type": "constant",
                  "value": "main"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "MAP": {
          "type": "function",
          "refID": 250,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 250
                },
                "tagName": {
                  "type": "constant",
                  "value": "map"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "MARK": {
          "type": "function",
          "refID": 252,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 252
                },
                "tagName": {
                  "type": "constant",
                  "value": "mark"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "MENU": {
          "type": "function",
          "refID": 254,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 254
                },
                "tagName": {
                  "type": "constant",
                  "value": "menu"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "META": {
          "type": "function",
          "refID": 256,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 256
                },
                "tagName": {
                  "type": "constant",
                  "value": "meta"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "METER": {
          "type": "function",
          "refID": 258,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 258
                },
                "tagName": {
                  "type": "constant",
                  "value": "meter"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "NAV": {
          "type": "function",
          "refID": 260,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 260
                },
                "tagName": {
                  "type": "constant",
                  "value": "nav"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "NOFRAMES": {
          "type": "function",
          "refID": 262,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 262
                },
                "tagName": {
                  "type": "constant",
                  "value": "noframes"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "NOSCRIPT": {
          "type": "function",
          "refID": 264,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 264
                },
                "tagName": {
                  "type": "constant",
                  "value": "noscript"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "OBJECT": {
          "type": "function",
          "refID": 266,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 266
                },
                "tagName": {
                  "type": "constant",
                  "value": "object"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "OL": {
          "type": "function",
          "refID": 268,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 268
                },
                "tagName": {
                  "type": "constant",
                  "value": "ol"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "OPTGROUP": {
          "type": "function",
          "refID": 270,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 270
                },
                "tagName": {
                  "type": "constant",
                  "value": "optgroup"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "OPTION": {
          "type": "function",
          "refID": 272,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 272
                },
                "tagName": {
                  "type": "constant",
                  "value": "option"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "OUTPUT": {
          "type": "function",
          "refID": 274,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 274
                },
                "tagName": {
                  "type": "constant",
                  "value": "output"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "P": {
          "type": "function",
          "refID": 276,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 276
                },
                "tagName": {
                  "type": "constant",
                  "value": "p"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "PARAM": {
          "type": "function",
          "refID": 278,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 278
                },
                "tagName": {
                  "type": "constant",
                  "value": "param"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "PRE": {
          "type": "function",
          "refID": 280,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 280
                },
                "tagName": {
                  "type": "constant",
                  "value": "pre"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "PROGRESS": {
          "type": "function",
          "refID": 282,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 282
                },
                "tagName": {
                  "type": "constant",
                  "value": "progress"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "Q": {
          "type": "function",
          "refID": 284,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 284
                },
                "tagName": {
                  "type": "constant",
                  "value": "q"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "RP": {
          "type": "function",
          "refID": 286,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 286
                },
                "tagName": {
                  "type": "constant",
                  "value": "rp"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "RT": {
          "type": "function",
          "refID": 288,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 288
                },
                "tagName": {
                  "type": "constant",
                  "value": "rt"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "RUBY": {
          "type": "function",
          "refID": 290,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 290
                },
                "tagName": {
                  "type": "constant",
                  "value": "ruby"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "S": {
          "type": "function",
          "refID": 292,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 292
                },
                "tagName": {
                  "type": "constant",
                  "value": "s"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SAMP": {
          "type": "function",
          "refID": 294,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 294
                },
                "tagName": {
                  "type": "constant",
                  "value": "samp"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SCRIPT": {
          "type": "function",
          "refID": 296,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 296
                },
                "tagName": {
                  "type": "constant",
                  "value": "script"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SECTION": {
          "type": "function",
          "refID": 298,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 298
                },
                "tagName": {
                  "type": "constant",
                  "value": "section"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SELECT": {
          "type": "function",
          "refID": 300,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 300
                },
                "tagName": {
                  "type": "constant",
                  "value": "select"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SMALL": {
          "type": "function",
          "refID": 302,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 302
                },
                "tagName": {
                  "type": "constant",
                  "value": "small"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SOURCE": {
          "type": "function",
          "refID": 304,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 304
                },
                "tagName": {
                  "type": "constant",
                  "value": "source"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SPAN": {
          "type": "function",
          "refID": 306,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 306
                },
                "tagName": {
                  "type": "constant",
                  "value": "span"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "STRIKE": {
          "type": "function",
          "refID": 308,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 308
                },
                "tagName": {
                  "type": "constant",
                  "value": "strike"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "STRONG": {
          "type": "function",
          "refID": 310,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 310
                },
                "tagName": {
                  "type": "constant",
                  "value": "strong"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "STYLE": {
          "type": "function",
          "refID": 312,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 312
                },
                "tagName": {
                  "type": "constant",
                  "value": "style"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SUB": {
          "type": "function",
          "refID": 314,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 314
                },
                "tagName": {
                  "type": "constant",
                  "value": "sub"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SUMMARY": {
          "type": "function",
          "refID": 316,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 316
                },
                "tagName": {
                  "type": "constant",
                  "value": "summary"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SUP": {
          "type": "function",
          "refID": 318,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 318
                },
                "tagName": {
                  "type": "constant",
                  "value": "sup"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TABLE": {
          "type": "function",
          "refID": 320,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 320
                },
                "tagName": {
                  "type": "constant",
                  "value": "table"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TBODY": {
          "type": "function",
          "refID": 322,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 322
                },
                "tagName": {
                  "type": "constant",
                  "value": "tbody"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TD": {
          "type": "function",
          "refID": 324,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 324
                },
                "tagName": {
                  "type": "constant",
                  "value": "td"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TEXTAREA": {
          "type": "function",
          "refID": 326,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 326
                },
                "tagName": {
                  "type": "constant",
                  "value": "textarea"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TFOOT": {
          "type": "function",
          "refID": 328,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 328
                },
                "tagName": {
                  "type": "constant",
                  "value": "tfoot"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TH": {
          "type": "function",
          "refID": 330,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 330
                },
                "tagName": {
                  "type": "constant",
                  "value": "th"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "THEAD": {
          "type": "function",
          "refID": 332,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 332
                },
                "tagName": {
                  "type": "constant",
                  "value": "thead"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TIME": {
          "type": "function",
          "refID": 334,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 334
                },
                "tagName": {
                  "type": "constant",
                  "value": "time"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TITLE": {
          "type": "function",
          "refID": 336,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 336
                },
                "tagName": {
                  "type": "constant",
                  "value": "title"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TR": {
          "type": "function",
          "refID": 338,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 338
                },
                "tagName": {
                  "type": "constant",
                  "value": "tr"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TRACK": {
          "type": "function",
          "refID": 340,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 340
                },
                "tagName": {
                  "type": "constant",
                  "value": "track"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TT": {
          "type": "function",
          "refID": 342,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 342
                },
                "tagName": {
                  "type": "constant",
                  "value": "tt"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "U": {
          "type": "function",
          "refID": 344,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 344
                },
                "tagName": {
                  "type": "constant",
                  "value": "u"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "UL": {
          "type": "function",
          "refID": 346,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 346
                },
                "tagName": {
                  "type": "constant",
                  "value": "ul"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "VAR": {
          "type": "function",
          "refID": 348,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 348
                },
                "tagName": {
                  "type": "constant",
                  "value": "var"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "VIDEO": {
          "type": "function",
          "refID": 350,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 350
                },
                "tagName": {
                  "type": "constant",
                  "value": "video"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "WBR": {
          "type": "function",
          "refID": 352,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 352
                },
                "tagName": {
                  "type": "constant",
                  "value": "wbr"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ALTGLYPH": {
          "type": "function",
          "refID": 354,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 354
                },
                "tagName": {
                  "type": "constant",
                  "value": "altGlyph"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ALTGLYPHDEF": {
          "type": "function",
          "refID": 356,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 356
                },
                "tagName": {
                  "type": "constant",
                  "value": "altGlyphDef"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ALTGLYPHITEM": {
          "type": "function",
          "refID": 358,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 358
                },
                "tagName": {
                  "type": "constant",
                  "value": "altGlyphItem"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ANIMATE": {
          "type": "function",
          "refID": 360,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 360
                },
                "tagName": {
                  "type": "constant",
                  "value": "animate"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ANIMATECOLOR": {
          "type": "function",
          "refID": 362,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 362
                },
                "tagName": {
                  "type": "constant",
                  "value": "animateColor"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ANIMATEMOTION": {
          "type": "function",
          "refID": 364,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 364
                },
                "tagName": {
                  "type": "constant",
                  "value": "animateMotion"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ANIMATETRANSFORM": {
          "type": "function",
          "refID": 366,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 366
                },
                "tagName": {
                  "type": "constant",
                  "value": "animateTransform"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CIRCLE": {
          "type": "function",
          "refID": 368,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 368
                },
                "tagName": {
                  "type": "constant",
                  "value": "circle"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CLIPPATH": {
          "type": "function",
          "refID": 370,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 370
                },
                "tagName": {
                  "type": "constant",
                  "value": "clipPath"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "COLOR_PROFILE": {
          "type": "function",
          "refID": 372,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 372
                },
                "tagName": {
                  "type": "constant",
                  "value": "color-profile"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CURSOR": {
          "type": "function",
          "refID": 374,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 374
                },
                "tagName": {
                  "type": "constant",
                  "value": "cursor"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DEFS": {
          "type": "function",
          "refID": 376,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 376
                },
                "tagName": {
                  "type": "constant",
                  "value": "defs"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "DESC": {
          "type": "function",
          "refID": 378,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 378
                },
                "tagName": {
                  "type": "constant",
                  "value": "desc"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "ELLIPSE": {
          "type": "function",
          "refID": 380,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 380
                },
                "tagName": {
                  "type": "constant",
                  "value": "ellipse"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEBLEND": {
          "type": "function",
          "refID": 382,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 382
                },
                "tagName": {
                  "type": "constant",
                  "value": "feBlend"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FECOLORMATRIX": {
          "type": "function",
          "refID": 384,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 384
                },
                "tagName": {
                  "type": "constant",
                  "value": "feColorMatrix"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FECOMPONENTTRANSFER": {
          "type": "function",
          "refID": 386,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 386
                },
                "tagName": {
                  "type": "constant",
                  "value": "feComponentTransfer"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FECOMPOSITE": {
          "type": "function",
          "refID": 388,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 388
                },
                "tagName": {
                  "type": "constant",
                  "value": "feComposite"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FECONVOLVEMATRIX": {
          "type": "function",
          "refID": 390,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 390
                },
                "tagName": {
                  "type": "constant",
                  "value": "feConvolveMatrix"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEDIFFUSELIGHTING": {
          "type": "function",
          "refID": 392,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 392
                },
                "tagName": {
                  "type": "constant",
                  "value": "feDiffuseLighting"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEDISPLACEMENTMAP": {
          "type": "function",
          "refID": 394,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 394
                },
                "tagName": {
                  "type": "constant",
                  "value": "feDisplacementMap"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEDISTANTLIGHT": {
          "type": "function",
          "refID": 396,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 396
                },
                "tagName": {
                  "type": "constant",
                  "value": "feDistantLight"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEFLOOD": {
          "type": "function",
          "refID": 398,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 398
                },
                "tagName": {
                  "type": "constant",
                  "value": "feFlood"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEFUNCA": {
          "type": "function",
          "refID": 400,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 400
                },
                "tagName": {
                  "type": "constant",
                  "value": "feFuncA"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEFUNCB": {
          "type": "function",
          "refID": 402,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 402
                },
                "tagName": {
                  "type": "constant",
                  "value": "feFuncB"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEFUNCG": {
          "type": "function",
          "refID": 404,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 404
                },
                "tagName": {
                  "type": "constant",
                  "value": "feFuncG"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEFUNCR": {
          "type": "function",
          "refID": 406,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 406
                },
                "tagName": {
                  "type": "constant",
                  "value": "feFuncR"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEGAUSSIANBLUR": {
          "type": "function",
          "refID": 408,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 408
                },
                "tagName": {
                  "type": "constant",
                  "value": "feGaussianBlur"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEIMAGE": {
          "type": "function",
          "refID": 410,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 410
                },
                "tagName": {
                  "type": "constant",
                  "value": "feImage"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEMERGE": {
          "type": "function",
          "refID": 412,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 412
                },
                "tagName": {
                  "type": "constant",
                  "value": "feMerge"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEMERGENODE": {
          "type": "function",
          "refID": 414,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 414
                },
                "tagName": {
                  "type": "constant",
                  "value": "feMergeNode"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEMORPHOLOGY": {
          "type": "function",
          "refID": 416,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 416
                },
                "tagName": {
                  "type": "constant",
                  "value": "feMorphology"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEOFFSET": {
          "type": "function",
          "refID": 418,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 418
                },
                "tagName": {
                  "type": "constant",
                  "value": "feOffset"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FEPOINTLIGHT": {
          "type": "function",
          "refID": 420,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 420
                },
                "tagName": {
                  "type": "constant",
                  "value": "fePointLight"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FESPECULARLIGHTING": {
          "type": "function",
          "refID": 422,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 422
                },
                "tagName": {
                  "type": "constant",
                  "value": "feSpecularLighting"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FESPOTLIGHT": {
          "type": "function",
          "refID": 424,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 424
                },
                "tagName": {
                  "type": "constant",
                  "value": "feSpotLight"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FETILE": {
          "type": "function",
          "refID": 426,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 426
                },
                "tagName": {
                  "type": "constant",
                  "value": "feTile"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FETURBULENCE": {
          "type": "function",
          "refID": 428,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 428
                },
                "tagName": {
                  "type": "constant",
                  "value": "feTurbulence"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FILTER": {
          "type": "function",
          "refID": 430,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 430
                },
                "tagName": {
                  "type": "constant",
                  "value": "filter"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FONT_FACE": {
          "type": "function",
          "refID": 432,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 432
                },
                "tagName": {
                  "type": "constant",
                  "value": "font-face"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FONT_FACE_FORMAT": {
          "type": "function",
          "refID": 434,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 434
                },
                "tagName": {
                  "type": "constant",
                  "value": "font-face-format"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FONT_FACE_NAME": {
          "type": "function",
          "refID": 436,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 436
                },
                "tagName": {
                  "type": "constant",
                  "value": "font-face-name"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FONT_FACE_SRC": {
          "type": "function",
          "refID": 438,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 438
                },
                "tagName": {
                  "type": "constant",
                  "value": "font-face-src"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FONT_FACE_URI": {
          "type": "function",
          "refID": 440,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 440
                },
                "tagName": {
                  "type": "constant",
                  "value": "font-face-uri"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "FOREIGNOBJECT": {
          "type": "function",
          "refID": 442,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 442
                },
                "tagName": {
                  "type": "constant",
                  "value": "foreignObject"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "G": {
          "type": "function",
          "refID": 444,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 444
                },
                "tagName": {
                  "type": "constant",
                  "value": "g"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "GLYPH": {
          "type": "function",
          "refID": 446,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 446
                },
                "tagName": {
                  "type": "constant",
                  "value": "glyph"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "GLYPHREF": {
          "type": "function",
          "refID": 448,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 448
                },
                "tagName": {
                  "type": "constant",
                  "value": "glyphRef"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "HKERN": {
          "type": "function",
          "refID": 450,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 450
                },
                "tagName": {
                  "type": "constant",
                  "value": "hkern"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "IMAGE": {
          "type": "function",
          "refID": 452,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 452
                },
                "tagName": {
                  "type": "constant",
                  "value": "image"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "LINE": {
          "type": "function",
          "refID": 454,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 454
                },
                "tagName": {
                  "type": "constant",
                  "value": "line"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "LINEARGRADIENT": {
          "type": "function",
          "refID": 456,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 456
                },
                "tagName": {
                  "type": "constant",
                  "value": "linearGradient"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "MARKER": {
          "type": "function",
          "refID": 458,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 458
                },
                "tagName": {
                  "type": "constant",
                  "value": "marker"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "MASK": {
          "type": "function",
          "refID": 460,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 460
                },
                "tagName": {
                  "type": "constant",
                  "value": "mask"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "METADATA": {
          "type": "function",
          "refID": 462,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 462
                },
                "tagName": {
                  "type": "constant",
                  "value": "metadata"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "MISSING_GLYPH": {
          "type": "function",
          "refID": 464,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 464
                },
                "tagName": {
                  "type": "constant",
                  "value": "missing-glyph"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "PATH": {
          "type": "function",
          "refID": 466,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 466
                },
                "tagName": {
                  "type": "constant",
                  "value": "path"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "PATTERN": {
          "type": "function",
          "refID": 468,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 468
                },
                "tagName": {
                  "type": "constant",
                  "value": "pattern"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "POLYGON": {
          "type": "function",
          "refID": 470,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 470
                },
                "tagName": {
                  "type": "constant",
                  "value": "polygon"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "POLYLINE": {
          "type": "function",
          "refID": 472,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 472
                },
                "tagName": {
                  "type": "constant",
                  "value": "polyline"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "RADIALGRADIENT": {
          "type": "function",
          "refID": 474,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 474
                },
                "tagName": {
                  "type": "constant",
                  "value": "radialGradient"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "RECT": {
          "type": "function",
          "refID": 476,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 476
                },
                "tagName": {
                  "type": "constant",
                  "value": "rect"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SET": {
          "type": "function",
          "refID": 478,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 478
                },
                "tagName": {
                  "type": "constant",
                  "value": "set"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "STOP": {
          "type": "function",
          "refID": 480,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 480
                },
                "tagName": {
                  "type": "constant",
                  "value": "stop"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SVG": {
          "type": "function",
          "refID": 482,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 482
                },
                "tagName": {
                  "type": "constant",
                  "value": "svg"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SWITCH": {
          "type": "function",
          "refID": 484,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 484
                },
                "tagName": {
                  "type": "constant",
                  "value": "switch"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "SYMBOL": {
          "type": "function",
          "refID": 486,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 486
                },
                "tagName": {
                  "type": "constant",
                  "value": "symbol"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TEXT": {
          "type": "function",
          "refID": 488,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 488
                },
                "tagName": {
                  "type": "constant",
                  "value": "text"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TEXTPATH": {
          "type": "function",
          "refID": 490,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 490
                },
                "tagName": {
                  "type": "constant",
                  "value": "textPath"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TREF": {
          "type": "function",
          "refID": 492,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 492
                },
                "tagName": {
                  "type": "constant",
                  "value": "tref"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "TSPAN": {
          "type": "function",
          "refID": 494,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 494
                },
                "tagName": {
                  "type": "constant",
                  "value": "tspan"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "USE": {
          "type": "function",
          "refID": 496,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 496
                },
                "tagName": {
                  "type": "constant",
                  "value": "use"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "VIEW": {
          "type": "function",
          "refID": 498,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 498
                },
                "tagName": {
                  "type": "constant",
                  "value": "view"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "VKERN": {
          "type": "function",
          "refID": 500,
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 500
                },
                "tagName": {
                  "type": "constant",
                  "value": "vkern"
                },
                "children": {
                  "ref": 84
                },
                "htmljsType": {
                  "ref": 82
                }
              }
            }
          }
        },
        "CharRef": {
          "type": "function",
          "members": {
            "htmljsType": {
              "type": "array",
              "refID": 503
            },
            "prototype": {
              "type": "object",
              "members": {
                "htmljsType": {
                  "ref": 503
                }
              }
            }
          }
        },
        "Comment": {
          "type": "function",
          "members": {
            "htmljsType": {
              "type": "array",
              "refID": 506
            },
            "prototype": {
              "type": "object",
              "members": {
                "htmljsType": {
                  "ref": 506
                }
              }
            }
          }
        },
        "Raw": {
          "type": "function",
          "members": {
            "htmljsType": {
              "type": "array",
              "refID": 509
            },
            "prototype": {
              "type": "object",
              "members": {
                "htmljsType": {
                  "ref": 509
                }
              }
            }
          }
        },
        "isArray": {
          "type": "function"
        },
        "isConstructedObject": {
          "type": "function"
        },
        "isNully": {
          "type": "function"
        },
        "isValidAttributeName": {
          "type": "function"
        },
        "flattenAttributes": {
          "type": "function"
        },
        "toHTML": {
          "type": "function"
        },
        "TEXTMODE": {
          "type": "object",
          "members": {
            "STRING": {
              "type": "constant",
              "value": 1
            },
            "RCDATA": {
              "type": "constant",
              "value": 2
            },
            "ATTRIBUTE": {
              "type": "constant",
              "value": 3
            }
          }
        },
        "toText": {
          "type": "function"
        }
      }
    }
  },
  "html-tools": {
    "HTMLTools": {
      "type": "object",
      "members": {
        "Parse": {
          "type": "object",
          "members": {
            "getCharacterReference": {
              "type": "function"
            },
            "getComment": {
              "type": "function"
            },
            "getDoctype": {
              "type": "function"
            },
            "getHTMLToken": {
              "type": "function"
            },
            "getTagToken": {
              "type": "function"
            },
            "getContent": {
              "type": "function"
            },
            "getRCData": {
              "type": "function"
            }
          }
        },
        "asciiLowerCase": {
          "type": "function"
        },
        "properCaseTagName": {
          "type": "function"
        },
        "properCaseAttributeName": {
          "type": "function"
        },
        "Scanner": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "rest": {
                  "type": "function"
                },
                "isEOF": {
                  "type": "function"
                },
                "fatal": {
                  "type": "function"
                },
                "peek": {
                  "type": "function"
                }
              }
            }
          }
        },
        "TEMPLATE_TAG_POSITION": {
          "type": "object",
          "members": {
            "ELEMENT": {
              "type": "constant",
              "value": 1
            },
            "IN_START_TAG": {
              "type": "constant",
              "value": 2
            },
            "IN_ATTRIBUTE": {
              "type": "constant",
              "value": 3
            },
            "IN_RCDATA": {
              "type": "constant",
              "value": 4
            },
            "IN_RAWTEXT": {
              "type": "constant",
              "value": 5
            }
          }
        },
        "TemplateTag": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "constructorName": {
                  "type": "constant",
                  "value": "HTMLTools.TemplateTag"
                },
                "toJS": {
                  "type": "function"
                }
              }
            }
          }
        },
        "parseFragment": {
          "type": "function"
        },
        "codePointToString": {
          "type": "function"
        }
      }
    }
  },
  "blaze-tools": {
    "BlazeTools": {
      "type": "object",
      "members": {
        "parseNumber": {
          "type": "function"
        },
        "parseIdentifierName": {
          "type": "function"
        },
        "parseStringLiteral": {
          "type": "function"
        },
        "EmitCode": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "toJS": {
                  "type": "function"
                }
              }
            }
          }
        },
        "toJSLiteral": {
          "type": "function"
        },
        "toObjectLiteralKey": {
          "type": "function"
        },
        "ToJSVisitor": {
          "type": "function",
          "members": {
            "extend": {
              "type": "function"
            },
            "def": {
              "type": "function"
            },
            "prototype": {
              "type": "object",
              "members": {
                "visitNull": {
                  "type": "function"
                },
                "visitPrimitive": {
                  "type": "function"
                },
                "visitArray": {
                  "type": "function"
                },
                "visitTag": {
                  "type": "function"
                },
                "visitComment": {
                  "type": "function"
                },
                "visitCharRef": {
                  "type": "function"
                },
                "visitRaw": {
                  "type": "function"
                },
                "visitObject": {
                  "type": "function"
                },
                "generateCall": {
                  "type": "function"
                },
                "generateAttrsDictionary": {
                  "type": "function"
                },
                "visit": {
                  "type": "function"
                },
                "visitFunction": {
                  "type": "function"
                }
              }
            }
          }
        },
        "toJS": {
          "type": "function"
        }
      }
    }
  },
  "spacebars-compiler": {
    "SpacebarsCompiler": {
      "type": "object",
      "members": {
        "TemplateTag": {
          "type": "function",
          "members": {
            "parse": {
              "type": "function"
            },
            "peek": {
              "type": "function"
            },
            "parseCompleteTag": {
              "type": "function"
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructorName": {
                  "type": "constant",
                  "value": "SpacebarsCompiler.TemplateTag"
                },
                "toJS": {
                  "type": "function"
                }
              }
            }
          }
        },
        "optimize": {
          "type": "function"
        },
        "CodeGen": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "codeGenTemplateTag": {
                  "type": "function"
                },
                "codeGenPath": {
                  "type": "function"
                },
                "codeGenArgValue": {
                  "type": "function"
                },
                "codeGenMustache": {
                  "type": "function"
                },
                "codeGenMustacheArgs": {
                  "type": "function"
                },
                "codeGenBlock": {
                  "type": "function"
                },
                "codeGenInclusionDataFunc": {
                  "type": "function"
                }
              }
            }
          }
        },
        "isReservedName": {
          "type": "function"
        },
        "parse": {
          "type": "function"
        },
        "compile": {
          "type": "function"
        },
        "codeGen": {
          "type": "function"
        }
      }
    }
  },
  "jquery": {},
  "id-map": {
    "IdMap": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "get": {
              "type": "function"
            },
            "set": {
              "type": "function"
            },
            "remove": {
              "type": "function"
            },
            "has": {
              "type": "function"
            },
            "empty": {
              "type": "function"
            },
            "clear": {
              "type": "function"
            },
            "forEach": {
              "type": "function"
            },
            "size": {
              "type": "function"
            },
            "setDefault": {
              "type": "function"
            },
            "clone": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "ordered-dict": {
    "OrderedDict": {
      "type": "function",
      "members": {
        "BREAK": {
          "type": "object"
        },
        "prototype": {
          "type": "object",
          "members": {
            "empty": {
              "type": "function"
            },
            "size": {
              "type": "function"
            },
            "putBefore": {
              "type": "function"
            },
            "append": {
              "type": "function"
            },
            "remove": {
              "type": "function"
            },
            "get": {
              "type": "function"
            },
            "has": {
              "type": "function"
            },
            "forEach": {
              "type": "function"
            },
            "first": {
              "type": "function"
            },
            "firstValue": {
              "type": "function"
            },
            "last": {
              "type": "function"
            },
            "lastValue": {
              "type": "function"
            },
            "prev": {
              "type": "function"
            },
            "next": {
              "type": "function"
            },
            "moveBefore": {
              "type": "function"
            },
            "indexOf": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "random": {
    "Random": {
      "type": "object",
      "members": {
        "createWithSeeds": {
          "type": "function"
        },
        "fraction": {
          "type": "function"
        },
        "hexString": {
          "type": "function"
        },
        "id": {
          "type": "function"
        },
        "secret": {
          "type": "function"
        },
        "choice": {
          "type": "function"
        }
      }
    }
  },
  "geojson-utils": {
    "GeoJSON": {
      "type": "object",
      "members": {
        "lineStringsIntersect": {
          "type": "function"
        },
        "pointInBoundingBox": {
          "type": "function"
        },
        "pointInPolygon": {
          "type": "function"
        },
        "numberToRadius": {
          "type": "function"
        },
        "numberToDegree": {
          "type": "function"
        },
        "drawCircle": {
          "type": "function"
        },
        "rectangleCentroid": {
          "type": "function"
        },
        "pointDistance": {
          "type": "function"
        },
        "geometryWithinRadius": {
          "type": "function"
        },
        "area": {
          "type": "function"
        },
        "centroid": {
          "type": "function"
        },
        "simplify": {
          "type": "function"
        },
        "destinationPoint": {
          "type": "function"
        }
      }
    }
  },
  "minimongo": {
    "LocalCollection": {
      "type": "function",
      "members": {
        "Cursor": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "rewind": {
                  "type": "function"
                },
                "forEach": {
                  "type": "function"
                },
                "getTransform": {
                  "type": "function"
                },
                "map": {
                  "type": "function"
                },
                "fetch": {
                  "type": "function"
                },
                "count": {
                  "type": "function"
                },
                "observe": {
                  "type": "function"
                },
                "observeChanges": {
                  "type": "function"
                }
              }
            }
          }
        },
        "ObserveHandle": {
          "type": "function"
        },
        "wrapTransform": {
          "type": "function"
        },
        "prototype": {
          "type": "object",
          "members": {
            "find": {
              "type": "function"
            },
            "findOne": {
              "type": "function"
            },
            "insert": {
              "type": "function"
            },
            "remove": {
              "type": "function"
            },
            "update": {
              "type": "function"
            },
            "upsert": {
              "type": "function"
            },
            "saveOriginals": {
              "type": "function"
            },
            "retrieveOriginals": {
              "type": "function"
            },
            "pauseObservers": {
              "type": "function"
            },
            "resumeObservers": {
              "type": "function"
            }
          }
        }
      }
    },
    "Minimongo": {
      "type": "object",
      "members": {
        "Matcher": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "documentMatches": {
                  "type": "function"
                },
                "hasGeoQuery": {
                  "type": "function"
                },
                "hasWhere": {
                  "type": "function"
                },
                "isSimple": {
                  "type": "function"
                },
                "combineIntoProjection": {
                  "type": "function"
                },
                "affectedByModifier": {
                  "type": "function"
                },
                "canBecomeTrueByModifier": {
                  "type": "function"
                },
                "matchingDocument": {
                  "type": "function"
                }
              }
            }
          }
        },
        "Sorter": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "getComparator": {
                  "type": "function"
                },
                "affectedByModifier": {
                  "type": "function"
                },
                "combineIntoProjection": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    },
    "MinimongoTest": {
      "type": "object",
      "members": {
        "makeLookupFunction": {
          "type": "function"
        }
      }
    }
  },
  "observe-sequence": {
    "ObserveSequence": {
      "type": "object",
      "members": {
        "observe": {
          "type": "function"
        },
        "fetch": {
          "type": "function"
        }
      }
    }
  },
  "reactive-var": {
    "ReactiveVar": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "get": {
              "type": "function"
            },
            "set": {
              "type": "function"
            },
            "toString": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "blaze": {
    "Blaze": {
      "type": "object",
      "members": {
        "View": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onViewCreated": {
                  "type": "function"
                },
                "onViewReady": {
                  "type": "function"
                },
                "onViewDestroyed": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "firstNode": {
                  "type": "function"
                },
                "lastNode": {
                  "type": "function"
                },
                "lookup": {
                  "type": "function"
                },
                "lookupTemplate": {
                  "type": "function"
                }
              }
            }
          }
        },
        "currentView": {
          "type": "null",
          "value": null
        },
        "render": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "renderWithData": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "toHTML": {
          "type": "function"
        },
        "toHTMLWithData": {
          "type": "function"
        },
        "getData": {
          "type": "function",
          "refID": 33
        },
        "getElementData": {
          "type": "function"
        },
        "getView": {
          "type": "function"
        },
        "With": {
          "type": "function"
        },
        "If": {
          "type": "function"
        },
        "Unless": {
          "type": "function"
        },
        "Each": {
          "type": "function"
        },
        "InOuterTemplateScope": {
          "type": "function"
        },
        "registerHelper": {
          "type": "function",
          "refID": 49
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 33
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 49
            },
            "prototype": {
              "type": "object",
              "members": {
                "onCreated": {
                  "type": "function"
                },
                "onRendered": {
                  "type": "function"
                },
                "onDestroyed": {
                  "type": "function"
                },
                "constructView": {
                  "type": "function"
                },
                "helpers": {
                  "type": "function"
                },
                "events": {
                  "type": "function"
                }
              }
            }
          }
        },
        "isTemplate": {
          "type": "function"
        },
        "TemplateInstance": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "$": {
                  "type": "function"
                },
                "findAll": {
                  "type": "function"
                },
                "find": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "subscriptionsReady": {
                  "type": "function"
                }
              }
            }
          }
        },
        "ReactiveVar": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "get": {
                  "type": "function"
                },
                "set": {
                  "type": "function"
                },
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    },
    "UI": {
      "type": "object",
      "members": {
        "View": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onViewCreated": {
                  "type": "function"
                },
                "onViewReady": {
                  "type": "function"
                },
                "onViewDestroyed": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "firstNode": {
                  "type": "function"
                },
                "lastNode": {
                  "type": "function"
                },
                "lookup": {
                  "type": "function"
                },
                "lookupTemplate": {
                  "type": "function"
                }
              }
            }
          }
        },
        "currentView": {
          "type": "null",
          "value": null
        },
        "render": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "renderWithData": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "toHTML": {
          "type": "function"
        },
        "toHTMLWithData": {
          "type": "function"
        },
        "getData": {
          "type": "function",
          "refID": 33
        },
        "getElementData": {
          "type": "function"
        },
        "getView": {
          "type": "function"
        },
        "With": {
          "type": "function"
        },
        "If": {
          "type": "function"
        },
        "Unless": {
          "type": "function"
        },
        "Each": {
          "type": "function"
        },
        "InOuterTemplateScope": {
          "type": "function"
        },
        "registerHelper": {
          "type": "function",
          "refID": 49
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 33
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 49
            },
            "prototype": {
              "type": "object",
              "members": {
                "onCreated": {
                  "type": "function"
                },
                "onRendered": {
                  "type": "function"
                },
                "onDestroyed": {
                  "type": "function"
                },
                "constructView": {
                  "type": "function"
                },
                "helpers": {
                  "type": "function"
                },
                "events": {
                  "type": "function"
                }
              }
            }
          }
        },
        "isTemplate": {
          "type": "function"
        },
        "TemplateInstance": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "$": {
                  "type": "function"
                },
                "findAll": {
                  "type": "function"
                },
                "find": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "subscriptionsReady": {
                  "type": "function"
                }
              }
            }
          }
        },
        "ReactiveVar": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "get": {
                  "type": "function"
                },
                "set": {
                  "type": "function"
                },
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    },
    "Handlebars": {
      "type": "object",
      "members": {
        "registerHelper": {
          "type": "function"
        },
        "SafeString": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    }
  },
  "templating": {},
  "spacebars": {
    "Spacebars": {
      "type": "object",
      "members": {
        "include": {
          "type": "function"
        },
        "mustacheImpl": {
          "type": "function"
        },
        "mustache": {
          "type": "function"
        },
        "attrMustache": {
          "type": "function"
        },
        "dataMustache": {
          "type": "function"
        },
        "makeRaw": {
          "type": "function"
        },
        "call": {
          "type": "function"
        },
        "kw": {
          "type": "function"
        },
        "SafeString": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        },
        "dot": {
          "type": "function"
        },
        "With": {
          "type": "function"
        },
        "TemplateWith": {
          "type": "function"
        }
      }
    }
  },
  "ui": {
    "Blaze": {
      "type": "object",
      "members": {
        "View": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onViewCreated": {
                  "type": "function"
                },
                "onViewReady": {
                  "type": "function"
                },
                "onViewDestroyed": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "firstNode": {
                  "type": "function"
                },
                "lastNode": {
                  "type": "function"
                },
                "lookup": {
                  "type": "function"
                },
                "lookupTemplate": {
                  "type": "function"
                }
              }
            }
          }
        },
        "currentView": {
          "type": "null",
          "value": null
        },
        "render": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "renderWithData": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "toHTML": {
          "type": "function"
        },
        "toHTMLWithData": {
          "type": "function"
        },
        "getData": {
          "type": "function",
          "refID": 33
        },
        "getElementData": {
          "type": "function"
        },
        "getView": {
          "type": "function"
        },
        "With": {
          "type": "function"
        },
        "If": {
          "type": "function"
        },
        "Unless": {
          "type": "function"
        },
        "Each": {
          "type": "function"
        },
        "InOuterTemplateScope": {
          "type": "function"
        },
        "registerHelper": {
          "type": "function",
          "refID": 49
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 33
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 49
            },
            "prototype": {
              "type": "object",
              "members": {
                "onCreated": {
                  "type": "function"
                },
                "onRendered": {
                  "type": "function"
                },
                "onDestroyed": {
                  "type": "function"
                },
                "constructView": {
                  "type": "function"
                },
                "helpers": {
                  "type": "function"
                },
                "events": {
                  "type": "function"
                }
              }
            }
          }
        },
        "isTemplate": {
          "type": "function"
        },
        "TemplateInstance": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "$": {
                  "type": "function"
                },
                "findAll": {
                  "type": "function"
                },
                "find": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "subscriptionsReady": {
                  "type": "function"
                }
              }
            }
          }
        },
        "ReactiveVar": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "get": {
                  "type": "function"
                },
                "set": {
                  "type": "function"
                },
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    },
    "UI": {
      "type": "object",
      "members": {
        "View": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "onViewCreated": {
                  "type": "function"
                },
                "onViewReady": {
                  "type": "function"
                },
                "onViewDestroyed": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "firstNode": {
                  "type": "function"
                },
                "lastNode": {
                  "type": "function"
                },
                "lookup": {
                  "type": "function"
                },
                "lookupTemplate": {
                  "type": "function"
                }
              }
            }
          }
        },
        "currentView": {
          "type": "null",
          "value": null
        },
        "render": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "renderWithData": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "toHTML": {
          "type": "function"
        },
        "toHTMLWithData": {
          "type": "function"
        },
        "getData": {
          "type": "function",
          "refID": 33
        },
        "getElementData": {
          "type": "function"
        },
        "getView": {
          "type": "function"
        },
        "With": {
          "type": "function"
        },
        "If": {
          "type": "function"
        },
        "Unless": {
          "type": "function"
        },
        "Each": {
          "type": "function"
        },
        "InOuterTemplateScope": {
          "type": "function"
        },
        "registerHelper": {
          "type": "function",
          "refID": 49
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 33
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 49
            },
            "prototype": {
              "type": "object",
              "members": {
                "onCreated": {
                  "type": "function"
                },
                "onRendered": {
                  "type": "function"
                },
                "onDestroyed": {
                  "type": "function"
                },
                "constructView": {
                  "type": "function"
                },
                "helpers": {
                  "type": "function"
                },
                "events": {
                  "type": "function"
                }
              }
            }
          }
        },
        "isTemplate": {
          "type": "function"
        },
        "TemplateInstance": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "$": {
                  "type": "function"
                },
                "findAll": {
                  "type": "function"
                },
                "find": {
                  "type": "function"
                },
                "autorun": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "subscriptionsReady": {
                  "type": "function"
                }
              }
            }
          }
        },
        "ReactiveVar": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "get": {
                  "type": "function"
                },
                "set": {
                  "type": "function"
                },
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    },
    "Handlebars": {
      "type": "object",
      "members": {
        "registerHelper": {
          "type": "function"
        },
        "SafeString": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    }
  },
  "boilerplate-generator": {
    "Boilerplate": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "toHTML": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "webapp-hashing": {
    "WebAppHashing": {
      "type": "object",
      "members": {
        "calculateClientHash": {
          "type": "function"
        }
      }
    }
  },
  "webapp": {
    "WebApp": {
      "type": "object",
      "members": {
        "defaultArch": {
          "type": "constant",
          "value": "web.browser"
        },
        "clientPrograms": {
          "type": "object",
          "members": {
            "web.browser": {
              "type": "object",
              "members": {
                "manifest": {
                  "type": "array"
                },
                "version": {
                  "type": "constant",
                  "value": "63a2574e36bb38dcdd7d221651b84cfe199dec6d"
                },
                "PUBLIC_SETTINGS": {
                  "type": "undefined"
                }
              }
            }
          }
        },
        "categorizeRequest": {
          "type": "function"
        },
        "addHtmlAttributeHook": {
          "type": "function"
        },
        "connectHandlers": {
          "type": "function",
          "members": {
            "use": {
              "type": "function",
              "refID": 9
            },
            "handle": {
              "type": "function",
              "refID": 11
            },
            "listen": {
              "type": "function",
              "refID": 13
            },
            "setMaxListeners": {
              "type": "function",
              "refID": 15
            },
            "emit": {
              "type": "function",
              "refID": 17
            },
            "addListener": {
              "type": "function",
              "refID": 19
            },
            "on": {
              "ref": 19
            },
            "once": {
              "type": "function",
              "refID": 21
            },
            "removeListener": {
              "type": "function",
              "refID": 23
            },
            "removeAllListeners": {
              "type": "function",
              "refID": 25
            },
            "listeners": {
              "type": "function",
              "refID": 27
            },
            "route": {
              "type": "constant",
              "value": "/"
            },
            "stack": {
              "type": "array"
            }
          }
        },
        "rawConnectHandlers": {
          "type": "function",
          "members": {
            "use": {
              "ref": 9
            },
            "handle": {
              "ref": 11
            },
            "listen": {
              "ref": 13
            },
            "setMaxListeners": {
              "ref": 15
            },
            "emit": {
              "ref": 17
            },
            "addListener": {
              "ref": 19
            },
            "on": {
              "ref": 19
            },
            "once": {
              "ref": 21
            },
            "removeListener": {
              "ref": 23
            },
            "removeAllListeners": {
              "ref": 25
            },
            "listeners": {
              "ref": 27
            },
            "route": {
              "type": "constant",
              "value": "/"
            },
            "stack": {
              "type": "array"
            }
          }
        },
        "httpServer": {
          "type": "object",
          "members": {
            "domain": {
              "type": "null",
              "value": null
            },
            "connections": {
              "type": "constant",
              "value": 1
            },
            "timeout": {
              "type": "constant",
              "value": 5000
            },
            "setTimeout": {
              "type": "function"
            },
            "listen": {
              "type": "function"
            },
            "address": {
              "type": "function"
            },
            "getConnections": {
              "type": "function"
            },
            "close": {
              "type": "function"
            },
            "listenFD": {
              "type": "function"
            },
            "ref": {
              "type": "function"
            },
            "unref": {
              "type": "function"
            },
            "setMaxListeners": {
              "ref": 15
            },
            "emit": {
              "ref": 17
            },
            "addListener": {
              "ref": 19
            },
            "on": {
              "ref": 19
            },
            "once": {
              "ref": 21
            },
            "removeListener": {
              "ref": 23
            },
            "removeAllListeners": {
              "ref": 25
            },
            "listeners": {
              "ref": 27
            }
          }
        },
        "suppressConnectErrors": {
          "type": "function"
        },
        "onListening": {
          "type": "function"
        },
        "clientHash": {
          "type": "function"
        },
        "calculateClientHashRefreshable": {
          "type": "function"
        },
        "calculateClientHashNonRefreshable": {
          "type": "function"
        },
        "calculateClientHashCordova": {
          "type": "function"
        }
      }
    },
    "main": {
      "type": "function"
    }
  },
  "iron:core": {
    "Iron": {
      "type": "object",
      "members": {
        "utils": {
          "type": "object",
          "members": {
            "assert": {
              "type": "function"
            },
            "warn": {
              "type": "function"
            },
            "defaultValue": {
              "type": "function"
            },
            "inherits": {
              "type": "function"
            },
            "extend": {
              "type": "function"
            },
            "namespace": {
              "type": "function"
            },
            "resolve": {
              "type": "function"
            },
            "capitalize": {
              "type": "function"
            },
            "classCase": {
              "type": "function"
            },
            "camelCase": {
              "type": "function"
            },
            "notifyDeprecated": {
              "type": "function"
            },
            "withDeprecatedNotice": {
              "type": "function"
            },
            "debug": {
              "type": "function"
            },
            "get": {
              "type": "function"
            }
          }
        },
        "DynamicTemplate": {
          "type": "function",
          "members": {
            "getParentDataContext": {
              "type": "function",
              "refID": 31
            },
            "getDataContext": {
              "type": "function",
              "refID": 33
            },
            "getInclusionArguments": {
              "type": "function",
              "refID": 35
            },
            "args": {
              "type": "function",
              "refID": 37
            },
            "extend": {
              "type": "function",
              "refID": 39
            },
            "findFirstLookupHost": {
              "type": "function",
              "refID": 41
            },
            "findLookupHostWithProperty": {
              "type": "function",
              "refID": 43
            },
            "findLookupHostWithHelper": {
              "type": "function",
              "refID": 45
            },
            "prototype": {
              "type": "object",
              "members": {
                "template": {
                  "type": "function",
                  "refID": 48
                },
                "defaultTemplate": {
                  "type": "function",
                  "refID": 50
                },
                "clear": {
                  "type": "function"
                },
                "data": {
                  "type": "function",
                  "refID": 54
                },
                "create": {
                  "type": "function",
                  "refID": 56
                },
                "renderView": {
                  "type": "function",
                  "refID": 58
                },
                "destroy": {
                  "type": "function",
                  "refID": 60
                },
                "onViewCreated": {
                  "type": "function",
                  "refID": 62
                },
                "onViewReady": {
                  "type": "function",
                  "refID": 64
                },
                "onViewDestroyed": {
                  "type": "function",
                  "refID": 66
                },
                "events": {
                  "type": "function",
                  "refID": 68
                },
                "insert": {
                  "type": "function",
                  "refID": 70
                }
              }
            }
          }
        },
        "Layout": {
          "type": "function",
          "refID": 72,
          "members": {
            "DEFAULT_REGION": {
              "type": "constant",
              "value": "main"
            },
            "getParentDataContext": {
              "ref": 31
            },
            "getDataContext": {
              "ref": 33
            },
            "getInclusionArguments": {
              "ref": 35
            },
            "args": {
              "ref": 37
            },
            "extend": {
              "ref": 39
            },
            "findFirstLookupHost": {
              "ref": 41
            },
            "findLookupHostWithProperty": {
              "ref": 43
            },
            "findLookupHostWithHelper": {
              "ref": 45
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 72
                },
                "region": {
                  "type": "function"
                },
                "destroyRegions": {
                  "type": "function"
                },
                "render": {
                  "type": "function"
                },
                "has": {
                  "type": "function"
                },
                "regionKeys": {
                  "type": "function"
                },
                "clear": {
                  "type": "function"
                },
                "clearAll": {
                  "type": "function"
                },
                "beginRendering": {
                  "type": "function"
                },
                "onRegionCreated": {
                  "type": "function"
                },
                "onRegionRendered": {
                  "type": "function"
                },
                "onRegionDestroyed": {
                  "type": "function"
                },
                "template": {
                  "ref": 48
                },
                "defaultTemplate": {
                  "ref": 50
                },
                "data": {
                  "ref": 54
                },
                "create": {
                  "ref": 56
                },
                "renderView": {
                  "ref": 58
                },
                "destroy": {
                  "ref": 60
                },
                "onViewCreated": {
                  "ref": 62
                },
                "onViewReady": {
                  "ref": 64
                },
                "onViewDestroyed": {
                  "ref": 66
                },
                "events": {
                  "ref": 68
                },
                "insert": {
                  "ref": 70
                }
              }
            }
          }
        },
        "Url": {
          "type": "function",
          "members": {
            "normalize": {
              "type": "function"
            },
            "isSameOrigin": {
              "type": "function"
            },
            "fromQueryString": {
              "type": "function"
            },
            "toQueryString": {
              "type": "function"
            },
            "parse": {
              "type": "function"
            },
            "prototype": {
              "type": "object",
              "members": {
                "test": {
                  "type": "function"
                },
                "exec": {
                  "type": "function"
                },
                "params": {
                  "type": "function"
                },
                "resolve": {
                  "type": "function"
                }
              }
            }
          }
        },
        "MiddlewareStack": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "findByName": {
                  "type": "function"
                },
                "push": {
                  "type": "function"
                },
                "append": {
                  "type": "function"
                },
                "insertAt": {
                  "type": "function"
                },
                "insertBefore": {
                  "type": "function"
                },
                "insertAfter": {
                  "type": "function"
                },
                "concat": {
                  "type": "function"
                },
                "dispatch": {
                  "type": "function"
                }
              }
            }
          }
        },
        "Controller": {
          "type": "function",
          "members": {
            "extend": {
              "type": "function",
              "refID": 135
            },
            "events": {
              "type": "function",
              "refID": 137
            },
            "helpers": {
              "type": "function",
              "refID": 139
            },
            "prototype": {
              "type": "object",
              "members": {
                "layout": {
                  "type": "function",
                  "refID": 142
                },
                "render": {
                  "type": "function",
                  "refID": 144
                },
                "beginRendering": {
                  "type": "function",
                  "refID": 146
                },
                "init": {
                  "type": "function"
                },
                "wait": {
                  "type": "function",
                  "refID": 150
                },
                "ready": {
                  "type": "function",
                  "refID": 152
                }
              }
            }
          }
        },
        "RouteController": {
          "type": "function",
          "members": {
            "extend": {
              "ref": 135
            },
            "events": {
              "ref": 137
            },
            "helpers": {
              "ref": 139
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "type": "function"
                },
                "lookupOption": {
                  "type": "function"
                },
                "configureFromUrl": {
                  "type": "function"
                },
                "runHooks": {
                  "type": "function"
                },
                "getParams": {
                  "type": "function"
                },
                "setParams": {
                  "type": "function"
                },
                "init": {
                  "type": "function"
                },
                "dispatch": {
                  "type": "function"
                },
                "layout": {
                  "ref": 142
                },
                "render": {
                  "ref": 144
                },
                "beginRendering": {
                  "ref": 146
                },
                "wait": {
                  "ref": 150
                },
                "ready": {
                  "ref": 152
                }
              }
            }
          }
        },
        "Route": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "getName": {
                  "type": "function"
                },
                "findControllerConstructor": {
                  "type": "function"
                },
                "createController": {
                  "type": "function"
                },
                "setControllerParams": {
                  "type": "function"
                },
                "dispatch": {
                  "type": "function"
                },
                "path": {
                  "type": "function"
                },
                "url": {
                  "type": "function"
                },
                "params": {
                  "type": "function"
                },
                "get": {
                  "type": "function"
                },
                "post": {
                  "type": "function"
                },
                "put": {
                  "type": "function"
                },
                "delete": {
                  "type": "function"
                }
              }
            }
          }
        },
        "Router": {
          "type": "function",
          "members": {
            "HOOK_TYPES": {
              "type": "array"
            },
            "hooks": {
              "type": "object",
              "members": {
                "loading": {
                  "type": "function"
                },
                "dataNotFound": {
                  "type": "function"
                }
              }
            },
            "plugins": {
              "type": "object",
              "members": {
                "loading": {
                  "type": "function"
                },
                "dataNotFound": {
                  "type": "function"
                }
              }
            },
            "bodyParser": {
              "type": "function",
              "members": {
                "json": {
                  "type": "function"
                },
                "raw": {
                  "type": "function"
                },
                "text": {
                  "type": "function"
                },
                "urlencoded": {
                  "type": "function"
                }
              }
            },
            "prototype": {
              "type": "object",
              "members": {
                "init": {
                  "type": "function"
                },
                "configure": {
                  "type": "function"
                },
                "map": {
                  "type": "function"
                },
                "route": {
                  "type": "function"
                },
                "findFirstRoute": {
                  "type": "function"
                },
                "path": {
                  "type": "function"
                },
                "url": {
                  "type": "function"
                },
                "createController": {
                  "type": "function"
                },
                "setTemplateNameConverter": {
                  "type": "function"
                },
                "setControllerNameConverter": {
                  "type": "function"
                },
                "toTemplateName": {
                  "type": "function"
                },
                "toControllerName": {
                  "type": "function"
                },
                "addHook": {
                  "type": "function"
                },
                "lookupHook": {
                  "type": "function"
                },
                "getHooks": {
                  "type": "function"
                },
                "onRun": {
                  "type": "function"
                },
                "onRerun": {
                  "type": "function"
                },
                "onBeforeAction": {
                  "type": "function"
                },
                "onAfterAction": {
                  "type": "function"
                },
                "onStop": {
                  "type": "function"
                },
                "waitOn": {
                  "type": "function"
                },
                "subscriptions": {
                  "type": "function"
                },
                "load": {
                  "type": "function"
                },
                "before": {
                  "type": "function"
                },
                "after": {
                  "type": "function"
                },
                "unload": {
                  "type": "function"
                },
                "plugin": {
                  "type": "function"
                },
                "configureBodyParsers": {
                  "type": "function"
                },
                "start": {
                  "type": "function"
                },
                "dispatch": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    }
  },
  "iron:dynamic-template": {},
  "iron:layout": {},
  "iron:url": {},
  "iron:middleware-stack": {
    "Handler": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "test": {
              "type": "function"
            },
            "params": {
              "type": "function"
            },
            "resolve": {
              "type": "function"
            },
            "clone": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "iron:location": {},
  "check": {
    "check": {
      "type": "function"
    },
    "Match": {
      "type": "object",
      "members": {
        "Optional": {
          "type": "function"
        },
        "OneOf": {
          "type": "function"
        },
        "Any": {
          "type": "array"
        },
        "Where": {
          "type": "function"
        },
        "ObjectIncluding": {
          "type": "function"
        },
        "ObjectWithValues": {
          "type": "function"
        },
        "Integer": {
          "type": "array"
        },
        "Error": {
          "type": "function",
          "refID": 13,
          "members": {
            "captureStackTrace": {
              "type": "function"
            },
            "stackTraceLimit": {
              "type": "constant",
              "value": 10
            },
            "prepareStackTrace": {
              "type": "function"
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 13
                }
              }
            }
          }
        },
        "test": {
          "type": "function"
        }
      }
    }
  },
  "retry": {
    "Retry": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "clear": {
              "type": "function"
            },
            "retryLater": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "callback-hook": {
    "Hook": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "register": {
              "type": "function"
            },
            "each": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "ddp": {
    "DDP": {
      "type": "object",
      "members": {
        "ConnectionError": {
          "type": "function",
          "refID": 1,
          "members": {
            "captureStackTrace": {
              "type": "function",
              "refID": 2
            },
            "stackTraceLimit": {
              "type": "constant",
              "value": 10
            },
            "prepareStackTrace": {
              "type": "function",
              "refID": 4
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 1
                }
              }
            }
          }
        },
        "ForcedReconnectError": {
          "type": "function",
          "refID": 7,
          "members": {
            "captureStackTrace": {
              "ref": 2
            },
            "stackTraceLimit": {
              "type": "constant",
              "value": 10
            },
            "prepareStackTrace": {
              "ref": 4
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 7
                }
              }
            }
          }
        },
        "randomStream": {
          "type": "function"
        },
        "connect": {
          "type": "function"
        }
      }
    },
    "DDPServer": {
      "type": "object"
    },
    "LivedataTest": {
      "type": "object",
      "members": {
        "ClientStream": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "send": {
                  "type": "function"
                },
                "on": {
                  "type": "function"
                },
                "reconnect": {
                  "type": "function"
                },
                "disconnect": {
                  "type": "function"
                },
                "status": {
                  "type": "function"
                }
              }
            }
          }
        },
        "toSockjsUrl": {
          "type": "function"
        },
        "SessionCollectionView": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "isEmpty": {
                  "type": "function"
                },
                "diff": {
                  "type": "function"
                },
                "diffDocument": {
                  "type": "function"
                },
                "added": {
                  "type": "function"
                },
                "changed": {
                  "type": "function"
                },
                "removed": {
                  "type": "function"
                }
              }
            }
          }
        },
        "calculateVersion": {
          "type": "function"
        },
        "SUPPORTED_DDP_VERSIONS": {
          "type": "array"
        },
        "Connection": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "registerStore": {
                  "type": "function"
                },
                "subscribe": {
                  "type": "function"
                },
                "methods": {
                  "type": "function"
                },
                "call": {
                  "type": "function"
                },
                "apply": {
                  "type": "function"
                },
                "status": {
                  "type": "function"
                },
                "reconnect": {
                  "type": "function"
                },
                "disconnect": {
                  "type": "function"
                },
                "close": {
                  "type": "function"
                },
                "userId": {
                  "type": "function"
                },
                "setUserId": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    }
  },
  "binary-heap": {
    "MaxHeap": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "get": {
              "type": "function"
            },
            "set": {
              "type": "function"
            },
            "remove": {
              "type": "function"
            },
            "has": {
              "type": "function"
            },
            "empty": {
              "type": "function"
            },
            "clear": {
              "type": "function"
            },
            "forEach": {
              "type": "function"
            },
            "size": {
              "type": "function"
            },
            "setDefault": {
              "type": "function"
            },
            "clone": {
              "type": "function"
            },
            "maxElementId": {
              "type": "function"
            }
          }
        }
      }
    },
    "MinHeap": {
      "type": "function",
      "refID": 0,
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "constructor": {
              "ref": 0
            },
            "maxElementId": {
              "type": "function"
            },
            "minElementId": {
              "type": "function"
            },
            "get": {
              "type": "function"
            },
            "set": {
              "type": "function"
            },
            "remove": {
              "type": "function"
            },
            "has": {
              "type": "function"
            },
            "empty": {
              "type": "function"
            },
            "clear": {
              "type": "function"
            },
            "forEach": {
              "type": "function"
            },
            "size": {
              "type": "function"
            },
            "setDefault": {
              "type": "function"
            },
            "clone": {
              "type": "function"
            }
          }
        }
      }
    },
    "MinMaxHeap": {
      "type": "function",
      "refID": 0,
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "constructor": {
              "ref": 0
            },
            "set": {
              "type": "function"
            },
            "remove": {
              "type": "function"
            },
            "clear": {
              "type": "function"
            },
            "setDefault": {
              "type": "function"
            },
            "clone": {
              "type": "function"
            },
            "minElementId": {
              "type": "function"
            },
            "get": {
              "type": "function"
            },
            "has": {
              "type": "function"
            },
            "empty": {
              "type": "function"
            },
            "forEach": {
              "type": "function"
            },
            "size": {
              "type": "function"
            },
            "maxElementId": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "mongo": {
    "MongoTest": {
      "type": "object",
      "members": {
        "DocFetcher": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "fetch": {
                  "type": "function"
                }
              }
            }
          }
        }
      }
    },
    "Mongo": {
      "type": "object",
      "members": {
        "Collection": {
          "type": "function",
          "members": {
            "Cursor": {
              "type": "function",
              "refID": 2,
              "members": {
                "prototype": {
                  "type": "object",
                  "members": {
                    "rewind": {
                      "type": "function"
                    },
                    "forEach": {
                      "type": "function"
                    },
                    "getTransform": {
                      "type": "function"
                    },
                    "map": {
                      "type": "function"
                    },
                    "fetch": {
                      "type": "function"
                    },
                    "count": {
                      "type": "function"
                    },
                    "observe": {
                      "type": "function"
                    },
                    "observeChanges": {
                      "type": "function"
                    }
                  }
                }
              }
            },
            "ObjectID": {
              "type": "function",
              "refID": 20,
              "members": {
                "prototype": {
                  "type": "object",
                  "members": {
                    "toString": {
                      "type": "function"
                    },
                    "equals": {
                      "type": "function"
                    },
                    "clone": {
                      "type": "function"
                    },
                    "typeName": {
                      "type": "function"
                    },
                    "getTimestamp": {
                      "type": "function"
                    },
                    "toHexString": {
                      "type": "function",
                      "refID": 32
                    },
                    "toJSONValue": {
                      "ref": 32
                    },
                    "valueOf": {
                      "ref": 32
                    }
                  }
                }
              }
            },
            "prototype": {
              "type": "object",
              "members": {
                "find": {
                  "type": "function"
                },
                "findOne": {
                  "type": "function"
                },
                "insert": {
                  "type": "function"
                },
                "update": {
                  "type": "function"
                },
                "remove": {
                  "type": "function"
                },
                "upsert": {
                  "type": "function"
                },
                "rawCollection": {
                  "type": "function"
                },
                "rawDatabase": {
                  "type": "function"
                },
                "allow": {
                  "type": "function"
                },
                "deny": {
                  "type": "function"
                }
              }
            }
          }
        },
        "ObjectID": {
          "ref": 20
        },
        "Cursor": {
          "ref": 2
        }
      }
    }
  },
  "reactive-dict": {
    "ReactiveDict": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "set": {
              "type": "function"
            },
            "setDefault": {
              "type": "function"
            },
            "get": {
              "type": "function"
            },
            "equals": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "iron:controller": {},
  "iron:router": {
    "Router": {
      "type": "function",
      "members": {
        "routes": {
          "type": "array"
        },
        "options": {
          "type": "object",
          "members": {
            "layoutTemplate": {
              "type": "constant",
              "value": "layout"
            }
          }
        },
        "init": {
          "type": "function"
        },
        "configure": {
          "type": "function"
        },
        "map": {
          "type": "function"
        },
        "route": {
          "type": "function"
        },
        "findFirstRoute": {
          "type": "function"
        },
        "path": {
          "type": "function"
        },
        "url": {
          "type": "function"
        },
        "createController": {
          "type": "function"
        },
        "setTemplateNameConverter": {
          "type": "function"
        },
        "setControllerNameConverter": {
          "type": "function"
        },
        "toTemplateName": {
          "type": "function"
        },
        "toControllerName": {
          "type": "function"
        },
        "addHook": {
          "type": "function"
        },
        "lookupHook": {
          "type": "function"
        },
        "getHooks": {
          "type": "function"
        },
        "onRun": {
          "type": "function"
        },
        "onRerun": {
          "type": "function"
        },
        "onBeforeAction": {
          "type": "function"
        },
        "onAfterAction": {
          "type": "function"
        },
        "onStop": {
          "type": "function"
        },
        "waitOn": {
          "type": "function"
        },
        "subscriptions": {
          "type": "function"
        },
        "load": {
          "type": "function"
        },
        "before": {
          "type": "function"
        },
        "after": {
          "type": "function"
        },
        "unload": {
          "type": "function"
        },
        "plugin": {
          "type": "function"
        },
        "configureBodyParsers": {
          "type": "function"
        },
        "start": {
          "type": "function"
        },
        "dispatch": {
          "type": "function"
        }
      }
    },
    "RouteController": {
      "type": "function",
      "members": {
        "extend": {
          "type": "function"
        },
        "events": {
          "type": "function"
        },
        "helpers": {
          "type": "function"
        },
        "prototype": {
          "type": "object",
          "members": {
            "constructor": {
              "type": "function"
            },
            "lookupOption": {
              "type": "function"
            },
            "configureFromUrl": {
              "type": "function"
            },
            "runHooks": {
              "type": "function"
            },
            "getParams": {
              "type": "function"
            },
            "setParams": {
              "type": "function"
            },
            "init": {
              "type": "function"
            },
            "dispatch": {
              "type": "function"
            },
            "layout": {
              "type": "function"
            },
            "render": {
              "type": "function"
            },
            "beginRendering": {
              "type": "function"
            },
            "wait": {
              "type": "function"
            },
            "ready": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "less": {},
  "cfs:http-methods": {
    "HTTP": {
      "type": "object",
      "members": {
        "methodsMaxDataLength": {
          "type": "constant",
          "value": 5242880
        },
        "methods": {
          "type": "function"
        }
      }
    },
    "_methodHTTP": {
      "type": "object",
      "members": {
        "methodHandlers": {
          "type": "object"
        },
        "methodTree": {
          "type": "object"
        },
        "nameFollowsConventions": {
          "type": "function"
        },
        "getNameList": {
          "type": "function"
        },
        "createObject": {
          "type": "function"
        },
        "addToMethodTree": {
          "type": "function"
        },
        "getMethod": {
          "type": "function"
        },
        "getUserId": {
          "type": "function"
        },
        "defaultOptionsHandler": {
          "type": "function"
        }
      }
    }
  },
  "tap:i18n": {
    "TAPi18next": {
      "type": "object",
      "members": {
        "init": {
          "type": "function"
        },
        "setLng": {
          "type": "function"
        },
        "preload": {
          "type": "function"
        },
        "addResourceBundle": {
          "type": "function"
        },
        "removeResourceBundle": {
          "type": "function"
        },
        "loadNamespace": {
          "type": "function"
        },
        "loadNamespaces": {
          "type": "function"
        },
        "setDefaultNamespace": {
          "type": "function"
        },
        "t": {
          "type": "function",
          "refID": 17
        },
        "translate": {
          "ref": 17
        },
        "exists": {
          "type": "function"
        },
        "detectLanguage": {
          "type": "function",
          "refID": 21
        },
        "pluralExtensions": {
          "type": "object",
          "members": {
            "rules": {
              "type": "object",
              "members": {
                "ach": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Acholi"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "af": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Afrikaans"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ak": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Akan"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "am": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Amharic"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "an": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Aragonese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ar": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Arabic"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "arn": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Mapudungun"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ast": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Asturian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ay": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Aymará"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "az": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Azerbaijani"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "be": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Belarusian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "bg": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Bulgarian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "bn": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Bengali"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "bo": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Tibetan"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "br": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Breton"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "bs": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Bosnian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ca": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Catalan"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "cgg": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Chiga"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "cs": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Czech"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "csb": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Kashubian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "cy": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Welsh"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "da": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Danish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "de": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "German"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "dz": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Dzongkha"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "el": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Greek"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "en": {
                  "type": "object",
                  "refID": 125,
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "English"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "eo": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Esperanto"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "es": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Spanish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "es_ar": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Argentinean Spanish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "et": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Estonian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "eu": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Basque"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "fa": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Persian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "fi": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Finnish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "fil": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Filipino"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "fo": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Faroese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "fr": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "French"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "fur": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Friulian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "fy": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Frisian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ga": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Irish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "gd": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Scottish Gaelic"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "gl": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Galician"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "gu": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Gujarati"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "gun": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Gun"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ha": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Hausa"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "he": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Hebrew"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "hi": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Hindi"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "hr": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Croatian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "hu": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Hungarian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "hy": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Armenian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ia": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Interlingua"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "id": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Indonesian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "is": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Icelandic"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "it": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Italian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ja": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Japanese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "jbo": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Lojban"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "jv": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Javanese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ka": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Georgian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "kk": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Kazakh"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "km": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Khmer"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "kn": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Kannada"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ko": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Korean"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ku": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Kurdish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "kw": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Cornish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ky": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Kyrgyz"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "lb": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Letzeburgesch"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ln": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Lingala"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "lo": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Lao"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "lt": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Lithuanian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "lv": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Latvian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mai": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Maithili"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mfe": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Mauritian Creole"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mg": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Malagasy"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mi": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Maori"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mk": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Macedonian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ml": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Malayalam"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mn": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Mongolian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mnk": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Mandinka"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mr": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Marathi"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ms": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Malay"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "mt": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Maltese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "nah": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Nahuatl"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "nap": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Neapolitan"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "nb": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Norwegian Bokmal"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ne": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Nepali"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "nl": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Dutch"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "nn": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Norwegian Nynorsk"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "no": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Norwegian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "nso": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Northern Sotho"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "oc": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Occitan"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "or": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Oriya"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "pa": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Punjabi"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "pap": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Papiamento"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "pl": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Polish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "pms": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Piemontese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ps": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Pashto"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "pt": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Portuguese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "pt_br": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Brazilian Portuguese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "rm": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Romansh"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ro": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Romanian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ru": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Russian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sah": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Yakut"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sco": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Scots"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "se": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Northern Sami"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "si": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Sinhala"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sk": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Slovak"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sl": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Slovenian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "so": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Somali"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "son": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Songhay"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sq": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Albanian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sr": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Serbian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "su": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Sundanese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sv": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Swedish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "sw": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Swahili"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ta": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Tamil"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "te": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Telugu"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "tg": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Tajik"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "th": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Thai"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ti": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Tigrinya"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "tk": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Turkmen"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "tr": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Turkish"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "tt": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Tatar"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ug": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Uyghur"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "uk": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Ukrainian"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "ur": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Urdu"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "uz": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Uzbek"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "vi": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Vietnamese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "wa": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Walloon"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "wo": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Wolof"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "yo": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Yoruba"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                },
                "zh": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "Chinese"
                    },
                    "numbers": {
                      "type": "array"
                    },
                    "plurals": {
                      "type": "function"
                    }
                  }
                }
              }
            },
            "addRule": {
              "type": "function"
            },
            "setCurrentLng": {
              "type": "function"
            },
            "get": {
              "type": "function"
            },
            "currentRule": {
              "type": "object",
              "members": {
                "lng": {
                  "type": "constant",
                  "value": "en"
                },
                "rule": {
                  "ref": 125
                }
              }
            }
          }
        },
        "sync": {
          "type": "object",
          "members": {
            "load": {
              "type": "function"
            },
            "postMissing": {
              "type": "function"
            }
          }
        },
        "functions": {
          "type": "object",
          "members": {
            "extend": {
              "type": "function"
            },
            "each": {
              "type": "function"
            },
            "ajax": {
              "type": "function"
            },
            "cookie": {
              "type": "object",
              "members": {
                "create": {
                  "type": "function"
                },
                "read": {
                  "type": "function"
                },
                "remove": {
                  "type": "function"
                }
              }
            },
            "detectLanguage": {
              "ref": 21
            },
            "escape": {
              "type": "function"
            },
            "log": {
              "type": "function"
            },
            "toLanguages": {
              "type": "function"
            },
            "regexEscape": {
              "type": "function"
            },
            "applyReplacement": {
              "type": "function"
            }
          }
        },
        "lng": {
          "type": "function"
        },
        "addPostProcessor": {
          "type": "function"
        },
        "options": {
          "type": "object",
          "members": {
            "lng": {
              "type": "constant",
              "value": "en"
            },
            "load": {
              "type": "constant",
              "value": "all"
            },
            "preload": {
              "type": "array"
            },
            "fallbackLng": {
              "type": "array"
            },
            "fallbackNS": {
              "type": "array"
            },
            "detectLngQS": {
              "type": "constant",
              "value": "setLng"
            },
            "ns": {
              "type": "object",
              "members": {
                "namespaces": {
                  "type": "array"
                },
                "defaultNs": {
                  "type": "constant",
                  "value": "translation"
                }
              }
            },
            "nsseparator": {
              "type": "constant",
              "value": ":"
            },
            "keyseparator": {
              "type": "constant",
              "value": "."
            },
            "selectorAttr": {
              "type": "constant",
              "value": "data-i18n"
            },
            "resGetPath": {
              "type": "constant",
              "value": "locales/__lng__/__ns__.json"
            },
            "resPostPath": {
              "type": "constant",
              "value": "locales/add/__lng__/__ns__"
            },
            "resStore": {
              "type": "object",
              "members": {
                "en": {
                  "type": "object",
                  "members": {
                    "francocatena-status": {
                      "type": "object",
                      "members": {
                        "meteor_status_connected": {
                          "type": "constant",
                          "value": "Connected"
                        },
                        "meteor_status_connecting": {
                          "type": "constant",
                          "value": "Connecting..."
                        },
                        "meteor_status_failed": {
                          "type": "constant",
                          "value": "The server connection failed"
                        },
                        "meteor_status_waiting": {
                          "type": "constant",
                          "value": "Waiting for server connection,"
                        },
                        "meteor_status_offline": {
                          "type": "constant",
                          "value": "Offline mode."
                        },
                        "meteor_status_reconnect_in": {
                          "type": "constant",
                          "value": "trying again in one second..."
                        },
                        "meteor_status_reconnect_in_plural": {
                          "type": "constant",
                          "value": "trying again in __count__ seconds..."
                        },
                        "meteor_status_try_now_waiting": {
                          "type": "constant",
                          "value": "Try now"
                        },
                        "meteor_status_try_now_offline": {
                          "type": "constant",
                          "value": "Connect again"
                        }
                      }
                    }
                  }
                }
              }
            },
            "localStorageExpirationTime": {
              "type": "constant",
              "value": 604800000
            },
            "sendMissingTo": {
              "type": "constant",
              "value": "fallback"
            },
            "sendType": {
              "type": "constant",
              "value": "POST"
            },
            "interpolationPrefix": {
              "type": "constant",
              "value": "__"
            },
            "interpolationSuffix": {
              "type": "constant",
              "value": "__"
            },
            "reusePrefix": {
              "type": "constant",
              "value": "$t("
            },
            "reuseSuffix": {
              "type": "constant",
              "value": ")"
            },
            "pluralSuffix": {
              "type": "constant",
              "value": "_plural"
            },
            "pluralNotFound": {
              "type": "constant",
              "value": "plural_not_found0.6526684209238738"
            },
            "contextNotFound": {
              "type": "constant",
              "value": "context_not_found0.9560485866386443"
            },
            "cookieExpirationTime": {
              "type": "undefined"
            },
            "cookieName": {
              "type": "constant",
              "value": "TAPi18next"
            },
            "cookieDomain": {
              "type": "undefined"
            },
            "objectTreeKeyHandler": {
              "type": "undefined"
            },
            "postProcess": {
              "type": "array"
            },
            "parseMissingKey": {
              "type": "undefined"
            },
            "shortcutFunction": {
              "type": "constant",
              "value": "sprintf"
            },
            "interpolationPrefixEscaped": {
              "type": "constant",
              "value": "__"
            },
            "interpolationSuffixEscaped": {
              "type": "constant",
              "value": "__"
            }
          }
        }
      }
    },
    "TAPi18n": {
      "type": "object",
      "members": {
        "conf": {
          "type": "null",
          "value": null
        },
        "packages": {
          "type": "object",
          "members": {
            "francocatena:status": {
              "type": "object",
              "members": {
                "translation_function_name": {
                  "type": "constant",
                  "value": "i18n_status_func"
                },
                "helper_name": {
                  "type": "constant",
                  "value": "i18n_status_helper"
                },
                "namespace": {
                  "type": "constant",
                  "value": "francocatena:status"
                }
              }
            }
          }
        },
        "languages_names": {
          "type": "object"
        },
        "translations": {
          "type": "object",
          "members": {
            "es": {
              "type": "object",
              "members": {
                "francocatena:status": {
                  "type": "object",
                  "members": {
                    "meteor_status_connected": {
                      "type": "constant",
                      "value": "Conectado"
                    },
                    "meteor_status_connecting": {
                      "type": "constant",
                      "value": "Conectando..."
                    },
                    "meteor_status_failed": {
                      "type": "constant",
                      "value": "La conexión con el servidor falló"
                    },
                    "meteor_status_waiting": {
                      "type": "constant",
                      "value": "Desconectado,"
                    },
                    "meteor_status_offline": {
                      "type": "constant",
                      "value": "Modo fuera de línea."
                    },
                    "meteor_status_reconnect_in": {
                      "type": "constant",
                      "value": "reintentando automáticamente en un segundo..."
                    },
                    "meteor_status_reconnect_in_plural": {
                      "type": "constant",
                      "value": "reintentando automáticamente en __count__ segundos..."
                    },
                    "meteor_status_try_now_waiting": {
                      "type": "constant",
                      "value": "Intentar ahora"
                    },
                    "meteor_status_try_now_offline": {
                      "type": "constant",
                      "value": "Conectar de nuevo"
                    }
                  }
                }
              }
            },
            "fr": {
              "type": "object",
              "members": {
                "francocatena:status": {
                  "type": "object",
                  "members": {
                    "meteor_status_connected": {
                      "type": "constant",
                      "value": "Connecté"
                    },
                    "meteor_status_connecting": {
                      "type": "constant",
                      "value": "Connexion en cours"
                    },
                    "meteor_status_failed": {
                      "type": "constant",
                      "value": "La connexion au serveur a échoué"
                    },
                    "meteor_status_waiting": {
                      "type": "constant",
                      "value": "En attente de connexion au serveur"
                    },
                    "meteor_status_offline": {
                      "type": "constant",
                      "value": "Mode hors-connexion"
                    },
                    "meteor_status_reconnect_in": {
                      "type": "constant",
                      "value": "Réessayer dans quelques secondes"
                    },
                    "meteor_status_reconnect_in_plural": {
                      "type": "constant",
                      "value": "Réessayé dans __count__ secondes..."
                    },
                    "meteor_status_try_now_waiting": {
                      "type": "constant",
                      "value": "Réessayer"
                    },
                    "meteor_status_try_now_offline": {
                      "type": "constant",
                      "value": "Reconnexion"
                    }
                  }
                }
              }
            },
            "it": {
              "type": "object",
              "members": {
                "francocatena:status": {
                  "type": "object",
                  "members": {
                    "meteor_status_connected": {
                      "type": "constant",
                      "value": "Connesso"
                    },
                    "meteor_status_connecting": {
                      "type": "constant",
                      "value": "Connessione in corso..."
                    },
                    "meteor_status_failed": {
                      "type": "constant",
                      "value": "Impossibile connettersi al server"
                    },
                    "meteor_status_waiting": {
                      "type": "constant",
                      "value": "Server non disponibile,"
                    },
                    "meteor_status_offline": {
                      "type": "constant",
                      "value": "Modalità non in linea."
                    },
                    "meteor_status_reconnect_in": {
                      "type": "constant",
                      "value": "riprovo tra pochi secondi..."
                    },
                    "meteor_status_reconnect_in_plural": {
                      "type": "constant",
                      "value": "riprovo tra __count__ secondi..."
                    },
                    "meteor_status_try_now_waiting": {
                      "type": "constant",
                      "value": "Connetti ora"
                    },
                    "meteor_status_try_now_offline": {
                      "type": "constant",
                      "value": "Riprova"
                    }
                  }
                }
              }
            },
            "tr": {
              "type": "object",
              "members": {
                "francocatena:status": {
                  "type": "object",
                  "members": {
                    "meteor_status_connected": {
                      "type": "constant",
                      "value": "Bağlantı sağlandı..."
                    },
                    "meteor_status_connecting": {
                      "type": "constant",
                      "value": "Bağlanıyor..."
                    },
                    "meteor_status_failed": {
                      "type": "constant",
                      "value": "Sunucu ile bağlantı başarısız..."
                    },
                    "meteor_status_waiting": {
                      "type": "constant",
                      "value": "Sunucu bağlantısı bekleniyor...,"
                    },
                    "meteor_status_offline": {
                      "type": "constant",
                      "value": "Çevrimdışı mod."
                    },
                    "meteor_status_reconnect_in": {
                      "type": "constant",
                      "value": "tekrar deneniyor..."
                    },
                    "meteor_status_reconnect_in_plural": {
                      "type": "constant",
                      "value": "__count__ saniye içinde tekrar denenecek..."
                    },
                    "meteor_status_try_now_waiting": {
                      "type": "constant",
                      "value": "Şimdi tekrar dene!"
                    },
                    "meteor_status_try_now_offline": {
                      "type": "constant",
                      "value": "Tekrar bağlan!"
                    }
                  }
                }
              }
            },
            "de": {
              "type": "object",
              "members": {
                "francocatena:status": {
                  "type": "object",
                  "members": {
                    "meteor_status_connected": {
                      "type": "constant",
                      "value": "Verbunden"
                    },
                    "meteor_status_connecting": {
                      "type": "constant",
                      "value": "Verbinden..."
                    },
                    "meteor_status_failed": {
                      "type": "constant",
                      "value": "Die Verbindung zum Server wurde unterbrochen"
                    },
                    "meteor_status_waiting": {
                      "type": "constant",
                      "value": "Warte auf Verbindung zum Server,"
                    },
                    "meteor_status_offline": {
                      "type": "constant",
                      "value": "Offline Modus."
                    },
                    "meteor_status_reconnect_in": {
                      "type": "constant",
                      "value": "Versuche in einer Sekunde zu verbinden..."
                    },
                    "meteor_status_reconnect_in_plural": {
                      "type": "constant",
                      "value": "Versuche in __count__ Sekunden zu verbinden..."
                    },
                    "meteor_status_try_now_waiting": {
                      "type": "constant",
                      "value": "Jetzt versuchen"
                    },
                    "meteor_status_try_now_offline": {
                      "type": "constant",
                      "value": "Nochmal verbinden"
                    }
                  }
                }
              }
            },
            "pt": {
              "type": "object",
              "members": {
                "francocatena:status": {
                  "type": "object",
                  "members": {
                    "meteor_status_connected": {
                      "type": "constant",
                      "value": "Conectado"
                    },
                    "meteor_status_connecting": {
                      "type": "constant",
                      "value": "Conectando..."
                    },
                    "meteor_status_failed": {
                      "type": "constant",
                      "value": "A conexão com o servidor falhou"
                    },
                    "meteor_status_waiting": {
                      "type": "constant",
                      "value": "Aguardando pela conexão com o servidor,"
                    },
                    "meteor_status_offline": {
                      "type": "constant",
                      "value": "Modo offline."
                    },
                    "meteor_status_reconnect_in": {
                      "type": "constant",
                      "value": "tentando novamente em um segundo..."
                    },
                    "meteor_status_reconnect_in_plural": {
                      "type": "constant",
                      "value": "tentando novamente em __count__ segundos..."
                    },
                    "meteor_status_try_now_waiting": {
                      "type": "constant",
                      "value": "Tentar agora"
                    },
                    "meteor_status_try_now_offline": {
                      "type": "constant",
                      "value": "Conectar novamente"
                    }
                  }
                }
              }
            }
          }
        },
        "addResourceBundle": {
          "type": "function"
        },
        "getLanguages": {
          "type": "function"
        },
        "loadTranslations": {
          "type": "function"
        },
        "server_translators": {
          "type": "object",
          "members": {
            "en": {
              "type": "function",
              "members": {
                "lng": {
                  "type": "constant",
                  "value": "en"
                }
              }
            }
          }
        }
      }
    }
  },
  "francocatena:status": {},
  "mizzao:jquery-ui": {},
  "mrt:external-file-loader": {},
  "infinitedg:winston": {
    "Winston": {
      "type": "object",
      "members": {
        "version": {
          "type": "constant",
          "value": "0.7.3"
        },
        "transports": {
          "type": "object",
          "members": {
            "Console": {
              "type": "function",
              "members": {
                "super_": {
                  "type": "function",
                  "refID": 3,
                  "members": {
                    "super_": {
                      "type": "function",
                      "refID": 4,
                      "members": {
                        "listenerCount": {
                          "type": "function"
                        },
                        "prototype": {
                          "type": "object",
                          "members": {
                            "setMaxListeners": {
                              "type": "function",
                              "refID": 8
                            },
                            "emit": {
                              "type": "function",
                              "refID": 10
                            },
                            "addListener": {
                              "type": "function",
                              "refID": 12
                            },
                            "on": {
                              "ref": 12
                            },
                            "once": {
                              "type": "function",
                              "refID": 14
                            },
                            "removeListener": {
                              "type": "function",
                              "refID": 16
                            },
                            "removeAllListeners": {
                              "type": "function",
                              "refID": 18
                            },
                            "listeners": {
                              "type": "function",
                              "refID": 20
                            }
                          }
                        }
                      }
                    },
                    "prototype": {
                      "type": "object",
                      "members": {
                        "formatQuery": {
                          "type": "function",
                          "refID": 23
                        },
                        "normalizeQuery": {
                          "type": "function",
                          "refID": 25
                        },
                        "formatResults": {
                          "type": "function",
                          "refID": 27
                        },
                        "logException": {
                          "type": "function",
                          "refID": 29
                        },
                        "setMaxListeners": {
                          "ref": 8
                        },
                        "emit": {
                          "ref": 10
                        },
                        "addListener": {
                          "ref": 12
                        },
                        "on": {
                          "ref": 12
                        },
                        "once": {
                          "ref": 14
                        },
                        "removeListener": {
                          "ref": 16
                        },
                        "removeAllListeners": {
                          "ref": 18
                        },
                        "listeners": {
                          "ref": 20
                        }
                      }
                    }
                  }
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "console"
                    },
                    "log": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "DailyRotateFile": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "dailyRotateFile"
                    },
                    "log": {
                      "type": "function"
                    },
                    "query": {
                      "type": "function"
                    },
                    "stream": {
                      "type": "function"
                    },
                    "open": {
                      "type": "function"
                    },
                    "close": {
                      "type": "function"
                    },
                    "flush": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "File": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "file"
                    },
                    "log": {
                      "type": "function"
                    },
                    "query": {
                      "type": "function"
                    },
                    "stream": {
                      "type": "function"
                    },
                    "open": {
                      "type": "function"
                    },
                    "close": {
                      "type": "function"
                    },
                    "flush": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "Http": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "http"
                    },
                    "log": {
                      "type": "function"
                    },
                    "query": {
                      "type": "function"
                    },
                    "stream": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "Memory": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "memory"
                    },
                    "log": {
                      "type": "function"
                    },
                    "clearLogs": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "Webhook": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "webhook"
                    },
                    "log": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "MeteorClient": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "log": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            }
          }
        },
        "hash": {
          "type": "function"
        },
        "clone": {
          "type": "function"
        },
        "longestElement": {
          "type": "function"
        },
        "exception": {
          "type": "object",
          "members": {
            "getAllInfo": {
              "type": "function"
            },
            "getProcessInfo": {
              "type": "function"
            },
            "getOsInfo": {
              "type": "function"
            },
            "getTrace": {
              "type": "function"
            }
          }
        },
        "config": {
          "type": "object",
          "members": {
            "allColors": {
              "type": "object",
              "members": {
                "silly": {
                  "type": "constant",
                  "value": "magenta"
                },
                "verbose": {
                  "type": "constant",
                  "value": "cyan"
                },
                "debug": {
                  "type": "constant",
                  "value": "blue"
                },
                "info": {
                  "type": "constant",
                  "value": "green"
                },
                "warn": {
                  "type": "constant",
                  "value": "yellow"
                },
                "error": {
                  "type": "constant",
                  "value": "red"
                },
                "emerg": {
                  "type": "constant",
                  "value": "red"
                },
                "alert": {
                  "type": "constant",
                  "value": "yellow"
                },
                "crit": {
                  "type": "constant",
                  "value": "red"
                },
                "warning": {
                  "type": "constant",
                  "value": "red"
                },
                "notice": {
                  "type": "constant",
                  "value": "yellow"
                }
              }
            },
            "addColors": {
              "type": "function",
              "refID": 101
            },
            "colorize": {
              "type": "function"
            },
            "cli": {
              "type": "object",
              "members": {
                "levels": {
                  "type": "object",
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": 0
                    },
                    "input": {
                      "type": "constant",
                      "value": 1
                    },
                    "verbose": {
                      "type": "constant",
                      "value": 2
                    },
                    "prompt": {
                      "type": "constant",
                      "value": 3
                    },
                    "debug": {
                      "type": "constant",
                      "value": 4
                    },
                    "info": {
                      "type": "constant",
                      "value": 5
                    },
                    "data": {
                      "type": "constant",
                      "value": 6
                    },
                    "help": {
                      "type": "constant",
                      "value": 7
                    },
                    "warn": {
                      "type": "constant",
                      "value": 8
                    },
                    "error": {
                      "type": "constant",
                      "value": 9
                    }
                  }
                },
                "colors": {
                  "type": "object",
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": "magenta"
                    },
                    "input": {
                      "type": "constant",
                      "value": "grey"
                    },
                    "verbose": {
                      "type": "constant",
                      "value": "cyan"
                    },
                    "prompt": {
                      "type": "constant",
                      "value": "grey"
                    },
                    "debug": {
                      "type": "constant",
                      "value": "blue"
                    },
                    "info": {
                      "type": "constant",
                      "value": "green"
                    },
                    "data": {
                      "type": "constant",
                      "value": "grey"
                    },
                    "help": {
                      "type": "constant",
                      "value": "cyan"
                    },
                    "warn": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "error": {
                      "type": "constant",
                      "value": "red"
                    }
                  }
                }
              }
            },
            "npm": {
              "type": "object",
              "members": {
                "levels": {
                  "type": "object",
                  "refID": 109,
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": 0
                    },
                    "debug": {
                      "type": "constant",
                      "value": 1
                    },
                    "verbose": {
                      "type": "constant",
                      "value": 2
                    },
                    "info": {
                      "type": "constant",
                      "value": 3
                    },
                    "warn": {
                      "type": "constant",
                      "value": 4
                    },
                    "error": {
                      "type": "constant",
                      "value": 5
                    }
                  }
                },
                "colors": {
                  "type": "object",
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": "magenta"
                    },
                    "verbose": {
                      "type": "constant",
                      "value": "cyan"
                    },
                    "debug": {
                      "type": "constant",
                      "value": "blue"
                    },
                    "info": {
                      "type": "constant",
                      "value": "green"
                    },
                    "warn": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "error": {
                      "type": "constant",
                      "value": "red"
                    }
                  }
                }
              }
            },
            "syslog": {
              "type": "object",
              "members": {
                "levels": {
                  "type": "object",
                  "members": {
                    "emerg": {
                      "type": "constant",
                      "value": 0
                    },
                    "alert": {
                      "type": "constant",
                      "value": 1
                    },
                    "crit": {
                      "type": "constant",
                      "value": 2
                    },
                    "error": {
                      "type": "constant",
                      "value": 3
                    },
                    "warning": {
                      "type": "constant",
                      "value": 4
                    },
                    "notice": {
                      "type": "constant",
                      "value": 5
                    },
                    "info": {
                      "type": "constant",
                      "value": 6
                    },
                    "debug": {
                      "type": "constant",
                      "value": 7
                    }
                  }
                },
                "colors": {
                  "type": "object",
                  "members": {
                    "emerg": {
                      "type": "constant",
                      "value": "red"
                    },
                    "alert": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "crit": {
                      "type": "constant",
                      "value": "red"
                    },
                    "error": {
                      "type": "constant",
                      "value": "red"
                    },
                    "warning": {
                      "type": "constant",
                      "value": "red"
                    },
                    "notice": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "info": {
                      "type": "constant",
                      "value": "green"
                    },
                    "debug": {
                      "type": "constant",
                      "value": "blue"
                    }
                  }
                }
              }
            }
          }
        },
        "addColors": {
          "ref": 101
        },
        "Container": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "add": {
                  "type": "function",
                  "refID": 116
                },
                "get": {
                  "ref": 116
                },
                "has": {
                  "type": "function",
                  "refID": 118
                },
                "close": {
                  "type": "function",
                  "refID": 120
                }
              }
            }
          }
        },
        "Logger": {
          "type": "function",
          "members": {
            "super_": {
              "ref": 4
            },
            "prototype": {
              "type": "object",
              "members": {
                "extend": {
                  "type": "function"
                },
                "log": {
                  "type": "function"
                },
                "query": {
                  "type": "function"
                },
                "stream": {
                  "type": "function"
                },
                "close": {
                  "type": "function"
                },
                "handleExceptions": {
                  "type": "function"
                },
                "unhandleExceptions": {
                  "type": "function"
                },
                "add": {
                  "type": "function"
                },
                "addRewriter": {
                  "type": "function"
                },
                "clear": {
                  "type": "function"
                },
                "remove": {
                  "type": "function"
                },
                "startTimer": {
                  "type": "function"
                },
                "profile": {
                  "type": "function"
                },
                "setLevels": {
                  "type": "function"
                },
                "cli": {
                  "type": "function"
                },
                "setMaxListeners": {
                  "ref": 8
                },
                "emit": {
                  "ref": 10
                },
                "addListener": {
                  "ref": 12
                },
                "on": {
                  "ref": 12
                },
                "once": {
                  "ref": 14
                },
                "removeListener": {
                  "ref": 16
                },
                "removeAllListeners": {
                  "ref": 18
                },
                "listeners": {
                  "ref": 20
                }
              }
            }
          }
        },
        "Transport": {
          "ref": 3
        },
        "loggers": {
          "type": "object",
          "members": {
            "loggers": {
              "type": "object"
            },
            "options": {
              "type": "object"
            },
            "default": {
              "type": "object",
              "members": {
                "transports": {
                  "type": "array"
                }
              }
            },
            "add": {
              "ref": 116
            },
            "get": {
              "ref": 116
            },
            "has": {
              "ref": 118
            },
            "close": {
              "ref": 120
            }
          }
        },
        "levels": {
          "ref": 109
        },
        "silly": {
          "type": "function"
        },
        "debug": {
          "type": "function"
        },
        "verbose": {
          "type": "function"
        },
        "info": {
          "type": "function"
        },
        "warn": {
          "type": "function"
        },
        "error": {
          "type": "function"
        },
        "log": {
          "type": "function"
        },
        "query": {
          "type": "function"
        },
        "stream": {
          "type": "function"
        },
        "add": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "clear": {
          "type": "function"
        },
        "profile": {
          "type": "function"
        },
        "startTimer": {
          "type": "function"
        },
        "extend": {
          "type": "function"
        },
        "cli": {
          "type": "function"
        },
        "handleExceptions": {
          "type": "function"
        },
        "unhandleExceptions": {
          "type": "function"
        },
        "setLevels": {
          "type": "function"
        }
      }
    }
  },
  "brentjanderson:winston-client": {},
  "duongthienduc:meteor-winston": {
    "Winston": {
      "type": "object",
      "members": {
        "version": {
          "type": "constant",
          "value": "0.7.2"
        },
        "transports": {
          "type": "object",
          "members": {
            "Console": {
              "type": "function",
              "members": {
                "super_": {
                  "type": "function",
                  "refID": 3,
                  "members": {
                    "super_": {
                      "type": "function",
                      "refID": 4,
                      "members": {
                        "listenerCount": {
                          "type": "function"
                        },
                        "prototype": {
                          "type": "object",
                          "members": {
                            "setMaxListeners": {
                              "type": "function",
                              "refID": 8
                            },
                            "emit": {
                              "type": "function",
                              "refID": 10
                            },
                            "addListener": {
                              "type": "function",
                              "refID": 12
                            },
                            "on": {
                              "ref": 12
                            },
                            "once": {
                              "type": "function",
                              "refID": 14
                            },
                            "removeListener": {
                              "type": "function",
                              "refID": 16
                            },
                            "removeAllListeners": {
                              "type": "function",
                              "refID": 18
                            },
                            "listeners": {
                              "type": "function",
                              "refID": 20
                            }
                          }
                        }
                      }
                    },
                    "prototype": {
                      "type": "object",
                      "members": {
                        "formatQuery": {
                          "type": "function",
                          "refID": 23
                        },
                        "normalizeQuery": {
                          "type": "function",
                          "refID": 25
                        },
                        "formatResults": {
                          "type": "function",
                          "refID": 27
                        },
                        "logException": {
                          "type": "function",
                          "refID": 29
                        },
                        "setMaxListeners": {
                          "ref": 8
                        },
                        "emit": {
                          "ref": 10
                        },
                        "addListener": {
                          "ref": 12
                        },
                        "on": {
                          "ref": 12
                        },
                        "once": {
                          "ref": 14
                        },
                        "removeListener": {
                          "ref": 16
                        },
                        "removeAllListeners": {
                          "ref": 18
                        },
                        "listeners": {
                          "ref": 20
                        }
                      }
                    }
                  }
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "console"
                    },
                    "log": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "DailyRotateFile": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "dailyRotateFile"
                    },
                    "log": {
                      "type": "function"
                    },
                    "query": {
                      "type": "function"
                    },
                    "stream": {
                      "type": "function"
                    },
                    "open": {
                      "type": "function"
                    },
                    "close": {
                      "type": "function"
                    },
                    "flush": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "File": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "file"
                    },
                    "log": {
                      "type": "function"
                    },
                    "query": {
                      "type": "function"
                    },
                    "stream": {
                      "type": "function"
                    },
                    "open": {
                      "type": "function"
                    },
                    "close": {
                      "type": "function"
                    },
                    "flush": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "Http": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "http"
                    },
                    "log": {
                      "type": "function"
                    },
                    "query": {
                      "type": "function"
                    },
                    "stream": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "Memory": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "memory"
                    },
                    "log": {
                      "type": "function"
                    },
                    "clearLogs": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            },
            "Webhook": {
              "type": "function",
              "members": {
                "super_": {
                  "ref": 3
                },
                "prototype": {
                  "type": "object",
                  "members": {
                    "name": {
                      "type": "constant",
                      "value": "webhook"
                    },
                    "log": {
                      "type": "function"
                    },
                    "formatQuery": {
                      "ref": 23
                    },
                    "normalizeQuery": {
                      "ref": 25
                    },
                    "formatResults": {
                      "ref": 27
                    },
                    "logException": {
                      "ref": 29
                    },
                    "setMaxListeners": {
                      "ref": 8
                    },
                    "emit": {
                      "ref": 10
                    },
                    "addListener": {
                      "ref": 12
                    },
                    "on": {
                      "ref": 12
                    },
                    "once": {
                      "ref": 14
                    },
                    "removeListener": {
                      "ref": 16
                    },
                    "removeAllListeners": {
                      "ref": 18
                    },
                    "listeners": {
                      "ref": 20
                    }
                  }
                }
              }
            }
          }
        },
        "hash": {
          "type": "function"
        },
        "clone": {
          "type": "function"
        },
        "longestElement": {
          "type": "function"
        },
        "exception": {
          "type": "object",
          "members": {
            "getAllInfo": {
              "type": "function"
            },
            "getProcessInfo": {
              "type": "function"
            },
            "getOsInfo": {
              "type": "function"
            },
            "getTrace": {
              "type": "function"
            }
          }
        },
        "config": {
          "type": "object",
          "members": {
            "allColors": {
              "type": "object",
              "members": {
                "silly": {
                  "type": "constant",
                  "value": "magenta"
                },
                "verbose": {
                  "type": "constant",
                  "value": "cyan"
                },
                "debug": {
                  "type": "constant",
                  "value": "blue"
                },
                "info": {
                  "type": "constant",
                  "value": "green"
                },
                "warn": {
                  "type": "constant",
                  "value": "yellow"
                },
                "error": {
                  "type": "constant",
                  "value": "red"
                },
                "emerg": {
                  "type": "constant",
                  "value": "red"
                },
                "alert": {
                  "type": "constant",
                  "value": "yellow"
                },
                "crit": {
                  "type": "constant",
                  "value": "red"
                },
                "warning": {
                  "type": "constant",
                  "value": "red"
                },
                "notice": {
                  "type": "constant",
                  "value": "yellow"
                }
              }
            },
            "addColors": {
              "type": "function",
              "refID": 97
            },
            "colorize": {
              "type": "function"
            },
            "cli": {
              "type": "object",
              "members": {
                "levels": {
                  "type": "object",
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": 0
                    },
                    "input": {
                      "type": "constant",
                      "value": 1
                    },
                    "verbose": {
                      "type": "constant",
                      "value": 2
                    },
                    "prompt": {
                      "type": "constant",
                      "value": 3
                    },
                    "debug": {
                      "type": "constant",
                      "value": 4
                    },
                    "info": {
                      "type": "constant",
                      "value": 5
                    },
                    "data": {
                      "type": "constant",
                      "value": 6
                    },
                    "help": {
                      "type": "constant",
                      "value": 7
                    },
                    "warn": {
                      "type": "constant",
                      "value": 8
                    },
                    "error": {
                      "type": "constant",
                      "value": 9
                    }
                  }
                },
                "colors": {
                  "type": "object",
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": "magenta"
                    },
                    "input": {
                      "type": "constant",
                      "value": "grey"
                    },
                    "verbose": {
                      "type": "constant",
                      "value": "cyan"
                    },
                    "prompt": {
                      "type": "constant",
                      "value": "grey"
                    },
                    "debug": {
                      "type": "constant",
                      "value": "blue"
                    },
                    "info": {
                      "type": "constant",
                      "value": "green"
                    },
                    "data": {
                      "type": "constant",
                      "value": "grey"
                    },
                    "help": {
                      "type": "constant",
                      "value": "cyan"
                    },
                    "warn": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "error": {
                      "type": "constant",
                      "value": "red"
                    }
                  }
                }
              }
            },
            "npm": {
              "type": "object",
              "members": {
                "levels": {
                  "type": "object",
                  "refID": 105,
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": 0
                    },
                    "debug": {
                      "type": "constant",
                      "value": 1
                    },
                    "verbose": {
                      "type": "constant",
                      "value": 2
                    },
                    "info": {
                      "type": "constant",
                      "value": 3
                    },
                    "warn": {
                      "type": "constant",
                      "value": 4
                    },
                    "error": {
                      "type": "constant",
                      "value": 5
                    }
                  }
                },
                "colors": {
                  "type": "object",
                  "members": {
                    "silly": {
                      "type": "constant",
                      "value": "magenta"
                    },
                    "verbose": {
                      "type": "constant",
                      "value": "cyan"
                    },
                    "debug": {
                      "type": "constant",
                      "value": "blue"
                    },
                    "info": {
                      "type": "constant",
                      "value": "green"
                    },
                    "warn": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "error": {
                      "type": "constant",
                      "value": "red"
                    }
                  }
                }
              }
            },
            "syslog": {
              "type": "object",
              "members": {
                "levels": {
                  "type": "object",
                  "members": {
                    "emerg": {
                      "type": "constant",
                      "value": 0
                    },
                    "alert": {
                      "type": "constant",
                      "value": 1
                    },
                    "crit": {
                      "type": "constant",
                      "value": 2
                    },
                    "error": {
                      "type": "constant",
                      "value": 3
                    },
                    "warning": {
                      "type": "constant",
                      "value": 4
                    },
                    "notice": {
                      "type": "constant",
                      "value": 5
                    },
                    "info": {
                      "type": "constant",
                      "value": 6
                    },
                    "debug": {
                      "type": "constant",
                      "value": 7
                    }
                  }
                },
                "colors": {
                  "type": "object",
                  "members": {
                    "emerg": {
                      "type": "constant",
                      "value": "red"
                    },
                    "alert": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "crit": {
                      "type": "constant",
                      "value": "red"
                    },
                    "error": {
                      "type": "constant",
                      "value": "red"
                    },
                    "warning": {
                      "type": "constant",
                      "value": "red"
                    },
                    "notice": {
                      "type": "constant",
                      "value": "yellow"
                    },
                    "info": {
                      "type": "constant",
                      "value": "green"
                    },
                    "debug": {
                      "type": "constant",
                      "value": "blue"
                    }
                  }
                }
              }
            }
          }
        },
        "addColors": {
          "ref": 97
        },
        "Container": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "add": {
                  "type": "function",
                  "refID": 112
                },
                "get": {
                  "ref": 112
                },
                "has": {
                  "type": "function",
                  "refID": 114
                },
                "close": {
                  "type": "function",
                  "refID": 116
                }
              }
            }
          }
        },
        "Logger": {
          "type": "function",
          "members": {
            "super_": {
              "ref": 4
            },
            "prototype": {
              "type": "object",
              "members": {
                "extend": {
                  "type": "function"
                },
                "log": {
                  "type": "function"
                },
                "query": {
                  "type": "function"
                },
                "stream": {
                  "type": "function"
                },
                "close": {
                  "type": "function"
                },
                "handleExceptions": {
                  "type": "function"
                },
                "unhandleExceptions": {
                  "type": "function"
                },
                "add": {
                  "type": "function"
                },
                "addRewriter": {
                  "type": "function"
                },
                "clear": {
                  "type": "function"
                },
                "remove": {
                  "type": "function"
                },
                "startTimer": {
                  "type": "function"
                },
                "profile": {
                  "type": "function"
                },
                "setLevels": {
                  "type": "function"
                },
                "cli": {
                  "type": "function"
                },
                "setMaxListeners": {
                  "ref": 8
                },
                "emit": {
                  "ref": 10
                },
                "addListener": {
                  "ref": 12
                },
                "on": {
                  "ref": 12
                },
                "once": {
                  "ref": 14
                },
                "removeListener": {
                  "ref": 16
                },
                "removeAllListeners": {
                  "ref": 18
                },
                "listeners": {
                  "ref": 20
                }
              }
            }
          }
        },
        "Transport": {
          "ref": 3
        },
        "loggers": {
          "type": "object",
          "members": {
            "loggers": {
              "type": "object"
            },
            "options": {
              "type": "object"
            },
            "default": {
              "type": "object",
              "members": {
                "transports": {
                  "type": "array"
                }
              }
            },
            "add": {
              "ref": 112
            },
            "get": {
              "ref": 112
            },
            "has": {
              "ref": 114
            },
            "close": {
              "ref": 116
            }
          }
        },
        "levels": {
          "ref": 105
        },
        "silly": {
          "type": "function"
        },
        "debug": {
          "type": "function"
        },
        "verbose": {
          "type": "function"
        },
        "info": {
          "type": "function"
        },
        "warn": {
          "type": "function"
        },
        "error": {
          "type": "function"
        },
        "log": {
          "type": "function"
        },
        "query": {
          "type": "function"
        },
        "stream": {
          "type": "function"
        },
        "add": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "clear": {
          "type": "function"
        },
        "profile": {
          "type": "function"
        },
        "startTimer": {
          "type": "function"
        },
        "extend": {
          "type": "function"
        },
        "cli": {
          "type": "function"
        },
        "handleExceptions": {
          "type": "function"
        },
        "unhandleExceptions": {
          "type": "function"
        },
        "setLevels": {
          "type": "function"
        }
      }
    }
  },
  "mizzao:timesync": {},
  "agnito:raphael": {},
  "clinical:nightwatch": {},
  "practicalmeteor:loglevel": {
    "loglevel": {
      "type": "object",
      "members": {
        "createLogger": {
          "type": "function"
        },
        "createPackageLogger": {
          "type": "function"
        },
        "createAppLogger": {
          "type": "function"
        }
      }
    }
  },
  "velocity:core": {
    "Velocity": {
      "type": "object",
      "members": {
        "startup": {
          "type": "function"
        },
        "getAppPath": {
          "type": "function"
        },
        "getTestsPath": {
          "type": "function"
        },
        "postProcessors": {
          "type": "array"
        },
        "addPostProcessor": {
          "type": "function"
        },
        "getReportGithubIssueMessage": {
          "type": "function"
        },
        "registerTestingFramework": {
          "type": "function"
        },
        "onTest": {
          "type": "function"
        },
        "Mirror": {
          "type": "object",
          "members": {
            "start": {
              "type": "function"
            }
          }
        },
        "ProxyPackageSync": {
          "type": "object",
          "members": {
            "regeneratePackageJs": {
              "type": "function"
            }
          }
        }
      }
    },
    "VelocityTestFiles": {
      "type": "object",
      "members": {
        "find": {
          "type": "function"
        },
        "findOne": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "update": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "upsert": {
          "type": "function"
        },
        "rawCollection": {
          "type": "function"
        },
        "rawDatabase": {
          "type": "function"
        },
        "allow": {
          "type": "function"
        },
        "deny": {
          "type": "function"
        }
      }
    },
    "VelocityFixtureFiles": {
      "type": "object",
      "members": {
        "find": {
          "type": "function"
        },
        "findOne": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "update": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "upsert": {
          "type": "function"
        },
        "rawCollection": {
          "type": "function"
        },
        "rawDatabase": {
          "type": "function"
        },
        "allow": {
          "type": "function"
        },
        "deny": {
          "type": "function"
        }
      }
    },
    "VelocityTestReports": {
      "type": "object",
      "members": {
        "find": {
          "type": "function"
        },
        "findOne": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "update": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "upsert": {
          "type": "function"
        },
        "rawCollection": {
          "type": "function"
        },
        "rawDatabase": {
          "type": "function"
        },
        "allow": {
          "type": "function"
        },
        "deny": {
          "type": "function"
        }
      }
    },
    "VelocityAggregateReports": {
      "type": "object",
      "members": {
        "find": {
          "type": "function"
        },
        "findOne": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "update": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "upsert": {
          "type": "function"
        },
        "rawCollection": {
          "type": "function"
        },
        "rawDatabase": {
          "type": "function"
        },
        "allow": {
          "type": "function"
        },
        "deny": {
          "type": "function"
        }
      }
    },
    "VelocityLogs": {
      "type": "object",
      "members": {
        "find": {
          "type": "function"
        },
        "findOne": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "update": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "upsert": {
          "type": "function"
        },
        "rawCollection": {
          "type": "function"
        },
        "rawDatabase": {
          "type": "function"
        },
        "allow": {
          "type": "function"
        },
        "deny": {
          "type": "function"
        }
      }
    },
    "VelocityMirrors": {
      "type": "object",
      "members": {
        "find": {
          "type": "function"
        },
        "findOne": {
          "type": "function"
        },
        "insert": {
          "type": "function"
        },
        "update": {
          "type": "function"
        },
        "remove": {
          "type": "function"
        },
        "upsert": {
          "type": "function"
        },
        "rawCollection": {
          "type": "function"
        },
        "rawDatabase": {
          "type": "function"
        },
        "allow": {
          "type": "function"
        },
        "deny": {
          "type": "function"
        }
      }
    }
  },
  "velocity:shim": {},
  "velocity:meteor-stubs": {
    "MeteorStubs": {
      "type": "object",
      "members": {
        "install": {
          "type": "function"
        },
        "uninstall": {
          "type": "function"
        }
      }
    }
  },
  "sanjo:meteor-version": {
    "MeteorVersion": {
      "type": "object",
      "members": {
        "getSemanticVersion": {
          "type": "function"
        }
      }
    }
  },
  "sanjo:long-running-child-process": {
    "LongRunningChildProcess": {
      "type": "function",
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "taskName": {
              "type": "null",
              "value": null
            },
            "child": {
              "type": "null",
              "value": null
            },
            "pid": {
              "type": "null",
              "value": null
            },
            "getTaskName": {
              "type": "function"
            },
            "getChild": {
              "type": "function"
            },
            "getPid": {
              "type": "function"
            },
            "isDead": {
              "type": "function"
            },
            "isRunning": {
              "type": "function"
            },
            "readPid": {
              "type": "function"
            },
            "spawn": {
              "type": "function"
            },
            "kill": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "package-version-parser": {
    "PackageVersion": {
      "type": "function",
      "members": {
        "parse": {
          "type": "function"
        },
        "versionMagnitude": {
          "type": "function"
        },
        "lessThan": {
          "type": "function"
        },
        "majorVersion": {
          "type": "function"
        },
        "compare": {
          "type": "function"
        },
        "getValidServerVersion": {
          "type": "function"
        },
        "VersionConstraint": {
          "type": "function"
        },
        "parseVersionConstraint": {
          "type": "function"
        },
        "PackageConstraint": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "toString": {
                  "type": "function"
                }
              }
            }
          }
        },
        "parsePackageConstraint": {
          "type": "function"
        },
        "validatePackageName": {
          "type": "function"
        },
        "invalidFirstFormatConstraint": {
          "type": "function"
        },
        "removeBuildID": {
          "type": "function"
        }
      }
    }
  },
  "sanjo:karma": {
    "Karma": {
      "type": "object",
      "members": {
        "start": {
          "type": "function"
        },
        "setConfig": {
          "type": "function"
        }
      }
    },
    "KarmaInternals": {
      "type": "object",
      "members": {
        "karmaChilds": {
          "type": "object",
          "members": {
            "jasmine-client-unit": {
              "type": "object",
              "members": {
                "taskName": {
                  "type": "constant",
                  "value": "jasmine-client-unit"
                },
                "appPath": {
                  "type": "constant",
                  "value": "/home/saurabh/dev/bigbluebutton/bigbluebutton-html5/app"
                },
                "pid": {
                  "type": "constant",
                  "value": 21087
                },
                "getTaskName": {
                  "type": "function"
                },
                "getChild": {
                  "type": "function"
                },
                "getPid": {
                  "type": "function"
                },
                "isDead": {
                  "type": "function"
                },
                "isRunning": {
                  "type": "function"
                },
                "readPid": {
                  "type": "function"
                },
                "spawn": {
                  "type": "function"
                },
                "kill": {
                  "type": "function"
                }
              }
            }
          }
        },
        "getKarmaChild": {
          "type": "function"
        },
        "setKarmaChild": {
          "type": "function"
        },
        "startKarmaServer": {
          "type": "function"
        },
        "writeKarmaConfig": {
          "type": "function"
        },
        "generateKarmaConfig": {
          "type": "function"
        },
        "readKarmaConfig": {
          "type": "function"
        },
        "getConfigPath": {
          "type": "function"
        },
        "getAppPath": {
          "type": "function"
        },
        "getKarmaPath": {
          "type": "function"
        }
      }
    }
  },
  "sanjo:jasmine": {
    "Jasmine": {
      "type": "object",
      "members": {
        "onTest": {
          "type": "function"
        }
      }
    }
  },
  "pagebakers:ionicons": {},
  "ewall:foundation": {},
  "maibaum:foundation-icons": {},
  "gthacoder:sled": {},
  "reload": {},
  "autoupdate": {
    "Autoupdate": {
      "type": "object",
      "members": {
        "autoupdateVersion": {
          "type": "constant",
          "value": "ieFJF9gs8zhzYS2yX"
        },
        "autoupdateVersionRefreshable": {
          "type": "constant",
          "value": "e00cfee6ed446633ad80a5e0ad7fef825aafd14f"
        },
        "autoupdateVersionCordova": {
          "type": "constant",
          "value": "none"
        },
        "appId": {
          "type": "constant",
          "value": "jrnkwdjvicqgy6gtl8"
        }
      }
    }
  },
  "meteor-platform": {},
  "session": {},
  "livedata": {
    "DDP": {
      "type": "object",
      "members": {
        "ConnectionError": {
          "type": "function",
          "refID": 1,
          "members": {
            "captureStackTrace": {
              "type": "function",
              "refID": 2
            },
            "stackTraceLimit": {
              "type": "constant",
              "value": 10
            },
            "prepareStackTrace": {
              "type": "function",
              "refID": 4
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 1
                }
              }
            }
          }
        },
        "ForcedReconnectError": {
          "type": "function",
          "refID": 7,
          "members": {
            "captureStackTrace": {
              "ref": 2
            },
            "stackTraceLimit": {
              "type": "constant",
              "value": 10
            },
            "prepareStackTrace": {
              "ref": 4
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 7
                }
              }
            }
          }
        },
        "randomStream": {
          "type": "function"
        },
        "connect": {
          "type": "function"
        }
      }
    },
    "DDPServer": {
      "type": "object"
    },
    "LivedataTest": {
      "type": "undefined"
    }
  },
  "velocity:test-proxy": {},
  "velocity:node-soft-mirror": {}
}
var globalContext = (typeof global !== 'undefined') ? global : window
var originalContext = []

/*
originalContext = [
  {
    context: window,
    propertyName: 'Meteor',
    value: {}
  }
]
*/

function _saveOriginal(context, propertyName) {
  originalContext.push({
    context: context,
    propertyName: propertyName,
    value: context[propertyName]
  })
}

function _restoreOriginal(original) {
  original.context[original.propertyName] = original.value
}

function restoreOriginals() {
  originalContext.forEach(_restoreOriginal)
  originalContext = []
}

function loadMocks() {
  for (var packageName in packageMetadata) {
    for (var packageExportName in packageMetadata[packageName]) {
      _saveOriginal(globalContext, packageExportName)
      var packageExport = packageMetadata[packageName][packageExportName]
      globalContext[packageExportName] = ComponentMocker.generateFromMetadata(packageExport)
    }
  }
}

beforeEach(loadMocks)
afterEach(restoreOriginals)
