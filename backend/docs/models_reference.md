# PanaderiaSystemV2 - Database Models Reference

## Users App

### User
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| username | CharField(64) | unique |
| email | EmailField | unique |
| full_name | CharField(255) | required |
| rol | CharField(20) | choices: Gerente, Vendedor, Admin |
| is_staff | BooleanField | default=False |
| is_superuser | BooleanField | default=False |
| is_active | BooleanField | default=True |
| date_joined | DateTimeField | default=now |

---

## Core App

### UnidadesDeMedida
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_completo | CharField(50) | unique |
| abreviatura | CharField(10) | |
| descripcion | TextField(255) | nullable |
| tipo_medida | CharField(10) | choices: peso, volumen, unidad, longitud, otro |

### CategoriasMateriaPrima
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_categoria | CharField(100) | |
| descripcion | TextField(255) | nullable |

### CategoriasProductosElaborados
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_categoria | CharField(100) | |
| descripcion | TextField(255) | nullable |
| es_intermediario | BooleanField | default=False |

### CategoriasProductosReventa
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_categoria | CharField(100) | |
| descripcion | TextField(255) | nullable |

### MetodosDePago
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_metodo | CharField(100) | |
| requiere_referencia | BooleanField | default=False |

### EstadosOrdenVenta
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_estado | CharField(100) | |
| descripcion | TextField(255) | nullable |

### EstadosOrdenCompra
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_estado | CharField(100) | |
| descripcion | TextField(255) | nullable |

### ConversionesUnidades
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| unidad_origen | FK -> UnidadesDeMedida | |
| unidad_destino | FK -> UnidadesDeMedida | |
| factor_conversion | DecimalField(15,6) | unique_together(origen, destino) |

### Empaques
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_empaque | CharField(100) | |
| es_contenedor | BooleanField | default=False |
| tipo_medida | CharField(10) | choices: peso, volumen, unidad, longitud, otro |

### EmpaquetadoProductos
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| empaque | FK -> Empaques | |
| cantidad_por_contenedor | DecimalField(10,2) | default=1 |
| unidad_medida | FK -> UnidadesDeMedida | |
| cantidad_unidad_medida | DecimalField(10,2) | default=1 |

### Grupos
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_grupo | CharField(100) | |
| descripcion | TextField(255) | nullable |
| cantidad | DecimalField(10,2) | default=0 |
| unidad | FK -> UnidadesDeMedida | |

### Notificaciones
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| tipo_notificacion | CharField(50) | choices: Bajo stock, Sin stock, Expiracion, Entrega cercana |
| tipo_producto | CharField(50) | choices: Materia prima, Productos finales, Productos intermedios, Productos reventa, Ordenes venta |
| producto_id | IntegerField | nullable |
| variante_id | IntegerField | nullable |
| descripcion | TextField(255) | nullable |
| fecha_notificacion | DateTimeField | auto_now_add |
| leida | BooleanField | default=False |
| prioridad | CharField(50) | choices: Bajo, Medio, Alto, Critico |

---

## Inventario App

### MateriasPrimas
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre | CharField(100) | unique |
| unidad_medida_base | FK -> UnidadesDeMedida | |
| stock_actual | DecimalField(20,4) | default=0 |
| SKU | CharField(100) | unique, nullable |
| punto_reorden | DecimalField(20,4) | default=0 |
| categoria | FK -> CategoriasMateriaPrima | |
| descripcion | TextField(255) | nullable |
| fecha_creacion_registro | DateField | auto_now_add |

### MateriasPrimasVariantes
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| materia_prima | FK -> MateriasPrimas | |
| nombre_variante | CharField(100) | |
| unidad_compra | FK -> UnidadesDeMedida | |
| SKU_variante | CharField(100) | unique, nullable |
| precio_compra_divisa | DecimalField(20,4) | default=0 |
| precio_compra_local | DecimalField(20,4) | default=0 |
| nombre_empaque_estandar | CharField(100) | nullable |
| cantidad_empaque_estandar | DecimalField(20,4) | nullable |
| unidad_medida_empaque_estandar | FK -> UnidadesDeMedida | nullable |

