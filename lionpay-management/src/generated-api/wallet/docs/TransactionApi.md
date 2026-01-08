# TransactionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**v1WalletTransactionsGet**](#v1wallettransactionsget) | **GET** /v1/wallet/transactions | Get transaction history|

# **v1WalletTransactionsGet**
> Array<TransactionResponse> v1WalletTransactionsGet()

Retrieves a list of past transactions for the authenticated user.

### Example

```typescript
import {
    TransactionApi,
    Configuration,
    V1WalletTransactionsGetLimitParameter,
    V1WalletTransactionsGetOffsetParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionApi(configuration);

let limit: V1WalletTransactionsGetLimitParameter; // (optional) (default to 10)
let offset: V1WalletTransactionsGetOffsetParameter; // (optional) (default to 0)

const { status, data } = await apiInstance.v1WalletTransactionsGet(
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**V1WalletTransactionsGetLimitParameter**] |  | (optional) defaults to 10|
| **offset** | [**V1WalletTransactionsGetOffsetParameter**] |  | (optional) defaults to 0|


### Return type

**Array<TransactionResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

