# Security Specification - SI-ROCAN

## Data Invariants
1. A user profile must have a unique ID and NIP.
2. Inventory items must have a unique kodeBarang.
3. Barang masuk records must reference a valid kodeBarang.
4. Permintaan persediaan must have a status and pemohon.
5. BMN assets must have a unique kodeBarang and NUP.
6. Letters and dispositions must be linked.

## "Dirty Dozen" Payloads (Deny Cases)
1. Creating a user with a spoofed ID.
2. Updating an inventory item's stock without being a warehouse officer.
3. Reading all user PINs as an unauthenticated guest (Wait, the app currently needs this for its login logic, but we should ideally restrict it).
4. Deleting a BMN asset without admin rights.
5. Creating a letter with a massive payload (Denial of Wallet).
6. Updating a disposition status that is already "completed".
7. Injecting junk characters into document IDs.
8. Modifying the `createdAt` timestamp of a record.
9. Changing the `ownerId` of a document.
10. Listing sensitive records without the correct role.
11. Creating orphaned records (e.g., a disposition for a non-existent letter).
12. Self-assigning an 'admin' role in a user profile.

## Test Runner Plan
- Verify unauthenticated read for 'users' (required for current login logic).
- Verify authenticated write for 'inventory'.
- Verify admin-only delete for 'bmn_assets'.
- Verify immutable fields check.
- Verify status transition locks.
