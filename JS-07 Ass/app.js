var heading = document.getElementById("heading1");
heading.innerText = "My Student Profile";


var studentName = document.getElementsByClassName("name");
studentName[0].style.color = "blue";


var messages = document.querySelectorAll(".message");

for (var i = 0; i < messages.length; i++) {
    messages[i].style.color = "green";
}

document.body.style.backgroundColor = "lightgray";


function changeColor() {
    document.body.style.backgroundColor = "lightblue";
}

var link = document.getElementById("googleLink");

var href = link.getAttribute("href");

console.log("Link href:", href);

link.setAttribute("target", "_blank");


var box = document.getElementById("box");

box.classList.add("active");

var hasActive = box.classList.contains("active");

console.log("Box has active class:", hasActive);

console.log("Box parent:", box.parentElement);
