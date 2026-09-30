/**
 * Utilidad para calcular el desglose financiero del pedido:
 * - Precio al por menor (total original según lista)
 * - Descuento por ofertas / promociones (ahorro por ofertas)
 * - Descuento por compras al por mayor (ahorro por mayoreo) y en cuánto queda
 * - Total final calculado
 */
export const calculateCartFinancials = (cartItems = []) => {
  let totalUnits = 0;
  let retailSubtotal = 0;
  let offerDiscount = 0;
  let wholesaleDiscount = 0;
  let hasWholesale = false;
  let hasOffer = false;

  cartItems.forEach((item) => {
    const qty = parseInt(item.quantity) || 1;
    totalUnits += qty;

    // Precio unitario normal base redondeado
    const rawNormal = Math.round(parseFloat(item.precioNormal || item.precio_normal || item.precio || 0));
    const normalPrice = rawNormal > 0 ? rawNormal : Math.round(parseFloat(item.precio || 0));

    // Precios al por mayor redondeados a enteros
    const p80 = Math.round(parseFloat(item.precio_mayorista80 || item.precioMayorista80 || 0));
    const p6 = Math.round(parseFloat(item.precio_mayorista6 || item.precioMayorista6 || 0));
    const isWholesale = (qty >= 80 && p80 > 0) || (qty >= 6 && p6 > 0);
    const wholesaleUnitPrice = (qty >= 80 && p80 > 0) ? p80 : ((qty >= 6 && p6 > 0) ? p6 : null);

    // Oferta activa (solo si no aplica al por mayor)
    const isOfferActive = !isWholesale && !!(item.enOfertaVenta || item.oferta || item.has_discount || item.hasDiscount || item.is_oferta);
    const rawOfferPrice = (item.precioOferta != null) ? Math.round(parseFloat(item.precioOferta)) : ((item.precio_descuento != null) ? Math.round(parseFloat(item.precio_descuento)) : null);
    const isOffer = isOfferActive && rawOfferPrice != null && rawOfferPrice < normalPrice;

    retailSubtotal += normalPrice * qty;

    if (isWholesale && wholesaleUnitPrice != null && wholesaleUnitPrice < normalPrice) {
      wholesaleDiscount += (normalPrice - wholesaleUnitPrice) * qty;
    } else if (isOffer && rawOfferPrice != null) {
      offerDiscount += (normalPrice - rawOfferPrice) * qty;
    }
  });

  wholesaleDiscount = Math.round(wholesaleDiscount);
  offerDiscount = Math.round(offerDiscount);
  retailSubtotal = Math.round(retailSubtotal);

  const totalDiscount = offerDiscount + wholesaleDiscount;
  const finalTotal = Math.max(0, retailSubtotal - totalDiscount);
  const wholesaleResult = Math.max(0, retailSubtotal - wholesaleDiscount);

  return {
    totalUnits,
    retailSubtotal,
    offerDiscount,
    wholesaleDiscount,
    totalDiscount,
    finalTotal,
    wholesaleResult,
    hasWholesale: wholesaleDiscount > 0,
    hasOffer: offerDiscount > 0
  };
};
