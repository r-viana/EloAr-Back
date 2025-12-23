-- Migration: 001_create_initial_schema
-- Description: Creates initial schema for EloAR system - 13 tables
-- Created: 2025-12-23
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. SCHOOL_YEARS - Academic years tracking
-- ============================================================================
CREATE TABLE school_years (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_school_years_active ON school_years(is_active);
CREATE INDEX idx_school_years_year ON school_years(year);

COMMENT ON TABLE school_years IS 'Academic years for student distribution management';
COMMENT ON COLUMN school_years.is_active IS 'Only one year should be active at a time';

-- ============================================================================
-- 2. GRADE_LEVELS - 12 grade levels (1st-9th + 3 high school)
-- ============================================================================
CREATE TABLE grade_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    order_index INTEGER NOT NULL UNIQUE,
    total_students INTEGER DEFAULT 0,
    classes_per_grade INTEGER DEFAULT 6,
    students_per_class INTEGER DEFAULT 45,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_order_index CHECK (order_index >= 1 AND order_index <= 12),
    CONSTRAINT chk_total_students CHECK (total_students >= 0)
);

CREATE INDEX idx_grade_levels_order ON grade_levels(order_index);

COMMENT ON TABLE grade_levels IS 'Grade levels from 1st to 12th grade';
COMMENT ON COLUMN grade_levels.order_index IS 'Sequential order: 1=1st grade, 9=9th grade, 10-12=High school';

-- ============================================================================
-- 3. CLASSES - Class definitions (e.g., "1º A", "2º B")
-- ============================================================================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    school_year_id INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
    grade_level_id INTEGER NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL,
    section CHAR(1) NOT NULL,
    capacity INTEGER DEFAULT 45,
    current_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_capacity CHECK (capacity > 0),
    CONSTRAINT chk_current_count CHECK (current_count >= 0 AND current_count <= capacity),
    CONSTRAINT uq_class_year_grade_section UNIQUE(school_year_id, grade_level_id, section)
);

CREATE INDEX idx_classes_school_year ON classes(school_year_id);
CREATE INDEX idx_classes_grade_level ON classes(grade_level_id);
CREATE INDEX idx_classes_section ON classes(section);

COMMENT ON TABLE classes IS 'Class definitions per academic year and grade level';
COMMENT ON COLUMN classes.section IS 'Class section: A, B, C, D, E, F';

-- ============================================================================
-- 4. STUDENTS - Student data with academic information
-- ============================================================================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    school_year_id INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
    grade_level_id INTEGER NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    external_id VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    birthdate DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    academic_average DECIMAL(4,2),
    behavioral_score DECIMAL(3,1),
    has_special_needs BOOLEAN DEFAULT false,
    special_needs_description TEXT,
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_academic_average CHECK (academic_average >= 0 AND academic_average <= 10),
    CONSTRAINT chk_behavioral_score CHECK (behavioral_score >= 0 AND behavioral_score <= 10)
);

CREATE INDEX idx_students_school_year ON students(school_year_id);
CREATE INDEX idx_students_grade_level ON students(grade_level_id);
CREATE INDEX idx_students_full_name ON students(full_name);
CREATE INDEX idx_students_external_id ON students(external_id);
CREATE INDEX idx_students_academic_average ON students(academic_average);

COMMENT ON TABLE students IS 'Student records with academic and personal information';
COMMENT ON COLUMN students.external_id IS 'External student ID from legacy system';
COMMENT ON COLUMN students.behavioral_score IS 'Behavioral score from 0-10';

-- ============================================================================
-- 5. STUDENT_PREFERENCES - Up to 3 preferred classmates per student
-- ============================================================================
CREATE TABLE student_preferences (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    preferred_student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_not_self_preference CHECK (student_id != preferred_student_id),
    CONSTRAINT uq_student_preference UNIQUE(student_id, preferred_student_id),
    CONSTRAINT uq_student_priority UNIQUE(student_id, priority)
);

CREATE INDEX idx_preferences_student ON student_preferences(student_id);
CREATE INDEX idx_preferences_preferred_student ON student_preferences(preferred_student_id);
CREATE INDEX idx_preferences_priority ON student_preferences(priority);

