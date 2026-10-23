import type {
  Category,
  CategoryChanges,
  NewCategory,
  NewSubcategory,
  Subcategory,
  SubcategoryChanges,
} from '../domain/category'

export interface CategoryRepository {
  listCategories: () => Promise<Category[]>
  createCategory: (input: NewCategory) => Promise<Category>
  updateCategory: (id: string, changes: CategoryChanges) => Promise<void>
  createSubcategory: (input: NewSubcategory) => Promise<Subcategory>
  updateSubcategory: (id: string, changes: SubcategoryChanges) => Promise<void>
}
