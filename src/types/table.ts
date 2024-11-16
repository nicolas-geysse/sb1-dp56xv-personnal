export type TableStatus = 'Actif' | 'En attente' | 'Inactif'

export interface TableRow {
  id: number
  name: string
  status: TableStatus
  date: string
}

export interface TableColumn {
  name: string
  required?: boolean
  label: string
  align: 'left' | 'right' | 'center'
  field: string | ((row: TableRow) => any)
  sortable?: boolean
  style?: string
}