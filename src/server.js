import express from 'express';
import mongoose from "mongoose";
import config from './config.js'
import routes from "./routes.js";
import {redisClient} from "./common/redis.js";
import errorHandler, {notFoundHandler} from "./middelwares/error handler.js";

const app = express();
await mongoose.connect(config.mongodb);
await redisClient.connect();

app.use(express.json());
// uploaded files (profile photos), nosniff so the browser never treats them as anything but their content type
app.use("/uploads", express.static("uploads", {
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff")
}));

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler)

app.listen(config.port, () => {
    console.log("Listening on port: " + config.port);
})