COMMENT ON TABLE student_preferences IS 'Student social preferences - up to 3 preferred classmates';
COMMENT ON COLUMN student_preferences.priority IS '1=First choice, 2=Second choice, 3=Third choice';

-- ============================================================================
-- 6. CONSTRAINT_TYPES - Categories of constraints
-- ============================================================================
CREATE TABLE constraint_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    weight INTEGER NOT NULL DEFAULT 100,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_constraint_types_code ON constraint_types(code);

COMMENT ON TABLE constraint_types IS 'Types of student constraints with associated weights';
COMMENT ON COLUMN constraint_types.weight IS 'Weight used in fitness calculation';

-- Insert default constraint types
INSERT INTO constraint_types (code, name, weight, description) VALUES
('CRITICAL', 'Restrição Crítica', 1000, 'Ordens judiciais, conflitos graves que impedem convivência'),
('HIGH', 'Restrição Alta', 500, 'Separações disciplinares importantes'),
('BEHAVIORAL', 'Separação Comportamental', 300, 'Conflitos comportamentais documentados'),
('MEDIUM', 'Restrição Média', 200, 'Restrições moderadas'),
('LOW', 'Restrição Baixa', 100, 'Restrições leves ou preferências administrativas');

-- ============================================================================
-- 7. STUDENT_CONSTRAINTS - Pairwise constraints (SEPARATE/GROUP)
-- ============================================================================
CREATE TABLE student_constraints (
    id SERIAL PRIMARY KEY,
    school_year_id INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
    student_a_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_b_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    constraint_type_id INTEGER NOT NULL REFERENCES constraint_types(id),
    action VARCHAR(10) NOT NULL CHECK (action IN ('SEPARATE', 'GROUP')),
    reason TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_not_same_students CHECK (student_a_id != student_b_id),
    CONSTRAINT uq_student_pair UNIQUE(school_year_id, student_a_id, student_b_id)
);

CREATE INDEX idx_constraints_school_year ON student_constraints(school_year_id);
CREATE INDEX idx_constraints_student_a ON student_constraints(student_a_id);
CREATE INDEX idx_constraints_student_b ON student_constraints(student_b_id);
CREATE INDEX idx_constraints_type ON student_constraints(constraint_type_id);
CREATE INDEX idx_constraints_action ON student_constraints(action);

COMMENT ON TABLE student_constraints IS 'Pairwise constraints between students';
COMMENT ON COLUMN student_constraints.action IS 'SEPARATE: must be in different classes, GROUP: must be in same class';

-- ============================================================================
-- 8. SIBLING_RULES - Sibling allocation rules
-- ============================================================================
CREATE TABLE sibling_rules (
    id SERIAL PRIMARY KEY,
    school_year_id INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
    student_a_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_b_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('SAME_CLASS', 'DIFFERENT_CLASS', 'NO_PREFERENCE')),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_not_same_siblings CHECK (student_a_id != student_b_id),
    CONSTRAINT uq_sibling_pair UNIQUE(school_year_id, student_a_id, student_b_id)
);

CREATE INDEX idx_sibling_rules_school_year ON sibling_rules(school_year_id);
CREATE INDEX idx_sibling_rules_student_a ON sibling_rules(student_a_id);
CREATE INDEX idx_sibling_rules_student_b ON sibling_rules(student_b_id);
CREATE INDEX idx_sibling_rules_type ON sibling_rules(rule_type);

COMMENT ON TABLE sibling_rules IS 'Rules for sibling allocation in classes';
COMMENT ON COLUMN sibling_rules.rule_type IS 'SAME_CLASS: siblings together, DIFFERENT_CLASS: siblings separated';

-- ============================================================================
-- 9. CONFIGURATIONS - Weight configurations for genetic algorithm (JSONB)
-- ============================================================================
CREATE TABLE configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    weights JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_configurations_name ON configurations(name);
CREATE INDEX idx_configurations_default ON configurations(is_default);
CREATE INDEX idx_configurations_weights ON configurations USING GIN(weights);

