import * as Localization from 'expo-localization';

export async function fetchProductByBarcode(barcode) {
  try {
    const language = Localization.locale.split('-')[0] || 'en';
    console.log("🌍 Lingua del dispositivo:", language);

    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    console.log("🔗 Chiamata API a:", url);

    const response = await fetch(url, {
      headers: {
        'Accept-Language': language
      }
    });

    const data = await response.json();
    console.log("📬 Risposta ricevuta:", data);

    if (data.status === 1 && data.product) {
      console.log("✅ Prodotto trovato:", data.product.product_name);
      return data.product;
    } else {
      console.error("❌ Prodotto non trovato:", data);
      throw new Error('Prodotto non trovato.');
    }
  } catch (error) {
    console.error("🔥 Errore nella chiamata API:", error);
    throw error;
  }
}
