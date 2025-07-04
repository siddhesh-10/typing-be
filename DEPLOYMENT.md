# Deployment Guide

This document explains the deployment strategy and workflows for the Typing Practice Backend.

## 🏗️ **Deployment Architecture**

We use a **multi-environment deployment strategy** with **Infrastructure as Code** approach:

### **Environments**

| Environment | Branch | Purpose | Auto-Deploy |
|-------------|--------|---------|-------------|
| **Development** | `dev`, `develop`, `development` | Feature development & testing | ✅ Yes |
| **Staging** | `staging`, `stage` | Pre-production testing | ✅ Yes |
| **Production** | `main`, `master` | Live production | ✅ Yes |

## 📋 **Infrastructure as Code**

### **Two-Phase Deployment**

1. **Infrastructure Deployment** (`serverless-infrastructure.yml`)
   - DynamoDB Tables
   - Cognito User Pool & Client
   - IAM Roles & Policies
   - CloudFormation Outputs

2. **Functions Deployment** (`serverless.yml`)
   - Lambda Functions
   - API Gateway
   - WebSocket API
   - Uses infrastructure outputs

## 📋 **Workflow Files**

### 1. **CI Workflow** (`ci.yml`)
- **Triggers**: All branches, all pull requests
- **Purpose**: Quality checks, testing, security audits
- **Actions**: Lint, test, build, security audit

### 2. **Development Deployment** (`deploy-dev.yml`)
- **Triggers**: Push to `dev`, `develop`, `development`
- **Environment**: Development
- **Stage**: `dev`
- **Purpose**: Quick feature testing
- **Process**: Infrastructure → Functions

### 3. **Staging Deployment** (`deploy-staging.yml`)
- **Triggers**: Push to `staging`, `stage`
- **Environment**: Staging
- **Stage**: `staging`
- **Purpose**: Pre-production validation
- **Process**: Infrastructure → Functions

### 4. **Production Deployment** (`deploy-prod.yml`)
- **Triggers**: Push to `main`, `master`
- **Environment**: Production
- **Stage**: `prod`
- **Purpose**: Live production deployment
- **Process**: Infrastructure → Functions

## 🔧 **Setup Instructions**

### **1. GitHub Secrets Required**

#### **AWS Credentials** (All environments)
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

#### **Development Environment**
```
GEMINI_API_KEY_DEV
```

#### **Staging Environment**
```
GEMINI_API_KEY_STAGING
```

#### **Production Environment**
```
GEMINI_API_KEY_PROD
```

### **2. AWS Setup**

The infrastructure will be automatically created by the deployment process. No manual setup required!

#### **What Gets Created Automatically:**
- **Cognito User Pool** with email verification
- **Cognito User Pool Client** for authentication
- **DynamoDB Tables** for all data storage
- **IAM Roles** with proper permissions
- **API Gateway** with Cognito authorizers
- **WebSocket API** for real-time features

## 🚀 **Deployment Process**

### **Development Workflow**
1. Create feature branch from `dev`
2. Make changes and test locally
3. Push to `dev` branch
4. **Phase 1**: Automatic infrastructure deployment
5. **Phase 2**: Automatic functions deployment
6. Test features in dev environment
7. Create PR to `staging` when ready

### **Staging Workflow**
1. Merge feature branches to `staging`
2. **Phase 1**: Automatic infrastructure deployment
3. **Phase 2**: Automatic functions deployment
4. Run integration tests
5. Manual testing and validation
6. Create PR to `main` when approved

### **Production Workflow**
1. Merge `staging` to `main`
2. **Phase 1**: Automatic infrastructure deployment
3. **Phase 2**: Automatic functions deployment
4. Smoke tests run automatically
5. Monitor for issues
6. Rollback if needed

## 🔐 **Security & Authentication**

### **Cognito Integration**
- **No Custom JWT Secrets**: Uses Cognito's built-in JWT verification
- **Secure Token Validation**: AWS-managed JWT verification
- **User Pool Management**: Automatic user creation and management
- **Email Verification**: Built-in email verification flow

### **Authentication Flow**
1. User signs up/signs in through Cognito
2. Cognito returns JWT access token
3. Frontend includes token in Authorization header
4. Lambda functions verify token using Cognito's built-in verification
5. No custom JWT secrets needed!

## 📊 **Monitoring & Notifications**

### **Success Notifications**
- ✅ Development: Team notification with deployment URL
- ✅ Staging: Ready for testing notification
- 🚀 Production: Success notification with deployment time

### **Failure Notifications**
- ❌ Development: Failure notification with details
- ❌ Staging: Failure notification with details
- 🚨 Production: Critical failure notification with timestamp

## 🔄 **Rollback Strategy**

### **Automatic Rollback**
If deployment fails, the previous version remains active.

### **Manual Rollback**
```bash
# Rollback functions to previous version
serverless rollback --stage prod --region us-east-1

# Rollback infrastructure (if needed)
serverless rollback --config serverless-infrastructure.yml --stage prod --region us-east-1
```

## 🛡️ **Security Considerations**

### **Environment Isolation**
- Separate AWS resources for each environment
- Different Cognito User Pools per environment
- Isolated DynamoDB tables per environment
- Environment-specific API keys

### **Access Control**
- Production deployments require approval
- Staging environment for pre-production testing
- Development environment for rapid iteration
- Cognito-managed authentication (no custom secrets)

## 📈 **Best Practices**

### **Before Deployment**
1. ✅ All tests pass
2. ✅ Security audit clean
3. ✅ Code review completed
4. ✅ Local testing done

### **During Deployment**
1. 🔍 Monitor deployment logs
2. 🔍 Check AWS CloudWatch metrics
3. 🔍 Verify environment variables
4. 🔍 Confirm infrastructure outputs

### **After Deployment**
1. 🧪 Run smoke tests
2. 🧪 Verify API endpoints
3. 🧪 Check database connectivity
4. 🧪 Monitor error rates

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Infrastructure Deployment Fails**
```bash
# Check CloudFormation logs
aws cloudformation describe-stack-events --stack-name typing-practice-infrastructure-dev

# Check serverless logs
serverless logs --config serverless-infrastructure.yml --stage dev --region us-east-1
```

#### **Functions Deployment Fails**
```bash
# Check if infrastructure exists
aws cloudformation describe-stacks --stack-name typing-practice-infrastructure-dev

# Check serverless logs
serverless logs --stage dev --region us-east-1
```

#### **Authentication Issues**
```bash
# Verify Cognito User Pool
aws cognito-idp describe-user-pool --user-pool-id YOUR_USER_POOL_ID

# Check JWT token format
# Should be: Bearer <cognito_jwt_token>
```

#### **Database Connection Issues**
```bash
# Check DynamoDB table status
aws dynamodb describe-table --table-name users-dev

# Verify IAM permissions
aws iam get-user
```

## 📞 **Support**

For deployment issues:
1. Check GitHub Actions logs
2. Review AWS CloudWatch logs
3. Verify environment configuration
4. Check infrastructure outputs
5. Contact DevOps team

---

**Last Updated**: July 2024
**Version**: 2.0.0 