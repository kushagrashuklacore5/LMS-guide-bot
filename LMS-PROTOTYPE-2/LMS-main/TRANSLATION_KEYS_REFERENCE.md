# Translation Keys Reference - Quick Copy

## ALL 150+ Translation Keys Available

### Accountant Portal Keys (Copy-Paste Ready)

```javascript
// Fees Collection
t('fees_collection')
t('manage_student_fee_payments')
t('primary')
t('secondary')
t('payment_method')
t('transaction_date')

// Transaction Management
t('transaction_management')
t('manage_monitor_all_student_transactions')

// Inventory
t('inventory_management')
t('track_manage_school_inventory')
t('consumable')
t('non_consumable')
t('total_items')
t('low_stock_items')
t('total_inventory_value')
t('items_list')
t('per_unit_price')
t('total_value')
t('vendor')
t('stock_status')
t('low_stock')
t('in_stock')
t('order')
t('storekeeper_portal_link')
t('for_detailed_inventory_management')
t('go_to_storekeeper')

// Expenses
t('expenses')
t('track_all_school_expenses')
t('total_expenses')
t('paid')
t('pending')
t('maintenance_bills')
t('staff_salaries')
t('transportation_expenses')
t('utilities')
t('other')
t('description')
t('add_new_expense')
t('expense_category')
t('category')
t('amount')
t('please_fill_all_fields')
t('expense_added_successfully')
t('failed_to_add_expense')

// Payment
t('payment_history')
t('invoice')
t('download')
t('payment_status')
t('full_payment')
t('partial_payment')
t('generate_invoice')
t('place_order')
t('select_payment_option')
t('student_name')
t('total_fees')
t('payment_amount')
t('payment_option')
t('units_to_order')
t('order_quantity')
t('unit_price')
t('delivery_date')
t('vendor_id')
t('calculated_total_amount')
t('thank_you_for_business')
t('payment_received_for_fee')
t('terms_conditions')

// Database Export
t('database_export')
t('download_full_database')
t('downloading_finance_database')
t('finance_database_export_completed')
t('accountant_export_features')
t('access_only_finance_inventory')
t('export_payments_fees_expenses_inventory')
t('download_excel_files_for_analysis')
t('sensitive_data_automatically_filtered')
t('loading_finance_export')
t('downloading_data')
t('export_completed')
```

---

### Storekeeper Portal Keys (Copy-Paste Ready)

```javascript
// Main Navigation
t('storekeeper')
t('inventory')
t('vendors')
t('requirements')
t('reports')

// Inventory Management
t('item_name')
t('category')
t('quantity')
t('unit_price')
t('vendor_name')
t('purchase_date')
t('description')
t('minimum_stock_level')
t('add_new_item')
t('edit_item')
t('delete_item')
t('search')
t('search_items')
t('item_added_successfully')
t('item_updated_successfully')
t('item_deleted_successfully')
t('failed_to_add_item')
t('failed_to_update_item')
t('failed_to_delete_item')

// Vendor Management
t('vendor_management')
t('manage_suppliers_vendors')
t('contact_person')
t('email')
t('phone')
t('address')
t('rating')
t('total_orders')
t('add_vendor')
t('edit_vendor')
t('delete_vendor')
t('vendor_added_successfully')
t('vendor_updated_successfully')
t('vendor_deleted_successfully')
t('failed_to_add_vendor')
t('failed_to_update_vendor')
t('failed_to_delete_vendor')

// Reports
t('inventory_reports')
t('generate_reports')
t('inventory')
t('vendors_report')
t('purchases_report')
t('total_inventory_items')
t('total_inventory_value')
t('low_stock_items_count')
t('total_vendors')
t('active_vendors')
t('vendor_rating')
t('total_purchases')
t('purchase_date')
t('purchase_amount')
t('orders_history')
t('order_details')
t('order_status')
t('pending_orders')
t('approved_orders')
t('delivered_orders')
t('current_stock')
t('order_placed_successfully')
t('current_stock_units')
t('unknown_vendor')

// Actions
t('cancel')
t('confirm')
t('close')
```

---

### SuperAdmin Portal Keys (Copy-Paste Ready)

