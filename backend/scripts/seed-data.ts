import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('Seeding database...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // Test database connection and show which database we're connecting to
    try {
      await prisma.$connect();
      const result = await prisma.$queryRaw`SELECT DATABASE() as currentDB, CONNECTION_ID() as connectionId` as any[];
      console.log('Connected to database:', result[0]?.currentDB || 'Unknown');
      console.log('Connection ID:', result[0]?.connectionId);
    } catch (dbError) {
      console.log('Database connection info not available (likely SQLite)');
    }

    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    // Create teams
    const team1 = await prisma.team.create({
      data: {
        name: 'Acme Corp',
        description: 'A leading technology company',
      },
    });

    const team2 = await prisma.team.create({
      data: {
        name: 'Tech Innovators',
        description: 'Innovation at its best',
      },
    });

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@acme.com',
        firstName: 'John',
        lastName: 'Doe',
        password: hashedPassword,
        role: 'ADMIN',
        bio: 'System administrator',
        teamId: team1.id,
      },
    });

    const user1 = await prisma.user.create({
      data: {
        email: 'jane@acme.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: hashedPassword,
        role: 'USER',
        bio: 'Frontend developer',
        teamId: team1.id,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'bob@tech.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        password: hashedPassword,
        role: 'ADMIN',
        bio: 'Backend developer',
        teamId: team2.id,
      },
    });

    // Create 25 discussions across teams
    const discussionTopics = [
      { title: 'Welcome to the platform!', body: 'This is our first discussion. Feel free to share your thoughts and ideas.' },
      { title: 'Project Planning', body: 'Let\'s discuss our upcoming project milestones and deliverables.' },
      { title: 'Tech Stack Discussion', body: 'What technologies should we use for our next project?' },
      { title: 'Code Review Guidelines', body: 'Establishing best practices for code reviews and collaboration.' },
      { title: 'Performance Optimization', body: 'How can we improve our application\'s performance and scalability?' },
      { title: 'Security Best Practices', body: 'Discussion on implementing security measures and protecting user data.' },
      { title: 'UI/UX Design Feedback', body: 'Share your thoughts on the current design and suggest improvements.' },
      { title: 'Database Schema Updates', body: 'Proposed changes to the database structure for new features.' },
      { title: 'API Design Standards', body: 'Establishing consistent patterns for our REST API endpoints.' },
      { title: 'Testing Strategy', body: 'How should we approach unit testing, integration testing, and e2e testing?' },
      { title: 'Deployment Pipeline', body: 'Improving our CI/CD process and deployment automation.' },
      { title: 'Documentation Standards', body: 'Creating comprehensive documentation for our codebase.' },
      { title: 'Mobile App Development', body: 'Discussion on developing a mobile companion app.' },
      { title: 'Third-party Integrations', body: 'Which external services should we integrate with?' },
      { title: 'Error Handling Strategies', body: 'How to properly handle and log errors across the application.' },
      { title: 'User Authentication Flow', body: 'Reviewing and improving the user login and registration process.' },
      { title: 'Data Analytics Implementation', body: 'Setting up analytics to track user behavior and app performance.' },
      { title: 'Microservices Architecture', body: 'Should we consider breaking down our monolith into microservices?' },
      { title: 'Frontend Framework Evaluation', body: 'Comparing different frontend frameworks for our next project.' },
      { title: 'Accessibility Improvements', body: 'Making our application more accessible to users with disabilities.' },
      { title: 'Internationalization Support', body: 'Adding multi-language support to our platform.' },
      { title: 'Real-time Features', body: 'Implementing WebSocket connections for live updates.' },
      { title: 'Caching Strategy', body: 'Optimizing performance through effective caching mechanisms.' },
      { title: 'Backup and Recovery', body: 'Ensuring data safety with proper backup and disaster recovery plans.' },
      { title: 'Team Collaboration Tools', body: 'Evaluating and improving our development workflow and tools.' }
    ];

    const users = [admin, user1, user2];
    const teams = [team1, team2];
    const discussions = [];

    for (let i = 0; i < discussionTopics.length; i++) {
      const topic = discussionTopics[i];
      const author = users[i % users.length];
      const team = teams[i % teams.length];
      
      const discussion = await prisma.discussion.create({
        data: {
          title: topic.title,
          body: topic.body,
          authorId: author.id,
          teamId: team.id,
        },
      });
      
      discussions.push(discussion);
    }

    // Create comments for some discussions
    const commentTexts = [
      'Great to be here! Looking forward to collaborating.',
      'I think we should prioritize this feature first.',
      'I vote for React with TypeScript and Node.js backend.',
      'This is a really important topic for our team.',
      'I have some experience with this, happy to help.',
      'We should schedule a meeting to discuss this further.',
      'I agree with the points mentioned above.',
      'This will definitely improve our workflow.',
      'Great idea! Let\'s implement this.',
      'I have some concerns about this approach.',
      'We need to consider the performance implications.',
      'This aligns well with our current goals.',
      'I can take the lead on this initiative.',
      'We should research best practices for this.',
      'This has worked well in my previous projects.'
    ];

    // Add comments to first 15 discussions
    for (let i = 0; i < Math.min(15, discussions.length); i++) {
      const discussion = discussions[i];
      const commenter = users[(i + 1) % users.length]; // Different user than author
      const commentText = commentTexts[i % commentTexts.length];
      
      await prisma.comment.create({
        data: {
          body: commentText,
          authorId: commenter.id,
          discussionId: discussion.id,
        },
      });
    }

    console.log('Database seeded successfully!');
    console.log('Sample login credentials:');
    console.log('- admin@acme.com / password123 (Admin)');
    console.log('- jane@acme.com / password123 (User)');
    console.log('- bob@tech.com / password123 (Admin)');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();