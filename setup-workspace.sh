#!/bin/bash
set -e

echo "Creating CreateSuite workspace for evolution project..."

# Initialize non-interactively
cat > .createsuite/config.json << EOF
{
  "name": "CreateSuite Evolution Project",
  "repo": "file://$(pwd)"
}
EOF

# Initialize git if needed
if [ ! -d .git ]; then
  git init
  git config user.email "createsuite@local"
  git config user.name "CreateSuite"
  git add .
  git commit -m "Initial commit: CreateSuite Evolution Project"
fi

echo "✓ Workspace initialized"
echo "✓ Git repository initialized"
echo ""
echo "Next: Creating convoys and tasks..."
