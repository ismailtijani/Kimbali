# Project Name: Kimbali

## Description

This is an app that help access the most basic financial services like transfers, savings, payments, loans and thus enabling seamless banking experience

---

##### Postman Documentation Link

_[Postman Documentation](https://documenter.getpostman.com/view/25509517/2s93Y5NzX2)_

---

#### Project setup

Follow the steps highlighted below to get the application running on your local computer

## Prerequiste

    * Ensure you have `Node` with version >=14 installed.
    * You have a text editor (preferably Vscode) installed on your computer
    * MongoDB (if running locally)
    * Postman (to test the APIs)
    * Have a registered account with Mailtrap

## Steps

    1. Clone the repository into your computer. Run command `git clone https://github.com/ismailtijani/Kimbali.git`
    2. Open the project folder with your desire code editor
    3. Open a built in terminal
    4. Create a `.env` file in the root of the project and configure your environment variables (check .env.example file for details)
    5. To install all dependencies used in the project, run `npm i`
    6. To ensure the project is open with rules specific by eslint used in this project, type in `npm run lint` on the terminal
    7. Next, ensure the project files are rightly formatted by typing in `npm run format:check`
    8. Finally, to start the development server, `npm run dev`

If everything went well, you should see the following printed on the terminal console <Server is running 🚀🚀🚀 on port 3000> <DB Connection Successful>
If you encounter any issues while doing any of the above commands, kindly see the sections below on the `available scripts` to find for little more insight.
If the issue persist, kindly contact `Ismail => @ ismailtijani10@yahoo.com`

---

## Features

- [x] The application is responsible for creating new Admin and User
- [x] Customer cannot create another user account
- [x] User can upload a profile picture
- [x] User can fund thier wallet
- [x] User can view avalaible balance
- [x] User can make withdrawal
- [x] User cannot make withdrawal more than his/her balance
- [x] User can transfer funds to existing user only
- [x] Transaction status i.e "Success" or "Failed"
- [x] User cannot transfer negative amount
- [x] User cannot transfer to himself/herself
- [x] User is charged a certain fee for all transfers
- [x] User cannot transfer more than his/her balance (insufficient balance)
- [x] User can view transaction history
- [x] User can view transaction detatils
- [x] User can view total amount credited and debited

---

- [x] Added joi validation - fail fast principle
- [x] Data cleaning and validation to avoid foreign and illlegitimate inputs
- [x] Transaction history with pagination
- [x] Handle `unhandled` exceptions and rejections
- [x] Implement transaction limit
- [x] Handled scenarios where the user's bank account is compromised or hacked, and implementing appropriate security measures such as user authentication, password resets, and account recovery processes.

---

### TODO

- [x] Redis cache for user profile AND STATISTICS
- [x] Cash back on all withdrawals
- [x] Add premium users
- [x] Overdraft limit for general user and premium users
- [x] Implementing two-factor authentication for secure transactions
- [x] Implementing a transaction timeout to prevent unauthorized access or fraud
- [x] Handling failed transactions and providing appropriate error messages to users
- [x] Handling large transactions or transfers that may require additional verification or approval from the bank
- [x]Implementing account freeze or suspen sion for suspicious account activity by administrators [rbac ]

---

#### My API Endpoints

##### Register new user

> POST ⇒ {{url}}/user/signup
> **Example requestbody:**

```js
{
    "name": "SOT",
    "email": "user@mail.com"
    "phoneNumber": "08094706335",
    "password": "kimbali123"
}
```

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "MESSAGE": "Account created succesfully",
    "DATA": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDNlNmQ0ZWY3MGRkNGM3ZDg0ZTViZTMiLCJpYXQiOjE2ODE4MTI4MTR9.VPpN6vbcFtEJ4v5J45sCuTY0Jt6HyOnPwSI06IFA_zA"
}
```

<br>

##### Login user

POST ⇒ {{url}}/user/login
**Example requestbody:**

```js
{
    "email": "user@mail.com",
    "password": "kimbali123"
}

```

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "DATA": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDNlNmQ0ZWY3MGRkNGM3ZDg0ZTViZTMiLCJpYXQiOjE2ODE4MTI4ODN9.MtKxkZW0P5jsfW50S6BqxOMFfMR_QMa-iIphUe3jClQ"
}
```

<br>

