-- Нормализация существующих названий городов в таблице rides
UPDATE public.rides 
SET 
  from_city = CASE 
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%ташкент%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%tashkent%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%toshkent%' THEN 'Ташкент'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%андижан%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%andijan%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%andijon%' THEN 'Андижан'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%самарканд%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%samarkand%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%samarqand%' THEN 'Самарканд'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%бухара%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%bukhara%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%buxoro%' THEN 'Бухара'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%фергана%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%fergana%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%farg''ona%' THEN 'Фергана'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%наманган%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%namangan%' THEN 'Наманган'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%хива%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%khiva%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%xiva%' THEN 'Хива'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%ургенч%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%urgench%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%urganch%' THEN 'Ургенч'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%карши%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%karshi%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%qarshi%' THEN 'Карши'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%термез%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%termez%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%termiz%' THEN 'Термез'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%джизак%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%jizzakh%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%jizak%' THEN 'Джизак'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%гулистан%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%gulistan%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%sirdaryo%' THEN 'Гулистан'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%нукус%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%nukus%' THEN 'Нукус'
    WHEN LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%навои%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%navoi%' OR LOWER(SPLIT_PART(from_city, ',', 1)) LIKE '%navoiy%' THEN 'Навои'
    ELSE TRIM(SPLIT_PART(from_city, ',', 1))
  END,
  to_city = CASE 
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%ташкент%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%tashkent%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%toshkent%' THEN 'Ташкент'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%андижан%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%andijan%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%andijon%' THEN 'Андижан'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%самарканд%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%samarkand%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%samarqand%' THEN 'Самарканд'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%бухара%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%bukhara%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%buxoro%' THEN 'Бухара'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%фергана%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%fergana%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%farg''ona%' THEN 'Фергана'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%наманган%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%namangan%' THEN 'Наманган'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%хива%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%khiva%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%xiva%' THEN 'Хива'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%ургенч%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%urgench%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%urganch%' THEN 'Ургенч'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%карши%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%karshi%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%qarshi%' THEN 'Карши'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%термез%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%termez%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%termiz%' THEN 'Термез'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%джизак%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%jizzakh%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%jizak%' THEN 'Джизак'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%гулистан%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%gulistan%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%sirdaryo%' THEN 'Гулистан'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%нукус%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%nukus%' THEN 'Нукус'
    WHEN LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%навои%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%navoi%' OR LOWER(SPLIT_PART(to_city, ',', 1)) LIKE '%navoiy%' THEN 'Навои'
    ELSE TRIM(SPLIT_PART(to_city, ',', 1))
  END,
  updated_at = now()
WHERE 
  from_city LIKE '%,%' OR to_city LIKE '%,%' OR 
  LOWER(from_city) ~ '(tashkent|toshkent|andijan|andijon|samarkand|samarqand|bukhara|buxoro|fergana|farg''ona|namangan|khiva|xiva|urgench|urganch|karshi|qarshi|termez|termiz|jizzakh|jizak|gulistan|sirdaryo|nukus|navoi|navoiy)' OR
  LOWER(to_city) ~ '(tashkent|toshkent|andijan|andijon|samarkand|samarqand|bukhara|buxoro|fergana|farg''ona|namangan|khiva|xiva|urgench|urganch|karshi|qarshi|termez|termiz|jizzakh|jizak|gulistan|sirdaryo|nukus|navoi|navoiy)';