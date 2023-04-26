import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

// Defining the reducer function that updates the state of OrderListScreen component
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // When the order fetching request is initiated, set loading to true
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // When the order fetching request is successful, set the fetched orders and set loading to false
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      // When the order fetching request fails, set error message and loading to false
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      // When the order deletion request is initiated, set loadingDelete to true and successDelete to false
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      // When the order deletion request is successful, set loadingDelete to false and successDelete to true
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      // When the order deletion request fails, set loadingDelete to false
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      // When the order deletion process is reset, set loadingDelete and successDelete to false
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

// The main component function
export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  // State management with useReducer
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  // Use useEffect to fetch order data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Dispatch a fetch request
        dispatch({ type: 'FETCH_REQUEST' });

        // Fetch order data from the API
        const { data } = await axios.get(`http://localhost:5000/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Dispatch a success action with the fetched data
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // Dispatch a fail action with the error message
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    // If a delete was successful, reset successDelete. Otherwise, fetch data.
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  // Handler for deleting an order
  const deleteHandler = async (order) => {
    // Confirm with the user before deleting
    if (window.confirm('Are you sure to delete?')) {
      try {
        // Dispatch a delete request
        dispatch({ type: 'DELETE_REQUEST' });

        // Delete the order from the API
        await axios.delete(`http://localhost:5000/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Display a success toast and dispatch a success action
        toast.success('order deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        // Display an error toast and dispatch a fail action with no payload
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <h1>Orders</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>

                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'No'}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Details
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(order)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
