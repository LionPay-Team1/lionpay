# AdminControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createAdmin**](#createadmin) | **POST** /api/v1/admin/new | |
|[**getUsers**](#getusers) | **GET** /api/v1/admin/users | |
|[**refreshAdminToken**](#refreshadmintoken) | **POST** /api/v1/admin/refresh-token | |
|[**signIn1**](#signin1) | **POST** /api/v1/admin/sign-in | |
|[**signOut1**](#signout1) | **POST** /api/v1/admin/sign-out | |

# **createAdmin**
> AdminDetailResponse createAdmin(adminCreateRequest)


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

**AdminDetailResponse**

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

# **getUsers**
> object getUsers()


### Example

```typescript
import {
    AdminControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminControllerApi(configuration);

let phone: string; // (optional) (default to undefined)
let userId: string; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getUsers(
    phone,
    userId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **phone** | [**string**] |  | (optional) defaults to undefined|
| **userId** | [**string**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**object**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **refreshAdminToken**
> TokenResponse refreshAdminToken(refreshTokenRequest)


### Example

```typescript
import {
    AdminControllerApi,
    Configuration,
    RefreshTokenRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminControllerApi(configuration);

let refreshTokenRequest: RefreshTokenRequest; //

const { status, data } = await apiInstance.refreshAdminToken(
    refreshTokenRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refreshTokenRequest** | **RefreshTokenRequest**|  | |


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
> signOut1(signOutRequest)


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

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

