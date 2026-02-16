-- =========================================================================================
-- I. THE SYSTEM CORE (IDENTITY & SESSIONS)
-- =========================================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SYS_USERS (The Global Identity)
CREATE TABLE IF NOT EXISTS sys_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    job_title TEXT,
    bio TEXT,
    theme TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SYS_SESSIONS (For Cookie Auth)
CREATE TABLE IF NOT EXISTS sys_sessions (
    token TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================================================
-- II. THE GOVERNANCE LAYER (SIMPLIFIED)
-- =========================================================================================

-- 3. SYS_CUSTODY_CHAIN (Ownership History)
CREATE TABLE IF NOT EXISTS sys_custody_chain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'goal', 'action', etc.
    entity_id UUID NOT NULL,
    previous_owner_id UUID REFERENCES sys_users(id),
    new_owner_id UUID REFERENCES sys_users(id),
    transferred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- 4. SYS_ACCESS_GRANTS (Left for future sharing, but mainly for self)
CREATE TABLE IF NOT EXISTS sys_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES sys_users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL, -- 'read', 'write', 'admin'
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES sys_users(id)
);


-- =========================================================================================
-- III. THE PRODUCT MODULES
-- =========================================================================================

-- --- MODULE A: PROJECT MANAGEMENT (PM) ---

-- 5. PM_GOALS
CREATE TABLE IF NOT EXISTS pm_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active', -- 'planning', 'active', 'paused', 'completed', 'cancelled'
    start_date DATE,
    target_end_date DATE,
    lead_id UUID REFERENCES sys_users(id),
    purpose_id UUID REFERENCES life_purposes(id) ON DELETE SET NULL,
    cover_image TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5a. PM_GOAL_STEPS (The 5-stage Achievement Plan)
CREATE TABLE IF NOT EXISTS pm_goal_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES pm_goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    position INT NOT NULL, -- 1 to 5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_goal_steps_goal ON pm_goal_steps(goal_id);

-- 6. PM_JOURNEYS
CREATE TABLE IF NOT EXISTS pm_journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    goal TEXT,
    status TEXT DEFAULT 'active', -- 'planned', 'active', 'completed', 'archived'
    goal_id UUID REFERENCES pm_goals(id) ON DELETE SET NULL,
    engine_spec_id UUID, -- References pm_specs(id) logically
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6a. PM_JOURNEY_GOALS (Compartments)
CREATE TABLE IF NOT EXISTS pm_journey_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID NOT NULL REFERENCES pm_journeys(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES pm_goals(id) ON DELETE CASCADE,
    position INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(journey_id, goal_id)
);

-- 7. PM_WORK_ITEMS (Actions)
CREATE TABLE IF NOT EXISTS pm_work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
    type TEXT DEFAULT 'action', -- 'action', 'story', 'epic'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    parent_id UUID REFERENCES pm_work_items(id),
    assignee_id UUID REFERENCES sys_users(id),
    journey_id UUID REFERENCES pm_journeys(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES pm_goals(id) ON DELETE SET NULL,
    story_points INT DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PM_HABITS
CREATE TABLE IF NOT EXISTS pm_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT DEFAULT 'daily',
    streak_count INT DEFAULT 0,
    last_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8a. PM_HABIT_LOGS (Completion Records)
CREATE TABLE IF NOT EXISTS pm_habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES pm_habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(habit_id, completed_date)
);

-- 9. PM_RESOURCES
CREATE TABLE IF NOT EXISTS pm_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    hourly_rate DECIMAL(10, 2),
    role TEXT,
    skills JSONB,
    capacity_hours_per_week INT DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. PM_ENVIRONMENTS
CREATE TABLE IF NOT EXISTS pm_environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT,
    type TEXT,
    provider TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PM_SPECS
CREATE TABLE IF NOT EXISTS pm_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    entity_type TEXT,
    entity_id UUID,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    version TEXT DEFAULT 'v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --- MODULE B: HUMAN RESOURCES (HR) ---

-- 12. HR_ACTIVITIES
CREATE TABLE IF NOT EXISTS hr_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assignee_id UUID REFERENCES sys_users(id),
    status TEXT DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --- MODULE C: CUSTOMER RELATIONSHIPS (CRM) ---

-- 13. CRM_OPPORTUNITIES
CREATE TABLE IF NOT EXISTS crm_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    value DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    stage TEXT DEFAULT 'new',
    probability INT DEFAULT 0,
    owner_id UUID REFERENCES sys_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- --- MODULE D: LIFE (The Whos, The Whys, The Wheres) ---

-- 14. LIFE_LOVES (The Whos)
CREATE TABLE IF NOT EXISTS life_loves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT, -- 'family', 'friend', 'mentor', 'partner'
    birthday DATE,
    contact_info JSONB, -- { "email": "...", "phone": "..." }
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. LIFE_PURPOSES (The Whys)
CREATE TABLE IF NOT EXISTS life_purposes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT, -- 'value', 'mission', 'vision'
    importance INT DEFAULT 1, -- 1-5 scale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15b. LIFE_PURPOSE_LOVES (Association between Purposes and Loves)
CREATE TABLE IF NOT EXISTS life_purpose_loves (
    purpose_id UUID NOT NULL REFERENCES life_purposes(id) ON DELETE CASCADE,
    love_id UUID NOT NULL REFERENCES life_loves(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (purpose_id, love_id)
);
CREATE INDEX IF NOT EXISTS idx_purpose_loves_purpose ON life_purpose_loves(purpose_id);
CREATE INDEX IF NOT EXISTS idx_purpose_loves_love ON life_purpose_loves(love_id);

-- 16. LIFE_PINS (The Wheres)
CREATE TABLE IF NOT EXISTS life_pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    coordinates POINT, -- PostGIS or simple point (x,y)
    type TEXT, -- 'home', 'work', 'travel', 'favorite'
    notes TEXT,
    image_url TEXT,
    visited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. LIFE_LOVE_PINS (Association between Loves and Pins)
CREATE TABLE IF NOT EXISTS life_love_pins (
    love_id UUID NOT NULL REFERENCES life_loves(id) ON DELETE CASCADE,
    pin_id UUID NOT NULL REFERENCES life_pins(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (love_id, pin_id)
);

-- IV. THE INTERACTION LAYER
-- =========================================================================================

-- 14. SYS_COMMENTS
CREATE TABLE IF NOT EXISTS sys_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES sys_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. SYS_REACTIONS
CREATE TABLE IF NOT EXISTS sys_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES sys_users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, user_id, emoji)
);


-- =========================================================================================
-- V. THE AWARENESS LAYER
-- =========================================================================================

-- 16. SYS_NOTIFICATIONS
CREATE TABLE IF NOT EXISTS sys_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. SYS_AUDIT_LOGS
CREATE TABLE IF NOT EXISTS sys_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sys_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================================================
-- VI. THE SUPER-POWER LAYER
-- =========================================================================================

-- 18. SYS_FILES
CREATE TABLE IF NOT EXISTS sys_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    s3_key TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    uploaded_by UUID REFERENCES sys_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. SYS_TAGS
CREATE TABLE IF NOT EXISTS sys_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 20. SYS_TAGGINGS
CREATE TABLE IF NOT EXISTS sys_taggings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID REFERENCES sys_tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tag_id, entity_type, entity_id)
);

-- 21. GLOBAL_LINKS
CREATE TABLE IF NOT EXISTS global_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_type TEXT NOT NULL,
    source_entity_id UUID NOT NULL,
    target_entity_type TEXT NOT NULL,
    target_entity_id UUID NOT NULL,
    link_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_entity_type, source_entity_id, target_entity_type, target_entity_id)
);
