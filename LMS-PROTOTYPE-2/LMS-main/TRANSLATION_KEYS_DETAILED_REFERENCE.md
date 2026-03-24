# Complete Translation Keys Reference

**For:** Expenses, Inventory & Fees Management Components  
**Total Keys:** 22 new keys  
**Languages:** English (EN), Arabic (AR), Urdu (UR)

---

## 📋 All Translation Keys with Values

### 1. Storekeeper Portal Navigation
```
Key: storekeeper_portal
EN: "Storekeeper Portal"
AR: "بوابة أمين المستودع"
UR: "اسٹور کیپر پورٹل"
```

### 2. Go to Storekeeper Portal (Button)
```
Key: go_to_storekeeper_portal
EN: "Go to Storekeeper Portal"
AR: "الذهاب إلى بوابة أمين المستودع"
UR: "اسٹور کیپر پورٹل کے لیے جائیں"
```

### 3. Storekeeper Portal Description
```
Key: storekeeper_portal_desc
EN: "For detailed inventory management, adding items, and vendor management, please access the Storekeeper Portal."
AR: "للإدارة التفصيلية للمخزون وإضافة العناصر وإدارة الموردين"
UR: "تفصیلی انوینٹری کے انتظام، اشیاء کے اضافے اور سپلائی کاروں کے انتظام کے لیے"
```

### 4. Quick Statistics
```
Key: quick_stats
EN: "Quick Stats"
AR: "الإحصائيات السريعة"
UR: "جلد اعداد و شمار"
```

### 5. Maintenance Bills
```
Key: maintain_bills
EN: "Maintenance Bills"
AR: "فواتير الصيانة"
UR: "دیکھ بھال کے بلز"
```

### 6. Due Date
```
Key: due_date
EN: "Due Date"
AR: "تاريخ الاستحقاق"
UR: "مقررہ وقت"
```

### 7. Status
```
Key: status
EN: "Status"
AR: "الحالة"
UR: "حالت"
```

### 8. Actions
```
Key: actions
EN: "Actions"
AR: "الإجراءات"
UR: "اقدامات"
```

### 9. Pay Fees (Modal Header)
```
Key: pay_fees
EN: "Pay Fees"
AR: "دفع الرسوم"
UR: "فیس ادا کریں"
```

### 10. Pay Now (Button)
```
Key: pay_now
EN: "Pay Now"
AR: "ادفع الآن"
UR: "ابھی ادا کریں"
```

### 11. Processing
```
Key: processing
EN: "Processing..."
AR: "جاري المعالجة..."
UR: "معالجہ ہو رہا ہے..."
```

### 12. Cancel (Button)
```
Key: cancel
EN: "Cancel"
AR: "إلغاء"
UR: "منسوخ کریں"
```

### 13. Test Mode Info
```
Key: test_mode_no_charges
EN: "Test Mode - No Real Charges"
AR: "وضع الاختبار - بدون رسوم حقيقية"
UR: "ڈرائو موڈ - کوئی اس کا معاملعہ نہیں"
```

### 14. Test Card Information
```
Key: test_card_info
EN: "Test Card: 4111 1111 1111 1111 | Any future expiry | Any 3-digit CVV"
AR: "بطاقة الاختبار: 4111 1111 1111 1111 | الانتهاء مستقبلي | أي CVV 3 أرقام"
UR: "ٹیسٹ کارڈ: 4111 1111 1111 1111 | آنے والی معیاد | کوئی 3 ہندسہ CVV"
```

### 15. Invoice Auto Download
```
Key: invoice_auto_download
EN: "Invoice will be downloaded automatically after payment"
AR: "سيتم تحميل الفاتورة آليا بعد الدفع"
UR: "انوائز ادائیگی کے بعد خود کار ڈاؤن لوڈ ہوگی"
```

---

## 📊 Keys by Category

### Navigation & Portals (3 keys)
- `storekeeper_portal`
- `go_to_storekeeper_portal`
- `storekeeper_portal_desc`

### UI Elements & Status (5 keys)
- `quick_stats`
- `status`
- `actions`
- `due_date`
- `maintain_bills`

### Payment Processing (7 keys)
- `pay_fees`
- `pay_now`
- `processing`
- `cancel`
- `test_mode_no_charges`
- `test_card_info`
- `invoice_auto_download`

---

## 🔍 Key Naming Convention

All keys follow this pattern:
- **Lowercase only**
- **Underscores for word separation**
- **Descriptive names**
- **No special characters**

