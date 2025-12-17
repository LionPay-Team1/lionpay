# AdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1AdminExchangeRatesCurrenciesGet**](#apiv1adminexchangeratescurrenciesget) | **GET** /api/v1/admin/exchange-rates/currencies | Get all currencies (admin)|
|[**apiV1AdminExchangeRatesGet**](#apiv1adminexchangeratesget) | **GET** /api/v1/admin/exchange-rates | Get all exchange rates (admin)|
|[**apiV1AdminExchangeRatesHistoryGet**](#apiv1adminexchangerateshistoryget) | **GET** /api/v1/admin/exchange-rates/history | Get exchange rate history|
|[**apiV1AdminExchangeRatesPut**](#apiv1adminexchangeratesput) | **PUT** /api/v1/admin/exchange-rates | Update exchange rate|
|[**apiV1AdminMerchantsGet**](#apiv1adminmerchantsget) | **GET** /api/v1/admin/merchants | Get all merchants|
|[**apiV1AdminMerchantsIdGet**](#apiv1adminmerchantsidget) | **GET** /api/v1/admin/merchants/{id} | Get merchant full info|
|[**apiV1AdminMerchantsIdPut**](#apiv1adminmerchantsidput) | **PUT** /api/v1/admin/merchants/{id} | Update merchant|
|[**apiV1AdminMerchantsPost**](#apiv1adminmerchantspost) | **POST** /api/v1/admin/merchants | Create merchant|
|[**apiV1AdminSummaryGet**](#apiv1adminsummaryget) | **GET** /api/v1/admin/summary | Get admin dashboard summary|
|[**apiV1AdminTransactionsUserIdGet**](#apiv1admintransactionsuseridget) | **GET** /api/v1/admin/transactions/{userId} | Get user transactions|
|[**apiV1AdminWalletsUserIdAdjustPost**](#apiv1adminwalletsuseridadjustpost) | **POST** /api/v1/admin/wallets/{userId}/adjust | Adjust user wallet balance|
|[**apiV1AdminWalletsUserIdGet**](#apiv1adminwalletsuseridget) | **GET** /api/v1/admin/wallets/{userId} | Get user wallet|

# **apiV1AdminExchangeRatesCurrenciesGet**
> Array<CurrencyResponse> apiV1AdminExchangeRatesCurrenciesGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1AdminExchangeRatesCurrenciesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CurrencyResponse>**

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

# **apiV1AdminExchangeRatesGet**
> Array<ExchangeRateResponse> apiV1AdminExchangeRatesGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1AdminExchangeRatesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ExchangeRateResponse>**

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

# **apiV1AdminExchangeRatesHistoryGet**
> Array<ExchangeRateHistoryResponse> apiV1AdminExchangeRatesHistoryGet()

Returns the history of exchange rate changes.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    ApiV1AdminExchangeRatesHistoryGetLimitParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let limit: ApiV1AdminExchangeRatesHistoryGetLimitParameter; // (default to undefined)
let sourceCurrency: string; // (optional) (default to undefined)
let targetCurrency: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiV1AdminExchangeRatesHistoryGet(
    limit,
    sourceCurrency,
    targetCurrency
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**ApiV1AdminExchangeRatesHistoryGetLimitParameter**] |  | defaults to undefined|
| **sourceCurrency** | [**string**] |  | (optional) defaults to undefined|
| **targetCurrency** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<ExchangeRateHistoryResponse>**

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

# **apiV1AdminExchangeRatesPut**
> ExchangeRateResponse apiV1AdminExchangeRatesPut(updateExchangeRateRequest)

Create or update an exchange rate between two currencies.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    UpdateExchangeRateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let updateExchangeRateRequest: UpdateExchangeRateRequest; //

const { status, data } = await apiInstance.apiV1AdminExchangeRatesPut(
    updateExchangeRateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateExchangeRateRequest** | **UpdateExchangeRateRequest**|  | |


### Return type

**ExchangeRateResponse**

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1AdminMerchantsGet**
> Array<MerchantResponse> apiV1AdminMerchantsGet()

Retrieves all merchants including inactive ones.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1AdminMerchantsGet();
```

### Parameters
This endpoint does not have any parameters.


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

# **apiV1AdminMerchantsIdGet**
> MerchantModel apiV1AdminMerchantsIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiV1AdminMerchantsIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**MerchantModel**

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1AdminMerchantsIdPut**
> MerchantModel apiV1AdminMerchantsIdPut(updateMerchantRequest)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    UpdateMerchantRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let id: string; // (default to undefined)
let updateMerchantRequest: UpdateMerchantRequest; //

const { status, data } = await apiInstance.apiV1AdminMerchantsIdPut(
    id,
    updateMerchantRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateMerchantRequest** | **UpdateMerchantRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**MerchantModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1AdminMerchantsPost**
> MerchantModel apiV1AdminMerchantsPost(createMerchantRequest)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    CreateMerchantRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let createMerchantRequest: CreateMerchantRequest; //

const { status, data } = await apiInstance.apiV1AdminMerchantsPost(
    createMerchantRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createMerchantRequest** | **CreateMerchantRequest**|  | |


### Return type

**MerchantModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1AdminSummaryGet**
> AdminSummaryModel apiV1AdminSummaryGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1AdminSummaryGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**AdminSummaryModel**

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

# **apiV1AdminTransactionsUserIdGet**
> Array<TransactionResponse> apiV1AdminTransactionsUserIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration,
    ApiV1TransactionsGetLimitParameter,
    ApiV1TransactionsGetOffsetParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userId: string; // (default to undefined)
let limit: ApiV1TransactionsGetLimitParameter; // (optional) (default to 10)
let offset: ApiV1TransactionsGetOffsetParameter; // (optional) (default to 0)

const { status, data } = await apiInstance.apiV1AdminTransactionsUserIdGet(
    userId,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1AdminWalletsUserIdAdjustPost**
> WalletResponse apiV1AdminWalletsUserIdAdjustPost(adjustBalanceRequest)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    AdjustBalanceRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userId: string; // (default to undefined)
let adjustBalanceRequest: AdjustBalanceRequest; //

const { status, data } = await apiInstance.apiV1AdminWalletsUserIdAdjustPost(
    userId,
    adjustBalanceRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adjustBalanceRequest** | **AdjustBalanceRequest**|  | |
| **userId** | [**string**] |  | defaults to undefined|


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
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1AdminWalletsUserIdGet**
> WalletResponse apiV1AdminWalletsUserIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.apiV1AdminWalletsUserIdGet(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


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
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

