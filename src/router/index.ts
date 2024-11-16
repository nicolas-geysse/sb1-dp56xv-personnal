import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import DocumentList from '../components/document/DocumentList.vue'

const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'documents',
                component: DocumentList
            }
        ]
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})