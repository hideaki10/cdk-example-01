import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CdkSample01Stack } from '../lib/cdk-sample-01-stack';
import { assert } from 'console';
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Version } from 'aws-cdk-lib/aws-lambda';

function getTestAssets(): { app: cdk.App, stack: cdk.Stack } {
    const app = new cdk.App();
    const stack = new CdkSample01Stack(app, 'MyTestStack');
    return { app, stack }
}

describe(
    'S3 Bucket Created', () => {
        const { app, stack } = getTestAssets();
        const template = Template.fromStack(stack);
        test('Has correct properties', () => {
            template.hasResourceProperties('AWS::S3::Bucket',
                Match.objectLike({
                    BucketEncryption: {
                        ServerSideEncryptionConfiguration: [
                            {
                                ServerSideEncryptionByDefault: {
                                    SSEAlgorithm: 'AES256'
                                }
                            }
                        ]
                    }
                })
            )

        })
    }
)
