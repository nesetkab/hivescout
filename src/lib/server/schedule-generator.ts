interface GroupDef {
  id: number;
  members: number[]; // scouter IDs
}

interface MatchDef {
  id: number;
  match_number: number;
  red1: number | null;
  red2: number | null;
  blue1: number | null;
  blue2: number | null;
}

interface Assignment {
  match_id: number;
  scouter_id: number;
  team_number: number;
  group_id: number;
}

export function generateSchedule(
  groups: GroupDef[],
  matches: MatchDef[],
  shiftLength: number
): Assignment[] {
  if (groups.length === 0 || matches.length === 0 || shiftLength < 1) return [];

  const assignments: Assignment[] = [];
  const sorted = [...matches].sort((a, b) => a.match_number - b.match_number);

  // Track round-robin index per group so work is evenly distributed
  const memberIndex: Record<number, number> = {};
  for (const g of groups) {
    memberIndex[g.id] = 0;
  }

  for (let i = 0; i < sorted.length; i++) {
    const match = sorted[i];
    const shiftIndex = Math.floor(i / shiftLength);
    const activeGroup = groups[shiftIndex % groups.length];

    if (activeGroup.members.length === 0) continue;

    const teams = [match.red1, match.red2, match.blue1, match.blue2].filter(
      (t): t is number => t !== null && t !== undefined
    );

    // Each scouter gets at most 1 team per match.
    // Assign up to min(teams, members) — rotate which member gets which.
    const usedScouters = new Set<number>();
    const count = Math.min(teams.length, activeGroup.members.length);

    for (let t = 0; t < count; t++) {
      // Find next member in round-robin who isn't already used this match
      let idx = memberIndex[activeGroup.id] % activeGroup.members.length;
      let attempts = 0;
      while (usedScouters.has(activeGroup.members[idx]) && attempts < activeGroup.members.length) {
        memberIndex[activeGroup.id]++;
        idx = memberIndex[activeGroup.id] % activeGroup.members.length;
        attempts++;
      }

      assignments.push({
        match_id: match.id,
        scouter_id: activeGroup.members[idx],
        team_number: teams[t],
        group_id: activeGroup.id,
      });

      usedScouters.add(activeGroup.members[idx]);
      memberIndex[activeGroup.id]++;
    }
  }

  return assignments;
}
