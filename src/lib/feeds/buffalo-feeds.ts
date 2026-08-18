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

export interface WeatherSnapshot {
  temperature: number;
  description: string;
  high: number;
  low: number;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
}

export async function getBuffaloWeather(): Promise<WeatherSnapshot | null> {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=42.8864&longitude=-78.8784&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York&forecast_days=1",
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
    };
    const code = data.current?.weather_code ?? 0;
    return {
      temperature: Math.round(data.current?.temperature_2m ?? 0),
      description: WEATHER_CODES[code] ?? "Buffalo area",
      high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
      low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
    };
  } catch {
    return null;
  }
}

export async function getBuffaloNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://www.wivb.com/feed/", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "LetsGoBuffalo/1.0" },
    });
    if (!res.ok) return getFallbackNews();
    const xml = await res.text();
    return parseRssItems(xml).slice(0, 5);
  } catch {
    return getFallbackNews();
  }
}

function parseRssItems(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks) {
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const link = block.match(/<link>(.*?)<\/link>/i);
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/i);
    const titleText = title?.[1] ?? title?.[2];
    if (titleText && link?.[1]) {
      items.push({
        title: decodeXml(titleText.trim()),
        link: link[1].trim(),
        pubDate: pubDate?.[1]?.trim(),
      });
    }
  }
  return items;
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getFallbackNews(): NewsItem[] {
  return [
    {
      title: "Buffalo & WNY local news — visit WIVB for latest headlines",
      link: "https://www.wivb.com/",
    },
    {
      title: "The Buffalo News — local business & community coverage",
      link: "https://buffalonews.com/",
    },
  ];
}