### LotesMateriasPrimas
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| variante_materia_prima | FK -> MateriasPrimasVariantes | nullable |
| proveedor | FK -> Proveedores | nullable |
| fecha_recepcion | DateField | |
| fecha_caducidad | DateField | |
| cantidad_recibida | DecimalField(10,4) | default=0 |
| stock_actual_lote | DecimalField(10,4) | default=0 |
| costo_unitario_divisa | DecimalField(10,4) | default=0 |
| costo_unitario_local | DecimalField(10,4) | default=0 |
| detalle_oc | FK -> DetalleOrdenesCompra | nullable |
| estado | CharField(10) | choices: DISPONIBLE, EXPIRADO, AGOTADO, INACTIVO |
| activo | BooleanField | default=True |

### ProductosElaborados
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_producto | CharField(100) | unique |
| descripcion | TextField(255) | nullable |
| unidad_produccion | FK -> UnidadesDeMedida | nullable |
| unidad_venta | FK -> UnidadesDeMedida | nullable |
| categoria | FK -> CategoriasProductosElaborados | |
| fecha_creacion_registro | DateField | auto_now_add |
| vendible_por_medida_real | BooleanField | nullable |
| tipo_medida_fisica | CharField(10) | choices: UNIDAD, PESO, VOLUMEN |
| es_intermediario | BooleanField | default=False |
| usado_en_transformaciones | BooleanField | default=False |
| stock_actual | DecimalField(15,2) | default=0 |

### ProductosElaboradosVariantes
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| producto_elaborado | FK -> ProductosElaborados | |
| nombre_variante | CharField(100) | unique_together with producto_elaborado |
| precio_venta_divisa | DecimalField(20,2) | nullable |
| precio_venta_local | DecimalField(20,2) | nullable |
| costo_divisa | DecimalField(20,2) | nullable |
| costo_local | DecimalField(20,2) | nullable |
| SKU | CharField(50) | unique, nullable |
| descripcion | TextField(255) | nullable |
| stock_actual | DecimalField(10,2) | default=0 |
| punto_reorden | DecimalField(10,2) | default=0 |
| atributo | CharField(100) | choices: Cantidad, Tamano, Sabor, Color |
| is_vendible | BooleanField | default=True |
| fecha_creacion | DateField | auto_now_add |

### ProductosReventa
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_producto | CharField(100) | unique |
| descripcion | TextField(255) | nullable |
| categoria | FK -> CategoriasProductosReventa | |
| marca | CharField(100) | nullable |
| proveedor_preferido | FK -> Proveedores | nullable |
| stock_actual | DecimalField(10,2) | default=0 |
| unidad_medida_base | FK -> UnidadesDeMedida | nullable |
| unidad_venta | FK -> UnidadesDeMedida | nullable |
| factor_conversion | DecimalField(10,4) | default=1 |
| es_perecedero | BooleanField | default=False |
| fecha_creacion_registro | DateField | auto_now_add |

### ProductosReventaVariantes
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| producto_reventa | FK -> ProductosReventa | |
| nombre_variante | CharField(100) | unique_together with producto_reventa |
| precio_venta_divisa | DecimalField(20,2) | nullable |
| precio_venta_local | DecimalField(20,2) | nullable |
| costo_divisa | DecimalField(20,2) | nullable |
| costo_local | DecimalField(20,2) | nullable |
| SKU | CharField(50) | unique, nullable |
| descripcion | TextField(255) | nullable |
| stock_actual | DecimalField(10,2) | default=0 |
| punto_reorden | DecimalField(10,2) | default=0 |
| atributo | CharField(100) | choices: Cantidad, Tamano, Sabor, Color |
| is_vendible | BooleanField | default=True |
| fecha_creacion | DateField | auto_now_add |
| fecha_modificacion | DateField | auto_now |

### LotesProductosElaborados
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| produccion_origen | FK -> Produccion | |
| producto_elaborado_variante | FK -> ProductosElaboradosVariantes | |
| cantidad_inicial_lote | DecimalField(10,2) | default=0 |
| stock_actual_lote | DecimalField(10,2) | default=0 |
| fecha_produccion | DateField | auto_now_add |
| fecha_caducidad | DateField | |
| estado | CharField(10) | choices: DISPONIBLE, EXPIRADO, AGOTADO, INACTIVO |
| coste_total_lote_divisa | DecimalField(10,2) | default=0 |
| coste_total_lote_local | DecimalField(10,2) | default=0 |
| peso_total_lote_gramos | DecimalField(10,2) | nullable |
| volumen_total_lote_ml | DecimalField(10,2) | nullable |

