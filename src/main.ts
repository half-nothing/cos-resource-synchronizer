import express from "express";
import {NextFunction, Response, Request} from "express";
import {connectionLogger, logger} from "./logger";
import process from "node:process";
import log4js from "log4js";
import {NetUtils} from "./utils/net_utils";
import fs from "fs";
import https from "https";
import http from "http";
import {Config} from "./config";
import {FileUtils} from "./utils/file_utils";

import enableHSTS = NetUtils.enableHSTS;
import checkFileExist = FileUtils.checkFileExist;
import serverConfig = Config.serverConfig;

const app = express();
process.on('exit', (code) => {
    if (code === 0) {
        logger.info(`About to exit with code: ${code}`);
    } else {
        logger.error(`About to exit with code: ${code}`);
    }
    log4js.shutdown();
});

process.on('SIGINT', () => {
    process.exit(-1);
});

process.on('uncaughtException', (err: Error) => {
    logger.error("UncaughtException: " + err.message);
});

process.on('unhandledRejection', (err: Error, _) => {
    logger.error("UnhandledRejection: " + err.message);
});

app.set('trust proxy', true);
app.use(connectionLogger);

app.use((req, res, next) => {
    enableHSTS(res);
    logger.info(`[${req.protocol}] Client request ${req.path} from ${req.ip}`);
    next();
});

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('*', (req, res) => {
    res.json({"message": "test"});
});

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
    logger.error(`Server Error! ${err.message}`);
    res.status(500);
    res.send("Server Error!")
});

const port = serverConfig.port;

if (serverConfig.https.enable) {
    if (!checkFileExist(serverConfig.https.keyPath)) {
        logger.error("Can not find certificate key.");
        process.exit(-1);
    }
    if (!checkFileExist(serverConfig.https.crtPath)){
        logger.error("Can not find certificate crt.");
        process.exit(-1);
    }
    https.createServer({
        key: fs.readFileSync(serverConfig.https.keyPath),
        cert: fs.readFileSync(serverConfig.https.crtPath)
    }, app).listen(port);
    logger.info(`Server running at https://0.0.0.0${port === 443 ? "" : ":" + port}/`);
} else {
    http.createServer(app).listen(port);
    if (serverConfig.https.enableHSTS) {
        logger.error(`If you want to enable HSTS, please enable HTTPS first`);
        process.exit(-1)
    }
    logger.info(`Server running at http://0.0.0.0${port === 80 ? "" : ":" + port}/`);
}