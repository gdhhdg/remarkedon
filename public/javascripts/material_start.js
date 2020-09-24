/**
 * Created by gunnerhatmaker on 7/31/18.
 */
$(document).ready(function () {

    function process()
    {
        const url="http://localhost:3333/comments/http://www." + document.getElementById("webUrl").value;
        location.href=url;
        return false;
    }


    $(".button-collapse").sideNav();
    $('.forgot_password_button').click(function () {
        $('.forgot_password').toggle();
        $('.login').toggle();
    });

});

