fetch("http://localhost:8080/")
  .then(res => res.text())
  .then(text => console.log(text.slice(0, 500)))
  .catch(err => console.error(err.message));
