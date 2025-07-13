// Debug utilities for browser console
// Use these functions in the browser console to debug the mock data

export const clearMockData = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('msw-db');
    console.log('Mock data cleared from localStorage');
    console.log('Refresh the page to re-seed the data');
  }
};

export const getMockData = () => {
  if (typeof window !== 'undefined') {
    const data = window.localStorage.getItem('msw-db');
    if (data) {
      const parsed = JSON.parse(data);
      console.log('Mock data in localStorage:', parsed);

      // Show team information
      if (parsed.team) {
        console.log('Available teams:', parsed.team);
      }
      if (parsed.user) {
        console.log('Available users:', parsed.user);
        // Show which team each user belongs to
        parsed.user.forEach((user: any) => {
          const teamName =
            parsed.team?.find((t: any) => t.id === user.teamId)?.name ||
            'Unknown';
          console.log(
            `User ${user.email} belongs to team: ${teamName} (${user.teamId})`,
          );
        });
      }
      if (parsed.discussion) {
        console.log(`Found ${parsed.discussion.length} discussions`);
        // Group discussions by team
        const discussionsByTeam = parsed.discussion.reduce(
          (acc: any, disc: any) => {
            if (!acc[disc.teamId]) acc[disc.teamId] = [];
            acc[disc.teamId].push(disc);
            return acc;
          },
          {},
        );
        Object.entries(discussionsByTeam).forEach(
          ([teamId, discussions]: [string, any]) => {
            const teamName =
              parsed.team?.find((t: any) => t.id === teamId)?.name || 'Unknown';
            console.log(
              `Team ${teamName} (${teamId}) has ${discussions.length} discussions`,
            );
          },
        );
      }

      return parsed;
    } else {
      console.log('No mock data found in localStorage');
      return null;
    }
  }
};

export const seedMockDataNow = async () => {
  if (typeof window !== 'undefined') {
    console.log('Manually triggering seed...');
    const { db } = await import('./db');
    const { seedMockData } = await import('./seed-data');

    // Clear existing data first
    window.localStorage.removeItem('msw-db');

    // Seed the data
    await seedMockData(db);

    // Persist the data
    const dataToStore: Record<string, any> = {};
    Object.entries(db).forEach(([key, model]) => {
      const data = model.getAll();
      dataToStore[key] = data;
      console.log(`Persisting ${data.length} ${key} records`);
    });

    const dataString = JSON.stringify(dataToStore);
    window.localStorage.setItem('msw-db', dataString);
    console.log('Data seeded and persisted to localStorage');
    console.log('Stored data:', dataToStore);

    // Verify storage
    const stored = window.localStorage.getItem('msw-db');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Verification - Data in localStorage:', parsed);
    }
  }
};

export const fixTeamMismatch = async () => {
  if (typeof window !== 'undefined') {
    console.log('Fixing team mismatch...');
    const { db } = await import('./db');

    // Get all teams and users
    const teams = db.team.getAll();
    const users = db.user.getAll();
    const discussions = db.discussion.getAll();

    console.log(
      `Found ${teams.length} teams, ${users.length} users, ${discussions.length} discussions`,
    );

    if (teams.length > 0 && discussions.length > 0) {
      // Use the first team (which should be the current user's team)
      const targetTeam = teams[0];
      console.log(
        `Reassigning all discussions to team: ${targetTeam.name} (${targetTeam.id})`,
      );

      // Update all discussions to belong to the target team
      discussions.forEach((discussion: any) => {
        db.discussion.update({
          where: { id: { equals: discussion.id } },
          data: { teamId: targetTeam.id },
        });
      });

      // Also make sure all users belong to the same team
      users.forEach((user: any) => {
        if (user.teamId !== targetTeam.id) {
          db.user.update({
            where: { id: { equals: user.id } },
            data: { teamId: targetTeam.id },
          });
        }
      });

      // Persist the changes
      const dataToStore: Record<string, any> = {};
      Object.entries(db).forEach(([key, model]) => {
        dataToStore[key] = model.getAll();
      });

      window.localStorage.setItem('msw-db', JSON.stringify(dataToStore));
      console.log(
        'Team mismatch fixed! All discussions now belong to the correct team.',
      );
      console.log('Refresh the page to see the discussions.');
    } else {
      console.log('No teams or discussions found to fix.');
    }
  }
};

export const checkDiscussionIds = () => {
  if (typeof window !== 'undefined') {
    const data = window.localStorage.getItem('msw-db');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.discussion) {
        console.log('Discussion IDs and titles:');
        parsed.discussion.forEach((disc: any) => {
          console.log(`ID: ${disc.id}, Title: ${disc.title}`);
        });
      }
    }
  }
};

export const testSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined') {
    console.log(`Testing search for: "${searchTerm}"`);
    const data = window.localStorage.getItem('msw-db');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.discussion) {
        console.log('Available discussions:');
        parsed.discussion.forEach((disc: any) => {
          const titleMatch = disc.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const bodyMatch = disc.body
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          if (titleMatch || bodyMatch) {
            console.log(
              `✓ MATCH: "${disc.title}" - ${titleMatch ? 'title' : 'body'}`,
            );
          } else {
            console.log(`✗ NO MATCH: "${disc.title}"`);
          }
        });

        // Count matches
        const matches = parsed.discussion.filter((disc: any) => {
          const titleMatch = disc.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const bodyMatch = disc.body
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return titleMatch || bodyMatch;
        });

        console.log(
          `Total matches: ${matches.length} out of ${parsed.discussion.length}`,
        );
        return matches;
      }
    }
  }
  return [];
};

// Make these available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearMockData = clearMockData;
  (window as any).getMockData = getMockData;
  (window as any).seedMockDataNow = seedMockDataNow;
  (window as any).fixTeamMismatch = fixTeamMismatch;
  (window as any).checkDiscussionIds = checkDiscussionIds;
  (window as any).testSearch = testSearch;
}
