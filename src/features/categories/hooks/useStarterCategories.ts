import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateNKeysBetween } from 'fractional-indexing'
import { STARTER_CATEGORIES } from '../domain/categoryRules'
import type { CategoryRepository } from '../repositories/categoryRepository'
import { categoriesQueryOptions } from './categoryQueries'

export function useStarterCategories(repository: CategoryRepository) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const categoryKeys = generateNKeysBetween(null, null, STARTER_CATEGORIES.length)
      for (const [index, starter] of STARTER_CATEGORIES.entries()) {
        const category = await repository.createCategory({
          name: starter.name,
          tone: starter.tone,
          sortOrder: categoryKeys[index] ?? String(index),
        })
        if (starter.importantByDefault) {
          await repository.updateCategory(category.id, { importantByDefault: true })
        }
        const subcategoryKeys = generateNKeysBetween(null, null, starter.subcategories.length)
        for (const [subIndex, name] of starter.subcategories.entries()) {
          await repository.createSubcategory({
            categoryId: category.id,
            name,
            sortOrder: subcategoryKeys[subIndex] ?? String(subIndex),
          })
        }
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: categoriesQueryOptions(repository).queryKey }),
  })
}
