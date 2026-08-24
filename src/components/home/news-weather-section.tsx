import Link from "next/link";
import { CloudSun, ExternalLink, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBuffaloNews, getBuffaloWeather } from "@/lib/feeds/buffalo-feeds";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface NewsWeatherSectionProps {
  content: PageContentMap;
}

export async function NewsWeatherSection({ content }: NewsWeatherSectionProps) {
  const [weather, news] = await Promise.all([getBuffaloWeather(), getBuffaloNews()]);

  return (
    <section className="overflow-x-clip bg-soft-gray py-16 md:py-20">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
            {txt(content, "news_weather.title")}
          </h2>
          <p className="mt-3 text-muted">{txt(content, "news_weather.subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy">
                <CloudSun className="size-5 text-buffalo-red" />
                {txt(content, "news_weather.weather_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weather ? (
                <div>
                  <p className="font-display text-5xl font-bold text-navy">{weather.temperature}°F</p>
                  <p className="mt-2 text-muted">{weather.description}</p>
                  <p className="mt-4 text-sm text-muted">
                    High {weather.high}° · Low {weather.low}°
                  </p>
                </div>
              ) : (
                <p className="text-muted">Weather feed temporarily unavailable.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy">
                <Newspaper className="size-5 text-buffalo-red" />
                {txt(content, "news_weather.news_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {news.map((item) => (
                  <li key={item.link}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 text-navy hover:text-buffalo-red"
                    >
                      <span className="font-medium leading-snug">{item.title}</span>
                      <ExternalLink className="mt-1 size-4 shrink-0 opacity-50 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted">
                {txt(content, "news_weather.news_footer")}{" "}
                <Link href="/community" className="text-buffalo-red hover:underline">
                  {txt(content, "news_weather.community_link")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
