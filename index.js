// Import required libraries
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

// Function to fetch HTML content of a page
async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching URL: ${url} -`, error.message);
        return null;
    }
}

// Function to extract product URLs from HTML content
function extractProductURLs(html, baseURL) {
    const $ = cheerio.load(html);
    const productURLs = new Set();

    $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && (href.includes('/product/') || href.includes('/item/') || href.includes('/p/'))) {
            try {
                const fullURL = new URL(href, baseURL).href;
                productURLs.add(fullURL);
            } catch (err) {
                console.error(`Invalid URL: ${href} -`, err.message);
            }
        }
    });

    return Array.from(productURLs);
}

// Function to crawl a domain and discover product URLs
async function crawlDomain(domain) {
    console.log(`Crawling domain: ${domain}`);
    const html = await fetchHTML(domain);

    if (!html) {
        console.error(`Failed to fetch content for domain: ${domain}`);
        return [];
    }

    const productURLs = extractProductURLs(html, domain);
    console.log(`Discovered ${productURLs.length} product URLs on ${domain}`);
    return productURLs;
}

// Main function to crawl multiple domains
async function crawlDomains(domains) {
    const results = {};

    for (const domain of domains) {
        results[domain] = await crawlDomain(domain);
    }

    return results;
}

// Example usage
(async () => {
    const domains = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com'
    ];

    const crawlResults = await crawlDomains(domains);

    console.log('Crawl Results:', crawlResults);
})();
