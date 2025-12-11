# AdminControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createAdmin**](#createadmin) | **POST** /api/v1/admin/new | |
|[**signIn1**](#signin1) | **POST** /api/v1/admin/sign-in | |
|[**signOut1**](#signout1) | **POST** /api/v1/admin/sign-out | |

# **createAdmin**
> ApiResponseAdminCreateResponse createAdmin(adminCreateRequest)


### Example

```typescript
import {
    AdminControllerApi,
    Configuration,
    AdminCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminControllerApi(configuration);

let adminCreateRequest: AdminCreateRequest; //

const { status, data } = await apiInstance.createAdmin(
    adminCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminCreateRequest** | **AdminCreateRequest**|  | |


### Return type

**ApiResponseAdminCreateResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **signIn1**
> TokenResponse signIn1(adminSignInRequest)


### Example

```typescript
import {
    AdminControllerApi,
    Configuration,
    AdminSignInRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminControllerApi(configuration);

let adminSignInRequest: AdminSignInRequest; //

const { status, data } = await apiInstance.signIn1(
    adminSignInRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminSignInRequest** | **AdminSignInRequest**|  | |


### Return type

**TokenResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **signOut1**
> ApiResponseObject signOut1(signOutRequest)


### Example

```typescript
import {
    AdminControllerApi,
    Configuration,
    SignOutRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminControllerApi(configuration);

let signOutRequest: SignOutRequest; //

const { status, data } = await apiInstance.signOut1(
    signOutRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **signOutRequest** | **SignOutRequest**|  | |


### Return type

**ApiResponseObject**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

