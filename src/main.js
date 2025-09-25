/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase;
   return (1 - (discount / 100)) * sale_price * quantity;
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
    if (index == 0) {  // Если первый
      return profit * 0.15;
    } else if (index == 1 || index == 2) { // Если первый или второй
      return profit * 0.1;
    } else if (index == total - 1) { // Если последний
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
      || data.sellers.length === 0
    ) {
      throw new Error('Некорректные входные данные');
    }

    // @TODO: Проверка входных опций
    const { calculateRevenue, calculateBonus } = options;
    if (!calculateRevenue || !calculateBonus) {
      throw new Error('Чего-то не хватает');
    }   

    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
      id: seller.id,
      name: `${seller.first_name} ${seller.last_name}`,
      revenue: 0,
      profit: 0,
      sales_count: 0,
      products_sold: {},
      bonus: 0,
    }));

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(sellerStats.map(item => [item.id, item]));
    const productIndex = Object.fromEntries(data.products.map(item => [item.sku, item]));

    // Проверка индексации
    console.log('Seller Index:', sellerIndex);
    console.log('Product Index:', productIndex);

    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => { // Чек 
      const seller = sellerIndex[record.seller_id]; // Продавец

      seller.sales_count++; // Увеличиваем количество продаж 
      
      seller.revenue += record.total_amount; // Увеличиваем общую сумму всех продаж

      // Расчёт прибыли для каждого товара
      record.items.forEach(item => {
        const product = productIndex[item.sku]; // Товар

        let cost = product.purchase_price * item.quantity; // Считаем себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека

        let revenue = calculateRevenue(item, product); // Считаем выручку (revenue) с учётом скидки через функцию calculateRevenue

        let profit = revenue - cost; // Считаем прибыль: выручка минус себестоимость
        
        seller.profit += profit; // Увеличиваем общую накопленную прибыль (profit) у продавца  

        seller.revenue += revenue; // Увеличиваем общую сумму выручки (revenue) у продавца

        // Учёт количества проданных товаров
        if (!seller.products_sold[item.sku]) {
          seller.products_sold[item.sku] = 0;
        }
        seller.products_sold[item.sku] += item.quantity; // По артикулу товара увеличиваем его проданное количество у продавца
        });
    });
    // @TODO: Сортировка продавцов по прибыли
    

    // @TODO: Назначение премий на основе ранжирования
    

    // @TODO: Подготовка итоговой коллекции с нужными полями
}
