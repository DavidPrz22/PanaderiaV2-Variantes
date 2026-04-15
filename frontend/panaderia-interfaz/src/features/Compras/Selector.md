Implement a product component selector for purchase orders table

Create a component that allows to search and select products for purchase orders table

UI Features:
 - The component works as a popover that shows the name of the product if its selected.
 - When the popover is open, it shows a list of products that can be selected.
 - The popover has a search input for filtering the products where the endpoint is already created and it is called ```/api/inventario/productos-compras/```.
 - The list is grouped by variants, where the main product name is at the top.

 - Check the implementation of a similar component at 
    ```\\wsl.localhost\Ubuntu\home\davidprz\projects\PanaderiaSystemV2\frontend\panaderia-interfaz\src\features\Recetas\components\RecetasProductoSelector.tsx```

Functionality:
 - The component is used in the purchase orders row table, where it is used to select products for purchase orders.
 - When the user selects a product, the component should update the purchase order line with the selected product.
 - The component should update the purchase order line with the selected product.

the component should be used in the component ``` \\wsl.localhost\Ubuntu\home\davidprz\projects\PanaderiaSystemV2\frontend\panaderia-interfaz\src\features\Compras\components\ComprasLineaRow.tsx``` 

Move the logic of selecting a product within ComprasLineaRow to the new component.
