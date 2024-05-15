import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import { BackupPlan, BackupPlanRule, BackupVault, BackupResource } from 'aws-cdk-lib/aws-backup';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSample01Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create aws s3
    const bucket = new Bucket(this, "thisBucket", {
      bucketName: "aws-backup-s3-sample-01",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    // create a tag for s3 bucket
    cdk.Tags.of(bucket).add('bucket-backup', 'true')

    // ceate backup vault
    const backupVault = new BackupVault(this, "thisBackupVault", {
      backupVaultName: "aws-backup-s3-sample-01-backup-vault",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // create backup plan
    const backupPlan = new BackupPlan(this, 'thisBackupPlan', {
      backupPlanName: "aws-backup-s3-sample-01-backup-plan",
      backupVault: backupVault,
    })

    // add backup plan rule
    backupPlan.addRule(
      new BackupPlanRule({
        ruleName: 'DailyBackup',
        scheduleExpression: events.Schedule.cron({ minute: '0', hour: '4' })
      })
    )

    // create backup selection
    backupPlan.addSelection('thisBackupSelection', {
      resources: [
        BackupResource.fromTag('bucket-backup', 'true'),
      ]
    })

    // create grant for backup vault
    bucket.grantRead(new ServicePrincipal('backup.amazonaws.com'))

  }
}
