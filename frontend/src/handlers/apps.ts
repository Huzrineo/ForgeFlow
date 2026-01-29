import type { HandlerContext } from './types';

export const appHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {

  action_pexels: async ({ api, data, onLog }) => {
    if (!data.apiKey) throw new Error('Pexels API key is required');
    if (!data.query) throw new Error('Search query is required');
    
    const query = encodeURIComponent(data.query);
    const orientation = data.orientation ? `&orientation=${data.orientation}` : '';
    const url = `https://api.pexels.com/v1/search?query=${query}&per_page=1${orientation}`;
    
    onLog('info', `Pexels: searching for "${data.query}"`, undefined);
    
    const response = await api.http.get(url, { 'Authorization': data.apiKey });
    if (response.error) throw new Error(response.error);
    
    const result = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
    if (!result.photos || result.photos.length === 0) throw new Error(`No images found for "${data.query}"`);
    
    const photo = result.photos[0];
    const size = data.size || 'large';
    
    onLog('info', `Pexels: found image by ${photo.photographer}`, undefined);
    
    return {
      url: photo.src[size] || photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || data.query,
      original: photo.src.original,
      allSizes: photo.src,
    };
  },

  action_unsplash: async ({ api, data, onLog }) => {
    if (!data.apiKey) throw new Error('Unsplash Access Key is required');
    if (!data.query) throw new Error('Search query is required');
    
    const query = encodeURIComponent(data.query);
    const orientation = data.orientation ? `&orientation=${data.orientation}` : '';
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1${orientation}`;
    
    onLog('info', `Unsplash: searching for "${data.query}"`, undefined);
    
    const response = await api.http.get(url, { 'Authorization': `Client-ID ${data.apiKey}`, 'Accept-Version': 'v1' });
    if (response.error) throw new Error(response.error);
    
    const result = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
    if (!result.results || result.results.length === 0) throw new Error(`No images found for "${data.query}"`);
    
    const photo = result.results[0];
    const size = data.size || 'regular';
    
    onLog('info', `Unsplash: found image by ${photo.user.name}`, undefined);
    
    return {
      url: photo.urls[size] || photo.urls.regular,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      alt: photo.alt_description || data.query,
      original: photo.urls.raw,
      allSizes: photo.urls,
      downloadUrl: photo.links.download,
    };
  },

  action_telegram: async ({ api, data, onLog }) => {
    if (!data.botToken) throw new Error('Telegram Bot Token is required');
    if (!data.chatId) throw new Error('Chat ID is required');
    if (!data.message) throw new Error('Message is required');
    
    const url = `https://api.telegram.org/bot${data.botToken}/sendMessage`;
    const body = JSON.stringify({ chat_id: data.chatId, text: data.message, parse_mode: data.parseMode || undefined });
    
    onLog('info', `Telegram: sending message to ${data.chatId}`, undefined);
    
    const response = await api.http.post(url, body, { 'Content-Type': 'application/json' });
    if (response.error) throw new Error(response.error);
    
    const result = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
    if (!result.ok) throw new Error(result.description || 'Telegram API error');
    
    return { success: true, messageId: result.result.message_id };
  },

  action_discord: async ({ api, data, onLog }) => {
    if (!data.webhookUrl) throw new Error('Discord Webhook URL is required');
    if (!data.content) throw new Error('Message content is required');
    
    const body: any = { content: data.content };
    if (data.username) body.username = data.username;
    if (data.avatarUrl) body.avatar_url = data.avatarUrl;
    
    onLog('info', 'Discord: sending webhook message', undefined);
    
    const response = await api.http.post(data.webhookUrl, JSON.stringify(body), { 'Content-Type': 'application/json' });
    if (response.error) throw new Error(response.error);
    
    return { success: true };
  },

  action_slack: async ({ api, data, onLog }) => {
    if (!data.webhookUrl) throw new Error('Slack Webhook URL is required');
    if (!data.text) throw new Error('Message text is required');
    
    const body: any = { text: data.text };
    if (data.username) body.username = data.username;
    if (data.iconEmoji) body.icon_emoji = data.iconEmoji;
    
    onLog('info', 'Slack: sending webhook message', undefined);
    
    const response = await api.http.post(data.webhookUrl, JSON.stringify(body), { 'Content-Type': 'application/json' });
    if (response.error) throw new Error(response.error);
    
    return { success: true };
  },

  action_email: async ({ onLog, data }) => {
    onLog('warn', 'Email: SMTP requires backend implementation. Use HTTP webhook to email service instead.', undefined);
    return { success: false, error: 'Direct SMTP not supported. Use an email API service (SendGrid, Mailgun) via HTTP Request node.', config: { to: data.to, subject: data.subject } };
  },

  action_translate: async ({ api, data, onLog }) => {
    if (!data.text) throw new Error('Text to translate is required');
    
    const text = encodeURIComponent(data.text);
    const from = data.from || 'auto';
    const to = data.to || 'en';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${text}`;
    
    onLog('info', `Translate: ${from} → ${to}`, undefined);
    
    const response = await api.http.get(url);
    if (response.error) throw new Error(response.error);
    
    const result = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
    const translated = result[0].map((item: any) => item[0]).join('');
    return { text: translated, from: result[2] || from, to };
  },

  action_weather: async ({ api, data, onLog }) => {
    if (!data.apiKey) throw new Error('OpenWeather API key is required');
    if (!data.city) throw new Error('City is required');
    
    const city = encodeURIComponent(data.city);
    const units = data.units || 'metric';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${data.apiKey}`;
    
    onLog('info', `Weather: fetching for ${data.city}`, undefined);
    
    const response = await api.http.get(url);
    if (response.error) throw new Error(response.error);
    
    const result = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
    if (result.cod !== 200) throw new Error(result.message || 'Weather API error');
    
    return { city: result.name, country: result.sys.country, temp: result.main.temp, feelsLike: result.main.feels_like, humidity: result.main.humidity, description: result.weather[0].description, icon: result.weather[0].icon, wind: result.wind.speed };
  },

  action_rss: async ({ api, data, onLog }) => {
    if (!data.url) throw new Error('RSS Feed URL is required');
    
    onLog('info', `RSS: fetching ${data.url}`, undefined);
    
    const response = await api.http.get(data.url);
    if (response.error) throw new Error(response.error);
    
    const xml = response.body;
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < (data.limit || 10)) {
      const itemXml = match[1];
      const getTag = (tag: string) => {
        const tagMatch = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
        return tagMatch ? tagMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
      };
      items.push({ title: getTag('title'), link: getTag('link'), description: getTag('description'), pubDate: getTag('pubDate') });
    }
    
    return { items, count: items.length };
  },

  action_shorten_url: async ({ api, data, onLog }) => {
    if (!data.url) throw new Error('URL is required');
    
    const url = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(data.url)}`;
    onLog('info', 'Shortening URL via TinyURL', undefined);
    
    const response = await api.http.get(url);
    if (response.error) throw new Error(response.error);
    
    return { shortUrl: response.body, originalUrl: data.url };
  },

  action_qrcode: async ({ data, onLog }) => {
    if (!data.data) throw new Error('Data/URL is required');
    
    const size = data.size || '300';
    const format = data.format || 'png';
    const color = (data.color || '000000').replace('#', '');
    const bgcolor = (data.bgcolor || 'ffffff').replace('#', '');
    const margin = data.margin || '1';
    const ecc = data.ecc || 'M';
    
    const qrData = encodeURIComponent(data.data);
    
    // Build URL with all parameters
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrData}`;
    qrUrl += `&format=${format}`;
    qrUrl += `&color=${color}`;
    qrUrl += `&bgcolor=${bgcolor}`;
    qrUrl += `&margin=${margin}`;
    qrUrl += `&ecc=${ecc}`;
    
    // Generate helper URLs for common use cases
    const downloadUrl = qrUrl + '&download=1';
    
    onLog('info', `QR Code: ${size}x${size} ${format.toUpperCase()}, ECC=${ecc}`, undefined);
    
    return {
      url: qrUrl,
      downloadUrl,
      data: data.data,
      size: `${size}x${size}`,
      format,
      color: `#${color}`,
      bgcolor: `#${bgcolor}`,
      ecc,
      // Helper: embed as HTML img tag
      html: `<img src="${qrUrl}" alt="QR Code" width="${size}" height="${size}" />`,
      // Helper: markdown
      markdown: `![QR Code](${qrUrl})`,
    };
  },

  action_github: async ({ api, data, onLog }) => {
    if (!data.token) throw new Error('GitHub token is required');
    
    const headers = { 'Authorization': `Bearer ${data.token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'ForgeFlow' };
    
    let url = 'https://api.github.com';
    switch (data.action) {
      case 'repos': url += data.owner ? `/users/${data.owner}/repos` : '/user/repos'; break;
      case 'repo': if (!data.owner || !data.repo) throw new Error('Owner and repo are required'); url += `/repos/${data.owner}/${data.repo}`; break;
      case 'issues': if (!data.owner || !data.repo) throw new Error('Owner and repo are required'); url += `/repos/${data.owner}/${data.repo}/issues`; break;
      case 'commits': if (!data.owner || !data.repo) throw new Error('Owner and repo are required'); url += `/repos/${data.owner}/${data.repo}/commits`; break;
      case 'releases': if (!data.owner || !data.repo) throw new Error('Owner and repo are required'); url += `/repos/${data.owner}/${data.repo}/releases`; break;
      default: url += '/user';
    }
    
    onLog('info', `GitHub: ${data.action}`, undefined);
    
    const response = await api.http.get(url, headers);
    if (response.error) throw new Error(response.error);
    return typeof response.json === 'object' ? response.json : JSON.parse(response.body);
  },

  action_notion: async ({ api, data, onLog }) => {
    if (!data.apiKey) throw new Error('Notion API key is required');
    if (!data.databaseId) throw new Error('Database ID is required');
    if (!data.title) throw new Error('Title is required');
    
    const url = 'https://api.notion.com/v1/pages';
    const headers = { 'Authorization': `Bearer ${data.apiKey}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' };
    
    const body = {
      parent: { database_id: data.databaseId },
      properties: { title: { title: [{ text: { content: data.title } }] } },
      children: data.content ? [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: data.content } }] } }] : []
    };
    
    onLog('info', `Notion: creating page "${data.title}"`, undefined);
    
    const response = await api.http.post(url, JSON.stringify(body), headers);
    if (response.error) throw new Error(response.error);
    
    const result = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
    return { id: result.id, url: result.url, title: data.title };
  },
};
