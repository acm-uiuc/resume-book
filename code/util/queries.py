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