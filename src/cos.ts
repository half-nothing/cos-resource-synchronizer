import COS from 'cos-nodejs-sdk-v5';
import {Config} from "./config";

export namespace Cos {

    import cosConfig = Config.cosConfig;
    export const cos = new COS({
        ...cosConfig.secretConfig
    });

    export function uploadFile(localPath: string, remotePath: string,
                               bucketName: string = cosConfig.Bucket.Bucket,
                               regionName: string = cosConfig.Bucket.Region): Promise<COS.UploadFileResult> {
        return cos.uploadFile({
            Bucket: bucketName,
            Region: regionName,
            Key: remotePath,
            FilePath: localPath
        });
    }
}
