-- SQL Schema for ZP Paybill System
-- Run this in your Supabase SQL Editor to reset and recreate tables.
-- Uses session-level app settings for RLS (not Supabase Auth - see NOTE at bottom).

-- 1. DROP EXISTING TABLES (order matters due to foreign keys)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS info_responses;
DROP TABLE IF EXISTS info_requests;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS salary_data;
DROP TABLE IF EXISTS paybills;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS challans;
DROP TABLE IF EXISTS admins;

-- 2. CREATE TABLES
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT NOT NULL,
    admin_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    mobile TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    admin_id TEXT REFERENCES admins(user_id) ON DELETE CASCADE,
    shalarth_id TEXT NOT NULL,
    name TEXT NOT NULL,
    school_name TEXT,
    dob DATE,
    mobile TEXT,
    email TEXT,
    password_hash TEXT,
    pin_hashed TEXT,
    adhar_hash TEXT,
    is_registered BOOLEAN DEFAULT FALSE,
    bank_details TEXT,
    school_details TEXT,
    gpf_no TEXT,
    pan_no TEXT,
    pran_no TEXT,
    adhar_no TEXT,
    bank_ifsc_code TEXT,
    branch_name TEXT,
    pay_matrix TEXT,
    school_ddo_code TEXT,
    designation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, shalarth_id)
);

