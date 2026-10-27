# Divido: API Contracts

This document is the **single source of truth** for all API endpoints.  
Backend implements against this. Mobile consumes against this. Neither side deviates without updating this file first.

---

## Conventions

| Convention | Value |
|---|---|
| Base URL | `https://<host>/api/v1` |
| Auth | `Authorization: Bearer <sanctum-token>` |
| Content-Type | `application/json` |
| Date format | ISO 8601: `2026-03-23T14:00:00.000Z` |
| Amounts | Stored as integers (cents) or decimal strings: always `number` in JSON |
| Protected routes | Marked 🔒: require `Authorization` header |

---

## Standard Response Envelope

**Success:**
```json
{
  "data": { ... },
  "message": "Human-readable success message."
}
```

**Collection:**
```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  }
}
```

**Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Error (401 / 403 / 404 / 500):**
```json
{
  "message": "Human-readable error description."
}
```

---

## Phase 1: Authentication, Groups, Expenses

---

### Auth

#### `POST /auth/register`
Create a new user account.

**Request:**
```json
{
  "name": "Usama Khaki",
  "email": "usama@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

**Response `201`:**
```json
{
  "data": {
    "token": "1|abc123...",
    "user": {
      "id": 1,
      "name": "Usama Khaki",
      "email": "usama@example.com"
    }
  },
  "message": "Account created successfully."
}
```

**Errors:** `422`: validation failure

---

#### `POST /auth/login`
Authenticate and receive a Sanctum token.

**Request:**
```json
{
  "email": "usama@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "data": {
    "token": "2|xyz456...",
    "user": {
      "id": 1,
      "name": "Usama Khaki",
      "email": "usama@example.com"
    }
  },
  "message": "Logged in successfully."
}
```

**Errors:** `401`: invalid credentials, `422`: validation failure

---

#### `POST /auth/logout` 🔒
Revoke the current token.

**Request:** _(no body)_

**Response `200`:**
```json
{
  "data": null,
  "message": "Logged out successfully."
}
```

**Errors:** `401`: unauthenticated

---

#### `GET /auth/me` 🔒
Return the authenticated user.

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "name": "Usama Khaki",
    "email": "usama@example.com"
  }
}
```

**Errors:** `401`: unauthenticated

---

### Groups

#### `GET /groups` 🔒
List all groups the authenticated user belongs to.

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Weekend Trip",
      "created_by": 1,
      "member_count": 4,
      "created_at": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /groups` 🔒
Create a new group. The creator is automatically added as a member.

**Request:**
```json
{
  "name": "Weekend Trip"
}
```

**Response `201`:**
```json
{
  "data": {
    "id": 1,
    "name": "Weekend Trip",
    "created_by": 1,
    "members": [
      { "id": 1, "name": "Usama Khaki", "email": "usama@example.com" }
    ],
    "created_at": "2026-03-01T10:00:00.000Z"
  },
  "message": "Group created successfully."
}
```

**Errors:** `422`: validation failure

---

#### `GET /groups/{groupId}` 🔒
Get a single group with its members.

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "name": "Weekend Trip",
    "created_by": 1,
    "members": [
      { "id": 1, "name": "Usama Khaki", "email": "usama@example.com" },
      { "id": 2, "name": "Waqas Ali",   "email": "waqas@example.com" }
    ],
    "created_at": "2026-03-01T10:00:00.000Z"
  }
}
```

**Errors:** `403`: not a member, `404`: not found

---

#### `DELETE /groups/{groupId}` 🔒
Delete a group. Only the creator can delete.

**Response `200`:**
```json
{
  "data": null,
  "message": "Group deleted successfully."
}
```

**Errors:** `403`: not the creator, `404`: not found

---

#### `POST /groups/{groupId}/members` 🔒
Add a member to a group by email.

**Request:**
```json
{
  "email": "waqas@example.com"
}
```

**Response `200`:**
```json
{
  "data": {
    "id": 2,
    "name": "Waqas Ali",
    "email": "waqas@example.com"
  },
  "message": "Member added successfully."
}
```

