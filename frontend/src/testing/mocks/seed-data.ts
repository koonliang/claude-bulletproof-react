// Mock data for seeding discussions
export const mockDiscussions = [
  {
    title: 'Q1 2024 Performance Review Meeting',
    body: "Let's discuss our quarterly performance metrics and key achievements. I'd like to review our sales targets, customer satisfaction scores, and team productivity metrics. Please come prepared with your department reports and any challenges you've faced.",
  },
  {
    title: 'New Remote Work Policy Implementation',
    body: 'Following recent changes in workplace dynamics, we need to establish clear guidelines for remote work arrangements. This includes communication protocols, productivity measurements, and team collaboration standards. Your input on work-life balance is crucial.',
  },
  {
    title: 'Customer Feedback Analysis - Product Roadmap',
    body: "Based on the latest customer surveys and support tickets, we've identified several areas for improvement in our product offering. Let's prioritize feature requests, discuss technical feasibility, and align our development roadmap with customer needs.",
  },
  {
    title: 'Budget Allocation for Marketing Campaign',
    body: "The upcoming marketing campaign needs budget approval and resource allocation. We're looking at digital advertising, content creation, and event sponsorships. Let's evaluate ROI expectations and discuss the optimal channel mix for maximum impact.",
  },
  {
    title: 'Employee Training and Development Program',
    body: "Our team needs upskilling in emerging technologies and soft skills. I'm proposing a comprehensive training program covering technical certifications, leadership development, and cross-functional collaboration. What are your thoughts on implementation timeline?",
  },
  {
    title: 'Office Space Optimization and Hybrid Work',
    body: "With the shift to hybrid work models, we need to reconsider our office space utilization. This includes hot-desking arrangements, meeting room bookings, and collaborative spaces. Let's discuss how to create an environment that supports both in-person and remote workers.",
  },
  {
    title: 'Quarterly Security Audit Results',
    body: 'The recent security audit revealed several vulnerabilities in our systems. We need to address these findings promptly to maintain compliance and protect our data. Priority items include password policy updates, multi-factor authentication, and network security improvements.',
  },
  {
    title: 'Product Launch Strategy - Q2 Release',
    body: "Our next product release is scheduled for Q2, and we need to finalize our go-to-market strategy. This includes pricing models, target audience segmentation, competitive analysis, and marketing messaging. Let's ensure all departments are aligned for a successful launch.",
  },
  {
    title: 'Customer Support Escalation Process',
    body: "We've been experiencing longer response times for customer support tickets. I'd like to discuss our escalation procedures, staffing levels, and tools that could improve our support efficiency. Customer satisfaction is our top priority.",
  },
  {
    title: 'Team Building Activities and Company Culture',
    body: "Building a strong company culture requires intentional team building activities. I'm looking for suggestions on virtual and in-person events that can strengthen our team bonds. What activities have worked well for your teams in the past?",
  },
  {
    title: 'Sustainability Initiative - Green Office Program',
    body: "As part of our corporate responsibility, we're launching a sustainability initiative. This includes reducing paper usage, implementing recycling programs, and exploring renewable energy options. Let's discuss how each department can contribute to our environmental goals.",
  },
  {
    title: 'Performance Management System Overhaul',
    body: "Our current performance review process needs modernization. I'm proposing a shift to continuous feedback, goal-setting transparency, and peer review components. This should improve employee engagement and provide more actionable insights for career development.",
  },
  {
    title: 'Data Privacy Compliance - GDPR Updates',
    body: 'Recent changes in data privacy regulations require us to update our compliance procedures. This affects how we collect, store, and process customer data. We need to review our privacy policies, consent mechanisms, and data retention practices.',
  },
  {
    title: 'Cross-Department Collaboration Improvement',
    body: "Communication silos between departments are affecting our project delivery. Let's establish regular cross-functional meetings, shared documentation standards, and collaborative tools that can improve information flow and reduce duplicated efforts.",
  },
  {
    title: 'Annual Conference Planning and Logistics',
    body: "Planning for our annual company conference is underway. We need to finalize the venue, speaker lineup, catering arrangements, and transportation logistics. This year's theme focuses on innovation and digital transformation. Your department's involvement is essential.",
  },
  {
    title: 'Client Onboarding Process Optimization',
    body: "Our client onboarding process takes too long and creates friction. I'm proposing a streamlined approach with digital forms, automated workflows, and dedicated account management. Let's map out the ideal client journey and identify automation opportunities.",
  },
  {
    title: 'Technology Stack Modernization Project',
    body: 'Our current technology infrastructure is becoming outdated and limiting our scalability. We need to evaluate cloud migration options, upgrade development tools, and implement modern DevOps practices. What are your recommendations for the modernization roadmap?',
  },
  {
    title: 'Diversity and Inclusion Initiative Launch',
    body: "We're committed to building a more diverse and inclusive workplace. This initiative includes unconscious bias training, diverse hiring practices, and inclusive leadership development. Let's discuss how to measure progress and ensure lasting cultural change.",
  },
  {
    title: 'Supply Chain Risk Management Strategy',
    body: 'Recent global events have highlighted vulnerabilities in our supply chain. We need to develop a comprehensive risk management strategy that includes vendor diversification, inventory optimization, and contingency planning. What are your thoughts on building resilience?',
  },
  {
    title: 'Knowledge Management System Implementation',
    body: "We're losing valuable institutional knowledge as team members leave. I'm proposing a comprehensive knowledge management system that captures processes, best practices, and lessons learned. This should improve onboarding and reduce knowledge gaps across teams.",
  },
];

