export type ConfidenceTier = "Perfect Match" | "Great Match" | "Good Match" | "Decent" | "Risky" | "Avoid";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface CalibratedScore {
  rawScore: number;
  matchScore: number;
  confidenceTier: ConfidenceTier;
  confidenceLevel?: ConfidenceLevel;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function getTier(matchScore: number): ConfidenceTier {
  if (matchScore >= 92) return "Perfect Match";
  if (matchScore >= 84) return "Great Match";
  if (matchScore >= 72) return "Good Match";
  if (matchScore >= 55) return "Decent";
  if (matchScore >= 35) return "Risky";
  return "Avoid";
}

function getConfidenceLevel(gap: number): ConfidenceLevel {
  if (gap >= 8) return "High";
  if (gap >= 4) return "Medium";
  return "Low";
}

export function calibrateScores(
  rawScores: number[],
  hasAvoidNote: boolean[] = [],
  k: number = 1.5
): CalibratedScore[] {
  const n = rawScores.length;
  if (n === 0) return [];

  if (n === 1) {
    const raw = rawScores[0];
    let p = Math.round(raw * 100);
    if (hasAvoidNote[0]) p = Math.max(1, p - 15);
    p = Math.max(1, Math.min(99, p));
    return [{
      rawScore: raw,
      matchScore: p,
      confidenceTier: getTier(p),
    }];
  }

  const mean = rawScores.reduce((s, v) => s + v, 0) / n;
  const variance = rawScores.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance) || 0.01;

  const zScores = rawScores.map(s => (s - mean) / std);

  let mapped = zScores.map(z => {
    const p = 100 * sigmoid(k * z);
    return Math.max(1, Math.min(99, Math.round(p)));
  });

  const indexed = rawScores.map((raw, i) => ({ raw, i }));
  indexed.sort((a, b) => b.raw - a.raw);

  const rank1Idx = indexed[0].i;
  const rank2Idx = indexed.length > 1 ? indexed[1].i : -1;

  mapped[rank1Idx] = Math.min(99, mapped[rank1Idx] + 6);
  if (rank2Idx >= 0) {
    mapped[rank2Idx] = Math.min(99, mapped[rank2Idx] + 3);
  }

  for (let i = 0; i < n; i++) {
    if (hasAvoidNote[i]) {
      mapped[i] = Math.max(1, mapped[i] - 12);
    }
  }

  for (let i = 0; i < n; i++) {
    mapped[i] = Math.max(1, Math.min(99, mapped[i]));
  }

  const topScore = mapped[rank1Idx];
  const secondScore = rank2Idx >= 0 ? mapped[rank2Idx] : 0;
  const gap = topScore - secondScore;
  const confidence = getConfidenceLevel(gap);

  return rawScores.map((raw, i) => ({
    rawScore: raw,
    matchScore: mapped[i],
    confidenceTier: getTier(mapped[i]),
    confidenceLevel: i === rank1Idx ? confidence : undefined,
  }));
}

export function tierColor(tier: ConfidenceTier): string {
  switch (tier) {
    case "Perfect Match": return "text-olive";
    case "Great Match": return "text-olive";
    case "Good Match": return "text-gold";
    case "Decent": return "text-muted-foreground";
    case "Risky": return "text-terracotta";
    case "Avoid": return "text-terracotta";
  }
}

export function tierBarColor(tier: ConfidenceTier): string {
  switch (tier) {
    case "Perfect Match": return "bg-olive";
    case "Great Match": return "bg-olive";
    case "Good Match": return "bg-gold";
    case "Decent": return "bg-muted-foreground";
    case "Risky": return "bg-terracotta";
    case "Avoid": return "bg-terracotta";
  }
}
