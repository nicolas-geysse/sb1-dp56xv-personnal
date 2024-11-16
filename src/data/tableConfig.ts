import { TableColumn, TableRow } from '@/types/table'

export const columns: TableColumn[] = [
  {
    name: 'id',
    required: true,
    label: 'ID',
    align: 'left',
    field: 'id',
    sortable: true
  },
  {
    name: 'name',
    required: true,
    label: 'Nom',
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'status',
    required: true,
    label: 'Statut',
    align: 'left',
    field: 'status',
    sortable: true
  },
  {
    name: 'date',
    required: true,
    label: 'Date',
    align: 'left',
    field: 'date',
    sortable: true
  }
]

export const rows: TableRow[] = [
  {
    id: 1,
    name: 'Élément 1',
    status: 'Actif',
    date: '2024-03-14'
  },
  {
    id: 2,
    name: 'Élément 2',
    status: 'Inactif',
    date: '2024-03-13'
  },
  {
    id: 3,
    name: 'Élément 3',
    status: 'En attente',
    date: '2024-03-12'
  }
]