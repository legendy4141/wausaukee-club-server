import { Request, Response } from 'express';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for JWT
import { getCustomerByEmail, createCustomer, getCustomerById, updateCustomer } from '../models/customerModel';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body; // Destructure email and password from the request body

    // Fetch the customer by email
    const customer = await getCustomerByEmail(email);

    if (!customer) {
      return res.status(401).json({ message: 'Email not found. Please check or sign up.' });
    }

    // Compare the provided password with the stored password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(402).json({ message: 'Incorrect password. Please try again.' });
    }

    // If password is valid, generate JWT token
    const token = jwt.sign(
      {
        customer_id: customer.customer_id,
        customer_email: customer.email,
      },
      'your_jwt_secret_key', // Secret key for signing the JWT token
      { expiresIn: '1h' }     // Token expiration time (optional)
    );

    return res.json({ token, customer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      id, email, password, firstName, lastName, country, zip, city, state, address1, address2, phone
    } = req.body;
    // Check if the customer already exists
    const existingCustomer = await getCustomerByEmail(email);

    if (existingCustomer) {
      return res.status(409).json({ message: 'Email already in use. Please log in or use a different email.' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 is the salt rounds for bcrypt

    // Create new customer in the database
    const newCustomer = await createCustomer({
      customer_id: id,
      customer_name: `${firstName} ${lastName}`,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      password: hashedPassword,
    });

    // Generate a JWT token for the new customer
    const token = jwt.sign(
      {
        customer_id: newCustomer.customer_id,
        customer_email: newCustomer.email,
      },
      'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    return res.status(201).json({ message: 'Registration successful', token, customer: newCustomer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const {
      clientId, oldPassword, newPassword
    } = req.body;

    // Check if the customer already exists
    const customer = await getCustomerById(clientId);
    if (!customer) {
      return res.status(409).json({ message: 'The user is not existing on the database.' });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, customer.password);
    
    if (!isPasswordValid) {
      return res.status(402).json({ message: 'Incorrect password. Please try again.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Create new customer in the database
    await updateCustomer(clientId, hashedPassword);

    return res.status(201).json({ message: 'Password successfully updated.'});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};