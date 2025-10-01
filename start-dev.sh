#!/bin/bash
echo "🚀 Starting Kruger Gateway Development Environment..."

# Start database
echo "📊 Starting PostgreSQL database..."
cd backend
docker-compose up -d

# Wait for database to be ready
sleep 5

# Initialize database
echo "🗃️ Initializing database tables..."
node src/database/setup.js

# Start backend
echo "🔧 Starting backend API..."
npm run dev &

# Start frontend
echo "🎨 Starting frontend CMS..."
cd ../frontend
npm run dev &

echo "✅ Development environment started!"
echo "📱 CMS: http://localhost:3000"
echo "🔗 API: http://localhost:5000"
echo "📊 Health: http://localhost:5000/api/health"