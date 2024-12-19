var loginBtn = document.getElementById("loginBtn");
var getStartedBtn = document.getElementById("getStartedBtn");
var getStartedBtn2 = document.getElementById("getStartedBtn2");
var learnMoreBtn = document.getElementById("learnMoreBtn");

loginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "/login";
    });

getStartedBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "/register";
    });

getStartedBtn2.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "/register";
    });

learnMoreBtn.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("learnMore").scrollIntoView({
        behavior: "smooth"
    });
    });