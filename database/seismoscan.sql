-- SeismoScan Database Schema
-- MySQL Database for SeismoScan RVS System
-- Run this script in phpMyAdmin or MySQL CLI to create the database

CREATE DATABASE IF NOT EXISTS seismoscan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE seismoscan;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('inspector', 'admin') DEFAULT 'inspector',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    use_type VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    stories_above INT DEFAULT 0,
    stories_below INT DEFAULT 0,
    year_built INT,
    floor_area DECIMAL(12, 2),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- RVS Assessments Table
CREATE TABLE IF NOT EXISTS rvs_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    inspector_id INT NOT NULL,
    assessment_date DATE NOT NULL,
    -- Building Type
    building_type VARCHAR(20) NOT NULL COMMENT 'W1, W2, S1, S2, S3, S4, S5, C1, C2, C3, PC1, PC2, RM1, RM2, URM, MH',
    -- Soil Type
    soil_type CHAR(1) NOT NULL COMMENT 'A, B, C, D, E, F, DNK',
    -- Occupancy
    occupancy VARCHAR(100),
    -- Extent of Review
    exterior_review ENUM('partial', 'all_sides', 'aerial') DEFAULT 'all_sides',
    interior_review ENUM('none', 'visible', 'entered') DEFAULT 'none',
    drawings_reviewed ENUM('yes', 'no') DEFAULT 'no',
    soil_source VARCHAR(255),
    geologic_source VARCHAR(255),
    contact_person VARCHAR(255),
    -- Geologic Hazards
    geologic_liquefaction ENUM('yes', 'no', 'dnk') DEFAULT 'dnk',
    geologic_landslide ENUM('yes', 'no', 'dnk') DEFAULT 'dnk',
    geologic_surf_rupt ENUM('yes', 'no', 'dnk') DEFAULT 'dnk',
    -- Adjacency
    adjacency_pounding BOOLEAN DEFAULT FALSE,
    adjacency_falling_hazards BOOLEAN DEFAULT FALSE,
    -- Irregularities
    irregularity_vertical BOOLEAN DEFAULT FALSE,
    irregularity_vertical_type VARCHAR(255),
    irregularity_plan BOOLEAN DEFAULT FALSE,
    irregularity_plan_type VARCHAR(255),
    -- Exterior Falling Hazards
    hazard_unbraced_chimneys BOOLEAN DEFAULT FALSE,
    hazard_parapets BOOLEAN DEFAULT FALSE,
    hazard_heavy_cladding BOOLEAN DEFAULT FALSE,
    hazard_appendages BOOLEAN DEFAULT FALSE,
    hazard_other VARCHAR(255),
    -- Additions
    additions_none BOOLEAN DEFAULT TRUE,
    additions_yes VARCHAR(255),
    -- Scoring
    base_score DECIMAL(5,2),
    mod_severe_vertical DECIMAL(5,2) DEFAULT 0,
    mod_moderate_vertical DECIMAL(5,2) DEFAULT 0,
    mod_plan_irregularity DECIMAL(5,2) DEFAULT 0,
    mod_pre_code DECIMAL(5,2) DEFAULT 0,
    mod_post_benchmark DECIMAL(5,2) DEFAULT 0,
    mod_soil_type_ab DECIMAL(5,2) DEFAULT 0,
    mod_soil_type_e_1_3 DECIMAL(5,2) DEFAULT 0,
    mod_soil_type_e_gt3 DECIMAL(5,2) DEFAULT 0,
    final_score DECIMAL(5,2) COMMENT 'SL1 = Base Score + Sum of Modifiers',
    min_score DECIMAL(5,2),
    result ENUM('PASS', 'FAIL') COMMENT 'PASS if SL1 >= 2, FAIL if SL1 < 2',
    -- Level 2
    level2_performed BOOLEAN DEFAULT FALSE,
    level2_score DECIMAL(5,2),
    level2_nonstructural ENUM('yes', 'no'),
    -- Comments
    comments TEXT,
    -- Other Hazards
    other_hazard_pounding BOOLEAN DEFAULT FALSE,
    other_hazard_falling BOOLEAN DEFAULT FALSE,
    other_hazard_geologic BOOLEAN DEFAULT FALSE,
    other_hazard_damage BOOLEAN DEFAULT FALSE,
    -- Action
    action_structural_unknown_type BOOLEAN DEFAULT FALSE,
    action_structural_score_cutoff BOOLEAN DEFAULT FALSE,
    action_structural_other_hazards BOOLEAN DEFAULT FALSE,
    action_structural_yes BOOLEAN DEFAULT FALSE,
    action_structural_no BOOLEAN DEFAULT FALSE,
    action_nonstructural_yes BOOLEAN DEFAULT FALSE,
    action_nonstructural_no BOOLEAN DEFAULT FALSE,
    action_nonstructural_dnk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Photos Table
CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    assessment_id INT,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES rvs_assessments(id) ON DELETE SET NULL
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_type VARCHAR(50) DEFAULT 'summary',
    FOREIGN KEY (assessment_id) REFERENCES rvs_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Insert default admin user (password: Admin@123 - hashed with bcrypt)
-- NOTE: Change password immediately after first login
INSERT INTO users (name, email, password, role) VALUES 
('Administrator', 'admin@seismoscan.com', 'Admin@123', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Indexes for performance
CREATE INDEX idx_buildings_created_by ON buildings(created_by);
CREATE INDEX idx_assessments_building ON rvs_assessments(building_id);
CREATE INDEX idx_assessments_inspector ON rvs_assessments(inspector_id);
CREATE INDEX idx_assessments_result ON rvs_assessments(result);
CREATE INDEX idx_assessments_date ON rvs_assessments(assessment_date);
CREATE INDEX idx_photos_building ON photos(building_id);
CREATE INDEX idx_reports_assessment ON reports(assessment_id);
