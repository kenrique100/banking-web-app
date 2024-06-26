"use server";

import { Client } from "dwolla-v2";

// Utility function to get the environment
const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`"
      );
  }
};

// Initialize Dwolla client
const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Function to validate the date of birth format
const validateDateOfBirth = (dateOfBirth: string) => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateOfBirth)) {
    console.error("Invalid date of birth format:", dateOfBirth);
    return false;
  }
  return true;
};

// Utility function to convert date formats
const convertDateFormat = (dateOfBirth: string) => {
  const dateParts = dateOfBirth.split('/');
  if (dateParts.length === 3) {
    const [year, month, day] = dateParts;
    return `${year}-${month}-${day}`;
  }
  return dateOfBirth; // If already in the correct format
};

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  try {
    console.log("Creating funding source with options:", options);
    const response = await dwollaClient.post(`customers/${options.customerId}/funding-sources`, {
      name: options.fundingSourceName,
      plaidToken: options.plaidToken,
    });
    return response.headers.get("location");
  } catch (err) {
    console.error("Creating a Funding Source Failed: ", err);
    throw new Error("Failed to create funding source");
  }
};

// Create an On-Demand Authorization
export const createOnDemandAuthorization = async () => {
  try {
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    return onDemandAuthorization.body._links;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
    throw new Error("Failed to create on-demand authorization");
  }
};

// Create a new Dwolla customer
export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    console.log("Creating Dwolla customer with params:", newCustomer);
    
    // Convert date format
    newCustomer.dateOfBirth = convertDateFormat(newCustomer.dateOfBirth);
    
    // Validate date of birth
    if (!validateDateOfBirth(newCustomer.dateOfBirth)) {
      throw new Error("Invalid date of birth format. Use YYYY-MM-DD.");
    }

    // Check if customer already exists logic here (if applicable)

    const response = await dwollaClient.post("customers", newCustomer);
    return response.headers.get("location");
  } catch (err) {
    console.error("Creating a Dwolla Customer Failed: ", err);
    throw new Error("Failed to create Dwolla customer");
  }
};

// Create a fund transfer
export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };
    const response = await dwollaClient.post("transfers", requestBody);
    return response.headers.get("location");
  } catch (err) {
    console.error("Transfer fund failed: ", err);
    throw new Error("Failed to transfer funds");
  }
};

// Add a funding source
export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // Create Dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // Add funding source to the Dwolla customer & get the funding source URL
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    console.log("Adding funding source with options:", fundingSourceOptions);
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Adding funding source failed: ", err);
    throw new Error("Failed to add funding source");
  }
};