### LotesProductosReventa
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| producto_reventa_variante | FK -> ProductosReventaVariantes | |
| fecha_recepcion | DateField | |
| fecha_caducidad | DateField | nullable |
| cantidad_recibida | DecimalField(10,2) | default=0 |
| stock_actual_lote | DecimalField(10,2) | default=0 |
| coste_unitario_lote_divisa | DecimalField(10,2) | default=0 |
| coste_unitario_lote_local | DecimalField(10,2) | default=0 |
| detalle_oc | FK -> DetalleOrdenesCompra | nullable |
| proveedor | FK -> Proveedores | nullable |
| estado | CharField(10) | choices: DISPONIBLE, EXPIRADO, AGOTADO, INACTIVO |

### GruposProductosElaborados
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| producto_elaborado_variante | FK -> ProductosElaboradosVariantes | |
| cantidad | DecimalField(10,2) | default=1 |
| grupo | FK -> Grupos | |
| descripcion | TextField(255) | nullable |

### GruposProductosReventa
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| producto_reventa_variante | FK -> ProductosReventaVariantes | |
| grupo | FK -> Grupos | |
| cantidad | DecimalField(10,2) | default=0 |
| fecha_creacion | DateField | auto_now_add |
| fecha_modificacion | DateField | auto_now |
| descripcion | TextField(255) | nullable |

---

## Ventas App

### Clientes
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_cliente | CharField(100) | |
| apellido_cliente | CharField(100) | |
| telefono | CharField(100) | nullable |
| email | CharField(100) | nullable |
| rif_cedula | CharField(100) | nullable |
| fecha_registro | DateField | auto_now_add |
| notas | TextField(255) | nullable |

### AperturaCierreCaja
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| usuario_apertura | FK -> User | |
| monto_inicial_usd | DecimalField(10,2) | |
| monto_inicial_ves | DecimalField(10,2) | |
| fecha_apertura | DateTimeField | auto_now_add |
| fecha_cierre | DateTimeField | nullable |
| usuario_cierre | FK -> User | nullable |
| monto_final_usd | DecimalField(10,2) | nullable |
| monto_final_ves | DecimalField(10,2) | nullable |
| total_efectivo_usd | DecimalField(10,2) | default=0 |
| total_efectivo_ves | DecimalField(10,2) | default=0 |
| total_tarjeta_usd | DecimalField(10,2) | default=0 |
| total_tarjeta_ves | DecimalField(10,2) | default=0 |
| total_transferencia_usd | DecimalField(10,2) | default=0 |
| total_transferencia_ves | DecimalField(10,2) | default=0 |
| total_pago_movil_usd | DecimalField(10,2) | default=0 |
| total_pago_movil_ves | DecimalField(10,2) | default=0 |
| total_cambio_efectivo_usd | DecimalField(10,2) | default=0 |
| total_cambio_efectivo_ves | DecimalField(10,2) | default=0 |
| total_cambio_pago_movil_usd | DecimalField(10,2) | default=0 |
| total_cambio_pago_movil_ves | DecimalField(10,2) | default=0 |
| total_ventas_usd | DecimalField(10,2) | default=0 |
| total_ventas_ves | DecimalField(10,2) | default=0 |
| diferencia_usd | DecimalField(10,2) | default=0 |
| diferencia_ves | DecimalField(10,2) | default=0 |
| notas_apertura | TextField | nullable |
| notas_cierre | TextField | nullable |
| esta_activa | BooleanField | default=True |

### Ventas
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| cliente | FK -> Clientes | |
| usuario_cajero | FK -> User | |
| fecha_venta | DateField | |
| monto_total_usd | DecimalField(10,2) | |
| monto_total_ves | DecimalField(10,2) | |
| tasa_cambio_aplicada | DecimalField(10,2) | |
| notas | TextField(255) | nullable |
| apertura_caja | FK -> AperturaCierreCaja | nullable |

### DetalleVenta
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| venta | FK -> Ventas | related_name='detalles' |
| producto_elaborado | FK -> ProductosElaboradosVariantes | nullable, mutually exclusive with producto_reventa |
| producto_reventa | FK -> ProductosReventaVariantes | nullable, mutually exclusive with producto_elaborado |
| unidad_medida_venta | FK -> UnidadesDeMedida | |
| cantidad_vendida | DecimalField(10,2) | |
| precio_unitario_usd | DecimalField(10,2) | default=0 |
| precio_unitario_ves | DecimalField(10,2) | default=0 |
| subtotal_linea_usd | DecimalField(10,2) | default=0 |
| subtotal_linea_ves | DecimalField(10,2) | default=0 |

