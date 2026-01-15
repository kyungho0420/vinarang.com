import { getCorsHeaders, verifyTurnstile, createJsonResponse } from './_utils.js';

export const onRequestPost = async (context) => {
    const { request, env } = context;
    const corsHeaders = getCorsHeaders(request);

    const isHuman = await verifyTurnstile(request, env);
    if (!isHuman) {
        return createJsonResponse({ success: false, message: 'Invalid CAPTCHA. Please try again.' }, 401, corsHeaders);
    }

    try {
        let { key } = await request.json();
        if (!key) {
            return createJsonResponse({ success: false, message: 'Search key is required.' }, 400, corsHeaders);
        }

        key = key.replace(/[^a-zA-Z0-9.-]/g, '');
        const value = await env.KV.get(key);

        if (value === null) {
            return createJsonResponse({ success: true, found: false, key, message: 'No result found.' }, 200, corsHeaders);
        } else {
            return createJsonResponse({ success: true, found: true, key, value }, 200, corsHeaders);
        }
    } catch (e) {
        return createJsonResponse({ success: false, message: 'An internal error occurred.' }, 500, corsHeaders);
    }
}

export const onRequestOptions = (context) => {
    return new Response(null, {
        headers: getCorsHeaders(context.request)
    });
};
