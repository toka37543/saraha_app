import express from 'express';
import mongoose from "mongoose";
import config from './config.js'
import routes from "./routes.js";
import errorHandler from "./middelwares/error handler.js";

const app = express();
await mongoose.connect(config.mongodb);

app.use(express.json());
app.use(routes);
app.use(errorHandler)

app.use((error,req,res,next) => {
    if (error) {
        res.status(error.code || 500).json({
            status: "error",
            message: error.message  ,
        })
    }
})

app.listen(config.port, () => {
    console.log("Listening on port: " + config.port);
})