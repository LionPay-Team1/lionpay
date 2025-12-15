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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT pk_transactions PRIMARY KEY (tx_id)
);
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id UUID NOT NULL,
    user_id UUID NOT NULL,
    -- User ID is part of the Key for multi-tenancy/sharding patterns often used
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
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency ON transactions (idempotency_key);