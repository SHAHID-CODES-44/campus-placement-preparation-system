-- ============================================================
-- CAMPUS PLACEMENT PREPARATION SYSTEM - DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_placement;
USE campus_placement;

-- ============================================================
-- 1. ADMINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    college VARCHAR(150),
    branch VARCHAR(100),
    graduation_year INT,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. COMPANIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    description TEXT,
    sector VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. STUDY MATERIALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS study_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category ENUM('aptitude','technical','hr','coding','resume') NOT NULL,
    content TEXT NOT NULL,
    file_url VARCHAR(255),
    company_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- ============================================================
-- 5. APTITUDE QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS aptitude_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option ENUM('A','B','C','D') NOT NULL,
    explanation TEXT,
    topic VARCHAR(100),
    difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
    company_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- ============================================================
-- 6. TECHNICAL QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS technical_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    subtopic VARCHAR(100),
    difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
    company_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);
-- ============================================================
-- 7. TEST SESSIONS TABLE (when student attempts a test)
-- ============================================================
CREATE TABLE IF NOT EXISTS test_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    test_type ENUM('aptitude','technical') NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    wrong_answers INT DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    time_taken INT DEFAULT 0,  -- in seconds
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. TEST ANSWERS TABLE (student's answer per question)
-- ============================================================
CREATE TABLE IF NOT EXISTS test_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option ENUM('A','B','C','D'),
    is_correct TINYINT(1) DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE
);

-- ============================================================
-- 9. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target ENUM('all','specific') DEFAULT 'all',
    student_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- ============================================================
-- 10. STUDENT BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    resource_type ENUM('study_material','aptitude','technical','coding') NOT NULL,
    resource_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin
INSERT INTO admins (username, password, email, full_name) VALUES
('admin', 'admin123', 'admin@campus.com', 'Super Admin');

-- Students
INSERT INTO students (full_name, email, password, college, branch, graduation_year, phone) VALUES
('Rahul Sharma', 'rahul@student.com', 'rahul123', 'IIIT Hyderabad', 'Computer Science', 2025, '9876543210'),
('Priya Patel', 'priya@student.com', 'priya123', 'NIT Trichy', 'Information Technology', 2025, '9876543211'),
('Amit Kumar', 'amit@student.com', 'amit123', 'VIT Vellore', 'Computer Science', 2026, '9876543212');

-- Companies
INSERT INTO companies (name, logo_url, description, sector) VALUES
('TCS', 'https://logo.clearbit.com/tcs.com', 'Tata Consultancy Services - India\'s largest IT company', 'IT Services'),
('Infosys', 'https://logo.clearbit.com/infosys.com', 'Global leader in next-generation digital services', 'IT Services'),
('Wipro', 'https://logo.clearbit.com/wipro.com', 'Leading global information technology company', 'IT Services'),
('Cognizant', 'https://logo.clearbit.com/cognizant.com', 'Multinational technology corporation', 'IT Services'),
('Accenture', 'https://logo.clearbit.com/accenture.com', 'Global professional services company', 'Consulting'),
('Amazon', 'https://logo.clearbit.com/amazon.com', 'Global e-commerce and cloud computing giant', 'Product'),
('Google', 'https://logo.clearbit.com/google.com', 'Multinational technology conglomerate', 'Product');

