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

/**
 * Generate a scouting schedule.
 *
 * Groups stay together as units. With activeGroupCount > 1, multiple groups
 * are active simultaneously, each covering a slice of the teams in a match.
 *
 * Example: 3 groups of 2, activeGroupCount=2, shiftLength=10
 *  - Matches 1-10: Group 1 scouts teams 1-2, Group 2 scouts teams 3-4
 *  - Matches 11-20: Group 2 scouts teams 1-2, Group 3 scouts teams 3-4
 *  - Matches 21-30: Group 3 scouts teams 1-2, Group 1 scouts teams 3-4
 *  - etc.
 */
export function generateSchedule(
  groups: GroupDef[],
  matches: MatchDef[],
  shiftLength: number,
  activeGroupCount: number = 1
): Assignment[] {
  if (groups.length === 0 || matches.length === 0 || shiftLength < 1) return [];

  const activeCount = Math.min(activeGroupCount, groups.length);
  const assignments: Assignment[] = [];
  const sorted = [...matches].sort((a, b) => a.match_number - b.match_number);

  // Track round-robin index per group for rotating members within a group
  const memberIndex: Record<number, number> = {};
  for (const g of groups) {
    memberIndex[g.id] = 0;
  }

  for (let i = 0; i < sorted.length; i++) {
    const match = sorted[i];
    const shiftIndex = Math.floor(i / shiftLength);

    // Pick which groups are active this shift
    const activeGroups: GroupDef[] = [];
    for (let a = 0; a < activeCount; a++) {
      const gIdx = (shiftIndex + a) % groups.length;
      activeGroups.push(groups[gIdx]);
    }

    const teams = [match.red1, match.red2, match.blue1, match.blue2].filter(
      (t): t is number => t !== null && t !== undefined
    );

    if (teams.length === 0) continue;

    // Split teams across active groups in order.
    // e.g., 4 teams, 2 groups → group 1 gets teams[0..1], group 2 gets teams[2..3]
    const teamsPerGroup = Math.ceil(teams.length / activeCount);
    let teamIdx = 0;

    for (const group of activeGroups) {
      if (group.members.length === 0 || teamIdx >= teams.length) continue;

      const groupTeams = teams.slice(teamIdx, teamIdx + teamsPerGroup);
      teamIdx += teamsPerGroup;

      // Assign within this group: each member gets 1 team, round-robin
      const usedMembers = new Set<number>();

      for (const teamNum of groupTeams) {
        if (group.members.length === 0) break;

        // Find next unused member in this group
        let idx = memberIndex[group.id] % group.members.length;
        let attempts = 0;
        while (usedMembers.has(idx) && attempts < group.members.length) {
          memberIndex[group.id]++;
          idx = memberIndex[group.id] % group.members.length;
          attempts++;
        }

        assignments.push({
          match_id: match.id,
          scouter_id: group.members[idx],
          team_number: teamNum,
          group_id: group.id,
        });

        usedMembers.add(idx);
        memberIndex[group.id]++;
      }
    }
  }

  return assignments;
}
