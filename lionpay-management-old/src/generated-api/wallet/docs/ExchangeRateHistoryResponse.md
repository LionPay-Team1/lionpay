# ExchangeRateHistoryResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**exchangeRateId** | **string** |  | [default to undefined]
**sourceCurrency** | **string** |  | [default to undefined]
**targetCurrency** | **string** |  | [default to undefined]
**oldRate** | [**ExchangeRateHistoryResponseOldRate**](ExchangeRateHistoryResponseOldRate.md) |  | [default to undefined]
**newRate** | [**AdjustBalanceRequestAmount**](AdjustBalanceRequestAmount.md) |  | [default to undefined]
**changedAt** | **string** |  | [default to undefined]
**changedBy** | **string** |  | [default to undefined]

## Example

```typescript
import { ExchangeRateHistoryResponse } from './api';

const instance: ExchangeRateHistoryResponse = {
    id,
    exchangeRateId,
    sourceCurrency,
    targetCurrency,
    oldRate,
    newRate,
    changedAt,
    changedBy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
