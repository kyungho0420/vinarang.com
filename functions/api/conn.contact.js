import { getCorsHeaders, verifyTurnstile, createJsonResponse } from './_utils.js';

export const onRequestPost = async (context) => {
    const { request, env } = context;
    const corsHeaders = getCorsHeaders(request);

    const isHuman = await verifyTurnstile(request, env);
    if (!isHuman) {
        return createJsonResponse({ success: false, message: 'Invalid CAPTCHA. Please try again.' }, 401, corsHeaders);
    }

    try {
        const { email, message } = await request.json();
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        if (!email || !message) {
            return createJsonResponse({ success: false, message: 'Email and message are required.' }, 400, corsHeaders);
        }
        if (!emailRegex.test(email)) {
            return createJsonResponse({ success: false, message: 'Please provide a valid email address.' }, 400, corsHeaders);
        }
        if (message.length > 1024) {
            return createJsonResponse({ success: false, message: 'Message must be 1024 characters or less.' }, 400, corsHeaders);
        }
        
        const hostname = request.headers.get('host');
        const kstTime = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        
        const ps = env.D1.prepare('INSERT INTO contacts (email, message, domain, created_at) VALUES (?, ?, ?, ?)');
        await ps.bind(email, message, hostname, kstTime).run();

        return createJsonResponse({ success: true, message: 'Your message has been sent successfully!' }, 200, corsHeaders);
    } catch (e) {
        return createJsonResponse({ success: false, message: 'Failed to save your message.' }, 500, corsHeaders);
    }
}

export const onRequestOptions = (context) => {
    return new Response(null, {
        headers: getCorsHeaders(context.request)
    });
};
