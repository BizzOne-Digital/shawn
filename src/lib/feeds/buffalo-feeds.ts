const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  73: "Snow",
  80: "Showers",
  95: "Thunderstorm",
};

const BUFFALO_LAT = 42.8864;
const BUFFALO_LON = -78.8784;

const NEWS_FEEDS = [
  { source: "WIVB", url: "https://www.wivb.com/feed/" },
  { source: "WKBW", url: "https://www.wkbw.com/news/local-news.rss" },
] as const;

export interface WeatherSnapshot {
  temperature: number;
  description: string;
  high: number;
  low: number;
  updatedAt: string;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
}

export async function getBuffaloWeather(): Promise<WeatherSnapshot | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(BUFFALO_LAT),
      longitude: String(BUFFALO_LON),
      current: "temperature_2m,weather_code",
      daily: "temperature_2m_max,temperature_2m_min",
      temperature_unit: "fahrenheit",
      timezone: "America/New_York",
      forecast_days: "1",
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number; time?: string };
      daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
    };
    const code = data.current?.weather_code ?? 0;

    return {
      temperature: Math.round(data.current?.temperature_2m ?? 0),
      description: WEATHER_CODES[code] ?? "Buffalo area",
      high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
      low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
      updatedAt: data.current?.time ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getBuffaloNews(): Promise<NewsItem[]> {
  for (const feed of NEWS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "LetsGoBuffalo/1.0 (+https://lets-go-buffalo.vercel.app)" },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = parseRssItems(xml, feed.source);
      if (items.length > 0) return items.slice(0, 6);
    } catch {
      continue;
    }
  }

  return getFallbackNews();
}

function parseRssItems(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const block of blocks) {
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([^<]*)<\/title>/i);
    const link = block.match(/<link>([^<]*)<\/link>/i);
    const pubDate = block.match(/<pubDate>([^<]*)<\/pubDate>/i);
    const titleText = (title?.[1] ?? title?.[2])?.trim();

    if (!titleText || titleText === source || titleText === "News 4 Buffalo") continue;
    if (!link?.[1]?.trim()) continue;

    items.push({
      title: decodeXml(titleText),
      link: link[1].trim(),
      pubDate: pubDate?.[1]?.trim(),
      source,
    });
  }

  return items;
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
}

function getFallbackNews(): NewsItem[] {
  return [
    {
      title: "WIVB News 4 Buffalo — latest Western New York headlines",
      link: "https://www.wivb.com/",
      source: "WIVB",
    },
    {
      title: "WKBW 7 News Buffalo — local news & weather",
      link: "https://www.wkbw.com/news/local-news",
      source: "WKBW",
    },
    {
      title: "The Buffalo News — business & community coverage",
      link: "https://buffalonews.com/",
      source: "Buffalo News",
    },
  ];
}
