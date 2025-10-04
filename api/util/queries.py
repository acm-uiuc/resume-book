from psycopg import sql

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
    query = sql.SQL(
        """
    SELECT 
        spd.username,
        spd.name, 
        spd.email,
        spd.resumepdfurl as resume_pdf_url,
        jsonb_agg(jsonb_build_object('yearEnded', dl.yearEnded, 'level', dl.level, 'major', dl.major)) AS degrees
    FROM student_profile_details spd
    JOIN degree_listings dl ON spd.username = dl.username
    WHERE 1=1
    """
    )

    conditions = []

    # Degree types condition
    if degree_types:
        placeholders = sql.SQL(", ").join(
            [sql.Literal(degree) for degree in degree_types]
        )
        conditions.append(sql.SQL("dl.level IN ({})").format(placeholders))

    # GPA condition - use 'is not None' to allow 0 as a valid value
    if gpa is not None:
        conditions.append(sql.SQL("dl.gpa >= {}").format(sql.Literal(gpa)))

    # Graduation years condition
    if graduation_years:
        placeholders = sql.SQL(", ").join(
            [sql.Literal(year) for year in graduation_years]
        )
        conditions.append(sql.SQL("dl.yearEnded IN ({})").format(placeholders))

    # Majors condition
    if majors:
        major_conditions = sql.SQL(" OR ").join(
            [
                sql.SQL("{} = ANY(dl.major)").format(sql.Literal(major))
                for major in majors
            ]
        )
        conditions.append(sql.SQL("({})").format(major_conditions))

    # Add all conditions
    for condition in conditions:
        query = sql.SQL("{}\n    AND {}").format(query, condition)

    query = sql.SQL("{}\nGROUP BY spd.username;").format(query)

    return query
