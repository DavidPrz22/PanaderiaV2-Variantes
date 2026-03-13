Implement a new feature for productos reventa

1. Add a form to create new lots for productos reventa
    -- Make sure the endpoints for this feature are working as expected
    -- Implement the api requests and mutations
    -- Implement the form with the fields: 
        -- producto_reventa
        -- lote
        -- fecha_caducidad
        -- cantidad_recibida
        -- precio_unitario_usd
        -- precio_unitario_local
        -- estado
2. Add a details panel for lots
    -- Add actions buttons to activate, inactivate and delete lots
    -- Make sure the endpoints for this feature are working as expected
    -- Make sure the stock of a product is updated when a lot is created, updated or deleted
3. Add variants to productos reventa as features like productos intermedios, productos finales and materia prima.
    -- variants fields for form:
        -- nombre_variante
        -- descripcion
        -- SKU
        -- atributo
        -- precio_venta_divisa
        -- precio_venta_local
        -- punto_reorden