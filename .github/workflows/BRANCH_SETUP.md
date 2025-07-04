# Branch Setup Guide

Quick reference for adding new branches and environments to the deployment workflows.

## 🌿 **Adding New Development Branches**

To add a new development branch (e.g., `feature/new-feature`):

### **1. Update Development Workflow**
Edit `.github/workflows/deploy-dev.yml`:

```yaml
on:
  push:
    branches:
      - dev
      - develop
      - development
      - feature/new-feature  # Add your new branch here
```

### **2. Update CI Workflow**
Edit `.github/workflows/ci.yml`:

```yaml
on:
  push:
    branches:
      - '**'  # This already covers all branches
  pull_request:
    branches:
      - main
      - master
      - dev
      - develop
      - development
      - feature/new-feature  # Add your new branch here
```

## 🏭 **Adding New Environments**

To add a new environment (e.g., `testing`):

### **1. Create New Workflow File**
Create `.github/workflows/deploy-testing.yml`:

```yaml
name: Deploy to Testing

on:
  push:
    branches:
      - testing
      - test

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '18'

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    # ... (copy from existing workflow)

  deploy-testing:
    name: Deploy to Testing
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && (github.ref == 'refs/heads/testing' || github.ref == 'refs/heads/test')
    environment: testing
    
    steps:
      # ... (copy from existing workflow)
      - name: Deploy to Testing
        run: |
          serverless deploy \
            --stage testing \
            --region ${{ env.AWS_REGION }} \
            --verbose
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY_TESTING }}
          USER_POOL_ID: ${{ secrets.USER_POOL_ID_TESTING }}
          USER_POOL_CLIENT_ID: ${{ secrets.USER_POOL_CLIENT_ID_TESTING }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TESTING }}
```

### **2. Add GitHub Secrets**
Add these secrets to your GitHub repository:

```
GEMINI_API_KEY_TESTING
USER_POOL_ID_TESTING
USER_POOL_CLIENT_ID_TESTING
JWT_SECRET_TESTING
```

### **3. Update Documentation**
Update `DEPLOYMENT.md` with the new environment:

```markdown
| Environment | Branch | Purpose | Auto-Deploy |
|-------------|--------|---------|-------------|
| **Testing** | `testing`, `test` | Special testing environment | ✅ Yes |
```

## 🔧 **Environment Configuration**

### **Serverless Configuration**
Each environment uses different stages in `serverless.yml`:

```yaml
# Development
serverless deploy --stage dev

# Staging
serverless deploy --stage staging

# Production
serverless deploy --stage prod

# Testing (new)
serverless deploy --stage testing
```

### **Environment Variables**
Each environment has its own set of environment variables:

```bash
# Development
GEMINI_API_KEY_DEV
USER_POOL_ID_DEV
USER_POOL_CLIENT_ID_DEV
JWT_SECRET_DEV

# Staging
GEMINI_API_KEY_STAGING
USER_POOL_ID_STAGING
USER_POOL_CLIENT_ID_STAGING
JWT_SECRET_STAGING

# Production
GEMINI_API_KEY_PROD
USER_POOL_ID_PROD
USER_POOL_CLIENT_ID_PROD
JWT_SECRET_PROD

# Testing (new)
GEMINI_API_KEY_TESTING
USER_POOL_ID_TESTING
USER_POOL_CLIENT_ID_TESTING
JWT_SECRET_TESTING
```

## 📋 **Quick Commands**

### **Create New Branch**
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Push to remote
git push -u origin feature/new-feature
```

### **Deploy to Specific Environment**
```bash
# Development
git push origin dev

# Staging
git push origin staging

# Production
git push origin main

# Testing (new)
git push origin testing
```

### **Check Deployment Status**
```bash
# Check GitHub Actions
# Go to: https://github.com/your-repo/actions

# Check serverless status
serverless info --stage dev --region us-east-1
serverless info --stage staging --region us-east-1
serverless info --stage prod --region us-east-1
serverless info --stage testing --region us-east-1
```

## 🚨 **Important Notes**

1. **Environment Isolation**: Each environment should have separate AWS resources
2. **Secrets Management**: Never commit secrets to the repository
3. **Testing**: Always test in development before staging
4. **Approval Process**: Production deployments may require manual approval
5. **Monitoring**: Set up alerts for each environment

## 📞 **Need Help?**

1. Check GitHub Actions logs
2. Review AWS CloudWatch logs
3. Verify environment configuration
4. Check this documentation
5. Contact the DevOps team

---

**Last Updated**: July 2024
**Version**: 1.0.0 