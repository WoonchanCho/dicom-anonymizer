import { API_BASE_URL } from '../common/environment';

const ApiUrl = `${API_BASE_URL}/api/v1`;

export async function fetchOrderBooks(accessToken) {
  const url = `${ApiUrl}/orderbooks`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await res.json();
}

export async function fetchReconnectOrderBooks() {
  const url = `${ApiUrl}/orderbooks/reconnect`;
  const res = await fetch(url, {});
  return await res.json();
}

export async function fetchBalances() {
  const url = `${ApiUrl}/balances`;
  const res = await fetch(url, {});
  return await res.json();
}

export async function fetchOpportunities() {
  const url = `${ApiUrl}/opportunities`;
  const res = await fetch(url, {});
  return await res.json();
}

export async function fetchOpportunitiesHistories() {
  const url = `${ApiUrl}/opportunities/histories`;
  const res = await fetch(url, {});
  return await res.json();
}

export async function fetchPlaceArbitrageOrder(opportunity) {
  const url = `${ApiUrl}/orders/arbitrage`;
  const res = await fetch(url, {
    method: 'post',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(opportunity),
  });
  return await res.json();
}

export async function fetchPlaceSimpleOrder(order) {
  const url = `${ApiUrl}/orders/simple`;
  const res = await fetch(url, {
    method: 'post',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(order),
  });
  return await res.json();
}

export async function fetchExchanges() {
  const url = `${ApiUrl}/exchanges`;
  const res = await fetch(url, {});
  return await res.json();
}

export async function fetchUpdateAddresses() {
  const url = `${ApiUrl}/users/addresses`;
  const res = await fetch(url, {
    method: 'PUT',
  });
  return await res.json();
}
export async function fetchAddresses() {
  const url = `${ApiUrl}/users/addresses`;
  const res = await fetch(url, {});
  return await res.json();
}
