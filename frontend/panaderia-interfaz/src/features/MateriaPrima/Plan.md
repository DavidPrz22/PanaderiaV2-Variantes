Refactor the Materia Prima feature to use the new components and adapt the feature to the new model

- Update the materias Prima Page to use new components

1. Replace the current use of the materia prima form with the new form component called MateriaPrimaCreateForm
2. Make a /new route for the new form component called MateriaPrimaCreateForm
3. Cover the use case of updating a materia prima with the new form component called MateriaPrimaCreateForm, cover both the update and the create case
4. Replace the current use of the materia prima details panel with the new details panel component called MateriaPrimaDetailsPanel
5. Replace the current use of the materia prima lot table within the materia prima details panel with the new lot table component called LotesTableMP
6. Utilize the current data available by the api and react query to populate the new components
7. Check and types and schema available in the types folder to ensure the new components are using the correct types
8. Get rid of mock data from the new components
9. Create types to cover the new models and structure for the forms

- Success Criteria:

1. The materias primas page should be updated to use the new components
2. The materia prima form should be updated to use the new form component
3. The materia prima details panel should be updated to use the new details panel component
4. The materia prima lot table should be updated to use the new lot table component
5. The new components should be populated with the current data available by the api and react query
6. The new components should not use mock data

- Don'ts:

1. Don't modify the current data available by the api and react query


Use SKILLS available in the SKILLS folder to properly implement the feature