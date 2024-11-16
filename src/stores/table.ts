import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { TableColumn, FileSystemItem } from '@/types/document'

export const useTableStore = defineStore('table', () => {
    const columns = computed<TableColumn[]>(() => [
        {
            name: 'name',
            required: true,
            label: 'Nom',
            align: 'left',
            field: 'name',
            sortable: true,
            style: 'width: 25%'
        },
        {
            name: 'active',
            required: true,
            label: 'Activation',
            align: 'center',
            field: (row: FileSystemItem) => row.type === 'document' ? row.active : null,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'createdAt',
            required: true,
            label: 'Date de création',
            align: 'center',
            field: 'createdAt',
            sortable: true,
            style: 'width: 12%'
        },
        {
            name: 'size',
            required: true,
            label: 'Taille',
            align: 'right',
            field: (row: FileSystemItem) => 
                row.type === 'document' ? row.size : row.statistics.totalSize,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'pages',
            required: true,
            label: 'Pages',
            align: 'right',
            field: (row: FileSystemItem) => 
                row.type === 'document' ? row.pages : row.statistics.totalPages,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'tokens',
            required: true,
            label: 'Tokens',
            align: 'right',
            field: (row: FileSystemItem) => 
                row.type === 'document' ? row.tokens : row.statistics.totalTokens,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'indexed',
            required: true,
            label: 'Indexation',
            align: 'center',
            field: (row: FileSystemItem) => 
                row.type === 'document' ? row.indexed : null,
            sortable: true,
            style: 'width: 12%'
        },
        {
            name: 'actions',
            required: true,
            label: 'Actions',
            align: 'center',
            field: 'actions',
            sortable: false,
            style: 'width: 11%'
        }
    ])

    return {
        columns
    }
})