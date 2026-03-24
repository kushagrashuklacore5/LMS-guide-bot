# Enhanced Stock Request System

A completely redesigned stock request system built from scratch with modern features, improved UX, and enhanced functionality.

## 🚀 Features

### Core Functionality
- **Multi-Item Requests**: Create requests with multiple items in a single submission
- **Request Templates**: Save and reuse frequently requested item combinations
- **Advanced Filtering**: Filter by status, urgency, search terms, and more
- **Real-time Updates**: Live status tracking and notifications
- **Vendor Integration**: Browse vendor stock and create requests directly

### Enhanced User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Dashboard Analytics**: Comprehensive statistics and insights
- **Bulk Operations**: Compare multiple vendors and items
- **Mobile Responsive**: Works seamlessly on all devices
- **Accessibility**: WCAG compliant with keyboard navigation

### Advanced Features
- **Request Workflow**: Draft → Pending → Quoted → Approved → Delivered
- **Vendor Quotes**: Compare quotes from multiple vendors
- **Budget Tracking**: Track requests against budget codes
- **Department Management**: Organize requests by department
- **Urgency Levels**: Low, Normal, High, Critical priority levels

## 📁 File Structure

```
├── server/
│   ├── database/
│   │   └── stock_requests_schema.sql    # Database schema
│   ├── routes/
│   │   ├── stockRequestsRoutes.js       # Main API endpoints
│   │   └── requestTemplatesRoutes.js    # Template management
│   └── setup-stock-requests.js        # Database setup script
├── client/
│   ├── src/
│   │   ├── storekeeper/
│   │   │   ├── StockRequestsNew.jsx     # Main requests component
│   │   │   └── VendorStockBrowserNew.jsx # Vendor stock browser
│   │   └── styles/
│   │       └── stock-requests.css       # Enhanced styling
```

## 🛠 Installation & Setup

### 1. Database Setup

Run the database setup script to create the required tables:

```bash
cd server
node setup-stock-requests.js
```

This will create the following tables:
- `stock_requests` - Main request records
- `stock_request_items` - Individual request items
- `request_templates` - Reusable templates
- `vendor_quotes` - Vendor quotations
- `vendor_quote_items` - Individual quote items
- `request_notifications` - System notifications

### 2. Server Configuration

The new routes are automatically registered in `server.js`:

```javascript
/* Enhanced Stock Requests System */
app.use("/api/stock-requests", require("./routes/stockRequestsRoutes"));
app.use("/api/stock-requests/templates", require("./routes/requestTemplatesRoutes"));
```

### 3. Frontend Integration

Import the new components in your storekeeper layout:

```jsx
import StockRequestsNew from './StockRequestsNew';
import VendorStockBrowserNew from './VendorStockBrowserNew';
import '../styles/stock-requests.css';
```

## 📊 API Endpoints

### Stock Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stock-requests` | List all requests with filtering |
| GET | `/api/stock-requests/:id` | Get specific request details |
| POST | `/api/stock-requests` | Create new request |
| PUT | `/api/stock-requests/:id` | Update existing request |
| DELETE | `/api/stock-requests/:id` | Delete request |
| GET | `/api/stock-requests/dashboard/stats` | Get dashboard statistics |

### Request Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stock-requests/templates` | List all templates |
| GET | `/api/stock-requests/templates/:id` | Get specific template |
| POST | `/api/stock-requests/templates` | Create new template |
| PUT | `/api/stock-requests/templates/:id` | Update template |
| DELETE | `/api/stock-requests/templates/:id` | Delete template |

## 🎨 UI Components

### StockRequestsNew Component

Main component for managing stock requests with features:
- Dashboard with statistics
- Advanced filtering and search
- Pagination support
- Request creation modal
- Template integration
- Real-time status updates

### VendorStockBrowserNew Component

Enhanced vendor stock browsing with:
- Vendor selection interface
- Grid/List view modes
- Advanced filtering
- Item comparison
- Direct request creation
- Stock status indicators

## 🔧 Configuration

### Environment Variables

No additional environment variables are required. The system uses the existing database configuration.

### Customization

#### Styling
The CSS file uses Tailwind CSS classes. If you're not using Tailwind, replace the `@apply` directives with standard CSS:

```css
/* Replace */
.btn-primary {
  @apply flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg;
}

/* With */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
}
```

#### Database Schema
The schema is designed to be flexible. You can modify the `stock_requests_schema.sql` file to add custom fields.

## 📱 Usage Examples

### Creating a New Request

```jsx
// The component handles request creation through the UI
// Data is sent to POST /api/stock-requests
const requestData = {
  title: "Computer Lab Equipment",
  description: "New laptops and accessories",
  urgency_level: "high",
  department: "IT Department",
  items: [
    {
      item_name: "Laptop Computer",
      category: "Electronics",
      quantity_requested: 10,
      unit_price: 25000
    }
  ]
};
```

### Using Templates

```jsx
// Templates are accessed through the modal interface
// Template data structure:
const template = {
  name: "Computer Lab Setup",
  description: "Standard computer lab equipment",
  category: "Electronics",
  items: [
    {
      item_name: "Laptop Computer",
      quantity: 10,
      category: "Electronics"
    }
  ]
};
```

## 🔄 Migration from Old System

The new system is designed to work alongside the existing system. To migrate:

1. **Backup existing data**: Export current stock requests
2. **Run setup script**: Creates new tables without affecting existing ones
3. **Update routing**: Point your storekeeper routes to the new components
4. **Data migration**: Use the migration script (if needed)

## 🐛 Troubleshooting

### Common Issues

1. **CSS @apply warnings**: These are expected if not using Tailwind CSS
2. **Database errors**: Ensure the setup script has run successfully
3. **Route conflicts**: Make sure old routes are properly replaced
4. **Permission issues**: Check that the database file is writable

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=stock-requests:* node server.js
```

## 🚀 Performance Optimizations

- **Database Indexes**: Automatically created for frequently queried fields
- **Pagination**: Large datasets are paginated to improve performance
- **Caching**: Templates and vendor data are cached on the client
- **Lazy Loading**: Components load data only when needed

## 🔒 Security Features

- **Authentication**: All endpoints require valid JWT tokens
- **Authorization**: Users can only access their university's data
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Protection**: Uses parameterized queries

## 📈 Future Enhancements

Planned features for future releases:
- [ ] Email notifications for status changes
- [ ] Advanced reporting and analytics
- [ ] Mobile app integration
- [ ] Barcode/QR code scanning
- [ ] Integration with accounting systems
- [ ] AI-powered vendor recommendations

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check the database schema for field requirements
4. Verify all setup steps have been completed

## 📄 License

This enhanced stock request system is part of the LMS project and follows the same licensing terms.
