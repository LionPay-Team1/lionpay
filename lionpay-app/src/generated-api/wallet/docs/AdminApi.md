# AdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**v1WalletAdminExchangeRatesCurrenciesGet**](#v1walletadminexchangeratescurrenciesget) | **GET** /v1/wallet/admin/exchange-rates/currencies | Get all currencies (admin)|
|[**v1WalletAdminExchangeRatesGet**](#v1walletadminexchangeratesget) | **GET** /v1/wallet/admin/exchange-rates | Get all exchange rates (admin)|
|[**v1WalletAdminExchangeRatesHistoryGet**](#v1walletadminexchangerateshistoryget) | **GET** /v1/wallet/admin/exchange-rates/history | Get exchange rate history|
|[**v1WalletAdminExchangeRatesPut**](#v1walletadminexchangeratesput) | **PUT** /v1/wallet/admin/exchange-rates | Update exchange rate|
|[**v1WalletAdminMerchantsGet**](#v1walletadminmerchantsget) | **GET** /v1/wallet/admin/merchants | Get all merchants|
|[**v1WalletAdminMerchantsIdGet**](#v1walletadminmerchantsidget) | **GET** /v1/wallet/admin/merchants/{id} | Get merchant full info|
|[**v1WalletAdminMerchantsIdPut**](#v1walletadminmerchantsidput) | **PUT** /v1/wallet/admin/merchants/{id} | Update merchant|
|[**v1WalletAdminMerchantsPost**](#v1walletadminmerchantspost) | **POST** /v1/wallet/admin/merchants | Create merchant|
|[**v1WalletAdminSummaryGet**](#v1walletadminsummaryget) | **GET** /v1/wallet/admin/summary | Get admin dashboard summary|
|[**v1WalletAdminTransactionsUserIdGet**](#v1walletadmintransactionsuseridget) | **GET** /v1/wallet/admin/transactions/{userId} | Get user transactions|
|[**v1WalletAdminWalletsUserIdAdjustPost**](#v1walletadminwalletsuseridadjustpost) | **POST** /v1/wallet/admin/wallets/{userId}/adjust | Adjust user wallet balance|
|[**v1WalletAdminWalletsUserIdGet**](#v1walletadminwalletsuseridget) | **GET** /v1/wallet/admin/wallets/{userId} | Get user wallet|

# **v1WalletAdminExchangeRatesCurrenciesGet**
> Array<CurrencyResponse> v1WalletAdminExchangeRatesCurrenciesGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.v1WalletAdminExchangeRatesCurrenciesGet();
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

# **v1WalletAdminExchangeRatesGet**
> Array<ExchangeRateResponse> v1WalletAdminExchangeRatesGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.v1WalletAdminExchangeRatesGet();
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

# **v1WalletAdminExchangeRatesHistoryGet**
> Array<ExchangeRateHistoryResponse> v1WalletAdminExchangeRatesHistoryGet()

Returns the history of exchange rate changes.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    V1WalletAdminExchangeRatesHistoryGetLimitParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let limit: V1WalletAdminExchangeRatesHistoryGetLimitParameter; // (default to undefined)
let sourceCurrency: string; // (optional) (default to undefined)
let targetCurrency: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.v1WalletAdminExchangeRatesHistoryGet(
    limit,
    sourceCurrency,
    targetCurrency
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**V1WalletAdminExchangeRatesHistoryGetLimitParameter**] |  | defaults to undefined|
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

# **v1WalletAdminExchangeRatesPut**
> ExchangeRateResponse v1WalletAdminExchangeRatesPut(updateExchangeRateRequest)

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

const { status, data } = await apiInstance.v1WalletAdminExchangeRatesPut(
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

# **v1WalletAdminMerchantsGet**
> Array<MerchantResponse> v1WalletAdminMerchantsGet()

Retrieves all merchants including inactive ones.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.v1WalletAdminMerchantsGet();
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

# **v1WalletAdminMerchantsIdGet**
> MerchantModel v1WalletAdminMerchantsIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.v1WalletAdminMerchantsIdGet(
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

# **v1WalletAdminMerchantsIdPut**
> MerchantModel v1WalletAdminMerchantsIdPut(updateMerchantRequest)


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

const { status, data } = await apiInstance.v1WalletAdminMerchantsIdPut(
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

# **v1WalletAdminMerchantsPost**
> MerchantModel v1WalletAdminMerchantsPost(createMerchantRequest)


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

const { status, data } = await apiInstance.v1WalletAdminMerchantsPost(
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

# **v1WalletAdminSummaryGet**
> AdminSummaryModel v1WalletAdminSummaryGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.v1WalletAdminSummaryGet();
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

# **v1WalletAdminTransactionsUserIdGet**
> Array<TransactionResponse> v1WalletAdminTransactionsUserIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration,
    V1WalletTransactionsGetLimitParameter,
    V1WalletTransactionsGetOffsetParameter
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userId: string; // (default to undefined)
let limit: V1WalletTransactionsGetLimitParameter; // (optional) (default to 10)
let offset: V1WalletTransactionsGetOffsetParameter; // (optional) (default to 0)

const { status, data } = await apiInstance.v1WalletAdminTransactionsUserIdGet(
    userId,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **v1WalletAdminWalletsUserIdAdjustPost**
> WalletResponse v1WalletAdminWalletsUserIdAdjustPost(adjustBalanceRequest)


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

const { status, data } = await apiInstance.v1WalletAdminWalletsUserIdAdjustPost(
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

# **v1WalletAdminWalletsUserIdGet**
> WalletResponse v1WalletAdminWalletsUserIdGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.v1WalletAdminWalletsUserIdGet(
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

