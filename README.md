# University Online Judge System

## Architecture

This system uses a microservices-inspired architecture with a Modular Monolith approach.

- **API Service** (`api/`): Handles HTTP requests, User Authentication, and Submission reception.
- **Worker Service** (`worker/`): Consumes tasks from Redis, executes code in isolated Docker containers.
- **Shared Modules** (`common/`): Database models and utility functions.
- **Infrastructure**: MongoDB (Data), Redis (Queue), Docker (Execution).

## Prerequisites

1.  **Node.js**: v16+
2.  **MongoDB**: Running locally or via URI.
3.  **Redis**: Running locally.
4.  **Docker**: Desktop installed and running.

## Installation

1.  Navigate to root: `cd "d:/university oj"`
2.  Install dependencies: `npm install`
3.  Build the Docker image:
    ```bash
    cd docker-env
    docker build -t gcc-alpine .
    ```

## Running the System

You need to run the API and Worker in separate terminals.

**Terminal 1 (API):**
```bash
npm run start:api
```

**Terminal 2 (Worker):**
```bash
npm run start:worker
```

## Security Measures

- **Container Isolation**: User code runs in ephemeral Docker containers.
- **Resource Limits**:
    - **Memory**: 128MB limit.
    - **CPU**: 1 CPU core.
    - **PIDs**: Limited to 50 to prevent Fork Bombs.
- **Network**: Disabled (`network: none`) to prevent external connections.
- **Timeouts**: Hard 5-second limit to prevent Infinite Loops.

## API Usage

**Submit Code:**
`POST /api/submissions`
```json
{
  "userId": "SOME_MONGO_ID",
  "problemId": "SOME_MONGO_ID",
  "code": "#include <iostream>...",
  "language": "cpp"
}
```
