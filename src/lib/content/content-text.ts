export type PageContentMap = Record<string, string>;

export function txt(content: PageContentMap, key: string): string {
  return content[key] ?? "";
}
