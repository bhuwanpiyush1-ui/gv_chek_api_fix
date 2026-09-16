export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { card } = req.body || {};

    if (!card || !/^\d{16}$/.test(card)) {
      return res.status(400).json({ error: 'invalid card' });
    }

    const r = await fetch('https://api.croma.com/qwikcilver/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.croma.com',
        'Referer': 'https://www.croma.com/'
      },
      body: JSON.stringify({
        TransactionTypeId: 306,
        InputType: '1',
        Cards: [{ CardNumber: card }]
      })
    });

    const d = await r.json();
    const c = (d.Cards && d.Cards[0]) || {};

    return res.status(200).json({
      card,
      balance: c.Balance,
      status: c.CardStatus,
      expiry: c.ExpiryDate
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
