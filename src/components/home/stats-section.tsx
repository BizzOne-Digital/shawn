interface StatsSectionProps {
  stats: {
    businessCount: number;
    categoryCount: number;
    cityCount: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { value: stats.businessCount, label: "Local Businesses" },
    { value: stats.categoryCount, label: "Categories" },
    { value: stats.cityCount, label: "WNY Communities" },
    { value: "716", label: "Buffalo Proud" },
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
