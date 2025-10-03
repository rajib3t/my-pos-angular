import { CommonModule } from '@angular/common';
import { Component, OnInit  , signal, effect, inject  } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IMaterialCategory, MaterialService } from '@/app/services/material.service';


@Component({
  selector: 'app-material-category-edit',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './material-category-edit.html',
  styleUrl: './material-category-edit.css'
})
export class MaterialCategoryEdit  implements OnInit {



  categoryId  = signal<string | null>(null);
  storeId  = signal<string | null>(null);
  materialCategory  = signal<IMaterialCategory | null>(null);
    isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  readonly router = inject(Router);
  constructor(
    private activatedRoute: ActivatedRoute,
    private materialService: MaterialService
  ) { 
    this.setUpEffect();
  }


  setUpEffect(): void {
    effect(() => {
    this.activatedRoute.paramMap.subscribe(params => {
      const categoryId = params.get('categoryId');
      if (categoryId) {
        this.categoryId.set(categoryId);
        this.loadMaterialCategory(categoryId);
      } else {
        this.categoryId.set(null);
        this.materialCategory.set(null);
      }
    });
  }, { allowSignalWrites: true });
  }

  private loadMaterialCategory(categoryId: string): void {
    // Simulate an API call to fetch the material category by ID
    // Replace this with actual API call logic
    // For demonstration, we'll just create a mock category
    const mockCategory: IMaterialCategory = {
      _id: categoryId,
      name: 'Sample Category',
      code: 'SC123',
      createdBy: { id: 'user1', name: 'Admin' }
    };
    this.materialCategory.set(mockCategory);
  }

  ngOnInit(): void {
    // Initialization logic here
  }

}