```javascript
// Main Portal
t('superadmin_dashboard')
t('superadmin')
t('create_university')
t('create_user')
t('all_universities')
t('all_users_list')
t('universities')

// University Management
t('university_name')
t('area')
t('area_location')
t('admin_name')
t('admin_email')
t('admin_password')
t('university_created_successfully')
t('generated_password')
t('auto_generated_password')
t('admin_auto_approved')
t('university_admin')
t('created_date')
t('university_details')
t('created')
t('add_users_to_university')

// User Management
t('user_full_name')
t('user_email')
t('user_role')
t('select_role')
t('teacher')
t('accountant')
t('storekeeper')
t('student')
t('user_created_successfully')
t('user_credentials')
t('user_name_colon')
t('user_email_colon')
t('user_password_colon')
t('download_pdf_credentials')
t('download_all_credentials')
t('email')
t('password')
t('active')
t('inactive')
t('no_universities_created')
t('no_users_created')
t('user_status')
t('user_created_date')

// Login
t('superadmin_login')
t('superadmin_login_title')
t('superadmin_credentials')
t('credentials_display')
t('show_password')
t('hide_password')
t('invalid_credentials')
t('login_successful')
```

---

## Quick Reference Table

| Component | Total Keys | EN | AR | UR |
|-----------|-----------|----|----|-----|
| Accountant | 42 | ✅ | ✅ | ✅ |
| Storekeeper | 46 | ✅ | ✅ | ✅ |
| SuperAdmin | 44 | ✅ | ✅ | ✅ |
| **TOTAL** | **132** | **✅** | **✅** | **✅** |

---

## How to Use These Keys

### 1. Copy Any Key
```javascript
t('fees_collection')
```

### 2. Paste in Your Component
```jsx
<h1>{t('fees_collection')}</h1>
```

### 3. That's It!
The component will automatically display the correct translation based on the selected language.

---

## Common Patterns

### Headers/Titles
```javascript
t('fees_collection')
t('inventory_management')
t('transaction_management')
t('vendor_management')
t('inventory_reports')
```

### Buttons
```javascript
t('add_new_item')
t('edit_item')
t('delete_item')
t('download')
t('place_order')
t('generate_invoice')
```

### Form Labels
```javascript
t('item_name')
t('category')
t('quantity')
t('unit_price')
t('vendor_name')
t('email')
t('phone')
```

### Status/State
```javascript
t('paid')
t('pending')
t('active')
t('inactive')
t('low_stock')
t('in_stock')
```

### Messages/Feedback
```javascript
t('item_added_successfully')
t('failed_to_add_item')
t('please_fill_all_fields')
t('order_placed_successfully')
```

---

## Three Language Sample

### Key: 'fees_collection'
- **English**: Fees Collection
- **Arabic**: تحصيل الرسوم
- **Urdu**: فیس کی وصولی

### Key: 'manage_student_fee_payments'
- **English**: Manage student fee payments and collection status
- **Arabic**: إدارة دفعات رسوم الطلاب والحالة
- **Urdu**: طالب علم کی فیس کی ادائیگی اور وصولی کی حالت کا انتظام کریں

### Key: 'inventory_management'
- **English**: Inventory Management
- **Arabic**: إدارة المخزون
- **Urdu**: انوینٹری کا انتظام

---

## Most Used Keys (Appear in Multiple Portals)

```javascript
// Common across portals
t('cancel')
t('email')
t('phone')
t('description')
t('name')
t('status')
t('created')
t('delete')
t('edit')
t('download')
```

---

## Implementation Checklist

- [ ] Copy the key from above
- [ ] Import useTranslation: `import { useTranslation } from '../context/TranslationContext';`
- [ ] Use in component: `const { t } = useTranslation();`
- [ ] Replace text: `{t('key_name')}`
- [ ] Test in all 3 languages: EN, AR, UR
- [ ] Verify layout doesn't break
- [ ] Move to next file

---

## Need Help?

If a key is not listed here:
1. Check TranslationContext.jsx
2. Search for similar key
3. Or create a new key if needed

All keys are in snake_case format for consistency.

---

**Last Updated**: [Current Date]
**Status**: All 132 Keys Available ✅
**Languages**: 3 (EN, AR, UR)
