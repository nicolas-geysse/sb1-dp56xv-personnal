/**
 * Interface représentant un document dans le système de gestion documentaire.
 * Contient toutes les métadonnées et l'état d'un document.
 */
export interface Document {
    /** Identifiant unique du document */
    id: string
    /** Nom du document avec son extension */
    name: string
    /** État d'activation du document */
    active: boolean
    /** Date de création au format ISO */
    createdAt: string
    /** Taille du document en Mo */
    size: number
    /** Nombre de pages du document */
    pages: number
    /** Nombre de tokens dans le document */
    tokens: number
    /** Indique si le document a été indexé */
    indexed: boolean
    /** Temps d'exécution de l'indexation en secondes */
    indexationTime?: number
    /** ID du dossier parent */
    parentId: string | null
    /** Type de l'élément */
    type: 'document'
}

/**
 * Interface représentant un dossier dans le système.
 */
export interface Folder {
    /** Identifiant unique du dossier */
    id: string
    /** Nom du dossier */
    name: string
    /** Date de création au format ISO */
    createdAt: string
    /** ID du dossier parent */
    parentId: string | null
    /** Type de l'élément */
    type: 'folder'
    /** Statistiques du dossier */
    statistics: FolderStatistics
    /** Sous-dossiers et documents */
    children?: FileSystemItem[]
}

/**
 * Statistiques cumulatives d'un dossier
 */
export interface FolderStatistics {
    /** Taille totale en Mo */
    totalSize: number
    /** Nombre total de pages */
    totalPages: number
    /** Nombre total de tokens */
    totalTokens: number
    /** Nombre de documents indexés */
    indexedCount: number
    /** Nombre total de documents */
    totalCount: number
}

/**
 * Type union pour les éléments du système de fichiers
 */
export type FileSystemItem = Document | Folder

/**
 * Configuration d'une colonne de la table de documents.
 * Définit la structure et le comportement d'une colonne.
 */
export interface TableColumn {
    /** Identifiant unique de la colonne */
    name: string
    /** Indique si la colonne est requise */
    required?: boolean
    /** Libellé affiché dans l'en-tête */
    label: string
    /** Alignement du contenu */
    align: 'left' | 'right' | 'center'
    /** Champ ou fonction pour obtenir la valeur */
    field: string | ((row: FileSystemItem) => any)
    /** Indique si la colonne est triable */
    sortable?: boolean
    /** Style CSS inline */
    style?: string
}

/**
 * Résultat d'une opération d'indexation.
 * Contient les informations sur le succès et les métriques de l'indexation.
 */
export interface IndexationResult {
    /** Indique si l'indexation a réussi */
    success: boolean
    /** Temps d'exécution en secondes */
    executionTime: number
    /** Nombre de pages détectées */
    pages?: number
    /** Nombre de tokens extraits */
    tokens?: number
    /** Taille du document indexé */
    size?: number
}

/**
 * Métadonnées d'un document.
 * Contient les informations statistiques sur le document.
 */
export interface DocumentMetadata {
    /** Nombre de pages */
    pages: number
    /** Nombre de tokens */
    tokens: number
    /** Taille en Mo */
    size: number
}