import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import { BackupPlan, BackupPlanRule, BackupVault, BackupResource } from 'aws-cdk-lib/aws-backup';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSample01Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create aws s3
    const bucket = new Bucket(this, "thisBucket", {
      bucketName: "aws-backup-s3-sample-01",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      // blockPublicAcess -> default ture
      // enforceSSL
      enforceSSL: true,
      // 
      publicReadAccess: false,
      versioned: true,
      //
      encryption: BucketEncryption.S3_MANAGED
    })

    // create a tag for s3 bucket
    cdk.Tags.of(bucket).add('bucket-backup', 'true')

    // 
    const backRole = this.createBackRole()

    // ceate backup vault
    const backupVault = new BackupVault(this, "thisBackupVault", {
      backupVaultName: "aws-backup-s3-sample-01-backup-vault",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // create backup plan
    const backupPlan = BackupPlan.daily35DayRetention(
      this,
      "aws-backup-s3-sample-01-backup-plan",
      backupVault,
    )

    // create backup selection
    backupPlan.addSelection('thisBackupSelection', {
      role: backRole,
      resources: [
        BackupResource.fromTag('bucket-backup', 'true'),
      ]
    })

  }

  private createBackRole(): Role {
    const backupRole = new Role(this, 'Role', {
      assumedBy: new ServicePrincipal('backup.amazonaws.com')
    })

    backupRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "s3:GetInentoryConfiguration",
          "s3:PutInventoryConfiguration",
          "s3:ListBucketVersions",
          "s3:ListBucket",
          "s3:GetBucketVersioning",
          "s3:GetBucketNotification",
          "s3:PutBucketNotification",
          "s3:GetBucketLocation",
          "s3:GetBucketTagging",
        ],
        resources: ["arn:aws:s3:::*"],
        sid: "S3BucketBuckupPermission"
      })
    ),
      backupRole.addToPolicy(
        new PolicyStatement({
          actions: [
            "s3:GetObjectAcl",
            "s3:GetObject",
            "s3:GetObjectVersionTagging",
            "s3:GetObjectVersionAcl",
            "s3:GetObjectTagging",
            "s3:GetObjectVersion",
          ],
          resources: ["arn:aws:s3:::*/*"],
          sid: "S3ObjectBackupPermission"
        })
      )

    backupRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "s3:ListAllMyBuckets",
        ],
        resources: ["*"],
        sid: "S3GlobalPermissions"
      })
    )

    backupRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:ListAllMyBuckets"],
        resources: ["*"],
        sid: "S3GlobalPermissions",
      })
    );
    backupRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:ListAllMyBuckets"],
        resources: ["*"],
        sid: "S3GlobalPermissions",
      })
    );
    backupRole.addToPolicy(
      new PolicyStatement({
        actions: ["kms:Decrypt", "kms:DescribeKey"],
        resources: ["*"],
        sid: "KMSBackupPermissions",
        conditions: {
          StringLike: {
            "kms:ViaService": "s3.*.amazonaws.com"
          }
        }
      })
    );
    backupRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "events:DescribeRule",
          "events:EnableRule",
          "events:PutRule",
          "events:DeleteRule",
          "events:PutTargets",
          "events:RemoveTargets",
          "events:ListTargetsByRule",
          "events:DisableRule",
        ],
        resources: ["arn:aws:events:*:*:rule/AwsBackupManagedRule*"],
        sid: "EventsPermissions",
      })
    )
    backupRole.addToPolicy(
      new PolicyStatement({
        actions: ["cloudwatch:GetMetricData", "events:ListRules"],
        resources: ["*"],
        sid: "EventsMetricsGlobalPermissions",
      })
    );

    return backupRole
  }
}
