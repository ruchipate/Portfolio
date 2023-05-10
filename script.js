const body = document.body;

$(document).ready(function () {
  $("#icon").click(function () {
    $("ul").toggleClass("show");
  });
});

document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();
  let values = {};
  Object.keys(event.target.elements).map((key) => {
    if (isNaN(key)) {
      values[key] = event.target.elements[key].value;
    }
  });

  fetch("https://httpbin.org/post", {
    method: "POST",
    body: JSON.stringify(values),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(JSON.stringify(data, null, 2));
      alert("Success");
    })
    .catch((err) => {
      alert(`Error! Try again.`);
    });
});

document.getElementById("question").addEventListener("change", () => {
  document.getElementById("rate").style = "display: none;";
});

document.getElementById("comment").addEventListener("change", () => {
  document.getElementById("rate").style = "display: none;";
});

document.getElementById("hiring").addEventListener("change", () => {
  document.getElementById("rate").style = "display: grid;";
});

document.addEventListener("scroll", scrollUp);
