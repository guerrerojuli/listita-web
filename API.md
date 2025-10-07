# API Implementation Status

This document tracks the implementation status of all REST API endpoints from the HCI Grocery Manager API.

**Base URL:** `http://localhost:8080`

**Legend:**
- ✅ Implemented
- ❌ Not Implemented
- ⚠️ Partially Implemented

---

## Authentication

### Users
| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/users/register` | Register new user | `auth` | `register()` | ✅ |
| POST | `/api/users/login` | Log user in | `auth` | `login()` | ✅ |
| POST | `/api/users/logout` | Log user out | `auth` | `logout()` | ✅ |
| GET | `/api/users/profile` | Get user information | `auth` | `fetchProfile()` | ✅ |
| PUT | `/api/users/profile` | Update user profile | `auth` | `updateProfile()` | ✅ |
| POST | `/api/users/verify-account` | Verify user account | `auth` | `verifyAccount()` | ✅ |
| POST | `/api/users/forgot-password` | Send password recovery | `auth` | `forgotPassword()` | ✅ |
| POST | `/api/users/reset-password` | Reset user password | - | - | ❌ |
| POST | `/api/users/send-verification` | Send verification token | `auth` | `sendVerification()` | ✅ |
| POST | `/api/users/change-password` | Change user password | `auth` | `changePassword()` | ✅ |

---

## Categories

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/categories` | Create new category | `globalProducts` | `createCategory()` | ✅ |
| GET | `/api/categories` | Get all categories | `globalProducts` | `fetchCategories()` | ✅ |
| GET | `/api/categories/{id}` | Get specific category | - | - | ❌ |
| PUT | `/api/categories/{id}` | Update category | `globalProducts` | `updateCategory()` | ✅ |
| DELETE | `/api/categories/{id}` | Delete category | `globalProducts` | `deleteCategory()` | ✅ |

**Query Parameters (GET /api/categories):**
- `name` - Filter by name
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `order` - Sort order: ASC, DESC (default: ASC)
- `sort_by` - Sort field: name, createdAt, updatedAt (default: createdAt)

---

## Products

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/products` | Create new product | `globalProducts` | `addProduct()` | ✅ |
| GET | `/api/products` | Get all products | `globalProducts` | `fetchProducts()` | ✅ |
| GET | `/api/products/{id}` | Get specific product | - | - | ❌ |
| PUT | `/api/products/{id}` | Update product | `globalProducts` | `updateProduct()` | ✅ |
| DELETE | `/api/products/{id}` | Delete product | `globalProducts` | `deleteProduct()` | ✅ |

**Query Parameters (GET /api/products):**
- `name` - Filter by name
- `category_id` - Filter by category
- `pantry_id` - Filter by pantry
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `sort_by` - Sort field: name, categoryName, pantryName, createdAt, updatedAt (default: name)
- `order` - Sort order: asc, desc (default: asc)

---

## Shopping Lists

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/shopping-lists` | Create shopping list | `lists` | `createList()` | ✅ |
| GET | `/api/shopping-lists` | Get all shopping lists | `lists` | `fetchLists()` | ✅ |
| GET | `/api/shopping-lists/{id}` | Get shopping list by ID | `lists` | `getListById()` | ✅ |
| PUT | `/api/shopping-lists/{id}` | Update shopping list | `lists` | `updateList()` | ✅ |
| DELETE | `/api/shopping-lists/{id}` | Delete shopping list | `lists` | `deleteList()` | ✅ |
| POST | `/api/shopping-lists/{id}/purchase` | Mark list as purchased | `lists` | `purchaseList()` | ✅ |
| POST | `/api/shopping-lists/{id}/reset` | Reset all items to unpurchased | `lists` | `resetListItems()` | ✅ |
| POST | `/api/shopping-lists/{id}/move-to-pantry` | Move purchased items to pantry | `lists` | `moveToPantry()` | ✅ |
| POST | `/api/shopping-lists/{id}/share` | Share list with user by email | `lists` | `shareList()` | ✅ |
| GET | `/api/shopping-lists/{id}/shared-users` | Get users list is shared with | `lists` | `getSharedUsers()` | ✅ |
| DELETE | `/api/shopping-lists/{id}/share/{user_id}` | Revoke user access | `lists` | `revokeAccess()` | ✅ |

**Query Parameters (GET /api/shopping-lists):**
- `name` - Filter by name
- `owner` - Filter by ownership (true/false)
- `recurring` - Filter recurring lists (true/false)
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `sort_by` - Sort field: name, owner, createdAt, updatedAt, lastPurchasedAt (default: name)
- `order` - Sort order: ASC, DESC (default: ASC)

---

