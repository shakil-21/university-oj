const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const docker = new Docker();

// Ensure temp directory exists
const TEMP_DIR = path.join(__dirname, '../../temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

exports.runCode = async (code, language, input) => {
    // 1. Create a unique temporary file for the code
    const uniqueId = Date.now() + Math.random().toString(36).substring(7);
    const fileName = `submission_${uniqueId}.cpp`; // Assuming C++ for now
    const inputName = `input_${uniqueId}.txt`;
    const hostCodePath = path.join(TEMP_DIR, fileName);
    const hostInputPath = path.join(TEMP_DIR, inputName);

    fs.writeFileSync(hostCodePath, code);
    fs.writeFileSync(hostInputPath, input);

    let output = '';
    let memoryUsed = 0; // Simplified
    let executionTime = 0;

    try {
        // 2. Create and start container
        // Security: Network disabled, limited memory/CPU, Pids limit
        const container = await docker.createContainer({
            Image: 'gcc-alpine', // Must build this image as 'gcc-alpine' first
            Cmd: ['sh', '-c', `g++ -o /app/program /app/${fileName} && /app/program < /app/${inputName}`],
            Tty: true, // Enable TTY to remove Docker binary headers from logs
            HostConfig: {
                Binds: [
                    `${TEMP_DIR}:/app:rw` // Mount temp dir. :ro is safer if we compile elsewhere, but for simplicity we compile inside
                ],
                Memory: 128 * 1024 * 1024, // 128MB
                MemorySwap: 128 * 1024 * 1024,
                NanoCpus: 1000000000, // 1 CPU
                PidsLimit: 50, // Prevent fork bombs
                NetworkMode: 'none', // No internet access
                AutoRemove: true // Clean up container after exit
            },
            User: 'judge' // Run as non-root
        });

        const startTime = process.hrtime();

        await container.start();

        // 3. Wait for container to finish (with timeout)
        const stream = await container.logs({ follow: true, stdout: true, stderr: true });

        // Collect logs
        const logPromise = new Promise((resolve, reject) => {
            stream.on('data', chunk => output += chunk.toString());
            stream.on('end', resolve);
        });

        const waitPromise = new Promise((resolve, reject) => {
            container.wait((err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });

        // Timeout Promise
        const timeoutLimit = 5000; // 5 seconds hard limit
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Time Limit Exceeded')), timeoutLimit);
        });

        const waitData = await Promise.race([waitPromise, timeoutPromise]);
        await logPromise; // Ensure we get all logs

        const diff = process.hrtime(startTime);
        executionTime = (diff[0] * 1000 + diff[1] / 1e6); // ms

        // Strip ANSI codes
        // eslint-disable-next-line no-control-regex
        output = output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

        return {
            output: output.trim(),
            executionTime,
            memoryUsed,
            exitCode: waitData.StatusCode
        };

    } catch (err) {
        output = err.message;
        console.error("Docker execution error:", err);
        // Force kill if timeout
        if (err.message === 'Time Limit Exceeded') {
            try { await container.kill(); } catch (e) { /* ignore if already stopped */ }
        }
        return {
            output: output.trim(),
            executionTime: 0,
            memoryUsed: 0,
            exitCode: 1 // Treat internal errors as failure
        };
    } finally {
        // Cleanup temp files
        if (fs.existsSync(hostCodePath)) fs.unlinkSync(hostCodePath);
        if (fs.existsSync(hostInputPath)) fs.unlinkSync(hostInputPath);
    }
};
