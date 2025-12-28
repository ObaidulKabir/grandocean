# Unitech Grand Ocean — Entry & Admin Guide

## Overview
This guide helps new team members (“Entry”) and administrators (“Admin”) use and manage the Unitech Grand Ocean site. It covers key pages, how to manage suites/units, and how data flows through the system.

---

## Entry Guide
- Access the site:
  - Development: `http://localhost:3000/`
  - Production: use your deployed URL
- Explore key pages:
  - `Home` introduces the project with a rotating hero banner and CTAs
  - `Suites` to browse and view suite details
  - `About`, `Location`, `Investment` for project information
  - `Downloads` to get the brochure and materials
  - `Contact` form to submit leads
- Use CTAs on the hero banner:
  - Book a consultation, request price details, download the project brochure
- Submitting a lead:
  - The `Contact` form saves submissions to the database via `POST /api/leads`
  - Required fields: name, mobile. Optional: email, city, message

---

## Admin Guide

### Units Management
- Access admin dashboard: `http://localhost:3000/admin/units`
- Create a unit:
  - Required fields:
    - `unitCode` (e.g., A-101)
    - `floor` (number)
    - `totalAreaSqft` (number, declared area)
    - `sizeCategory` one of: Studio, 1BR, 2BR, 3BR
    - `quality` one of: Premium, Regular
    - `viewType` one of: Sea View, Hill View, Other
    - `ownershipAllowed` one of: Full, TimeShare, Both
    - `status` one of: Available, Hold, Booked, Sold
  - Click `Create` to save
- Filter units:
  - Set any combination of filters and click `Apply Filters`
- Inline editing:
  - Floor, area, category, quality, view, ownership update immediately on change/blur
- Status updates:
  - Change `status` from the table dropdown to reflect availability
- Quick links:
  - `User View` opens the public suite page for the unit
  - `Manage` opens the unit’s component breakdown editor
  - `Manage Pricing` opens pricing setup for the unit
  - `Manage Time-Shares` opens time-share management for the unit

### Unit Component Breakdown
- Access detail: `http://localhost:3000/admin/units/{id}`
- Add components:
  - Provide `componentName` (e.g., Bedroom) and `areaSqft` (number > 0)
  - Click `Add` to save
- Edit components:
  - Update name or area; changes save on blur
- Delete components:
  - Use `Delete` to remove a row
- Totals and warnings:
  - The page shows `Total declared area` and `Total component area`
  - A warning appears if component totals exceed the unit’s declared area
- Visual share:
  - Each component shows a bar indicating percentage of the unit’s total declared area

### Ownership & Time-Share Management
- Unit timeshares: `http://localhost:3000/admin/units/{id}/timeshares`
  - Add, edit, delete time-share entries
  - Status: Available / Reserved / Sold
  - Progress indicator: “X of Y shares sold”
  - Assign booking dates per owner; system enforces:
    - Max 3 days per same month
    - Max 36 days per year
    - No overlaps across owners within the same unit
  - Booked-days and remaining days preview per time-share

### Pricing Setup
- Pricing page: `http://localhost:3000/admin/units/{id}/pricing`
- Fields:
  - `basePrice`, `pricePerSqft`, `viewMarkupPercent`, `qualityMarkupPercent`, `floorMarkupPercent`
- Computed:
  - `finalPrice = basePrice + basePrice*(viewMarkupPercent/100) + basePrice*(qualityMarkupPercent/100) + basePrice*(floorMarkupPercent/100)`
  - `timeSharePrice = finalPrice / maxShares` (when `maxShares > 0`)
- Validation:
  - No negative base price
  - Markups must be between 0–100
- Optional promo display: show discounted final price (non-persistent UI helper)

### Booking & Payments (Admin)
- Bookings list: `http://localhost:3000/admin/bookings`
  - Filter by status; open detail page
