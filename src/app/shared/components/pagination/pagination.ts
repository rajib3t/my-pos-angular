import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationConfig {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginationChange {
  page: number;
  limit: number;
}

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() config!: PaginationConfig;
  @Input() showSizeSelector: boolean = true;
  @Input() sizeOptions: number[] = [5, 10, 25, 50, 100];
  @Input() maxVisiblePages: number = 5;
  
  @Output() pageChange = new EventEmitter<PaginationChange>();
  
  visiblePages: number[] = [];
  
  ngOnInit() {
    this.calculateVisiblePages();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.calculateVisiblePages();
    }
  }
  
  calculateVisiblePages() {
    if (!this.config) return;
    
    const { page, pages } = this.config;
    const delta = Math.floor(this.maxVisiblePages / 2);
    const rangeStart = Math.max(1, page - delta);
    const rangeEnd = Math.min(pages, rangeStart + this.maxVisiblePages - 1);
    
    this.visiblePages = [];
    for (let i = rangeStart; i <= rangeEnd; i++) {
      this.visiblePages.push(i);
    }
  }
  
  onPageChange(page: number) {
    if (page >= 1 && page <= this.config.pages && page !== this.config.page) {
      this.pageChange.emit({
        page: page,
        limit: this.config.limit
      });
    }
  }
  
  onSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value, 10);
    
    this.pageChange.emit({
      page: 1, // Reset to first page when changing size
      limit: newLimit
    });
  }
  
  getStartItem(): number {
    return (this.config.page - 1) * this.config.limit + 1;
  }
  
  getEndItem(): number {
    return Math.min(this.config.page * this.config.limit, this.config.total);
  }
}