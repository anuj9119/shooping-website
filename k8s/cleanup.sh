#!/bin/bash

# Cleanup script for Kubernetes deployment
set -e

echo "🧹 Cleaning up Social Media App from Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Delete all resources in the namespace
echo "🗑️ Deleting all resources..."
kubectl delete namespace social-media --ignore-not-found=true

echo "✅ Cleanup completed successfully!"
echo "📝 Note: Persistent volumes may still exist and need manual cleanup if using dynamic provisioning"
