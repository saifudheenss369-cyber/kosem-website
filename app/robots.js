export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',       // Do not let Google index the admin dashboard
                '/profile/',     // Do not let Google index user profiles
                '/api/'          // No need to index raw JSON backend routes
            ],
        },
        sitemap: 'https://kosemperfume.com/sitemap.xml',
    }
}
