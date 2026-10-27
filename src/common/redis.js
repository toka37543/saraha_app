import {createClient} from "redis";
import config from "../config.js";

export const redisClient = createClient({
    url: config.redisUrl
});

redisClient.on("error", (error) => {
    console.error("Redis error:", error);
});

export const RedisService = {
    get: async (key) => {
        return await redisClient.get(key);
    },
    // ttl in seconds, key is removed automatically by redis when it expires
    set: async ({key, value, ttl}) => {
        const options = ttl ? {expiration: {type: "EX", value: ttl}} : undefined;
        return await redisClient.set(key, value, options);
    },
    del: async (key) => {
        return await redisClient.del(key);
    },
    ttl: async (key) => {
        return await redisClient.ttl(key);
    },
    expire: async (key, seconds) => {
        return await redisClient.expire(key, seconds);
    },
    // seconds left until the given unix timestamp (jwt "exp")
    calculateTTL: (expiration) => {
        const currentTime = Math.floor(Date.now() / 1000);
        return expiration - currentTime;
    }
}
