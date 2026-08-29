import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface StatsSectionProps {
  stats: {
    businessCount: number;
    categoryCount: number;
    cityCount: number;
  };
  content: PageContentMap;
}

export function StatsSection({ stats, content }: StatsSectionProps) {
  const items = [
    { value: stats.businessCount, label: txt(content, "stats.label_businesses") },
    { value: stats.categoryCount, label: txt(content, "stats.label_categories") },
    { value: stats.cityCount, label: txt(content, "stats.label_communities") },
    { value: txt(content, "stats.value_proud"), label: txt(content, "stats.label_proud") },
  ];

  return (
    <section className="overflow-x-clip py-16 bg-navy text-white">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((item) => (
            <div key={item.label}>
              <div className="font-display text-4xl md:text-5xl font-bold text-buffalo-red">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </div>
              <p className="mt-2 text-white/70">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
