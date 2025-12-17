# TransactionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**txId** | **string** |  | [default to undefined]
**merchantId** | **string** |  | [default to undefined]
**amount** | [**AdjustBalanceRequestAmount**](AdjustBalanceRequestAmount.md) |  | [default to undefined]
**txType** | [**TxType**](TxType.md) |  | [default to undefined]
**txStatus** | [**TxStatus**](TxStatus.md) |  | [default to undefined]
**merchantName** | **string** |  | [default to undefined]
**balanceAfter** | [**AdjustBalanceRequestAmount**](AdjustBalanceRequestAmount.md) |  | [default to undefined]
**currency** | **string** |  | [default to undefined]
**originalAmount** | [**AdjustBalanceRequestAmount**](AdjustBalanceRequestAmount.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]

## Example

```typescript
import { TransactionResponse } from './api';

const instance: TransactionResponse = {
    txId,
    merchantId,
    amount,
    txType,
    txStatus,
    merchantName,
    balanceAfter,
    currency,
    originalAmount,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
