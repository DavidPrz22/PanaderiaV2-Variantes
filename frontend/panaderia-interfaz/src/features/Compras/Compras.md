Nuevos conceptos a tener en cuenta

* Los articulos no tienen informacion de unidad de compra o contenedores de compra, solo guardan informacion de la unidad de medida de manejor interno.
* La unidad o medidad de contenedores se definen en el modulo de compras.
* Se realizan conversiones de unidades de compra a las unidades de medida internas del producto.
* Se agregan nuevos modelos para registrar los empaques usados en la compra.

  Empaques:
  - id
  - Nombre del empaque
  - Es_contenedor (Boolean - para saber si dentro trae unidades o es una sola pieza)

  Empaquetado_productos:
  - id
  - id_producto
  - id_empaque
  - cantidad_por_contenedor // default 1 si no es un empaque contenedor con unidades anidadas
  - unidad_medida
  - cantidad_unidad_medida

  Contraints:
  - Si el empaque no es contenedor, la cantidad_por_contenedor debe ser 1
  - Si el empaque es contenedor, la cantidad_por_contenedor debe ser diferente a 1

La interfaz de compras contará con las siguientes secciones:

- Campos para metadata ya presentes en la plantilla

- Una seccion para agregar productos a la compra
- Botton para agregar los productos a la tabla
- Tabla de productos con las siguientes columnas:

  - Nombre del producto
  - Field Variante para cantidad de unidades en la compra
    * Una compra se puede hacer por unidades, peso o volumen: El producto se registra por kg, g, l, ml, unidades
    * Una compra se puede hacer por Lotes o contenedores: El producto se registra por lotes o contenedores que guardan las cantidades del producto en cuestion, vea se un galon que contiene 3000 ml de aceite, se puede comprar por galon pero luego se registra en inventario como 3000 ml de aceite.
    * Una compra se puede hacer por contenedores anidados, puedes tener una caja que contiene 10 botella de leche, y cada botella contiene 1000 ml de leche, entonces puedes comprar por caja, botella o ml.

    La opciones son: 
    Como compraste el producto?
    - Por unidades de medida 
    - Por contenedores
  - Unidad de medida o contenedor de la compra
    * Si es por unidades de medida, se muestra opciones de unidades de medida (kg, g, l, ml, unidades)
      -- Si la unidad de medida base del producto es en peso, se muestra opciones de unidades de medida en peso (kg, g)
      -- Si la unidad de medida base del producto es en volumen, se muestra opciones de unidades de medida en volumen (l, ml)
      -- Si la unidad de medida base del producto es en unidades, se muestra opciones de unidades de medida en unidades (unidades)
    * Si es por contenedores, se muestra opciones de contenedores (caja, botella, galon, etc) registradas en el sistema
      -- Si unidad de medida base del producto es en peso, se muestra opciones de contenedores que tengan unidad de medida en peso
      -- Si unidad de medida base del producto es en volumen, se muestra opciones de contenedores que tengan unidad de medida en volumen
      -- Si unidad de medida base del producto es en unidades, se muestra opciones de contenedores que tengan unidad de medida en unidades
  - Cantidad de la unidad o contenedor de la compra
  - Precio unitario
  - Subtotal
  - Acciones (eliminar)
