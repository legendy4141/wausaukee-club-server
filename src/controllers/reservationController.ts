import { Request, Response } from 'express';
import { getJobByJob } from '../models/jobModel';
import { getItemDetails } from '../services/itemService';
import { getCustomerDetails } from '../services/customerService';
import { storeInGoogleSheet,sendReservationEmail, sendCalendarInvite} from '../services/googleService';
import { calculateMealQuantity, generateSalesOrderId, calculateDaysStayed, generateRow, checkTuesdayInclude } from '../utils/utils';

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { arrivalDate, departureDate, arrivalFirstMeal, departureLastMeal, names, selectedJob, clientId, airportPickup, flightDescription, housekeeping, firewood, golfCartRental } = req.body;
    
    const reservation_row = [];
    // Get Customer Details
    const customer = await getCustomerDetails(clientId);

    // Generate Sales Order ID
    const salesOrderID = await generateSalesOrderId(arrivalDate, clientId);

    //Get Job ID
    const jobID = await getJobByJob(selectedJob);

    // Generate WI State Tax Row
    const wi_state_tax_row = generateRow(clientId, salesOrderID, arrivalDate, 0, "", "WI STATE TAX", 236, 0, 0, 0, jobID);
    reservation_row.push(wi_state_tax_row);

    // Generate Meal Rows
    const mealQuantity = calculateMealQuantity(arrivalDate, arrivalFirstMeal, departureDate, departureLastMeal);
    const isTuesdayInclude = checkTuesdayInclude(arrivalDate, departureDate);
    
    let accountID = "FB_";

    switch (clientId[0]) {
      case 'M':
      case 'A':
      case 'F':
      case 'H':
        accountID += "MEMBER_";
        break;
      case 'G':
        accountID += "GUEST_";
        break;
      case 'L':
        accountID += "LESSEE_";
        break;
      default:
        break;
    }


    for (let i = 0; i < names.length; i++) {
      let accountItemID = accountID;
      accountItemID += names[i].isAdult ? "A_" : "C_";
      const accountMealItem = await getItemDetails(`${accountItemID}MEAL`);
      const accountMealItemDescription = `${names[i].firstName} ${names[i].lastName} ${arrivalDate} ${arrivalFirstMeal} ${departureDate} ${departureLastMeal}`;
      const accountMealItemAmount = accountMealItem.unit_price * mealQuantity;
      const accountMealItemRow = generateRow(clientId, salesOrderID, arrivalDate, mealQuantity, accountMealItem.item_id, accountMealItemDescription, accountMealItem.gl_account, accountMealItem.unit_price, accountMealItem.tax_type, accountMealItemAmount, jobID);
      reservation_row.push(accountMealItemRow);

      if (isTuesdayInclude)
      {
        const accountBasketItem = await getItemDetails(`${accountItemID}BASKET`);
        const accountBasketItemDescription = `${names[i].firstName} ${names[i].lastName} ${arrivalDate} ${arrivalFirstMeal} ${departureDate} ${departureLastMeal}`;
        const accountBasketItemAmount = accountBasketItem.unit_price * mealQuantity;
        const accountBasketItemRow = generateRow(clientId, salesOrderID, arrivalDate, mealQuantity, accountBasketItem.item_id, accountBasketItemDescription, accountBasketItem.gl_account, accountBasketItem.unit_price, accountBasketItem.tax_type, accountBasketItemAmount, jobID);
        reservation_row.push(accountBasketItemRow);
      }
    }

    // Generate Additional Service Rows
    if (airportPickup)
    {
      const airportPickupItem = await getItemDetails("ADMIN_AUTO TRIP");
      const airportPickupRow = generateRow(clientId, salesOrderID, arrivalDate, 1, airportPickupItem.item_id, flightDescription, airportPickupItem.gl_account, airportPickupItem.unit_price, airportPickupItem.tax_type, airportPickupItem.unit_price, jobID);
      reservation_row.push(airportPickupRow);
    }

    if (housekeeping)
    {
      const houseKeepItem = await getItemDetails("MS_HOUSEKEEP_CLEAN");
      const houseKeepRow = generateRow(clientId, salesOrderID, arrivalDate, 1, houseKeepItem.item_id, houseKeepItem.description, houseKeepItem.gl_account, houseKeepItem.unit_price, houseKeepItem.tax_type, houseKeepItem.unit_price, jobID);
      reservation_row.push(houseKeepRow);
    }

    if (firewood)
    {
      const firewoodPorterItem = await getItemDetails("MS_PORTER_ FIREWOOD");
      const firewoodPorterRow = generateRow(clientId, salesOrderID, arrivalDate, 1, firewoodPorterItem.item_id, firewoodPorterItem.description, firewoodPorterItem.gl_account, firewoodPorterItem.unit_price, firewoodPorterItem.tax_type, firewoodPorterItem.unit_price, jobID);
      reservation_row.push(firewoodPorterRow);
    }

    if (golfCartRental)
    {
      const golfCartRentalItem = await getItemDetails("MS_GOLF_CART");
      const golfCartRentalRow = generateRow(clientId, salesOrderID, arrivalDate, 1, golfCartRentalItem.item_id, golfCartRentalItem.description, golfCartRentalItem.gl_account, golfCartRentalItem.unit_price, golfCartRentalItem.tax_type,  golfCartRentalItem.unit_price, jobID);
      reservation_row.push(golfCartRentalRow);
    }

    // Generate Porter Service Row
    const daysStayed = calculateDaysStayed(arrivalDate, departureDate);
    const porterServiceItem = await getItemDetails("MS_PORTER_ DAILY");
    const porterServiceAmount = daysStayed * names.length * 2 * porterServiceItem.unit_price;
    const porterServiceRow = generateRow(clientId, salesOrderID, arrivalDate, daysStayed * names.length * 2, porterServiceItem.item_id, "PORTER SERVICE", porterServiceItem.gl_account, porterServiceItem.unit_price, porterServiceItem.tax_type, porterServiceAmount, jobID);
    reservation_row.push(porterServiceRow);

    
    // Generate Fund Service Row
    let gratuity_amount = 0;
    for ( let i = 0; i < reservation_row.length; i ++)
    {
      // @ts-ignore
      const gratuityValue = reservation_row[i][38] ?? 0;
      gratuity_amount += Number(gratuityValue);
    }
    gratuity_amount =  parseFloat((gratuity_amount * 0.07).toFixed(2));
    const gratuityFundItem = await getItemDetails("ADMIN_GRATUITY");
    const gratuityFundRow = generateRow(clientId, salesOrderID, arrivalDate, 1, gratuityFundItem.item_id, "ADMIN_GRATUITY", gratuityFundItem.gl_account, 0, gratuityFundItem.tax_type, gratuity_amount, jobID);
    reservation_row.push(gratuityFundRow);

    // Insert Number of Distributions for Each Row
    for (let i = 0; i < reservation_row.length; i++)
    {
      // @ts-ignore
      reservation_row[i][28] = reservation_row.length;
      // @ts-ignore
      reservation_row[i][38] =  reservation_row[i][38] * -1;
    }

    // Google Cloud Services
    // Google Sheet Append
    await storeInGoogleSheet(reservation_row);

    // Send Reservation Gmail
    const emailResponse = await sendReservationEmail(customer.email, customer.first_name, salesOrderID, arrivalDate, departureDate);
    
    // Send Google Calendar Reservation Invitation
    await sendCalendarInvite(customer.email, arrivalDate, departureDate);

    // Send response back to the client
    res.status(201).json({
      message: "Reservation completed successfully",
    });
  } catch (err) {
    console.error('Error processing reservation:', err);
    res.status(500).json({ message: 'An error occurred while processing the reservation.' });
  }
};