COMMENT ON TABLE configurations IS 'Weight configurations for genetic algorithm optimization';
COMMENT ON COLUMN configurations.weights IS 'JSON object with fitness weights: {critical_constraints: 1000, ...}';

-- Insert default configuration
INSERT INTO configurations (name, description, is_default, weights) VALUES
('Padrão Balanceado', 'Configuração padrão balanceada para otimização', true,
'{"critical_constraints": 1000, "high_constraints": 500, "behavioral_separation": 300, "sibling_rules": 200, "student_preferences": 100, "academic_balance": 50, "class_size_balance": 50}'::jsonb);

INSERT INTO configurations (name, description, is_default, weights) VALUES
('Foco em Restrições', 'Prioriza restrições disciplinares e comportamentais', false,
'{"critical_constraints": 1000, "high_constraints": 700, "behavioral_separation": 500, "sibling_rules": 200, "student_preferences": 50, "academic_balance": 30, "class_size_balance": 30}'::jsonb);

INSERT INTO configurations (name, description, is_default, weights) VALUES
('Foco Social', 'Prioriza preferências sociais dos alunos', false,
'{"critical_constraints": 1000, "high_constraints": 400, "behavioral_separation": 200, "sibling_rules": 300, "student_preferences": 400, "academic_balance": 50, "class_size_balance": 50}'::jsonb);

