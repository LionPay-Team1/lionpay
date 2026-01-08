# PaymentApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**v1WalletPaymentsPost**](#v1walletpaymentspost) | **POST** /v1/wallet/payments | Process a payment|

# **v1WalletPaymentsPost**
> PaymentResponse v1WalletPaymentsPost(paymentRequest)

Processes a payment transaction for a user.

### Example

```typescript
import {
    PaymentApi,
    Configuration,
    PaymentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentApi(configuration);

let paymentRequest: PaymentRequest; //
let xIdempotencyKey: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.v1WalletPaymentsPost(
    paymentRequest,
    xIdempotencyKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentRequest** | **PaymentRequest**|  | |
| **xIdempotencyKey** | [**string**] |  | (optional) defaults to undefined|


### Return type

**PaymentResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

