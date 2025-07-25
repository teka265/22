export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { serial } = req.query;

  if (!serial) {
    return res.status(400).json({ ok: false, message: "No serial provided" });
  }

  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/1vIn-P2rD5IVNZ6HXjXHmJPBlRWxqktso9ucxdjMRyxM/export?format=csv";

    const response = await fetch(csvUrl);
    const text = await response.text();
    const lines = text.trim().split("\n");

    let found = false;
    let expired = false;

    for (const line of lines) {
      const [sheetSerial, expiryDate] = line.split(",");
      if (sheetSerial.trim() === serial.trim()) {
        found = true;

        const parts = expiryDate.trim().split(/[-\/]/);
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        const expiry = new Date(year, month, day);
        const today = new Date();
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (todayOnly > expiry) expired = true;

        break;
      }
    }

    if (!found) {
      return res.status(200).json({ ok: false, message: "Serial Not Found" });
    }
    if (expired) {
      return res.status(200).json({ ok: false, message: "Serial Expired" });
    }

    return res.status(200).json({ ok: true, message: "Serial OK" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}