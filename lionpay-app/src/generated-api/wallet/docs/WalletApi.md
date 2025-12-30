# WalletApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1WalletChargePost**](#apiv1walletchargepost) | **POST** /api/v1/wallet/charge | Charge wallet|
|[**apiV1WalletMeGet**](#apiv1walletmeget) | **GET** /api/v1/wallet/me | Get my wallet|

# **apiV1WalletChargePost**
> WalletResponse apiV1WalletChargePost(chargeRequest)

Charges the user\'s Money wallet with the specified amount.

### Example

```typescript
import {
    WalletApi,
    Configuration,
    ChargeRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let chargeRequest: ChargeRequest; //

const { status, data } = await apiInstance.apiV1WalletChargePost(
    chargeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **chargeRequest** | **ChargeRequest**|  | |


### Return type

**WalletResponse**

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1WalletMeGet**
> WalletResponse apiV1WalletMeGet()

Retrieves the current user\'s Money wallet information.

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

const { status, data } = await apiInstance.apiV1WalletMeGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**WalletResponse**

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

