# PaymentResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**txId** | **string** |  | [default to undefined]
**merchantId** | **string** |  | [default to undefined]
**amount** | [**AdjustBalanceRequestAmount**](AdjustBalanceRequestAmount.md) |  | [default to undefined]
**txStatus** | [**TxStatus**](TxStatus.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]

## Example

```typescript
import { PaymentResponse } from './api';

const instance: PaymentResponse = {
    txId,
    merchantId,
    amount,
    txStatus,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
