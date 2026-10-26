-- Controles de integridad para ejecutar después de cargar plata y oro.
-- Cada bloque DO falla explícitamente cuando encuentra una inconsistencia.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM ORO.HECHO_OFERTA_TURISTICA
        WHERE SK_TIEMPO IS NULL OR SK_EMPRESA IS NULL
           OR SK_CIUDAD IS NULL OR SK_SERVICIO IS NULL
           OR PRECIO IS NULL OR DISPONIBLE IS NULL
    ) THEN
        RAISE EXCEPTION 'Validación fallida: hay nulos en el hecho de oferta.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM ORO.HECHO_PRODUCTO_ARTESANAL
        WHERE SK_TIEMPO IS NULL OR SK_CIUDAD IS NULL
           OR SK_PRODUCTO IS NULL OR PRECIO_COP IS NULL
    ) THEN
        RAISE EXCEPTION 'Validación fallida: hay nulos en el hecho de producto.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM PLATA.PRODUCTO_SNAPSHOT P
        JOIN ORO.DIM_TIEMPO T ON T.FECHA = P.FECHA_SNAPSHOT
        JOIN ORO.HECHO_PRODUCTO_ARTESANAL F
          ON F.SK_TIEMPO = T.SK_TIEMPO
         AND F.ID_PRODUCTO_ORIGEN = P.ID_PRODUCTO_ORIGEN
        JOIN ORO.DIM_PRODUCTO D ON D.SK_PRODUCTO = F.SK_PRODUCTO
        WHERE D.ID_PRODUCTO_ORIGEN <> P.ID_PRODUCTO_ORIGEN
           OR P.FECHA_SNAPSHOT < D.FECHA_INICIO
           OR P.FECHA_SNAPSHOT >= D.FECHA_FIN
    ) THEN
        RAISE EXCEPTION 'Validación fallida: un hecho de producto apunta a una versión dimensional fuera de vigencia.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM ORO.HECHO_RESENAS
        WHERE SK_TIEMPO IS NULL OR PUNTUACION NOT BETWEEN 1 AND 5
           OR TOTAL_LIKES < 0
    ) THEN
        RAISE EXCEPTION 'Validación fallida: hay datos no válidos en el hecho de reseñas.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM ORO.DIM_EMPRESA
        WHERE ES_VIGENTE AND FECHA_FIN <> TIMESTAMP '9999-12-31 00:00:00'
    ) THEN
        RAISE EXCEPTION 'Validación fallida: una empresa vigente no usa fecha_fin centinela.';
    END IF;

    IF EXISTS (
        SELECT ID_EMPRESA
        FROM ORO.DIM_EMPRESA
        WHERE ES_VIGENTE
        GROUP BY ID_EMPRESA
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Validación fallida: hay varias versiones vigentes de una empresa.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM BRONCE.HISTORICO_PLAN_TURISTICO
        WHERE DATOS_SNAPSHOT ? 'usuario_responsable'
    ) OR EXISTS (
        SELECT 1 FROM BRONCE.HISTORICO_HOSPEDAJE
        WHERE DATOS_SNAPSHOT ? 'usuario_responsable'
    ) OR EXISTS (
        SELECT 1 FROM BRONCE.HISTORICO_TRANSPORTE
        WHERE DATOS_SNAPSHOT ? 'usuario_responsable'
    ) OR EXISTS (
        SELECT 1 FROM BRONCE.HISTORICO_PRODUCTO_ARTESANAL
        WHERE DATOS_SNAPSHOT ?| ARRAY[
            'usuario_responsable', 'id_persona_ecommerce', 'num_contacto'
        ]
    ) THEN
        RAISE EXCEPTION 'Validación fallida: un snapshot bronce contiene campos no permitidos.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM ORO.HECHO_OFERTA_TURISTICA F
        LEFT JOIN ORO.DIM_TIEMPO D ON D.SK_TIEMPO = F.SK_TIEMPO
        WHERE D.SK_TIEMPO IS NULL
    ) OR EXISTS (
        SELECT 1 FROM ORO.HECHO_PRODUCTO_ARTESANAL F
        LEFT JOIN ORO.DIM_CIUDAD D ON D.SK_CIUDAD = F.SK_CIUDAD
        WHERE D.SK_CIUDAD IS NULL
    ) OR EXISTS (
        SELECT 1 FROM ORO.DIM_SERVICIO S
        LEFT JOIN ORO.DIM_CIUDAD ORIGEN ON ORIGEN.SK_CIUDAD = S.SK_CIUDAD_ORIGEN
        LEFT JOIN ORO.DIM_CIUDAD DESTINO ON DESTINO.SK_CIUDAD = S.SK_CIUDAD_DESTINO
        WHERE ORIGEN.SK_CIUDAD IS NULL OR DESTINO.SK_CIUDAD IS NULL
    ) THEN
        RAISE EXCEPTION 'Validación fallida: se encontró una referencia dimensional rota.';
    END IF;

    IF (SELECT COUNT(*) FROM PLATA.OFERTA_SNAPSHOT)
       <> (SELECT COUNT(*) FROM ORO.HECHO_OFERTA_TURISTICA) THEN
        RAISE EXCEPTION 'Validación fallida: las filas de oferta de plata y oro no coinciden.';
    END IF;

    IF (SELECT COUNT(*) FROM PLATA.PRODUCTO_SNAPSHOT)
       <> (SELECT COUNT(*) FROM ORO.HECHO_PRODUCTO_ARTESANAL) THEN
        RAISE EXCEPTION 'Validación fallida: las filas de productos de plata y oro no coinciden.';
    END IF;

    IF (SELECT COUNT(*) FROM PLATA.RESENA)
       <> (SELECT COUNT(*) FROM ORO.HECHO_RESENAS) THEN
        RAISE EXCEPTION 'Validación fallida: las filas de reseñas de plata y oro no coinciden.';
    END IF;
END
$$;

-- Comparación de conteos para revisión manual:
SELECT 'ofertas_plata' AS CONJUNTO, COUNT(*) AS FILAS FROM PLATA.OFERTA_SNAPSHOT
UNION ALL
SELECT 'ofertas_oro', COUNT(*) FROM ORO.HECHO_OFERTA_TURISTICA
UNION ALL
SELECT 'productos_plata', COUNT(*) FROM PLATA.PRODUCTO_SNAPSHOT
UNION ALL
SELECT 'productos_oro', COUNT(*) FROM ORO.HECHO_PRODUCTO_ARTESANAL
UNION ALL
SELECT 'resenas_plata', COUNT(*) FROM PLATA.RESENA
UNION ALL
SELECT 'resenas_oro', COUNT(*) FROM ORO.HECHO_RESENAS;

SELECT TIPO_SERVICIO, FECHA_SNAPSHOT, COUNT(*) AS SERVICIOS
FROM PLATA.OFERTA_SNAPSHOT
GROUP BY TIPO_SERVICIO, FECHA_SNAPSHOT
ORDER BY FECHA_SNAPSHOT, TIPO_SERVICIO;
