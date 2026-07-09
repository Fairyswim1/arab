import type { FrequencyEntry, HistogramBin } from "@/types";

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const avg = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export function frequencyTable(values: number[]): FrequencyEntry[] {
  const counts = new Map<number, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value - b.value);
}

export function histogramBins(
  values: number[],
  binSize: number
): HistogramBin[] {
  if (values.length === 0 || binSize <= 0) return [];

  const minValue = min(values);
  const maxValue = max(values);
  const start = Math.floor(minValue / binSize) * binSize;
  const end = Math.ceil((maxValue + 1) / binSize) * binSize;

  const bins: HistogramBin[] = [];

  for (let binStart = start; binStart < end; binStart += binSize) {
    const binEnd = binStart + binSize;
    const count = values.filter(
      (v) => v >= binStart && v < binEnd
    ).length;

    bins.push({
      binStart,
      binEnd,
      count,
      label: `${binStart}–${binEnd - 1}`,
    });
  }

  return bins;
}

export function scoreDistribution(values: number[]) {
  return {
    count: values.length,
    mean: mean(values),
    standardDeviation: standardDeviation(values),
    median: median(values),
    min: min(values),
    max: max(values),
    frequency: frequencyTable(values),
    histogram: histogramBins(values, 2),
  };
}

export function buildClassStats(
  classSessionId: string,
  className: string,
  scoreTotals: number[],
  score10: number[],
  score20: number[],
  score30: number[],
  score50: number[]
) {
  return {
    classSessionId,
    className,
    count: scoreTotals.length,
    mean: mean(scoreTotals),
    standardDeviation: standardDeviation(scoreTotals),
    median: median(scoreTotals),
    min: min(scoreTotals),
    max: max(scoreTotals),
    scoreTotals,
    score10,
    score20,
    score30,
    score50,
  };
}