-- Study Materials
INSERT INTO study_materials (title, category, content,file_url, company_id, created_by) VALUES
('Quantitative Aptitude Basics', 'aptitude', 'This guide covers all key topics: Number System, Percentages, Profit & Loss, Time & Work, Time & Distance, Simple & Compound Interest, Ratio & Proportion. Practice at least 20 questions daily for 2 weeks.', NULL, 1),
('Data Structures & Algorithms Guide', 'technical', 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting Algorithms, Searching Algorithms. Focus on time & space complexity for every algorithm. Practice coding on paper.', NULL, 1),
('HR Interview Preparation', 'hr', 'Common HR questions: Tell me about yourself, Strengths and weaknesses, Where do you see yourself in 5 years, Why do you want to join us, Situation-based questions. Practice STAR method.', NULL, 1),
('TCS NQT Preparation Guide', 'aptitude', 'TCS National Qualifier Test has: Verbal Ability, Reasoning Ability, Numerical Ability, Coding Section. Focus on speed and accuracy. Time limit is 180 minutes for full test.', 1, 1),
('Python Programming Fundamentals', 'technical', 'Variables, Data Types, Control Flow, Functions, OOP concepts, File Handling, Exception Handling, Modules. Python is highly preferred in product companies. Practice LeetCode problems in Python.', NULL, 1),
('Resume Writing Tips', 'resume', 'Keep resume to 1 page for freshers. Start bullet points with action verbs. Quantify achievements. Highlight key projects and skills. Use standard fonts like Arial or Calibri size 10-12.', NULL, 1),
('Infosys Interview Process', 'hr', 'Infosys hiring process: Online Test (Reasoning, Math, English, Puzzle), Technical Interview (basics of CS), HR Interview. Dress formally, be confident, know your resume well.', 2, 1),
('Database Management Systems', 'technical', 'Key topics: SQL queries (Joins, Subqueries, Aggregates), Normalization (1NF, 2NF, 3NF, BCNF), ACID properties, Transactions, Indexing, ER Diagrams. SQL is tested in almost every company.', NULL, 1);

-- Aptitude Questions
INSERT INTO aptitude_questions (question, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty, company_id, created_by) VALUES
('A train travels 60 km in 1 hour. How much time will it take to travel 240 km?', '2 hours', '3 hours', '4 hours', '5 hours', 'C', 'Speed = 60 km/h. Time = Distance/Speed = 240/60 = 4 hours', 'Time & Distance', 'easy', NULL, 1),
('If 20% of a number is 80, what is 30% of that number?', '100', '120', '140', '160', 'B', '20% = 80, so the number = 400. 30% of 400 = 120', 'Percentages', 'easy', NULL, 1),
('A shopkeeper sells an item for Rs 1200 at a profit of 20%. What was the cost price?', '900', '950', '1000', '1100', 'C', 'SP = CP * 1.2 => CP = 1200/1.2 = 1000', 'Profit & Loss', 'medium', NULL, 1),
('Two pipes A and B can fill a tank in 10 and 15 hours. If both are opened together, in how many hours will the tank be full?', '5', '6', '8', '12', 'B', '1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. So 6 hours.', 'Time & Work', 'medium', NULL, 1),
('Find the next number: 2, 6, 12, 20, 30, ?', '40', '42', '44', '48', 'B', 'Differences: 4,6,8,10,12. Next = 30+12 = 42', 'Number Series', 'easy', NULL, 1),
('TCS: If a car covers 25% of its journey at 20 km/h and remaining at 60 km/h. Find average speed.', '30 km/h', '36 km/h', '40 km/h', '48 km/h', 'B', 'Let total = 100 km. Time = 25/20 + 75/60 = 1.25 + 1.25 = 2.5 h. Avg = 100/2.5 = 40. But using harmonic mean for weighted avg = 36 km/h', 'Time & Distance', 'hard', 1, 1),
('What is the compound interest on Rs 5000 for 2 years at 10% per annum?', '1000', '1050', '1100', '1150', 'B', 'CI = P(1+r/100)^n - P = 5000(1.1)^2 - 5000 = 6050 - 5000 = 1050', 'Compound Interest', 'medium', NULL, 1),
('Infosys: A and B together can complete a work in 8 days. A alone takes 12 days. How many days for B alone?', '18', '20', '24', '30', 'C', '1/8 - 1/12 = 3/24 - 2/24 = 1/24. So B = 24 days', 'Time & Work', 'medium', 2, 1),
('Find the odd one out: 2, 3, 5, 7, 9, 11, 13', '9', '11', '13', '3', 'A', '9 = 3x3, it is not a prime number. All others are prime.', 'Number System', 'easy', NULL, 1),
('Simple interest on Rs 2000 for 3 years at 5% per annum is?', '200', '250', '300', '350', 'C', 'SI = P*R*T/100 = 2000*5*3/100 = 300', 'Simple Interest', 'easy', NULL, 1);

-- Technical Questions
INSERT INTO technical_questions (question, answer, topic, subtopic, difficulty, company_id, created_by) VALUES
('What is the difference between Array and Linked List?', 'Array: Fixed size, contiguous memory, O(1) random access, O(n) insertion/deletion.\nLinked List: Dynamic size, non-contiguous memory, O(n) access, O(1) insertion/deletion at known position.\nUse Array when size is known and access is frequent. Use Linked List when frequent insertion/deletion is needed.', 'Data Structures', 'Arrays', 'easy', NULL, 1),
('What are the four pillars of OOP?', '1. Encapsulation: Bundling data and methods together, hiding internal details.\n2. Abstraction: Showing only necessary features, hiding complexity.\n3. Inheritance: Child class inheriting properties of parent class.\n4. Polymorphism: Same method name behaving differently (method overloading & overriding).', 'OOP', 'Concepts', 'easy', NULL, 1),
('Explain the difference between Stack and Queue.', 'Stack: LIFO (Last In First Out). Operations: push (insert) and pop (remove). Example: function call stack, undo feature.\nQueue: FIFO (First In First Out). Operations: enqueue (insert) and dequeue (remove). Example: printer queue, BFS traversal.\nBoth have O(1) time for insert/delete.', 'Data Structures', 'Stack & Queue', 'easy', NULL, 1),
('What is normalization in DBMS? Explain 1NF, 2NF, 3NF.', '1NF: Each column should contain atomic (indivisible) values. No repeating groups.\n2NF: Must be in 1NF + no partial dependency (non-key attributes fully depend on primary key).\n3NF: Must be in 2NF + no transitive dependency (non-key attributes should not depend on other non-key attributes).\nNormalization reduces data redundancy and improves data integrity.', 'DBMS', 'Normalization', 'medium', NULL, 1),
('What is the difference between Process and Thread?', 'Process: Independent program in execution. Has its own memory space. Heavy, slower context switch. Communication via IPC.\nThread: Lightweight unit within a process. Shares memory with other threads. Faster context switch. Communication via shared memory.\nMulti-threading is preferred for performance within a single application.', 'OS', 'Process Management', 'medium', NULL, 1),
('Explain SQL JOINs with examples.', 'INNER JOIN: Returns matching rows from both tables.\nLEFT JOIN: All rows from left table + matching rows from right.\nRIGHT JOIN: All rows from right table + matching rows from left.\nFULL OUTER JOIN: All rows from both tables.\nExample: SELECT * FROM students s INNER JOIN results r ON s.id = r.student_id;', 'DBMS', 'SQL', 'medium', NULL, 1),
('What is Time Complexity? Explain Big O notation.', 'Time complexity measures how runtime grows with input size n.\nO(1): Constant - array access.\nO(log n): Logarithmic - binary search.\nO(n): Linear - linear search.\nO(n log n): Merge sort, heap sort.\nO(n²): Bubble sort, selection sort.\nO(2^n): Recursive fibonacci.\nAlways aim for O(n log n) or better in interviews.', 'Algorithms', 'Complexity', 'medium', NULL, 1),
('What is a deadlock? How to prevent it?', 'Deadlock: A situation where two or more processes are stuck waiting for each other to release resources.\nConditions (Coffman): Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.\nPrevention: Break any one condition. Use resource ordering, timeouts, banker\'s algorithm.\nDetection: Resource allocation graph.', 'OS', 'Deadlock', 'hard', NULL, 1),
('TCS: What is the difference between compiler and interpreter?', 'Compiler: Translates entire source code to machine code at once before execution. Faster execution, error shown after full compilation. Example: C, C++.\nInterpreter: Translates and executes line by line. Slower execution, error shown immediately. Example: Python, JavaScript.\nJava uses both: compiled to bytecode, then interpreted by JVM.', 'Programming', 'Compilation', 'easy', 1, 1),
('Explain Binary Search Tree (BST) properties and operations.', 'BST Property: For each node, left subtree values < node value < right subtree values.\nOperations:\n- Search: O(log n) average, O(n) worst\n- Insert: O(log n) average\n- Delete: O(log n) average\nInorder traversal of BST gives sorted sequence.\nUsed in: databases, file systems, symbol tables.', 'Data Structures', 'Trees', 'medium', NULL, 1);

-- Notifications
INSERT INTO notifications (title, message, target, created_by) VALUES
('Welcome to Campus Placement System!', 'Dear students, welcome to your one-stop platform for placement preparation. Start with study materials and attempt mock tests regularly!', 'all', 1),
('TCS Recruitment Drive Coming Soon', 'TCS will be visiting campus in 3 weeks. Please focus on TCS-specific materials and practice the NQT pattern tests.', 'all', 1),
('New Coding Challenges Added', '8 new coding challenges have been added including Two Sum, Binary Search, and Linked List problems. Happy coding!', 'all', 1);

SELECT 'Database setup complete!' AS Status;
SELECT COUNT(*) AS total_students FROM students;
SELECT COUNT(*) AS total_aptitude_questions FROM aptitude_questions;
SELECT COUNT(*) AS total_technical_questions FROM technical_questions;

-- ============================================================
-- 11 Creates the table for your new Application Tracker module
-- ============================================================


CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    company_name VARCHAR(100),
    job_role VARCHAR(100),
    current_stage ENUM('Applied', 'Aptitude', 'GD', 'Technical', 'HR', 'Offer') DEFAULT 'Applied',
    status ENUM('Active', 'Rejected', 'Selected') DEFAULT 'Active'
);
ALTER TABLE study_materials MODIFY company_id INT NULL;
ALTER TABLE job_applications 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE job_applications 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE job_applications 
ADD COLUMN location VARCHAR(100),
ADD COLUMN package VARCHAR(50),
ADD COLUMN date_applied DATE DEFAULT (CURDATE());
SET SQL_SAFE_UPDATES = 0;

