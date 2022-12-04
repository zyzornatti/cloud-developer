import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET
export default class AttachmentUtils {
    constructor(
        private s3 = new XAWS.S3({ signatureVersion: 'v4' })
    ) { }

    getBucketName(): string {
        return bucketName;
    }

    getPresignedUploadURL(bucketName: string, key: string, urlExpiration: number) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: key,
            Expires: urlExpiration
        })
    }
}