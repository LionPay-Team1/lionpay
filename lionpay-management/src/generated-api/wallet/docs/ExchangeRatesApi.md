# ExchangeRatesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1ExchangeRatesGet**](#apiv1exchangeratesget) | **GET** /api/v1/exchange-rates | Get applied exchange rates|

# **apiV1ExchangeRatesGet**
> Array<ExchangeRateResponse> apiV1ExchangeRatesGet()


### Example

```typescript
import {
    ExchangeRatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExchangeRatesApi(configuration);

const { status, data } = await apiInstance.apiV1ExchangeRatesGet();
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

