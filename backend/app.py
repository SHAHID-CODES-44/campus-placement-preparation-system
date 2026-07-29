from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import pymysql
import datetime
import os
from flask import send_from_directory
from werkzeug.utils import secure_filename
import io
import csv          
from flask import make_response  

app = Flask(__name__)
CORS(app)   

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response
    
# ============================================================
# DATABASE CONNECTION
# ============================================================
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',          
    'password': '9620683277',          
    'database': 'campus_placement',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db():
    return pymysql.connect(**DB_CONFIG)

def query_db(sql, params=None, fetch='all'):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            if fetch == 'all':
                result = cur.fetchall()
            elif fetch == 'one':
                result = cur.fetchone()
            else:
                conn.commit()
                result = cur.lastrowid
        return result
    finally:
        conn.close()

def execute_db(sql, params=None):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            conn.commit()
            return cur.lastrowid
    finally:
        conn.close()

# ============================================================
# HELPER
# ============================================================
def success(data=None, message="Success"):
    return jsonify({"status": "success", "message": message, "data": data}), 200

def error(message="Error", code=400):
    return jsonify({"status": "error", "message": message}), code


# ============================================================
# AUTH ROUTES
# ============================================================

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    body = request.json
    username = body.get('username')
    password = body.get('password')
    admin = query_db(
        "SELECT * FROM admins WHERE username=%s AND password=%s",
        (username, password), fetch='one'
    )
    if admin:
        return success({"id": admin['id'], "username": admin['username'],
                        "full_name": admin['full_name'], "email": admin['email'],
                        "role": "admin"}, "Admin login successful")
    return error("Invalid credentials", 401)


@app.route('/api/student/register', methods=['POST'])
def student_register():
    body = request.json
    required = ['full_name', 'email', 'password']
    for f in required:
        if not body.get(f):
            return error(f"'{f}' is required")
    # check duplicate email
    existing = query_db("SELECT id FROM students WHERE email=%s", (body['email'],), fetch='one')
    if existing:
        return error("Email already registered")
    sid = execute_db(
        "INSERT INTO students (full_name, email, password, college, branch, graduation_year, phone) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (body['full_name'], body['email'], body['password'],
         body.get('college'), body.get('branch'), body.get('graduation_year'), body.get('phone'))
    )
    return success({"id": sid}, "Registration successful")


@app.route('/api/student/login', methods=['POST'])
def student_login():
    body = request.json
    email = body.get('email')
    password = body.get('password')
    student = query_db(
        "SELECT * FROM students WHERE email=%s AND password=%s",
        (email, password), fetch='one'
    )
    if student:
        return success({"id": student['id'], "full_name": student['full_name'],
                        "email": student['email'], "college": student['college'],
                        "branch": student['branch'], "role": "student"}, "Login successful")
    return error("Invalid credentials", 401)


# ============================================================
# COMPANIES
# ============================================================

@app.route('/api/companies', methods=['GET'])
def get_companies():
    companies = query_db("SELECT * FROM companies ORDER BY name")
    return success(companies)

@app.route('/api/companies', methods=['POST'])
def add_company():
    body = request.json
    cid = execute_db(
        "INSERT INTO companies (name, logo_url, description, sector) VALUES (%s,%s,%s,%s)",
        (body['name'], body.get('logo_url'), body.get('description'), body.get('sector'))
    )
    return success({"id": cid}, "Company added successfully")

@app.route('/api/companies/<int:cid>', methods=['PUT'])
def update_company(cid):
    body = request.json
    execute_db(
        "UPDATE companies SET name=%s, logo_url=%s, description=%s, sector=%s WHERE id=%s",
        (body['name'], body.get('logo_url'), body.get('description'), body.get('sector'), cid)
    )
    return success(message="Company updated")

@app.route('/api/companies/<int:cid>', methods=['DELETE'])
def delete_company(cid):
    execute_db("DELETE FROM companies WHERE id=%s", (cid,))
    return success(message="Company deleted")


