(() => {
    const measurementId = 'G-ZWRYLR73CY';
    const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

    if (window.__impulseLogAnalyticsLoaded) return;
    window.__impulseLogAnalyticsLoaded = true;

    const sanitizeToken = (value, fallback = '') => String(value || fallback)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 80);

    const classifyReferrer = () => {
        if (!document.referrer) return 'direct';
        try {
            const hostname = new URL(document.referrer).hostname.toLowerCase();
            if (hostname.endsWith('chatgpt.com') || hostname.endsWith('openai.com')) return 'chatgpt';
            if (hostname.includes('google.')) return 'google';
            if (hostname.includes('bing.')) return 'bing';
            if (hostname.endsWith('facebook.com') || hostname.endsWith('instagram.com')) return 'meta';
            if (hostname.endsWith('reddit.com')) return 'reddit';
            if (hostname.endsWith('producthunt.com')) return 'product_hunt';
            if (hostname === window.location.hostname) return 'internal';
            return 'other_referral';
        } catch {
            return 'unknown_referral';
        }
    };

    const searchParams = new URLSearchParams(window.location.search);
    const campaign = Object.fromEntries(campaignKeys.map(key => [
        key.replace('utm_', ''),
        sanitizeToken(searchParams.get(key)),
    ]));
    const attribution = Object.freeze({
        source: campaign.source || classifyReferrer(),
        medium: campaign.medium || (document.referrer ? 'referral' : 'none'),
        campaign: campaign.campaign || 'none',
        content: campaign.content || 'none',
        term: campaign.term || 'none',
    });
    window.__impulseLogAttribution = attribution;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
    });
    window.gtag('event', 'landing_view', {
        traffic_source: attribution.source,
        traffic_medium: attribution.medium,
        campaign_name: attribution.campaign,
        campaign_content: attribution.content,
        campaign_term: attribution.term,
        page_path: window.location.pathname,
    });

    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(googleTag);
})();
