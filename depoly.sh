#!/bin/bash
set -e  # Exit on error

# ==================== CONFIG ====================
SERVER_USER="root"
SERVER_IP="31.97.70.3"
SERVER_PATH="/opt/event/web"
SERVICE_PATH="${SERVER_PATH}/web"
COMPOSE_PATH="${SERVER_PATH}/docker-compose.yaml"
IMAGE_NAME="event-management-web"
GIT_REPO="git@github.com:theanh2032003/event-management-web.git"
GIT_BRANCH="main"

echo "=========================================="
echo "🚀 Starting deployment to ${SERVER_IP}"
echo "=========================================="

# ==================== CHECK SSH CONNECTION ====================
echo "🔐 Testing SSH connection to ${SERVER_USER}@${SERVER_IP}..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo 'SSH OK'" > /dev/null 2>&1; then
    echo "❌ Cannot connect to server. Please check:"
    echo "   1. SSH key is added: ssh-copy-id ${SERVER_USER}@${SERVER_IP}"
    echo "   2. Server is running"
    echo "   3. Firewall allows SSH (port 22)"
    exit 1
fi
echo "✅ SSH connection successful"


# ==================== DEPLOY ON SERVER ====================
echo "🚀 Deploying to server..."

ssh ${SERVER_USER}@${SERVER_IP} << EOF
set -e

echo "=========================================="
echo "📥 Pulling latest code from GitHub..."
echo "=========================================="

# Pull code
if [ ! -d "${SERVICE_PATH}/.git" ]; then
    echo "🚀 Cloning repo for the first time..."
    mkdir -p ${SERVICE_PATH}
    git clone -b ${GIT_BRANCH} ${GIT_REPO} ${SERVICE_PATH}
else
    echo "🔄 Updating existing repo..."
    cd ${SERVICE_PATH}
    git config --global --add safe.directory ${SERVICE_PATH}
    git fetch origin ${GIT_BRANCH}
    git reset --hard origin/${GIT_BRANCH}
fi

cd ${SERVICE_PATH}
COMMIT_ID=\$(git rev-parse --short HEAD)
echo "✅ Currently at commit \${COMMIT_ID}"

# ==================== DETERMINE VERSION ====================
echo "🧮 Determining next version..."

EXISTING_TAGS=\$(docker images --format '{{.Repository}}:{{.Tag}}' | grep "^${IMAGE_NAME}:" | awk -F: '{print \$2}' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\$' | sort -V || echo "")

if [ -z "\$EXISTING_TAGS" ]; then
    VERSION="1.0.0"
    echo "⚡ No existing images, starting with version \${VERSION}"
else
    LATEST_TAG=\$(echo "\$EXISTING_TAGS" | tail -n1)
    echo "📌 Latest existing tag: \${LATEST_TAG}"

    MAJOR=\$(echo \$LATEST_TAG | cut -d. -f1)
    MINOR=\$(echo \$LATEST_TAG | cut -d. -f2)
    PATCH=\$(echo \$LATEST_TAG | cut -d. -f3)
    PATCH=\$((PATCH + 1))
    VERSION="\${MAJOR}.\${MINOR}.\${PATCH}"
    echo "🔢 New version: \${VERSION} (incremented from \${LATEST_TAG})"
fi

# ==================== BUILD IMAGE ====================
echo "🏗️ Building Docker image ${IMAGE_NAME}:\${VERSION}..."
docker build -t ${IMAGE_NAME}:\${VERSION} ${SERVICE_PATH}

# ==================== UPDATE COMPOSE & DEPLOY ====================
echo "📝 Updating docker-compose.yml..."
sed -i "s|image:.*${IMAGE_NAME}.*|image: ${IMAGE_NAME}:\${VERSION}|g" ${COMPOSE_PATH}
echo "✅ docker-compose.yml after update:"
grep "image:" ${COMPOSE_PATH}

echo "🔄 Restarting service..."
cd ${SERVER_PATH}
docker compose down
docker compose up -d

echo ""
echo "=========================================="
echo "✅ Deployment completed successfully!"
echo "   Version: \${VERSION}"
echo "   Commit:  \${COMMIT_ID}"
echo "=========================================="
echo ""
echo "📊 Service status:"
docker compose ps

EOF

echo ""
echo "🎉 All done! Check logs with:"
echo "   ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_PATH} && docker compose logs -f'"