-- ============================================================================
-- 10. DISTRIBUTIONS - Saved distribution solutions
-- ============================================================================
CREATE TABLE distributions (
    id SERIAL PRIMARY KEY,
    school_year_id INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
    grade_level_id INTEGER NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    configuration_id INTEGER REFERENCES configurations(id),
    name VARCHAR(255) NOT NULL,
    fitness_score DECIMAL(10,2),
    is_final BOOLEAN DEFAULT false,
    is_optimized BOOLEAN DEFAULT false,
    metadata JSONB,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_distributions_school_year ON distributions(school_year_id);
CREATE INDEX idx_distributions_grade_level ON distributions(grade_level_id);
CREATE INDEX idx_distributions_is_final ON distributions(is_final);
CREATE INDEX idx_distributions_fitness_score ON distributions(fitness_score);
CREATE INDEX idx_distributions_metadata ON distributions USING GIN(metadata);

COMMENT ON TABLE distributions IS 'Saved distribution solutions (manual or optimized)';
COMMENT ON COLUMN distributions.is_final IS 'True if this is the finalized distribution for the year';
COMMENT ON COLUMN distributions.is_optimized IS 'True if generated by genetic algorithm';
COMMENT ON COLUMN distributions.metadata IS 'Additional metadata: execution time, preferences met, etc.';

-- ============================================================================
-- 11. DISTRIBUTION_ASSIGNMENTS - Student-to-class allocations
-- ============================================================================
CREATE TABLE distribution_assignments (
    id SERIAL PRIMARY KEY,
    distribution_id INTEGER NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_distribution_student UNIQUE(distribution_id, student_id)
);

CREATE INDEX idx_assignments_distribution ON distribution_assignments(distribution_id);
CREATE INDEX idx_assignments_student ON distribution_assignments(student_id);
CREATE INDEX idx_assignments_class ON distribution_assignments(class_id);

COMMENT ON TABLE distribution_assignments IS 'Student allocations to classes within a distribution';

-- ============================================================================
-- 12. OPTIMIZATION_RUNS - Genetic algorithm execution history
-- ============================================================================
CREATE TABLE optimization_runs (
    id SERIAL PRIMARY KEY,
    run_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    distribution_id INTEGER REFERENCES distributions(id) ON DELETE SET NULL,
    school_year_id INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
    grade_level_id INTEGER NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    configuration_id INTEGER REFERENCES configurations(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_generation INTEGER DEFAULT 0,
    total_generations INTEGER DEFAULT 2000,
    best_fitness DECIMAL(10,2),
    population_size INTEGER DEFAULT 200,
    execution_time_seconds INTEGER,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_optimization_runs_uuid ON optimization_runs(run_uuid);
CREATE INDEX idx_optimization_runs_status ON optimization_runs(status);
CREATE INDEX idx_optimization_runs_school_year ON optimization_runs(school_year_id);
CREATE INDEX idx_optimization_runs_grade_level ON optimization_runs(grade_level_id);
CREATE INDEX idx_optimization_runs_created_at ON optimization_runs(created_at DESC);

COMMENT ON TABLE optimization_runs IS 'History of genetic algorithm optimization executions';
COMMENT ON COLUMN optimization_runs.run_uuid IS 'UUID for tracking optimization runs';
COMMENT ON COLUMN optimization_runs.progress IS 'Progress percentage (0-100)';

-- ============================================================================
-- 13. AUDIT_LOGS - Change tracking
-- ============================================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Audit trail for all significant data changes';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before change (for UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after change (for INSERT/UPDATE)';

-- ============================================================================
-- TRIGGERS for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_school_years_updated_at BEFORE UPDATE ON school_years
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_levels_updated_at BEFORE UPDATE ON grade_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_constraints_updated_at BEFORE UPDATE ON student_constraints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributions_updated_at BEFORE UPDATE ON distributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - Grade Levels (12 grades)
-- ============================================================================

INSERT INTO grade_levels (name, order_index, total_students, classes_per_grade, students_per_class) VALUES
('1º Ano', 1, 270, 6, 45),
('2º Ano', 2, 270, 6, 45),
('3º Ano', 3, 270, 6, 45),
('4º Ano', 4, 270, 6, 45),
('5º Ano', 5, 270, 6, 45),
('6º Ano', 6, 270, 6, 45),
('7º Ano', 7, 270, 6, 45),
('8º Ano', 8, 270, 6, 45),
('9º Ano', 9, 270, 6, 45),
('1º Ensino Médio', 10, 270, 6, 45),
('2º Ensino Médio', 11, 270, 6, 45),
('3º Ensino Médio', 12, 270, 6, 45);

-- ============================================================================
-- VIEWS - Useful reporting views
-- ============================================================================

-- View: Student count per class
CREATE OR REPLACE VIEW vw_class_student_counts AS
SELECT
    c.id AS class_id,
    c.name AS class_name,
    c.section,
    c.capacity,
    sy.year AS school_year,
    gl.name AS grade_level,
    COUNT(da.student_id) AS student_count,
    c.capacity - COUNT(da.student_id) AS available_spots
FROM classes c
JOIN school_years sy ON c.school_year_id = sy.id
JOIN grade_levels gl ON c.grade_level_id = gl.id
LEFT JOIN distribution_assignments da ON da.class_id = c.id
GROUP BY c.id, c.name, c.section, c.capacity, sy.year, gl.name;

-- View: Student preferences summary
CREATE OR REPLACE VIEW vw_student_preferences_summary AS
SELECT
    s.id AS student_id,
    s.full_name,
    COUNT(sp.id) AS preferences_count,
    STRING_AGG(ps.full_name, ', ' ORDER BY sp.priority) AS preferred_students
FROM students s
LEFT JOIN student_preferences sp ON s.id = sp.student_id
LEFT JOIN students ps ON sp.preferred_student_id = ps.id
GROUP BY s.id, s.full_name;

-- View: Constraint types summary
CREATE OR REPLACE VIEW vw_constraints_summary AS
SELECT
    ct.name AS constraint_type,
    COUNT(sc.id) AS constraint_count,
    SUM(CASE WHEN sc.action = 'SEPARATE' THEN 1 ELSE 0 END) AS separation_count,
    SUM(CASE WHEN sc.action = 'GROUP' THEN 1 ELSE 0 END) AS grouping_count
FROM constraint_types ct
LEFT JOIN student_constraints sc ON ct.id = sc.constraint_type_id
GROUP BY ct.name;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify table creation
SELECT
    'Tables created: ' || COUNT(*) || ' / 13' AS status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'school_years', 'grade_levels', 'classes', 'students',
    'student_preferences', 'constraint_types', 'student_constraints',
    'sibling_rules', 'configurations', 'distributions',
    'distribution_assignments', 'optimization_runs', 'audit_logs'
);
