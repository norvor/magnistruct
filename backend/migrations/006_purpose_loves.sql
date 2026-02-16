-- Up
CREATE TABLE IF NOT EXISTS life_purpose_loves (
    purpose_id UUID NOT NULL REFERENCES life_purposes(id) ON DELETE CASCADE,
    love_id UUID NOT NULL REFERENCES life_loves(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (purpose_id, love_id)
);

CREATE INDEX idx_purpose_loves_purpose ON life_purpose_loves(purpose_id);
CREATE INDEX idx_purpose_loves_love ON life_purpose_loves(love_id);

-- Down
-- DROP TABLE IF EXISTS life_purpose_loves;
