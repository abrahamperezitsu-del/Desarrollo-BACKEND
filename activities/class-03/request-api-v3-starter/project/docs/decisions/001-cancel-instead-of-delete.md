# Cancel requests instead of deleting them

## Context

The team needed to decide whether to physically delete requests from the system or preserve them with a `cancelled` status when users requested removal. This decision impacts data integrity, auditability, and system behavior.

## Options

### Option 1: Physically delete the request

**Benefits:**
- Removes clutter from the system
- Reduces database size (if applicable)
- Clear indication that the request is no longer active

**Costs:**
- Loss of historical data and audit trail
- Cannot recover requests if needs change later
- Potential violation of compliance requirements
- Loss of context for future reference

### Option 2: Preserve it with status `cancelled`

**Benefits:**
- Maintains complete history of all requests
- Allows for future recovery if needed
- Supports audit and compliance requirements
- Preserves context for future decision-making
- Enables analytics on cancelled vs completed requests

**Costs:**
- Slightly larger dataset (negligible with in-memory storage)
- Requires UI/UX to distinguish cancelled from other statuses
- Additional logic to filter out cancelled requests from active lists

## Decision

We choose **Option 2: Preserve it with status `cancelled`**.

This decision was made because the Request API is designed as a maintenance tracking system where historical data is valuable. Physical deletion would erase valuable information about past issues and decisions. The `cancelled` status provides a clear signal that the request is no longer active while preserving all associated data for potential future reference.

## Consequences

**What we gain:**
- Complete audit trail of all requests ever created
- Ability to analyze patterns in cancelled requests
- Compliance with data retention best practices
- Flexibility to reopen cancelled requests if circumstances change

**What complexity appears:**
- Additional status to manage in the transition map
- UI must distinguish cancelled requests from open/closed ones
- Filters may need to exclude cancelled requests from "active" views

**What can no longer be done:**
- Permanently erase requests from the system
- Use `DELETE` HTTP method on the `/requests` endpoint

**What may need to change later:**
- If requirements change and deletion becomes necessary, a migration script would be needed
- Future features may want to distinguish between "cancelled" and other terminal states more explicitly