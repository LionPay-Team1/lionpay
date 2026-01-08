# MerchantApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**v1WalletMerchantsGet**](#v1walletmerchantsget) | **GET** /v1/wallet/merchants | Get active merchants|
|[**v1WalletMerchantsIdGet**](#v1walletmerchantsidget) | **GET** /v1/wallet/merchants/{id} | Get merchant details|

# **v1WalletMerchantsGet**
> Array<MerchantResponse> v1WalletMerchantsGet()

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

const { status, data } = await apiInstance.v1WalletMerchantsGet(
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

# **v1WalletMerchantsIdGet**
> MerchantResponse v1WalletMerchantsIdGet()

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

const { status, data } = await apiInstance.v1WalletMerchantsIdGet(
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

