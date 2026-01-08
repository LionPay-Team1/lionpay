/**
 * 지갑 서비스 헬퍼 함수
 */
import http from 'k6/http';
import { check } from 'k6';
import { WALLET_URL, authHeaders } from '../config/options.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

/**
 * 내 지갑 조회
 */
export function getMyWallet(token) {
    const res = http.get(
        `${WALLET_URL}/api/v1/wallet/me`,
        authHeaders(token)
    );

    check(res, {
        'wallet me: status is 200': (r) => r.status === 200,
        'wallet me: has balance': (r) => r.json('balance') !== undefined,
    });

    return res;
}

/**
 * 지갑 충전
 */
export function chargeWallet(token, amount) {
    const res = http.post(
        `${WALLET_URL}/api/v1/wallet/charge`,
        JSON.stringify({ amount }),
        authHeaders(token)
    );

    check(res, {
        'charge: status is 200': (r) => r.status === 200,
        'charge: has balance': (r) => r.json('balance') !== undefined,
    });

    return res;
}

/**
 * 결제 처리
 */
export function processPayment(token, merchantId, amountCash, currency = 'KRW') {
    const idempotencyKey = uuidv4();

    const options = authHeaders(token);
    options.headers['X-Idempotency-Key'] = idempotencyKey;

    const res = http.post(
        `${WALLET_URL}/api/v1/wallet/payments`,
        JSON.stringify({ merchantId, amountCash, currency }),
        options
    );

    check(res, {
        'payment: status is 200': (r) => r.status === 200,
        'payment: has txId': (r) => r.json('txId') !== undefined,
    });

    return res;
}

/**
 * 거래 내역 조회
 */
export function getTransactions(token, limit = 10, offset = 0) {
    const res = http.get(
        `${WALLET_URL}/api/v1/wallet/transactions?limit=${limit}&offset=${offset}`,
        authHeaders(token)
    );

    check(res, {
        'transactions: status is 200': (r) => r.status === 200,
        'transactions: is array': (r) => Array.isArray(r.json()),
    });

    return res;
}

/**
 * 가맹점 목록 조회
 */
export function getMerchants(token, countryCode = null) {
    let url = `${WALLET_URL}/api/v1/wallet/merchants`;
    if (countryCode) {
        url += `?countryCode=${countryCode}`;
    }

    const res = http.get(url, authHeaders(token));

    check(res, {
        'merchants: status is 200': (r) => r.status === 200,
        'merchants: is array': (r) => Array.isArray(r.json()),
    });

    return res;
}

/**
 * 환율 조회
 */
export function getExchangeRates(token) {
    const res = http.get(
        `${WALLET_URL}/api/v1/wallet/exchange-rates`,
        authHeaders(token)
    );

    check(res, {
        'exchange-rates: status is 200': (r) => r.status === 200,
        'exchange-rates: is array': (r) => Array.isArray(r.json()),
    });

    return res;
}