# ============================================================
# STUDY MATERIALS
# ============================================================
@app.route('/api/study-materials', methods=['GET'])
def get_study_materials():
    category = request.args.get('category')
    company_id = request.args.get('company_id')
    
    # Base SQL query
    sql = "SELECT sm.*, c.name as company_name FROM study_materials sm LEFT JOIN companies c ON sm.company_id=c.id WHERE 1=1"
    params = []
    
    # Filter logic
    if category:
        sql += " AND sm.category=%s"
        params.append(category)
    if company_id:
        sql += " AND sm.company_id=%s"
        params.append(company_id)
        
    sql += " ORDER BY sm.created_at DESC"
    
    materials = query_db(sql, params)
    return success(materials)

# Configuration: Path where files will be stored
UPLOAD_FOLDER = 'static/uploads/materials'
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Creates folder if it doesn't exist

@app.route('/api/study-materials', methods=['POST'])
def add_study_material():
    # 1. Get the file
    file = request.files.get('file')
    if not file:
        return error("No file selected", 400)
    
    # 2. Secure the filename and save it
    filename = secure_filename(file.filename)
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    
    # 3. Get text data from request.form (NOT request.json)
    title = request.form.get('title')
    category = request.form.get('category')
    content = request.form.get('content')
    company_id = request.form.get('company_id')
    if not company_id or company_id == '' or company_id == 'null':
        company_id = None
    created_by = request.form.get('created_by', 1)

    # 4. Insert into DB using the filename as the file_url
    try:
        sid = execute_db(
            "INSERT INTO study_materials (title, category, content, file_url, company_id, created_by) VALUES (%s,%s,%s,%s,%s,%s)",
            (title, category, content, filename, company_id, created_by)
        )
        return success({"id": sid}, "File uploaded and study material added")
    except Exception as e:
        print(f"Database Error: {e}")
        return error("Database storage failed. Check your column types!", 500)

