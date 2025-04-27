export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function parseSections(planText: string) {
  const lines = planText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^remember to/i.test(l));

  const sections: { title: string; items: string[] }[] = [];
  let current = { title: "", items: [] as string[] };

  lines.forEach((line) => {
    const dayMatch = line.match(/^Day\s+(\d+):\s+(.+)$/);
    const bulletMatch = line.match(/^-\s*(.+?):\s*(\d+)\s*sets\s*[\u00d7xX]\s*(\d+)\s*reps$/i);

    if (dayMatch) {
      if (current.title || current.items.length) sections.push(current);
      current = { title: `Day ${dayMatch[1]}: ${dayMatch[2]}`, items: [] };
    } else if (bulletMatch) {
      current.items.push(`${bulletMatch[1]}: ${bulletMatch[2]} sets × ${bulletMatch[3]} reps`);
    } else {
      current.items.push(line);
    }
  });

  if (current.title || current.items.length) sections.push(current);
  return sections;
}
