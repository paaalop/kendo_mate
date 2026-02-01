# Server Actions: Owner Admin Features

## Payment Management

### `getMonthlyPayments`
Retrieves payment status for all members in a specific month.

- **Input**:
  - `month`: string (YYYY-MM-DD, first day)
  - `status`: 'paid' | 'unpaid' | 'pending' | 'all' (optional)
- **Output**: Array of { payment_id, user_id, user_name, status, paid_at }
- **Permissions**: Owner Only.

### `updatePaymentStatus`
Toggles or sets the payment status.

- **Input**:
  - `paymentId`: string
  - `status`: 'paid' | 'unpaid' | 'pending'
- **Output**: Updated Payment object.
- **Permissions**: Owner Only.

### `initializeMonthlyPayments`
Manually triggers the generation of payment records for the current month (fallback for auto-cron).

- **Input**: None.
- **Output**: { count: number_created }
- **Permissions**: Owner Only.

## Dojo Configuration

### `updateDojoProfile`
Updates dojo details.

- **Input**:
  - `name`: string
- **Output**: Updated Dojo object.
- **Permissions**: Owner Only.

### `getSessionList`
Retrieves all sessions.

- **Input**: None (uses current dojo).
- **Output**: Array of Sessions.
- **Permissions**: Authenticated.

### `manageSession`
Create, Update, or Delete a session.

- **Input**:
  - `action`: 'create' | 'update' | 'delete'
  - `data`: Session object (id optional for create)
- **Output**: Success/Error.
- **Permissions**: Owner Only.

## Curriculum Management

### `getCurriculumList`
Retrieves curriculum items ordered by index.

- **Input**: None.
- **Output**: Array of CurriculumItems.
- **Permissions**: Authenticated.

### `reorderCurriculumItem`
Moves an item to a new position.

- **Input**:
  - `itemId`: string
  - `newIndex`: number
- **Output**: Success/Error.
- **Permissions**: Owner Only (via RPC).

### `manageCurriculumItem`
Create/Update/Delete item.

- **Input**:
  - `action`: 'create' | 'update' | 'delete'
  - `data`: Item object
- **Output**: Success.
- **Permissions**: Owner Only.
