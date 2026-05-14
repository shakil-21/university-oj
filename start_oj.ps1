# Check requirements
Write-Host "Checking requirements..."

# Helper to find command or use known path
function Get-NodePath {
    if (Get-Command node -ErrorAction SilentlyContinue) { return "node" }
    $commonPath = "C:\Program Files\nodejs\node.exe"
    if (Test-Path $commonPath) { 
        $env:Path += ";C:\Program Files\nodejs"
        Write-Host "Found Node.js at $commonPath, adding to PATH temporary..."
        return $commonPath 
    }
    return $null
}

$nodePath = Get-NodePath

if (!$nodePath) {
    Write-Error "Node.js is not installed. Please install Node.js (v16+) from https://nodejs.org/"
    exit 1
}


# Helper to find Docker
function Get-DockerPath {
    if (Get-Command docker -ErrorAction SilentlyContinue) { return "docker" }
    $commonPath = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
    if (Test-Path $commonPath) {
        $env:Path += ";C:\Program Files\Docker\Docker\resources\bin"
        Write-Host "Found Docker at $commonPath, adding to PATH temporary..."
        return $commonPath
    }
    return $null
}

if (!(Get-DockerPath)) {
    Write-Error "Docker is not installed. Please install Docker Desktop."
    exit 1
}

# Ensure Docker Daemon is running
Write-Host "Checking Docker functionality..."
$dockerReady = $false
for ($i = 0; $i -lt 5; $i++) {
    docker info > $null 2>&1
    if ($?) {
        $dockerReady = $true
        break
    }
    
    if ($i -eq 0) {
        Write-Host "Docker Daemon is not running. Attempting to start Docker Desktop..."
        $dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        if (Test-Path $dockerExe) {
            Start-Process $dockerExe
            Write-Host "Docker Desktop launching... Please wait..."
        }
        else {
            Write-Error "Could not find Docker Desktop executable. Please start it manually."
        }
    }
    
    Write-Host "Waiting for Docker to start... ($($i+1)/20)"
    Start-Sleep -Seconds 5
}

# Wait longer if we just started it
if (!$dockerReady) {
    for ($i = 0; $i -lt 15; $i++) {
        docker info > $null 2>&1
        if ($?) {
            $dockerReady = $true
            Write-Host "Docker is ready!"
            break
        }
        Write-Host "Still waiting for Docker... ($($i+1)/15)"
        Start-Sleep -Seconds 5
    }
}

if (!$dockerReady) {
    Write-Error "Docker failed to start or is not responding. Please open 'Docker Desktop' manually and wait for the whale icon to stop animating."
    exit 1
}



# Install dependencies
Write-Host "Installing dependencies..."
npm install


# Infrastructure Setup (Redis & MongoDB)
Write-Host "Checking Infrastructure..."

# Redis
if (!(docker ps -q -f name=oj-redis)) {
    if (docker ps -aq -f status=exited -f name=oj-redis) {
        Write-Host "Starting existing Redis container..."
        docker start oj-redis
    }
    else {
        Write-Host "Creating and starting Redis container..."
        docker run -d -p 6379:6379 --name oj-redis redis:alpine
    }
}
else {
    Write-Host "Redis is already running."
}

# MongoDB
if (!(docker ps -q -f name=oj-mongo)) {
    if (docker ps -aq -f status=exited -f name=oj-mongo) {
        Write-Host "Starting existing MongoDB container..."
        docker start oj-mongo
    }
    else {
        Write-Host "Creating and starting MongoDB container..."
        docker run -d -p 27017:27017 --name oj-mongo mongo:latest
    }
}
else {
    Write-Host "MongoDB is already running."
}

# Build Docker Image
Write-Host "Building Docker environment..."
cd docker-env
docker build -t gcc-alpine .
cd ..

# Start Services
Write-Host "Starting API and Worker..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start:api & pause"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start:worker & pause"

Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd client & npm run dev & pause"

Write-Host "OJ System is starting... Check the new terminal windows."
Write-Host "Frontend will be available at http://localhost:5173"
