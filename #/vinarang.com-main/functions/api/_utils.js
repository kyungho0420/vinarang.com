/*
    Project: Canvas Express V1 - Common Utilities
    Last Modified: 2025-10-21
    Author: Maxim (www.maxim.pe.kr)
 */

const allowedOrigins = [
    'https://www.vinarang.com',
    'https://vinarang.pages.dev'
];

export function getCorsHeaders(request) {
    const origin = request.headers.get('Origin');
    const headers = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
}

export async function verifyTurnstile(request, env) {
    const body = await request.clone().json();
    const token = body['cf-turnstile-response'];
    const ip = request.headers.get('CF-Connecting-IP');

    if (!token) return false;

    let formData = new FormData();
    formData.append('secret', env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: formData,
        method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
}

export function createJsonResponse(data, status, corsHeaders) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}
