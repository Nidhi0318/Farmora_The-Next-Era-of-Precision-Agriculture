USE farmer_portal;
SHOW TABLES;
DESCRIBE farmers;

SELECT 
    TABLE_SCHEMA AS `database_name`,
    TABLE_NAME AS `table_name`,
    COLUMN_NAME AS `column_name`,
    DATA_TYPE AS `data_type`
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'farmer_portal'
  AND (COLUMN_NAME LIKE '%name%' OR TABLE_NAME LIKE '%farmer%')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Complete list ordered by latest registration / update
SELECT 
    id,
    name AS farmer_name,
    phone_number,
    survey_number,
    district,
    taluk,
    hobli,
    land_area_acres,
    land_area_guntas,
    primary_crop,
    soil_type,
    created_at,
    updated_at
FROM farmers

ORDER BY updated_at DESC, id DESC;

-- Total number of registered farmers
SELECT COUNT(*) AS total_registered_farmers FROM farmers;

-- Farmers registered per District
SELECT 
    district,
    COUNT(*) AS total_farmers,
    ROUND(SUM(land_area_acres), 2) AS total_acres_cultivated
FROM farmers
GROUP BY district
ORDER BY total_farmers DESC;

-- Farmers grouped by Primary Crop
SELECT 
    primary_crop,
    COUNT(*) AS farmers_growing,
    ROUND(AVG(land_area_acres), 2) AS avg_acres_per_farmer
FROM farmers
GROUP BY primary_crop
ORDER BY farmers_growing DESC;

-- 10 Most recently registered or updated farmers
SELECT 
    id, name, phone_number, survey_number, taluk, district, primary_crop, updated_at
FROM farmers
ORDER BY updated_at DESC
LIMIT 10;

-- By Survey Number:
SELECT * FROM farmers WHERE survey_number LIKE '%88/B%';

-- By Mobile Number:
SELECT * FROM farmers WHERE phone_number = '9876543210';
-- Search by full or partial name (e.g. 'Ramesh', 'Nidhi', etc.)
SELECT 
    id,
    name,
    phone_number,
    survey_number,
    taluk,
    district,
    land_area_acres,
    primary_crop,
    updated_at
FROM farmers
WHERE LOWER(name) LIKE LOWER('%Ramesh%');

SELECT * FROM v_registered_farmers;