**Errors:** `404`: user not found, `422`: already a member, `403`: not a group member

---

#### `DELETE /groups/{groupId}/members/{userId}` 🔒
Remove a member from a group. Only the creator can remove others; members can remove themselves.

**Response `200`:**
```json
{
  "data": null,
  "message": "Member removed successfully."
}
```

**Errors:** `403`: unauthorized, `404`: not found

---

### Expenses

#### `GET /groups/{groupId}/expenses` 🔒
List expenses for a group. Paginated, newest first.

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 15 | Items per page |

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Dinner",
      "total_amount": 1200.00,
      "category": "food",
      "paid_by": { "id": 1, "name": "Usama Khaki" },
      "created_at": "2026-03-10T20:00:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

**Errors:** `403`: not a member, `404`: group not found

---

#### `POST /expenses` 🔒
Create a new expense with optional items.

**Request:**
```json
{
  "group_id": 1,
  "title": "Dinner",
  "total_amount": 1200.00,
  "category": "food",
  "items": [
    { "name": "Sheesha", "price": 600.00, "quantity": 1 },
    { "name": "Drinks",  "price": 600.00, "quantity": 2 }
  ]
}
```

> `category` is optional. `items` is optional in Phase 1 (required from Phase 2).  
> Valid categories: `food`, `transport`, `accommodation`, `entertainment`, `shopping`, `other`

**Response `201`:**
```json
{
  "data": {
    "id": 1,
    "title": "Dinner",
    "total_amount": 1200.00,
    "category": "food",
    "paid_by": { "id": 1, "name": "Usama Khaki" },
    "items": [
      { "id": 1, "name": "Sheesha", "price": 600.00, "quantity": 1 },
      { "id": 2, "name": "Drinks",  "price": 600.00, "quantity": 2 }
    ],
    "created_at": "2026-03-10T20:00:00.000Z"
  },
  "message": "Expense created successfully."
}
```

**Errors:** `422`: validation failure, `403`: not a group member

---

