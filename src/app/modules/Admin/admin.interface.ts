export type IAdminFilterRequest = {
    name?: string | undefined,
    email?: string | undefined,
    contactNumber?: string | undefined,
    searchTerm?: string | undefined
}
export type IAdminOptions = {
    page?: number,
    limit?: number,
    sortBy?: string | undefined,
    sortOrder?: string | undefined
}