##### Fund your wallet

POST ⇒ {{url}}/transaction/fund_wallet
Authorization: Bearer {{token}}
**Example requestbody:**

```js
{
    "amount":7000
}
```

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "DATA": "Wallet funded successfully ✅"
}
```

<br>

##### Transfer funds to another wallet

POST ⇒ {{url}}/transaction/transfer
Authorization: Bearer {{token}}
**Example requestbody:**

```js
{"amount": 1000, "receiver_id":"i3itm5d"}
```

**Example response body**

```js
{
    "status": "SUCCESS",
    "Transfer": "-#1000",
    "Account_Number": "d6ro7i0",
    "Account_Name": "SOT",
    "VAT": 10,
    "Transaction_id": "643e7ddbe61c64e3850fad18",
    "Description": "Funds transferred successfully to SOT"
}
```

<br>

##### View balance in your wallet

GET ⇒ {{url}}/transaction/balance
Authorization: Bearer {{token}}

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "DATA": "Your balance is #48485"
}
```

<br>

##### View transaction history

GET ⇒ {{URL}}/transaction/transaction_history
Authorization: Bearer {{token}}

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "DATA": [
        {
            "_id": "643e7db7e61c64e3850fad0f",
            "sender_id": "643e6d4ef70dd4c7d84e5be3",
            "transaction_type": "credit",
            "transaction_status": "success",
            "amount": 50000,
            "receiver_id": "1pidt72",
            "transaction_fee": 0,
            "balance_before": 0,
            "newBalance": 50000,
            "description": "Hi Ismail T, your wallet have been funded with #50000.",
            "createdAt": "2023-04-18T11:23:35.170Z",
            "updatedAt": "2023-04-18T11:23:35.170Z",
            "__v": 0
        },
        {
            "_id": "643e7ddbe61c64e3850fad18",
            "sender_id": "643e6d4ef70dd4c7d84e5be3",
            "transaction_type": "debit",
            "transaction_status": "success",
            "amount": 1000,
            "receiver_id": "d6ro7i0",
            "transaction_fee": 10,
            "balance_before": 50000,
            "newBalance": 48990,
            "description": "Hi Ismail T, your wallet have been debited with #1000.",
            "createdAt": "2023-04-18T11:24:11.585Z",
            "updatedAt": "2023-04-18T11:24:11.585Z",
            "__v": 0
        },
        {
            "_id": "643e7dfbe61c64e3850fad20",
            "sender_id": "643e6d4ef70dd4c7d84e5be3",
            "transaction_type": "debit",
            "transaction_status": "success",
            "amount": 500,
            "receiver_id": "643e6d4ef70dd4c7d84e5be3",
            "transaction_fee": 5,
            "balance_before": 48990,
            "newBalance": 48485,
            "description": "Hi Ismail T, your wallet have been debited with #500.",
            "createdAt": "2023-04-18T11:24:43.131Z",
            "updatedAt": "2023-04-18T11:24:43.131Z",
            "__v": 0
        }
    ]
}
```

<br>

##### View transaction details

GET ⇒ {{url}}/transaction/transaction_details/:transaction_id
Authorization: Bearer {{token}}

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "DATA": {
        "_id": "643e7ddbe61c64e3850fad18",
        "sender_id": "643e6d4ef70dd4c7d84e5be3",
        "transaction_type": "debit",
        "transaction_status": "success",
        "amount": 1000,
        "receiver_id": "d6ro7i0",
        "transaction_fee": 10,
        "balance_before": 50000,
        "newBalance": 48990,
        "description": "Hi Ismail T, your wallet have been debited with #1000.",
        "createdAt": "2023-04-18T11:24:11.585Z",
        "updatedAt": "2023-04-18T11:24:11.585Z",
        "__v": 0
    }
}
```

<br>

##### View total amount credited

GET ⇒ {{url}}/transaction/totalamount_credited
Authorization: Bearer {{token}}

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "DATA": "Total amount credited is #50000"
}
```

---

# Getting Started

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles Node in production mode and optimizes the build for the best performance.

### `npm run lint`

Checks if files obeys all Eslint set rules properly

### `npm run lint:fix`

This script fixes all possible eslint errors in the project

### `npm run format:write`

Formats all files using prettier set rules at .prettierrc

### `npm run format:check`

Checks if all files are formatted properly
