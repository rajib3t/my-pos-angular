# Pagination Component

A reusable Angular pagination component with modern styling using Tailwind CSS.

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Configurable Page Size**: Allow users to change how many items to show per page
- **Smart Page Navigation**: Shows relevant page numbers with ellipsis for long ranges
- **Modern UI**: Clean, professional design with hover effects and transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **TypeScript Support**: Full type definitions included

## Installation & Setup

1. Copy the pagination component files to your shared components directory:
   ```
   src/app/shared/components/pagination/
   ├── pagination.ts
   ├── pagination.html
   ├── pagination.css
   ├── pagination-example.ts
   └── index.ts
   ```

2. Import the component in your feature component:
   ```typescript
   import { PaginationComponent, PaginationConfig, PaginationChange } from '@/app/shared/components/pagination';
   ```

3. Add to your component's imports array:
   ```typescript
   @Component({
     imports: [CommonModule, PaginationComponent],
     // ...
   })
   ```

## Usage

### Basic Setup

1. **Define your pagination configuration:**
   ```typescript
   paginationConfig: PaginationConfig = {
     total: 0,      // Total number of items
     page: 1,       // Current page number
     limit: 10,     // Items per page
     pages: 0       // Total number of pages
   };
   ```

2. **Add the pagination component to your template:**
   ```html
   <app-pagination 
     [config]="paginationConfig"
     [showSizeSelector]="true"
     [sizeOptions]="[5, 10, 25, 50]"
     [maxVisiblePages]="5"
     (pageChange)="onPaginationChange($event)">
   </app-pagination>
   ```

3. **Handle pagination changes:**
   ```typescript
   onPaginationChange(change: PaginationChange): void {
     this.paginationConfig.page = change.page;
     this.paginationConfig.limit = change.limit;
     this.loadData(); // Your method to reload data
   }
   ```

### API Integration

Your API should return data in this format:

```json
{
  "items": [
    {
      "_id": "68c01f2b81c435f5ed00a8f6",
      "name": "Example Item",
      "createdAt": "2025-09-09T12:35:55.203Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "pages": 15
}
```

Example service method:

```typescript
getData(page: number, limit: number, filters?: any): Observable<PaginatedResult> {
  let queryParams = `page=${page}&limit=${limit}`;
  
  // Add filters to query parameters
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
  }
  
  return this.apiService.get<PaginatedResult>(`your-endpoint?${queryParams}`)
    .pipe(map(response => response.data));
}
```

## Component Properties

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `PaginationConfig` | Required | Pagination configuration object |
| `showSizeSelector` | `boolean` | `true` | Show/hide the page size selector |
| `sizeOptions` | `number[]` | `[5,10,25,50,100]` | Available page size options |
| `maxVisiblePages` | `number` | `5` | Maximum number of page buttons to show |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `pageChange` | `PaginationChange` | Emitted when page or page size changes |

### Interfaces

```typescript
interface PaginationConfig {
  total: number;    // Total number of items
  page: number;     // Current page number (1-based)
  limit: number;    // Items per page
  pages: number;    // Total number of pages
}

interface PaginationChange {
  page: number;     // New page number
  limit: number;    // New page size
}
```

## Styling

The component uses Tailwind CSS classes. If you need to customize the styling:

1. Modify the HTML template in `pagination.html`
2. Add custom CSS in `pagination.css`
3. Override Tailwind classes as needed

## Examples

### Basic Table with Pagination

```typescript
@Component({
  template: `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngFor="let item of items" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.name }}
            </td>
          </tr>
        </tbody>
      </table>
      
      <app-pagination 
        [config]="paginationConfig"
        (pageChange)="onPaginationChange($event)">
      </app-pagination>
    </div>
  `
})
export class MyListComponent {
  items: any[] = [];
  paginationConfig: PaginationConfig = {
    total: 0, page: 1, limit: 10, pages: 0
  };

  loadItems() {
    this.myService.getItems(this.paginationConfig.page, this.paginationConfig.limit)
      .subscribe(response => {
        this.items = response.items;
        this.paginationConfig = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          pages: response.pages
        };
      });
  }

  onPaginationChange(change: PaginationChange) {
    this.paginationConfig.page = change.page;
    this.paginationConfig.limit = change.limit;
    this.loadItems();
  }
}
```

### With Search Filters

```typescript
export class FilterableListComponent {
  items: any[] = [];
  paginationConfig: PaginationConfig = {
    total: 0, page: 1, limit: 10, pages: 0
  };
  searchTerm: string = '';

  onSearch() {
    // Reset to first page when searching
    this.paginationConfig.page = 1;
    this.loadItems();
  }

  loadItems() {
    const filters = this.searchTerm ? { search: this.searchTerm } : {};
    
    this.myService.getItems(
      this.paginationConfig.page,
      this.paginationConfig.limit,
      filters
    ).subscribe(response => {
      this.items = response.items;
      this.paginationConfig = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        pages: response.pages
      };
    });
  }
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When contributing to this component:

1. Maintain TypeScript strict mode compatibility
2. Follow Angular coding style guidelines
3. Ensure responsive design works on all screen sizes
4. Test accessibility with screen readers
5. Update this README with any new features