### VentasLotesVendidos
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| detalle_venta_asociada | FK -> DetalleVenta | related_name='lotes_vendidos' |
| lote_producto_elaborado | FK -> LotesProductosElaborados | nullable |
| lote_producto_reventa | FK -> LotesProductosReventa | nullable |
| cantidad_consumida | DecimalField(10,3) | |
| fecha_consumo | DateTimeField | auto_now_add |

### OrdenVenta
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| cliente | FK -> Clientes | |
| fecha_creacion_orden | DateField | |
| fecha_entrega_solicitada | DateField | |
| fecha_entrega_definitiva | DateField | nullable |
| usuario_creador | FK -> User | |
| notas_generales | TextField(255) | nullable |
| monto_descuento_usd | DecimalField(10,3) | default=0 |
| monto_descuento_ves | DecimalField(10,3) | default=0 |
| monto_impuestos_usd | DecimalField(10,3) | default=0 |
| monto_impuestos_ves | DecimalField(10,3) | default=0 |
| monto_total_usd | DecimalField(10,3) | |
| monto_total_ves | DecimalField(10,3) | |
| tasa_cambio_aplicada | DecimalField(10,3) | |
| estado_orden | FK -> EstadosOrdenVenta | |
| metodo_pago | FK -> MetodosDePago | nullable |

### DetallesOrdenVenta
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| orden_venta_asociada | FK -> OrdenVenta | related_name='productos' |
| producto_elaborado | FK -> ProductosElaboradosVariantes | nullable |
| producto_reventa | FK -> ProductosReventaVariantes | nullable |
| cantidad_solicitada | DecimalField(10,3) | |
| unidad_medida | FK -> UnidadesDeMedida | |
| precio_unitario_usd | DecimalField(10,3) | |
| precio_unitario_ves | DecimalField(10,3) | |
| subtotal_linea_usd | DecimalField(10,3) | |
| subtotal_linea_ves | DecimalField(10,3) | |
| descuento_porcentaje | DecimalField(10,3) | nullable |
| impuesto_porcentaje | DecimalField(10,3) | nullable |

### OrdenConsumoLote
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| orden_venta_asociada | FK -> OrdenVenta | |
| detalle_orden_venta | FK -> DetallesOrdenVenta | |
| fecha_registro | DateTimeField | auto_now_add |

### OrdenConsumoLoteDetalle
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| orden_consumo_lote | FK -> OrdenConsumoLote | related_name='detalle_lotes' |
| lote_producto_elaborado | FK -> LotesProductosElaborados | nullable |
| lote_producto_reventa | FK -> LotesProductosReventa | nullable |
| cantidad_consumida | DecimalField(10,3) | |
| costo_parcial_usd | DecimalField(10,3) | default=0 |
| costo_parcial_ves | DecimalField(10,3) | default=0 |

### Pagos
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| venta_asociada | FK -> Ventas | nullable, mutually exclusive with orden_venta |
| orden_venta_asociada | FK -> OrdenVenta | nullable, mutually exclusive with venta |
| metodo_pago | FK -> MetodosDePago | |
| monto_pago_usd | DecimalField(10,2) | |
| monto_pago_ves | DecimalField(10,2) | |
| fecha_pago | DateField | |
| referencia_pago | CharField(100) | nullable |
| cambio_efectivo_usd | DecimalField(10,2) | nullable |
| cambio_efectivo_ves | DecimalField(10,2) | nullable |
| cambio_pago_movil_usd | DecimalField(10,2) | nullable |
| cambio_pago_movil_ves | DecimalField(10,2) | nullable |
| usuario_registrador | FK -> User | |
| tasa_cambio_aplicada | DecimalField(10,2) | |
| notas | TextField(255) | nullable |

---

## Compras App

### Proveedores
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_proveedor | CharField(100) | |
| apellido_proveedor | CharField(100) | nullable |
| nombre_comercial | CharField(100) | nullable |
| email_contacto | EmailField(100) | nullable |
| telefono_contacto | CharField(100) | nullable |
| fecha_creacion_registro | DateField | auto_now_add |
| usuario_registro | FK -> User | nullable |
| notas | TextField(255) | nullable |

