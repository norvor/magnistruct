-- Up
CREATE TABLE IF NOT EXISTS sys_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES sys_organizations(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES sys_users(id),
    filename VARCHAR(255) NOT NULL,
    file_key VARCHAR(512) NOT NULL, -- Path or S3 key
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    entity_type VARCHAR(50), -- e.g., 'work_item', 'deal'
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_entity ON sys_files(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS sys_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES sys_organizations(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL, -- For display
    label VARCHAR(100) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON sys_api_keys(key_hash);

-- Down
-- DROP TABLE IF EXISTS sys_api_keys;
-- DROP TABLE IF EXISTS sys_files;
