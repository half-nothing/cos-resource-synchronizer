import {FileUtils} from "./utils/file_utils";
import {logger} from "./logger";
import {readFileSync, writeFileSync} from "fs";
import checkDirExist = FileUtils.checkDirExist;
import checkFileExist = FileUtils.checkFileExist;

if (!checkDirExist("config", true)) {
    logger.error("Config dir not exist, create and exit");
    process.exit(-1);
}

if (!checkDirExist("config/default", true)) {
    logger.error("Default config dir not exist, create and exit");
    process.exit(-1);
}

function checkConfigFile(fileName: string): boolean {
    if (!checkFileExist(`config/${fileName}`)) {
        logger.error(`${fileName} not found, check default config file.`);
        if (!checkFileExist(`config/default/${fileName}`)) {
            logger.error(`${fileName} default file not exist, please download from github, exit process.`);
            process.exit(-1);
        }
        writeFileSync(`config/${fileName}`,
            readFileSync(`config/default/${fileName}`, {encoding: "utf-8"}),
            {encoding: "utf-8"})
        logger.info(`Copy ${fileName} successfully, please edit config file.`);
        return false;
    }
    logger.debug(`${fileName} checked.`);
    return true;
}

if (checkConfigFile("CosConfig.json") &&
    checkConfigFile("ServerConfig.json") &&
    checkConfigFile("SyncConfig.json")) {
    process.exit(-1);
}

export namespace Config {
    export const cosConfig = require("../config/CosConfig.json")
    export const serverConfig = require("../config/ServerConfig.json")
    export const syncConfig = require("../config/SyncConfig.json")
}