### OrdenesCompra
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| proveedor | FK -> Proveedores | |
| usuario_creador | FK -> User | |
| fecha_emision_oc | DateField | |
| fecha_entrega_esperada | DateField | |
| fecha_entrega_real | DateField | nullable |
| estado_oc | FK -> EstadosOrdenCompra | |
| monto_total_oc_usd | DecimalField(15,4) | default=0 |
| monto_total_oc_ves | DecimalField(15,4) | default=0 |
| metodo_pago | FK -> MetodosDePago | |
| tasa_cambio_aplicada | DecimalField(15,4) | default=0 |
| direccion_envio | TextField(255) | nullable |
| fecha_envio_oc | DateField | nullable |
| email_enviado | BooleanField | default=False |
| fecha_email_enviado | DateTimeField | nullable |
| terminos_pago | CharField(100) | nullable |
| notas | TextField(255) | nullable |

### DetalleOrdenesCompra
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| orden_compra | FK -> OrdenesCompra | related_name='detalles' |
| variante_materia_prima | FK -> MateriasPrimasVariantes | nullable |
| variante_producto_reventa | FK -> ProductosReventaVariantes | nullable |
| cantidad_solicitada | DecimalField(15,4) | default=0 |
| cantidad_recibida | DecimalField(15,4) | default=0 |
| unidad_medida_compra | FK -> UnidadesDeMedida | nullable |
| unidad_empaquetado | FK -> EmpaquetadoProductos | nullable |
| costo_unitario_usd | DecimalField(15,4) | default=0 |
| costo_unitario_ves | DecimalField(15,4) | default=0 |
| subtotal_linea_usd | DecimalField(15,4) | default=0 |
| subtotal_linea_ves | DecimalField(15,4) | default=0 |

### Compras
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| orden_compra | FK -> OrdenesCompra | related_name='recepciones' |
| proveedor | FK -> Proveedores | |
| usuario_recepcionador | FK -> User | |
| pagado | BooleanField | default=False |
| monto_pendiente_pago_usd | DecimalField(15,4) | default=0 |
| fecha_recepcion | DateField | |
| numero_factura_proveedor | CharField(100) | nullable |
| numero_remision | CharField(100) | nullable |
| monto_recepcion_usd | DecimalField(15,4) | default=0 |
| monto_recepcion_ves | DecimalField(15,4) | default=0 |
| tasa_cambio_aplicada | DecimalField(15,4) | default=0 |
| notas | TextField(255) | nullable |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

### DetalleCompras
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| compra | FK -> Compras | related_name='detalles' |
| detalle_oc | FK -> DetalleOrdenesCompra | |
| variante_materia_prima | FK -> MateriasPrimasVariantes | nullable |
| variante_producto_reventa | FK -> ProductosReventaVariantes | nullable |
| cantidad_recibida | DecimalField(10,4) | |
| unidad_medida | FK -> UnidadesDeMedida | |
| costo_unitario_usd | DecimalField(10,4) | |
| subtotal_usd | DecimalField(10,4) | |
| notas | TextField(255) | nullable |

### PagosProveedores
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| compra_asociada | FK -> Compras | nullable, related_name='pagos' |
| orden_compra_asociada | FK -> OrdenesCompra | nullable, related_name='pagos' |
| proveedor | FK -> Proveedores | |
| fecha_pago | DateField | |
| metodo_pago | FK -> MetodosDePago | |
| monto_pago_usd | DecimalField(10,4) | |
| monto_pago_ves | DecimalField(10,4) | |
| tasa_cambio_aplicada | DecimalField(10,4) | |
| referencia_pago | CharField(100) | nullable |
| numero_comprobante | CharField(100) | nullable |
| usuario_registrador | FK -> User | |
| notas | TextField(255) | nullable |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

---

## Produccion App

### Recetas
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre | CharField(255) | nullable |
| producto_elaborado_variante | OneToOne -> ProductosElaboradosVariantes | unique |
| rendimiento | DecimalField(10,3) | nullable |
| fecha_creacion | DateTimeField | auto_now_add |
| fecha_modificacion | DateTimeField | auto_now |
| notas | TextField(250) | nullable |

