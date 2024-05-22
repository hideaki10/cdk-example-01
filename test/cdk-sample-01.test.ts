import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CdkSample01Stack } from '../lib/cdk-sample-01-stack';
import { assert } from 'console';
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Version } from 'aws-cdk-lib/aws-lambda';
import { BackupPlan } from 'aws-cdk-lib/aws-backup';

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
                    },
                    VersioningConfiguration: {
                        Status: 'Enabled'
                    },
                    //ensure the pulic access property is not able
                    PublicReadAccess: Match.absent()
                }),

            )
            template.resourceCountIs('AWS::S3::Bucket', 1);
        })
    }
)

describe(
    'Backup Vault Configuration', () => {
        const { stack } = getTestAssets();
        const template = Template.fromStack(stack);
        test('Backup Valut is created with Has correct properties', () => {
            template.hasResourceProperties('AWS::Backup::BackupVault',
                {
                    BackupVaultName: 'aws-backup-s3-sample-01-backup-vault'
                }
            )
            template.resourceCountIs('AWS::Backup::BackupVault', 1);
        })
    }
)

describe(
    'Backup Plan Configuration', () => {
        const { stack } = getTestAssets();
        const template = Template.fromStack(stack);
        test('Backup Valut is created with Has correct properties', () => {
            template.hasResourceProperties('AWS::Backup::BackupPlan',
                {
                    BackupPlan: {
                        BackupPlanName: 'aws-backup-s3-sample-01-backup-plan'
                    }
                }
            ),
                template.resourceCountIs('AWS::Backup::BackupPlan', 1);
        })
    }
)