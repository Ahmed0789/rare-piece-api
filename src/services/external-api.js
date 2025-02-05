import { axios } from 'axios';

export const fetchSneakersData = async () => {
  const apiUrl = 'https://external-sneakers-api.com/products'; // Replace with actual API URL
  const response = await axios.get(apiUrl);
  const allSneakers = response.data;

  // Filter for Jordan 1, Jordan 4, and Adidas Yeezy
  const filteredSneakers = allSneakers.filter((sneaker) =>
    (sneaker.brand === 'Jordan' && ['1', '4'].includes(sneaker.model)) ||
    (sneaker.brand === 'Adidas' && sneaker.model.toLowerCase().includes('yeezy'))
  );

  return filteredSneakers.map((sneaker) => ({
    name: sneaker.name,
    brand: sneaker.brand,
    model: sneaker.model,
    release_date: sneaker.release_date,
    price: sneaker.price,
  }));
}