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
| POST | `/api/users/register` | Register new user | - | - | ❌ |
| POST | `/api/users/login` | Log user in | `auth` | `login()` | ✅ |
| POST | `/api/users/logout` | Log user out | `auth` | `logout()` | ✅ |
| GET | `/api/users/profile` | Get user information | - | - | ❌ |
| PUT | `/api/users/profile` | Update user profile | - | - | ❌ |
| POST | `/api/users/verify-account` | Verify user account | - | - | ❌ |
| POST | `/api/users/forgot-password` | Send password recovery | - | - | ❌ |
| POST | `/api/users/reset-password` | Reset user password | - | - | ❌ |
| POST | `/api/users/send-verification` | Send verification token | - | - | ❌ |
| POST | `/api/users/change-password` | Change user password | - | - | ❌ |

---

## Categories

| Method | Endpoint | Description | Store | Function | Status |
|--------|----------|-------------|-------|----------|--------|
| POST | `/api/categories` | Create new category | - | - | ❌ |
| GET | `/api/categories` | Get all categories | `globalProducts` | `fetchCategories()` | ✅ |
| GET | `/api/categories/{id}` | Get specific category | - | - | ❌ |
| PUT | `/api/categories/{id}` | Update category | - | - | ❌ |
| DELETE | `/api/categories/{id}` | Delete category | - | - | ❌ |

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
| GET | `/api/shopping-lists/{id}` | Get shopping list by ID | - | - | ❌ |
| PUT | `/api/shopping-lists/{id}` | Update shopping list | - | - | ❌ |
| DELETE | `/api/shopping-lists/{id}` | Delete shopping list | `lists` | `deleteList()` | ✅ |
| POST | `/api/shopping-lists/{id}/purchase` | Mark list as purchased | - | - | ❌ |
| POST | `/api/shopping-lists/{id}/reset` | Reset all items to unpurchased | - | - | ❌ |
| POST | `/api/shopping-lists/{id}/move-to-pantry` | Move purchased items to pantry | - | - | ❌ |
| POST | `/api/shopping-lists/{id}/share` | Share list with user by email | - | - | ❌ |
| GET | `/api/shopping-lists/{id}/shared-users` | Get users list is shared with | - | - | ❌ |
| DELETE | `/api/shopping-lists/{id}/share/{user_id}` | Revoke user access | - | - | ❌ |

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
| GET | `/api/purchases` | Get purchase history | - | - | ❌ |
| GET | `/api/purchases/{id}` | Get purchase details | - | - | ❌ |
| POST | `/api/purchases/{id}/restore` | Restore purchase to new list | - | - | ❌ |

**Query Parameters (GET /api/purchases):**
- `list_id` - Filter by shopping list ID
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 10)
- `sort_by` - Sort field: createdAt, list, id (default: createdAt)
- `order` - Sort order: ASC, DESC (default: DESC)

---

## Implementation Summary

### By Feature Area:

**Authentication (1/10)** - 10% Complete
- ✅ Login, Logout
- ❌ Register, Profile, Password Management, Verification

**Categories (1/5)** - 20% Complete
- ✅ List categories
- ❌ Create, Update, Delete, Get by ID

**Products (4/5)** - 80% Complete
- ✅ List, Create, Update, Delete
- ❌ Get by ID

**Shopping Lists (3/12)** - 25% Complete
- ✅ List, Create, Delete
- ❌ Get by ID, Update, Purchase, Reset, Share, Move to Pantry

**Shopping List Items (5/5)** - 100% Complete ✅
- ✅ List, Create, Update, Toggle Purchase, Delete

**Pantries (0/8)** - 0% Complete
- ❌ All pantry endpoints

**Pantry Items (0/4)** - 0% Complete
- ❌ All pantry item endpoints

**Purchase History (0/3)** - 0% Complete
- ❌ All purchase history endpoints

### Overall Progress: 14/52 endpoints = **27% Complete**

---

## Store File Locations

- **Auth Store:** `src/stores/auth.ts`
- **Lists Store:** `src/stores/lists.ts`
- **Products Store (List Items):** `src/stores/products.ts`
- **Global Products Store:** `src/stores/globalProducts.ts`
- **Pantries Store:** Not created yet
- **Purchases Store:** Not created yet

---

## Notes

1. **Missing Store Files:**
   - Pantries store needs to be created
   - Purchases/history store needs to be created
   - User profile store needs to be created

2. **Incomplete Features:**
   - Shopping list update (rename, change recurring status)
   - Sharing functionality for lists and pantries
   - Purchase history tracking
   - Moving items to pantry
   - Category management UI

3. **Store Naming:**
   - `products` store actually manages **List Items** (items in shopping lists)
   - `globalProducts` store manages the **Products catalog** and **Categories**
   - Consider renaming for clarity in future refactoring

