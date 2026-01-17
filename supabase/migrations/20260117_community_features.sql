-- =====================================================
-- Blog Community Features - Database Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- =====================================================

-- =====================================================
-- 1. EXTEND PROFILES TABLE
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_guest_author boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS author_bio text;

-- =====================================================
-- 2. USER FOLLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);

-- RLS for user_follows
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are publicly viewable" ON user_follows;
CREATE POLICY "Follows are publicly viewable" ON user_follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;
CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- =====================================================
-- 3. COMMENT VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_votes_comment ON comment_votes(comment_id);

-- Add vote counts to comments
ALTER TABLE blog_comments ADD COLUMN IF NOT EXISTS upvotes int DEFAULT 0;
ALTER TABLE blog_comments ADD COLUMN IF NOT EXISTS downvotes int DEFAULT 0;

-- RLS for comment_votes
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Votes are publicly viewable" ON comment_votes;
CREATE POLICY "Votes are publicly viewable" ON comment_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote" ON comment_votes;
CREATE POLICY "Users can vote" ON comment_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change vote" ON comment_votes;
CREATE POLICY "Users can change vote" ON comment_votes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove vote" ON comment_votes;
CREATE POLICY "Users can remove vote" ON comment_votes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. NOTIFICATIONS TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  new_post boolean DEFAULT true,
  reply_to_comment boolean DEFAULT true,
  new_follower boolean DEFAULT true,
  weekly_digest boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- RLS for notifications
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own prefs" ON notification_preferences;
CREATE POLICY "Users can view own prefs" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own prefs" ON notification_preferences;
CREATE POLICY "Users can update own prefs" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 5. CONTENT REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content_type text NOT NULL CHECK (content_type IN ('comment', 'post', 'profile')),
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'abuse', 'harassment', 'misinformation', 'other')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);

-- RLS for content_reports
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can report content" ON content_reports;
CREATE POLICY "Anyone can report content" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admin can view reports" ON content_reports;
CREATE POLICY "Admin can view reports" ON content_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin can update reports" ON content_reports;
CREATE POLICY "Admin can update reports" ON content_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- 6. GUEST AUTHORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS guest_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  bio text,
  portfolio_url text,
  created_at timestamptz DEFAULT now()
);

-- RLS for guest_authors
ALTER TABLE guest_authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can apply" ON guest_authors;
CREATE POLICY "Users can apply" ON guest_authors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own application" ON guest_authors;
CREATE POLICY "Users can view own application" ON guest_authors
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all applications" ON guest_authors;
CREATE POLICY "Admin can view all applications" ON guest_authors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin can update applications" ON guest_authors;
CREATE POLICY "Admin can update applications" ON guest_authors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- 7. TRIGGERS FOR FOLLOW COUNTS
-- =====================================================
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_follow_change ON user_follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =====================================================
-- 8. TRIGGERS FOR VOTE COUNTS
-- =====================================================
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE blog_comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE blog_comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE blog_comments SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.comment_id;
    ELSE
      UPDATE blog_comments SET downvotes = GREATEST(0, downvotes - 1) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE blog_comments SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.comment_id;
    ELSE
      UPDATE blog_comments SET downvotes = GREATEST(0, downvotes - 1) WHERE id = OLD.comment_id;
    END IF;
    IF NEW.vote_type = 'up' THEN
      UPDATE blog_comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE blog_comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_vote_change ON comment_votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON comment_votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- =====================================================
-- DONE! All tables and policies created.
-- =====================================================
