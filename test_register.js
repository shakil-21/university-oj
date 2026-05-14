
async function testRegister() {
    try {
        console.log("Attempting registration...");
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'debug_user_' + Date.now(),
                email: `debug_${Date.now()}@example.com`,
                password: 'password123'
            })
        });

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (response.ok) {
                console.log("Registration Successful:", data);
            } else {
                console.error("Registration Failed (Server Response):", response.status, data);
            }
        } catch (e) {
            console.error("Registration Failed (Not JSON):", response.status, text.substring(0, 500));
        }
    } catch (error) {
        console.error("Registration Failed (Network/Setup Error):", error.message);
    }
}

testRegister();
