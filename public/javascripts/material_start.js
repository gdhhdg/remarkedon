/**
 * Created by gunnerhatmaker on 7/31/18.
 */
document.addEventListener("DOMContentLoaded", function() {
    M.updateTextFields();

    function process()
    {
        const url="http://localhost:3333/comments/http://www." + document.getElementById("webUrl").value;
        location.href=url;
        return false;
    }
    let modal = document.getElementById('Signup');

// Get the button that opens the modal
    let btn = document.getElementById("signupModal");

// Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    };

// When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    };

// When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    let modal_login = document.getElementById('Login');

// Get the button that opens the modal
    let btn_login = document.getElementById("LoginModal");

// Get the <span> element that closes the modal
    let span_login = document.getElementsByClassName("close_1")[0];

// When the user clicks on the button, open the modal
    btn_login.onclick = function() {
        modal_login.style.display = "block";
    };

// When the user clicks on <span> (x), close the modal
    span_login.onclick = function() {
        modal_login.style.display = "none";
    };

// When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target === modal_login) {
            modal_login.style.display = "none";
        }
    };
    $('.forgot_password_button').click(function () {
        $('.forgot_password').toggle();
        $('.login').toggle();
    });

});
