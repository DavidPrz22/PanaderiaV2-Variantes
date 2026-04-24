import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { DetalleOC, OrdenCompra } from "../types/types";
import PanaderiaLogo from "@/assets/PanaderiaLogo.png";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  // Top header with PO number and company info
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
  },
  poNumberSection: {
    flexDirection: "column",
  },
  poNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  revisionText: {
    fontSize: 10,
    color: "#6b7280",
  },
  companySection: {
    flexDirection: "column",
    alignItems: "flex-end",
    maxWidth: "200px",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
    lineHeight: 1.4,
  },
  // Date section
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    marginRight: 8,
  },
  dateValue: {
    fontSize: 9,
    color: "#1f2937",
  },
  // Prepared For/By section
  preparedSection: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  preparedColumn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 4,
  },
  preparedTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  preparedContent: {
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.5,
  },
  preparedLine: {
    marginBottom: 4,
  },
  // Materials/Products section
  materialsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
    paddingHorizontal: 4,
    color: "#1f2937",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 4,
    color: "#374151",
  },
  // Column widths for simplified table
  colNumber: { width: "8%", textAlign: "center" },
  colDescription: { width: "40%" },
  colUnitPrice: { width: "18%", textAlign: "right" },
  colQty: { width: "12%", textAlign: "center" },
  colTotal: { width: "22%", textAlign: "right" },
  // Totals section
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 15,
  },
  totalsColumn: {
    width: "250px",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1f2937",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  // Notes section
  notesSection: {
    marginTop: 20,
    paddingTop: 15,
  },
  notesText: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
    fontStyle: "italic",
  },
  // Approval section
  approvalSection: {
    marginTop: 25,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 40,
    marginBottom: 40,
  },
  approvalColumn: {
    flex: 1,
    alignItems: "center",
  },
  approvalTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 20,
  },
  approvalLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    width: "80%",
    height: 30,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
    paddingTop: 8,
  },
});