# NEW: Route to allow students to download/view the file
@app.route('/api/study-materials/download/<filename>')
def download_material(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ============================================================
# APTITUDE QUESTIONS
# ============================================================

@app.route('/api/aptitude', methods=['GET'])
def get_aptitude_questions():
    topic = request.args.get('topic')
    difficulty = request.args.get('difficulty')
    company_id = request.args.get('company_id')
    limit = request.args.get('limit', 10)
    sql = "SELECT aq.*, c.name as company_name FROM aptitude_questions aq LEFT JOIN companies c ON aq.company_id=c.id WHERE 1=1"
    params = []
    if topic:
        sql += " AND aq.topic=%s"
        params.append(topic)
    if difficulty:
        sql += " AND aq.difficulty=%s"
        params.append(difficulty)
    if company_id:
        sql += " AND aq.company_id=%s"
        params.append(company_id)
    sql += f" ORDER BY RAND() LIMIT {int(limit)}"
    questions = query_db(sql, params)
    return success(questions)

@app.route('/api/aptitude', methods=['POST'])
def add_aptitude_question():
    body = request.json
    qid = execute_db(
        """INSERT INTO aptitude_questions
           (question, option_a, option_b, option_c, option_d, correct_option,
            explanation, topic, difficulty, company_id, created_by)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (body['question'], body['option_a'], body['option_b'], body['option_c'],
         body['option_d'], body['correct_option'], body.get('explanation'),
         body.get('topic'), body.get('difficulty', 'medium'),
         body.get('company_id'), body.get('created_by', 1))
    )
    return success({"id": qid}, "Question added")

@app.route('/api/aptitude/<int:qid>', methods=['PUT'])
def update_aptitude_question(qid):
    body = request.json
    execute_db(
        """UPDATE aptitude_questions SET question=%s, option_a=%s, option_b=%s,
           option_c=%s, option_d=%s, correct_option=%s, explanation=%s,
           topic=%s, difficulty=%s, company_id=%s WHERE id=%s""",
        (body['question'], body['option_a'], body['option_b'], body['option_c'],
         body['option_d'], body['correct_option'], body.get('explanation'),
         body.get('topic'), body.get('difficulty', 'medium'), body.get('company_id'), qid)
    )
    return success(message="Updated")

@app.route('/api/aptitude/<int:qid>', methods=['DELETE'])
def delete_aptitude_question(qid):
    execute_db("DELETE FROM aptitude_questions WHERE id=%s", (qid,))
    return success(message="Deleted")

@app.route('/api/aptitude/topics', methods=['GET'])
def get_aptitude_topics():
    topics = query_db("SELECT DISTINCT topic FROM aptitude_questions WHERE topic IS NOT NULL ORDER BY topic")
    return success([t['topic'] for t in topics])

@app.route('/api/study-materials/<int:sid>', methods=['DELETE'])
def delete_study_material(sid):
    execute_db("DELETE FROM study_materials WHERE id=%s", (sid,))
    return success(message="Study material deleted")


# ============================================================
# TECHNICAL QUESTIONS
# ============================================================

@app.route('/api/technical', methods=['GET'])
def get_technical_questions():
    topic = request.args.get('topic')
    difficulty = request.args.get('difficulty')
    company_id = request.args.get('company_id')
    sql = "SELECT tq.*, c.name as company_name FROM technical_questions tq LEFT JOIN companies c ON tq.company_id=c.id WHERE 1=1"
    params = []
    if topic:
        sql += " AND tq.topic=%s"
        params.append(topic)
    if difficulty:
        sql += " AND tq.difficulty=%s"
        params.append(difficulty)
    if company_id:
        sql += " AND tq.company_id=%s"
        params.append(company_id)
    sql += " ORDER BY tq.created_at DESC"
    questions = query_db(sql, params)
    return success(questions)

@app.route('/api/technical', methods=['POST'])
def add_technical_question():
    body = request.json
    qid = execute_db(
        """INSERT INTO technical_questions
           (question, answer, topic, subtopic, difficulty, company_id, created_by)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (body['question'], body['answer'], body['topic'], body.get('subtopic'),
         body.get('difficulty', 'medium'), body.get('company_id'), body.get('created_by', 1))
    )
    return success({"id": qid}, "Question added")

@app.route('/api/technical/<int:qid>', methods=['PUT'])
def update_technical_question(qid):
    body = request.json
    execute_db(
        """UPDATE technical_questions SET question=%s, answer=%s, topic=%s,
           subtopic=%s, difficulty=%s, company_id=%s WHERE id=%s""",
        (body['question'], body['answer'], body['topic'], body.get('subtopic'),
         body.get('difficulty', 'medium'), body.get('company_id'), qid)
    )
    return success(message="Updated")

@app.route('/api/technical/<int:qid>', methods=['DELETE'])
def delete_technical_question(qid):
    execute_db("DELETE FROM technical_questions WHERE id=%s", (qid,))
    return success(message="Deleted")

@app.route('/api/technical/topics', methods=['GET'])
def get_technical_topics():
    topics = query_db("SELECT DISTINCT topic FROM technical_questions ORDER BY topic")
    return success([t['topic'] for t in topics])

# ============================================================
# TEST SESSION (Submit a test)
# ============================================================

@app.route('/api/test/submit', methods=['POST'])
def submit_test():
    """
    Body: {
      student_id: 1,
      test_type: "aptitude",
      time_taken: 300,
      answers: [
        { question_id: 1, selected_option: "A", correct_option: "C" },
        ...
      ]
    }
    """
    body = request.json
    answers = body.get('answers', [])
    total = len(answers)
    correct = sum(1 for a in answers if a['selected_option'] == a['correct_option'])
    wrong = total - correct
    score = round((correct / total * 100), 2) if total > 0 else 0

    session_id = execute_db(
        """INSERT INTO test_sessions
           (student_id, test_type, total_questions, correct_answers, wrong_answers, score, time_taken)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (body['student_id'], body['test_type'], total, correct, wrong, score, body.get('time_taken', 0))
    )

    # Store individual answers
    for a in answers:
        is_correct = 1 if a['selected_option'] == a['correct_option'] else 0
        execute_db(
            "INSERT INTO test_answers (session_id, question_id, selected_option, is_correct) VALUES (%s,%s,%s,%s)",
            (session_id, a['question_id'], a['selected_option'], is_correct)
        )

    return success({
        "session_id": session_id,
        "total": total,
        "correct": correct,
        "wrong": wrong,
        "score": score
    }, "Test submitted successfully")


@app.route('/api/test/history/<int:student_id>', methods=['GET'])
def get_test_history(student_id):
    sessions = query_db(
        "SELECT * FROM test_sessions WHERE student_id=%s ORDER BY completed_at DESC",
        (student_id,)
    )
    return success(sessions)

@app.route('/api/test/session/<int:session_id>', methods=['GET'])
def get_session_details(session_id):
    session = query_db("SELECT * FROM test_sessions WHERE id=%s", (session_id,), fetch='one')
    answers = query_db("SELECT * FROM test_answers WHERE session_id=%s", (session_id,))
    return success({"session": session, "answers": answers})


# ============================================================
# NOTIFICATIONS
# ============================================================

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    student_id = request.args.get('student_id')
    sql = "SELECT n.*, a.full_name as admin_name FROM notifications n JOIN admins a ON n.created_by=a.id WHERE n.target='all'"
    params = []
    if student_id:
        sql += " OR (n.target='specific' AND n.student_id=%s)"
        params.append(student_id)
    sql += " ORDER BY n.created_at DESC"
    notifications = query_db(sql, params)
    return success(notifications)

@app.route('/api/notifications', methods=['POST'])
def add_notification():
    body = request.json
    nid = execute_db(
        "INSERT INTO notifications (title, message, target, student_id, created_by) VALUES (%s,%s,%s,%s,%s)",
        (body['title'], body['message'], body.get('target', 'all'),
         body.get('student_id'), body.get('created_by', 1))
    )
    return success({"id": nid}, "Notification sent")

@app.route('/api/notifications/<int:nid>', methods=['DELETE'])
def delete_notification(nid):
    execute_db("DELETE FROM notifications WHERE id=%s", (nid,))
    return success(message="Deleted")


# ============================================================
# STUDENTS (Admin views)
# ============================================================

@app.route('/api/students', methods=['GET'])
def get_all_students():
    students = query_db(
        "SELECT id, full_name, email, college, branch, graduation_year, phone, created_at FROM students ORDER BY created_at DESC"
    )
    return success(students)

@app.route('/api/students/<int:sid>', methods=['GET'])
def get_student(sid):
    student = query_db(
        "SELECT id, full_name, email, college, branch, graduation_year, phone, created_at FROM students WHERE id=%s",
        (sid,), fetch='one'
    )
    if not student:
        return error("Student not found", 404)
    return success(student)

@app.route('/api/students/<int:sid>', methods=['DELETE'])
def delete_student(sid):
    execute_db("DELETE FROM students WHERE id=%s", (sid,))
    return success(message="Student deleted")


# ============================================================
# DASHBOARD STATS (Admin)
# ============================================================
@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    total_students = query_db("SELECT COUNT(*) as cnt FROM students", fetch='one')['cnt']
    total_materials = query_db("SELECT COUNT(*) as cnt FROM study_materials", fetch='one')['cnt']
    total_aptitude = query_db("SELECT COUNT(*) as cnt FROM aptitude_questions", fetch='one')['cnt']
    total_technical = query_db("SELECT COUNT(*) as cnt FROM technical_questions", fetch='one')['cnt']
    total_tests = query_db("SELECT COUNT(*) as cnt FROM test_sessions", fetch='one')['cnt']
    avg_score_raw = query_db("SELECT AVG(score) as avg FROM test_sessions", fetch='one')['avg']
    
    avg_score = round(float(avg_score_raw), 2) if avg_score_raw else 0

    recent_students = query_db(
        "SELECT id, full_name, email, college, created_at FROM students ORDER BY created_at DESC LIMIT 5"
    )
    top_scorers_raw = query_db(
        """SELECT s.full_name, s.college, MAX(ts.score) as best_score
           FROM test_sessions ts JOIN students s ON ts.student_id=s.id
           GROUP BY s.id ORDER BY best_score DESC LIMIT 5"""
    )

    top_scorers = []
    for row in top_scorers_raw:
        top_scorers.append({
            "full_name": row['full_name'],
            "college": row['college'],
            "best_score": round(float(row['best_score']), 2) if row['best_score'] else 0
        })

    return success({
        "total_students": total_students,
        "total_materials": total_materials,
        "total_aptitude": total_aptitude,
        "total_technical": total_technical,
        "total_tests": total_tests,
        "avg_score": avg_score,
        "recent_students": recent_students,
        "top_scorers": top_scorers
    })

# ============================================================
# STUDENT DASHBOARD
# ============================================================

@app.route('/api/student/dashboard/<int:student_id>', methods=['GET'])
def student_dashboard(student_id):
    student = query_db(
        "SELECT id, full_name, email, college, branch FROM students WHERE id=%s",
        (student_id,), fetch='one'
    )
    test_stats = query_db(
        """SELECT COUNT(*) as total_tests, AVG(score) as avg_score,
           MAX(score) as best_score, SUM(correct_answers) as total_correct
           FROM test_sessions WHERE student_id=%s""",
        (student_id,), fetch='one'
    )
    recent_tests = query_db(
        "SELECT * FROM test_sessions WHERE student_id=%s ORDER BY completed_at DESC LIMIT 5",
        (student_id,)
    )
    notifications = query_db(
        "SELECT * FROM notifications WHERE target='all' ORDER BY created_at DESC LIMIT 5"
    )
    return success({
        "student": student,
        "test_stats": {
            "total_tests": test_stats['total_tests'],
            "avg_score": round(float(test_stats['avg_score']), 2) if test_stats['avg_score'] else 0,
            "best_score": round(float(test_stats['best_score']), 2) if test_stats['best_score'] else 0,
            "total_correct": test_stats['total_correct'] or 0
        },
        "recent_tests": recent_tests,
        "notifications": notifications
    })


# ============================================================
# PERFORMANCE REPORT
# ============================================================

@app.route('/api/reports/student/<int:student_id>', methods=['GET'])
def student_report(student_id):
    student = query_db(
        "SELECT id, full_name, email, college, branch FROM students WHERE id=%s",
        (student_id,), fetch='one'
    )
    all_tests = query_db(
        "SELECT * FROM test_sessions WHERE student_id=%s ORDER BY completed_at",
        (student_id,)
    )
    by_type = query_db(
        """SELECT test_type, COUNT(*) as attempts, AVG(score) as avg_score,
           MAX(score) as best_score FROM test_sessions
           WHERE student_id=%s GROUP BY test_type""",
        (student_id,)
    )
    return success({
        "student": student,
        "all_tests": all_tests,
        "by_type": by_type
    })

@app.route('/reports/overall', methods=['GET'])
def overall_report():
    # 1. Scores Trend (Decimal and Date Fix)
    scores_trend_raw = query_db(
        """SELECT DATE(completed_at) as date, AVG(score) as avg_score
           FROM test_sessions GROUP BY DATE(completed_at) ORDER BY date DESC LIMIT 30"""
    )
    scores_trend = []
    for row in scores_trend_raw:
        scores_trend.append({
            "date": str(row['date']) if row['date'] else None,
            "avg_score": round(float(row['avg_score']), 2) if row['avg_score'] else 0
        })

    # 2. Top Students (Decimal Fix)
    top_students_raw = query_db(
        """SELECT s.full_name, s.college, s.branch,
           COUNT(ts.id) as tests_taken, AVG(ts.score) as avg_score, MAX(ts.score) as best_score
           FROM students s LEFT JOIN test_sessions ts ON s.id=ts.student_id
           GROUP BY s.id ORDER BY avg_score DESC LIMIT 10"""
    )
    top_students = []
    for row in top_students_raw:
        top_students.append({
            "full_name": row['full_name'],
            "college": row['college'],
            "branch": row['branch'],
            "tests_taken": row['tests_taken'],
            "avg_score": round(float(row['avg_score']), 2) if row['avg_score'] else 0,
            "best_score": round(float(row['best_score']), 2) if row['best_score'] else 0
        })

    # 3. Question Stats (CODING REMOVED)
    question_stats = {
        "aptitude": query_db("SELECT COUNT(*) as cnt FROM aptitude_questions", fetch='one')['cnt'],
        "technical": query_db("SELECT COUNT(*) as cnt FROM technical_questions", fetch='one')['cnt']
    }

    return success({
        "scores_trend": scores_trend,
        "top_students": top_students,
        "question_stats": question_stats
    })
    
# ============================================================
# APPLICATION TRACKER
# ============================================================

@app.route('/api/applications/student/<int:student_id>', methods=['GET'])
def get_student_applications(student_id):
    apps = query_db(
        "SELECT * FROM job_applications WHERE student_id=%s ORDER BY updated_at DESC",
        (student_id,)
    )
    return success(apps)

@app.route('/api/applications/all', methods=['GET'])
def get_all_applications():
    sql = """
        SELECT ja.*, s.full_name as student_name 
        FROM job_applications ja 
        JOIN students s ON ja.student_id = s.id 
        ORDER BY ja.updated_at DESC
    """
    apps = query_db(sql)
    return success(apps)

@app.route('/api/applications', methods=['POST'])
def add_application():
    body = request.json
    aid = execute_db(
        """INSERT INTO job_applications 
           (student_id, company_name, job_role, current_stage, location, package, date_applied) 
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (
            body['student_id'],
            body['company_name'],
            body['job_role'],
            body.get('current_stage', 'Applied'),
            body.get('location'),
            body.get('package'),
            body.get('date_applied')
        )
    )
    return success({"id": aid}, "Application tracked successfully")

@app.route('/api/applications/<int:aid>/stage', methods=['PATCH'])
def update_application_stage(aid):
    body = request.json
    if body.get('stage'):
        execute_db(
            "UPDATE job_applications SET current_stage=%s WHERE id=%s",
            (body['stage'], aid)
        )
    if body.get('status'):
        execute_db(
            "UPDATE job_applications SET status=%s WHERE id=%s",
            (body['status'], aid)
        )
    return success(message="Updated successfully")

# 1. Route to upload the offer letter and finalize selection
@app.route('/api/applications/<int:aid>/upload-offer', methods=['POST'])
def upload_offer_letter(aid):
    if 'file' not in request.files:
        return error("No file provided")
    
    file = request.files['file']
    if file.filename == '':
        return error("No file selected")

    # Define path for offers
    OFFER_FOLDER = 'static/uploads/offers'
    os.makedirs(OFFER_FOLDER, exist_ok=True)
    
    filename = secure_filename(f"offer_{aid}_{file.filename}")
    file.save(os.path.join(OFFER_FOLDER, filename))

    # Update DB: Move stage to Offer, status to Selected, and save filename
    execute_db(
        "UPDATE job_applications SET current_stage='Offer', status='Selected', offer_letter=%s WHERE id=%s",
        (filename, aid)
    )
    return success(message="Offer letter uploaded! You are now marked as Selected.")

# 2. Route for Admin to download the student list as CSV
@app.route('/api/applications/export', methods=['GET'])
def export_applications():
    stage = request.args.get('stage')
    sql = """
        SELECT s.full_name, s.email, ja.company_name, ja.job_role, ja.current_stage, ja.status 
        FROM job_applications ja 
        JOIN students s ON ja.student_id = s.id
    """
    params = []
    if stage:
        sql += " WHERE ja.current_stage = %s"
        params.append(stage)

    data = query_db(sql, params)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Student Name', 'Email', 'Company', 'Role', 'Stage', 'Status'])
    for row in data:
        writer.writerow([row['full_name'], row['email'], row['company_name'], row['job_role'], row['current_stage'], row['status']])

    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename=placement_report_{stage or 'all'}.csv"
    response.headers["Content-type"] = "text/csv"
    return response

# ============================================================
# RUN
# ============================================================
if __name__ == '__main__':
    app.run(debug=True, port=5000) 
    