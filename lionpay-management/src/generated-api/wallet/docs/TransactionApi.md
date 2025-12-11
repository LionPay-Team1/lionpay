# TransactionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1TransactionsGet**](#apiv1transactionsget) | **GET** /api/v1/transactions | Get transaction history|

# **apiV1TransactionsGet**
> Array<TransactionResponse> apiV1TransactionsGet()

Retrieves a list of past transactions for the authenticated user.

### Example

```typescript
import {
    TransactionApi,
    Configuration,
    ApiV1TransactionsGetLimitParameter,
    ApiV1TransactionsGetOffsetParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionApi(configuration);

let limit: ApiV1TransactionsGetLimitParameter; // (optional) (default to 10)
let offset: ApiV1TransactionsGetOffsetParameter; // (optional) (default to 0)

const { status, data } = await apiInstance.apiV1TransactionsGet(
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**ApiV1TransactionsGetLimitParameter**] |  | (optional) defaults to 10|
| **offset** | [**ApiV1TransactionsGetOffsetParameter**] |  | (optional) defaults to 0|


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

