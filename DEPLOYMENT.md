# Deployment Guide

## Prerequisites

1. **AWS CLI** - Install and configure:
   ```bash
   # Install AWS CLI
   brew install awscli  # macOS
   # or download from: https://aws.amazon.com/cli/

   # Configure AWS credentials
   aws configure
   ```

2. **AWS Credentials** - You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)

## Quick Start

### 1. Configure Deployment

Edit `deploy.sh` and update these variables:
```bash
BUCKET_NAME="your-bucket-name"          # Your S3 bucket name
AWS_REGION="us-east-1"                  # Your AWS region
CLOUDFRONT_DISTRIBUTION_ID=""           # Optional: CloudFront ID
```

### 2. Make Script Executable

```bash
chmod +x deploy.sh
```

### 3. Deploy

```bash
npm run deploy
```

## First-Time S3 Setup

If you haven't created the S3 bucket yet:

### Create Bucket
```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

### Enable Static Website Hosting
```bash
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### Set Bucket Policy (Make Public)

Create a file `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Apply the policy:
```bash
# Disable block public access
aws s3api put-public-access-block \
  --bucket your-bucket-name \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Apply bucket policy
aws s3api put-bucket-policy \
  --bucket your-bucket-name \
  --policy file://bucket-policy.json
```

### Access Your Site

Your site will be available at:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

## Optional: CloudFront Setup (HTTPS + Custom Domain)

### 1. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-bucket-name.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

Or use the AWS Console:
1. Go to CloudFront → Create Distribution
2. Set Origin Domain to your S3 website endpoint
3. Set Default Root Object to `index.html`
4. Create Distribution

### 2. Update deploy.sh

Add the CloudFront Distribution ID to `deploy.sh`:
```bash
CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
```

### 3. Custom Domain (Optional)

1. Request SSL certificate in AWS Certificate Manager (must be in us-east-1)
2. Add alternate domain names (CNAMEs) to CloudFront distribution
3. Update DNS records to point to CloudFront distribution

## Available Commands

- `npm run deploy` - Deploy to S3 (build must be done separately)
- `npm run deploy:build` - Build and deploy in one command
- `npm run build` - Build the application only

## Deployment Features

The deployment script:
- Builds your application
- Syncs files to S3 with `--delete` (removes old files)
- Sets long cache for assets (1 year)
- Sets no-cache for index.html (always fetch latest)
- Invalidates CloudFront cache (if configured)
- Provides colored output for easy tracking

## Troubleshooting

### Permission Denied
```bash
chmod +x deploy.sh
```

### AWS Credentials Not Found
```bash
aws configure
```

### Bucket Already Exists
S3 bucket names must be globally unique. Try a different name.

### Access Denied
Make sure your AWS user has these permissions:
- s3:PutObject
- s3:GetObject
- s3:DeleteObject
- s3:ListBucket
- cloudfront:CreateInvalidation (if using CloudFront)

## Cost Estimation

- **S3 Storage**: ~$0.023 per GB/month
- **S3 Requests**: ~$0.0004 per 1,000 GET requests
- **CloudFront**: First 1TB transfer free, then ~$0.085/GB
- **Route 53**: ~$0.50/month per hosted zone (if using custom domain)

For a typical small site: **< $1/month**
