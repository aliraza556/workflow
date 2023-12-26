// import axios from 'axios';
// import * as fs from 'fs';
//
// const API_KEY = 'pat-na1-76f38f6e-d0ea-4d4a-8b81-1df23318b4e4';
// const CONTACTS_API = 'https://api.hubapi.com/crm/v3/objects/contacts';
// const DEALS_API = 'https://api.hubapi.com/crm/v3/objects/deal';
//
// interface Contact {
//   firstname: string;
//   email: string;
// }
//
// interface Deal {
//   closedate: string;
//   dealstage: string;
//   amount: string;
//   dealname: string;
// }
//
// async function fetchAllData(apiUrl: string, after?: string) {
//   const results: any[] = [];
//   let next: string | undefined = after;
//
//   do {
//     const response = await axios.get(apiUrl, {
//       headers: { Authorization: `Bearer ${API_KEY}` },
//       params: {
//         properties: apiUrl.includes('contacts') ? ['firstname', 'email'] : ['closedate', 'dealstage', 'amount', 'dealname'],
//         limit: 100,
//         after: next
//       }
//     });
//
//     results.push(...response.data.results);
//     next = response.data.paging?.next?.after;
//   } while (next);
//
//   return results;
// }
//
// async function fetchData() {
//   try {
//     const contactsData = await fetchAllData(CONTACTS_API);
//     const dealsData = await fetchAllData(DEALS_API);
//
//     const contacts: Contact[] = contactsData.map((contact: any) => ({
//       firstname: contact.properties.firstname,
//       email: contact.properties.email
//     }));
//
//     const deals: Deal[] = dealsData.map((deal: any) => ({
//       closedate: deal.properties.closedate,
//       dealstage: deal.properties.dealstage,
//       amount: deal.properties.amount,
//       dealname: deal.properties.dealname
//     }));
//
//     // Combine contacts and deals data - this logic may need to be adjusted based on how you want to combine them
//     const combinedData = contacts.map(contact => ({
//       ...contact,
//       deals: deals // This adds all deals to each contact. Adjust this as needed to match specific deals to contacts.
//     }));
//
//     saveDataToJsonFile(combinedData);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// }
//
// function saveDataToJsonFile(data: any) {
//   const jsonContent = JSON.stringify(data, null, 2);
//   fs.writeFileSync('contacts_deals.json', jsonContent);
//   console.log('Data saved to contacts_deals.json');
// }
//
// fetchData();


//txt format code


import axios from 'axios';
import * as fs from 'fs';

const API_KEY = 'pat-na1-76f38f6e-d0ea-4d4a-8b81-1df23318b4e4';
const CONTACTS_API = 'https://api.hubapi.com/crm/v3/objects/contacts';
const DEALS_API = 'https://api.hubapi.com/crm/v3/objects/deal';

interface Contact {
  firstname: string;
  email: string;
}

interface Deal {
  closedate: string;
  dealstage: string;
  amount: string;
  dealname: string;
}

async function fetchAllData(apiUrl: string, after?: string) {
  const results: any[] = [];
  let next: string | undefined = after;

  do {
    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      params: {
        properties: apiUrl.includes('contacts') ? ['firstname', 'email'] : ['closedate', 'dealstage', 'amount', 'dealname'],
        limit: 100,
        after: next
      }
    });

    results.push(...response.data.results);
    next = response.data.paging?.next?.after;
  } while (next);

  return results;
}

async function fetchData() {
  try {
    const contactsData = await fetchAllData(CONTACTS_API);
    const dealsData = await fetchAllData(DEALS_API);

    const contacts: Contact[] = contactsData.map((contact: any) => ({
      firstname: contact.properties.firstname,
      email: contact.properties.email
    }));

    const deals: Deal[] = dealsData.map((deal: any) => ({
      closedate: deal.properties.closedate,
      dealstage: deal.properties.dealstage,
      amount: deal.properties.amount,
      dealname: deal.properties.dealname
    }));

    // Combine contacts and deals data
    const combinedData = contacts.map(contact => ({
      ...contact,
      deals: deals // Adds all deals to each contact. Adjust as needed.
    }));

    saveDataToTextFile(combinedData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function saveDataToTextFile(data: any) {
  let textContent = data.map((item: any) =>
    `Firstname: ${item.firstname}, Email: ${item.email}, Deals: ${JSON.stringify(item.deals)}`
  ).join('\n\n');

  fs.writeFileSync('contacts_deals.txt', textContent);
  console.log('Data saved to contacts_deals.txt');
}

fetchData();
