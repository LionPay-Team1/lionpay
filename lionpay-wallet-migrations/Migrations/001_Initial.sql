-- =============================================
-- LionPay Wallet Schema - Consolidated Migration
-- =============================================
-- 1. Core Tables
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
    tx_id UUID NOT NULL,
    merchant_id UUID NOT NULL,
    wallet_id UUID NOT NULL,
    user_id UUID,
    group_tx_id UUID,
    tx_type SMALLINT,
    order_name VARCHAR(100),
    amount DECIMAL(18, 0),
    balance_snapshot DECIMAL(18, 0),
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(255),
    region_code VARCHAR(2),
    tx_status SMALLINT,
    currency VARCHAR(3) DEFAULT 'KRW',
    original_amount DECIMAL(18, 2),
    idempotency_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT pk_transactions PRIMARY KEY (tx_id)
);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_idempotency ON transactions (idempotency_key);
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id UUID NOT NULL,
    user_id UUID NOT NULL,
    wallet_type SMALLINT,
    balance DECIMAL(18, 0) DEFAULT 0 NOT NULL,
    version INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT pk_wallets PRIMARY KEY (wallet_id, user_id)
);
CREATE TABLE IF NOT EXISTS merchants (
    merchant_id UUID NOT NULL,
    merchant_name VARCHAR(255),
    country_code VARCHAR(2),
    merchant_category VARCHAR(255),
    merchant_status SMALLINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT pk_merchants PRIMARY KEY (merchant_id)
);
-- 2. Currency Master Table (ISO 4217)
-- =============================================
CREATE TABLE IF NOT EXISTS currencies (
    currency_code CHAR(3) PRIMARY KEY,
    currency_name VARCHAR(50) NOT NULL,
    symbol VARCHAR(5),
    is_active BOOLEAN DEFAULT TRUE
);
-- 3. Exchange Rate Tables
-- =============================================
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID NOT NULL,
    source_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(20, 10) NOT NULL,
    rate_type VARCHAR(20) DEFAULT 'CLOSE',
    source VARCHAR(50) DEFAULT 'MANUAL',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID,
    CONSTRAINT pk_exchange_rates PRIMARY KEY (id),
    CONSTRAINT uq_exchange_rates_currencies UNIQUE (source_currency, target_currency)
);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exchange_rates_lookup ON exchange_rates (source_currency, target_currency, updated_at);
CREATE TABLE IF NOT EXISTS exchange_rate_history (
    id UUID NOT NULL,
    exchange_rate_id UUID NOT NULL,
    source_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    old_rate DECIMAL(20, 10),
    new_rate DECIMAL(20, 10) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID,
    CONSTRAINT pk_exchange_rate_history PRIMARY KEY (id)
);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exchange_rate_history_rate_id ON exchange_rate_history (exchange_rate_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exchange_rate_history_currencies ON exchange_rate_history (source_currency, target_currency);
-- Note: Aurora DSQL does not support ASC/DESC in CREATE INDEX CONCURRENTLY 
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exchange_rate_history_changed_at ON exchange_rate_history (changed_at);
-- =============================================
-- Seed Data
-- =============================================
-- Currencies
INSERT INTO currencies (currency_code, currency_name, symbol, is_active)
VALUES ('KRW', 'Korean Won', '₩', TRUE),
    ('JPY', 'Japanese Yen', '¥', TRUE),
    ('USD', 'United States Dollar', '$', TRUE),
    ('EUR', 'Euro', '€', TRUE),
    ('CNY', 'Chinese Yuan', '¥', TRUE) ON CONFLICT (currency_code) DO NOTHING;
-- Default Exchange Rates
INSERT INTO exchange_rates (
        id,
        source_currency,
        target_currency,
        rate,
        rate_type,
        source,
        updated_at
    )
VALUES (
        '00000000-0000-0000-0000-000000000001',
        'KRW',
        'KRW',
        1.0,
        'CLOSE',
        'SYSTEM',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'JPY',
        'KRW',
        9.12,
        'CLOSE',
        'SYSTEM',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'USD',
        'KRW',
        1400.0,
        'CLOSE',
        'SYSTEM',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'EUR',
        'KRW',
        1500.0,
        'CLOSE',
        'SYSTEM',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'CNY',
        'KRW',
        195.0,
        'CLOSE',
        'SYSTEM',
        NOW()
    ) ON CONFLICT (source_currency, target_currency) DO NOTHING;
-- Merchants
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
    ) ON CONFLICT (merchant_id) DO NOTHING;