- Booking detail: `http://localhost:3000/admin/bookings/{id}`
  - Shows customer, unit, plan; change booking status; manage payments
- Booking payments: `http://localhost:3000/admin/bookings/{id}/payments`
  - View Due/Paid/Overdue
  - Mark payment Paid; set method & reference
  - Status auto-updates; unit and booking progress reflect payments

### Leads
- The contact form posts to `POST /api/leads` and stores submissions
- Admin UI for viewing leads might not be present; check your database’s `Lead` collection

---

## Data & API Reference

### Unit Fields
- `_id` (auto)
- `unitCode`: string
- `floor`: number
- `totalAreaSqft`: number
- `sizeCategory`: enum [Studio, 1BR, 2BR, 3BR]
- `quality`: enum [Premium, Regular]
- `viewType`: enum [Sea View, Hill View, Other]
- `ownershipAllowed`: enum [Full, TimeShare, Both]
- `status`: enum [Available, Hold, Booked, Sold]
- `totalComponentArea`: number (auto-calculated)
 - `maxShares`: number (optional)
 - `sharesSold`: number (default 0)
 - `basePrice`: number
 - `pricePerSqft`: number
 - `viewMarkupPercent`: number
 - `qualityMarkupPercent`: number
 - `floorMarkupPercent`: number
 - `finalPrice`: number (computed & stored)
 - `timeSharePrice`: number (computed & stored)

### Component Fields
- `_id` (auto)
- `unitId`: reference to Unit
- `componentName`: string (unique per unit)
- `areaSqft`: number (> 0)
- `remarks`: optional

### TimeShare Fields
- `_id` (auto)
- `unitId`: reference to Unit
- `ownerName`, `ownerContact`
- `shareCode`: auto-generated `TS-XXXX`
- `daysPerMonth`: default 3
- `daysPerYear`: default 36
- `status`: enum [Available, Reserved, Sold]
- `bookingCalendar`: array of ISO date strings (booked days)

### PaymentPlan Fields
- `_id` (auto)
- `unitId`: reference Unit
- `ownershipType`: enum [Full, TimeShare]
- `totalPrice`
- `bookingPercent`: default 10
- `downpaymentPercent`: default 30
- `paymentMode`: enum [OneTime, Installment]
- `installmentFrequency`: enum [Monthly, Quarterly]
- `tenureYears`: enum [1, 2, 3]
- `bookingAmount`, `downpaymentAmount`, `installmentAmount`
- `numberOfInstallments`
- `schedule`: array of `{ dueDate, amount }`

### Customer Fields
- `_id` (auto)
- `name`, `phone`, `email`
- `nationalIdOrPassport`
- `address`, `country`
- `notes` (optional)

### Booking Fields
- `_id` (auto)
- `bookingCode`: auto `BK-XXXX`
- `unitId`, `ownershipType`, `customerId`, `paymentPlanId`
- `bookingStatus`: enum [Initiated, Booked, Allotted, Cancelled, Completed]
- `bookingDate`
- `remarks`

### Payment Fields
- `_id` (auto)
- `bookingId`
- `paymentType`: enum [Booking, Downpayment, Installment]
- `amount`
- `dueDate`, `paidDate` (optional)
- `status`: enum [Due, Paid, Overdue]
- `method`: enum [Bank, Card, MFS, Cash, Cheque]
- `referenceNo` (optional)

### HTTP Endpoints
- `GET /api/units?floor=&viewType=&sizeCategory=&quality=&status=`
  - Returns filtered unit list
- `POST /api/units`
  - Creates a unit (JSON body as fields above)
- `GET /api/units/{id}`
  - Returns a unit by id
- `PUT /api/units/{id}` / `PATCH /api/units/{id}`
  - Updates a unit
- `DELETE /api/units/{id}`
  - Deletes a unit and its components
- `GET /api/units/{id}/components`
  - Lists components and totals; includes `warn` when exceeding declared area
