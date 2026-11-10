USE farmer_portal;
SHOW TABLES;
DESCRIBE farmers;
SELECT 
    TABLE_SCHEMA AS `database_name`,
    TABLE_NAME AS `table_name`,
    COLUMN_NAME AS `column_name`,
    DATA_TYPE AS `data_type`,
    IS_NULLABLE AS `nullable`
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'farmer_portal'
  AND (
      COLUMN_NAME LIKE '%name%' 
      OR COLUMN_NAME LIKE '%farmer%' 
      OR TABLE_NAME LIKE '%farmer%'
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;

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


SELECT 
    id,
    name,
    phone_number,
    survey_number,
    CONCAT(land_area_acres, ' Acres, ', land_area_guntas, ' Guntas') AS land_area,
    primary_crop,
    CONCAT(taluk, ', ', district) AS location
FROM farmers
ORDER BY id DESC;

-- 2.3 Query the pre-built clean view
SELECT * FROM v_registered_farmers;


-- ====================================================================
-- SECTION 3: SEARCH FOR REGISTERED FARMERS
-- ====================================================================

-- 3.1 Search by farmer name (case-insensitive partial match)
-- Replace 'Ramesh' with any farmer name you wish to look up:
SELECT 
    id,
    name,
    phone_number,
    survey_number,
    taluk,
    district,
    land_area_acres,
    land_area_guntas,
    primary_crop,
    soil_type,
    updated_at
FROM farmers
WHERE LOWER(name) LIKE LOWER('%Ramesh%');

-- 3.2 Search by survey number (e.g., '88/B' or '123')
SELECT 
    id,
    name,
    survey_number,
    taluk,
    district,
    land_area_acres,
    primary_crop
FROM farmers
WHERE survey_number LIKE '%88/B%';

-- 3.3 Search by phone number
SELECT 
    id,
    name,
    phone_number,
    survey_number,
    taluk,
    district,
    primary_crop
FROM farmers
WHERE phone_number = '9876543210';


-- ====================================================================
-- SECTION 4: AGGREGATE REPORTS & STATISTICS
-- ====================================================================

-- 4.1 Total registered farmer count
SELECT COUNT(*) AS total_registered_farmers FROM farmers;

-- 4.2 Registered farmers grouped by District
SELECT 
    district,
    COUNT(*) AS total_farmers,
    ROUND(SUM(land_area_acres), 2) AS total_cultivated_acres,
    ROUND(AVG(land_area_acres), 2) AS avg_acres_per_farmer
FROM farmers
GROUP BY district
ORDER BY total_farmers DESC;

-- 4.3 Registered farmers grouped by Taluk
SELECT 
    district,
    taluk,
    COUNT(*) AS farmers_count
FROM farmers
GROUP BY district, taluk
ORDER BY district, farmers_count DESC;

SELECT 
    primary_crop,
    COUNT(*) AS farmers_growing,
    ROUND(SUM(land_area_acres), 2) AS total_acres,
    ROUND(AVG(land_area_acres), 2) AS avg_acres
FROM farmers
GROUP BY primary_crop
ORDER BY farmers_growing DESC;

SELECT 
    id,
    name,
    phone_number,
    survey_number,
    taluk,
    district,
    primary_crop,
    created_at,
    updated_at
FROM farmers
ORDER BY COALESCE(updated_at, created_at) DESC
LIMIT 10;

-- 5.1 Preview test farmers before deletion
SELECT id, name, phone_number, survey_number, district, taluk
FROM farmers
WHERE LOWER(TRIM(name)) LIKE '%test%'
   OR LOWER(TRIM(name)) LIKE '%verification%'
   OR LOWER(TRIM(name)) LIKE '%geo farmer%'
   OR LOWER(TRIM(name)) = 'john doe'
   OR TRIM(name) = ''
   OR phone_number IN ('0000000000', '1111111111', 'abc-def-ghi');

-- 5.2 Delete test farmers (run whenever you want to purge test data)
DELETE FROM farmers
WHERE LOWER(TRIM(name)) LIKE '%test%'
   OR LOWER(TRIM(name)) LIKE '%verification%'
   OR LOWER(TRIM(name)) LIKE '%geo farmer%'
   OR LOWER(TRIM(name)) = 'john doe'
   OR TRIM(name) = ''
   OR phone_number IN ('0000000000', '1111111111', 'abc-def-ghi');

SELECT * FROM v_registered_farmers;