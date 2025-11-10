# Database Setup Guide

This guide will help you set up your Nostra Community database and populate it with demo data.

## Setup at a glance

```mermaid
flowchart LR
    Env[Configure Supabase env vars] --> Tools[Install PostgreSQL client]
    Tools --> Choice{Choose setup path}
    Choice -->|Quick| QuickSetup[npm run db:setup]
    Choice -->|Manual| Schema[Apply schema]
    Schema --> Seed[Seed demo data]
    QuickSetup --> Verify[Verify data in app]
    Seed --> Verify
    Verify --> Iterate[Customize data & explore flows]
```

## Issues Fixed

The following issues have been resolved:

1. **Table name mismatch**: The code was querying a `profiles` table, but the schema defined it as `members`. All references have been updated to use `members`.
2. **Missing schema column**: Added `created_by` column to the `communities` table to match what the application code expects.
3. **No seed data**: Created seed scripts to populate the database with demo data so you can see members, communities, and residencies in the UI.

## Prerequisites

1. **PostgreSQL Client (psql)**: You need `psql` installed on your system to run the database scripts.
   - **Windows**: Install from [PostgreSQL official site](https://www.postgresql.org/download/windows/) or use WSL
   - **macOS**: Install via Homebrew: `brew install postgresql`
   - **Linux**: Install via your package manager: `apt install postgresql-client` or `yum install postgresql`

2. **Supabase Project**: You need a Supabase project with the database URL configured in your environment variables.

## Configuration

Make sure you have the following environment variable set in your `.env.local` or `.env` file:

```bash
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

You can find your database URL in the Supabase dashboard:
- Go to **Settings** > **Database** > **Connection string** > **URI**

Also ensure you have your Supabase public credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Setup Instructions

### Option 1: Quick Setup (Recommended)

Run the combined setup script that applies the schema and seeds the database in one step:

```bash
npm run db:setup
```

This will:
1. Apply the database schema from `supabase/schema.sql`
2. Insert demo data (members, communities, residencies, interests, goals, connections, and comments)

### Option 2: Step-by-Step Setup

If you prefer to run each step separately:

1. **Apply the schema**:
   ```bash
   npm run db:apply
   ```

2. **Seed the database**:
   ```bash
   npm run db:seed
   ```

## What Gets Created

The comprehensive seed script creates a realistic community ecosystem:

- **10 Members** (various levels: resident, manager, guest, in_person):
  - Avery Johnson, River Chen, Marin Ibarra, Taylor Kim, Jordan Martinez
  - Casey Williams, Alex Thompson, Morgan Lee, Sam Patel, Riley Anderson
  - Each with bios, reputation scores, and unique backgrounds

- **2 Communities**:
  - Evergreen Co-Living (urban co-living hub)
  - Harbor Collective (waterfront makerspace)

- **3 Residencies** (with date ranges):
  - Unit A (at Evergreen, Q1 2024)
  - Studio Loft (at Evergreen, Feb-Apr 2024)
  - Harbor Suite (at Harbor, Jan-Jun 2024)

- **3 Projects** (active community initiatives):
  - Community Garden Initiative (permaculture focus)
  - Open Source Furniture Designs (maker collaboration)
  - Community Web Platform (resident coordination tool)

- **11 Project Participants** (with roles):
  - Project leads, contributors, mentors, and observers
  - Demonstrates all participation role types

- **8 Kudos** (peer recognition):
  - Recognition between members across different projects
  - Various weights (1-5) and meaningful notes

- **12 Comments** (across all entity types):
  - Community comments, residency updates
  - Member notes, project progress updates

- **10 Interests** (skills, hobbies, topics):
  - Web Development, Photography, Sustainability, Music Production
  - Community Building, UX Design, Woodworking, Data Science
  - Writing, Urban Planning

- **17 Member-Interest Links**:
  - Members tagged with relevant interests for discovery

- **7 Member Contacts**:
  - Social media, websites, email (public contact info)

- **7 Member Goals**:
  - Personal and professional goals with target dates

- **12 Social Connections**:
  - Friend, collaborator, and follow relationships
  - Realistic social graph for testing discovery features

- **5 Badges**:
  - Early Adopter, Project Starter, Kudos Champion
  - Community Builder, Collaboration Master

- **5 Badge Awards**:
  - Members recognized for their contributions

## Verifying the Setup

After running the setup, you can verify it worked by:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the dashboard**: Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

3. **Check the tabs**:
   - **Users tab**: Should show 10 members with bios, reputation scores, and interests
   - **Communities tab**: Should show 2 communities (Evergreen Co-Living, Harbor Collective)

4. **Test the flows**:
   - **View a member profile**: Click on any member to see their full profile with:
     - Bio, reputation score, and member level
     - Interests, goals, and contacts
     - Comments and activity
   - **View a community**: Click on a community to see:
     - Description and residencies
     - Associated projects
     - Community comments
   - **View a project**: Navigate to a project page to see:
     - Project description and details
     - Team roster with roles (lead, contributor, mentor, observer)
     - Kudos given between team members
     - Project comments and progress
   - **Explore discovery**: Check the discover page for:
     - Members with shared interests
     - Mutual connections
     - Trending members by reputation

## Troubleshooting

### "psql: command not found"

You need to install PostgreSQL client tools. See the Prerequisites section above.

### "SUPABASE_DB_URL environment variable is not set"

Make sure you have a `.env.local` or `.env` file in your project root with the `SUPABASE_DB_URL` variable set.

### "relation 'profiles' does not exist" error

This error should no longer occur. All code has been updated to use the `members` table instead of `profiles`. If you still see this error, make sure you've pulled the latest changes.

### Empty tabs even after seeding

1. Check your browser console for any errors
2. Verify the seed script ran successfully (you should see "✅ Database seeded successfully!")
3. Try running the Supabase test endpoint: [http://localhost:3000/api/supabase-test](http://localhost:3000/api/supabase-test)
4. Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set

### Network/DNS errors

If you see DNS errors (ENOTFOUND, ETIMEDOUT), check:
1. Your internet connection
2. That your Supabase project is running
3. IPv6 vs IPv4 issues - you may need to configure your network settings

## Resetting the Database

If you need to start fresh:

1. **Apply the reset schema** (drops all tables and recreates them):
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/reset_schema.sql
   ```

2. **Then run the setup again**:
   ```bash
   npm run db:setup
   ```

## Next Steps

Once your database is set up and you can see the demo data:

1. **Sign in with Privy**: Set up Privy authentication to enable full features
2. **Explore member profiles**: Click on any member to see their profile page
3. **Add your own data**: Create new communities, members, and projects
4. **Customize**: Modify the seed data in `scripts/seed.js` to match your needs

## Additional Resources

- [Nostra Community README](../readme.MD) - Product overview
- [Data Model](./data.MD) - Database schema documentation
- [User Flows](./flow.MD) - Application flows and features
- [UI Documentation](./UI.MD) - Component library and surfaces

