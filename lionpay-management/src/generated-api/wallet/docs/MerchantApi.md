# MerchantApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1MerchantsGet**](#apiv1merchantsget) | **GET** /api/v1/merchants | Get active merchants|
|[**apiV1MerchantsIdGet**](#apiv1merchantsidget) | **GET** /api/v1/merchants/{id} | Get merchant details|

# **apiV1MerchantsGet**
> Array<MerchantResponse> apiV1MerchantsGet()

Retrieves a list of active merchants.

### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let countryCode: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiV1MerchantsGet(
    countryCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **countryCode** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<MerchantResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

