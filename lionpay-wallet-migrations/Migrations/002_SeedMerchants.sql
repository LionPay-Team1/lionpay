-- Clear existing seed data and insert new regional merchants
DELETE FROM merchants
WHERE merchant_id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    );
INSERT INTO merchants (
        merchant_id,
        merchant_name,
        country_code,
        merchant_category,
        merchant_status
    )
VALUES -- 한국 상점 (KR)
    (
        '11111111-1111-1111-1111-111111111111',
        '스타벅스 강남역점',
        'KR',
        '카페',
        1
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'GS25 서울역점',
        'KR',
        '편의점',
        1
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '맥도날드 홍대점',
        'KR',
        '음식점',
        1
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '세븐일레븐 명동점',
        'KR',
        '편의점',
        1
    ),
    -- 일본 상점 (JP)
    (
        '55555555-5555-5555-5555-555555555555',
        'スターバックス 渋谷店',
        'JP',
        'カフェ',
        1
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'ローソン 新宿駅店',
        'JP',
        'コンビニ',
        1
    ),
    (
        '77777777-7777-7777-7777-777777777777',
        'マクドナルド 東京駅店',
        'JP',
        'レストラン',
        1
    ),
    (
        '88888888-8888-8888-8888-888888888888',
        'セブンイレブン 秋葉原店',
        'JP',
        'コンビニ',
        1
    ),
    -- 미국 상점 (US)
    (
        '99999999-9999-9999-9999-999999999999',
        'Starbucks Times Square',
        'US',
        'Cafe',
        1
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '7-Eleven Manhattan',
        'US',
        'Convenience',
        1
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'McDonald''s Wall Street',
        'US',
        'Restaurant',
        1
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Whole Foods Brooklyn',
        'US',
        'Grocery',
        1
    );