const LEGACY_PATHS: Readonly<Record<string, string>> = {
  '/entrar': '/sign-in',
  '/bienvenida': '/welcome',
  '/ahora': '/now',
  '/tablero': '/board',
  '/matriz': '/matrix',
  '/semana': '/week',
  '/bandeja': '/inbox',
  '/ajustes': '/settings',
  '/ajustes/cuenta': '/settings/account',
  '/ajustes/categorias': '/settings/categories',
  '/ajustes/apariencia': '/settings/appearance',
}

export function currentPathFor(legacyPathname: string) {
  const withoutTrailingSlash =
    legacyPathname.length > 1 ? legacyPathname.replace(/\/+$/, '') : legacyPathname
  return LEGACY_PATHS[withoutTrailingSlash] ?? null
}
