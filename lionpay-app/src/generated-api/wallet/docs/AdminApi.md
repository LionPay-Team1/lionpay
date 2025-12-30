# AdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1WalletAdminExchangeRatesCurrenciesGet**](#apiv1walletadminexchangeratescurrenciesget) | **GET** /api/v1/wallet/admin/exchange-rates/currencies | Get all currencies (admin)|
|[**apiV1WalletAdminExchangeRatesGet**](#apiv1walletadminexchangeratesget) | **GET** /api/v1/wallet/admin/exchange-rates | Get all exchange rates (admin)|
|[**apiV1WalletAdminExchangeRatesHistoryGet**](#apiv1walletadminexchangerateshistoryget) | **GET** /api/v1/wallet/admin/exchange-rates/history | Get exchange rate history|
|[**apiV1WalletAdminExchangeRatesPut**](#apiv1walletadminexchangeratesput) | **PUT** /api/v1/wallet/admin/exchange-rates | Update exchange rate|
|[**apiV1WalletAdminMerchantsGet**](#apiv1walletadminmerchantsget) | **GET** /api/v1/wallet/admin/merchants | Get all merchants|
|[**apiV1WalletAdminMerchantsIdGet**](#apiv1walletadminmerchantsidget) | **GET** /api/v1/wallet/admin/merchants/{id} | Get merchant full info|
|[**apiV1WalletAdminMerchantsIdPut**](#apiv1walletadminmerchantsidput) | **PUT** /api/v1/wallet/admin/merchants/{id} | Update merchant|
|[**apiV1WalletAdminMerchantsPost**](#apiv1walletadminmerchantspost) | **POST** /api/v1/wallet/admin/merchants | Create merchant|
|[**apiV1WalletAdminSummaryGet**](#apiv1walletadminsummaryget) | **GET** /api/v1/wallet/admin/summary | Get admin dashboard summary|
|[**apiV1WalletAdminTransactionsUserIdGet**](#apiv1walletadmintransactionsuseridget) | **GET** /api/v1/wallet/admin/transactions/{userId} | Get user transactions|
|[**apiV1WalletAdminWalletsUserIdAdjustPost**](#apiv1walletadminwalletsuseridadjustpost) | **POST** /api/v1/wallet/admin/wallets/{userId}/adjust | Adjust user wallet balance|
|[**apiV1WalletAdminWalletsUserIdGet**](#apiv1walletadminwalletsuseridget) | **GET** /api/v1/wallet/admin/wallets/{userId} | Get user wallet|

# **apiV1WalletAdminExchangeRatesCurrenciesGet**
> Array<CurrencyResponse> apiV1WalletAdminExchangeRatesCurrenciesGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1WalletAdminExchangeRatesCurrenciesGet();
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

# **apiV1WalletAdminExchangeRatesGet**
> Array<ExchangeRateResponse> apiV1WalletAdminExchangeRatesGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1WalletAdminExchangeRatesGet();
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

# **apiV1WalletAdminExchangeRatesHistoryGet**
> Array<ExchangeRateHistoryResponse> apiV1WalletAdminExchangeRatesHistoryGet()

Returns the history of exchange rate changes.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    ApiV1WalletAdminExchangeRatesHistoryGetLimitParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let limit: ApiV1WalletAdminExchangeRatesHistoryGetLimitParameter; // (default to undefined)
let sourceCurrency: string; // (optional) (default to undefined)
let targetCurrency: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiV1WalletAdminExchangeRatesHistoryGet(
    limit,
    sourceCurrency,
    targetCurrency
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**ApiV1WalletAdminExchangeRatesHistoryGetLimitParameter**] |  | defaults to undefined|
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

# **apiV1WalletAdminExchangeRatesPut**
> ExchangeRateResponse apiV1WalletAdminExchangeRatesPut(updateExchangeRateRequest)

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

const { status, data } = await apiInstance.apiV1WalletAdminExchangeRatesPut(
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

# **apiV1WalletAdminMerchantsGet**
> Array<MerchantResponse> apiV1WalletAdminMerchantsGet()

Retrieves all merchants including inactive ones.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1WalletAdminMerchantsGet();
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

# **apiV1WalletAdminMerchantsIdGet**
> MerchantModel apiV1WalletAdminMerchantsIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiV1WalletAdminMerchantsIdGet(
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

# **apiV1WalletAdminMerchantsIdPut**
> MerchantModel apiV1WalletAdminMerchantsIdPut(updateMerchantRequest)


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

const { status, data } = await apiInstance.apiV1WalletAdminMerchantsIdPut(
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

# **apiV1WalletAdminMerchantsPost**
> MerchantModel apiV1WalletAdminMerchantsPost(createMerchantRequest)


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

const { status, data } = await apiInstance.apiV1WalletAdminMerchantsPost(
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

# **apiV1WalletAdminSummaryGet**
> AdminSummaryModel apiV1WalletAdminSummaryGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiV1WalletAdminSummaryGet();
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

# **apiV1WalletAdminTransactionsUserIdGet**
> Array<TransactionResponse> apiV1WalletAdminTransactionsUserIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration,
    ApiV1WalletTransactionsGetLimitParameter,
    ApiV1WalletTransactionsGetOffsetParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userId: string; // (default to undefined)
let limit: ApiV1WalletTransactionsGetLimitParameter; // (optional) (default to 10)
let offset: ApiV1WalletTransactionsGetOffsetParameter; // (optional) (default to 0)

const { status, data } = await apiInstance.apiV1WalletAdminTransactionsUserIdGet(
    userId,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|
| **limit** | [**ApiV1WalletTransactionsGetLimitParameter**] |  | (optional) defaults to 10|
| **offset** | [**ApiV1WalletTransactionsGetOffsetParameter**] |  | (optional) defaults to 0|


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

# **apiV1WalletAdminWalletsUserIdAdjustPost**
> WalletResponse apiV1WalletAdminWalletsUserIdAdjustPost(adjustBalanceRequest)


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

const { status, data } = await apiInstance.apiV1WalletAdminWalletsUserIdAdjustPost(
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

# **apiV1WalletAdminWalletsUserIdGet**
> WalletResponse apiV1WalletAdminWalletsUserIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.apiV1WalletAdminWalletsUserIdGet(
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

