#!/bin/bash

# Configuration - Update these values
BUCKET_NAME="your-bucket-name"
AWS_REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="" # Optional: Add if using CloudFront

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment process...${NC}"

# Build the application
echo -e "${BLUE}Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Deployment aborted.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Sync files to S3
echo -e "${BLUE}Uploading files to S3 bucket: ${BUCKET_NAME}...${NC}"
aws s3 sync dist/ s3://${BUCKET_NAME} \
    --region ${AWS_REGION} \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.json"

# Upload index.html and JSON files with no-cache
aws s3 cp dist/index.html s3://${BUCKET_NAME}/index.html \
    --region ${AWS_REGION} \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

# Upload JSON files if they exist
if ls dist/*.json 1> /dev/null 2>&1; then
    aws s3 cp dist/ s3://${BUCKET_NAME}/ \
        --region ${AWS_REGION} \
        --recursive \
        --exclude "*" \
        --include "*.json" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --content-type "application/json"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Upload to S3 failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Upload to S3 successful!${NC}"

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${BLUE}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
        --paths "/*"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}CloudFront cache invalidated!${NC}"
    else
        echo -e "${RED}CloudFront invalidation failed.${NC}"
    fi
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${BLUE}Your site is available at: http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com${NC}"
