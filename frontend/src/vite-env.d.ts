/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API: string
  readonly VITE_EMPLOYEE_API: string
  readonly VITE_PURCHASE_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
