GET_USER_PROFILE_QUERY = """
SELECT 
    spd.*,
    JSON_AGG(dl.*) AS degrees
FROM 
    student_profile_details AS spd
JOIN 
    degree_listings AS dl ON spd.username = dl.username
WHERE 
    spd.username = %s
GROUP BY 
    spd.username;
"""

INSERT_BASE_PROFILE = """
INSERT INTO student_profile_details
(username, name, email, linkedin, github, website, bio, skills, work_auth_required, sponsorship_required, resumepdfurl)
VALUES 
(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
"""

INSERT_DEGREES = """
INSERT INTO degree_listings
(username, level, yearStarted, yearEnded, institution, major, minor, gpa)
VALUES 
(%s, %s, %s, %s, %s, %s, %s, %s);
"""

DELETE_PROFILE = """
DELETE FROM student_profile_details WHERE username = %s;
"""