#### `GET /expenses/{expenseId}` 🔒
Get a single expense with items and splits.

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "title": "Dinner",
    "total_amount": 1200.00,
    "category": "food",
    "paid_by": { "id": 1, "name": "Usama Khaki" },
    "items": [
      {
        "id": 1,
        "name": "Sheesha",
        "price": 600.00,
        "quantity": 1,
        "splits": [
          { "user": { "id": 1, "name": "Usama Khaki" }, "amount": 300.00 },
          { "user": { "id": 2, "name": "Waqas Ali"   }, "amount": 300.00 }
        ]
      }
    ],
    "created_at": "2026-03-10T20:00:00.000Z"
  }
}
```

**Errors:** `403`: not a group member, `404`: not found

---

#### `DELETE /expenses/{expenseId}` 🔒
Delete an expense. Only the creator (`paid_by`) can delete. The group's pending settlements are recalculated afterwards.

**Response `200`:**
```json
{
  "data": null,
  "message": "Expense deleted successfully."
}
```

**Errors:** `403`: not the creator, `404`: not found

---

## Phase 2: Item Splitting & Settlements

---

### Item Splits

#### `PUT /expenses/{expenseId}/items/{itemId}/splits` 🔒
Assign which users share a specific item and how much each owes.

**Request:**
```json
{
  "splits": [
    { "user_id": 1, "amount": 300.00 },
    { "user_id": 2, "amount": 300.00 }
  ]
}
```

> Sum of `amount` values must equal `item.price × item.quantity`, and every `user_id` must be a member of the expense's group. The item must belong to `{expenseId}`. Pending settlements for the group are recalculated, net of settlements already marked paid.

**Response `200`:**
```json
{
  "data": {
    "item_id": 1,
    "splits": [
      { "user": { "id": 1, "name": "Usama Khaki" }, "amount": 300.00 },
      { "user": { "id": 2, "name": "Waqas Ali"   }, "amount": 300.00 }
    ]
  },
  "message": "Splits updated successfully."
}
```

**Errors:** `422`: amounts don't add up or a split user is not a group member, `403`: not a member, `404`: expense not found or item not part of this expense

---

### Settlements

#### `GET /groups/{groupId}/settlements` 🔒
Get the optimized settlement plan for a group (who owes whom, minimizing transactions).

**Response `200`:**
```json
{
  "data": {
    "settlements": [
      {
        "id": 1,
        "from": { "id": 2, "name": "Waqas Ali" },
        "to":   { "id": 1, "name": "Usama Khaki" },
        "amount": 600.00,
        "status": "pending"
      }
    ],
    "total_unsettled": 600.00
  }
}
```

---

#### `POST /settlements/{settlementId}/settle` 🔒
Mark a settlement as paid.

**Request:** _(no body)_

**Response `200`:**
```json
{
  "data": {
    "id": 1,
    "status": "settled",
    "settled_at": "2026-03-23T10:00:00.000Z"
  },
  "message": "Settlement marked as paid."
}
```

**Errors:** `403`: not the payer, `404`: not found, `422`: already settled

---

## Phase 3: OCR

---

#### `POST /ocr/analyze` 🔒
Proxy a receipt image to Google Vision and return parsed text.  
**Never call Google Vision directly from mobile.**

**Request:**
```json
{
  "image": "<base64-encoded-jpeg>"
}
```

> Max image size: 10 MB (base64). Compress on mobile before sending (max 800px wide, JPEG 0.8).

**Response `200`:**
```json
{
  "data": {
    "text": "Sheesha 600.00\nDrinks 300.00\nTotal 900.00",
    "confidence": 0.91
  }
}
```

**Errors:** `422`: image too large or missing, `429`: rate limited (30 req/min), `502`: Google Vision error

---

## Phase 4: Smart Suggestions

---

#### `GET /groups/{groupId}/suggestions` 🔒
Return predicted item→user assignments based on past frequency.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `items` | string (comma-separated) | Item names to get suggestions for, e.g. `?items=Sheesha,Drinks` |

**Response `200`:**
```json
{
  "data": [
    {
      "item_name": "Sheesha",
      "suggested_users": [
        { "user": { "id": 1, "name": "Usama Khaki" }, "confidence": 0.90 },
        { "user": { "id": 2, "name": "Waqas Ali"   }, "confidence": 0.75 }
      ]
    }
  ]
}
```

---

#### `GET /expenses/{expenseId}/summary` 🔒
Generate a text summary for sharing (WhatsApp, etc.).

**Response `200`:**
```json
{
  "data": {
    "summary": "Weekend Trip — Dinner\nTotal: PKR 1,200\n\nUsama paid\nWaqas owes PKR 300\n\nSettled via Divido"
  }
}
```

---

## Phase 5: Insights

---

#### `GET /groups/{groupId}/insights` 🔒
Return spending analytics for a group.

**Response `200`:**
```json
{
  "data": {
    "total_group_spend": 2400.00,
    "spent_per_user": [
      { "user": { "id": 1, "name": "Usama Khaki" }, "total": 1200.00 },
      { "user": { "id": 2, "name": "Waqas Ali"   }, "total": 1200.00 }
    ],
    "category_breakdown": [
      { "category": "food",      "total": 1800.00 },
      { "category": "transport", "total": 600.00  }
    ]
  }
}
```

**Errors:** `403`: not a member, `404`: group not found

---

## HTTP Status Code Reference

| Code | Meaning |
|---|---|
| `200` | OK: successful read or update |
| `201` | Created: new resource created |
| `401` | Unauthenticated: missing or invalid token |
| `403` | Forbidden: authenticated but not authorized |
| `404` | Not Found: resource doesn't exist |
| `422` | Unprocessable: validation failed |
| `429` | Too Many Requests: rate limit exceeded |
| `500` | Server Error: unexpected failure |
| `502` | Bad Gateway: external API (Google Vision) failed |
