# Database Schema & Row-Level Security

## Tables

### `members`
Stores all member information and doubles as the authorization source for admin access.

| Column | Type | Description |
|---|---|---|
| `id` | `integer` (PK, auto-increment) | Unique member ID |
| `name` | `text` | Full name |
| `department` | `text` | Academic department |
| `role` | `text` | Member role (see below) |
| `email` | `text` | Email (used for auth matching) |
| `mobile` | `text` | Phone number |
| `academicYear` | `text` | I, II, III, or IV |
| `is_registered` | `boolean` | Registration flag |

### `attendance`
Daily attendance records.

| Column | Type | Description |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment |
| `member_id` | `integer` (FK → members.id) | Member reference |
| `date` | `date` | Attendance date |
| `is_present` | `boolean` | Present (true) or absent (false) |

Unique constraint: `(member_id, date)` — one record per member per day.

### `sessions`
Club sessions/events.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Session ID |
| `title` | `text` | Session title |
| `date` | `date` | Session date |
| `handler` | `text` | Handler name |
| `handler_id` | `integer` (FK → members.id) | Handler member reference |
| `is_approved` | `boolean` | Approval status |

### `session_feedback`
Feedback submitted by members for sessions.

| Column | Type | Description |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment |
| `session_id` | `uuid` (FK → sessions.id) | Session reference |
| `member_id` | `integer` (FK → members.id) | Member reference |
| `rating` | `numeric` | Rating score |
| `date` | `date` | Feedback date |
| `created_at` | `timestamptz` | Creation timestamp |

### `session_interests`
Member interest in attending sessions.

| Column | Type | Description |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment |
| `member_id` | `integer` (FK → members.id) | Member reference |
| `created_at` | `timestamptz` | Creation timestamp |

### `notifications`
Push notifications for members.

| Column | Type | Description |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment |
| `member_id` | `integer` (FK → members.id) | Member reference |
| `created_at` | `timestamptz` | Creation timestamp |

### `push_subscriptions`
Web push subscription data for browser notifications.

| Column | Type | Description |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment |
| `member_id` | `integer` (FK → members.id) | Member reference |
| *(subscription data)* | `jsonb` | Push subscription object |

### `feedback`
Website feedback submissions (public form).

| Column | Type | Description |
|---|---|---|
| `id` | `bigint` (PK) | Auto-increment |
| `created_at` | `timestamptz` | Submission timestamp |
| `name` | `text` | Submitter name |
| `email` | `text` | Submitter email |
| `feedback_type` | `text` | Category |
| `message` | `text` | Content |
| `status` | `text` | pending / in-progress / resolved / rejected |

## Relationships

```
members ──1:N──> attendance
members ──1:N──> session_interests
members ──1:N──> session_feedback
members ──1:N──> notifications
members ──1:N──> push_subscriptions
members ──1:N──> sessions (as handler)
sessions ──1:N──> session_feedback
```

## Roles

| Role | Admin Access | Can Mark Attendance |
|---|---|---|
| President | Yes | Yes |
| Vice President | Yes | Yes |
| Administrator | Yes | Yes |
| Session Incharge | No* | No |
| Advisor | No | No |
| Member | No | No |
| Trainee | No | No |

*Session Incharge can access the admin panel but cannot mark attendance at the database level via `record_attendance_for_date`.

## Key Database Functions

### `is_admin_member()`
Returns `true` if the authenticated user's role is in: `President`, `Vice President`, `Administrator`, `Session Incharge`. Used by RLS policies.

### `record_attendance_for_date(p_date, p_present_member_ids, p_mark_working_day, p_absent_member_id)`
The core attendance function. Called via `supabase.rpc()`. It:
1. Checks `is_admin_member()` (only President/VP/Admin can proceed)
2. Deletes all attendance for the given date
3. Inserts present records for the provided member IDs
4. Returns `{ saved_present_count, working_day_recorded }`

### `get_monthly_attendance_report(p_month_key)`
Generates a full attendance report for all members in a given month (e.g., `"2025-03"`). Returns member name, department, role, working days, present days, absent dates, and percentage.

### `find_member_attendance_by_identifier(p_search_type, p_search_value)`
Public-facing function (granted to `anon`) used by the member self-service page. Accepts `'email'` or `'mobile'` as search type and returns the member's attendance summary.

## Row-Level Security Policies

RLS ensures that:
- **Members**: can only read their own data; admins have full access
- **Attendance**: similar self/admin pattern
- **Feedback**: admins can read/update; any authenticated user can submit
- **Sessions**: any authenticated user can read; admins can write
- **Session feedback**: admins can delete; users can read their own; session handlers can read feedback for their sessions
- **Push subscriptions**: users manage their own; admins can also manage

Full policy definitions are in `supabase/queries-and-rls.sql`.

## Indexes

Key performance indexes:
- `attendance_member_date_unique_idx` — unique on `(member_id, date)`
- `attendance_member_date_idx` — on `(member_id, date)`
- `sessions_handler_date_idx` — on `(handler_id, date desc)`
- `session_feedback_session_created_idx` — on `(session_id, created_at desc)`
- `session_feedback_member_date_idx` — on `(member_id, date desc)`
- `feedback_status_created_idx` — on `(status, created_at desc)`
