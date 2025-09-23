const express = require('express');
// A simple express server to redirect to the main site
const app = express();
const port = process.env.PORT || 3000;

app.get('*', (req, res) => {
  res.redirect('https://signflix.svst.in');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