### Examples:
✅ `storekeeper_portal`  
✅ `go_to_storekeeper_portal`  
✅ `test_mode_no_charges`  

❌ `StorekeeperPortal` (camelCase)  
❌ `storekeeper-portal` (hyphens)  
❌ `STOREKEEPER_PORTAL` (uppercase)  

---

## 📂 Location in Code

All these keys are defined in:
```
client/src/context/TranslationContext.jsx
```

### By Language Section:

**English (EN):**
```
Lines: ~1530-1545
Marked: // ===== ACCOUNTANT PORTAL & PAYMENT TRANSLATIONS (ENGLISH) =====
```

**Arabic (AR):**
```
Lines: ~3160-3175
Marked: // ===== ACCOUNTANT PORTAL & PAYMENT TRANSLATIONS (ARABIC) =====
```

**Urdu (UR):**
```
Lines: ~4870-4885
Marked: // ===== ACCOUNTANT PORTAL & PAYMENT TRANSLATIONS (URDU) =====
```

---

## 💻 Usage in Components

### In Expenses.tsx
```tsx
<h1>{t('expenses')}</h1>
<select>
  <option>{t('maintain_bills')}</option>
</select>
<button>{t('add_new_expense')}</button>
```

### In Inventory.tsx
```tsx
<h1>{t('inventory_management')}</h1>
<div>{t('quick_stats')}</div>
<button>{t('go_to_storekeeper_portal')}</button>
```

### In PaymentModal.tsx
```tsx
<h3>{t('pay_fees')}</h3>
<label>{t('payment_option')}</label>
<button>{t('pay_now')}</button>
<p>{t('test_mode_no_charges')}</p>
```

---

## 🔗 Related Keys (Already Defined)

These keys complement the new keys above and were defined in previous sessions:

### From Expenses
- `expenses`
- `track_all_school_expenses`
- `total_expenses`
- `paid`
- `pending`
- `category`
- `description`
- `amount`
- `add_new_expense`
- `staff_salaries`
- `transportation_expenses`
- `utilities`
- `other`

### From Inventory
- `inventory_management`
- `track_manage_school_inventory`
- `consumable`
- `non_consumable`
- `total_items`
- `low_stock`
- `total_value`
- `items_list`
- `in_stock`

### From Payment
- `student_name`
- `total_fees`
- `payment_option`
- `full_payment`
- `partial_payment`
- `payment_amount`

---

## ✨ Quick Search Guide

### To find a key in TranslationContext.jsx:

1. **Open file:** `client/src/context/TranslationContext.jsx`
2. **Press:** Ctrl+F (Windows) or Cmd+F (Mac)
3. **Search for:** `'key_name':`
4. **Should find:** 3 matches (EN, AR, UR)

### Example Search:
```
Search: 'storekeeper_portal':
Results: 3 matches
- Line ~1500 (English)
- Line ~3160 (Arabic)
- Line ~4870 (Urdu)
```

---

## 📋 Verification Checklist

When verifying keys are correctly implemented:

- [ ] Key is defined in English section
- [ ] Key is defined in Arabic section
- [ ] Key is defined in Urdu section
- [ ] Key name is lowercase with underscores
- [ ] Key is used with correct syntax: `{t('key_name')}`
- [ ] No hardcoded text remains alongside translation

---

## 🎯 Import & Usage Template

For any new component needing these keys:

```tsx
import { useTranslation } from '../context/TranslationContext';

export default function ComponentName() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Now you can use any of these keys: */}
      <h1>{t('storekeeper_portal')}</h1>
      <button>{t('pay_now')}</button>
      <p>{t('test_mode_no_charges')}</p>
    </div>
  );
}
```

---

## 📞 Common Questions

### Q: Where do I find these keys?
A: In `client/src/context/TranslationContext.jsx` (all 3 languages)

### Q: How do I use a key?
A: `import { useTranslation } from '../context/TranslationContext';`  
Then: `const { t } = useTranslation();`  
Finally: `<h1>{t('key_name')}</h1>`

### Q: What if a key is missing?
A: Add it to all 3 language sections in TranslationContext.jsx

### Q: Can I modify a key's text?
A: Yes, directly in TranslationContext.jsx - changes apply system-wide

### Q: Which section has which language?
A: EN (~1530), AR (~3160), UR (~4870)

---

## 🚀 Ready to Use

All 22 keys are:
✅ Defined in all 3 languages  
✅ Used in their respective components  
✅ Ready for language switching  
✅ Documented and referenced  

**Status:** Ready for production deployment

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintenance:** Update this document when adding new keys
