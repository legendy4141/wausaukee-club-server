const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

// Calculate the number of meals and their details based on arrival and departure dates
export const calculateMealQuantity = (arrivalDate: string, arrivalFirstMeal: string, departureDate: string, departureLastMeal: string): number => {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  let totalMeals = 0;

  // Adjust arrival and departure based on the specified first and last meal
  let currentDate = new Date(arrival);

  while (currentDate <= departure) {
    const dayOfWeek = currentDate.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    let mealsForDay = 0;

    // Skip Tuesday (no meals)
    if (dayOfWeek === 2) {
      // Skip Tuesday, no meals
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Determine meals for the current day based on the day of the week
    if (dayOfWeek === 0) { // Sunday
      mealsForDay = 2; // Only Breakfast and Lunch
    } else if (dayOfWeek === 6) { // Saturday
      mealsForDay = 3; // Breakfast, Lunch, and Dinner
    } else if (dayOfWeek === 5) { // Friday
      mealsForDay = 3; // Breakfast, Lunch, and Dinner
    } else if (dayOfWeek === 4) { // Thursday
      mealsForDay = 3; // Breakfast, Lunch, and Dinner
    } else if (dayOfWeek === 3) { // Wednesday
      mealsForDay = 3; // Breakfast, Lunch, and Dinner
    } else if (dayOfWeek === 1) { // Monday
      mealsForDay = 3; // Breakfast, Lunch, and Dinner
    }

    // Handle arrival first meal
    if (currentDate.getTime() === arrival.getTime()) {
      if (arrivalFirstMeal === 'Lunch') {
        mealsForDay -= 1; // Remove breakfast from the total count
      } else if (arrivalFirstMeal === 'Dinner') {
        mealsForDay -= 2; // Remove breakfast and lunch from the total count
      }
    }

    // Handle departure last meal
    if (currentDate.getTime() === departure.getTime()) {
      if (departureLastMeal === 'Breakfast') {
        mealsForDay = 1; // Only Breakfast
      } else if (departureLastMeal === 'Lunch') {
        mealsForDay = 2; // Breakfast and Lunch
      } else if (departureLastMeal === 'Dinner') {
        mealsForDay = 3; // All meals: Breakfast, Lunch, and Dinner
      }
    }

    // Add meals for the current day
    totalMeals += mealsForDay;

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return totalMeals;
}

export const generateSalesOrderId = (arrivalDate: string, clientId: string): string => {
  const month = arrivalDate.substring(5, 7);
  const day = arrivalDate.substring(8, 10);
  const clientIdDigits = clientId.slice(1, 3);
  const salesOrderId = `${month}${day}${clientIdDigits}`;

  return salesOrderId;
};

export const calculateDaysStayed = (arrivalDate: string, departureDate: string): number => {
  const start = new Date(arrivalDate);
  const end = new Date(departureDate);
  const timeDiffMs = end.getTime() - start.getTime();
  const daysDiff = timeDiffMs / (1000 * 60 * 60 * 24);
  return Math.round(daysDiff);
};

export const checkTuesdayInclude = (arrivalDate: string, departureDate: string): boolean => {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);

  for (let currentDate = new Date(arrival); currentDate <= departure; currentDate.setDate(currentDate.getDate() + 1)) {
    if (currentDate.getDay() === 2) {
      return true;
    }
  }

  return false;
};

export const generateRow = (customer_id: string, sales_order_no:string, date: string, quantity: number, item_id: string, item_description: string, gl_account: number, unit_price: number, tax_type: number, amount: number, job_id: string): Object => {
  return [customer_id, sales_order_no, date, date, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Net 15th of Next Month", "", 107, "WST", "", "", "", "", "", "", "", quantity, item_id, item_description, gl_account, unit_price, tax_type, "", "", amount, job_id];
}