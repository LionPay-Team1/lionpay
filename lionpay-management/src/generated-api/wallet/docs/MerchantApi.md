# MerchantApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1MerchantsIdGet**](#apiv1merchantsidget) | **GET** /api/v1/merchants/{id} | Get merchant details|

# **apiV1MerchantsIdGet**
> MerchantResponse apiV1MerchantsIdGet()

Retrieves details of a specific merchant by ID.

### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiV1MerchantsIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**MerchantResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

