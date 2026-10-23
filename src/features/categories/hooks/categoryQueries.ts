import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type {
  Category,
  CategoryChanges,
  NewCategory,
  NewSubcategory,
  SubcategoryChanges,
} from '../domain/category'
import { bySortOrder } from '@/shared/lib/sortOrder'
import type { CategoryRepository } from '../repositories/categoryRepository'

const CATEGORIES_KEY = ['categories'] as const

export function categoriesQueryOptions(repository: CategoryRepository) {
  return queryOptions({
    queryKey: CATEGORIES_KEY,
    queryFn: () => repository.listCategories(),
    select: (categories: Category[]) => [...categories].sort(bySortOrder),
  })
}

export function useCategories(repository: CategoryRepository) {
  return useQuery(categoriesQueryOptions(repository))
}

function patchCategories(queryClient: QueryClient, update: (categories: Category[]) => Category[]) {
  const previous = queryClient.getQueryData<Category[]>(CATEGORIES_KEY)
  if (previous) {
    queryClient.setQueryData<Category[]>(CATEGORIES_KEY, update(previous))
  }
  return previous
}

function useOptimisticCategoryMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  applyOptimistic: (categories: Category[], variables: TVariables) => Category[],
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY })
      return {
        previous: patchCategories(queryClient, (categories) =>
          applyOptimistic(categories, variables),
        ),
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_KEY, context.previous)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}

interface UpdateCategoryVariables {
  id: string
  changes: CategoryChanges
}

interface UpdateSubcategoryVariables {
  id: string
  categoryId: string
  changes: SubcategoryChanges
}

export function useCategoryMutations(repository: CategoryRepository) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })

  const createCategory = useMutation({
    mutationFn: (input: NewCategory) => repository.createCategory(input),
    onSuccess: invalidate,
  })

  const updateCategory = useOptimisticCategoryMutation(
    ({ id, changes }: UpdateCategoryVariables) => repository.updateCategory(id, changes),
    (categories, { id, changes }) =>
      categories.map((category) => (category.id === id ? { ...category, ...changes } : category)),
  )

  const createSubcategory = useMutation({
    mutationFn: (input: NewSubcategory) => repository.createSubcategory(input),
    onSuccess: invalidate,
  })

  const updateSubcategory = useOptimisticCategoryMutation(
    ({ id, changes }: UpdateSubcategoryVariables) => repository.updateSubcategory(id, changes),
    (categories, { id, categoryId, changes }) =>
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: category.subcategories.map((subcategory) =>
                subcategory.id === id ? { ...subcategory, ...changes } : subcategory,
              ),
            }
          : category,
      ),
  )

  return { createCategory, updateCategory, createSubcategory, updateSubcategory }
}

export type CategoryMutations = ReturnType<typeof useCategoryMutations>
