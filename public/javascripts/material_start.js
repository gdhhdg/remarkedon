/**
 * Created by gunnerhatmaker on 7/31/18.
 */

$(document).ready(function() {
    M.updateTextFields();

    function process()
    {
        var url="http://localhost:3000/comments/http://www." + document.getElementById("webUrl").value;
        location.href=url;
        return false;
    }
});