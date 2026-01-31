## Implement Update and Delete CRUD for MateriaPrima

### Backend (Django)
1. **ViewSet Update Logic**: Override `update` and `partial_update` in `MateriaPrimaViewSet` to handle nested `variantes`.
    - Implement a syncing mechanism:
        - Update existing variants.
        - Create new variants.
        - Delete variants that are not present in the request data.
2. **ViewSet Delete Logic**: Ensure `destroy` in `MateriaPrimaViewSet` handles deletions correctly (cascade is handled by DB, but check if custom logic is needed for notifications).

### Frontend (React)
1. **API Integration**:
    - Verify `handleCreateUpdateMateriaPrima` in `api.ts` correctly sends `PUT`/`PATCH` requests with the ID.
    - Verify `handleDeleteMateriaPrima` in `api.ts` correctly sends `DELETE` requests.
2. **Mutation Hooks**:
    - Refine `useCreateUpdateMateriaPrimaMutation` to handle the `id` argument for updates.
    - Ensure cache invalidation for both the list and details query.
3. **Components & UI**:
    - **Form Update**: Update `MateriaPrimaCreateForm` to pass the `materiaprimaId` to the mutation when `updateRegistro` is true.
    - **Delete Confirmation**: Create a `ConfirmDeleteModal` component for MateriaPrima.
    - **Details Panel**: Add a "Delete" button next to "Edit" in `MateriaPrimaDetailsPanel`.
    - **Table Actions**: (Optional) Add a dropdown menu in `Tablerow` for quick Edit/Delete actions.
4. Make sure that create form has accurate data in each form field when updateRegistro is true, for example, if the materia prima has 3 variants, the form should have 3 variants, and if the materia prima has 2 variants, the form should have 2 variants with the correct data in each field. Also, make sure that the form is reset after the update is successful.