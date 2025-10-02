# Generate list of all profiles

Run this in pgadmin to download the CSV:

```sql
SELECT 
    spd.name,
    spd.email,
    STRING_AGG(
        dl.level || ' in ' || array_to_string(dl.major, ', ') || 
        CASE 
            WHEN dl.minor IS NOT NULL AND array_length(dl.minor, 1) > 0 
            THEN ' (Minor: ' || array_to_string(dl.minor, ', ') || ')' 
            ELSE '' 
        END || ' from ' || dl.institution || 
        ' (' || dl.yearStarted || '-' || COALESCE(dl.yearEnded::TEXT, 'Present') || ')',
        ', '
        ORDER BY dl.yearStarted DESC
    ) AS degrees,
    STRING_AGG(
        dl.gpa::TEXT,
        ', '
        ORDER BY dl.yearStarted DESC
    ) AS gpas,
    spd.linkedin,
    spd.github,
    spd.website
FROM 
    student_profile_details spd
LEFT JOIN 
    degree_listings dl ON spd.username = dl.username
GROUP BY 
    spd.username, spd.name, spd.email, spd.linkedin, spd.github, spd.website
ORDER BY 
    spd.name;
```
