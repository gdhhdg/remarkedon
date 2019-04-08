/**
 * Created by gunnerhatmaker on 4/8/19.
 */
$(document).ready(function () {
    let modal = document.getElementById('Signup');

// Get the button that opens the modal
    let btn = document.getElementById("signupModal");

// Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
    $(btn).click( function() {
        modal.style.display = "block";
    });

// When the user clicks on <span> (x), close the modal
    $(span).click(function() {
        modal.style.display = "none";
    });

// When the user clicks anywhere outside of the modal, close it
    $('window').click(function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    let modal_login = document.getElementById('Login-modal');

// Get the button that opens the modal
    let btn_login = document.getElementById("LoginModal");

// Get the <span> element that closes the modal
    let span_login = document.getElementsByClassName("close_1")[0];

// When the user clicks on the button, open the modal
    $(btn_login).click(function () {
        (modal_login).show();
    });


// When the user clicks on <span> (x), close the modal
    $(span_login).click(function() {
        modal_login.style.display = "none";
    });

// When the user clicks anywhere outside of the modal, close it
    $('window').click(function(event) {
        if (event.target === modal_login) {
            modal_login.style.display = "none";
        }
    });

});