DELETE c1 FROM companies c1
INNER JOIN companies c2
WHERE c1.id > c2.id AND c1.name = c2.name;

SET SQL_SAFE_UPDATES = 1;

-- ============================================================
-- 12 created table for the application requests 
-- ============================================================


CREATE TABLE stage_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    student_id INT,
    requested_stage ENUM('Aptitude','GD','Technical','HR','Offer'),
    proof VARCHAR(255),
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE stage_requests ADD COLUMN proof_link TEXT;
ALTER TABLE job_applications ADD COLUMN offer_letter VARCHAR(255) DEFAULT NULL;
SELECT id, title, file_url FROM study_materials;

SET SQL_SAFE_UPDATES = 0;
UPDATE study_materials SET file_url = 'quantitative-aptitude-ramandeep-singh.pdf' WHERE title = 'Quantitative Aptitude Basics';
UPDATE study_materials SET file_url = 'Data_Structures_and_Algorithms_in_Java_Fourth_Edition.pdf' WHERE title = 'Data Structures & Algorithms Guide';
UPDATE study_materials SET file_url = 'HR_Interview_Questions.pdf' WHERE title = 'HR Interview Preparation';
UPDATE study_materials SET file_url = 'INFOSYS_-APTITUDE-MODEL_PAPERS_1473177928759.pdf' WHERE title = 'Infosys Interview Process';
UPDATE study_materials SET file_url = 'DBMS_Handwritten_Notes.pdf' WHERE title = 'Database Management Systems';
UPDATE study_materials SET file_url = 'TCS_NQT_Previous_Years_Question__Answers.pdf' WHERE title = 'TCS NQT Preparation Guide';
UPDATE study_materials SET file_url = 'Lets_Code.pdf' WHERE title = 'Python Programming Fundamentals';
UPDATE study_materials SET file_url = 'Template-advice_1.docx' WHERE title = 'Resume Writing Tips';

-- Delete all duplicate rows (keep only ids 1-8)
DELETE FROM study_materials WHERE id > 8;

SET SQL_SAFE_UPDATES = 1;
SELECT COUNT(*) FROM study_materials;
SELECT id, title, file_url FROM study_materials;