### RecetasDetalles
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| receta | FK -> Recetas | related_name='componentes' |
| componente_materia_prima | FK -> MateriasPrimas | nullable |
| componente_producto_intermedio | FK -> ProductosElaboradosVariantes | nullable |
| cantidad | DecimalField(10,3) | default=0 |

### RelacionesRecetas
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| receta_principal | FK -> Recetas | related_name='receta_principal' |
| subreceta | FK -> Recetas | related_name='subreceta' |

### Produccion
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| producto_elaborado | FK -> ProductosElaborados | |
| producto_elaborado_variante | FK -> ProductosElaboradosVariantes | |
| cantidad_producida | DecimalField(10,3) | |
| fecha_produccion | DateField | auto_now_add |
| fecha_expiracion | DateField | nullable |
| costo_total_componentes_divisa | DecimalField(10,3) | |
| costo_total_componentes_local | DecimalField(10,3) | |
| usuario_creacion | FK -> User | |
| unidad_medida | FK -> UnidadesDeMedida | nullable |

### DetalleProduccionConsumos
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| produccion | FK -> Produccion | |
| materia_prima_consumida | FK -> MateriasPrimas | nullable |
| producto_intermedio_consumido | FK -> ProductosElaboradosVariantes | nullable |
| cantidad_consumida | DecimalField(10,3) | |
| costo_consumo_divisa | DecimalField(10,3) | default=0 |
| costo_consumo_local | DecimalField(10,3) | default=0 |

### DetalleProduccionLote
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| detalle_produccion | FK -> DetalleProduccionConsumos | related_name='lotes' |
| lote_materia_prima | FK -> LotesMateriasPrimas | nullable |
| lote_producto_intermedio | FK -> LotesProductosElaborados | nullable |
| cantidad_consumida | DecimalField(10,3) | |
| costo_parcial_divisa | DecimalField(10,3) | default=0 |
| costo_parcial_local | DecimalField(10,3) | default=0 |

### DefinicionTransformacion
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre | CharField(255) | |
| producto_elaborado_entrada | FK -> ProductosElaboradosVariantes | |
| cantidad_entrada | DecimalField(10,2) | default=0 |
| unidad_medida_entrada | FK -> UnidadesDeMedida | |
| producto_elaborado_salida | FK -> ProductosElaboradosVariantes | |
| unidad_medida_salida | FK -> UnidadesDeMedida | |
| cantidad_salida | DecimalField(10,2) | default=0 |
| usuario_creacion | FK -> User | |
| fecha_creacion | DateTimeField | auto_now_add |
| activo | BooleanField | default=False |

### LogTransformacion
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| definicion_transformacion | FK -> DefinicionTransformacion | |
| cantidad_producto_entrada_efectiva | DecimalField(10,2) | default=0 |
| cantidad_producto_salida_total_generado | DecimalField(10,2) | default=0 |
| costo_unitario_entrada_usd | DecimalField(10,2) | default=0 |
| costo_total_entrada_calculado_usd | DecimalField(10,2) | default=0 |
| costo_unitario_salida_calculado_usd | DecimalField(10,2) | default=0 |
| usuario_creacion | FK -> User | |
| fecha_creacion | DateTimeField | auto_now_add |
| notas | TextField | nullable |

---

## Transformacion App

### Transformacion
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| nombre_transformacion | CharField(255) | |
| cantidad_origen | DecimalField(10,3) | |
| cantidad_destino | DecimalField(10,3) | |
| fecha_creacion | DateTimeField | auto_now_add |
| activo | BooleanField | default=True |

### EjecutarTransformacion
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| transformacion | FK -> Transformacion | related_name='ejecuciones' |
| producto_origen | FK -> ProductosElaboradosVariantes | |
| producto_destino | FK -> ProductosElaboradosVariantes | |
| fecha_ejecucion | DateTimeField | auto_now_add |

### LotesConsumidosTransformacion
| Field | Type | Notes |
|-------|------|-------|
| id | AutoField | PK |
| transformacion | FK -> Transformacion | related_name='lotes_consumidos' |
| lote_producto_elaborado_consumido | FK -> LotesProductosElaborados | |
| lote_producto_elaborado_creado | FK -> LotesProductosElaborados | |
| cantidad_consumida | DecimalField(10,3) | |
| cantidad_creada | DecimalField(10,3) | |
