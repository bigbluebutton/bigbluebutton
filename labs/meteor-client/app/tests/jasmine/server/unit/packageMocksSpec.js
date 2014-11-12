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
  "less": {},
  "amplify": {},
  "raphaeljs-package": {},
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
          "refID": 31
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
          "refID": 47
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 31
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 47
            },
            "prototype": {
              "type": "object",
              "members": {
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
          "refID": 31
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
          "refID": 47
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 31
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 47
            },
            "prototype": {
              "type": "object",
              "members": {
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
          "refID": 31
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
          "refID": 47
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 31
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 47
            },
            "prototype": {
              "type": "object",
              "members": {
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
          "refID": 31
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
          "refID": 47
        },
        "Template": {
          "type": "function",
          "members": {
            "instance": {
              "type": "function"
            },
            "currentData": {
              "ref": 31
            },
            "parentData": {
              "type": "function"
            },
            "registerHelper": {
              "ref": 47
            },
            "prototype": {
              "type": "object",
              "members": {
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
                  "value": "ef66efb2044d4823288eb877b0709d7f7b2ee486"
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
              "value": 0
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
    },
    "WebAppInternals": {
      "type": "object",
      "members": {
        "identifyBrowser": {
          "type": "function"
        },
        "generateBoilerplateInstance": {
          "type": "function"
        },
        "staticFilesMiddleware": {
          "type": "function"
        },
        "bindToProxy": {
          "type": "function"
        },
        "addRoute": {
          "type": "function"
        },
        "reloadClientPrograms": {
          "type": "function"
        },
        "generateBoilerplate": {
          "type": "function"
        },
        "staticFiles": {
          "type": "object",
          "members": {
            "/packages/underscore.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/underscore.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/0a80a8623e1b40b5df5a05582f288ddd586eaa18.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/0a80a8623e1b40b5df5a05582f288ddd586eaa18.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/underscore.js.map"
                }
              }
            },
            "/packages/meteor.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/meteor.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/907f41ce7b84611715fdacaf42af1d82f4502b5e.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/907f41ce7b84611715fdacaf42af1d82f4502b5e.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/meteor.js.map"
                }
              }
            },
            "/packages/standard-app-packages.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/standard-app-packages.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/be7072e6abfda638502b63fa0f809c85c8c2b8ed.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/be7072e6abfda638502b63fa0f809c85c8c2b8ed.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/standard-app-packages.js.map"
                }
              }
            },
            "/packages/coffeescript.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/coffeescript.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/969f68786bbc68e6cad299e74922a53af3d1404b.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/969f68786bbc68e6cad299e74922a53af3d1404b.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/coffeescript.js.map"
                }
              }
            },
            "/packages/mrt_redis.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_redis.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/ad1f47c073f963478e757dced5ddd71c6b776ea0.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/ad1f47c073f963478e757dced5ddd71c6b776ea0.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_redis.js.map"
                }
              }
            },
            "/packages/arunoda_npm.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/arunoda_npm.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/cc804768148cdd033ceb4520a6cb56f8e9657b8d.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/cc804768148cdd033ceb4520a6cb56f8e9657b8d.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/arunoda_npm.js.map"
                }
              }
            },
            "/packages/less.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/less.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/7d1bf981a25a449d6270558bcfc983313c40cd26.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/7d1bf981a25a449d6270558bcfc983313c40cd26.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/less.js.map"
                }
              }
            },
            "/packages/jquery.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/jquery.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/265926494aaa3929cd2e30da265211c5929f37a4.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/265926494aaa3929cd2e30da265211c5929f37a4.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/jquery.js.map"
                }
              }
            },
            "/packages/amplify.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/amplify.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/0943ecb804169b991257a319fa92b9e6f34e2d1b.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/0943ecb804169b991257a319fa92b9e6f34e2d1b.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/amplify.js.map"
                }
              }
            },
            "/packages/raphaeljs-package.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/raphaeljs-package.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/bc14730496122df7f88139d4f83db0db50cf83fd.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/bc14730496122df7f88139d4f83db0db50cf83fd.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/raphaeljs-package.js.map"
                }
              }
            },
            "/packages/tracker.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/tracker.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/192a05cc46b867dadbe8bf90dd961f6f8fd1574f.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/192a05cc46b867dadbe8bf90dd961f6f8fd1574f.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/tracker.js.map"
                }
              }
            },
            "/packages/json.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/json.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/e22856eae714c681199eabc5c0710b904b125554.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/e22856eae714c681199eabc5c0710b904b125554.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/json.js.map"
                }
              }
            },
            "/packages/base64.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/base64.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/1a63019243b73298e2964e6d4680f25bca657726.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/1a63019243b73298e2964e6d4680f25bca657726.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/base64.js.map"
                }
              }
            },
            "/packages/ejson.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ejson.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/71047b64b5196348bdbe5fd5eea9ac97a5a9eb14.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/71047b64b5196348bdbe5fd5eea9ac97a5a9eb14.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ejson.js.map"
                }
              }
            },
            "/packages/random.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/random.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/fe7b46080c91ce482acf6fc326afbc5b176f0502.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/fe7b46080c91ce482acf6fc326afbc5b176f0502.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/random.js.map"
                }
              }
            },
            "/packages/id-map.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/id-map.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/9ea6eaae8d74693ce2505a858d9a5e60cf191298.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/9ea6eaae8d74693ce2505a858d9a5e60cf191298.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/id-map.js.map"
                }
              }
            },
            "/packages/ordered-dict.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ordered-dict.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/bf8af2f26c8d96bf8b2e6b407d3ed69f23c2cd37.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/bf8af2f26c8d96bf8b2e6b407d3ed69f23c2cd37.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ordered-dict.js.map"
                }
              }
            },
            "/packages/geojson-utils.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/geojson-utils.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/81b79d5cf96d00b4b7a28987debcffb665c17526.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/81b79d5cf96d00b4b7a28987debcffb665c17526.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/geojson-utils.js.map"
                }
              }
            },
            "/packages/minimongo.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/minimongo.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/d08e67b8b9ef5f236184319cc86e6e14b5cf11be.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/d08e67b8b9ef5f236184319cc86e6e14b5cf11be.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/minimongo.js.map"
                }
              }
            },
            "/packages/logging.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/logging.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/07e201b648f16be8435a4f666156995eeda0c750.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/07e201b648f16be8435a4f666156995eeda0c750.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/logging.js.map"
                }
              }
            },
            "/packages/check.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/check.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/803a2be518a0c6c3949e45cf65c4ad627a3d603a.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/803a2be518a0c6c3949e45cf65c4ad627a3d603a.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/check.js.map"
                }
              }
            },
            "/packages/retry.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/retry.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/1f1dd2c35d300110fdaba51ce4473583bc3bf031.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/1f1dd2c35d300110fdaba51ce4473583bc3bf031.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/retry.js.map"
                }
              }
            },
            "/packages/reload.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/reload.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/da8974b7231dd8c0caccb5f322dcf97329d486d1.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/da8974b7231dd8c0caccb5f322dcf97329d486d1.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/reload.js.map"
                }
              }
            },
            "/packages/ddp.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ddp.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/ed3a8b20e91a598de5b24a7c98c5ae4be1c0f9e6.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/ed3a8b20e91a598de5b24a7c98c5ae4be1c0f9e6.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ddp.js.map"
                }
              }
            },
            "/packages/follower-livedata.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/follower-livedata.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/74156c6baa89da861fc4ddb58ef158eac71e58e0.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/74156c6baa89da861fc4ddb58ef158eac71e58e0.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/follower-livedata.js.map"
                }
              }
            },
            "/packages/application-configuration.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/application-configuration.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/dcbf1f0774460fccf098a4c9e8fad4c3a0f2952f.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/dcbf1f0774460fccf098a4c9e8fad4c3a0f2952f.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/application-configuration.js.map"
                }
              }
            },
            "/packages/mongo.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mongo.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/9bc2c5a8b2796fab86b51660ca643e5a49a30c84.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/9bc2c5a8b2796fab86b51660ca643e5a49a30c84.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mongo.js.map"
                }
              }
            },
            "/packages/reactive-dict.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/reactive-dict.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/6b25309b1f0dcf775b44984324878d6f8ad1abc2.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/6b25309b1f0dcf775b44984324878d6f8ad1abc2.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/reactive-dict.js.map"
                }
              }
            },
            "/packages/deps.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/deps.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/504589e1e9585dec8f9f6094e5a87b22de3783a1.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/504589e1e9585dec8f9f6094e5a87b22de3783a1.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/deps.js.map"
                }
              }
            },
            "/packages/htmljs.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/htmljs.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/539b5fc23cf5e63bc8e324543a1026b138316a8c.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/539b5fc23cf5e63bc8e324543a1026b138316a8c.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/htmljs.js.map"
                }
              }
            },
            "/packages/observe-sequence.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/observe-sequence.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/2fd807ea171ead273b9e6458607cb226012d9240.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/2fd807ea171ead273b9e6458607cb226012d9240.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/observe-sequence.js.map"
                }
              }
            },
            "/packages/reactive-var.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/reactive-var.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/20335b7b37165980ddd9f23943b2e5b00aae1cc2.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/20335b7b37165980ddd9f23943b2e5b00aae1cc2.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/reactive-var.js.map"
                }
              }
            },
            "/packages/blaze.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/blaze.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/88aac5d3c26b7576ac55bb3afc5324f465757709.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/88aac5d3c26b7576ac55bb3afc5324f465757709.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/blaze.js.map"
                }
              }
            },
            "/packages/templating.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/templating.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/599ba307216da826d8b335332ebcc9a497a369a0.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/599ba307216da826d8b335332ebcc9a497a369a0.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/templating.js.map"
                }
              }
            },
            "/packages/iron_core.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_core.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/fe41a023a7a6f1ded90b0729437928a8ddccc7d4.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/fe41a023a7a6f1ded90b0729437928a8ddccc7d4.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_core.js.map"
                }
              }
            },
            "/packages/ui.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ui.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/5a663333fd30f8fd913f110e0ef779e84f67c4b8.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/5a663333fd30f8fd913f110e0ef779e84f67c4b8.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/ui.js.map"
                }
              }
            },
            "/packages/iron_dynamic-template.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_dynamic-template.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/32038885cb1dad7957291ffebfffcb7f8cd57d20.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/32038885cb1dad7957291ffebfffcb7f8cd57d20.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_dynamic-template.js.map"
                }
              }
            },
            "/packages/iron_layout.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_layout.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/080dc95e770e3130757bf6af69fd0abb99573ae4.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/080dc95e770e3130757bf6af69fd0abb99573ae4.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_layout.js.map"
                }
              }
            },
            "/packages/iron_router.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_router.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/da7f2ac81c3fd9daebf49ce9a6980a54caa1dc17.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/da7f2ac81c3fd9daebf49ce9a6980a54caa1dc17.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/iron_router.js.map"
                }
              }
            },
            "/packages/mrt_bootstrap-3.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_bootstrap-3.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/cdd66806fce55191bbb255a2bd50e366b4d2992e.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/cdd66806fce55191bbb255a2bd50e366b4d2992e.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_bootstrap-3.js.map"
                }
              }
            },
            "/packages/clubfest_raphael.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/clubfest_raphael.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/3e580f1e963a31d0105df850cd57301426982f30.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/3e580f1e963a31d0105df850cd57301426982f30.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/clubfest_raphael.js.map"
                }
              }
            },
            "/packages/sanjo_jasmine.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/sanjo_jasmine.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/2a812f08e615736fedd44f1d63f780a64163b6ee.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/2a812f08e615736fedd44f1d63f780a64163b6ee.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/sanjo_jasmine.js.map"
                }
              }
            },
            "/packages/url.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/url.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/f267b683007ca477629c166b4bd43499e3122351.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/f267b683007ca477629c166b4bd43499e3122351.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/url.js.map"
                }
              }
            },
            "/packages/http.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/http.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/9c5d152169ba9a5a57b6b8ec28e64bbd0d308077.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/9c5d152169ba9a5a57b6b8ec28e64bbd0d308077.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/http.js.map"
                }
              }
            },
            "/packages/velocity_core.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_core.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/6ca46c76b400ce620d5a99a1a6edfec60ca0ba1a.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/6ca46c76b400ce620d5a99a1a6edfec60ca0ba1a.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_core.js.map"
                }
              }
            },
            "/packages/velocity_html-reporter.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_html-reporter.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/92751561da596e9009d1c1baacb9aa21064ce18d.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/92751561da596e9009d1c1baacb9aa21064ce18d.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_html-reporter.js.map"
                }
              }
            },
            "/packages/autoupdate.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/autoupdate.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/c823646e93561d86e6bcb3cbd2457a8540e519c1.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/c823646e93561d86e6bcb3cbd2457a8540e519c1.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/autoupdate.js.map"
                }
              }
            },
            "/packages/meteor-platform.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/meteor-platform.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/499a2f8522e25820b1153c69a92751ccaae507b3.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/499a2f8522e25820b1153c69a92751ccaae507b3.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/meteor-platform.js.map"
                }
              }
            },
            "/packages/webapp.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/webapp.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/e1be090051b82f046484dccc2de7d747e50c7328.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/e1be090051b82f046484dccc2de7d747e50c7328.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/webapp.js.map"
                }
              }
            },
            "/packages/session.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/session.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/442b1bc169c2a1fb8c1fc5420041baa1ed9cb940.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/442b1bc169c2a1fb8c1fc5420041baa1ed9cb940.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/session.js.map"
                }
              }
            },
            "/packages/livedata.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/livedata.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/718526445deb4d9baacb6d92c551adea1d36c1e1.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/718526445deb4d9baacb6d92c551adea1d36c1e1.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/livedata.js.map"
                }
              }
            },
            "/packages/spacebars.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/spacebars.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/packages/3c496d2950151d744a8574297b46d2763a123bdf.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/packages/3c496d2950151d744a8574297b46d2763a123bdf.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/spacebars.js.map"
                }
              }
            },
            "/packages/global-imports.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/global-imports.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/chat/template.chat_bar.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/chat/template.chat_bar.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/logout/template.logout.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/logout/template.logout.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/users/template.user_item.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/users/template.user_item.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/users/template.users_list.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/users/template.users_list.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/whiteboard/template.slide.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/whiteboard/template.slide.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/whiteboard/template.whiteboard.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/whiteboard/template.whiteboard.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/template.layout.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/template.layout.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/template.sharedTemplates.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/template.sharedTemplates.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/template.main.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/template.main.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/lib/scale.raphael.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/lib/scale.raphael.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/lib/router.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/lib/router.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/lib/5edb44e2058bb5e36b68781159c8c2efbbe0e571.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/lib/5edb44e2058bb5e36b68781159c8c2efbbe0e571.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/lib/router.coffee.js.map"
                }
              }
            },
            "/client/views/chat/chat_bar.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/chat/chat_bar.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/views/chat/1e4cf97ed470946c74199863240788a9db4048d5.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/chat/1e4cf97ed470946c74199863240788a9db4048d5.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/chat/chat_bar.coffee.js.map"
                }
              }
            },
            "/client/views/users/user_item.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/users/user_item.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/views/users/bacb94ef9e652b24cac3fec1decd83f06907d4ea.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/users/bacb94ef9e652b24cac3fec1decd83f06907d4ea.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/users/user_item.coffee.js.map"
                }
              }
            },
            "/client/views/users/user_list.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/users/user_list.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/views/users/cca03845ed23b6282544a6a887f8003d84486d6a.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/users/cca03845ed23b6282544a6a887f8003d84486d6a.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/users/user_list.coffee.js.map"
                }
              }
            },
            "/client/views/whiteboard/slide.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/whiteboard/slide.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/views/whiteboard/096cabd88485e0b3c892e3d3e9494628c4bed1fc.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/whiteboard/096cabd88485e0b3c892e3d3e9494628c4bed1fc.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/whiteboard/slide.coffee.js.map"
                }
              }
            },
            "/client/views/whiteboard/whiteboard.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/whiteboard/whiteboard.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/views/whiteboard/97eeeb2146232d129953a8b5786b66522237ae16.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/views/whiteboard/97eeeb2146232d129953a8b5786b66522237ae16.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/views/whiteboard/whiteboard.coffee.js.map"
                }
              }
            },
            "/client/compatibility/3rd-party.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/compatibility/3rd-party.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/compatibility/bbb_webrtc_bridge_jssip.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/compatibility/bbb_webrtc_bridge_jssip.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/compatibility/jssip-devel.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/compatibility/jssip-devel.js"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/_whiteboard_tool.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/_whiteboard_tool.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/e8cd0f6d0822c8e46ece22402e61f1c82dcd467f.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/e8cd0f6d0822c8e46ece22402e61f1c82dcd467f.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/_whiteboard_tool.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/utils.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/utils.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/30815bdaed4535dee91c9c784454dcc3fdaf1611.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/30815bdaed4535dee91c9c784454dcc3fdaf1611.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/utils.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_cursor.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_cursor.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/f0b05b8b6ce4f88206eb1ffaf7d0bd4c80f03428.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/f0b05b8b6ce4f88206eb1ffaf7d0bd4c80f03428.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_cursor.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_ellipse.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_ellipse.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/53e478d0e4e4e53245a8922f42c2cd6ba2dada06.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/53e478d0e4e4e53245a8922f42c2cd6ba2dada06.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_ellipse.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_line.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_line.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/e25998467e44091c1ba6270be3ed6a805683f94c.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/e25998467e44091c1ba6270be3ed6a805683f94c.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_line.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_paper.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_paper.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/97139041a47814f8d0c352e5a2aa230be44e6a1f.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/97139041a47814f8d0c352e5a2aa230be44e6a1f.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_paper.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_rect.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_rect.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/fcfbbed69e8737d2625fd7440323d70b0ea72fb5.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/fcfbbed69e8737d2625fd7440323d70b0ea72fb5.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_rect.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_slide.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_slide.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/4caab3fdb13647d2de90e492df9a2606ccb50743.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/4caab3fdb13647d2de90e492df9a2606ccb50743.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_slide.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_text.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_text.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/bfbec6b6bb90908aa73272b42436b63b5f5a4d68.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/bfbec6b6bb90908aa73272b42436b63b5f5a4d68.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_text.coffee.js.map"
                }
              }
            },
            "/client/whiteboard_models/whiteboard_triangle.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_triangle.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/whiteboard_models/e27257ad008631c7d3a0f6e8767af90d950f0372.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/whiteboard_models/e27257ad008631c7d3a0f6e8767af90d950f0372.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/whiteboard_models/whiteboard_triangle.coffee.js.map"
                }
              }
            },
            "/client/globals.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/globals.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/9d1cb0409dee441cb3f10d39864cb371e869c08f.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/9d1cb0409dee441cb3f10d39864cb371e869c08f.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/globals.coffee.js.map"
                }
              }
            },
            "/collections/collections.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/collections/collections.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/collections/4c69974a650f6b785bf2dd2c61983f616367995d.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/collections/4c69974a650f6b785bf2dd2c61983f616367995d.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/collections/collections.coffee.js.map"
                }
              }
            },
            "/config.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/config.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/653c48de372ddf906983d2114c68313fab31a62e.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/653c48de372ddf906983d2114c68313fab31a62e.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/config.coffee.js.map"
                }
              }
            },
            "/client/main.coffee.js": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/main.coffee.js"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/client/316fa7e187474f017fa379447ba2281feab89f43.map"
                },
                "type": {
                  "type": "constant",
                  "value": "js"
                }
              }
            },
            "/client/316fa7e187474f017fa379447ba2281feab89f43.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/app/client/main.coffee.js.map"
                }
              }
            },
            "/846d9887b3fbac424d19c365b460c846a5556ff5.css": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/846d9887b3fbac424d19c365b460c846a5556ff5.css"
                },
                "sourceMapUrl": {
                  "type": "constant",
                  "value": "/846d9887b3fbac424d19c365b460c846a5556ff5.map"
                },
                "type": {
                  "type": "constant",
                  "value": "css"
                }
              }
            },
            "/846d9887b3fbac424d19c365b460c846a5556ff5.map": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/846d9887b3fbac424d19c365b460c846a5556ff5.css.map"
                }
              }
            },
            "/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.eot": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.eot"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.ttf": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.ttf"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.svg": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.svg"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.woff": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.woff"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.eot": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.eot"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.ttf": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.ttf"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.woff": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.woff"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.svg": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.svg"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "/packages/velocity_html-reporter/lib/spinner.gif": {
              "type": "object",
              "members": {
                "absolutePath": {
                  "type": "constant",
                  "value": "/home/firstuser/dev/bigbluebutton/labs/meteor-client/app/.meteor/local/build/programs/web.browser/packages/velocity_html-reporter/lib/spinner.gif"
                },
                "sourceMapUrl": {
                  "type": "undefined"
                },
                "type": {
                  "type": "constant",
                  "value": "asset"
                }
              }
            },
            "manifest.json": {
              "type": "object",
              "members": {
                "content": {
                  "type": "constant",
                  "value": "{\"manifest\":[{\"path\":\"packages/underscore.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/underscore.js?0a80a8623e1b40b5df5a05582f288ddd586eaa18\",\"sourceMap\":\"packages/underscore.js.map\",\"sourceMapUrl\":\"/packages/0a80a8623e1b40b5df5a05582f288ddd586eaa18.map\",\"size\":150686,\"hash\":\"0a80a8623e1b40b5df5a05582f288ddd586eaa18\"},{\"path\":\"packages/meteor.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/meteor.js?907f41ce7b84611715fdacaf42af1d82f4502b5e\",\"sourceMap\":\"packages/meteor.js.map\",\"sourceMapUrl\":\"/packages/907f41ce7b84611715fdacaf42af1d82f4502b5e.map\",\"size\":107421,\"hash\":\"907f41ce7b84611715fdacaf42af1d82f4502b5e\"},{\"path\":\"packages/standard-app-packages.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/standard-app-packages.js?be7072e6abfda638502b63fa0f809c85c8c2b8ed\",\"sourceMap\":\"packages/standard-app-packages.js.map\",\"sourceMapUrl\":\"/packages/be7072e6abfda638502b63fa0f809c85c8c2b8ed.map\",\"size\":1306,\"hash\":\"be7072e6abfda638502b63fa0f809c85c8c2b8ed\"},{\"path\":\"packages/coffeescript.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/coffeescript.js?969f68786bbc68e6cad299e74922a53af3d1404b\",\"sourceMap\":\"packages/coffeescript.js.map\",\"sourceMapUrl\":\"/packages/969f68786bbc68e6cad299e74922a53af3d1404b.map\",\"size\":1294,\"hash\":\"969f68786bbc68e6cad299e74922a53af3d1404b\"},{\"path\":\"packages/mrt_redis.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/mrt_redis.js?ad1f47c073f963478e757dced5ddd71c6b776ea0\",\"sourceMap\":\"packages/mrt_redis.js.map\",\"sourceMapUrl\":\"/packages/ad1f47c073f963478e757dced5ddd71c6b776ea0.map\",\"size\":1352,\"hash\":\"ad1f47c073f963478e757dced5ddd71c6b776ea0\"},{\"path\":\"packages/arunoda_npm.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/arunoda_npm.js?cc804768148cdd033ceb4520a6cb56f8e9657b8d\",\"sourceMap\":\"packages/arunoda_npm.js.map\",\"sourceMapUrl\":\"/packages/cc804768148cdd033ceb4520a6cb56f8e9657b8d.map\",\"size\":1354,\"hash\":\"cc804768148cdd033ceb4520a6cb56f8e9657b8d\"},{\"path\":\"packages/less.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/less.js?7d1bf981a25a449d6270558bcfc983313c40cd26\",\"sourceMap\":\"packages/less.js.map\",\"sourceMapUrl\":\"/packages/7d1bf981a25a449d6270558bcfc983313c40cd26.map\",\"size\":1286,\"hash\":\"7d1bf981a25a449d6270558bcfc983313c40cd26\"},{\"path\":\"packages/jquery.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/jquery.js?265926494aaa3929cd2e30da265211c5929f37a4\",\"sourceMap\":\"packages/jquery.js.map\",\"sourceMapUrl\":\"/packages/265926494aaa3929cd2e30da265211c5929f37a4.map\",\"size\":1295407,\"hash\":\"265926494aaa3929cd2e30da265211c5929f37a4\"},{\"path\":\"packages/amplify.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/amplify.js?0943ecb804169b991257a319fa92b9e6f34e2d1b\",\"sourceMap\":\"packages/amplify.js.map\",\"sourceMapUrl\":\"/packages/0943ecb804169b991257a319fa92b9e6f34e2d1b.map\",\"size\":88428,\"hash\":\"0943ecb804169b991257a319fa92b9e6f34e2d1b\"},{\"path\":\"packages/raphaeljs-package.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/raphaeljs-package.js?bc14730496122df7f88139d4f83db0db50cf83fd\",\"sourceMap\":\"packages/raphaeljs-package.js.map\",\"sourceMapUrl\":\"/packages/bc14730496122df7f88139d4f83db0db50cf83fd.map\",\"size\":1039740,\"hash\":\"bc14730496122df7f88139d4f83db0db50cf83fd\"},{\"path\":\"packages/tracker.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/tracker.js?192a05cc46b867dadbe8bf90dd961f6f8fd1574f\",\"sourceMap\":\"packages/tracker.js.map\",\"sourceMapUrl\":\"/packages/192a05cc46b867dadbe8bf90dd961f6f8fd1574f.map\",\"size\":66854,\"hash\":\"192a05cc46b867dadbe8bf90dd961f6f8fd1574f\"},{\"path\":\"packages/json.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/json.js?e22856eae714c681199eabc5c0710b904b125554\",\"sourceMap\":\"packages/json.js.map\",\"sourceMapUrl\":\"/packages/e22856eae714c681199eabc5c0710b904b125554.map\",\"size\":58343,\"hash\":\"e22856eae714c681199eabc5c0710b904b125554\"},{\"path\":\"packages/base64.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/base64.js?1a63019243b73298e2964e6d4680f25bca657726\",\"sourceMap\":\"packages/base64.js.map\",\"sourceMapUrl\":\"/packages/1a63019243b73298e2964e6d4680f25bca657726.map\",\"size\":15685,\"hash\":\"1a63019243b73298e2964e6d4680f25bca657726\"},{\"path\":\"packages/ejson.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/ejson.js?71047b64b5196348bdbe5fd5eea9ac97a5a9eb14\",\"sourceMap\":\"packages/ejson.js.map\",\"sourceMapUrl\":\"/packages/71047b64b5196348bdbe5fd5eea9ac97a5a9eb14.map\",\"size\":81471,\"hash\":\"71047b64b5196348bdbe5fd5eea9ac97a5a9eb14\"},{\"path\":\"packages/random.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/random.js?fe7b46080c91ce482acf6fc326afbc5b176f0502\",\"sourceMap\":\"packages/random.js.map\",\"sourceMapUrl\":\"/packages/fe7b46080c91ce482acf6fc326afbc5b176f0502.map\",\"size\":24099,\"hash\":\"fe7b46080c91ce482acf6fc326afbc5b176f0502\"},{\"path\":\"packages/id-map.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/id-map.js?9ea6eaae8d74693ce2505a858d9a5e60cf191298\",\"sourceMap\":\"packages/id-map.js.map\",\"sourceMapUrl\":\"/packages/9ea6eaae8d74693ce2505a858d9a5e60cf191298.map\",\"size\":8584,\"hash\":\"9ea6eaae8d74693ce2505a858d9a5e60cf191298\"},{\"path\":\"packages/ordered-dict.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/ordered-dict.js?bf8af2f26c8d96bf8b2e6b407d3ed69f23c2cd37\",\"sourceMap\":\"packages/ordered-dict.js.map\",\"sourceMapUrl\":\"/packages/bf8af2f26c8d96bf8b2e6b407d3ed69f23c2cd37.map\",\"size\":20395,\"hash\":\"bf8af2f26c8d96bf8b2e6b407d3ed69f23c2cd37\"},{\"path\":\"packages/geojson-utils.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/geojson-utils.js?81b79d5cf96d00b4b7a28987debcffb665c17526\",\"sourceMap\":\"packages/geojson-utils.js.map\",\"sourceMapUrl\":\"/packages/81b79d5cf96d00b4b7a28987debcffb665c17526.map\",\"size\":48339,\"hash\":\"81b79d5cf96d00b4b7a28987debcffb665c17526\"},{\"path\":\"packages/minimongo.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/minimongo.js?d08e67b8b9ef5f236184319cc86e6e14b5cf11be\",\"sourceMap\":\"packages/minimongo.js.map\",\"sourceMapUrl\":\"/packages/d08e67b8b9ef5f236184319cc86e6e14b5cf11be.map\",\"size\":427493,\"hash\":\"d08e67b8b9ef5f236184319cc86e6e14b5cf11be\"},{\"path\":\"packages/logging.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/logging.js?07e201b648f16be8435a4f666156995eeda0c750\",\"sourceMap\":\"packages/logging.js.map\",\"sourceMapUrl\":\"/packages/07e201b648f16be8435a4f666156995eeda0c750.map\",\"size\":27996,\"hash\":\"07e201b648f16be8435a4f666156995eeda0c750\"},{\"path\":\"packages/check.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/check.js?803a2be518a0c6c3949e45cf65c4ad627a3d603a\",\"sourceMap\":\"packages/check.js.map\",\"sourceMapUrl\":\"/packages/803a2be518a0c6c3949e45cf65c4ad627a3d603a.map\",\"size\":35207,\"hash\":\"803a2be518a0c6c3949e45cf65c4ad627a3d603a\"},{\"path\":\"packages/retry.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/retry.js?1f1dd2c35d300110fdaba51ce4473583bc3bf031\",\"sourceMap\":\"packages/retry.js.map\",\"sourceMapUrl\":\"/packages/1f1dd2c35d300110fdaba51ce4473583bc3bf031.map\",\"size\":7245,\"hash\":\"1f1dd2c35d300110fdaba51ce4473583bc3bf031\"},{\"path\":\"packages/reload.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/reload.js?da8974b7231dd8c0caccb5f322dcf97329d486d1\",\"sourceMap\":\"packages/reload.js.map\",\"sourceMapUrl\":\"/packages/da8974b7231dd8c0caccb5f322dcf97329d486d1.map\",\"size\":25926,\"hash\":\"da8974b7231dd8c0caccb5f322dcf97329d486d1\"},{\"path\":\"packages/ddp.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/ddp.js?ed3a8b20e91a598de5b24a7c98c5ae4be1c0f9e6\",\"sourceMap\":\"packages/ddp.js.map\",\"sourceMapUrl\":\"/packages/ed3a8b20e91a598de5b24a7c98c5ae4be1c0f9e6.map\",\"size\":617168,\"hash\":\"ed3a8b20e91a598de5b24a7c98c5ae4be1c0f9e6\"},{\"path\":\"packages/follower-livedata.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/follower-livedata.js?74156c6baa89da861fc4ddb58ef158eac71e58e0\",\"sourceMap\":\"packages/follower-livedata.js.map\",\"sourceMapUrl\":\"/packages/74156c6baa89da861fc4ddb58ef158eac71e58e0.map\",\"size\":1490,\"hash\":\"74156c6baa89da861fc4ddb58ef158eac71e58e0\"},{\"path\":\"packages/application-configuration.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/application-configuration.js?dcbf1f0774460fccf098a4c9e8fad4c3a0f2952f\",\"sourceMap\":\"packages/application-configuration.js.map\",\"sourceMapUrl\":\"/packages/dcbf1f0774460fccf098a4c9e8fad4c3a0f2952f.map\",\"size\":1485,\"hash\":\"dcbf1f0774460fccf098a4c9e8fad4c3a0f2952f\"},{\"path\":\"packages/mongo.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/mongo.js?9bc2c5a8b2796fab86b51660ca643e5a49a30c84\",\"sourceMap\":\"packages/mongo.js.map\",\"sourceMapUrl\":\"/packages/9bc2c5a8b2796fab86b51660ca643e5a49a30c84.map\",\"size\":146178,\"hash\":\"9bc2c5a8b2796fab86b51660ca643e5a49a30c84\"},{\"path\":\"packages/reactive-dict.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/reactive-dict.js?6b25309b1f0dcf775b44984324878d6f8ad1abc2\",\"sourceMap\":\"packages/reactive-dict.js.map\",\"sourceMapUrl\":\"/packages/6b25309b1f0dcf775b44984324878d6f8ad1abc2.map\",\"size\":19802,\"hash\":\"6b25309b1f0dcf775b44984324878d6f8ad1abc2\"},{\"path\":\"packages/deps.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/deps.js?504589e1e9585dec8f9f6094e5a87b22de3783a1\",\"sourceMap\":\"packages/deps.js.map\",\"sourceMapUrl\":\"/packages/504589e1e9585dec8f9f6094e5a87b22de3783a1.map\",\"size\":1442,\"hash\":\"504589e1e9585dec8f9f6094e5a87b22de3783a1\"},{\"path\":\"packages/htmljs.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/htmljs.js?539b5fc23cf5e63bc8e324543a1026b138316a8c\",\"sourceMap\":\"packages/htmljs.js.map\",\"sourceMapUrl\":\"/packages/539b5fc23cf5e63bc8e324543a1026b138316a8c.map\",\"size\":110444,\"hash\":\"539b5fc23cf5e63bc8e324543a1026b138316a8c\"},{\"path\":\"packages/observe-sequence.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/observe-sequence.js?2fd807ea171ead273b9e6458607cb226012d9240\",\"sourceMap\":\"packages/observe-sequence.js.map\",\"sourceMapUrl\":\"/packages/2fd807ea171ead273b9e6458607cb226012d9240.map\",\"size\":30271,\"hash\":\"2fd807ea171ead273b9e6458607cb226012d9240\"},{\"path\":\"packages/reactive-var.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/reactive-var.js?20335b7b37165980ddd9f23943b2e5b00aae1cc2\",\"sourceMap\":\"packages/reactive-var.js.map\",\"sourceMapUrl\":\"/packages/20335b7b37165980ddd9f23943b2e5b00aae1cc2.map\",\"size\":13963,\"hash\":\"20335b7b37165980ddd9f23943b2e5b00aae1cc2\"},{\"path\":\"packages/blaze.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/blaze.js?88aac5d3c26b7576ac55bb3afc5324f465757709\",\"sourceMap\":\"packages/blaze.js.map\",\"sourceMapUrl\":\"/packages/88aac5d3c26b7576ac55bb3afc5324f465757709.map\",\"size\":385864,\"hash\":\"88aac5d3c26b7576ac55bb3afc5324f465757709\"},{\"path\":\"packages/templating.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/templating.js?599ba307216da826d8b335332ebcc9a497a369a0\",\"sourceMap\":\"packages/templating.js.map\",\"sourceMapUrl\":\"/packages/599ba307216da826d8b335332ebcc9a497a369a0.map\",\"size\":11910,\"hash\":\"599ba307216da826d8b335332ebcc9a497a369a0\"},{\"path\":\"packages/iron_core.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/iron_core.js?fe41a023a7a6f1ded90b0729437928a8ddccc7d4\",\"sourceMap\":\"packages/iron_core.js.map\",\"sourceMapUrl\":\"/packages/fe41a023a7a6f1ded90b0729437928a8ddccc7d4.map\",\"size\":31679,\"hash\":\"fe41a023a7a6f1ded90b0729437928a8ddccc7d4\"},{\"path\":\"packages/ui.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/ui.js?5a663333fd30f8fd913f110e0ef779e84f67c4b8\",\"sourceMap\":\"packages/ui.js.map\",\"sourceMapUrl\":\"/packages/5a663333fd30f8fd913f110e0ef779e84f67c4b8.map\",\"size\":1529,\"hash\":\"5a663333fd30f8fd913f110e0ef779e84f67c4b8\"},{\"path\":\"packages/iron_dynamic-template.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/iron_dynamic-template.js?32038885cb1dad7957291ffebfffcb7f8cd57d20\",\"sourceMap\":\"packages/iron_dynamic-template.js.map\",\"sourceMapUrl\":\"/packages/32038885cb1dad7957291ffebfffcb7f8cd57d20.map\",\"size\":51775,\"hash\":\"32038885cb1dad7957291ffebfffcb7f8cd57d20\"},{\"path\":\"packages/iron_layout.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/iron_layout.js?080dc95e770e3130757bf6af69fd0abb99573ae4\",\"sourceMap\":\"packages/iron_layout.js.map\",\"sourceMapUrl\":\"/packages/080dc95e770e3130757bf6af69fd0abb99573ae4.map\",\"size\":56973,\"hash\":\"080dc95e770e3130757bf6af69fd0abb99573ae4\"},{\"path\":\"packages/iron_router.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/iron_router.js?da7f2ac81c3fd9daebf49ce9a6980a54caa1dc17\",\"sourceMap\":\"packages/iron_router.js.map\",\"sourceMapUrl\":\"/packages/da7f2ac81c3fd9daebf49ce9a6980a54caa1dc17.map\",\"size\":250621,\"hash\":\"da7f2ac81c3fd9daebf49ce9a6980a54caa1dc17\"},{\"path\":\"packages/mrt_bootstrap-3.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/mrt_bootstrap-3.js?cdd66806fce55191bbb255a2bd50e366b4d2992e\",\"sourceMap\":\"packages/mrt_bootstrap-3.js.map\",\"sourceMapUrl\":\"/packages/cdd66806fce55191bbb255a2bd50e366b4d2992e.map\",\"size\":247093,\"hash\":\"cdd66806fce55191bbb255a2bd50e366b4d2992e\"},{\"path\":\"packages/clubfest_raphael.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/clubfest_raphael.js?3e580f1e963a31d0105df850cd57301426982f30\",\"sourceMap\":\"packages/clubfest_raphael.js.map\",\"sourceMapUrl\":\"/packages/3e580f1e963a31d0105df850cd57301426982f30.map\",\"size\":93434,\"hash\":\"3e580f1e963a31d0105df850cd57301426982f30\"},{\"path\":\"packages/sanjo_jasmine.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/sanjo_jasmine.js?2a812f08e615736fedd44f1d63f780a64163b6ee\",\"sourceMap\":\"packages/sanjo_jasmine.js.map\",\"sourceMapUrl\":\"/packages/2a812f08e615736fedd44f1d63f780a64163b6ee.map\",\"size\":552978,\"hash\":\"2a812f08e615736fedd44f1d63f780a64163b6ee\"},{\"path\":\"packages/url.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/url.js?f267b683007ca477629c166b4bd43499e3122351\",\"sourceMap\":\"packages/url.js.map\",\"sourceMapUrl\":\"/packages/f267b683007ca477629c166b4bd43499e3122351.map\",\"size\":6612,\"hash\":\"f267b683007ca477629c166b4bd43499e3122351\"},{\"path\":\"packages/http.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/http.js?9c5d152169ba9a5a57b6b8ec28e64bbd0d308077\",\"sourceMap\":\"packages/http.js.map\",\"sourceMapUrl\":\"/packages/9c5d152169ba9a5a57b6b8ec28e64bbd0d308077.map\",\"size\":37036,\"hash\":\"9c5d152169ba9a5a57b6b8ec28e64bbd0d308077\"},{\"path\":\"packages/velocity_core.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/velocity_core.js?6ca46c76b400ce620d5a99a1a6edfec60ca0ba1a\",\"sourceMap\":\"packages/velocity_core.js.map\",\"sourceMapUrl\":\"/packages/6ca46c76b400ce620d5a99a1a6edfec60ca0ba1a.map\",\"size\":6854,\"hash\":\"6ca46c76b400ce620d5a99a1a6edfec60ca0ba1a\"},{\"path\":\"packages/velocity_html-reporter.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/velocity_html-reporter.js?92751561da596e9009d1c1baacb9aa21064ce18d\",\"sourceMap\":\"packages/velocity_html-reporter.js.map\",\"sourceMapUrl\":\"/packages/92751561da596e9009d1c1baacb9aa21064ce18d.map\",\"size\":85564,\"hash\":\"92751561da596e9009d1c1baacb9aa21064ce18d\"},{\"path\":\"packages/autoupdate.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/autoupdate.js?c823646e93561d86e6bcb3cbd2457a8540e519c1\",\"sourceMap\":\"packages/autoupdate.js.map\",\"sourceMapUrl\":\"/packages/c823646e93561d86e6bcb3cbd2457a8540e519c1.map\",\"size\":17152,\"hash\":\"c823646e93561d86e6bcb3cbd2457a8540e519c1\"},{\"path\":\"packages/meteor-platform.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/meteor-platform.js?499a2f8522e25820b1153c69a92751ccaae507b3\",\"sourceMap\":\"packages/meteor-platform.js.map\",\"sourceMapUrl\":\"/packages/499a2f8522e25820b1153c69a92751ccaae507b3.map\",\"size\":1384,\"hash\":\"499a2f8522e25820b1153c69a92751ccaae507b3\"},{\"path\":\"packages/webapp.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/webapp.js?e1be090051b82f046484dccc2de7d747e50c7328\",\"sourceMap\":\"packages/webapp.js.map\",\"sourceMapUrl\":\"/packages/e1be090051b82f046484dccc2de7d747e50c7328.map\",\"size\":3106,\"hash\":\"e1be090051b82f046484dccc2de7d747e50c7328\"},{\"path\":\"packages/session.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/session.js?442b1bc169c2a1fb8c1fc5420041baa1ed9cb940\",\"sourceMap\":\"packages/session.js.map\",\"sourceMapUrl\":\"/packages/442b1bc169c2a1fb8c1fc5420041baa1ed9cb940.map\",\"size\":6487,\"hash\":\"442b1bc169c2a1fb8c1fc5420041baa1ed9cb940\"},{\"path\":\"packages/livedata.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/livedata.js?718526445deb4d9baacb6d92c551adea1d36c1e1\",\"sourceMap\":\"packages/livedata.js.map\",\"sourceMapUrl\":\"/packages/718526445deb4d9baacb6d92c551adea1d36c1e1.map\",\"size\":1413,\"hash\":\"718526445deb4d9baacb6d92c551adea1d36c1e1\"},{\"path\":\"packages/spacebars.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/spacebars.js?3c496d2950151d744a8574297b46d2763a123bdf\",\"sourceMap\":\"packages/spacebars.js.map\",\"sourceMapUrl\":\"/packages/3c496d2950151d744a8574297b46d2763a123bdf.map\",\"size\":42134,\"hash\":\"3c496d2950151d744a8574297b46d2763a123bdf\"},{\"path\":\"packages/global-imports.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/packages/global-imports.js?8cc2d48f7c9ef5c4fb97a5e66ee83723e5ee9001\",\"size\":1413,\"hash\":\"8cc2d48f7c9ef5c4fb97a5e66ee83723e5ee9001\"},{\"path\":\"app/client/views/chat/template.chat_bar.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/chat/template.chat_bar.js?d91a84a1ef1cb3e868d5d88c8a085464d35299ba\",\"size\":9136,\"hash\":\"d91a84a1ef1cb3e868d5d88c8a085464d35299ba\"},{\"path\":\"app/client/views/logout/template.logout.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/logout/template.logout.js?de4250a93b8073dbf06a0f65484e0806169270c7\",\"size\":354,\"hash\":\"de4250a93b8073dbf06a0f65484e0806169270c7\"},{\"path\":\"app/client/views/users/template.user_item.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/users/template.user_item.js?add01186f9c603b29d3009aa0bc1178a3d7bf6bc\",\"size\":7212,\"hash\":\"add01186f9c603b29d3009aa0bc1178a3d7bf6bc\"},{\"path\":\"app/client/views/users/template.users_list.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/users/template.users_list.js?2436a8366c144c0c42c4974e6153d32448c038d9\",\"size\":2325,\"hash\":\"2436a8366c144c0c42c4974e6153d32448c038d9\"},{\"path\":\"app/client/views/whiteboard/template.slide.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/whiteboard/template.slide.js?e47b6ab8e1f13e479174bcb1403228d6c75f1797\",\"size\":613,\"hash\":\"e47b6ab8e1f13e479174bcb1403228d6c75f1797\"},{\"path\":\"app/client/views/whiteboard/template.whiteboard.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/whiteboard/template.whiteboard.js?d9ea962db48a830c6570147ceeb0fa17e11112ad\",\"size\":922,\"hash\":\"d9ea962db48a830c6570147ceeb0fa17e11112ad\"},{\"path\":\"app/client/views/template.layout.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/template.layout.js?7436587e40af6f348e3dfef58a1b5dddaffacfa5\",\"size\":201,\"hash\":\"7436587e40af6f348e3dfef58a1b5dddaffacfa5\"},{\"path\":\"app/client/views/template.sharedTemplates.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/template.sharedTemplates.js?6fb572556db45aeb9f37f3b4aae3e11eca163f39\",\"size\":2124,\"hash\":\"6fb572556db45aeb9f37f3b4aae3e11eca163f39\"},{\"path\":\"app/client/template.main.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/template.main.js?198525dddab40de2a9149f41ca47ac6acdcacf4f\",\"size\":13913,\"hash\":\"198525dddab40de2a9149f41ca47ac6acdcacf4f\"},{\"path\":\"app/client/lib/scale.raphael.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/lib/scale.raphael.js?bf02a22d3e477eac181876d083f70fe047788b2b\",\"size\":3261,\"hash\":\"bf02a22d3e477eac181876d083f70fe047788b2b\"},{\"path\":\"app/lib/router.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/lib/router.coffee.js?5edb44e2058bb5e36b68781159c8c2efbbe0e571\",\"sourceMap\":\"app/lib/router.coffee.js.map\",\"sourceMapUrl\":\"/lib/5edb44e2058bb5e36b68781159c8c2efbbe0e571.map\",\"size\":2509,\"hash\":\"5edb44e2058bb5e36b68781159c8c2efbbe0e571\"},{\"path\":\"app/client/views/chat/chat_bar.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/chat/chat_bar.coffee.js?1e4cf97ed470946c74199863240788a9db4048d5\",\"sourceMap\":\"app/client/views/chat/chat_bar.coffee.js.map\",\"sourceMapUrl\":\"/client/views/chat/1e4cf97ed470946c74199863240788a9db4048d5.map\",\"size\":9417,\"hash\":\"1e4cf97ed470946c74199863240788a9db4048d5\"},{\"path\":\"app/client/views/users/user_item.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/users/user_item.coffee.js?bacb94ef9e652b24cac3fec1decd83f06907d4ea\",\"sourceMap\":\"app/client/views/users/user_item.coffee.js.map\",\"sourceMapUrl\":\"/client/views/users/bacb94ef9e652b24cac3fec1decd83f06907d4ea.map\",\"size\":479,\"hash\":\"bacb94ef9e652b24cac3fec1decd83f06907d4ea\"},{\"path\":\"app/client/views/users/user_list.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/users/user_list.coffee.js?cca03845ed23b6282544a6a887f8003d84486d6a\",\"sourceMap\":\"app/client/views/users/user_list.coffee.js.map\",\"sourceMapUrl\":\"/client/views/users/cca03845ed23b6282544a6a887f8003d84486d6a.map\",\"size\":250,\"hash\":\"cca03845ed23b6282544a6a887f8003d84486d6a\"},{\"path\":\"app/client/views/whiteboard/slide.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/whiteboard/slide.coffee.js?096cabd88485e0b3c892e3d3e9494628c4bed1fc\",\"sourceMap\":\"app/client/views/whiteboard/slide.coffee.js.map\",\"sourceMapUrl\":\"/client/views/whiteboard/096cabd88485e0b3c892e3d3e9494628c4bed1fc.map\",\"size\":4569,\"hash\":\"096cabd88485e0b3c892e3d3e9494628c4bed1fc\"},{\"path\":\"app/client/views/whiteboard/whiteboard.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/views/whiteboard/whiteboard.coffee.js?97eeeb2146232d129953a8b5786b66522237ae16\",\"sourceMap\":\"app/client/views/whiteboard/whiteboard.coffee.js.map\",\"sourceMapUrl\":\"/client/views/whiteboard/97eeeb2146232d129953a8b5786b66522237ae16.map\",\"size\":1840,\"hash\":\"97eeeb2146232d129953a8b5786b66522237ae16\"},{\"path\":\"app/client/compatibility/3rd-party.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/compatibility/3rd-party.js?90a11e8bd20ffd91f41b5501e3c00bb90f9caa70\",\"size\":12917,\"hash\":\"90a11e8bd20ffd91f41b5501e3c00bb90f9caa70\"},{\"path\":\"app/client/compatibility/bbb_webrtc_bridge_jssip.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/compatibility/bbb_webrtc_bridge_jssip.js?e0905f42e7dd81c148cad85f001be1edbd178751\",\"size\":4143,\"hash\":\"e0905f42e7dd81c148cad85f001be1edbd178751\"},{\"path\":\"app/client/compatibility/jssip-devel.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/compatibility/jssip-devel.js?8150876584f8b4e7a7c84af99cc43f37302c9625\",\"size\":597991,\"hash\":\"8150876584f8b4e7a7c84af99cc43f37302c9625\"},{\"path\":\"app/client/whiteboard_models/_whiteboard_tool.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/_whiteboard_tool.coffee.js?e8cd0f6d0822c8e46ece22402e61f1c82dcd467f\",\"sourceMap\":\"app/client/whiteboard_models/_whiteboard_tool.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/e8cd0f6d0822c8e46ece22402e61f1c82dcd467f.map\",\"size\":1101,\"hash\":\"e8cd0f6d0822c8e46ece22402e61f1c82dcd467f\"},{\"path\":\"app/client/whiteboard_models/utils.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/utils.coffee.js?30815bdaed4535dee91c9c784454dcc3fdaf1611\",\"sourceMap\":\"app/client/whiteboard_models/utils.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/30815bdaed4535dee91c9c784454dcc3fdaf1611.map\",\"size\":703,\"hash\":\"30815bdaed4535dee91c9c784454dcc3fdaf1611\"},{\"path\":\"app/client/whiteboard_models/whiteboard_cursor.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_cursor.coffee.js?f0b05b8b6ce4f88206eb1ffaf7d0bd4c80f03428\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_cursor.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/f0b05b8b6ce4f88206eb1ffaf7d0bd4c80f03428.map\",\"size\":2169,\"hash\":\"f0b05b8b6ce4f88206eb1ffaf7d0bd4c80f03428\"},{\"path\":\"app/client/whiteboard_models/whiteboard_ellipse.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_ellipse.coffee.js?53e478d0e4e4e53245a8922f42c2cd6ba2dada06\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_ellipse.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/53e478d0e4e4e53245a8922f42c2cd6ba2dada06.map\",\"size\":3498,\"hash\":\"53e478d0e4e4e53245a8922f42c2cd6ba2dada06\"},{\"path\":\"app/client/whiteboard_models/whiteboard_line.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_line.coffee.js?e25998467e44091c1ba6270be3ed6a805683f94c\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_line.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/e25998467e44091c1ba6270be3ed6a805683f94c.map\",\"size\":3533,\"hash\":\"e25998467e44091c1ba6270be3ed6a805683f94c\"},{\"path\":\"app/client/whiteboard_models/whiteboard_paper.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_paper.coffee.js?97139041a47814f8d0c352e5a2aa230be44e6a1f\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_paper.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/97139041a47814f8d0c352e5a2aa230be44e6a1f.map\",\"size\":21247,\"hash\":\"97139041a47814f8d0c352e5a2aa230be44e6a1f\"},{\"path\":\"app/client/whiteboard_models/whiteboard_rect.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_rect.coffee.js?fcfbbed69e8737d2625fd7440323d70b0ea72fb5\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_rect.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/fcfbbed69e8737d2625fd7440323d70b0ea72fb5.map\",\"size\":3543,\"hash\":\"fcfbbed69e8737d2625fd7440323d70b0ea72fb5\"},{\"path\":\"app/client/whiteboard_models/whiteboard_slide.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_slide.coffee.js?4caab3fdb13647d2de90e492df9a2606ccb50743\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_slide.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/4caab3fdb13647d2de90e492df9a2606ccb50743.map\",\"size\":1507,\"hash\":\"4caab3fdb13647d2de90e492df9a2606ccb50743\"},{\"path\":\"app/client/whiteboard_models/whiteboard_text.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_text.coffee.js?bfbec6b6bb90908aa73272b42436b63b5f5a4d68\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_text.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/bfbec6b6bb90908aa73272b42436b63b5f5a4d68.map\",\"size\":5664,\"hash\":\"bfbec6b6bb90908aa73272b42436b63b5f5a4d68\"},{\"path\":\"app/client/whiteboard_models/whiteboard_triangle.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/whiteboard_models/whiteboard_triangle.coffee.js?e27257ad008631c7d3a0f6e8767af90d950f0372\",\"sourceMap\":\"app/client/whiteboard_models/whiteboard_triangle.coffee.js.map\",\"sourceMapUrl\":\"/client/whiteboard_models/e27257ad008631c7d3a0f6e8767af90d950f0372.map\",\"size\":4468,\"hash\":\"e27257ad008631c7d3a0f6e8767af90d950f0372\"},{\"path\":\"app/client/globals.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/globals.coffee.js?9d1cb0409dee441cb3f10d39864cb371e869c08f\",\"sourceMap\":\"app/client/globals.coffee.js.map\",\"sourceMapUrl\":\"/client/9d1cb0409dee441cb3f10d39864cb371e869c08f.map\",\"size\":12835,\"hash\":\"9d1cb0409dee441cb3f10d39864cb371e869c08f\"},{\"path\":\"app/collections/collections.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/collections/collections.coffee.js?4c69974a650f6b785bf2dd2c61983f616367995d\",\"sourceMap\":\"app/collections/collections.coffee.js.map\",\"sourceMapUrl\":\"/collections/4c69974a650f6b785bf2dd2c61983f616367995d.map\",\"size\":461,\"hash\":\"4c69974a650f6b785bf2dd2c61983f616367995d\"},{\"path\":\"app/config.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/config.coffee.js?653c48de372ddf906983d2114c68313fab31a62e\",\"sourceMap\":\"app/config.coffee.js.map\",\"sourceMapUrl\":\"/653c48de372ddf906983d2114c68313fab31a62e.map\",\"size\":1456,\"hash\":\"653c48de372ddf906983d2114c68313fab31a62e\"},{\"path\":\"app/client/main.coffee.js\",\"where\":\"client\",\"type\":\"js\",\"cacheable\":true,\"url\":\"/client/main.coffee.js?316fa7e187474f017fa379447ba2281feab89f43\",\"sourceMap\":\"app/client/main.coffee.js.map\",\"sourceMapUrl\":\"/client/316fa7e187474f017fa379447ba2281feab89f43.map\",\"size\":3758,\"hash\":\"316fa7e187474f017fa379447ba2281feab89f43\"},{\"path\":\"846d9887b3fbac424d19c365b460c846a5556ff5.css\",\"where\":\"client\",\"type\":\"css\",\"cacheable\":true,\"url\":\"/846d9887b3fbac424d19c365b460c846a5556ff5.css\",\"sourceMap\":\"846d9887b3fbac424d19c365b460c846a5556ff5.css.map\",\"sourceMapUrl\":\"/846d9887b3fbac424d19c365b460c846a5556ff5.map\",\"size\":247250,\"hash\":\"846d9887b3fbac424d19c365b460c846a5556ff5\"},{\"path\":\"packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.eot\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.eot\",\"size\":20290,\"hash\":\"23799c0aa7b60fb1a66993d024f98ac105e74e93\"},{\"path\":\"packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.ttf\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.ttf\",\"size\":41236,\"hash\":\"536d2b1b2f3462fb122df1922f2e232546f1b11d\"},{\"path\":\"packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.svg\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.svg\",\"size\":62850,\"hash\":\"ecee9033d9183117d8f59df0e7238e2b24002b24\"},{\"path\":\"packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.woff\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/mrt_bootstrap-3/bootstrap-3/fonts/glyphicons-halflings-regular.woff\",\"size\":23292,\"hash\":\"c6ea7b1a5bb16b160cc9b8a02f6f6371b5ef7b73\"},{\"path\":\"packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.eot\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.eot\",\"size\":14079,\"hash\":\"d53dff38dfb5c414015dfb31d30a473c95b50904\"},{\"path\":\"packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.ttf\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.ttf\",\"size\":29512,\"hash\":\"c427041d38cd6597ae7e758028ab72756849ec26\"},{\"path\":\"packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.woff\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.woff\",\"size\":16448,\"hash\":\"c707207e52ffe555a36880e9873d146c226e3533\"},{\"path\":\"packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.svg\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/velocity_html-reporter/lib/bootstrap/src/fonts/glyphicons-halflings-regular.svg\",\"size\":63157,\"hash\":\"796e58aedfcfe8a3b0829bc0594f739936a9d7d0\"},{\"path\":\"packages/velocity_html-reporter/lib/spinner.gif\",\"where\":\"client\",\"type\":\"asset\",\"cacheable\":false,\"url\":\"/packages/velocity_html-reporter/lib/spinner.gif\",\"size\":1849,\"hash\":\"dcabdd743fd3e9d7bd5647abeb86e66a3e6f9597\"}],\"version\":\"ef66efb2044d4823288eb877b0709d7f7b2ee486\"}"
                },
                "type": {
                  "type": "constant",
                  "value": "json"
                }
              }
            }
          }
        },
        "inlineScriptsAllowed": {
          "type": "function"
        },
        "setInlineScriptsAllowed": {
          "type": "function"
        },
        "setBundledJsCssPrefix": {
          "type": "function"
        },
        "addStaticJs": {
          "type": "function"
        },
        "getBoilerplate": {
          "type": "function"
        },
        "additionalStaticJs": {
          "type": "object"
        },
        "validPid": {
          "type": "function"
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
  "follower-livedata": {
    "Follower": {
      "type": "object",
      "members": {
        "connect": {
          "type": "function"
        }
      }
    }
  },
  "application-configuration": {
    "AppConfig": {
      "type": "object",
      "members": {
        "findGalaxy": {
          "type": "function"
        },
        "getAppConfig": {
          "type": "function"
        },
        "getStarForThisJob": {
          "type": "function"
        },
        "configurePackage": {
          "type": "function"
        },
        "configureService": {
          "type": "function"
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
            }
          }
        },
        "DynamicTemplate": {
          "type": "function",
          "members": {
            "getParentDataContext": {
              "type": "function",
              "refID": 29
            },
            "getInclusionArguments": {
              "type": "function",
              "refID": 31
            },
            "args": {
              "type": "function",
              "refID": 33
            },
            "extend": {
              "type": "function",
              "refID": 35
            },
            "prototype": {
              "type": "object",
              "members": {
                "template": {
                  "type": "function",
                  "refID": 38
                },
                "defaultTemplate": {
                  "type": "function",
                  "refID": 40
                },
                "clear": {
                  "type": "function"
                },
                "data": {
                  "type": "function",
                  "refID": 44
                },
                "create": {
                  "type": "function",
                  "refID": 46
                },
                "destroy": {
                  "type": "function",
                  "refID": 48
                },
                "onViewCreated": {
                  "type": "function",
                  "refID": 50
                },
                "onViewReady": {
                  "type": "function",
                  "refID": 52
                },
                "onViewDestroyed": {
                  "type": "function",
                  "refID": 54
                },
                "insert": {
                  "type": "function",
                  "refID": 56
                },
                "getController": {
                  "type": "function",
                  "refID": 58
                },
                "setController": {
                  "type": "function",
                  "refID": 60
                },
                "hasController": {
                  "type": "function",
                  "refID": 62
                }
              }
            }
          }
        },
        "Layout": {
          "type": "function",
          "refID": 64,
          "members": {
            "DEFAULT_REGION": {
              "type": "constant",
              "value": "main"
            },
            "getParentDataContext": {
              "ref": 29
            },
            "getInclusionArguments": {
              "ref": 31
            },
            "args": {
              "ref": 33
            },
            "extend": {
              "ref": 35
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 64
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
                  "ref": 38
                },
                "defaultTemplate": {
                  "ref": 40
                },
                "data": {
                  "ref": 44
                },
                "create": {
                  "ref": 46
                },
                "destroy": {
                  "ref": 48
                },
                "onViewCreated": {
                  "ref": 50
                },
                "onViewReady": {
                  "ref": 52
                },
                "onViewDestroyed": {
                  "ref": 54
                },
                "insert": {
                  "ref": 56
                },
                "getController": {
                  "ref": 58
                },
                "setController": {
                  "ref": 60
                },
                "hasController": {
                  "ref": 62
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
  "iron:router": {
    "RouteController": {
      "type": "function",
      "refID": 0,
      "members": {
        "extend": {
          "type": "function"
        },
        "prototype": {
          "type": "object",
          "members": {
            "constructor": {
              "ref": 0
            },
            "action": {
              "type": "function"
            },
            "lookupProperty": {
              "type": "function"
            },
            "runHooks": {
              "type": "function"
            },
            "stop": {
              "type": "function"
            }
          }
        }
      }
    },
    "Route": {
      "type": "function",
      "refID": 0,
      "members": {
        "prototype": {
          "type": "object",
          "members": {
            "constructor": {
              "ref": 0
            },
            "compile": {
              "type": "function"
            },
            "params": {
              "type": "function"
            },
            "normalizePath": {
              "type": "function"
            },
            "test": {
              "type": "function"
            },
            "exec": {
              "type": "function"
            },
            "resolve": {
              "type": "function"
            },
            "path": {
              "type": "function"
            },
            "url": {
              "type": "function"
            },
            "findController": {
              "type": "function"
            },
            "newController": {
              "type": "function"
            },
            "getController": {
              "type": "function"
            }
          }
        }
      }
    },
    "Router": {
      "type": "object",
      "members": {
        "options": {
          "type": "object",
          "members": {
            "layoutTemplate": {
              "type": "constant",
              "value": "layout"
            }
          }
        },
        "routes": {
          "type": "array"
        },
        "onRun": {
          "type": "function"
        },
        "onData": {
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
        "constructor": {
          "type": "function",
          "refID": 23,
          "members": {
            "HOOK_TYPES": {
              "type": "array"
            },
            "LEGACY_HOOK_TYPES": {
              "type": "object",
              "members": {
                "load": {
                  "type": "constant",
                  "value": "onRun"
                },
                "before": {
                  "type": "constant",
                  "value": "onBeforeAction"
                },
                "after": {
                  "type": "constant",
                  "value": "onAfterAction"
                },
                "unload": {
                  "type": "constant",
                  "value": "onStop"
                }
              }
            },
            "prototype": {
              "type": "object",
              "members": {
                "constructor": {
                  "ref": 23
                },
                "start": {
                  "type": "function",
                  "refID": 27
                },
                "onRequest": {
                  "type": "function",
                  "refID": 29
                },
                "run": {
                  "type": "function",
                  "refID": 31
                },
                "stop": {
                  "type": "function",
                  "refID": 33
                },
                "onUnhandled": {
                  "type": "function",
                  "refID": 35
                },
                "onRouteNotFound": {
                  "type": "function",
                  "refID": 37
                },
                "configure": {
                  "type": "function",
                  "refID": 39
                },
                "convertTemplateName": {
                  "type": "function",
                  "refID": 41
                },
                "convertRouteControllerName": {
                  "type": "function",
                  "refID": 43
                },
                "setNameConverter": {
                  "type": "function",
                  "refID": 45
                },
                "addHook": {
                  "type": "function",
                  "refID": 47
                },
                "getHooks": {
                  "type": "function",
                  "refID": 49
                },
                "map": {
                  "type": "function",
                  "refID": 51
                },
                "route": {
                  "type": "function",
                  "refID": 53
                },
                "path": {
                  "type": "function",
                  "refID": 55
                },
                "url": {
                  "type": "function",
                  "refID": 57
                },
                "match": {
                  "type": "function",
                  "refID": 59
                },
                "dispatch": {
                  "type": "function",
                  "refID": 61
                }
              }
            }
          }
        },
        "start": {
          "ref": 27
        },
        "onRequest": {
          "ref": 29
        },
        "run": {
          "ref": 31
        },
        "stop": {
          "ref": 33
        },
        "onUnhandled": {
          "ref": 35
        },
        "onRouteNotFound": {
          "ref": 37
        },
        "configure": {
          "ref": 39
        },
        "convertTemplateName": {
          "ref": 41
        },
        "convertRouteControllerName": {
          "ref": 43
        },
        "setNameConverter": {
          "ref": 45
        },
        "addHook": {
          "ref": 47
        },
        "getHooks": {
          "ref": 49
        },
        "map": {
          "ref": 51
        },
        "route": {
          "ref": 53
        },
        "path": {
          "ref": 55
        },
        "url": {
          "ref": 57
        },
        "match": {
          "ref": 59
        },
        "dispatch": {
          "ref": 61
        }
      }
    },
    "Utils": {
      "type": "object",
      "members": {
        "assert": {
          "type": "function"
        },
        "warn": {
          "type": "function"
        },
        "notifyDeprecated": {
          "type": "function"
        },
        "withDeprecatedNotice": {
          "type": "function"
        },
        "resolveValue": {
          "type": "function"
        },
        "hasOwnProperty": {
          "type": "function"
        },
        "inherits": {
          "type": "function"
        },
        "toArray": {
          "type": "function"
        },
        "typeOf": {
          "type": "function"
        },
        "extend": {
          "type": "function"
        },
        "create": {
          "type": "function"
        },
        "capitalize": {
          "type": "function"
        },
        "upperCamelCase": {
          "type": "function"
        },
        "camelCase": {
          "type": "function"
        },
        "pick": {
          "type": "function"
        },
        "StringConverters": {
          "type": "object",
          "members": {
            "none": {
              "type": "function"
            },
            "upperCamelCase": {
              "type": "function"
            },
            "camelCase": {
              "type": "function"
            }
          }
        },
        "rewriteLegacyHooks": {
          "type": "function"
        }
      }
    },
    "IronRouter": {
      "type": "function",
      "refID": 0,
      "members": {
        "HOOK_TYPES": {
          "type": "array"
        },
        "LEGACY_HOOK_TYPES": {
          "type": "object",
          "members": {
            "load": {
              "type": "constant",
              "value": "onRun"
            },
            "before": {
              "type": "constant",
              "value": "onBeforeAction"
            },
            "after": {
              "type": "constant",
              "value": "onAfterAction"
            },
            "unload": {
              "type": "constant",
              "value": "onStop"
            }
          }
        },
        "prototype": {
          "type": "object",
          "members": {
            "constructor": {
              "ref": 0
            },
            "start": {
              "type": "function"
            },
            "onRequest": {
              "type": "function"
            },
            "run": {
              "type": "function"
            },
            "stop": {
              "type": "function"
            },
            "onUnhandled": {
              "type": "function"
            },
            "onRouteNotFound": {
              "type": "function"
            },
            "configure": {
              "type": "function"
            },
            "convertTemplateName": {
              "type": "function"
            },
            "convertRouteControllerName": {
              "type": "function"
            },
            "setNameConverter": {
              "type": "function"
            },
            "addHook": {
              "type": "function"
            },
            "getHooks": {
              "type": "function"
            },
            "map": {
              "type": "function"
            },
            "route": {
              "type": "function"
            },
            "path": {
              "type": "function"
            },
            "url": {
              "type": "function"
            },
            "match": {
              "type": "function"
            },
            "dispatch": {
              "type": "function"
            }
          }
        }
      }
    }
  },
  "mrt:bootstrap-3": {},
  "clubfest:raphael": {
    "Raphael": {
      "type": "undefined"
    }
  },
  "url": {
    "URL": {
      "type": "object"
    }
  },
  "http": {
    "HTTP": {
      "type": "object",
      "members": {
        "get": {
          "type": "function"
        },
        "post": {
          "type": "function"
        },
        "put": {
          "type": "function"
        },
        "del": {
          "type": "function"
        },
        "call": {
          "type": "function"
        }
      }
    }
  },
  "velocity:core": {
    "Velocity": {
      "type": "object",
      "members": {
        "getMirrorPath": {
          "type": "function"
        },
        "getTestsPath": {
          "type": "function"
        },
        "addPreProcessor": {
          "type": "function"
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
        "parseXmlFiles": {
          "type": "function"
        },
        "FileCopier": {
          "type": "function",
          "members": {
            "prototype": {
              "type": "object",
              "members": {
                "start": {
                  "type": "function"
                },
                "stop": {
                  "type": "function"
                }
              }
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
        "allow": {
          "type": "function"
        },
        "deny": {
          "type": "function"
        }
      }
    }
  },
  "alanning:package-stubber": {
    "PackageStubber": {
      "type": "object",
      "members": {
        "functionReplacementStr": {
          "type": "constant",
          "value": "function emptyFn () {}"
        },
        "validate": {
          "type": "object",
          "members": {
            "stubPackages": {
              "type": "function"
            },
            "deepCopyReplaceFn": {
              "type": "function"
            }
          }
        },
        "stubPackages": {
          "type": "function"
        },
        "listTestPackages": {
          "type": "function"
        },
        "listPackages": {
          "type": "function"
        },
        "listPackageExports": {
          "type": "function"
        },
        "deepCopyReplaceFn": {
          "type": "function"
        },
        "shouldIgnorePackage": {
          "type": "function"
        },
        "replaceFnPlaceholders": {
          "type": "function"
        },
        "stubGenerators": {
          "type": "object",
          "members": {
            "function": {
              "type": "function"
            },
            "object": {
              "type": "function"
            },
            "string": {
              "type": "function"
            },
            "number": {
              "type": "function"
            },
            "undefined": {
              "type": "function"
            }
          }
        },
        "generateStubJsCode": {
          "type": "function"
        }
      }
    }
  },
  "sanjo:jasmine": {},
  "velocity:html-reporter": {},
  "reload": {},
  "autoupdate": {
    "Autoupdate": {
      "type": "object",
      "members": {
        "autoupdateVersion": {
          "type": "null",
          "value": null
        },
        "autoupdateVersionRefreshable": {
          "type": "null",
          "value": null
        },
        "autoupdateVersionCordova": {
          "type": "null",
          "value": null
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
  }
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
