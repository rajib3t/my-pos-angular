import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent, PaginationConfig, PaginationChange } from './pagination';

// Example interface for any paginated data
interface ExampleItem {
  id: string;
  name: string;
  description: string;
}

// Example API response structure
interface ExamplePaginatedResponse {
  items: ExampleItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Component({
  selector: 'app-pagination-example',
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="container mx-auto p-6">
      <h2 class="text-2xl font-bold mb-4">Pagination Example</h2>
      
      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let item of items" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.description }}
              </td>
            </tr>
            
            <!-- Loading state -->
            <tr *ngIf="loading">
              <td colspan="3" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="ml-2">Loading...</span>
                </div>
              </td>
            </tr>
            
            <!-- Empty state -->
            <tr *ngIf="!loading && items.length === 0">
              <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                No items found
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination Component -->
        <app-pagination 
          [config]="paginationConfig"
          [showSizeSelector]="true"
          [sizeOptions]="[10, 25, 50, 100]"
          [maxVisiblePages]="7"
          (pageChange)="onPaginationChange($event)">
        </app-pagination>
      </div>
    </div>
  `
})
export class PaginationExampleComponent implements OnInit {
  items: ExampleItem[] = [];
  loading = false;
  
  paginationConfig: PaginationConfig = {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  };

  constructor() {}

  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * Load items from API with current pagination settings
   * This is where you would make your actual API call
   */
  loadItems(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      // Mock API response
      const mockResponse: ExamplePaginatedResponse = {
        items: this.generateMockItems(),
        total: 150, // Total number of items
        page: this.paginationConfig.page,
        limit: this.paginationConfig.limit,
        pages: Math.ceil(150 / this.paginationConfig.limit)
      };
      
      // Update component state
      this.items = mockResponse.items;
      this.paginationConfig = {
        total: mockResponse.total,
        page: mockResponse.page,
        limit: mockResponse.limit,
        pages: mockResponse.pages
      };
      
      this.loading = false;
    }, 1000);
  }

  /**
   * Handle pagination change events
   * This method is called when user clicks page numbers or changes page size
   */
  onPaginationChange(change: PaginationChange): void {
    // Update pagination config
    this.paginationConfig.page = change.page;
    this.paginationConfig.limit = change.limit;
    
    // Reload data with new pagination settings
    this.loadItems();
  }

  /**
   * Generate mock data for demonstration
   */
  private generateMockItems(): ExampleItem[] {
    const startIndex = (this.paginationConfig.page - 1) * this.paginationConfig.limit;
    const items: ExampleItem[] = [];
    
    for (let i = 0; i < this.paginationConfig.limit; i++) {
      const index = startIndex + i + 1;
      items.push({
        id: `item-${index}`,
        name: `Item ${index}`,
        description: `Description for item ${index}`
      });
    }
    
    return items;
  }
}

/*
USAGE INSTRUCTIONS:

1. Import the pagination component in your module or component:
   import { PaginationComponent, PaginationConfig, PaginationChange } from 'path/to/pagination';

2. Add PaginationComponent to your component imports array

3. Set up your component with:
   - items array (your data)
   - paginationConfig object
   - loading state boolean

4. Implement onPaginationChange method to handle page/size changes

5. In your template, use:
   <app-pagination 
     [config]="paginationConfig"
     [showSizeSelector]="true"
     [sizeOptions]="[5, 10, 25, 50]"
     [maxVisiblePages]="5"
     (pageChange)="onPaginationChange($event)">
   </app-pagination>

REAL API INTEGRATION:

Replace the mock loadItems() method with actual HTTP calls:

loadItems(): void {
  this.loading = true;
  
  this.yourService.getItems(this.paginationConfig.page, this.paginationConfig.limit)
    .subscribe({
      next: (response) => {
        this.items = response.items;
        this.paginationConfig = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          pages: response.pages
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.loading = false;
      }
    });
}
*/