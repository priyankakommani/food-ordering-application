import { gql } from '@apollo/client';

export const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      id
      name
      cuisine
      country
      imageUrl
      menuItems {
        id
        name
        description
        price
        category
        imageUrl
      }
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      status
      total
      country
      restaurantId
      createdAt
      items {
        id
        quantity
        price
        menuItemId
        menuItem {
          id
          name
          description
          category
          imageUrl
        }
      }
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      status
      total
      country
      userId
      restaurantId
      createdAt
      items {
        id
        quantity
        price
        menuItemId
        menuItem {
          id
          name
          description
          category
          imageUrl
        }
      }
    }
  }
`;

export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    myPaymentMethods {
      id
      type
      last4
      upiId
      isDefault
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($restaurantId: String!, $items: [OrderItemInput!]!) {
    createOrder(restaurantId: $restaurantId, items: $items) {
      id
      status
      total
      items {
        id
        quantity
        price
        menuItemId
      }
    }
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($orderId: ID!, $paymentMethodId: String!) {
    placeOrder(orderId: $orderId, paymentMethodId: $paymentMethodId) {
      id
      status
      total
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($input: CreatePaymentMethodInput!, $userId: String!) {
    addPaymentMethod(input: $input, userId: $userId) {
      id
      type
      last4
      upiId
      isDefault
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id) {
      id
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($id: ID!, $input: CreatePaymentMethodInput!) {
    updatePaymentMethod(id: $id, input: $input) {
      id
      type
      last4
      upiId
      isDefault
      userId
    }
  }
`;

export const GET_ALL_PAYMENT_METHODS = gql`
  query GetAllPaymentMethods {
    allPaymentMethods {
      id
      type
      last4
      upiId
      isDefault
      userId
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      country
    }
  }
`;
