# UI Architecture

The Nostra Community prototype leans on Tailwind CSS and lightweight React components to deliver a cohesive member experience. This reference maps major pages to their supporting components and highlights reusable primitives.

## Global primitives

- [`components/shell/SiteHeader.tsx`](./components/shell/SiteHeader.tsx) – persistent top navigation with Home link, auth-aware Members/Communities tabs, and the sign-in/user menu slot.
- [`components/shell/SiteNav.tsx`](./components/shell/SiteNav.tsx) – client-side navigation pill set that highlights the active section by path/query.
- [`components/ui/Button.tsx`](./components/ui/Button.tsx) – primary, secondary, and subtle button variants using Tailwind utility classes.
- [`components/ui/Card.tsx`](./components/ui/Card.tsx) – shared card container with padding, rounded corners, and responsive shadow states.
- [`components/ui/Input.tsx`](./components/ui/Input.tsx), [`Textarea.tsx`](./components/ui/Textarea.tsx), [`Select.tsx`](./components/ui/Select.tsx) – form controls styled for dark/light parity and consistent spacing.

## Page shells

- [`app/layout.tsx`](./app/layout.tsx) – wraps the application with fonts and Tailwind global styles.
- [`components/MemberProfileShell.tsx`](./components/MemberProfileShell.tsx) – orchestrates the member profile layout, balancing left/right columns and mobile stacking.
- [`components/ProjectPageShell.tsx`](./components/ProjectPageShell.tsx) – renders project overview tabs, roster, activity, and comment thread.

## Page inventory

| Route | Purpose | Notable Components |
| --- | --- | --- |
| `/login` | Privy authentication entry point. | Privy login button (embedded), Tailwind layout defined directly in [`app/(auth)/login/page.tsx`](./app/(auth)/login/page.tsx). |
| `/onboarding` | Intake form required after authentication. | [`actions/onboarding.ts`](./actions/onboarding.ts), Input/Textarea primitives, Card shell. |
| `/` | Home with auth-aware Members/Communities feed and community search. | Card primitives, Input for search, Profile avatar rendering within the member list. |
| `/members/[id]` | Full member profile with actions. | ProfileCard, [`components/ContactsList.tsx`](./components/ContactsList.tsx), [`components/BadgesList.tsx`](./components/BadgesList.tsx), [`components/InterestsChips.tsx`](./components/InterestsChips.tsx), [`components/GoalsList.tsx`](./components/GoalsList.tsx), [`components/KudosFeed.tsx`](./components/KudosFeed.tsx), [`components/CommentsThread.tsx`](./components/CommentsThread.tsx), [`components/GiveKudosModal.tsx`](./components/GiveKudosModal.tsx), [`components/ConnectSheet.tsx`](./components/ConnectSheet.tsx). |
| `/projects/[id]` | Project overview, participants, and activity. | ProjectPageShell, [`components/ProjectRoster.tsx`](./components/ProjectRoster.tsx), GiveKudosModal, CommentsThread. |
| `/communities` & `/communities/[id]` | Explore communities and residencies with server-side search. | Card primitives, Input for filtering, CommentsThread for community discussions. |
| `/discover` | Member discovery with mutuals and shared interests. | [`components/DiscoveryList.tsx`](./components/DiscoveryList.tsx), ProfileCard chips. |
| `/admin/interests` | Admin-only curated interests management. | Input, Button, Select primitives. |
| `/admin/badges` | Admin-only badge catalog management and awarding shortcuts. | BadgesList, Button/Input primitives. |

## Interaction components

- **GiveKudosModal** – Modal workflow for sending kudos with weight slider and optional project association.
- **ConnectSheet** – Slide-over allowing members to request, accept, or block relationships.
- **DiscoveryList** – Groups members into Mutual Connections, Shared Interests, and Trending sections with snapshot coverage in tests.
- **CommentsThread** – Fetches and displays polymorphic comments, with inline composer for authenticated members.
- **GoalsList** – Shows public/private goals with privacy pills and edit affordances for owners.

## Feedback & telemetry

Toast hooks surface success and error states across modals and forms. The central error helpers in [`lib/errors.ts`](./lib/errors.ts) provide consistent error codes for budget limits, authorization issues, and validation failures, enabling clear UI messaging.