export const OrdenCompraPDF = ({
  ordenCompra,
}: {
  ordenCompra: OrdenCompra;
}) => {
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatDateShort = (dateString: string | undefined | null) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Calculate expected delivery date (can be derived from fecha_entrega_esperada)
  const expectedDeliveryDate = ordenCompra.fecha_entrega_esperada
    ? formatDateShort(ordenCompra.fecha_entrega_esperada)
    : "No especificada";

  // Ensure detalles is an array
  const detalles = ordenCompra.detalles || [];

  // Handle image source - try to convert to string if it's an object/module
  // In Vite, imported images can be strings or objects with src/default properties
  const logoSource: string =
    typeof PanaderiaLogo === "string"
      ? PanaderiaLogo
      : (PanaderiaLogo as { src?: string; default?: string })?.src ||
        (PanaderiaLogo as { src?: string; default?: string })?.default ||
        String(PanaderiaLogo);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top Header with PO Number and Company Info */}
        <View style={styles.topHeader}>
          <View style={styles.poNumberSection}>
            <Text style={styles.poNumber}>
              Orden de Compra #{ordenCompra.id}
            </Text>
          </View>
          <View style={styles.companySection}>
            <Image src={logoSource} style={styles.logo} />
            <Text style={styles.companyName}>Panadería System</Text>
            <Text style={styles.companyAddress}>
              Sistema de Gestión de Panadería
            </Text>
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.dateSection}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Fecha de Emisión:</Text>
            <Text style={styles.dateValue}>
              {formatDate(ordenCompra.fecha_emision_oc)}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Fecha de Entrega Esperada:</Text>
            <Text style={styles.dateValue}>{expectedDeliveryDate}</Text>
          </View>
        </View>

        {/* Prepared For / Prepared By Section */}
        <View style={styles.preparedSection}>
          {/* Prepared For - Supplier Info */}
          <View style={styles.preparedColumn}>
            <Text style={styles.preparedTitle}>Preparado Para</Text>
            <View style={styles.preparedContent}>
              <Text style={styles.preparedLine}>
                {ordenCompra.proveedor.nombre_proveedor}
              </Text>
              {ordenCompra.proveedor.nombre_comercial && (
                <Text style={styles.preparedLine}>
                  {ordenCompra.proveedor.nombre_comercial}
                </Text>
              )}
              {ordenCompra.direccion_envio && (
                <Text style={styles.preparedLine}>
                  Dirrecion de Envio: {ordenCompra.direccion_envio}
                </Text>
              )}
              {ordenCompra.proveedor.email_contacto && (
                <Text style={styles.preparedLine}>
                  Email: {ordenCompra.proveedor.email_contacto}
                </Text>
              )}
              {ordenCompra.proveedor.telefono_contacto && (
                <Text style={styles.preparedLine}>
                  Tel: {ordenCompra.proveedor.telefono_contacto}
                </Text>
              )}
            </View>
          </View>

          {/* Prepared By - Company Info */}
          <View style={styles.preparedColumn}>
            <Text style={styles.preparedTitle}>Preparado Por</Text>
            <View style={styles.preparedContent}>
              <Text style={styles.preparedLine}>Panadería System</Text>
              <Text style={styles.preparedLine}>
                Método de Pago: {ordenCompra.metodo_pago.nombre_metodo}
              </Text>
              {ordenCompra.terminos_pago && (
                <Text style={styles.preparedLine}>
                  Términos: {ordenCompra.terminos_pago}
                </Text>
              )}
              <Text style={styles.preparedLine}>
                Moneda: Dólar Estadounidense (USD)
              </Text>
            </View>
          </View>
        </View>

        {/* Materials/Products Table */}
        <View style={styles.materialsSection}>
          <Text style={styles.sectionTitle}>Materiales</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, styles.colNumber]}>#</Text>
              <Text style={[styles.tableCellHeader, styles.colDescription]}>
                Descripción
              </Text>
              <Text style={[styles.tableCellHeader, styles.colUnitPrice]}>
                Precio Unitario
              </Text>
              <Text style={[styles.tableCellHeader, styles.colQty]}>
                Cantidad
              </Text>
              <Text style={[styles.tableCellHeader, styles.colTotal]}>
                Total*
              </Text>
            </View>

            {/* Table Body */}
            {detalles.map((item: DetalleOC, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colNumber]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCell, styles.colDescription]}>
                  {item.producto_reventa_nombre || item.materia_prima_nombre}
                  {item.empaquetado ? ` (${item.empaquetado.empaque_nombre})` : ` (${item.unidad_medida_compra?.abreviatura})`}
                </Text>
                <Text style={[styles.tableCell, styles.colUnitPrice]}>
                  {formatCurrency(item.costo_unitario_usd)}
                </Text>
                <Text style={[styles.tableCell, styles.colQty]}>
                  {item.cantidad_solicitada}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  {formatCurrency(item.subtotal_linea_usd)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsColumn}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tasa de Cambio:</Text>
              <Text style={styles.totalValue}>
                {ordenCompra.tasa_cambio_aplicada}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total en VES:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(ordenCompra.monto_total_oc_ves)}
              </Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total General:</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(ordenCompra.monto_total_oc_usd)}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Note */}
        <View style={styles.notesSection}>
          <Text style={styles.notesText}>
            *Algunos costos adicionales pueden aplicar
          </Text>
        </View>

        {/* Notes Section */}
        {ordenCompra.notas && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notas Adicionales</Text>
            <Text style={styles.notesText}>{ordenCompra.notas}</Text>
          </View>
        )}

        {/* Approval Section */}
        <View style={styles.approvalSection}>
          <View style={styles.approvalColumn}>
            <View style={styles.approvalLine} />
            <Text style={styles.approvalTitle}>Aprobado por</Text>
          </View>

          <View style={styles.approvalColumn}>
            <View style={styles.approvalLine} />
            <Text style={styles.approvalTitle}>Firma</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Página 1 de 1</Text>
          <Text>CONFIDENCIAL</Text>
          <Text>Generado el {formatDateShort(new Date().toISOString())}</Text>
        </View>
      </Page>
    </Document>
  );
};
