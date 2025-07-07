#!/bin/bash

# Typing Texts API Setup Script
# This script automates the complete setup of the typing texts API

set -e  # Exit on any error

echo "🚀 Starting Typing Texts API Setup..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
check_aws_config() {
    print_status "Checking AWS configuration..."
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    print_success "AWS CLI is configured"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v serverless &> /dev/null; then
        print_warning "Serverless Framework not found globally, using local version"
    fi
    
    print_success "Dependencies check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure (DynamoDB tables, etc.)..."
    npm run deploy:infrastructure:dev
    print_success "Infrastructure deployed"
}

# Deploy functions
deploy_functions() {
    print_status "Deploying Lambda functions..."
    npm run deploy:functions:dev
    print_success "Functions deployed"
}

# Seed data
seed_data() {
    print_status "Seeding typing texts data..."
    npm run seed:texts
    print_success "Data seeded"
}

# Test API
test_api() {
    print_status "Testing API functionality..."
    npm run test:api
    print_success "API tests completed"
}

# Main execution
main() {
    echo ""
    print_status "Starting setup process..."
    
    # Run setup steps
    check_aws_config
    check_dependencies
    install_dependencies
    deploy_infrastructure
    deploy_functions
    seed_data
    test_api
    
    echo ""
    print_success "🎉 Typing Texts API setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your frontend environment to point to the deployed API"
    echo "2. Test the frontend integration"
    echo "3. Monitor the API performance and add more texts as needed"
    echo ""
    echo "To add more texts in the future, run: npm run seed:texts"
    echo "To test the API again, run: npm run test:api"
}

# Run main function
main "$@" 