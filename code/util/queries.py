GET_USER_PROFILE_QUERY = """
SELECT 
    spd.*,
    JSON_AGG(dl.*) AS degrees
FROM 
    student_profile_details AS spd
LEFT JOIN 
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

def generate_search_query(degree_types, gpa, graduation_years, majors):
    query = """
    SELECT 
        spd.username,
        spd.name, 
        spd.email,
        spd.resumepdfurl as resume_pdf_url,
        jsonb_agg(jsonb_build_object('yearEnded', dl.yearEnded, 'level', dl.level)) AS degrees
    FROM student_profile_details spd
    JOIN degree_listings dl ON spd.username = dl.username
    WHERE
    """
    
    conditions = []

    # Degree types condition
    if degree_types:
        degree_condition = "dl.level IN ({})".format(
            ', '.join(["'{}'".format(degree) for degree in degree_types])
        )
        conditions.append(degree_condition)
    
    # GPA condition
    if gpa:
        gpa_condition = "dl.gpa >= {}".format(gpa)
        conditions.append(gpa_condition)
    
    # Graduation years condition
    if graduation_years:
        graduation_condition = "dl.yearEnded IN ({})".format(
            ', '.join(graduation_years)
        )
        conditions.append(graduation_condition)
    
    # Majors condition
    if majors:
        majors_condition = " OR ".join(
            ["'{}' = ANY(dl.major)".format(major) for major in majors]
        )
        majors_condition = "({})".format(majors_condition)
        conditions.append(majors_condition)
    
    # Combine all conditions
    query += " AND ".join(conditions)
    query += "\nGROUP BY spd.username;"
    
    return query