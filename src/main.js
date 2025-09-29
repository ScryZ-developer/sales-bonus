/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  const { discount, sale_price, quantity } = purchase;
  return (1 - discount / 100) * sale_price * quantity;
}
  
/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  const { profit } = seller;
  if (index === 0) {  // Если первый
    return profit * 0.15;
  } else if (index === 1 || index === 2) { // Если второй или третий
    return profit * 0.10;
  } else if (index === total - 1) { // Если последний
    return 0;
  } else { // Для остальных
    return profit * 0.05;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (!data
    || !Array.isArray(data.sellers)
    || (data.sellers.length === 0)
    || (data.purchase_records.length === 0)
  ) {
    throw new Error('Некорректные входные данные');
  }

  // @TODO: Проверка входных опций
  const { calculateRevenue, calculateBonus } = options;
  if (!calculateRevenue || !calculateBonus) {
    throw new Error('Чего-то не хватает');
  }   

  // Проверка массива товаров
  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error('Массив товаров (products) не может быть пустым');
  } 

  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellerStats = data.sellers.map(seller => ({
    seller_id: seller.id,
    name: seller.first_name + ' ' + seller.last_name,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: [],
    bonus: 0,
  }));

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  const sellerIndex = Object.fromEntries(sellerStats.map(item => [item.seller_id, item]));
  const productIndex = Object.fromEntries(data.products.map(item => [item.sku, item]));

  // Проверка индексации
  console.log('Seller Index:', sellerIndex);
  console.log('Product Index:', productIndex);

  // @TODO: Расчет выручки и прибыли для каждого продавца
  data.purchase_records.forEach((record) => { // Чек 
    const seller = sellerIndex[record.seller_id]; // Продавец
    if (!seller) return;

    seller.sales_count++; // Увеличиваем количество продаж 

    seller.revenue += record.total_amount; // Увеличиваем общую сумму выручки (revenue) у продавца
    
    // Расчёт прибыли для каждого товара
    record.items.forEach(item => {
      const product = productIndex[item.sku]; // Товар
      if (!product) return;

      let cost = product.purchase_price * item.quantity; // Считаем себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
      let revenue = calculateRevenue(item); // Считаем выручку (revenue) с учётом скидки через функцию calculateRevenue

      seller.profit += revenue - cost; // Считаем прибыль: выручка минус себестоимость

      // Учёт количества проданных товаров
      if (!seller.products_sold[item.sku]) {
          seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity; // По артикулу товара увеличиваем его проданное количество у продавца
    });
  });
  console.log(sellerStats)

  // @TODO: Сортировка продавцов по прибыли
  sellerStats.sort((a, b) => b.profit - a.profit);

  // @TODO: Назначение премий на основе ранжирования
  sellerStats.forEach((seller, index) => {
    seller.bonus = calculateBonus(index, sellerStats.length, seller);
    // Формируем топ-10 товаров
    seller.top_products = Object.entries(seller.products_sold)
      .map((item) => ({ sku: item[0], quantity: item[1] }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });

  // @TODO: Подготовка итоговой коллекции с нужными полями
  return sellerStats.map((seller) => ({
    seller_id: seller.seller_id, // Строка, идентификатор продавца
    name: seller.name, // Строка, имя продавца
    revenue: +seller.revenue.toFixed(2), // Число с двумя знаками после точки, выручка продавца
    profit: +seller.profit.toFixed(2), // Число с двумя знаками после точки, прибыль продавца
    sales_count: seller.sales_count, // Целое число, количество продаж продавца
    top_products: seller.top_products, // Массив объектов вида: { "sku": "SKU_008","quantity": 10}, топ-10 товаров продавца
    bonus: +seller.bonus.toFixed(2), // Число с двумя знаками после точки, бонус продавца
  })); 
}
