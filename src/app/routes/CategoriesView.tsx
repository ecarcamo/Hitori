import { getRouteApi } from '@tanstack/react-router'
import { CategoriesPage } from '@/features/categories'

const categoriesRoute = getRouteApi('/authenticated/shell/settings/categories')

export function CategoriesView() {
  const { categories } = categoriesRoute.useRouteContext()
  return <CategoriesPage repository={categories} />
}