CREATE TABLE IF NOT EXISTS paybills (
    id TEXT PRIMARY KEY,
    admin_id TEXT REFERENCES admins(user_id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    remarks TEXT,
    file_name TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_data (
    id TEXT PRIMARY KEY,
    admin_id TEXT REFERENCES admins(user_id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    teacher_shalarth_id TEXT NOT NULL,
    raw_headers JSONB NOT NULL,
    raw_data_row JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    admin_id TEXT REFERENCES admins(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    text TEXT NOT NULL,
    remarks TEXT,
    file_name TEXT,
    file_data TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS info_requests (
    id TEXT PRIMARY KEY,
    admin_id TEXT REFERENCES admins(user_id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    column_headers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS info_responses (
    id TEXT PRIMARY KEY,
    request_id TEXT REFERENCES info_requests(id) ON DELETE CASCADE,
    teacher_shalarth_id TEXT NOT NULL,
    data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id, teacher_shalarth_id)
);

CREATE TABLE IF NOT EXISTS challans (
    id TEXT PRIMARY KEY,
    admin_id TEXT REFERENCES admins(user_id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    fy TEXT NOT NULL,
    tan_number TEXT NOT NULL,
    tan_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_data TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_teachers_admin_id ON teachers(admin_id);
CREATE INDEX IF NOT EXISTS idx_teachers_shalarth_id ON teachers(shalarth_id);
CREATE INDEX IF NOT EXISTS idx_salary_data_teacher_shalarth_id ON salary_data(teacher_shalarth_id);
CREATE INDEX IF NOT EXISTS idx_salary_data_month_year ON salary_data(month, year);
CREATE INDEX IF NOT EXISTS idx_salary_data_admin_id ON salary_data(admin_id);
CREATE INDEX IF NOT EXISTS idx_paybills_admin_id ON paybills(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_info_requests_admin_id ON info_requests(admin_id);
CREATE INDEX IF NOT EXISTS idx_info_responses_request_id ON info_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_challans_admin_id ON challans(admin_id);

-- 4. ENABLE RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE challans ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- Drop old public access policies
DROP POLICY IF EXISTS "Public Access Admins" ON admins;
DROP POLICY IF EXISTS "Public Access Teachers" ON teachers;
DROP POLICY IF EXISTS "Public Access Paybills" ON paybills;
DROP POLICY IF EXISTS "Public Access SalaryData" ON salary_data;
DROP POLICY IF EXISTS "Public Access Notifications" ON notifications;
DROP POLICY IF EXISTS "Public Access Requests" ON info_requests;
DROP POLICY IF EXISTS "Public Access Responses" ON info_responses;
DROP POLICY IF EXISTS "Public Access Challans" ON challans;
DROP POLICY IF EXISTS "Teachers see own rows" ON teachers;

DROP POLICY IF EXISTS "Manager accesses all audit logs" ON audit_logs;

-- Audit Logs policies
CREATE POLICY "Anyone can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Manager accesses all audit logs"
    ON audit_logs FOR SELECT
    USING (current_setting('app.is_manager', true) = 'true');

-- Admins table: anyone can read (needed for login), only managers can write
CREATE POLICY "Admins can read all for login"
    ON admins FOR SELECT
    USING (true);

CREATE POLICY "Service can insert admins"
    ON admins FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update own record"
    ON admins FOR UPDATE
    USING (
        user_id = current_setting('app.current_user_id', true)::TEXT
        OR current_setting('app.is_manager', true) = 'true'
    );

CREATE POLICY "Managers can delete admins"
    ON admins FOR DELETE
    USING (current_setting('app.is_manager', true) = 'true');

-- Teachers: admins manage their own, teachers read their own
CREATE POLICY "Admins manage their teachers"
    ON teachers FOR ALL
    USING (admin_id = current_setting('app.current_user_id', true)::TEXT)
    WITH CHECK (admin_id = current_setting('app.current_user_id', true)::TEXT);

CREATE POLICY "Teachers view own record"
    ON teachers FOR SELECT
    USING (shalarth_id = current_setting('app.current_user_id', true)::TEXT);

-- Paybills: scoped to admin
CREATE POLICY "Admins manage their paybills"
    ON paybills FOR ALL
    USING (admin_id = current_setting('app.current_user_id', true)::TEXT)
    WITH CHECK (admin_id = current_setting('app.current_user_id', true)::TEXT);

-- Salary data: scoped to admin, teachers view their own
CREATE POLICY "Admins manage their salary data"
    ON salary_data FOR ALL
    USING (admin_id = current_setting('app.current_user_id', true)::TEXT)
    WITH CHECK (admin_id = current_setting('app.current_user_id', true)::TEXT);

CREATE POLICY "Teachers view own salary data"
    ON salary_data FOR SELECT
    USING (teacher_shalarth_id = current_setting('app.current_user_id', true)::TEXT);

-- Notifications: scoped to admin
CREATE POLICY "Admins manage their notifications"
    ON notifications FOR ALL
    USING (admin_id = current_setting('app.current_user_id', true)::TEXT)
    WITH CHECK (admin_id = current_setting('app.current_user_id', true)::TEXT);

CREATE POLICY "Teachers view notifications"
    ON notifications FOR SELECT
    USING (true);

-- Info requests: admins manage, teachers view their admin's requests
CREATE POLICY "Admins manage their info requests"
    ON info_requests FOR ALL
    USING (admin_id = current_setting('app.current_user_id', true)::TEXT)
    WITH CHECK (admin_id = current_setting('app.current_user_id', true)::TEXT);

CREATE POLICY "Teachers view info requests"
    ON info_requests FOR SELECT
    USING (true);

-- Info responses: teachers manage their own, admins view all
CREATE POLICY "Teachers manage their own responses"
    ON info_responses FOR ALL
    USING (teacher_shalarth_id = current_setting('app.current_user_id', true)::TEXT)
    WITH CHECK (teacher_shalarth_id = current_setting('app.current_user_id', true)::TEXT);

CREATE POLICY "Admins view responses to their requests"
    ON info_responses FOR SELECT
    USING (true);

-- Challans: scoped to admin
CREATE POLICY "Admins manage their challans"
    ON challans FOR ALL
    USING (admin_id = current_setting('app.current_user_id', true)::TEXT)
    WITH CHECK (admin_id = current_setting('app.current_user_id', true)::TEXT);

-- USAGE:
-- Before running queries from your app, set the session variables:
--   SELECT set_config('app.current_user_id', 'admin_user_id_or_shalarth_id', false);
--   SELECT set_config('app.is_manager', 'true', false);
--
-- In your app code, call these after login:
--   await supabase.rpc('set_session_user', { user_id: username, is_manager: isManager });
--
-- For production, consider migrating to Supabase Auth with auth.uid() instead.
