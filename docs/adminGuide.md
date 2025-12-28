# Unitech Grand Ocean — Admin Guide

## Admin Overview
- Admin dashboard pages:
  - Units: `/admin/units`
  - Unit details & components: `/admin/units/{id}`
  - Unit time-shares: `/admin/units/{id}/timeshares`
  - Unit pricing: `/admin/units/{id}/pricing`
  - Bookings list: `/admin/bookings`
  - Booking detail: `/admin/bookings/{id}`
  - Booking payments: `/admin/bookings/{id}/payments`

## Units Management
- Create units and set:
  - `unitCode`, `floor`, `totalAreaSqft`, `sizeCategory`, `quality`, `viewType`, `ownershipAllowed`, `status`
  - Optional time-share: `maxShares`, `sharesSold` auto-tracked
- Inline edit fields from the table and apply filters
- Links:
  - User View → public unit page
  - Manage → unit area components
  - Manage Pricing → pricing setup
  - Manage Time-Shares → fractional ownership management

## Unit Components
- Add, edit, delete suite components: name and area (sft)
- System shows totals and warns if component areas exceed declared unit area
- Visual share bars indicate relative area proportions

## Time-Share Management
- Manage time-share entries per unit:
  - Fields: owner info, status, auto `shareCode` (TS-XXXX)
  - Progress indicator: “X of Y shares sold”
- Calendar booking rules:
  - Each time-share grants 3 days/month and 36 days/year
  - Store ISO date strings in booking calendar
  - Enforce monthly ≤3, yearly ≤36, and prevent overlaps across owners in the same unit

## Pricing Setup
- Set pricing parameters on `/admin/units/{id}/pricing`:
  - `basePrice`, `pricePerSqft`
  - Markups: `viewMarkupPercent`, `qualityMarkupPercent`, `floorMarkupPercent`
- Computed fields:
  - `finalPrice = basePrice + basePrice*(viewMarkupPercent/100) + basePrice*(qualityMarkupPercent/100) + basePrice*(floorMarkupPercent/100)`
  - `timeSharePrice = finalPrice / maxShares` when applicable
- Validation:
  - Base price must be non-negative
  - Markups must be within 0–100
- Optional promo display to preview discounted final price

## Booking Management
- View all bookings at `/admin/bookings` with status filters
- Booking detail shows:
  - Customer info, unit info, ownership type, pricing summary
  - Booking status control and link to payments management
- Booking statuses:
  - Initiated → Booked (booking payment)
  - Allotted (downpayment paid)
  - Completed (all installments paid)
  - Cancelled (manual)

## Payments Management
- Access `/admin/bookings/{id}/payments` to manage payment schedule:
  - Types: Booking, Downpayment, Installment
  - Mark payments as Paid and set method (Bank/Card/MFS/Cash/Cheque) and reference
  - System auto-updates Overdue vs Due based on `dueDate`
- Automatic updates:
  - Booking payment → booking status becomes Booked; for Full ownership unit status becomes Booked; for Time-share, `sharesSold` increments (respect `maxShares`)
  - Downpayment paid → booking status becomes Allotted
  - All installments paid → booking status Completed; for Full ownership unit status becomes Sold

## APIs (Quick Reference)
- Units:
  - `GET /api/units`, `POST /api/units`
  - `GET /api/units/{id}`, `PUT /api/units/{id}`, `PATCH /api/units/{id}`, `DELETE /api/units/{id}`
  - Components: `GET/POST /api/units/{id}/components`, `PUT/DELETE /api/components/{componentId}`
- Time-Shares:
  - `GET/POST /api/units/{id}/timeshares`
  - `PATCH/DELETE /api/timeshares/{id}`
  - `POST /api/timeshares/{id}/book-days`
- Pricing & Plans:
  - `POST /api/pricing/calculate`
  - `POST /api/payment-plans/generate`
  - `POST /api/payment-plans`
- Customers & Bookings:
  - `POST /api/customers`
  - `GET/POST /api/bookings`
  - `GET /api/bookings/{id}`
  - `PATCH /api/bookings/{id}/status`
  - `POST /api/bookings/{id}/payments/generate`
  - `GET /api/bookings/{id}/payments`
  - `POST /api/payments/{id}/pay`
- Leads:
  - `POST /api/leads`

## Business Rules
- Time-share:
  - `sharesSold` must not exceed `maxShares`
  - Booking calendar enforces monthly and yearly limits; prevents overlaps
- Unit deletion:
  - Cannot delete a unit with existing time-shares
- Pricing:
  - Final price recomputes when markups or base price change
- Booking:
  - Full ownership cannot be booked if unit status is Sold
  - Installments require a downpayment and tenure
  - Generator ensures installment schedule covers remaining payable amount

## Troubleshooting
- Pricing not updating:
  - Validate markup ranges and save; revisiting unit should show updated `finalPrice`
- Time-share booking error:
  - Check monthly (≤3) and yearly (≤36) limits and overlaps with other owners
- Payment status not changing:
  - Use Admin Payments page to mark Paid; check due dates for Overdue logic
- Booking blocked:
  - Full ownership units with status Sold cannot be booked; for Time-share ensure `maxShares` has remaining capacity