## Shopping List Items

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/shopping-lists/{id}/items` | Add item to list | `products` | `addItem()` | ✅ |
| GET | `/api/shopping-lists/{id}/items` | Get all items in list | `products` | `loadListItems()` | ✅ |
| PUT | `/api/shopping-lists/{id}/items/{item_id}` | Update item | `products` | `updateQuantity()` | ✅ |
| PATCH | `/api/shopping-lists/{id}/items/{item_id}` | Toggle purchased status | `products` | `setPurchased()` | ✅ |
| DELETE | `/api/shopping-lists/{id}/items/{item_id}` | Delete item | `products` | `deleteItem()` | ✅ |

**Query Parameters (GET /api/shopping-lists/{id}/items):**
- `purchased` - Filter by purchased status (true/false)
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `sort_by` - Sort field: updatedAt, createdAt, lastPurchasedAt, productName (default: createdAt)
- `order` - Sort order: ASC, DESC (default: DESC)
- `pantry_id` - Filter by pantry id
- `category_id` - Filter by category id
- `search` - Search by product name (case-insensitive)

---

## Pantries

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/pantries` | Create new pantry | - | - | ❌ |
| GET | `/api/pantries` | Get all pantries | - | - | ❌ |
| GET | `/api/pantries/{id}` | Get pantry by ID | - | - | ❌ |
| PUT | `/api/pantries/{id}` | Update pantry | - | - | ❌ |
| DELETE | `/api/pantries/{id}` | Delete pantry | - | - | ❌ |
| POST | `/api/pantries/{id}/share` | Share pantry with user | - | - | ❌ |
| GET | `/api/pantries/{id}/shared-users` | Get users pantry is shared with | - | - | ❌ |
| DELETE | `/api/pantries/{id}/share/{user_id}` | Revoke user access | - | - | ❌ |

**Query Parameters (GET /api/pantries):**
- `owner` - Filter by ownership (true=owned, false=shared, undefined=all)
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `sort_by` - Sort field: createdAt, updatedAt, name (default: createdAt)
- `order` - Sort order: ASC, DESC (default: ASC)

---

## Pantry Items

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/pantries/{id}/items` | Add item to pantry | - | - | ❌ |
| GET | `/api/pantries/{id}/items` | Get all items in pantry | - | - | ❌ |
| PUT | `/api/pantries/{id}/items/{item_id}` | Update pantry item | - | - | ❌ |
| DELETE | `/api/pantries/{id}/items/{item_id}` | Delete pantry item | - | - | ❌ |

**Query Parameters (GET /api/pantries/{id}/items):**
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `sort_by` - Sort field: name, quantity, unit, productName
- `order` - Sort order: asc, desc (default: desc)
- `search` - Search by product name
- `category_id` - Filter by category id

---

## Purchases (History)

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| GET | `/api/purchases` | Get purchase history | `purchases` | `fetchPurchases()` | ✅ |
| GET | `/api/purchases/{id}` | Get purchase details | `purchases` | `getPurchaseById()` | ✅ |
| POST | `/api/purchases/{id}/restore` | Restore purchase to new list | `purchases` | `restorePurchase()` | ✅ |

**Query Parameters (GET /api/purchases):**
- `list_id` - Filter by shopping list ID
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `sort_by` - Sort field: createdAt, list, id (default: createdAt)
- `order` - Sort order: ASC, DESC (default: DESC)

---

## Implementation Summary

### By Feature Area:

**Authentication (9/10)** - 90% Complete
- ✅ Register, Login, Logout, Profile (Get/Update), Verification, Password Management (Change/Forgot)
- ❌ Reset password (requires recovery code from email)

**Categories (4/5)** - 80% Complete
- ✅ List, Create, Update, Delete
- ❌ Get by ID

**Products (4/5)** - 80% Complete
- ✅ List, Create, Update, Delete
- ❌ Get by ID

**Shopping Lists (12/12)** - 100% Complete ✅
- ✅ List, Create, Delete, Get by ID, Update, Purchase, Reset, Share, Get Shared Users, Revoke Access, Move to Pantry

**Shopping List Items (5/5)** - 100% Complete ✅
- ✅ List, Create, Update, Toggle Purchase, Delete

**Pantries (0/8)** - 0% Complete
- ❌ All pantry endpoints

**Pantry Items (0/4)** - 0% Complete
- ❌ All pantry item endpoints

**Purchase History (3/3)** - 100% Complete ✅
- ✅ Get purchase history, Get purchase details, Restore purchase

### Overall Progress: 37/52 endpoints = **71% Complete**

---

## Store File Locations

- **Auth Store:** `src/stores/auth.ts`
- **Lists Store:** `src/stores/lists.ts`
- **Products Store (List Items):** `src/stores/products.ts`
- **Global Products Store:** `src/stores/globalProducts.ts`
- **Purchases Store:** `src/stores/purchases.ts`
- **Pantries Store:** Not created yet

---

## Notes

1. **Missing Store Files:**
   - Pantries store needs to be created

2. **Incomplete Features:**
   - Password reset (requires implementing email verification code flow)
   - Pantry management (not yet implemented)

3. **Recently Implemented:**
   - ✅ Category management (create, update, delete) in Products page
   - ✅ Purchase history tracking and display in Home page (list menu)
   - ✅ Restore purchases to new shopping lists
   - ✅ Shopping list rename and update (name, recurring status)
   - ✅ Toggle recurring status from list cards in Home page
   - ✅ Share list functionality via email (Home page and List page)
   - ✅ Mark list as purchased (saves to history, redirects to home)
   - ✅ Reset all list items to unpurchased
   - ✅ Move purchased items to pantry (API ready, UI in list menu)

4. **Store Naming:**
   - `products` store actually manages **List Items** (items in shopping lists)
   - `globalProducts` store manages the **Products catalog** and **Categories**
   - Consider renaming for clarity in future refactoring

5. **New User Features Implemented:**
   - ✅ Registration page (`/register`) with automatic verification email
   - ✅ Login page with forgot password functionality
   - ✅ User profile fetching on login and displayed in navbar
   - ✅ Profile edit dialog in navbar (update name/surname)
   - ✅ Change password dialog in navbar
   - ✅ Automatic profile loading on app mount when authenticated

