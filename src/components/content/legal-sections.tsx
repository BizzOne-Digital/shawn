import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface LegalSectionsProps {
  content: PageContentMap;
  prefix: string;
  sectionCount?: number;
}

export function LegalSections({
  content,
  prefix,
  sectionCount = 10,
}: LegalSectionsProps) {
  return (
    <>
      {Array.from({ length: sectionCount }, (_, index) => {
        const heading = txt(content, `${prefix}.sections.${index}.heading`);
        const body = txt(content, `${prefix}.sections.${index}.body`);
        if (!heading && !body) return null;

        return (
          <section key={index}>
            <h2 className="font-display text-xl font-semibold text-navy">{heading}</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line">{body}</p>
          </section>
        );
      })}
    </>
  );
}
