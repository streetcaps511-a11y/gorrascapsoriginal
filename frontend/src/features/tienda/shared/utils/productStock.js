export const parseTallasStock = (rawStock) => {
  if (!rawStock) return [];

  try {
    const stock = typeof rawStock === "string" ? JSON.parse(rawStock) : rawStock;

    if (Array.isArray(stock)) {
      return stock.map((item) => ({
        talla: item?.talla ?? item?.Talla ?? item?.nombre ?? "",
        cantidad: Number(item?.cantidad ?? item?.Cantidad ?? item?.stock ?? 0),
      }));
    }

    if (stock && typeof stock === "object") {
      return Object.entries(stock).map(([talla, cantidad]) => ({
        talla,
        cantidad: Number(cantidad ?? 0),
      }));
    }
  } catch {
    return [];
  }

  return [];
};

export const getProductTotalStock = (product, inventory = null) => {
  const productId = String(product?.id ?? product?.IdProducto ?? "");
  const inventoryStock = inventory && productId ? inventory[productId] : null;

  if (inventoryStock && typeof inventoryStock === "object") {
    return Object.values(inventoryStock).reduce(
      (total, cantidad) => total + Math.max(0, Number(cantidad) || 0),
      0,
    );
  }

  const tallas = parseTallasStock(product?.tallasStock ?? product?.TallasStock);
  if (tallas.length > 0) {
    return tallas.reduce(
      (total, item) => total + Math.max(0, Number(item.cantidad) || 0),
      0,
    );
  }

  return Math.max(0, Number(product?.stock ?? product?.Stock ?? 0) || 0);
};
