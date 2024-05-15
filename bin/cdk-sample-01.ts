#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkSample01Stack } from '../lib/cdk-sample-01-stack';

const app = new cdk.App();
new CdkSample01Stack(app, 'CdkSample01Stack', {});