- `POST /api/units/{id}/components`
  - Adds a component (validates name and area > 0)
- `PUT /api/components/{componentId}`
  - Updates a component and recalculates totals
- `DELETE /api/components/{componentId}`
  - Deletes a component and recalculates totals
- `POST /api/leads`
  - Creates a lead (requires `name`, `mobile`)
- `GET /api/units/{id}/timeshares`
  - List time-shares for a unit
- `POST /api/units/{id}/timeshares`
  - Create time-share (auto `shareCode`)
- `PATCH /api/timeshares/{id}`
  - Update owner info or status; adjusts `sharesSold` accordingly
- `DELETE /api/timeshares/{id}`
  - Delete time-share; adjusts `sharesSold` if status was Sold
- `POST /api/timeshares/{id}/book-days`
  - Assign booked dates; validates monthly/yearly limits and overlaps
- `POST /api/pricing/calculate`
  - Compute `finalPrice` and `timeSharePrice` for a unit
- `POST /api/payment-plans/generate`
  - Generate plan preview with schedule
- `POST /api/payment-plans`
  - Save payment plan
- `POST /api/customers`
  - Create customer
- `POST /api/bookings`
  - Create booking (validates unit Sold and shares limit)
- `GET /api/bookings`
  - List bookings (filter by `status`)
- `GET /api/bookings/{id}`
  - Booking details with unit, customer, plan
- `PATCH /api/bookings/{id}/status`
  - Update status; auto-adjust unit status/shares
- `POST /api/bookings/{id}/payments/generate`
  - Create payment entries for booking/downpayment/installments
- `GET /api/bookings/{id}/payments`
  - List payments; auto-update Overdue/Due on fetch
- `POST /api/payments/{id}/pay`
  - Mark payment Paid; adjusts booking/unit statuses

---

## Operations & Best Practices
- Keep `totalAreaSqft` accurate; component totals should not exceed it
- Use consistent component names for clarity (e.g., Bedroom, Living, Balcony)
- Status lifecycle:
  - `Available` → `Hold` (temporary) → `Booked` → `Sold`
- Booking lifecycle:
  - Initiated → Booked (booking payment) → Allotted (downpayment) → Completed (all installments paid)
- Time-share lifecycle:
  - `sharesSold` increments on booking payment
  - Respect `maxShares`
- Backups:
  - Schedule regular backups of the database
  - Verify restore procedures
- Access control:
  - Protect `/admin/*` routes with authentication (middleware or an auth provider)
  - Restrict admin access to authorized staff only
- Change management:
  - Prefer making changes in staging before production
  - Communicate unit status changes to sales/marketing teams

---

## Troubleshooting
- Filters do not update:
  - Confirm you clicked `Apply Filters`
  - Reload the page to fetch latest data
- Component warning:
  - Reduce component areas or update declared `totalAreaSqft`
- Lead submission fails:
  - Ensure `name` and `mobile` are present
  - Check database connectivity and server logs
- Admin access:
  - If `/admin/units` is accessible publicly, implement auth and route protection
- Pricing not updating:
  - Ensure base price and markup ranges are valid
  - Save changes on the Pricing page; reload unit
- Time-share booking dates rejected:
  - Check monthly (≤3) and yearly (≤36) limits
  - Ensure no overlap with other owners
- Payment status not changing:
  - Use Admin Payments page to mark payments Paid
  - Verify due dates and Overdue logic

---

## Glossary
- `Unit / Suite`: A sellable/ownable accommodation
- `Component`: A named area within a unit (Bedroom, Living, etc.)
- `Declared area`: The official area used for allocation and sales
- `Component total`: Sum of component areas; used to validate declared area
 - `Time-Share`: Fractional ownership granting limited stay entitlements per period
 - `Booking Money`: Initial payment to confirm booking
 - `Downpayment`: Payment to allot and confirm allocation
 - `Installment`: Scheduled payment over tenure
