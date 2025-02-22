const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('PiBay Backend ist aktiv!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