// Mock users for seeding
export const mockUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@example.com',
    role: 'ADMIN',
    bio: 'Team lead with 5+ years of experience in project management',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'USER',
    bio: 'Senior developer passionate about clean code and user experience',
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    role: 'USER',
    bio: 'Product manager focused on customer-driven development',
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    role: 'USER',
    bio: 'UX designer with expertise in user research and interaction design',
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    role: 'USER',
    bio: 'DevOps engineer specializing in cloud infrastructure and automation',
  },
];

export const seedMockData = async (db: any) => {
  console.log('Starting seed process...');

  // Check if data already exists
  const existingDiscussions = db.discussion.getAll();
  console.log(`Found ${existingDiscussions.length} existing discussions`);

  if (existingDiscussions.length > 0) {
    console.log('Mock data already exists, skipping seed');
    return;
  }

  console.log('No existing data found, starting seeding...');

  // Check if there are existing users and teams
  const existingUsers = db.user.getAll();
  const existingTeams = db.team.getAll();
  console.log(
    `Found ${existingUsers.length} existing users, ${existingTeams.length} existing teams`,
  );

  // Use existing team if available, otherwise create default team
  let targetTeam;
  if (existingTeams.length > 0) {
    targetTeam = existingTeams[0]; // Use the first existing team
    console.log('Using existing team:', targetTeam);
  } else {
    console.log('Creating default team...');
    targetTeam = db.team.create({
      name: 'Default Team',
      description: 'Default team for mock discussions',
    });
  }

  // Use existing users if available, otherwise create default users
  let targetUsers;
  if (existingUsers.length > 0) {
    targetUsers = existingUsers;
    console.log(`Using ${existingUsers.length} existing users`);
  } else {
    console.log('Creating default users...');
    targetUsers = [];
    for (const userData of mockUsers) {
      const user = db.user.create({
        ...userData,
        password: '1282156496', // Mock hashed password = pass1234
        teamId: targetTeam.id,
      });
      targetUsers.push(user);
    }
  }

  console.log(`Using ${targetUsers.length} users for discussions`);

  // Create discussions with varied timestamps
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  console.log('Creating discussions...');

  mockDiscussions.forEach((discussionData, index) => {
    // Assign random author from available users
    const author = targetUsers[index % targetUsers.length];

    // Create discussions with timestamps spread over the last 3 months
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = now - daysAgo * oneDay;

    db.discussion.create({
      title: discussionData.title,
      body: discussionData.body,
      authorId: author.id,
      teamId: targetTeam.id,
      createdAt,
    });
  });

  console.log(`Successfully seeded ${mockDiscussions.length} mock discussions`);
  console.log(
    `All discussions created for team: ${targetTeam.name} (${targetTeam.id})`,
  );

  // Verify the data was created
  const finalDiscussions = db.discussion.getAll();
  console.log(
    `Verification: ${finalDiscussions.length} discussions now exist in database`,
  );
};
